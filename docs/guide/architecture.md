# Architecture

Layers is built on a layered architecture that separates platform concerns from business logic, enabling a single codebase to run on Web, Desktop (Tauri), and Mobile (Capacitor).

## High-Level Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        React UI                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Components (Editor, Toolbar)                         │   │
│  │  Hooks (useAuth, useAutoSave, useCollaborativeEditor) │   │
│  └──────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│                    Platform Abstraction                      │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  PlatformAdapter Interface                              │ │
│  │  ├── WebAdapter (IndexedDB, LocalStorage)               │ │
│  │  ├── TauriAdapter (SQLite, Filesystem, Notifications)   │ │
│  │  └── CapacitorAdapter (SQLite, Preferences, Push)       │ │
│  └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│                      Sync Engine                             │
│  ┌─────────────────┐  ┌─────────────────────────────────┐   │
│  │  Yjs Provider   │  │  Offline Queue                   │   │
│  │  (Real-time)    │  │  (Pending operations)            │   │
│  └─────────────────┘  └─────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│                      Supabase Backend                        │
│  PostgreSQL │ Auth │ Realtime │ Storage                      │
└─────────────────────────────────────────────────────────────┘
```

## Design Principles

### 1. Offline-First

Every user action is saved locally first, then synced in the background:

```typescript
// User types in editor
editor.on('update', async () => {
  // 1. Save to local database (instant)
  await localDb.save(content);

  // 2. Queue for sync (background)
  await syncQueue.enqueue('update', noteId, content);

  // 3. Sync when online (automatic)
  // Handled by OfflineSyncQueue
});
```

This ensures:
- Zero latency on user actions
- App works fully offline
- No data loss even with poor connectivity

### 2. Platform Abstraction

All platform-specific code is behind a unified interface:

```typescript
// src/lib/platform/types.ts
interface PlatformAdapter {
  // Storage
  getDatabase(name: string): Promise<DatabaseAdapter>;
  getPreferences(): PreferencesAdapter;

  // Features
  showNotification(options: NotificationOptions): Promise<void>;
  isOnline(): boolean;
  onOnlineStatusChange(callback: (online: boolean) => void): () => void;
}
```

At runtime, the correct adapter is automatically selected:

```typescript
// src/lib/platform/detect.ts
const platform = detectPlatform();
// Returns: 'web' | 'tauri' | 'capacitor'
```

### 3. CRDT-Based Collaboration

Real-time collaboration uses Yjs, a CRDT (Conflict-free Replicated Data Type) library:

```typescript
// Multiple users editing the same document
User A: "Hello |World"  // Cursor after Hello
User B: "Hello World|"  // Cursor after World

// Simultaneous edits
User A types: " beautiful"
User B types: "!"

// Yjs merges automatically:
"Hello beautiful World!"
```

Benefits:
- No conflict resolution needed
- Works offline, merges when online
- Preserves user intent

## Data Flow

### 1. Local Edit Flow

```
User Input
    │
    ▼
TipTap Editor
    │
    ├──────────────────────────────┐
    │                              │
    ▼                              ▼
Yjs Document              useAutoSave Hook
(CRDT updates)                  │
    │                              │
    ▼                              ▼
IndexedDB               Supabase (when online)
(persistence)           (cloud backup)
```

### 2. Sync Flow

```
Online Status Change
    │
    ▼
OfflineSyncQueue.processQueue()
    │
    ▼
┌─────────────────────────────┐
│ For each pending operation: │
│   1. Send to Supabase       │
│   2. Mark as synced         │
│   3. Update local state     │
└─────────────────────────────┘
    │
    ▼
All clients receive updates via
Supabase Realtime
```

### 3. Collaboration Flow

```
User A edits document
    │
    ▼
Yjs generates update
    │
    ├─────────────────────────────┐
    │                             │
    ▼                             ▼
IndexedDB                 Supabase Broadcast
(local persistence)       Channel (yjs-sync)
                                  │
                                  ▼
                          User B receives
                                  │
                                  ▼
                          Yjs merges update
                                  │
                                  ▼
                          TipTap re-renders
```

## Key Components

### Editor Stack

| Component | Purpose |
|-----------|---------|
| `TipTap` | Rich text editor framework |
| `StarterKit` | Basic formatting (bold, italic, lists) |
| `TaskList` / `TaskItem` | Checkable task lists |
| `Collaboration` | Yjs integration for TipTap |
| `CollaborationCursor` | Show other users' cursors |

### Sync Stack

| Component | Purpose |
|-----------|---------|
| `LayersSyncProvider` | Orchestrates Yjs + Supabase |
| `OfflineSyncQueue` | Queues operations when offline |
| `Supabase Realtime` | WebSocket broadcast channel |

### Storage Stack

| Platform | Database | Key-Value |
|----------|----------|-----------|
| Web | IndexedDB | LocalStorage |
| Tauri | SQLite | tauri-plugin-store |
| Capacitor | SQLite | @capacitor/preferences |

## Next Steps

- [Platform Abstraction](/guide/platform) - How platform detection works
- [Sync Engine](/guide/sync) - Deep dive into Yjs and offline queue
- [Authentication](/guide/auth) - Supabase auth integration
