# API Reference

This section contains detailed API documentation for all Layers modules. The documentation is auto-generated from TSDoc comments using [TypeDoc](https://typedoc.org/).

## Modules

### Platform Abstraction

The platform layer provides a unified API across Web, Tauri, and Capacitor:

| Module | Description |
|--------|-------------|
| [PlatformAdapter](/api/generated/lib/platform/interfaces/PlatformAdapter) | Core interface for platform operations |
| [detectPlatform](/api/generated/lib/platform/functions/detectPlatform) | Runtime platform detection |
| [getPlatformAdapter](/api/generated/lib/platform/functions/getPlatformAdapter) | Get singleton adapter instance |

**Quick Example:**

```typescript
import { getPlatformAdapter } from '@/lib/platform';

const platform = getPlatformAdapter();

console.log(`Platform: ${platform.getPlatform()}`);
console.log(`Is Native: ${platform.isNative()}`);
console.log(`Is Online: ${platform.isOnline()}`);
```

### Supabase Client

Backend integration for auth, database, and realtime:

| Module | Description |
|--------|-------------|
| [getSupabase](/api/generated/lib/supabase/functions/getSupabase) | Get Supabase client instance |
| [signInWithEmail](/api/generated/lib/supabase/functions/signInWithEmail) | Email/password authentication |
| [User](/api/generated/lib/supabase/interfaces/User) | User type definition |

**Quick Example:**

```typescript
import { getSupabase, signInWithOAuth } from '@/lib/supabase';

// Sign in with Google
await signInWithOAuth('google');

// Query data
const supabase = getSupabase();
const { data } = await supabase.from('notes').select('*');
```

### Sync Engine

Offline-first synchronization with Yjs CRDTs:

| Module | Description |
|--------|-------------|
| [LayersSyncProvider](/api/generated/lib/sync/classes/LayersSyncProvider) | Real-time document sync with Yjs |
| [OfflineSyncQueue](/api/generated/lib/sync/classes/OfflineSyncQueue) | Queued operations for offline mode |
| [getOfflineSyncQueue](/api/generated/lib/sync/functions/getOfflineSyncQueue) | Get queue instance for user |

**Quick Example:**

```typescript
import { LayersSyncProvider } from '@/lib/sync';

const provider = new LayersSyncProvider({
  noteId: 'note-123',
  userId: 'user-456',
  onSyncStateChange: (state) => console.log('Sync:', state.synced)
});

await provider.connect();
const doc = provider.getDoc();
```

### React Hooks

Reusable hooks for common operations:

| Hook | Description |
|------|-------------|
| [useAuth](/api/generated/hooks/functions/useAuth) | Authentication state and actions |
| [useAutoSave](/api/generated/hooks/functions/useAutoSave) | Debounced auto-save for editor |
| [useCollaborativeEditor](/api/generated/hooks/functions/useCollaborativeEditor) | TipTap editor with Yjs |

**Quick Example:**

```tsx
import { useAuth, useCollaborativeEditor } from '@/hooks';

function App() {
  const { user, signInWithGoogle, logout } = useAuth();
  const { editor, syncState, isOnline } = useCollaborativeEditor({
    noteId: 'note-123',
    userId: user?.id,
    userName: user?.email
  });

  return <EditorContent editor={editor} />;
}
```

## Type Conventions

All modules follow these TypeScript conventions:

- **Interfaces** describe object shapes (e.g., `PlatformAdapter`)
- **Types** define unions and primitives (e.g., `Platform`)
- **Generics** are used for flexible APIs (e.g., `select<T>()`)

## Error Handling

Most async functions throw on error. Use try/catch:

```typescript
try {
  await signInWithEmail(email, password);
} catch (error) {
  console.error('Login failed:', error.message);
}
```

## Next Steps

- Explore individual module documentation in the sidebar
- View [Components](/components/) for UI documentation
- Check [Storybook](http://localhost:6006) for interactive examples
