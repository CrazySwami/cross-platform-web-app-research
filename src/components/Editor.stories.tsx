/**
 * Storybook stories for the TipTapEditor component.
 *
 * @remarks
 * The Editor is the main document editing component. In Storybook,
 * file operations are mocked since Tauri plugins aren't available.
 */

import type { Meta, StoryObj } from '@storybook/react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Placeholder from '@tiptap/extension-placeholder';
import { useState, useCallback, useEffect } from 'react';
import { Toolbar } from './Toolbar';

/**
 * Storybook-compatible Editor that mocks Tauri file operations.
 */
function StorybookEditor({
  initialContent,
  placeholder,
}: {
  initialContent?: string;
  placeholder?: string;
}) {
  const [currentFilePath, setCurrentFilePath] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      TaskList,
      TaskItem.configure({ nested: true }),
      Placeholder.configure({
        placeholder: placeholder || 'Start typing your document here...',
      }),
    ],
    content: initialContent || `
      <h1>Welcome to TipTap Editor</h1>
      <p>This is a <strong>Tauri</strong> application with a <em>TipTap</em> rich text editor.</p>
      <h2>Features</h2>
      <ul>
        <li>Bold, Italic, Underline, Strikethrough</li>
        <li>Headings (H1, H2, H3)</li>
        <li>Bullet and Numbered Lists</li>
        <li>Task Lists with checkboxes</li>
        <li>Blockquotes and Code Blocks</li>
      </ul>
    `,
    editorProps: {
      attributes: {
        class: 'tiptap prose prose-sm max-w-none focus:outline-none',
      },
    },
  });

  // Auto-save indicator
  useEffect(() => {
    if (lastSaved) {
      const timer = setTimeout(() => setLastSaved(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [lastSaved]);

  const handleNew = useCallback(() => {
    if (editor) {
      editor.commands.setContent('<p></p>');
      setCurrentFilePath(null);
    }
  }, [editor]);

  const handleOpen = useCallback(async () => {
    // Mock file open for Storybook
    alert('Open dialog would appear here (mocked in Storybook)');
    setCurrentFilePath('example-document.html');
  }, []);

  const handleSave = useCallback(async () => {
    if (!editor) return;

    setIsSaving(true);
    // Mock save operation
    await new Promise(resolve => setTimeout(resolve, 500));
    setCurrentFilePath(currentFilePath || 'new-document.html');
    setLastSaved(new Date());
    setIsSaving(false);
  }, [editor, currentFilePath]);

  return (
    <div className="flex flex-col h-[600px] bg-gray-50">
      <Toolbar
        editor={editor}
        onSave={handleSave}
        onOpen={handleOpen}
        onNew={handleNew}
        isSaving={isSaving}
      />

      {/* Status Bar */}
      <div className="flex items-center justify-between px-4 py-1 text-xs text-gray-500 bg-gray-100 border-b border-gray-200">
        <div>
          {currentFilePath ? (
            <span title={currentFilePath}>
              {currentFilePath.split('/').pop()}
            </span>
          ) : (
            <span>Untitled Document</span>
          )}
        </div>
        <div className="flex items-center gap-4">
          {lastSaved && (
            <span className="text-green-600">Saved</span>
          )}
          <span>
            {editor?.getText().length ?? 0} characters
          </span>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto my-8 bg-white rounded-lg shadow-sm border border-gray-200">
          <EditorContent editor={editor} className="p-4" />
        </div>
      </div>
    </div>
  );
}

const meta: Meta<typeof StorybookEditor> = {
  title: 'Components/Editor',
  component: StorybookEditor,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
The TipTapEditor is the main document editing component for Layers.

## Features
- Full-featured rich text editing with TipTap
- File operations (New, Open, Save) via Tauri
- Keyboard shortcuts (Cmd+S, Cmd+O, Cmd+N)
- Auto-save indicator
- Character count

## Usage

\`\`\`tsx
import { TipTapEditor } from '@/components/Editor';

function App() {
  return <TipTapEditor />;
}
\`\`\`

## Keyboard Shortcuts
- **Cmd/Ctrl + S**: Save document
- **Cmd/Ctrl + O**: Open document
- **Cmd/Ctrl + N**: New document
- **Cmd/Ctrl + B**: Bold
- **Cmd/Ctrl + I**: Italic
- **Cmd/Ctrl + U**: Underline
- **Cmd/Ctrl + Z**: Undo
- **Cmd/Ctrl + Shift + Z**: Redo

> **Note**: In Storybook, file operations are mocked since Tauri plugins
> aren't available in the browser environment.
        `,
      },
    },
  },
  argTypes: {
    placeholder: {
      control: 'text',
      description: 'Placeholder text when editor is empty',
    },
  },
};

export default meta;
type Story = StoryObj<typeof StorybookEditor>;

/**
 * Default editor with welcome content.
 */
export const Default: Story = {
  args: {},
};

/**
 * Empty editor with custom placeholder.
 */
export const Empty: Story = {
  args: {
    initialContent: '<p></p>',
    placeholder: 'Start writing your masterpiece...',
  },
};

/**
 * Editor with a task list for project management.
 */
export const TaskListExample: Story = {
  args: {
    initialContent: `
      <h1>Project Tasks</h1>
      <p>Track your progress with task lists:</p>
      <ul data-type="taskList">
        <li data-type="taskItem" data-checked="true">Set up project</li>
        <li data-type="taskItem" data-checked="true">Create components</li>
        <li data-type="taskItem" data-checked="false">Write tests</li>
        <li data-type="taskItem" data-checked="false">Deploy to production</li>
      </ul>
      <h2>Notes</h2>
      <p>Click the checkboxes to mark tasks complete!</p>
    `,
  },
};

/**
 * Editor with code blocks for technical documentation.
 */
export const CodeDocumentation: Story = {
  args: {
    initialContent: `
      <h1>API Documentation</h1>
      <h2>Installation</h2>
      <pre><code>npm install @layers/sdk</code></pre>
      <h2>Usage</h2>
      <pre><code>import { createClient } from '@layers/sdk';

const client = createClient({
  apiKey: 'your-api-key',
});

const notes = await client.notes.list();</code></pre>
      <h2>Configuration Options</h2>
      <table>
        <tr><td><code>apiKey</code></td><td>Your API key</td></tr>
        <tr><td><code>baseUrl</code></td><td>Custom API URL</td></tr>
      </table>
    `,
  },
};

/**
 * Editor with a meeting notes template.
 */
export const MeetingNotes: Story = {
  args: {
    initialContent: `
      <h1>Team Standup - December 27, 2024</h1>
      <h2>Attendees</h2>
      <ul>
        <li>Alice (Engineering Lead)</li>
        <li>Bob (Frontend Developer)</li>
        <li>Carol (Backend Developer)</li>
      </ul>
      <h2>Updates</h2>
      <h3>Alice</h3>
      <ul>
        <li>Completed code review for PR #123</li>
        <li>Working on performance optimization</li>
      </ul>
      <h3>Bob</h3>
      <ul>
        <li>Fixed the login bug</li>
        <li>Starting on the dashboard redesign</li>
      </ul>
      <h2>Action Items</h2>
      <ul data-type="taskList">
        <li data-type="taskItem" data-checked="false">Schedule architecture review (Alice)</li>
        <li data-type="taskItem" data-checked="false">Create design mockups (Bob)</li>
        <li data-type="taskItem" data-checked="false">Review database schema (Carol)</li>
      </ul>
      <blockquote><p>Next meeting: Monday at 10 AM</p></blockquote>
    `,
  },
};
