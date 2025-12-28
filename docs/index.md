---
layout: home

hero:
  name: Layers
  text: Cross-Platform Rich Text Editor
  tagline: Built with Tauri, React, TipTap, and Supabase for offline-first real-time collaboration
  actions:
    - theme: brand
      text: Get Started
      link: /guide/
    - theme: alt
      text: View on GitHub
      link: https://github.com/your-org/layers

features:
  - icon: 🖥️
    title: Cross-Platform
    details: Single codebase for Web, macOS, Windows, iOS, and Android using Tauri (desktop) and Capacitor (mobile)
  - icon: 📴
    title: Offline-First
    details: Works completely offline with automatic sync when connection is restored using Yjs CRDTs
  - icon: 👥
    title: Real-Time Collaboration
    details: Multiple users can edit the same document simultaneously with live cursors and presence
  - icon: ⚡
    title: Lightning Fast
    details: Tauri's Rust backend delivers 10x smaller bundles and 5x faster startup than Electron
---

## Quick Start

```bash
# Clone the repository
git clone https://github.com/your-org/layers.git
cd layers

# Install dependencies
pnpm install

# Start development server
pnpm dev

# Run on desktop (Tauri)
pnpm tauri dev
```

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React + TipTap)                │
├─────────────────────────────────────────────────────────────┤
│                Platform Abstraction Layer                    │
├──────────────┬──────────────┬───────────────────────────────┤
│   Web        │   Tauri      │   Capacitor                   │
│   IndexedDB  │   SQLite     │   SQLite                      │
│   localStorage│  Store      │   Preferences                 │
└──────────────┴──────────────┴───────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Supabase Backend                           │
│  PostgreSQL │ Realtime │ Auth │ Storage │ Edge Functions    │
└─────────────────────────────────────────────────────────────┘
```

## Documentation Sections

- **[Guide](/guide/)** - Getting started, installation, and core concepts
- **[API Reference](/api/)** - Detailed API documentation for all modules
- **[Components](/components/)** - React component documentation with Storybook
- **[Reference](/reference/)** - Research, benchmarks, and setup guides
