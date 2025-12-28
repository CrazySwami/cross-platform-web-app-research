import { test, expect } from '@playwright/test';
import { EditorHelper } from './fixtures/editor-helpers';

test.describe('Toolbar', () => {
  let editor: EditorHelper;

  test.beforeEach(async ({ page }) => {
    editor = new EditorHelper(page);
    await editor.goto();
  });

  test.describe('File Operations', () => {
    test('New button is visible', async () => {
      await expect(editor.toolbar.getByRole('button', { name: 'New' })).toBeVisible();
    });

    test('Open button is visible', async () => {
      await expect(editor.toolbar.getByRole('button', { name: 'Open' })).toBeVisible();
    });

    test('Save button is visible', async () => {
      await expect(editor.toolbar.getByRole('button', { name: 'Save' })).toBeVisible();
    });

    test('New button clears editor', async () => {
      await editor.clear();
      await editor.type('some content');
      await editor.clickToolbarButton('New Document');

      const content = await editor.getContent();
      // Match empty paragraph with any attributes (data-placeholder, class, etc.)
      expect(content).toMatch(/<p[^>]*>(<br[^>]*>)?<\/p>/);
    });
  });

  test.describe('Text Formatting Buttons', () => {
    test('all formatting buttons are visible', async () => {
      await expect(editor.toolbar.locator('button[title="Bold (Cmd+B)"]')).toBeVisible();
      await expect(editor.toolbar.locator('button[title="Italic (Cmd+I)"]')).toBeVisible();
      await expect(editor.toolbar.locator('button[title="Underline (Cmd+U)"]')).toBeVisible();
      await expect(editor.toolbar.locator('button[title="Strikethrough"]')).toBeVisible();
    });

    test('formatting buttons have correct titles', async () => {
      await expect(editor.toolbar.getByTitle('Bold (Cmd+B)')).toBeVisible();
      await expect(editor.toolbar.getByTitle('Italic (Cmd+I)')).toBeVisible();
      await expect(editor.toolbar.getByTitle('Underline (Cmd+U)')).toBeVisible();
      await expect(editor.toolbar.getByTitle('Strikethrough')).toBeVisible();
    });
  });

  test.describe('Heading Buttons', () => {
    test('all heading buttons are visible', async () => {
      await expect(editor.toolbar.locator('button[title="Heading 1"]')).toBeVisible();
      await expect(editor.toolbar.locator('button[title="Heading 2"]')).toBeVisible();
      await expect(editor.toolbar.locator('button[title="Heading 3"]')).toBeVisible();
    });

    test('heading buttons have correct titles', async () => {
      await expect(editor.toolbar.getByTitle('Heading 1')).toBeVisible();
      await expect(editor.toolbar.getByTitle('Heading 2')).toBeVisible();
      await expect(editor.toolbar.getByTitle('Heading 3')).toBeVisible();
    });
  });

  test.describe('List Buttons', () => {
    test('all list buttons are visible', async () => {
      await expect(editor.toolbar.locator('button[title="Bullet List"]')).toBeVisible();
      await expect(editor.toolbar.locator('button[title="Numbered List"]')).toBeVisible();
      await expect(editor.toolbar.locator('button[title="Task List"]')).toBeVisible();
    });

    test('list buttons have correct titles', async () => {
      await expect(editor.toolbar.getByTitle('Bullet List')).toBeVisible();
      await expect(editor.toolbar.getByTitle('Numbered List')).toBeVisible();
      await expect(editor.toolbar.getByTitle('Task List')).toBeVisible();
    });
  });

  test.describe('Block Buttons', () => {
    test('block element buttons are visible', async () => {
      await expect(editor.toolbar.locator('button[title="Quote"]')).toBeVisible();
      await expect(editor.toolbar.locator('button[title="Code Block"]')).toBeVisible();
    });

    test('block buttons have correct titles', async () => {
      await expect(editor.toolbar.getByTitle('Quote')).toBeVisible();
      await expect(editor.toolbar.getByTitle('Code Block')).toBeVisible();
    });
  });

  test.describe('History Buttons', () => {
    test('undo and redo buttons are visible', async () => {
      await expect(editor.toolbar.locator('button[title="Undo (Cmd+Z)"]')).toBeVisible();
      await expect(editor.toolbar.locator('button[title="Redo (Cmd+Shift+Z)"]')).toBeVisible();
    });

    test('undo button is disabled when nothing to undo', async () => {
      // Fresh editor should have undo disabled after clear
      await editor.clear();
      // Undo the clear to get back to original state
      await editor.pressShortcut('Meta+z');
      await editor.pressShortcut('Meta+z');

      // Now undo should eventually be disabled
      const undoButton = editor.toolbar.locator('button[title="Undo (Cmd+Z)"]');
      // Check if button has disabled styling
      const className = await undoButton.getAttribute('class');
      expect(className).toContain('disabled');
    });

    test('redo button is disabled when nothing to redo', async () => {
      const redoButton = editor.toolbar.locator('button[title="Redo (Cmd+Shift+Z)"]');
      const className = await redoButton.getAttribute('class');
      expect(className).toContain('disabled');
    });
  });

  test.describe('Toolbar Responsiveness', () => {
    test('toolbar is sticky at top', async () => {
      const toolbarClasses = await editor.toolbar.getAttribute('class');
      expect(toolbarClasses).toContain('sticky');
    });

    test('toolbar has proper z-index', async () => {
      const toolbarClasses = await editor.toolbar.getAttribute('class');
      expect(toolbarClasses).toContain('z-10');
    });
  });

  test.describe('Button State Sync', () => {
    test('toolbar state syncs with editor content', async () => {
      await editor.clear();

      // Type and make bold
      await editor.type('test');
      await editor.selectAll();
      await editor.clickToolbarButton('Bold (Cmd+B)');

      // Verify active
      expect(await editor.isToolbarButtonActive('Bold (Cmd+B)')).toBe(true);

      // Click away and back - state should persist
      await editor.clickToolbarButton('Bold (Cmd+B)'); // Toggle off
      expect(await editor.isToolbarButtonActive('Bold (Cmd+B)')).toBe(false);
    });
  });
});
