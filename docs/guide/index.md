# Introduction

Layers is a cross-platform rich text editor built for offline-first real-time collaboration. It runs on all major platforms (Web, macOS, Windows, iOS, Android) from a single TypeScript codebase.

## Why Layers?

Modern note-taking apps often force a choice between:
- **Offline capability** OR real-time sync
- **Desktop performance** OR mobile support
- **Native features** OR cross-platform development

Layers delivers all of these by combining:

| Technology | Purpose |
|------------|---------|
| **Tauri** | Desktop apps (macOS, Windows) - 10x smaller than Electron |
| **Capacitor** | Mobile apps (iOS, Android) - native plugins |
| **React + TipTap** | Rich text editing with extensions |
| **Yjs** | CRDT-based offline-first sync |
| **Supabase** | PostgreSQL, Auth, Realtime, Storage |

## Key Features

### Offline-First Architecture

Every edit is saved locally first, then synced to the cloud:

```
User Edit → Local SQLite/IndexedDB → Sync Queue → Supabase
              (instant save)         (background)   (when online)
```

### Real-Time Collaboration

Multiple users can edit the same document with:
- Live cursors showing who's editing where
- Automatic conflict resolution via Yjs CRDTs
- Presence indicators (who's viewing)

### Platform Abstraction

A unified API works across all platforms:

```typescript
import { getPlatformAdapter } from '@/lib/platform';

const platform = getPlatformAdapter();

// Works on Web, Tauri, and Capacitor
const db = await platform.getDatabase('layers');
await db.execute('INSERT INTO notes (title) VALUES (?)', ['My Note']);
```

## Project Structure

```
src/
├── components/         # React UI components
│   ├── Editor.tsx      # TipTap rich text editor
│   └── Toolbar.tsx     # Formatting toolbar
├── hooks/              # React hooks
│   ├── useAuth.ts      # Authentication
│   ├── useAutoSave.ts  # Auto-save with debouncing
│   └── useCollaborativeEditor.ts  # Yjs collaboration
├── lib/
│   ├── platform/       # Platform abstraction layer
│   ├── supabase/       # Backend client
│   ├── sync/           # Yjs provider and offline queue
│   └── database/       # Local SQLite schema
└── App.tsx             # Root component

src-tauri/              # Tauri (Rust) backend
├── src/lib.rs          # Plugin registration
├── Cargo.toml          # Rust dependencies
└── capabilities/       # Permission configuration

docs/                   # This documentation site
```

## Next Steps

- [Installation](/guide/installation) - Set up the development environment
- [Architecture](/guide/architecture) - Deep dive into the system design
- [API Reference](/api/) - Detailed API documentation
