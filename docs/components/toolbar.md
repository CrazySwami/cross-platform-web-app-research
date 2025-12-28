# Toolbar

The `Toolbar` component provides formatting controls for the TipTap editor, including file operations, text formatting, headings, lists, and history management.

## Overview

```tsx
import { Toolbar } from '@/components/Toolbar';

function Editor() {
  const editor = useEditor({ extensions: [...] });

  return (
    <Toolbar
      editor={editor}
      onSave={handleSave}
      onOpen={handleOpen}
      onNew={handleNew}
      isSaving={isSaving}
    />
  );
}
```

## Props

```typescript
interface ToolbarProps {
  /** TipTap editor instance (null during initialization) */
  editor: Editor | null;
  /** Callback when Save button is clicked */
  onSave: () => void;
  /** Callback when Open button is clicked */
  onOpen: () => void;
  /** Callback when New button is clicked */
  onNew: () => void;
  /** Whether a save operation is in progress */
  isSaving: boolean;
}
```

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `editor` | `Editor \| null` | Yes | TipTap editor instance |
| `onSave` | `() => void` | Yes | Save button handler |
| `onOpen` | `() => void` | Yes | Open button handler |
| `onNew` | `() => void` | Yes | New button handler |
| `isSaving` | `boolean` | Yes | Shows "Saving..." state |

## Button Groups

The toolbar is organized into logical groups separated by dividers:

### File Operations

| Button | Action | Notes |
|--------|--------|-------|
| **New** | Clear editor | Calls `onNew` |
| **Open** | Open file dialog | Calls `onOpen` |
| **Save** | Save to file | Calls `onSave`, shows "Saving..." when `isSaving` |

### Text Formatting

| Button | Action | Active State |
|--------|--------|--------------|
| **B** | Toggle bold | `editor.isActive('bold')` |
| **I** | Toggle italic | `editor.isActive('italic')` |
| **U** | Toggle underline | `editor.isActive('underline')` |
| **S** | Toggle strikethrough | `editor.isActive('strike')` |

### Headings

| Button | Action | Active State |
|--------|--------|--------------|
| **H1** | Toggle Heading 1 | `editor.isActive('heading', { level: 1 })` |
| **H2** | Toggle Heading 2 | `editor.isActive('heading', { level: 2 })` |
| **H3** | Toggle Heading 3 | `editor.isActive('heading', { level: 3 })` |

### Lists

| Button | Action | Active State |
|--------|--------|--------------|
| **Bullet List** | Toggle bullet list | `editor.isActive('bulletList')` |
| **Numbered List** | Toggle ordered list | `editor.isActive('orderedList')` |
| **Task List** | Toggle task list | `editor.isActive('taskList')` |

### Block Elements

| Button | Action | Active State |
|--------|--------|--------------|
| **Quote** | Toggle blockquote | `editor.isActive('blockquote')` |
| **Code** | Toggle code block | `editor.isActive('codeBlock')` |

### History

| Button | Action | Disabled State |
|--------|--------|----------------|
| **Undo** | Undo last action | `!editor.can().undo()` |
| **Redo** | Redo last action | `!editor.can().redo()` |

## Styling

### Button States

Buttons have three visual states:

```typescript
const buttonClass = (isActive: boolean = false) =>
  `px-3 py-1.5 rounded font-medium transition-colors ${
    isActive
      ? "bg-blue-600 text-white"           // Active state
      : "bg-gray-100 hover:bg-gray-200 text-gray-700"  // Default state
  }`;
```

| State | Background | Text |
|-------|------------|------|
| Default | `gray-100` | `gray-700` |
| Hover | `gray-200` | `gray-700` |
| Active | `blue-600` | `white` |
| Disabled | `gray-100` (50% opacity) | `gray-700` |

### Layout

```tsx
<div className="flex flex-wrap items-center gap-1 p-2 border-b border-gray-200 bg-white sticky top-0 z-10">
  {/* Buttons and dividers */}
</div>
```

- `flex flex-wrap` - Wraps on small screens
- `sticky top-0` - Stays visible when scrolling
- `z-10` - Stays above content

### Dividers

Groups are separated by vertical dividers:

```tsx
const divider = <div className="w-px h-6 bg-gray-300 mx-1" />;
```

## Usage Examples

### Basic Usage

```tsx
import { useEditor } from '@tiptap/react';
import { Toolbar } from '@/components/Toolbar';

function Editor() {
  const [isSaving, setIsSaving] = useState(false);

  const editor = useEditor({
    extensions: [StarterKit, Underline, TaskList, TaskItem],
    content: '<p>Hello World</p>',
  });

  const handleSave = async () => {
    setIsSaving(true);
    await saveContent(editor.getHTML());
    setIsSaving(false);
  };

  return (
    <div>
      <Toolbar
        editor={editor}
        onSave={handleSave}
        onOpen={() => {}}
        onNew={() => editor.commands.clearContent()}
        isSaving={isSaving}
      />
      <EditorContent editor={editor} />
    </div>
  );
}
```

### With Keyboard Shortcuts

The parent component should handle keyboard shortcuts:

```tsx
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 's') {
      e.preventDefault();
      handleSave();
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [handleSave]);
```

### Custom Styling

Override styles with Tailwind:

```tsx
<div className="[&_.toolbar]:bg-gray-900 [&_.toolbar]:text-white">
  <Toolbar {...props} />
</div>
```

## TipTap Commands

The toolbar uses TipTap's chainable command API:

```typescript
// Toggle formatting
editor.chain().focus().toggleBold().run();

// Set heading
editor.chain().focus().toggleHeading({ level: 1 }).run();

// Check state
editor.isActive('bold');
editor.isActive('heading', { level: 2 });

// Check capability
editor.can().undo();
editor.can().redo();
```

## Accessibility

Button titles provide keyboard shortcut hints:

```tsx
<button title="Bold (Cmd+B)">
  <strong>B</strong>
</button>
```

Consider adding:
- `aria-label` for screen readers
- `aria-pressed` for toggle buttons
- Focus management

## Storybook

View interactive examples:

```bash
pnpm storybook
```

Available stories:
- **Default** - Interactive toolbar with editor
- **Saving** - Shows saving state
- **WithRichContent** - Various formatting applied
- **WithTaskList** - Task list content

## Related

- [Editor](/components/editor) - Main editor component
- [TipTap Commands](https://tiptap.dev/api/commands) - Full command reference
