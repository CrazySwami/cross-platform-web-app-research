# Layers: Architecture & Technology Stack

**Project:** Cross-platform collaborative note editor
**Status:** Active Development

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         LAYERS APPLICATION                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                    React + TipTap Editor                           │  │
│  │                    (TypeScript, Tailwind CSS)                      │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                  │                                       │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                  Platform Abstraction Layer                        │  │
│  │              getPlatformAdapter() → unified API                    │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                  │                                       │
│      ┌───────────────┬───────────────────┬─────────────────────┐        │
│      │               │                   │                     │        │
│      ▼               ▼                   ▼                     ▼        │
│  ┌────────┐   ┌──────────────┐   ┌──────────────┐   ┌────────────────┐  │
│  │  Web   │   │    Tauri     │   │  Capacitor   │   │   Supabase     │  │
│  │ (SPA)  │   │   Desktop    │   │   Mobile     │   │   Backend      │  │
│  │        │   │ macOS/Win/Lin│   │  iOS/Android │   │ Auth/DB/Sync   │  │
│  └────────┘   └──────────────┘   └──────────────┘   └────────────────┘  │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

## Technology Decisions

| Layer | Technology | Why |
|-------|------------|-----|
| **Editor** | TipTap 2 + ProseMirror | Extensible, collaborative-ready |
| **Frontend** | React 18 + TypeScript | Type safety, ecosystem |
| **Desktop** | Tauri 2.0 (Rust) | 20x smaller bundles, native performance |
| **Mobile** | Capacitor 8 | Production-ready, native plugins |
| **Styling** | Tailwind CSS | Utility-first, consistent design |
| **Backend** | Supabase | PostgreSQL, Auth, Realtime, Edge Functions |
| **Sync** | Yjs + CRDTs | Conflict-free real-time collaboration |
| **Build** | Vite | Fast HMR, optimized production builds |

## Platform Support

| Platform | Runtime | Storage | Status |
|----------|---------|---------|--------|
| **Web** | Browser | IndexedDB | Ready |
| **macOS** | Tauri (WebKit) | SQLite | Ready |
| **Windows** | Tauri (WebView2) | SQLite | Ready |
| **Linux** | Tauri (WebKitGTK) | SQLite | Ready |
| **iOS** | Capacitor (WKWebView) | SQLite | Ready |
| **Android** | Capacitor (WebView) | SQLite | Ready |

## Key Features

### Offline-First Architecture
- Local-first data storage on all platforms
- Background sync when online
- Conflict resolution via CRDTs (Yjs)
- Offline queue for pending operations

### Real-Time Collaboration
- Yjs document synchronization
- Supabase Realtime for signaling
- Cursor presence and awareness
- Automatic conflict resolution

### Platform Abstraction
```typescript
// Single API for all platforms
const adapter = getPlatformAdapter();

await adapter.getDatabase('notes');      // SQLite (native) or IndexedDB (web)
await adapter.showNotification(opts);    // Native or Web Notifications API
await adapter.readFile(path);            // Native filesystem (desktop only)
```

## Development Tooling

### Documentation
| Tool | Purpose |
|------|---------|
| **VitePress** | Documentation site generator |
| **TypeDoc** | API docs from TSDoc comments |
| **Storybook** | Component visual documentation |

### Testing Pyramid
```
         ┌─────────────┐
         │  Playwright │  ← E2E tests (critical flows)
         │   (E2E)     │
         └─────────────┘
        ┌───────────────┐
        │   Storybook   │  ← Component tests (visual/interaction)
        │   (Visual)    │
        └───────────────┘
       ┌─────────────────┐
       │     Vitest      │  ← Unit tests (functions/hooks)
       │    (Unit)       │
       └─────────────────┘
```

### Commands
```bash
# Development
pnpm dev              # Start Vite dev server
pnpm tauri dev        # Start Tauri desktop
pnpm storybook        # Start Storybook

# Testing
pnpm test:e2e         # Run Playwright E2E tests
pnpm test:e2e:ui      # Playwright with UI
pnpm vitest           # Run unit tests

# Documentation
pnpm docs:dev         # Start VitePress
pnpm docs:api         # Generate API docs
pnpm docs:build       # Build docs site

# Building
pnpm build            # Build web
pnpm tauri build      # Build desktop apps
```

## Project Structure

```
tauri-tiptap-editor/
├── src/
│   ├── components/        # React components
│   │   ├── Editor.tsx
│   │   └── Toolbar.tsx
│   ├── hooks/             # React hooks
│   │   ├── useAuth.ts
│   │   ├── useAutoSave.ts
│   │   └── useCollaborativeEditor.ts
│   └── lib/
│       ├── platform/      # Platform abstraction
│       │   ├── index.ts   # getPlatformAdapter()
│       │   ├── web.ts     # Web implementation
│       │   ├── tauri.ts   # Tauri implementation
│       │   └── capacitor.ts
│       ├── supabase/      # Supabase client
│       └── sync/          # Yjs sync engine
├── src-tauri/             # Tauri/Rust backend
├── ios/                   # Capacitor iOS project
├── android/               # Capacitor Android project
├── e2e/                   # Playwright E2E tests
├── docs/                  # VitePress documentation
├── .storybook/            # Storybook config
├── .claude/               # Claude Code skills/agents
└── supabase/
    └── migrations/        # Database migrations
```

## Why This Stack?

### Why Tauri over Electron?
| Metric | Tauri | Electron |
|--------|-------|----------|
| Bundle Size | ~10 MB | ~200 MB |
| Startup Time | ~0.5s | ~2-3s |
| Memory Usage | ~150 MB | ~300-400 MB |

Tauri provides dramatically better performance for end users.

### Why Capacitor for Mobile?
- Production-ready (used by Burger King, Home Depot, etc.)
- Same React code runs on iOS/Android
- Native plugin ecosystem
- Standard Xcode/Android Studio tooling

### Why Supabase?
- PostgreSQL (not proprietary)
- Built-in Auth with social providers
- Realtime subscriptions
- Edge Functions for serverless
- Self-hostable if needed

### Why Yjs for Sync?
- CRDTs guarantee conflict-free merging
- Works offline (local-first)
- Proven in production (Notion, etc.)
- Small binary format

## Backend Setup

### Supabase Project
- **Project ID:** `fenhyfxbapybmddvhcei`
- **Region:** US East

### Database Schema
Located in `supabase/migrations/001_initial_schema.sql`:
- `profiles` - User profiles
- `notes` - Note metadata
- `note_content` - Yjs document state
- Row Level Security (RLS) enabled

### Environment Variables
```bash
VITE_SUPABASE_URL=https://fenhyfxbapybmddvhcei.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-key>
```

## Roadmap

### Completed
- [x] TipTap editor with rich formatting
- [x] Tauri desktop builds (macOS, Windows, Linux)
- [x] Capacitor mobile builds (iOS, Android)
- [x] Platform abstraction layer
- [x] VitePress documentation site
- [x] Storybook component stories
- [x] Playwright E2E test suite
- [x] Claude Code skills and agents

### In Progress
- [ ] Supabase integration
- [ ] Yjs real-time sync
- [ ] Authentication flow
- [ ] Offline queue

### Planned
- [ ] Note organization (folders/tags)
- [ ] Search functionality
- [ ] Export (PDF, Markdown)
- [ ] Collaboration (shared notes)

## Learn More

- **Tauri:** https://tauri.app/
- **Capacitor:** https://capacitorjs.com/
- **TipTap:** https://tiptap.dev/
- **Supabase:** https://supabase.com/
- **Yjs:** https://docs.yjs.dev/

---

*This document reflects the current architecture of Layers. For detailed guides, see the [documentation site](./tauri-tiptap-editor/docs/).*
