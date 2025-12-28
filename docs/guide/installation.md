# Installation

This guide covers setting up the Layers development environment for all platforms.

## Prerequisites

- **Node.js** 18+ (we recommend using [fnm](https://github.com/Schniz/fnm) or [nvm](https://github.com/nvm-sh/nvm))
- **pnpm** 8+ (`npm install -g pnpm`)
- **Rust** (for Tauri desktop) - [Install Rust](https://rustup.rs/)
- **Xcode** (for iOS/macOS) - Mac App Store
- **Android Studio** (for Android) - [Download](https://developer.android.com/studio)

## Quick Start

```bash
# Clone the repository
git clone https://github.com/your-org/layers.git
cd layers

# Install dependencies
pnpm install

# Start web development server
pnpm dev
```

## Platform-Specific Setup

### Web Development

No additional setup required. Just run:

```bash
pnpm dev
```

Open [http://localhost:1420](http://localhost:1420) in your browser.

### macOS / Windows (Tauri)

1. Install Tauri prerequisites:

```bash
# macOS
xcode-select --install

# Windows (run in PowerShell as Admin)
# See WINDOWS_SETUP.md for detailed instructions
```

2. Run the desktop app:

```bash
pnpm tauri dev
```

### iOS (Capacitor)

1. Install CocoaPods:

```bash
sudo gem install cocoapods
```

2. Build and open in Xcode:

```bash
pnpm build
pnpm cap:sync
pnpm cap:ios
```

3. In Xcode, select your device and click Run.

### Android (Capacitor)

1. Open Android Studio and install SDK components.

2. Build and open:

```bash
pnpm build
pnpm cap:sync
pnpm cap:android
```

3. In Android Studio, select your device and click Run.

## Supabase Setup

1. Create a project at [supabase.com](https://supabase.com)

2. Run the database migration:

```bash
# Install Supabase CLI
brew install supabase/tap/supabase

# Login (opens browser)
supabase login

# Link to your project
supabase link --project-ref <your-project-id>

# Push migrations
supabase db push
```

3. Copy credentials:

```bash
supabase status
```

4. Create `.env` file:

```bash
cp .env.example .env
```

5. Fill in the values from `supabase status`:

```env
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

## Verify Installation

Run the type checker to ensure everything is set up correctly:

```bash
pnpm tsc --noEmit
```

## Next Steps

- [Architecture Guide](/guide/architecture) - Understand how the system works
- [API Reference](/api/) - Explore the codebase
