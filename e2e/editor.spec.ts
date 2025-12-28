import { test, expect } from '@playwright/test';
import { EditorHelper } from './fixtures/editor-helpers';

test.describe('Editor', () => {
  let editor: EditorHelper;

  test.beforeEach(async ({ page }) => {
    editor = new EditorHelper(page);
    await editor.goto();
  });

  test('loads with welcome content', async () => {
    await expect(editor.editor.locator('h1')).toContainText('Welcome to TipTap Editor');
  });

  test('displays features list', async () => {
    await editor.expectText('Bold, Italic, Underline, Strikethrough');
    await editor.expectText('Headings (H1, H2, H3)');
    await editor.expectText('Bullet and Numbered Lists');
    await editor.expectText('Task Lists with checkboxes');
  });

  test('can type in editor', async () => {
    await editor.clear();
    await editor.type('Hello Playwright!');
    await editor.expectText('Hello Playwright!');
  });

  test('can type multiple paragraphs', async () => {
    await editor.clear();
    await editor.type('First paragraph');
    await editor.page.keyboard.press('Enter');
    await editor.page.keyboard.press('Enter');
    await editor.type('Second paragraph');
    await editor.expectText('First paragraph');
    await editor.expectText('Second paragraph');
  });

  test('shows character count in status bar', async () => {
    await editor.clear();
    await editor.type('Hello');
    const count = await editor.getCharacterCount();
    expect(count).toBeGreaterThan(0);
  });

  test('shows Untitled Document for new content', async ({ page }) => {
    await expect(page.locator('text=Untitled Document')).toBeVisible();
  });

  test('editor is focusable', async () => {
    await editor.editor.click();
    await expect(editor.editor).toBeFocused();
  });

  test('preserves content after clicking outside', async ({ page }) => {
    await editor.clear();
    await editor.type('Test content');
    await page.locator('body').click({ position: { x: 0, y: 0 } });
    await editor.expectText('Test content');
  });
});
