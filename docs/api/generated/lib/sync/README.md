[**Layers API v0.1.0**](../../README.md)

***

[Layers API](../../README.md) / lib/sync

# lib/sync

Sync engine for offline-first, real-time collaborative editing.

## Remarks

This module provides the core synchronization infrastructure:

- **LayersSyncProvider**: Yjs-based real-time sync with Supabase
- **OfflineSyncQueue**: CRUD operation queue for offline support

## Example

```typescript
import { LayersSyncProvider, getOfflineSyncQueue } from '@/lib/sync';

// Real-time collaborative editing
const syncProvider = new LayersSyncProvider({
  noteId: 'note-123',
  userId: currentUser.id,
  onSyncStateChange: (state) => updateSyncIndicator(state),
});
await syncProvider.connect();

// Offline-first CRUD operations
const queue = getOfflineSyncQueue(currentUser.id);
await queue.enqueue('note', noteId, 'update', { title: 'New Title' });
```

## Classes

- [LayersSyncProvider](classes/LayersSyncProvider.md)
- [OfflineSyncQueue](classes/OfflineSyncQueue.md)

## Functions

- [getOfflineSyncQueue](functions/getOfflineSyncQueue.md)
