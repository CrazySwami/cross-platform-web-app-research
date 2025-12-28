import { test, expect } from '@playwright/test';
import { EditorHelper } from './fixtures/editor-helpers';

test.describe('Lists', () => {
  let editor: EditorHelper;

  test.beforeEach(async ({ page }) => {
    editor = new EditorHelper(page);
    await editor.goto();
    await editor.clear();
  });

  test.describe('Bullet List', () => {
    test('can create bullet list via toolbar', async () => {
      await editor.type('Item 1');
      await editor.clickToolbarButton('Bullet List');
      await editor.expectElement('ul');
      await editor.expectElement('li');
    });

    test('can add multiple bullet items', async () => {
      // Type multiple lines first
      await editor.type('First item');
      await editor.page.keyboard.press('Enter');
      await editor.type('Second item');
      await editor.page.keyboard.press('Enter');
      await editor.type('Third item');

      // Select all and convert to bullet list
      await editor.selectAll();
      await editor.clickToolbarButton('Bullet List');

      const items = editor.editor.locator('ul li');
      await expect(items).toHaveCount(3);
    });

    test('bullet list button shows active state', async () => {
      await editor.type('Item');
      await editor.clickToolbarButton('Bullet List');
      expect(await editor.isToolbarButtonActive('Bullet List')).toBe(true);
    });

    test('can toggle bullet list off', async () => {
      await editor.type('Item');
      await editor.clickToolbarButton('Bullet List');
      await editor.clickToolbarButton('Bullet List');
      const content = await editor.getContent();
      expect(content).not.toContain('<ul>');
    });
  });

  test.describe('Numbered List', () => {
    test('can create numbered list via toolbar', async () => {
      await editor.type('Step 1');
      await editor.clickToolbarButton('Numbered List');
      await editor.expectElement('ol');
      await editor.expectElement('li');
    });

    test('can add multiple numbered items', async () => {
      // Type multiple lines first
      await editor.type('First step');
      await editor.page.keyboard.press('Enter');
      await editor.type('Second step');
      await editor.page.keyboard.press('Enter');
      await editor.type('Third step');

      // Select all and convert to numbered list
      await editor.selectAll();
      await editor.clickToolbarButton('Numbered List');

      const items = editor.editor.locator('ol li');
      await expect(items).toHaveCount(3);
    });

    test('numbered list button shows active state', async () => {
      await editor.type('Step');
      await editor.clickToolbarButton('Numbered List');
      expect(await editor.isToolbarButtonActive('Numbered List')).toBe(true);
    });
  });

  test.describe('Task List', () => {
    test('can create task list via toolbar', async () => {
      await editor.type('Task 1');
      await editor.clickToolbarButton('Task List');
      await editor.expectElement('ul[data-type="taskList"]');
    });

    test('can add multiple task items', async ({ page }) => {
      // Type multiple lines first
      await editor.type('First task');
      await editor.page.keyboard.press('Enter');
      await editor.type('Second task');

      // Select all and convert to task list
      await editor.selectAll();
      await editor.clickToolbarButton('Task List');

      // Wait for task list and verify items by counting checkboxes
      await expect(editor.editor.locator('ul[data-type="taskList"]')).toBeVisible();
      const checkboxes = page.getByRole('checkbox');
      await expect(checkboxes).toHaveCount(2);
    });

    test('task list button shows active state', async () => {
      await editor.type('Task');
      await editor.clickToolbarButton('Task List');
      expect(await editor.isToolbarButtonActive('Task List')).toBe(true);
    });

    test('can check task item', async ({ page }) => {
      await editor.type('Checkable task');
      await editor.clickToolbarButton('Task List');

      // Wait for task list to appear
      await expect(editor.editor.locator('ul[data-type="taskList"]')).toBeVisible();

      // Click the checkbox (TipTap renders it with role="checkbox")
      const checkbox = page.getByRole('checkbox').first();
      await expect(checkbox).not.toBeChecked();
      await checkbox.click();

      // Verify checked state
      await expect(checkbox).toBeChecked();
    });
  });

  test.describe('List Switching', () => {
    test('can switch from bullet to numbered list', async () => {
      await editor.type('Item');
      await editor.clickToolbarButton('Bullet List');
      await editor.clickToolbarButton('Numbered List');

      await editor.expectElement('ol');
      const content = await editor.getContent();
      expect(content).not.toContain('<ul>');
    });

    test('can switch from numbered to task list', async () => {
      await editor.type('Item');
      await editor.clickToolbarButton('Numbered List');
      await editor.clickToolbarButton('Task List');

      await editor.expectElement('[data-type="taskList"]');
      const content = await editor.getContent();
      expect(content).not.toContain('<ol>');
    });
  });
});
