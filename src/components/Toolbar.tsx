import { Editor, useEditorState } from "@tiptap/react";

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
  // Subscribe to editor state changes reactively (official TipTap pattern)
  const editorState = useEditorState({
    editor,
    selector: (ctx) => ({
      isBold: ctx.editor?.isActive("bold") ?? false,
      isItalic: ctx.editor?.isActive("italic") ?? false,
      isUnderline: ctx.editor?.isActive("underline") ?? false,
      isStrike: ctx.editor?.isActive("strike") ?? false,
      isH1: ctx.editor?.isActive("heading", { level: 1 }) ?? false,
      isH2: ctx.editor?.isActive("heading", { level: 2 }) ?? false,
      isH3: ctx.editor?.isActive("heading", { level: 3 }) ?? false,
      isBulletList: ctx.editor?.isActive("bulletList") ?? false,
      isOrderedList: ctx.editor?.isActive("orderedList") ?? false,
      isTaskList: ctx.editor?.isActive("taskList") ?? false,
      isBlockquote: ctx.editor?.isActive("blockquote") ?? false,
      isCodeBlock: ctx.editor?.isActive("codeBlock") ?? false,
      canUndo: ctx.editor?.can().undo() ?? false,
      canRedo: ctx.editor?.can().redo() ?? false,
    }),
  });

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
        className={buttonClass(editorState?.isBold)}
        title="Bold (Cmd+B)"
      >
        <strong>B</strong>
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={buttonClass(editorState?.isItalic)}
        title="Italic (Cmd+I)"
      >
        <em>I</em>
      </button>
      <button
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={buttonClass(editorState?.isUnderline)}
        title="Underline (Cmd+U)"
      >
        <u>U</u>
      </button>
      <button
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={buttonClass(editorState?.isStrike)}
        title="Strikethrough"
      >
        <s>S</s>
      </button>

      {divider}

      {/* Headings */}
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={buttonClass(editorState?.isH1)}
        title="Heading 1"
      >
        H1
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={buttonClass(editorState?.isH2)}
        title="Heading 2"
      >
        H2
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={buttonClass(editorState?.isH3)}
        title="Heading 3"
      >
        H3
      </button>

      {divider}

      {/* Lists */}
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={buttonClass(editorState?.isBulletList)}
        title="Bullet List"
      >
        &bull; List
      </button>
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={buttonClass(editorState?.isOrderedList)}
        title="Numbered List"
      >
        1. List
      </button>
      <button
        onClick={() => editor.chain().focus().toggleTaskList().run()}
        className={buttonClass(editorState?.isTaskList)}
        title="Task List"
      >
        &#9744; Tasks
      </button>

      {divider}

      {/* Block Elements */}
      <button
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={buttonClass(editorState?.isBlockquote)}
        title="Quote"
      >
        &ldquo; Quote
      </button>
      <button
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={buttonClass(editorState?.isCodeBlock)}
        title="Code Block"
      >
        {"</>"}
      </button>

      {divider}

      {/* Undo/Redo */}
      <button
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editorState?.canUndo}
        className={`${buttonClass()} disabled:opacity-50 disabled:cursor-not-allowed`}
        title="Undo (Cmd+Z)"
      >
        Undo
      </button>
      <button
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editorState?.canRedo}
        className={`${buttonClass()} disabled:opacity-50 disabled:cursor-not-allowed`}
        title="Redo (Cmd+Shift+Z)"
      >
        Redo
      </button>
    </div>
  );
}
