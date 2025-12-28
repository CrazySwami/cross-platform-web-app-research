[**Layers API v0.1.0**](../../../README.md)

***

[Layers API](../../../README.md) / [lib/sync](../README.md) / getOfflineSyncQueue

# Function: getOfflineSyncQueue()

> **getOfflineSyncQueue**(`userId`): [`OfflineSyncQueue`](../classes/OfflineSyncQueue.md)

Defined in: src/lib/sync/offline-queue.ts:650

Gets or creates the singleton offline sync queue for a user.

## Parameters

### userId

`string`

User ID to scope the queue to

## Returns

[`OfflineSyncQueue`](../classes/OfflineSyncQueue.md)

Singleton OfflineSyncQueue instance

## Remarks

If called with a different userId, the existing queue is destroyed
and a new one is created.

## Example

```typescript
import { getOfflineSyncQueue } from '@/lib/sync';

const queue = getOfflineSyncQueue(currentUser.id);

// Queue some operations
await queue.enqueue('note', noteId, 'create', noteData);

// Later, on logout
queue.destroy();
```

## See

[OfflineSyncQueue](../classes/OfflineSyncQueue.md) for the full API
