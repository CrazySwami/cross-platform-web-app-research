# Cross-Platform Web App Tech Stack Research

A comprehensive exploration of building cross-platform applications using modern web technologies, comparing different approaches for desktop and mobile deployment.

**📊 See the full comparison:** [STACK_COMPARISON.md](STACK_COMPARISON.md) - Detailed analysis of Tauri vs Electron (both with Capacitor mobile)

## Overview

This repository documents research and experimentation with multiple tech stacks for building a cross-platform rich text editor (TipTap) application that can run on:
- **Web** (browser-based)
- **Desktop** (macOS, Windows, Linux)
- **Mobile** (iOS, Android)

## Tech Stacks Evaluated

### 1. Electron (Desktop)
- **Pros**: Mature, well-documented, extensive ecosystem
- **Cons**: Large bundle size (~200MB), slower startup, higher memory usage
- **Performance**: See [PERFORMANCE_RESULTS.md](PERFORMANCE_RESULTS.md)

### 2. Tauri (Desktop)
- **Pros**: Small bundle size (~10MB), fast startup, low memory usage, Rust backend
- **Cons**: iOS support is experimental and has significant issues (see below)
- **Performance**: Significantly better than Electron in all metrics
- **Recommendation**: ✅ **Excellent for desktop applications**

### 3. Capacitor (Mobile)
- **Pros**: Uses native WebView, good plugin ecosystem, production-ready
- **Cons**: Requires separate codebase from desktop
- **Recommendation**: ✅ **Recommended for mobile deployments**

## Recommended Multi-Platform Architecture

After extensive research and testing, the recommended stack is:

```
┌─────────────────────────────────────────┐
│         Shared Web Codebase             │
│     (React, TipTap, TypeScript)         │
└─────────────────────────────────────────┘
                   │
    ┌──────────────┼──────────────┐
    │              │              │
    ▼              ▼              ▼
┌────────┐  ┌──────────┐  ┌──────────────┐
│  Web   │  │  Desktop │  │    Mobile    │
│ Deploy │  │  (Tauri) │  │ (Capacitor)  │
└────────┘  └──────────┘  └──────────────┘
```

### Why This Stack?

1. **Tauri for Desktop**: Exceptional performance, small bundles, native feel
2. **Capacitor for Mobile**: Production-ready iOS/Android support
3. **Shared Web Code**: Write once, deploy everywhere
4. **@capacitor-community/tauri**: Plugin to bridge Tauri and Capacitor APIs

This approach is **proven in production** by several companies and provides the best balance of performance, maintainability, and user experience.

## Tauri iOS: Critical Issues Encountered

During development, we encountered several **blocking issues** with Tauri 2.0's iOS support:

### Issue 1: Black Screen on Physical Devices

**Problem**: App builds successfully but shows black screen on iPhone with error:
```
Failed to request http://10.223.96.75:1420/: error sending request
```

**Root Cause**:
- Tauri's iOS build system incorrectly uses `devPath` instead of `frontendDist` even in Release mode
- Build script doesn't properly detect Release configuration
- Frontend assets fail to bundle into the app

**Attempted Fixes**:
- ✅ Created automated build script ([build-ios-release.sh](build-ios-release.sh))
- ✅ Set `TAURI_ENV_DEBUG=false` environment variable
- ✅ Pre-built Rust library manually to bypass CLI dependencies
- ✅ Modified Xcode build script to force release mode
- ❌ **Still fails on physical devices**

### Issue 2: PhaseScriptExecution Build Failures

**Problem**: Xcode build fails with:
```
Command PhaseScriptExecution failed with a nonzero exit code
```

**Root Causes**:
1. Tauri CLI's `xcode-script` requires active WebSocket connection
2. User Script Sandboxing (Xcode 14+) blocks build scripts
3. Inconsistent behavior between Simulator and physical devices

**Attempted Fixes**:
- ✅ Disabled User Script Sandboxing (`ENABLE_USER_SCRIPT_SANDBOXING = NO`)
- ✅ Added SRCROOT-based library check to skip rebuilds
- ✅ Started background Tauri dev server for WebSocket
- ❌ **Still unreliable**

### Issue 3: Simulator vs Physical Device Differences

**Key Findings**:
- ✅ iOS Simulator works perfectly
- ❌ Physical devices consistently fail
- Different Rust targets: `aarch64-apple-ios-sim` vs `aarch64-apple-ios`
- Signing and provisioning profile complications
- Asset bundling behaves differently

### Related GitHub Issues

- [#8195](https://github.com/tauri-apps/tauri/issues/8195) - iOS using devPath instead of distDir
- [#10925](https://github.com/tauri-apps/tauri/issues/10925) - PhaseScriptExecution failures

## Performance Comparison

Detailed benchmarks comparing Tauri and Electron (see [PERFORMANCE_RESULTS.md](PERFORMANCE_RESULTS.md)):

| Metric | Tauri | Electron | Winner |
|--------|-------|----------|--------|
| Bundle Size | ~10MB | ~200MB | 🏆 Tauri (20x smaller) |
| Startup Time | ~0.5s | ~2-3s | 🏆 Tauri (4-6x faster) |
| Memory Usage | ~150MB | ~300-400MB | 🏆 Tauri (2-3x less) |
| Runtime Performance | Fast | Fast | Tie |

**Conclusion**: Tauri significantly outperforms Electron for desktop applications.

## Build Scripts & Documentation

This repository includes several helper scripts and guides:

### Scripts

- **[build-ios-release.sh](build-ios-release.sh)**: Automated iOS release build
  - Cleans artifacts
  - Builds frontend
  - Sets correct environment variables
  - Provides deployment instructions

- **[verify-ios-config.sh](verify-ios-config.sh)**: Configuration verification
  - Checks Xcode build script
  - Verifies Info.plist
  - Validates frontend build
  - Confirms file timestamps

### Documentation

- **[iOS-BUILD-GUIDE.md](iOS-BUILD-GUIDE.md)**: Comprehensive iOS build troubleshooting
  - Problem description
  - Root cause analysis
  - Step-by-step solutions
  - Verification procedures
  - Troubleshooting tips

- **[PERFORMANCE_RESULTS.md](PERFORMANCE_RESULTS.md)**: Benchmark data and analysis

## Project Structure

```
tauri-tiptap-editor/
├── src/                      # React frontend source
├── dist/                     # Built frontend assets (shared)
├── src-tauri/               # Tauri Rust backend (Desktop)
│   ├── src/                 # Rust source code
│   ├── Cargo.toml           # Rust dependencies
│   ├── tauri.conf.json      # Tauri configuration
│   └── gen/apple/           # Generated Xcode project (Tauri iOS)
├── ios/                     # Capacitor iOS project (Mobile)
│   └── App/                 # Xcode workspace
├── android/                 # Capacitor Android project (Mobile)
│   └── app/                 # Android Studio project
├── capacitor.config.json    # Capacitor configuration
├── build-ios-release.sh     # Tauri iOS build automation
├── verify-ios-config.sh     # Configuration checker
└── iOS-BUILD-GUIDE.md       # Tauri iOS troubleshooting guide
```

## How to Build

### Web Version
```bash
pnpm install
pnpm dev          # Development server
pnpm build        # Production build
```

### Desktop Version (Tauri)
```bash
pnpm install
pnpm tauri dev    # Development
pnpm tauri build  # Production build
```

**macOS Build Output**: ~10MB app in `src-tauri/target/release/bundle/macos/`

### iOS Version (Experimental - Not Recommended)

⚠️ **Warning**: Tauri iOS support is experimental and has critical issues. Use Capacitor instead.

If you still want to attempt it:
```bash
# Install iOS dependencies
rustup target add aarch64-apple-ios
brew install cocoapods

# Initialize iOS project
pnpm tauri ios init

# Run automated build (may fail)
./build-ios-release.sh

# Or build in Xcode
open src-tauri/gen/apple/tauri-tiptap-editor.xcodeproj
```

See [iOS-BUILD-GUIDE.md](iOS-BUILD-GUIDE.md) for detailed troubleshooting.

### Mobile Version (Capacitor) - ✅ Recommended

**This is the recommended approach for mobile deployment** as it's production-ready and works reliably on both iOS and Android.

#### Setup (Already Done)
Capacitor has been integrated into this repository. The setup includes:
- iOS and Android platforms configured
- Build scripts added to package.json
- Shared `dist/` folder for web assets

#### Build and Run

**iOS:**
```bash
# Build frontend and open in Xcode
pnpm run cap:build:ios

# Or manually:
pnpm build              # Build frontend
npx cap sync ios        # Sync assets to iOS project
npx cap open ios        # Open in Xcode
```

Then in Xcode:
1. Select your device or simulator
2. Press Cmd+R to build and run

**Android:**
```bash
# Build frontend and open in Android Studio
pnpm run cap:build:android

# Or manually:
pnpm build              # Build frontend
npx cap sync android    # Sync assets to Android project
npx cap open android    # Open in Android Studio
```

Then in Android Studio:
1. Select your device or emulator
2. Click Run

#### Why Capacitor Works Better Than Tauri iOS

- ✅ **Stable and production-ready** - Used by thousands of apps in production
- ✅ **Consistent behavior** - Works same on simulator and physical devices
- ✅ **Mature plugin ecosystem** - Native features available as plugins
- ✅ **Better documentation** - Extensive guides and community support
- ✅ **No build script issues** - Standard iOS/Android build tools
- ✅ **Active development** - Regular updates and bug fixes

## Key Takeaways

### ✅ What Works Well

1. **Tauri Desktop**: Production-ready, excellent performance
2. **Shared Web Codebase**: React components work across all platforms
3. **TipTap Editor**: Rich text editing works consistently everywhere
4. **Development Experience**: Fast iteration with hot reload

### ❌ What Doesn't Work

1. **Tauri iOS on Physical Devices**: Critical bugs, not production-ready
2. **iOS Simulator**: Works but not representative of real-world deployment
3. **Xcode Integration**: Fragile, requires manual intervention

### 🎯 Recommendations

1. **For Desktop**: Use Tauri - it's production-ready and performant
2. **For Mobile**: Use Capacitor - it's mature and reliable
3. **For Web**: Deploy standard React build
4. **Architecture**: Single codebase with platform-specific wrappers

## Migration Path to Production

To productionize this research:

1. **Keep the Web App**: Already works, no changes needed
2. **Keep Tauri Desktop**: Works excellently, just need signing/notarization
3. **Add Capacitor for Mobile**:
   ```bash
   npm install @capacitor/core @capacitor/cli
   npx cap init
   npx cap add ios
   npx cap add android
   ```
4. **Install Tauri-Capacitor Bridge** (optional):
   ```bash
   npm install @capacitor-community/tauri
   ```

## Rust Configuration

The `Cargo.toml` is optimized for release builds:

```toml
[profile.release]
opt-level = "z"        # Optimize for size
lto = true             # Link-time optimization
codegen-units = 1      # Better optimization
strip = true           # Remove debug symbols
panic = "abort"        # Smaller panic handler
```

This achieves the remarkably small bundle sizes seen in benchmarks.

## Conclusion

This research demonstrates that **Web + Tauri Desktop + Capacitor Mobile** is a viable, production-ready architecture for cross-platform applications. While Tauri's iOS support shows promise, it's not yet stable enough for production use. The combination of Tauri (desktop) and Capacitor (mobile) provides the best user experience while maintaining code reuse.

## Resources

- [Tauri Documentation](https://tauri.app/)
- [Capacitor Documentation](https://capacitorjs.com/)
- [TipTap Editor](https://tiptap.dev/)
- [@capacitor-community/tauri](https://github.com/capacitor-community/tauri)

## License

MIT

---

**Note**: This repository serves as technical research and documentation. The iOS build issues are well-documented for future reference and to help others avoid the same pitfalls.
