[**Layers API v0.1.0**](../../../README.md)

***

[Layers API](../../../README.md) / [lib/sync](../README.md) / LayersSyncProvider

# Class: LayersSyncProvider

Defined in: src/lib/sync/yjs-provider.ts:158

Yjs provider that syncs documents between local storage and Supabase.

## Remarks

This provider implements a hybrid sync strategy optimized for offline-first
editing with real-time collaboration support:

**Offline Support**:
- All changes are immediately persisted to IndexedDB
- Changes are queued for sync when offline
- Automatic sync when connectivity is restored

**Real-time Collaboration**:
- Uses Supabase Realtime broadcast for instant updates
- Presence tracking for collaborator awareness
- Conflict-free merging via Yjs CRDTs

**Architecture**:
```
TipTap Editor
     ↓
Yjs Document
     ↓
LayersSyncProvider
     ├── IndexedDB (local)
     ├── Supabase Realtime (live sync)
     └── Supabase PostgreSQL (snapshots)
```

## Example

```typescript
import { LayersSyncProvider } from '@/lib/sync';
import { useEditor } from '@tiptap/react';
import Collaboration from '@tiptap/extension-collaboration';

// Create the provider
const provider = new LayersSyncProvider({
  noteId: noteId,
  userId: userId,
  onSyncStateChange: setSyncState,
});

await provider.connect();

// Use with TipTap
const editor = useEditor({
  extensions: [
    StarterKit,
    Collaboration.configure({
      document: provider.getDoc(),
      fragment: provider.getContent(),
    }),
  ],
});

// Clean up
useEffect(() => {
  return () => provider.destroy();
}, []);
```

## Constructors

### Constructor

> **new LayersSyncProvider**(`options`): `LayersSyncProvider`

Defined in: src/lib/sync/yjs-provider.ts:191

Creates a new sync provider for a note.

#### Parameters

##### options

`ProviderOptions`

Provider configuration options

#### Returns

`LayersSyncProvider`

#### Example

```typescript
const provider = new LayersSyncProvider({
  noteId: 'note-123',
  userId: currentUser.id,
  onSyncStateChange: (state) => {
    if (state.error) showToast('Sync failed');
  },
});
```

## Methods

### connect()

> **connect**(): `Promise`\<`void`\>

Defined in: src/lib/sync/yjs-provider.ts:226

Connects to local and remote storage.

#### Returns

`Promise`\<`void`\>

#### Remarks

This method:
1. Sets up IndexedDB persistence (works immediately, even offline)
2. If online, fetches and merges server state
3. If online, establishes real-time sync channel

#### Example

```typescript
const provider = new LayersSyncProvider({ noteId, userId });

try {
  await provider.connect();
  console.log('Connected and ready');
} catch (error) {
  console.error('Failed to connect:', error);
}
```

***

### destroy()

> **destroy**(): `void`

Defined in: src/lib/sync/yjs-provider.ts:665

Destroys the provider and cleans up resources.

#### Returns

`void`

#### Remarks

Call this when unmounting the editor or switching notes.
Failure to call destroy will result in memory leaks and
zombie realtime connections.

#### Example

```typescript
// In React
useEffect(() => {
  const provider = new LayersSyncProvider({ noteId, userId });
  provider.connect();

  return () => {
    provider.destroy();
  };
}, [noteId]);
```

***

### getContent()

> **getContent**(): `YXmlFragment`

Defined in: src/lib/sync/yjs-provider.ts:288

Gets the document content as a Yjs XmlFragment for TipTap.

#### Returns

`YXmlFragment`

XmlFragment containing the document content

#### Remarks

TipTap's Collaboration extension uses XmlFragment for rich text.
This is the recommended way to integrate with TipTap.

#### Example

```typescript
import Collaboration from '@tiptap/extension-collaboration';

const editor = useEditor({
  extensions: [
    StarterKit,
    Collaboration.configure({
      document: provider.getDoc(),
      fragment: provider.getContent(),
    }),
  ],
});
```

***

### getDoc()

> **getDoc**(): `Doc`

Defined in: src/lib/sync/yjs-provider.ts:260

Gets the Yjs document.

#### Returns

`Doc`

The underlying Yjs document

#### Remarks

Use this to access the raw Yjs document for advanced operations
or integration with TipTap's Collaboration extension.

#### Example

```typescript
const doc = provider.getDoc();

// Access a shared type
const yText = doc.getText('content');

// Use with TipTap
Collaboration.configure({
  document: doc,
});
```

***

### getSyncState()

> **getSyncState**(): `SyncState`

Defined in: src/lib/sync/yjs-provider.ts:640

Gets the current sync state.

#### Returns

`SyncState`

Current sync state (copy)

#### Example

```typescript
const state = provider.getSyncState();

if (state.syncing) {
  showSpinner();
} else if (state.synced) {
  showCheckmark();
} else if (state.error) {
  showError(state.error);
}
```
