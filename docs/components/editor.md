# Editor

The `TipTapEditor` component is the main document editing interface, built on [TipTap](https://tiptap.dev/) with Tauri file system integration.

## Overview

```tsx
import { TipTapEditor } from '@/components/Editor';

function App() {
  return <TipTapEditor />;
}
```

## Features

### Rich Text Editing

The editor supports a full range of formatting options:

| Feature | Description | Keyboard Shortcut |
|---------|-------------|-------------------|
| **Bold** | Strong emphasis | `Cmd/Ctrl + B` |
| **Italic** | Emphasis | `Cmd/Ctrl + I` |
| **Underline** | Underline text | `Cmd/Ctrl + U` |
| **Strikethrough** | Cross out text | - |
| **Headings** | H1, H2, H3 | - |
| **Bullet List** | Unordered list | - |
| **Numbered List** | Ordered list | - |
| **Task List** | Checkable items | - |
| **Blockquote** | Quoted text | - |
| **Code Block** | Syntax-highlighted code | - |

### File Operations

| Operation | Description | Keyboard Shortcut |
|-----------|-------------|-------------------|
| **New** | Clear editor, start fresh | `Cmd/Ctrl + N` |
| **Open** | Open HTML file from disk | `Cmd/Ctrl + O` |
| **Save** | Save to current file or choose location | `Cmd/Ctrl + S` |

### Status Bar

The editor includes a status bar showing:
- Current file name (or "Untitled Document")
- Save indicator ("Saved" flash after successful save)
- Character count

## TipTap Extensions

The editor uses these TipTap extensions:

```typescript
const extensions = [
  StarterKit.configure({
    heading: { levels: [1, 2, 3] },
  }),
  Underline,
  TaskList,
  TaskItem.configure({ nested: true }),
  Placeholder.configure({
    placeholder: 'Start typing your document here...',
  }),
];
```

### StarterKit

Provides core formatting:
- Paragraphs
- Headings (H1-H3)
- Bold, Italic, Strikethrough
- Bullet and Ordered Lists
- Blockquotes
- Code Blocks
- Horizontal Rules
- Hard Breaks

### TaskList / TaskItem

Enables checkable task lists with nested support:

```html
<ul data-type="taskList">
  <li data-type="taskItem" data-checked="true">Completed task</li>
  <li data-type="taskItem" data-checked="false">Pending task</li>
</ul>
```

## File Format

The editor saves content as HTML:

```html
<h1>Document Title</h1>
<p>This is a <strong>formatted</strong> paragraph.</p>
<ul>
  <li>List item 1</li>
  <li>List item 2</li>
</ul>
```

Supported file types for opening:
- `.html` - HTML files
- `.htm` - HTML files
- `*` - Any file (will attempt to parse as HTML)

## Component Structure

```
TipTapEditor
├── Toolbar              # Formatting controls
├── Status Bar           # File info + save status
└── EditorContent        # TipTap editor area
    └── .tiptap          # Prose-styled content
```

## Styling

The editor uses Tailwind CSS with the `@tailwindcss/typography` plugin for prose styling:

```tsx
<EditorContent
  editor={editor}
  className="prose prose-sm max-w-none focus:outline-none"
/>
```

Key classes:
- `.tiptap` - Editor container
- `.prose` - Typography styles from Tailwind
- `.prose-sm` - Smaller text size
- `.max-w-none` - Remove max-width constraint

## State Management

The component manages:

```typescript
const [currentFilePath, setCurrentFilePath] = useState<string | null>(null);
const [isSaving, setIsSaving] = useState(false);
const [lastSaved, setLastSaved] = useState<Date | null>(null);
```

| State | Type | Description |
|-------|------|-------------|
| `currentFilePath` | `string \| null` | Path to open file, null for new documents |
| `isSaving` | `boolean` | True during save operation |
| `lastSaved` | `Date \| null` | Timestamp of last save (for indicator) |

## Platform Considerations

### Web

File operations are mocked in Storybook since Tauri plugins aren't available:

```typescript
// In Storybook
const handleOpen = async () => {
  alert('Open dialog would appear here (mocked in Storybook)');
  setCurrentFilePath('example-document.html');
};
```

### Desktop (Tauri)

Full file system access via Tauri plugins:

```typescript
import { save, open } from '@tauri-apps/plugin-dialog';
import { readTextFile, writeTextFile } from '@tauri-apps/plugin-fs';
```

### Mobile (Capacitor)

For mobile, consider using:
- Share sheet for saving
- Document picker for opening
- Cloud storage integrations

## Storybook

View interactive examples:

```bash
pnpm storybook
```

Available stories:
- **Default** - Editor with sample content
- **Empty** - Blank editor with placeholder
- **TaskListExample** - Project management example
- **CodeDocumentation** - Technical docs example
- **MeetingNotes** - Meeting notes template

## API Reference

See the [TipTap documentation](https://tiptap.dev/api/editor) for the full editor API.

Common operations:

```typescript
// Get editor content
const html = editor.getHTML();
const json = editor.getJSON();
const text = editor.getText();

// Set content
editor.commands.setContent('<p>New content</p>');

// Focus
editor.commands.focus();

// Check formatting state
const isBold = editor.isActive('bold');
const isH1 = editor.isActive('heading', { level: 1 });
```

## Related

- [Toolbar](/components/toolbar) - Formatting toolbar component
- [useCollaborativeEditor](/api/generated/hooks/functions/useCollaborativeEditor) - Collaborative editing hook
- [useAutoSave](/api/generated/hooks/functions/useAutoSave) - Auto-save functionality
