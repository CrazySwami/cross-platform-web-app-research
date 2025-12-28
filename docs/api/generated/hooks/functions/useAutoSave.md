[**Layers API v0.1.0**](../../README.md)

***

[Layers API](../../README.md) / [hooks](../README.md) / useAutoSave

# Function: useAutoSave()

> **useAutoSave**(`options`): `UseAutoSaveReturn`

Defined in: src/hooks/useAutoSave.ts:177

React hook for auto-saving TipTap editor content.

## Parameters

### options

`AutoSaveOptions`

Auto-save configuration

## Returns

`UseAutoSaveReturn`

Auto-save state and manual save function

## Remarks

This hook provides intelligent auto-save behavior:

**Debouncing**:
- Waits for user to stop typing before saving
- Configurable delay via `debounceMs` (default: 2 seconds)

**Offline Support**:
- Detects network status via platform adapter
- Queues changes to offline sync queue when offline
- Changes sync automatically when back online

**Content Extraction**:
- Extracts title from first heading element
- Falls back to first line of text (truncated)
- Extracts plain text for full-text search

**Lifecycle**:
- Saves before page unload to prevent data loss
- Cleans up timers on unmount

## Examples

```tsx
function Editor({ noteId, userId }: Props) {
  const editor = useEditor({ extensions: [StarterKit] });

  const { state, saveNow } = useAutoSave({
    editor,
    noteId,
    userId,
  });

  return (
    <div>
      <Toolbar>
        <Button onClick={saveNow} disabled={state.isSaving}>
          {state.isSaving ? 'Saving...' : 'Save'}
        </Button>
      </Toolbar>
      <EditorContent editor={editor} />
      {state.pendingChanges && <UnsavedIndicator />}
      {state.lastSavedAt && <span>Last saved: {state.lastSavedAt.toLocaleTimeString()}</span>}
    </div>
  );
}
```

```tsx
// Disable auto-save for read-only mode
const { state } = useAutoSave({
  editor,
  noteId,
  userId,
  enabled: !isReadOnly,
});
```

## See

[getOfflineSyncQueue](../../lib/sync/functions/getOfflineSyncQueue.md) for offline sync implementation
