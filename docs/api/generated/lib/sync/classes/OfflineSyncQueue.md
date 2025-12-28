[**Layers API v0.1.0**](../../../README.md)

***

[Layers API](../../../README.md) / [lib/sync](../README.md) / OfflineSyncQueue

# Class: OfflineSyncQueue

Defined in: src/lib/sync/offline-queue.ts:164

Offline sync queue for CRUD operations.

## Remarks

This class provides a robust offline-first sync mechanism:

**How it works**:
1. Operations are queued locally (SQLite on native, localStorage on web)
2. When online, operations are processed in order
3. Failed operations are retried up to `maxRetries` times
4. Permanently failed operations are logged and removed

**Storage**:
- **Native (Tauri/Capacitor)**: Uses SQLite `sync_queue` table
- **Web**: Uses localStorage with user-specific key

**Automatic sync**: The queue automatically processes when:
- Device comes back online
- New item is enqueued while online

## Example

```typescript
import { getOfflineSyncQueue } from '@/lib/sync';

// Get the singleton queue for this user
const queue = getOfflineSyncQueue(userId);

// Create a new note (queued if offline)
await queue.enqueue('note', newNoteId, 'create', {
  id: newNoteId,
  user_id: userId,
  title: 'My Note',
});

// Update a note
await queue.enqueue('note', noteId, 'update', {
  id: noteId,
  title: 'Updated Title',
});

// Delete a note
await queue.enqueue('note', noteId, 'delete', null);

// Check queue status
const pending = await queue.getQueueLength();
console.log(`${pending} operations pending`);

// Clean up when done (e.g., user logout)
queue.destroy();
```

## Constructors

### Constructor

> **new OfflineSyncQueue**(`userId`): `OfflineSyncQueue`

Defined in: src/lib/sync/offline-queue.ts:185

Creates a new offline sync queue for a user.

#### Parameters

##### userId

`string`

User ID to scope the queue to

#### Returns

`OfflineSyncQueue`

#### Remarks

Prefer using [getOfflineSyncQueue](../functions/getOfflineSyncQueue.md) to get a singleton instance.

#### Example

```typescript
const queue = new OfflineSyncQueue(userId);
// ...
queue.destroy(); // Clean up when done
```

## Methods

### clear()

> **clear**(): `Promise`\<`void`\>

Defined in: src/lib/sync/offline-queue.ts:594

Clears all queued items.

#### Returns

`Promise`\<`void`\>

#### Remarks

Use with caution - this permanently removes all pending operations.
Typically used when the user logs out.

#### Example

```typescript
// On user logout
await queue.clear();
queue.destroy();
```

***

### destroy()

> **destroy**(): `void`

Defined in: src/lib/sync/offline-queue.ts:617

Destroys the queue and cleans up listeners.

#### Returns

`void`

#### Remarks

Call this when the user logs out or the app is closing.

#### Example

```typescript
// On user logout
queue.destroy();
```

***

### enqueue()

> **enqueue**\<`T`\>(`entityType`, `entityId`, `operation`, `payload`): `Promise`\<`void`\>

Defined in: src/lib/sync/offline-queue.ts:238

Adds an operation to the queue.

#### Type Parameters

##### T

`T`

#### Parameters

##### entityType

`EntityType`

Type of entity ('note' or 'folder')

##### entityId

`string`

ID of the entity

##### operation

`Operation`

Operation type ('create', 'update', 'delete')

##### payload

`T`

Operation data

#### Returns

`Promise`\<`void`\>

#### Remarks

If online, the operation is immediately processed.
If offline, it's queued for later sync.

#### Example

```typescript
// Create a note
await queue.enqueue('note', noteId, 'create', {
  id: noteId,
  user_id: userId,
  title: 'New Note',
  content_json: editor.getJSON(),
});

// Update a folder
await queue.enqueue('folder', folderId, 'update', {
  id: folderId,
  name: 'Renamed Folder',
});

// Delete a note
await queue.enqueue('note', noteId, 'delete', null);
```

***

### getQueueLength()

> **getQueueLength**(): `Promise`\<`number`\>

Defined in: src/lib/sync/offline-queue.ts:575

Gets the number of pending operations.

#### Returns

`Promise`\<`number`\>

Number of items in the queue

#### Example

```typescript
const pending = await queue.getQueueLength();

if (pending > 0) {
  showBadge(`${pending} pending`);
}
```

***

### processQueue()

> **processQueue**(): `Promise`\<`SyncResult`\>

Defined in: src/lib/sync/offline-queue.ts:309

Processes all queued operations.

#### Returns

`Promise`\<`SyncResult`\>

Result of the sync operation

#### Remarks

Operations are processed in order (FIFO). If an operation fails,
it's retried up to `maxRetries` times before being removed.

This method is automatically called when:
- The device comes back online
- A new item is enqueued while online

#### Example

```typescript
const result = await queue.processQueue();

if (!result.success) {
  showNotification(`${result.failed} sync operations failed`);

  result.errors.forEach(({ id, error }) => {
    console.error(`Operation ${id} failed: ${error}`);
  });
}
```
