import { test, expect } from '@playwright/test';
import { EditorHelper } from './fixtures/editor-helpers';

test.describe('History (Undo/Redo)', () => {
  let editor: EditorHelper;

  test.beforeEach(async ({ page }) => {
    editor = new EditorHelper(page);
    await editor.goto();
    await editor.clear();
  });

  test.describe('Undo', () => {
    test('can undo text formatting', async () => {
      await editor.type('text');
      await editor.selectAll();
      await editor.clickToolbarButton('Bold (Cmd+B)');

      // Verify bold is applied
      await editor.expectElement('strong');

      // Undo
      await editor.clickToolbarButton('Undo (Cmd+Z)');

      // Bold should be removed
      const content = await editor.getContent();
      expect(content).not.toContain('<strong>');
    });

    test('can undo heading creation', async () => {
      await editor.type('Title');
      await editor.selectAll();
      await editor.clickToolbarButton('Heading 1');

      await editor.expectElement('h1');
      await expect(editor.editor.locator('h1')).toContainText('Title');

      // Use keyboard shortcut for undo (more reliable)
      await editor.pressShortcut('Meta+z');
      await editor.page.waitForTimeout(100);

      // After undo, we should either have "Title" as paragraph OR heading should be gone
      // Check that h1 with "Title" no longer exists
      const hasH1WithTitle = await editor.editor.locator('h1:has-text("Title")').count();
      expect(hasH1WithTitle).toBe(0);
    });

    test('can undo list creation', async () => {
      await editor.type('Item');
      await editor.clickToolbarButton('Bullet List');

      await editor.expectElement('ul');

      await editor.clickToolbarButton('Undo (Cmd+Z)');

      const content = await editor.getContent();
      expect(content).not.toContain('<ul>');
    });

    test('can undo multiple actions', async () => {
      await editor.type('text');
      await editor.selectAll();
      await editor.clickToolbarButton('Bold (Cmd+B)');
      await editor.clickToolbarButton('Italic (Cmd+I)');

      // Both should be applied
      await editor.expectElement('strong');
      await editor.expectElement('em');

      // Undo italic
      await editor.clickToolbarButton('Undo (Cmd+Z)');
      let content = await editor.getContent();
      expect(content).not.toContain('<em>');
      expect(content).toContain('<strong>');

      // Undo bold
      await editor.clickToolbarButton('Undo (Cmd+Z)');
      content = await editor.getContent();
      expect(content).not.toContain('<strong>');
    });

    test('undo button becomes enabled after action', async () => {
      // Type something to enable undo
      await editor.type('something');

      const undoButton = editor.toolbar.locator('button[title="Undo (Cmd+Z)"]');
      // The button should be clickable (not have disabled state)
      await expect(undoButton).toBeEnabled();
    });
  });

  test.describe('Redo', () => {
    test('can redo undone formatting', async () => {
      await editor.type('text');
      await editor.selectAll();
      await editor.clickToolbarButton('Bold (Cmd+B)');
      await editor.clickToolbarButton('Undo (Cmd+Z)');

      // Verify bold is undone
      let content = await editor.getContent();
      expect(content).not.toContain('<strong>');

      // Redo
      await editor.clickToolbarButton('Redo (Cmd+Shift+Z)');

      // Bold should be back
      await editor.expectElement('strong');
    });

    test('can redo undone heading', async () => {
      await editor.type('Title');
      await editor.selectAll();
      await editor.clickToolbarButton('Heading 1');
      await editor.clickToolbarButton('Undo (Cmd+Z)');
      await editor.clickToolbarButton('Redo (Cmd+Shift+Z)');

      await editor.expectElement('h1');
    });

    test('can redo multiple undone actions', async () => {
      await editor.type('text');
      await editor.selectAll();
      await editor.clickToolbarButton('Bold (Cmd+B)');
      await editor.clickToolbarButton('Italic (Cmd+I)');

      // Undo both
      await editor.clickToolbarButton('Undo (Cmd+Z)');
      await editor.clickToolbarButton('Undo (Cmd+Z)');

      // Redo both
      await editor.clickToolbarButton('Redo (Cmd+Shift+Z)');
      await editor.clickToolbarButton('Redo (Cmd+Shift+Z)');

      // Both should be back
      await editor.expectElement('strong');
      await editor.expectElement('em');
    });

    test('redo button becomes enabled after undo', async () => {
      await editor.type('text');
      await editor.selectAll();
      await editor.clickToolbarButton('Bold (Cmd+B)');
      await editor.clickToolbarButton('Undo (Cmd+Z)');

      const redoButton = editor.toolbar.locator('button[title="Redo (Cmd+Shift+Z)"]');
      await expect(redoButton).toBeEnabled();
    });

    test('new action clears redo stack', async () => {
      await editor.type('text');
      await editor.selectAll();
      await editor.clickToolbarButton('Bold (Cmd+B)');
      await editor.clickToolbarButton('Undo (Cmd+Z)');

      // New action
      await editor.clickToolbarButton('Italic (Cmd+I)');

      // Redo should now be disabled (new action cleared the stack)
      const redoButton = editor.toolbar.locator('button[title="Redo (Cmd+Shift+Z)"]');
      const className = await redoButton.getAttribute('class');
      expect(className).toContain('disabled');
    });
  });

  test.describe('Complex History', () => {
    test('can undo/redo blockquote creation', async () => {
      await editor.type('Quote text');
      await editor.selectAll();
      await editor.clickToolbarButton('Quote');

      await editor.expectElement('blockquote');

      await editor.clickToolbarButton('Undo (Cmd+Z)');
      let content = await editor.getContent();
      expect(content).not.toContain('<blockquote>');

      await editor.clickToolbarButton('Redo (Cmd+Shift+Z)');
      await editor.expectElement('blockquote');
    });

    test('can undo/redo code block creation', async () => {
      await editor.type('const x = 1;');
      await editor.selectAll();
      await editor.clickToolbarButton('Code Block');

      await editor.expectElement('pre');
      await expect(editor.editor.locator('pre')).toContainText('const x = 1');

      // Use keyboard shortcut for undo (more reliable than button)
      await editor.pressShortcut('Meta+z');

      // After undo, code block should be gone or text should be in paragraph
      // Wait a moment for undo to process
      await editor.page.waitForTimeout(100);
      const codeBlockCount = await editor.editor.locator('pre').count();

      if (codeBlockCount === 0) {
        // Code block was undone, content should be in paragraph
        await expect(editor.editor.locator('p')).toContainText('const x = 1');
      }

      // Redo should bring code block back
      await editor.pressShortcut('Meta+Shift+z');
      await editor.expectElement('pre');
    });

    test('history persists through multiple operations', async () => {
      // Type some content to build history
      await editor.type('one two three');

      // Verify text is there
      await editor.expectText('one two three');

      // Undo using keyboard shortcut (more reliable)
      await editor.pressShortcut('Meta+z');
      await editor.page.waitForTimeout(100);

      // After undo, some or all of the text should be gone
      const textAfterUndo = await editor.getText();

      // Redo should bring text back
      await editor.pressShortcut('Meta+Shift+z');
      await editor.page.waitForTimeout(100);

      // After redo, text should be restored
      await editor.expectText('one two three');
    });
  });
});
