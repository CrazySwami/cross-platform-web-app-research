import { test, expect } from '@playwright/test';
import { EditorHelper } from './fixtures/editor-helpers';

test.describe('Text Formatting', () => {
  let editor: EditorHelper;

  test.beforeEach(async ({ page }) => {
    editor = new EditorHelper(page);
    await editor.goto();
    await editor.clear();
  });

  test.describe('Bold', () => {
    test('can apply bold via toolbar', async () => {
      await editor.type('bold text');
      await editor.selectAll();
      await editor.clickToolbarButton('Bold (Cmd+B)');
      await editor.expectElement('strong');
    });

    test('can toggle bold off', async () => {
      await editor.type('text');
      await editor.selectAll();
      await editor.clickToolbarButton('Bold (Cmd+B)');
      await editor.clickToolbarButton('Bold (Cmd+B)');
      const content = await editor.getContent();
      expect(content).not.toContain('<strong>');
    });

    test('bold button shows active state', async () => {
      await editor.type('text');
      await editor.selectAll();
      await editor.clickToolbarButton('Bold (Cmd+B)');
      expect(await editor.isToolbarButtonActive('Bold (Cmd+B)')).toBe(true);
    });
  });

  test.describe('Italic', () => {
    test('can apply italic via toolbar', async () => {
      await editor.type('italic text');
      await editor.selectAll();
      await editor.clickToolbarButton('Italic (Cmd+I)');
      await editor.expectElement('em');
    });

    test('italic button shows active state', async () => {
      await editor.type('text');
      await editor.selectAll();
      await editor.clickToolbarButton('Italic (Cmd+I)');
      expect(await editor.isToolbarButtonActive('Italic (Cmd+I)')).toBe(true);
    });
  });

  test.describe('Underline', () => {
    test('can apply underline via toolbar', async () => {
      await editor.type('underline text');
      await editor.selectAll();
      await editor.clickToolbarButton('Underline (Cmd+U)');
      await editor.expectElement('u');
    });

    test('underline button shows active state', async () => {
      await editor.type('text');
      await editor.selectAll();
      await editor.clickToolbarButton('Underline (Cmd+U)');
      expect(await editor.isToolbarButtonActive('Underline (Cmd+U)')).toBe(true);
    });
  });

  test.describe('Strikethrough', () => {
    test('can apply strikethrough via toolbar', async () => {
      await editor.type('strikethrough text');
      await editor.selectAll();
      await editor.clickToolbarButton('Strikethrough');
      await editor.expectElement('s');
    });

    test('strikethrough button shows active state', async () => {
      await editor.type('text');
      await editor.selectAll();
      await editor.clickToolbarButton('Strikethrough');
      expect(await editor.isToolbarButtonActive('Strikethrough')).toBe(true);
    });
  });

  test.describe('Combined Formatting', () => {
    test('can apply multiple formats to same text', async () => {
      await editor.type('formatted');
      await editor.selectAll();
      await editor.clickToolbarButton('Bold (Cmd+B)');
      await editor.clickToolbarButton('Italic (Cmd+I)');
      await editor.expectElement('strong');
      await editor.expectElement('em');
    });

    test('can apply bold and underline together', async () => {
      await editor.type('text');
      await editor.selectAll();
      await editor.clickToolbarButton('Bold (Cmd+B)');
      await editor.clickToolbarButton('Underline (Cmd+U)');
      const content = await editor.getContent();
      expect(content).toContain('<strong>');
      expect(content).toContain('<u>');
    });
  });
});
