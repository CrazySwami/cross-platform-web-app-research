# Offline-First Sync

Layers uses a two-tier sync strategy:
1. **Yjs** for real-time collaborative editing (CRDTs)
2. **Offline Queue** for metadata and non-collaborative data

## Yjs and CRDTs

### What is a CRDT?

CRDT (Conflict-free Replicated Data Type) is a data structure that can be replicated across multiple computers, edited independently, and merged automatically without conflicts.

```
User A (San Francisco)          User B (New York)
        │                               │
        ▼                               ▼
  "Hello World"                   "Hello World"
        │                               │
  Types " beautiful"              Types "!"
        │                               │
        ▼                               ▼
  "Hello beautiful World"         "Hello World!"
        │                               │
        └───────────┬───────────────────┘
                    │
                    ▼ (merge)
           "Hello beautiful World!"
```

### LayersSyncProvider

The `LayersSyncProvider` orchestrates Yjs document synchronization:

```typescript
import { LayersSyncProvider } from '@/lib/sync';

const provider = new LayersSyncProvider({
  noteId: 'note-123',
  userId: 'user-456',
  onSyncStateChange: (state) => {
    console.log('Sync state:', state);
    // { synced: true, syncing: false, error: null, lastSyncAt: Date }
  },
  onAwarenessUpdate: (states) => {
    // Other users' presence information
    console.log('Collaborators:', states);
  },
});

// Connect to sync provider
await provider.connect();

// Get the Yjs document for TipTap
const yDoc = provider.getDoc();
```

### Integration with TipTap

The `useCollaborativeEditor` hook integrates Yjs with TipTap:

```typescript
import { useCollaborativeEditor } from '@/hooks';

function NoteEditor({ noteId }) {
  const { user } = useAuth();

  const {
    editor,        // TipTap editor instance
    syncState,     // { synced, syncing, error, lastSyncAt }
    isOnline,      // Network status
    collaborators, // List of other editors
    reconnect,     // Manual reconnect function
  } = useCollaborativeEditor({
    noteId,
    userId: user.id,
    userName: user.display_name,
    userColor: '#3B82F6',
    placeholder: 'Start typing...',
  });

  return (
    <div>
      {syncState.syncing && <SyncIndicator />}
      <CollaboratorAvatars users={collaborators} />
      <EditorContent editor={editor} />
    </div>
  );
}
```

### Sync Flow

```
1. User types in editor
        │
        ▼
2. TipTap generates transaction
        │
        ▼
3. Yjs Collaboration extension intercepts
        │
        ▼
4. Yjs document updated (local)
        │
        ├───────────────────────┐
        │                       │
        ▼                       ▼
5a. IndexedDB persistence   5b. Supabase Broadcast
    (y-indexeddb)               (Realtime channel)
                                    │
                                    ▼
                            6. Other clients receive
                                    │
                                    ▼
                            7. Yjs merge + TipTap update
```

## Offline Queue

For non-collaborative data (user profile, folder structure, note metadata), we use an offline queue.

### How It Works

```typescript
import { getOfflineSyncQueue } from '@/lib/sync';

const queue = getOfflineSyncQueue(userId);

// Enqueue an operation
await queue.enqueue(
  'note',           // Entity type
  'note-123',       // Entity ID
  'update',         // Operation: 'create' | 'update' | 'delete'
  {                 // Payload
    id: 'note-123',
    title: 'Updated Title',
    updated_at: new Date().toISOString(),
  }
);
```

### Queue Storage

The queue is persisted in IndexedDB:

```typescript
interface QueueItem {
  id: string;           // Unique queue item ID
  entityType: string;   // 'note' | 'folder' | 'profile'
  entityId: string;     // ID of the entity
  operation: string;    // 'create' | 'update' | 'delete'
  payload: unknown;     // Data to sync
  createdAt: Date;      // When queued
  retries: number;      // Retry count
}
```

### Processing the Queue

When the device comes online, the queue processes automatically:

```typescript
class OfflineSyncQueue {
  private async processQueue(): Promise<SyncResult> {
    const items = await this.getPendingItems();
    const results = { synced: 0, failed: 0 };

    for (const item of items) {
      try {
        await this.processItem(item);
        await this.markSynced(item.id);
        results.synced++;
      } catch (error) {
        await this.incrementRetries(item.id);
        results.failed++;
      }
    }

    return results;
  }

  private async processItem(item: QueueItem) {
    const supabase = getSupabase();

    switch (item.operation) {
      case 'create':
        await supabase.from(item.entityType).insert(item.payload);
        break;
      case 'update':
        await supabase
          .from(item.entityType)
          .update(item.payload)
          .eq('id', item.entityId);
        break;
      case 'delete':
        await supabase
          .from(item.entityType)
          .delete()
          .eq('id', item.entityId);
        break;
    }
  }
}
```

### Auto-Save Integration

The `useAutoSave` hook uses the offline queue:

```typescript
import { useAutoSave } from '@/hooks';

function NoteEditor({ noteId, userId }) {
  const editor = useEditor({ /* ... */ });

  const { state, saveNow } = useAutoSave({
    editor,
    noteId,
    userId,
    debounceMs: 2000,  // Wait 2 seconds after last edit
    enabled: true,
  });

  return (
    <div>
      <EditorContent editor={editor} />
      <StatusBar>
        {state.isSaving && 'Saving...'}
        {state.pendingChanges && 'Unsaved changes'}
        {state.lastSavedAt && `Saved ${formatTime(state.lastSavedAt)}`}
        {state.error && <Error>{state.error}</Error>}
      </StatusBar>
      <Button onClick={saveNow}>Save Now</Button>
    </div>
  );
}
```

## Network Status

Both sync mechanisms respond to network status changes:

```typescript
import { getPlatformAdapter } from '@/lib/platform';

const platform = getPlatformAdapter();

// Check current status
const isOnline = platform.isOnline();

// Subscribe to changes
const unsubscribe = platform.onOnlineStatusChange((online) => {
  if (online) {
    // Trigger sync
    syncQueue.processQueue();
    yjsProvider.reconnect();
  }
});
```

## Conflict Resolution

### Yjs (Document Content)

Yjs handles conflicts automatically using its CRDT algorithm. No manual intervention needed.

### Offline Queue (Metadata)

For metadata conflicts, we use "last write wins" with timestamps:

```typescript
// Server-side (Supabase function or RLS policy)
UPDATE notes
SET title = new_title
WHERE id = note_id
  AND updated_at < new_updated_at;  -- Only update if newer
```

## Debugging

Enable debug logging:

```typescript
// In development
localStorage.setItem('layers:sync:debug', 'true');

// View queue status
const queue = getOfflineSyncQueue(userId);
const pending = await queue.getPendingItems();
console.log('Pending sync items:', pending);

// View Yjs provider state
const state = provider.getSyncState();
console.log('Sync state:', state);
```

## Next Steps

- [Authentication](/guide/auth) - User authentication with Supabase
- [API: LayersSyncProvider](/api/generated/lib/sync/classes/LayersSyncProvider) - Full API docs
- [API: OfflineSyncQueue](/api/generated/lib/sync/classes/OfflineSyncQueue) - Queue API docs
