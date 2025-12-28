[**Layers API v0.1.0**](../../README.md)

***

[Layers API](../../README.md) / [hooks](../README.md) / useCollaborativeEditor

# Function: useCollaborativeEditor()

> **useCollaborativeEditor**(`options`): `UseCollaborativeEditorReturn`

Defined in: src/hooks/useCollaborativeEditor.ts:233

React hook for creating a collaborative TipTap editor.

## Parameters

### options

`UseCollaborativeEditorOptions`

Editor configuration options

## Returns

`UseCollaborativeEditorReturn`

Editor instance and collaboration state

## Remarks

This hook orchestrates:

**TipTap Extensions**:
- StarterKit (paragraphs, headings, lists, etc.)
- Underline, TaskList, TaskItem
- Placeholder text
- Yjs Collaboration (real-time sync)
- CollaborationCursor (show other users' cursors)

**Sync Provider**:
- Manages Yjs document
- Syncs with IndexedDB (local persistence)
- Syncs with Supabase Realtime (live collaboration)
- Tracks online/offline status

**Lifecycle**:
- Creates provider and editor on mount
- Destroys provider and editor on unmount
- Recreates when noteId or userId changes

## Example

```tsx
function NoteEditor({ noteId }: Props) {
  const { user } = useAuth();

  const {
    editor,
    syncState,
    isOnline,
    collaborators,
    reconnect,
  } = useCollaborativeEditor({
    noteId,
    userId: user.id,
    userName: user.display_name,
    placeholder: 'Start writing your note...',
  });

  if (!editor) {
    return <EditorSkeleton />;
  }

  return (
    <div>
      <EditorToolbar editor={editor} />
      <EditorContent editor={editor} />
      <StatusBar>
        {syncState.syncing && <span>Syncing...</span>}
        {syncState.error && (
          <button onClick={reconnect}>Retry</button>
        )}
        {collaborators.length > 0 && (
          <span>{collaborators.length} collaborators</span>
        )}
      </StatusBar>
    </div>
  );
}
```

## See

 - [LayersSyncProvider](../../lib/sync/classes/LayersSyncProvider.md) for the underlying sync implementation
 - [useAutoSave](useAutoSave.md) for saving content separately
