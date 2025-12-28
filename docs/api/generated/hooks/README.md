[**Layers API v0.1.0**](../README.md)

***

[Layers API](../README.md) / hooks

# hooks

React hooks for the Layers application.

## Remarks

This module exports the core React hooks used throughout the app:

- **useAuth**: Authentication state and actions
- **useAutoSave**: Debounced auto-save for editor content
- **useCollaborativeEditor**: Real-time collaborative TipTap editor

## Example

```tsx
import { useAuth, useAutoSave, useCollaborativeEditor } from '@/hooks';

function NoteEditor({ noteId }: Props) {
  const { user, isAuthenticated } = useAuth();

  const { editor, syncState, collaborators } = useCollaborativeEditor({
    noteId,
    userId: user.id,
    userName: user.display_name,
  });

  const { state: saveState } = useAutoSave({
    editor,
    noteId,
    userId: user.id,
  });

  if (!isAuthenticated) return <LoginPrompt />;

  return (
    <div>
      <EditorContent editor={editor} />
      <SyncStatus synced={syncState.synced} saved={saveState.lastSavedAt} />
      <CollaboratorList users={collaborators} />
    </div>
  );
}
```

## Functions

- [useAuth](functions/useAuth.md)
- [useAutoSave](functions/useAutoSave.md)
- [useCollaborativeEditor](functions/useCollaborativeEditor.md)
