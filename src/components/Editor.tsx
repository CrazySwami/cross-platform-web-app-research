import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Placeholder from "@tiptap/extension-placeholder";
import { useCallback, useState, useEffect } from "react";
import { save, open } from "@tauri-apps/plugin-dialog";
import { readTextFile, writeTextFile } from "@tauri-apps/plugin-fs";
import { Toolbar } from "./Toolbar";

// Add placeholder extension
const PlaceholderExtension = Placeholder.configure({
  placeholder: "Start typing your document here...",
});

export function TipTapEditor() {
  const [currentFilePath, setCurrentFilePath] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      PlaceholderExtension,
    ],
    content: `
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
      <h2>Task List Example</h2>
      <ul data-type="taskList">
        <li data-type="taskItem" data-checked="true">Learn Tauri</li>
        <li data-type="taskItem" data-checked="true">Set up TipTap</li>
        <li data-type="taskItem" data-checked="false">Build something amazing</li>
      </ul>
      <blockquote>
        <p>This editor is built with Tauri v2, React, and TipTap.</p>
      </blockquote>
      <pre><code>// Performance is key!
const tauriApp = "fast and lightweight";</code></pre>
    `,
    editorProps: {
      attributes: {
        class: "tiptap prose prose-sm max-w-none focus:outline-none",
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
      editor.commands.setContent("<p></p>");
      setCurrentFilePath(null);
    }
  }, [editor]);

  const handleOpen = useCallback(async () => {
    try {
      const selected = await open({
        filters: [
          { name: "HTML Files", extensions: ["html", "htm"] },
          { name: "All Files", extensions: ["*"] },
        ],
      });

      if (selected && typeof selected === "string") {
        const content = await readTextFile(selected);
        editor?.commands.setContent(content);
        setCurrentFilePath(selected);
      }
    } catch (error) {
      console.error("Error opening file:", error);
    }
  }, [editor]);

  const handleSave = useCallback(async () => {
    if (!editor) return;

    setIsSaving(true);
    try {
      let filePath = currentFilePath;

      if (!filePath) {
        const selected = await save({
          filters: [{ name: "HTML Files", extensions: ["html"] }],
          defaultPath: "document.html",
        });

        if (selected) {
          filePath = selected;
        }
      }

      if (filePath) {
        const html = editor.getHTML();
        await writeTextFile(filePath, html);
        setCurrentFilePath(filePath);
        setLastSaved(new Date());
      }
    } catch (error) {
      console.error("Error saving file:", error);
    } finally {
      setIsSaving(false);
    }
  }, [editor, currentFilePath]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "o") {
        e.preventDefault();
        handleOpen();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "n") {
        e.preventDefault();
        handleNew();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSave, handleOpen, handleNew]);

  return (
    <div className="flex flex-col h-screen bg-gray-50">
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
              {currentFilePath.split("/").pop()}
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
            {editor?.storage.characterCount?.characters?.() ?? 0} characters
          </span>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto my-8 bg-white rounded-lg shadow-sm border border-gray-200">
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  );
}
