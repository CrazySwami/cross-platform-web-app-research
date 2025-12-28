# Development Tooling

Layers uses a comprehensive tooling stack for documentation, testing, and code quality. This guide explains how each tool works and when to use it.

## Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    DOCUMENTATION                             │
├─────────────────────────────────────────────────────────────┤
│  TSDoc → TypeDoc → VitePress ← Manual Guides                │
│  (code)   (API)    (website)   (markdown)                   │
│                                                              │
│  Storybook                                                   │
│  (component visual docs + interaction testing)               │
└─────────────────────────────────────────────────────────────┘
                           │
┌─────────────────────────────────────────────────────────────┐
│                      TESTING                                 │
├─────────────────────────────────────────────────────────────┤
│  Playwright     Vitest        Storybook                      │
│  (E2E tests)    (unit tests)  (visual tests)                │
│                                                              │
│  Full browser   JavaScript    Component                      │
│  automation     logic tests   isolation                      │
└─────────────────────────────────────────────────────────────┘
```

## Documentation Tools

### TSDoc + TypeDoc

**What:** TSDoc is a comment format for TypeScript. TypeDoc reads those comments and generates markdown documentation.

**Flow:**
```
Your Code (TSDoc comments)
         │
         ▼
      TypeDoc
         │
         ▼
docs/api/generated/*.md
```

**Example TSDoc:**
```typescript
/**
 * Saves a note to the database.
 *
 * @param noteId - The unique identifier of the note
 * @param content - The note content in JSON format
 * @returns Promise that resolves when save completes
 *
 * @example
 * ```typescript
 * await saveNote('note-123', { type: 'doc', content: [...] });
 * ```
 */
export async function saveNote(noteId: string, content: JSONContent): Promise<void> {
  // implementation
}
```

**Commands:**
```bash
pnpm docs:api    # Generate API docs from TSDoc
```

### VitePress

**What:** Static site generator that turns markdown files into a documentation website.

**Structure:**
```
docs/
├── .vitepress/
│   └── config.ts     # Navigation, sidebar, theme
├── index.md          # Home page
├── guide/            # Getting started guides
│   ├── index.md
│   ├── architecture.md
│   ├── platform.md
│   └── ...
├── api/
│   └── generated/    # TypeDoc output
└── components/       # Component documentation
```

**Commands:**
```bash
pnpm docs:dev      # Start dev server (localhost:5173)
pnpm docs:build    # Build static site
pnpm docs:preview  # Preview built site
```

### Storybook

**What:** Interactive component explorer. Shows each component in isolation with different states.

**Purpose:**
1. **Visual Documentation** - See what components look like
2. **Component States** - View all variations (loading, error, empty)
3. **Interactive Testing** - Click buttons, type in inputs
4. **Accessibility Checks** - A11y addon highlights issues
5. **AI Context** - Helps Claude understand component behavior

**Structure:**
```
src/components/
├── Editor.tsx           # Component implementation
├── Editor.stories.tsx   # Storybook stories
├── Toolbar.tsx
└── Toolbar.stories.tsx
```

**Example Story:**
```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Toolbar } from './Toolbar';

const meta: Meta<typeof Toolbar> = {
  title: 'Components/Toolbar',
  component: Toolbar,
  tags: ['autodocs'],  // Auto-generate docs from props
};

export default meta;
type Story = StoryObj<typeof Toolbar>;

// Default state
export const Default: Story = {
  args: { isSaving: false },
};

// Saving state
export const Saving: Story = {
  args: { isSaving: true },
};
```

**Commands:**
```bash
pnpm storybook        # Start Storybook (localhost:6006)
pnpm storybook:build  # Build static Storybook
```

## Testing Tools

### Playwright (E2E Tests)

**What:** Automates real browsers (Chrome, Safari, Firefox) to test the full application from a user's perspective.

**Location:** `e2e/*.spec.ts`

**What it tests:**
- Full user flows (open app → edit → save)
- Keyboard shortcuts
- Cross-browser compatibility
- Real DOM interactions

**Example Test:**
```typescript
import { test, expect } from '@playwright/test';

test('user can bold text', async ({ page }) => {
  await page.goto('/');

  // Type in editor
  const editor = page.locator('.tiptap');
  await editor.click();
  await page.keyboard.type('hello');

  // Select all and bold
  await page.keyboard.press('Meta+a');
  await page.keyboard.press('Meta+b');

  // Verify bold was applied
  await expect(editor.locator('strong')).toHaveText('hello');
});
```

**Commands:**
```bash
pnpm test:e2e           # Run all tests (headless)
pnpm test:e2e:ui        # Open Playwright UI
pnpm test:e2e:headed    # Run with visible browser
pnpm test:e2e:chromium  # Chrome only
pnpm test:e2e:webkit    # Safari only
```

**Test Coverage:**
| File | Tests |
|------|-------|
| `editor.spec.ts` | Loading, typing, content |
| `formatting.spec.ts` | Bold, italic, underline, strike |
| `headings.spec.ts` | H1, H2, H3 toggles |
| `lists.spec.ts` | Bullet, numbered, task lists |
| `blocks.spec.ts` | Blockquote, code block |
| `keyboard-shortcuts.spec.ts` | All keyboard shortcuts |
| `toolbar.spec.ts` | Toolbar buttons |
| `history.spec.ts` | Undo/redo |

### Vitest (Unit Tests)

**What:** Fast unit testing framework for JavaScript/TypeScript. Tests individual functions and hooks in isolation.

**Location:** `src/**/*.test.ts`

**What it tests:**
- Pure functions
- React hooks
- Utility functions
- Business logic

**Example Test:**
```typescript
import { describe, it, expect } from 'vitest';
import { extractTitle } from './utils';

describe('extractTitle', () => {
  it('extracts title from first heading', () => {
    const content = { type: 'heading', content: [{ text: 'My Title' }] };
    expect(extractTitle(content)).toBe('My Title');
  });

  it('returns Untitled for empty content', () => {
    expect(extractTitle(null)).toBe('Untitled');
  });
});
```

### Storybook Interaction Tests

**What:** Tests that run inside Storybook stories. Combines visual testing with interaction testing.

**Example:**
```tsx
import { within, userEvent, expect } from '@storybook/test';

export const ClickTest: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Click a button
    await userEvent.click(canvas.getByRole('button', { name: 'Save' }));

    // Verify result
    await expect(canvas.getByText('Saved')).toBeInTheDocument();
  },
};
```

## Testing Pyramid

```
         ┌─────────────┐
         │  Playwright │  ← Few, slow, high confidence
         │   (E2E)     │     Test critical user flows
         └─────────────┘
        ┌───────────────┐
        │   Storybook   │  ← Medium, component-level
        │   (Visual)    │     Test UI states and interactions
        └───────────────┘
       ┌─────────────────┐
       │     Vitest      │  ← Many, fast, low-level
       │    (Unit)       │     Test functions and logic
       └─────────────────┘
```

| Layer | Speed | What to Test |
|-------|-------|--------------|
| E2E | Slow (~seconds) | Critical paths, cross-browser |
| Visual | Medium | Component states, accessibility |
| Unit | Fast (~ms) | Pure functions, edge cases |

## When to Write Each Test Type

### Write E2E Tests For:
- Critical user journeys (login, save, collaboration)
- Features that span multiple components
- Browser-specific behavior
- Keyboard shortcuts

### Write Storybook Stories For:
- Every new component
- All component states (loading, error, empty, etc.)
- Interactive components (forms, buttons)
- Design system components

### Write Unit Tests For:
- Utility functions
- Custom hooks
- Data transformations
- Complex business logic

## Claude Skills & Agents

This project includes Claude Code skills and agents that automatically help with documentation and testing:

### Skills (Auto-triggered)
| Skill | When Used |
|-------|-----------|
| `documentation` | Adding TSDoc, creating Storybook stories |
| `testing` | Writing Playwright/Vitest tests |
| `code-quality` | TypeScript checks, best practices |

### Agents (Specialized assistants)
| Agent | When Used |
|-------|-----------|
| `code-reviewer` | After writing code, before commits |
| `component-specialist` | Creating React/TipTap components |
| `platform-specialist` | Cross-platform Tauri/Capacitor code |

## Quick Reference

| Task | Command |
|------|---------|
| Start docs site | `pnpm docs:dev` |
| Generate API docs | `pnpm docs:api` |
| Start Storybook | `pnpm storybook` |
| Run all E2E tests | `pnpm test:e2e` |
| Run E2E with UI | `pnpm test:e2e:ui` |

## Next Steps

- [Architecture](/guide/architecture) - System design overview
- [API Reference](/api/) - Generated API documentation
- [Components](/components/) - Component documentation
