import { Editor } from "@tiptap/react";

interface ToolbarProps {
  editor: Editor | null;
  onSave: () => void;
  onOpen: () => void;
  onNew: () => void;
  isSaving: boolean;
}

export function Toolbar({
  editor,
  onSave,
  onOpen,
  onNew,
  isSaving,
}: ToolbarProps) {
  if (!editor) return null;

  const buttonClass = (isActive: boolean = false) =>
    `px-3 py-1.5 rounded font-medium transition-colors ${
      isActive
        ? "bg-blue-600 text-white"
        : "bg-gray-100 hover:bg-gray-200 text-gray-700"
    }`;

  const divider = <div className="w-px h-6 bg-gray-300 mx-1" />;

  return (
    <div className="flex flex-wrap items-center gap-1 p-2 border-b border-gray-200 bg-white sticky top-0 z-10">
      {/* File Operations */}
      <button onClick={onNew} className={buttonClass()} title="New Document">
        New
      </button>
      <button onClick={onOpen} className={buttonClass()} title="Open Document">
        Open
      </button>
      <button
        onClick={onSave}
        className={buttonClass()}
        title="Save Document"
        disabled={isSaving}
      >
        {isSaving ? "Saving..." : "Save"}
      </button>

      {divider}

      {/* Text Formatting */}
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={buttonClass(editor.isActive("bold"))}
        title="Bold (Cmd+B)"
      >
        <strong>B</strong>
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={buttonClass(editor.isActive("italic"))}
        title="Italic (Cmd+I)"
      >
        <em>I</em>
      </button>
      <button
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={buttonClass(editor.isActive("underline"))}
        title="Underline (Cmd+U)"
      >
        <u>U</u>
      </button>
      <button
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={buttonClass(editor.isActive("strike"))}
        title="Strikethrough"
      >
        <s>S</s>
      </button>

      {divider}

      {/* Headings */}
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={buttonClass(editor.isActive("heading", { level: 1 }))}
        title="Heading 1"
      >
        H1
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={buttonClass(editor.isActive("heading", { level: 2 }))}
        title="Heading 2"
      >
        H2
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={buttonClass(editor.isActive("heading", { level: 3 }))}
        title="Heading 3"
      >
        H3
      </button>

      {divider}

      {/* Lists */}
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={buttonClass(editor.isActive("bulletList"))}
        title="Bullet List"
      >
        &bull; List
      </button>
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={buttonClass(editor.isActive("orderedList"))}
        title="Numbered List"
      >
        1. List
      </button>
      <button
        onClick={() => editor.chain().focus().toggleTaskList().run()}
        className={buttonClass(editor.isActive("taskList"))}
        title="Task List"
      >
        &#9744; Tasks
      </button>

      {divider}

      {/* Block Elements */}
      <button
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={buttonClass(editor.isActive("blockquote"))}
        title="Quote"
      >
        &ldquo; Quote
      </button>
      <button
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={buttonClass(editor.isActive("codeBlock"))}
        title="Code Block"
      >
        {"</>"}
      </button>

      {divider}

      {/* Undo/Redo */}
      <button
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        className={`${buttonClass()} disabled:opacity-50 disabled:cursor-not-allowed`}
        title="Undo (Cmd+Z)"
      >
        Undo
      </button>
      <button
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        className={`${buttonClass()} disabled:opacity-50 disabled:cursor-not-allowed`}
        title="Redo (Cmd+Shift+Z)"
      >
        Redo
      </button>
    </div>
  );
}
