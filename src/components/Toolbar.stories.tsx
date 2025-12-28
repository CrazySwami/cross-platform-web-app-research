/**
 * Storybook stories for the Toolbar component.
 *
 * @remarks
 * The Toolbar provides formatting controls for the TipTap editor.
 * It includes file operations, text formatting, headings, lists,
 * block elements, and undo/redo functionality.
 */

import type { Meta, StoryObj } from '@storybook/react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import { Toolbar } from './Toolbar';
import { fn } from '@storybook/test';

/**
 * Wrapper component that provides a real TipTap editor instance.
 */
function ToolbarWithEditor({
  onSave,
  onOpen,
  onNew,
  isSaving,
  initialContent,
}: {
  onSave: () => void;
  onOpen: () => void;
  onNew: () => void;
  isSaving: boolean;
  initialContent?: string;
}) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      TaskList,
      TaskItem.configure({ nested: true }),
    ],
    content: initialContent || '<p>Start typing to test the toolbar...</p>',
    editorProps: {
      attributes: {
        class: 'tiptap prose prose-sm max-w-none focus:outline-none p-4 min-h-[200px]',
      },
    },
  });

  return (
    <div className="border rounded-lg overflow-hidden">
      <Toolbar
        editor={editor}
        onSave={onSave}
        onOpen={onOpen}
        onNew={onNew}
        isSaving={isSaving}
      />
      <EditorContent editor={editor} />
    </div>
  );
}

const meta: Meta<typeof ToolbarWithEditor> = {
  title: 'Components/Toolbar',
  component: ToolbarWithEditor,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
The Toolbar component provides formatting controls for the TipTap rich text editor.

## Features
- **File Operations**: New, Open, Save buttons
- **Text Formatting**: Bold, Italic, Underline, Strikethrough
- **Headings**: H1, H2, H3 toggles
- **Lists**: Bullet list, Numbered list, Task list
- **Block Elements**: Blockquote, Code block
- **History**: Undo, Redo

## Usage

\`\`\`tsx
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
\`\`\`
        `,
      },
    },
  },
  argTypes: {
    isSaving: {
      control: 'boolean',
      description: 'Whether a save operation is in progress',
    },
  },
};

export default meta;
type Story = StoryObj<typeof ToolbarWithEditor>;

/**
 * Default toolbar with interactive editor.
 */
export const Default: Story = {
  args: {
    onSave: fn(),
    onOpen: fn(),
    onNew: fn(),
    isSaving: false,
    initialContent: '<p>Click the toolbar buttons to format this text. Try <strong>selecting text</strong> and clicking Bold!</p>',
  },
};

/**
 * Toolbar in saving state with disabled Save button.
 */
export const Saving: Story = {
  args: {
    onSave: fn(),
    onOpen: fn(),
    onNew: fn(),
    isSaving: true,
    initialContent: '<p>The Save button shows "Saving..." when isSaving is true.</p>',
  },
};

/**
 * Toolbar with rich content showing various formatting options.
 */
export const WithRichContent: Story = {
  args: {
    onSave: fn(),
    onOpen: fn(),
    onNew: fn(),
    isSaving: false,
    initialContent: `
      <h1>Welcome to the Editor</h1>
      <p>This is a <strong>bold</strong> and <em>italic</em> paragraph with <u>underlined</u> text.</p>
      <h2>A Subheading</h2>
      <ul>
        <li>Bullet item 1</li>
        <li>Bullet item 2</li>
      </ul>
      <ol>
        <li>Numbered item 1</li>
        <li>Numbered item 2</li>
      </ol>
      <blockquote><p>This is a blockquote</p></blockquote>
      <pre><code>const code = "block";</code></pre>
    `,
  },
};

/**
 * Toolbar with task list content.
 */
export const WithTaskList: Story = {
  args: {
    onSave: fn(),
    onOpen: fn(),
    onNew: fn(),
    isSaving: false,
    initialContent: `
      <h2>My Tasks</h2>
      <ul data-type="taskList">
        <li data-type="taskItem" data-checked="true">Complete documentation</li>
        <li data-type="taskItem" data-checked="true">Write Storybook stories</li>
        <li data-type="taskItem" data-checked="false">Review pull request</li>
        <li data-type="taskItem" data-checked="false">Deploy to production</li>
      </ul>
    `,
  },
};
