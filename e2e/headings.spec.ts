import { test, expect } from '@playwright/test';
import { EditorHelper } from './fixtures/editor-helpers';

test.describe('Headings', () => {
  let editor: EditorHelper;

  test.beforeEach(async ({ page }) => {
    editor = new EditorHelper(page);
    await editor.goto();
    await editor.clear();
  });

  test.describe('Heading 1', () => {
    test('can create H1 via toolbar', async () => {
      await editor.type('Main Title');
      await editor.selectAll();
      await editor.clickToolbarButton('Heading 1');
      await editor.expectElement('h1');
      await expect(editor.editor.locator('h1')).toContainText('Main Title');
    });

    test('H1 button shows active state', async () => {
      await editor.type('Title');
      await editor.selectAll();
      await editor.clickToolbarButton('Heading 1');
      // Click into the heading to ensure cursor is there
      await editor.editor.locator('h1').click();
      expect(await editor.isToolbarButtonActive('Heading 1')).toBe(true);
    });

    test('can toggle H1 off', async () => {
      await editor.type('Title');
      await editor.selectAll();
      await editor.clickToolbarButton('Heading 1');
      await expect(editor.editor.locator('h1')).toBeVisible();

      // Triple-click to select the heading content
      await editor.editor.locator('h1').click({ clickCount: 3 });
      await editor.clickToolbarButton('Heading 1');

      // After toggle, h1 should be converted to p
      const content = await editor.getContent();
      expect(content).toContain('<p');
      expect(content).toContain('Title');
    });
  });

  test.describe('Heading 2', () => {
    test('can create H2 via toolbar', async () => {
      await editor.type('Section Title');
      await editor.selectAll();
      await editor.clickToolbarButton('Heading 2');
      await editor.expectElement('h2');
      await expect(editor.editor.locator('h2')).toContainText('Section Title');
    });

    test('H2 button shows active state', async () => {
      await editor.type('Title');
      await editor.selectAll();
      await editor.clickToolbarButton('Heading 2');
      expect(await editor.isToolbarButtonActive('Heading 2')).toBe(true);
    });
  });

  test.describe('Heading 3', () => {
    test('can create H3 via toolbar', async () => {
      await editor.type('Subsection');
      await editor.selectAll();
      await editor.clickToolbarButton('Heading 3');
      await editor.expectElement('h3');
      await expect(editor.editor.locator('h3')).toContainText('Subsection');
    });

    test('H3 button shows active state', async () => {
      await editor.type('Title');
      await editor.selectAll();
      await editor.clickToolbarButton('Heading 3');
      expect(await editor.isToolbarButtonActive('Heading 3')).toBe(true);
    });
  });

  test.describe('Heading Switching', () => {
    test('can switch from H1 to H2', async () => {
      await editor.type('Title');
      await editor.selectAll();
      await editor.clickToolbarButton('Heading 1');
      await expect(editor.editor.locator('h1')).toBeVisible();

      // Triple-click to select heading content, then switch to h2
      await editor.editor.locator('h1').click({ clickCount: 3 });
      await editor.clickToolbarButton('Heading 2');
      // Should have h2 with Title, not h1
      await expect(editor.editor.locator('h2')).toContainText('Title');
      const content = await editor.getContent();
      expect(content).not.toContain('<h1>Title</h1>');
    });

    test('can switch from H2 to H3', async () => {
      await editor.type('Title');
      await editor.selectAll();
      await editor.clickToolbarButton('Heading 2');
      await expect(editor.editor.locator('h2')).toBeVisible();

      // Triple-click to select just the heading content, then switch to h3
      await editor.editor.locator('h2').click({ clickCount: 3 });
      await editor.clickToolbarButton('Heading 3');
      // Should have h3 with Title, not h2
      await expect(editor.editor.locator('h3')).toContainText('Title');
      const content = await editor.getContent();
      expect(content).not.toContain('<h2>Title</h2>');
    });

    test('only one heading level active at a time', async () => {
      await editor.type('Title');
      await editor.selectAll();
      await editor.clickToolbarButton('Heading 1');

      expect(await editor.isToolbarButtonActive('Heading 1')).toBe(true);
      expect(await editor.isToolbarButtonActive('Heading 2')).toBe(false);
      expect(await editor.isToolbarButtonActive('Heading 3')).toBe(false);
    });
  });
});
