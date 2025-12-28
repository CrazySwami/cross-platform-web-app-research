# Layers - Cross-Platform Rich Text Editor

## Web-First Architecture

Layers follows a **Web-First** approach: one React codebase runs everywhere. Native platforms wrap the web app, meaning **testing the web app effectively tests all platforms**.

```
                    ┌─────────────────────────────────────┐
                    │         React + TipTap (Web)        │
                    │      The SAME code everywhere       │
                    └─────────────────────────────────────┘
                                      │
           ┌──────────────────────────┼──────────────────────────┐
           │                          │                          │
           ▼                          ▼                          ▼
    ┌─────────────┐           ┌─────────────┐           ┌─────────────┐
    │   Browser   │           │    Tauri    │           │  Capacitor  │
    │  (Web/PWA)  │           │  (Desktop)  │           │  (Mobile)   │
    └─────────────┘           └─────────────┘           └─────────────┘
           │                          │                          │
           ▼                          ▼                          ▼
    ┌─────────────┐     ┌─────────────────────┐     ┌─────────────────┐
    │   Linux     │     │  macOS  │  Windows  │     │  iOS  │ Android │
    │  (Chrome)   │     │ (WebKit)│ (WebView2)│     │(WKWeb)│(WebView)│
    └─────────────┘     └─────────────────────┘     └─────────────────┘
```

## 6 Platform Coverage

| Platform | Runtime | Browser Engine | Test Coverage |
|----------|---------|----------------|---------------|
| **Web/Linux** | Browser | Chromium | `--project=chromium` |
| **macOS** | Tauri | WebKit | `--project=webkit` |
| **Windows** | Tauri | WebView2 (Chromium) | `--project=chromium` |
| **iOS** | Capacitor | WKWebView (WebKit) | `--project=webkit` |
| **Android** | Capacitor | WebView (Chromium) | `--project=chromium` |
| **Firefox** | Browser | Gecko | Optional (add if needed) |

### Why This Works

- **Tauri on macOS** uses WebKit (same as Safari) → Test with `webkit`
- **Tauri on Windows** uses WebView2 (Chromium-based) → Test with `chromium`
- **Capacitor on iOS** uses WKWebView (WebKit) → Test with `webkit`
- **Capacitor on Android** uses WebView (Chromium-based) → Test with `chromium`

**By testing Chromium + WebKit, we cover all 6 platforms.**

## Tech Stack

### Core (Web)
- **React 19** - UI framework
- **TipTap v3** - Rich text editor (ProseMirror-based)
- **Tailwind CSS v4** - Styling
- **TypeScript** - Type safety
- **Vite** - Bundler and dev server

### Platform Wrappers
- **Tauri v2** - Desktop wrapper (macOS, Windows, Linux)
  - Minimal overhead, uses system WebView
  - Rust backend for native features
- **Capacitor** - Mobile wrapper (iOS, Android)
  - Native plugins for device features
  - Same web code, native shell

### Data & Sync
- **Yjs** - CRDT for real-time collaboration
- **Supabase** - Backend (auth, database, realtime)
- **IndexedDB** - Local persistence (y-indexeddb)

## Development Commands

```bash
# Development
pnpm dev              # Start Vite dev server (web)
pnpm tauri dev        # Start Tauri dev (desktop)

# Building
pnpm build            # Build web
pnpm tauri build      # Build desktop apps
pnpm cap:build:ios    # Build iOS
pnpm cap:build:android # Build Android

# Testing
pnpm test:e2e                    # Full suite (Chromium + WebKit)
pnpm test:e2e --project=chromium # Fast: Chrome/Windows/Android/Linux
pnpm test:e2e --project=webkit   # Fast: Safari/macOS/iOS

# Documentation
pnpm storybook        # Component development
pnpm docs:dev         # VitePress docs
pnpm docs:api         # TypeDoc API docs
```

## Testing Strategy

### Browser Testing = Platform Testing

```
Playwright Tests
       │
       ├─► chromium ──► Chrome, Edge, Windows, Android, Linux
       │
       └─► webkit ────► Safari, macOS, iOS

       (optional)
       └─► firefox ───► Firefox (add if needed)
```

### Current E2E Coverage

| Test File | Tests | Coverage |
|-----------|-------|----------|
| `blocks.spec.ts` | 11 | Blockquotes, code blocks |
| `editor.spec.ts` | 8 | Core editor functionality |
| `formatting.spec.ts` | 10 | Bold, italic, underline, strike |
| `headings.spec.ts` | 10 | H1, H2, H3 |
| `history.spec.ts` | 13 | Undo/redo |
| `keyboard-shortcuts.spec.ts` | 13 | Cmd+B, Cmd+I, etc. |
| `lists.spec.ts` | 12 | Bullet, numbered, task lists |
| `toolbar.spec.ts` | 20 | Toolbar buttons and states |
| **Total** | **97** | Per browser (194 total) |

### Running Tests

```bash
# Fast iteration (covers Chrome/Windows/Android/Linux)
pnpm test:e2e --project=chromium

# Safari/macOS/iOS coverage
pnpm test:e2e --project=webkit

# Full 6-platform coverage
pnpm test:e2e

# Debug failures
pnpm exec playwright show-trace test-results/[test]/trace.zip
```

## Project Structure

```
layers/
├── src/
│   ├── components/
│   │   ├── Editor.tsx      # TipTap editor wrapper
│   │   └── Toolbar.tsx     # Formatting toolbar
│   ├── hooks/              # Custom React hooks
│   └── lib/                # Utilities and adapters
├── e2e/                    # Playwright E2E tests
│   └── fixtures/           # Test helpers
├── src-tauri/              # Tauri desktop config (Rust)
├── ios/                    # Capacitor iOS (when initialized)
├── android/                # Capacitor Android (when initialized)
├── docs/                   # VitePress documentation
└── .storybook/             # Storybook config
```

## Available Skills (Slash Commands)

### Testing Flow
```
/test-all       # Full suite: e2e, visual, builds, review
/test-e2e       # Playwright (Chromium + WebKit = 6 platforms)
/test-unit      # Vitest unit tests
/test-visual    # Storybook interaction tests
/test-builds    # Verify platform builds compile
/test-review    # AI code review
/test-debug     # Debug failures with screenshots/traces
```

### TDD Workflow
```
/red            # Write ONE failing test
/green          # Minimal implementation to pass
/refactor       # Improve while keeping tests green
/cycle          # Complete Red → Green → Refactor
```

### Git & Planning
```
/commit         # Create commit following standards
/pr             # Create pull request
/issue          # Analyze GitHub issue → TDD plan
/plan           # Create implementation plan
```

## Platform-Specific Code

When you need platform-specific behavior:

```typescript
// Detect Tauri (desktop)
import { isTauri } from '@tauri-apps/api/core';
if (await isTauri()) {
  // Desktop-specific code (file system, native dialogs)
}

// Detect Capacitor (mobile)
import { Capacitor } from '@capacitor/core';
if (Capacitor.isNativePlatform()) {
  // Mobile-specific code (push notifications, haptics)
}

// Web fallback (always available)
// Standard web APIs work everywhere
```

## Key Testing Patterns

### 1. Triple-click for block selection
```typescript
// DON'T: Meta+a selects entire editor
await editor.page.keyboard.press('Meta+a');

// DO: Triple-click selects just the block
await editor.editor.locator('h1').click({ clickCount: 3 });
```

### 2. Preserve selection for shortcuts
```typescript
// pressShortcut() does NOT click first (preserves selection)
await editor.selectAll();
await editor.pressShortcut('Meta+b'); // Selection preserved
```

### 3. TipTap Enter behavior
```typescript
// Enter in code blocks exits the block (by design)
// Type content first, then convert to code block
await editor.type('const x = 1;');
await editor.selectAll();
await editor.clickToolbarButton('Code Block');
```

## Configuration Files

| File | Purpose |
|------|---------|
| `playwright.config.ts` | E2E test config (Chromium + WebKit) |
| `src-tauri/tauri.conf.json` | Tauri desktop config |
| `capacitor.config.json` | Capacitor mobile config |
| `vite.config.ts` | Vite bundler config |
| `.storybook/main.ts` | Storybook config |
| `typedoc.json` | API documentation config |

## Quality Gates

### Pre-Commit
- [ ] TypeScript compiles (`pnpm tsc --noEmit`)
- [ ] E2E tests pass (`pnpm test:e2e --project=chromium`)

### Pre-Release
- [ ] Full E2E suite passes (Chromium + WebKit)
- [ ] Web build succeeds (`pnpm build`)
- [ ] Tauri compiles (`cargo check` in src-tauri)
- [ ] Bundle size reasonable (< 1MB target)
