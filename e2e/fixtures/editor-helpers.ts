import { Page, Locator, expect } from '@playwright/test';

/**
 * Helper class for interacting with the TipTap editor in E2E tests.
 */
export class EditorHelper {
  readonly page: Page;
  readonly editor: Locator;
  readonly toolbar: Locator;

  constructor(page: Page) {
    this.page = page;
    this.editor = page.locator('.tiptap');
    this.toolbar = page.locator('.sticky').first();
  }

  /**
   * Navigate to the app and wait for editor to load.
   */
  async goto() {
    await this.page.goto('/');
    await this.editor.waitFor({ state: 'visible' });
  }

  /**
   * Clear the editor content and focus it.
   */
  async clear() {
    await this.editor.click();
    await this.page.keyboard.press('Meta+a');
    await this.page.keyboard.press('Backspace');
    // Wait for editor to be empty (just a paragraph with placeholder)
    await expect(this.editor.locator('p').first()).toBeVisible();
  }

  /**
   * Type text into the editor.
   */
  async type(text: string) {
    await this.editor.click();
    await this.page.keyboard.type(text);
  }

  /**
   * Select all text in the editor.
   */
  async selectAll() {
    await this.editor.click();
    await this.page.keyboard.press('Meta+a');
  }

  /**
   * Click a toolbar button by its title attribute.
   * Use exact title from Toolbar.tsx (e.g., 'Bold (Cmd+B)', 'Heading 1')
   */
  async clickToolbarButton(buttonTitle: string) {
    await this.toolbar.locator(`button[title="${buttonTitle}"]`).click();
  }

  /**
   * Check if a toolbar button is active (highlighted).
   * Uses title attribute for stable selection.
   * For block elements (headings, lists, blockquotes), clicks into content and selects
   * to ensure cursor is within any formatted blocks.
   */
  async isToolbarButtonActive(buttonTitle: string): Promise<boolean> {
    // For block elements, cursor may have moved outside the block after applying
    // Click first non-empty text element to position cursor inside content
    const textElement = this.editor.locator('p, h1, h2, h3, li, blockquote, pre').first();
    if (await textElement.isVisible()) {
      await textElement.click();
    }
    // Wait for React to re-render toolbar state after cursor change
    await this.page.waitForTimeout(100);
    const button = this.toolbar.locator(`button[title="${buttonTitle}"]`);
    const className = await button.getAttribute('class');
    return className?.includes('bg-blue-600') ?? false;
  }

  /**
   * Get the editor's HTML content.
   */
  async getContent(): Promise<string> {
    return await this.editor.innerHTML();
  }

  /**
   * Get the editor's text content.
   */
  async getText(): Promise<string> {
    return await this.editor.innerText();
  }

  /**
   * Verify the editor contains specific text.
   */
  async expectText(text: string) {
    await expect(this.editor).toContainText(text);
  }

  /**
   * Verify the editor contains a specific HTML element.
   */
  async expectElement(selector: string) {
    await expect(this.editor.locator(selector)).toBeVisible();
  }

  /**
   * Press a keyboard shortcut.
   * Note: Does NOT click the editor first to preserve any existing selection.
   * Call click() or selectAll() before this if needed.
   */
  async pressShortcut(key: string) {
    await this.page.keyboard.press(key);
  }

  /**
   * Click inside the first content element (useful after applying block formatting
   * when cursor may have moved outside the block).
   */
  async clickIntoContent() {
    const textElement = this.editor.locator('p, h1, h2, h3, li, blockquote, pre').first();
    if (await textElement.isVisible()) {
      await textElement.click();
    }
  }

  /**
   * Get the character count from the status bar.
   */
  async getCharacterCount(): Promise<number> {
    const statusText = await this.page.locator('text=/\\d+ characters/').innerText();
    const match = statusText.match(/(\d+) characters/);
    return match ? parseInt(match[1], 10) : 0;
  }
}
