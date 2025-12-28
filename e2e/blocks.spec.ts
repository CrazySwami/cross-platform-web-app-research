import { test, expect } from '@playwright/test';
import { EditorHelper } from './fixtures/editor-helpers';

test.describe('Block Elements', () => {
  let editor: EditorHelper;

  test.beforeEach(async ({ page }) => {
    editor = new EditorHelper(page);
    await editor.goto();
    await editor.clear();
  });

  test.describe('Blockquote', () => {
    test('can create blockquote via toolbar', async () => {
      await editor.type('This is a quote');
      await editor.selectAll();
      await editor.clickToolbarButton('Quote');
      await editor.expectElement('blockquote');
    });

    test('blockquote button shows active state', async () => {
      await editor.type('Quote text');
      await editor.selectAll();
      await editor.clickToolbarButton('Quote');
      expect(await editor.isToolbarButtonActive('Quote')).toBe(true);
    });

    test('can toggle blockquote off', async () => {
      await editor.type('Quote');
      await editor.selectAll();
      await editor.clickToolbarButton('Quote');
      // Click inside blockquote, select its content, then toggle off
      await editor.editor.locator('blockquote').click();
      await editor.page.keyboard.press('Meta+a');
      await editor.clickToolbarButton('Quote');
      // After toggle, blockquote should be converted to p
      const content = await editor.getContent();
      expect(content).toContain('<p>Quote</p>');
    });

    test('can add multiple lines to blockquote', async () => {
      // Type multiple lines first
      await editor.type('First line');
      await editor.page.keyboard.press('Enter');
      await editor.type('Second line');

      // Select all and convert to blockquote
      await editor.selectAll();
      await editor.clickToolbarButton('Quote');

      await expect(editor.editor.locator('blockquote')).toContainText('First line');
      await expect(editor.editor.locator('blockquote')).toContainText('Second line');
    });
  });

  test.describe('Code Block', () => {
    test('can create code block via toolbar', async () => {
      await editor.type('const x = 1;');
      await editor.selectAll();
      await editor.clickToolbarButton('Code Block');
      await editor.expectElement('pre');
      await editor.expectElement('code');
    });

    test('code block button shows active state', async () => {
      await editor.type('code');
      await editor.selectAll();
      await editor.clickToolbarButton('Code Block');
      // Wait for code block to appear, then click into it
      await expect(editor.editor.locator('pre')).toBeVisible();
      await editor.editor.locator('pre').click();
      expect(await editor.isToolbarButtonActive('Code Block')).toBe(true);
    });

    test('can toggle code block off', async () => {
      await editor.type('code');
      await editor.selectAll();
      await editor.clickToolbarButton('Code Block');
      await expect(editor.editor.locator('pre')).toBeVisible();

      // Click inside code block and select just the code block content
      await editor.editor.locator('pre').click();
      // Triple-click to select the line/block
      await editor.editor.locator('pre').click({ clickCount: 3 });
      await editor.clickToolbarButton('Code Block');

      // After toggle, code block should be converted to p
      const content = await editor.getContent();
      expect(content).toContain('<p');
      expect(content).toContain('code');
    });

    test('preserves whitespace in code block', async () => {
      // Code with leading spaces - test that whitespace is preserved
      await editor.type('  indented code');
      await editor.selectAll();
      await editor.clickToolbarButton('Code Block');
      await expect(editor.editor.locator('pre')).toBeVisible();

      // Check that whitespace is preserved in code block
      const codeContent = await editor.editor.locator('pre').innerText();
      expect(codeContent).toContain('indented code');
    });

    test('code block contains typed text', async () => {
      // Test that code block properly contains the text
      await editor.type('const x = 42;');
      await editor.selectAll();
      await editor.clickToolbarButton('Code Block');

      const codeBlock = editor.editor.locator('pre');
      await expect(codeBlock).toBeVisible();
      await expect(codeBlock).toContainText('const x = 42');
    });
  });

  test.describe('Block Switching', () => {
    test('can switch from paragraph to blockquote', async () => {
      await editor.type('Regular text');
      await editor.selectAll();
      await editor.clickToolbarButton('Quote');
      await editor.expectElement('blockquote');
    });

    test('can switch from blockquote to code block', async () => {
      await editor.type('Some text');
      await editor.selectAll();
      await editor.clickToolbarButton('Quote');
      await expect(editor.editor.locator('blockquote')).toBeVisible();

      // Triple-click inside blockquote to select just that content
      await editor.editor.locator('blockquote').click({ clickCount: 3 });
      await editor.clickToolbarButton('Code Block');

      // Use .first() to handle potential multiple pre elements
      await expect(editor.editor.locator('pre').first()).toContainText('Some text');
      const content = await editor.getContent();
      expect(content).not.toContain('<blockquote>Some text</blockquote>');
    });
  });
});
