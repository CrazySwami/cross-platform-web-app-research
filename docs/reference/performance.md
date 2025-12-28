# Performance Results - Tauri TipTap Editor

**Test Date:** December 17, 2025
**Tauri Version:** 2.9.5

---

## Quick Start - Run Performance Tests

This document contains benchmark results and instructions for reproducing them. Feed this file to an AI assistant to automatically run the benchmarks.

### Prerequisites

| Requirement | Version | Check Command |
|-------------|---------|---------------|
| Node.js | 18+ | `node --version` |
| pnpm | 8+ | `pnpm --version` |
| Rust | 1.70+ | `rustc --version` |
| Xcode | 15+ | `xcodebuild -version` |
| iOS Targets | arm64 | `rustup target list --installed \| grep ios` |

### Install Dependencies

```bash
cd tauri-tiptap-editor

# Install Node dependencies
pnpm install

# Install iOS Rust targets (if not installed)
rustup target add aarch64-apple-ios aarch64-apple-ios-sim x86_64-apple-ios
```

---

## Test Environments

### macOS Desktop

| Component | Details |
|-----------|---------|
| **Platform** | macOS (Apple Silicon) |
| **Build Type** | Release (optimized) |
| **WebView** | WKWebView (Safari engine) |
| **App Location** | `src-tauri/target/release/bundle/macos/TipTap Editor.app` |

### iOS Simulator

| Component | Details |
|-----------|---------|
| **Device** | iPhone 16 Pro Simulator |
| **iOS Version** | 18.3.1 |
| **Build Type** | Debug |
| **Xcode Project** | `src-tauri/gen/apple/tauri-tiptap-editor.xcodeproj` |

### iOS Real Device

| Component | Details |
|-----------|---------|
| **Devices Tested** | iPhone (iOS 26.x) |
| **Build Type** | Debug (for dev) / Release (for benchmarks) |
| **Signing** | Free Apple Developer account (7-day provisioning) |

---

## How to Build & Run

### macOS Desktop

```bash
cd tauri-tiptap-editor

# Development (hot reload)
pnpm tauri dev

# Production build
source ~/.cargo/env && pnpm tauri build

# Run production app
open "src-tauri/target/release/bundle/macos/TipTap Editor.app"
```

### iOS Simulator

```bash
cd tauri-tiptap-editor

# Initialize iOS project (first time only)
pnpm tauri ios init

# Run on simulator (opens Xcode)
pnpm tauri ios dev

# Or specify simulator
pnpm tauri ios dev "iPhone 16 Pro"
```

### iOS Real Device

```bash
cd tauri-tiptap-editor

# Start dev server with network access for physical device
pnpm tauri ios dev --host --open

# In Xcode:
# 1. Select your iPhone from device dropdown (top left)
# 2. Configure signing: Signing & Capabilities → Team → Your Apple ID
# 3. Press Cmd+R to build and run

# Alternative: Build and install via command line
xcodebuild -project src-tauri/gen/apple/tauri-tiptap-editor.xcodeproj \
  -scheme tauri-tiptap-editor_iOS \
  -destination 'generic/platform=iOS' \
  -configuration debug build

# Install to device (requires ios-deploy: brew install ios-deploy)
ios-deploy --bundle /path/to/TipTap\ Editor.app
```

**Note:** For real device testing, the dev server must be accessible over the network. If you see a black screen, build a release version instead which bundles the frontend.

---

## Viewing Logs

### macOS Logs

```bash
# View app logs in terminal
log stream --predicate 'subsystem contains "com.tauri"' --level debug
```

### iOS Simulator Logs

```bash
# Logs appear in Xcode console (View → Debug Area → Activate Console)
# Or use Console.app and filter by "TipTap Editor"
```

### iOS Device Logs

```bash
# Install libimobiledevice
brew install libimobiledevice

# List connected devices
idevice_id -l

# Stream device logs (replace UDID with your device ID)
idevicesyslog -u <UDID> | grep -i "tiptap\|tauri\|webkit"

# Or use Xcode:
# Window → Devices and Simulators → Select device → Open Console
```

---

## Running Benchmarks

### macOS Benchmarks

```bash
cd tauri-tiptap-editor

# Build release first
source ~/.cargo/env && pnpm tauri build

# Run all benchmarks
cd benchmarks
./bundle-size.sh                      # Bundle size analysis
./startup-benchmark.sh                # Startup time (5 iterations)
./memory-benchmark.sh "TipTap Editor" 30  # Memory over 30 seconds
```

### iOS Simulator Benchmarks

```bash
cd tauri-tiptap-editor/benchmarks

# Run iOS benchmark script (builds, installs, measures)
./ios-benchmark.sh "iPhone 16 Pro" 30
```

### iOS Device Benchmarks (Xcode Instruments)

```bash
# Get device UDID
xcrun xctrace list devices

# Profile memory allocations
xctrace record --template 'Allocations' \
  --device <UDID> \
  --time-limit 30s \
  --launch -- com.tauri.tiptap-editor

# Profile CPU/Energy
xctrace record --template 'Time Profiler' \
  --device <UDID> \
  --time-limit 30s \
  --launch -- com.tauri.tiptap-editor
```

---

## Troubleshooting

### Xcode "Command PhaseScriptExecution failed"

The Rust build phase can't find `cargo`. Fix by editing `src-tauri/gen/apple/tauri-tiptap-editor.xcodeproj/project.pbxproj`:

Find the `shellScript` line in the "Build Rust Code" phase and prepend:
```bash
export PATH="$HOME/.cargo/bin:/opt/homebrew/bin:/usr/local/bin:$PATH"
```

### iOS Device Shows Black Screen

The app can't reach the dev server. Either:
1. Ensure Mac and iPhone are on the same WiFi network
2. Check macOS firewall isn't blocking connections
3. Grant Local Network permission (Settings → Privacy → Local Network → TipTap Editor)
4. **Best option**: Build a release version which bundles the frontend:
   - In Xcode: Product → Scheme → Edit Scheme → Run → Build Configuration → **release**
   - Then Cmd+R to build and run

### Local Network Permission Not Appearing

The `NSLocalNetworkUsageDescription` key must be in `src-tauri/gen/apple/tauri-tiptap-editor_iOS/Info.plist`:
```xml
<key>NSLocalNetworkUsageDescription</key>
<string>TipTap Editor needs local network access to connect to the development server.</string>
<key>NSBonjourServices</key>
<array>
    <string>_http._tcp</string>
</array>
```
**Note:** This is only needed for dev mode. Release builds bundle the frontend and don't need network access.

### "Untrusted Developer" on iPhone

Go to **Settings → General → VPN & Device Management** → Tap your developer certificate → **Trust**

### iOS Release Build Shows Black Screen (Empty Assets)

The frontend files may not be copied to the iOS bundle. Check if `src-tauri/gen/apple/assets/` is empty:

```bash
ls -la src-tauri/gen/apple/assets/
```

If empty, manually copy the frontend and rebuild:

```bash
# Build frontend first
pnpm build

# Copy to iOS assets folder
cp -r dist/* src-tauri/gen/apple/assets/

# Rebuild iOS in Xcode (release mode) or via command line:
cd src-tauri/gen/apple
export PATH="$HOME/.cargo/bin:/opt/homebrew/bin:/usr/local/bin:$PATH"
xcodebuild -project tauri-tiptap-editor.xcodeproj \
  -scheme tauri-tiptap-editor_iOS \
  -configuration release \
  -destination 'generic/platform=iOS' \
  -allowProvisioningUpdates build

# Install to device
ios-deploy --bundle "/Users/$USER/Library/Developer/Xcode/DerivedData/tauri-tiptap-editor-*/Build/Products/release-iphoneos/TipTap Editor.app"
```

---

## Summary - All Platforms

| Metric | macOS (Release) | iOS (Estimated Real Device) |
|--------|-----------------|----------------------------|
| **Bundle Size** | 2.8 MB | ~15-20 MB |
| **Memory (Avg)** | 115 MB | ~130-180 MB |
| **Startup** | ~64 ms | ~300-500 ms |
| **CPU (Idle)** | 0% | <1% |

*iOS estimates based on simulator measurements adjusted for real device performance (simulators typically show 30-50% higher memory).*

---

## macOS Performance

**Platform:** macOS (Apple Silicon)
**Build:** Release (optimized)

### Bundle Size

| Metric | Size |
|--------|------|
| **App Bundle (.app)** | **2.8 MB** |
| **DMG Installer** | **1.7 MB** |
| **Raw Binary** | 2.7 MB |
| **Frontend (dist/)** | 580 KB |

### Bundle Breakdown
```
Contents/MacOS/      2.7 MB  (Rust binary)
Contents/Resources/  100 KB  (icons, assets)
Contents/Info.plist  4 KB
```

---

## Startup Time

| Metric | Time |
|--------|------|
| **Average Startup** | **~64 ms** |
| Cold Start (first run) | ~100-150 ms |

*Measured over 5 iterations using `open` command*

---

## Memory Usage

| Metric | Value |
|--------|-------|
| **Average RSS** | **115 MB** |
| **Peak RSS** | **119 MB** |
| Idle CPU | 0% |

*RSS = Resident Set Size (actual physical memory used)*

---

### Comparison vs Electron (Desktop Only)

| Metric | Tauri (This App) | Typical Electron | Improvement |
|--------|------------------|------------------|-------------|
| **Bundle Size** | 2.8 MB | 150-200 MB | **~70x smaller** |
| **DMG/Installer** | 1.7 MB | 80-120 MB | **~60x smaller** |
| **Memory (idle)** | 115 MB | 300-500 MB | **~3-4x less** |
| **Startup** | ~64 ms | 1-3 seconds | **~20x faster** |
| **iOS Support** | ✅ Yes | ❌ No | - |
| **Android Support** | ✅ Yes | ❌ No | - |

*Electron bundles Chromium + Node.js. Tauri uses system WebView (WKWebView on macOS).*

---

## How to Reproduce

```bash
cd tauri-tiptap-editor

# Build release version
source ~/.cargo/env && pnpm tauri build

# Run benchmarks
cd benchmarks
./bundle-size.sh
./startup-benchmark.sh
./memory-benchmark.sh "TipTap Editor" 30
```

---

## iOS Performance

**Device:** iPhone 16 Pro Simulator (iOS 18.3.1)
**Build:** Debug (simulator) / Release estimates for real device

### Bundle Size

| Metric | Simulator (Debug) | Real Device (Release Est.) |
|--------|-------------------|---------------------------|
| **App Bundle (.app)** | 50 MB | **~15-20 MB** |
| Main Binary | 72 KB | ~5-8 MB |
| Debug Symbols | 50 MB | Stripped |

### Startup Time

| Metric | Simulator | Real Device (Est.) |
|--------|-----------|-------------------|
| **Average Startup** | ~200 ms | **~300-500 ms** |
| Cold Start | ~500 ms | ~800 ms |

*iOS cold starts slower due to app signing verification and WKWebView initialization*

### Memory Usage

| Metric | Simulator (Measured) | Real Device (Est.) |
|--------|---------------------|-------------------|
| **App Process (Avg)** | 213.8 MB | **~100-130 MB** |
| **WebKit Process (Avg)** | 49.7 MB | **~30-50 MB** |
| **Total (Avg)** | 263.5 MB | **~130-180 MB** |
| Peak Memory | 441.7 MB | ~250-300 MB |
| Idle CPU | 1.1% | <1% |

*Simulator inflates memory by ~30-50%. Real device uses system WKWebView more efficiently.*

### Comparison vs Mobile Alternatives

| Metric | Tauri iOS (Est.) | Capacitor/Ionic | React Native | Flutter |
|--------|------------------|-----------------|--------------|---------|
| **Bundle Size** | ~15-20 MB | ~20-50 MB | ~20-40 MB | ~15-25 MB |
| **Memory (idle)** | ~130-180 MB | ~150-250 MB | ~100-200 MB | ~80-150 MB |
| **Startup** | ~300-500 ms | ~500-1000 ms | ~300-800 ms | ~200-500 ms |
| **Engine** | System WKWebView | System WKWebView | Native Bridge | Skia (compiled) |

*Note: Electron does not support iOS. Capacitor uses the same WKWebView as Tauri.*

**Sources:**
- [Tauri vs Electron comparison](https://www.gethopp.app/blog/tauri-vs-electron)
- [Capacitor WKWebView memory](https://github.com/ionic-team/capacitor/issues/6887)
- [Apple WKWebView memory limits](https://developer.apple.com/forums/thread/133449)

### How to Run iOS Benchmarks

```bash
cd benchmarks
./ios-benchmark.sh "iPhone 16 Pro" 30
```

Or use Xcode Instruments for detailed profiling:
```bash
xctrace record --template 'Allocations' --device <UDID> --time-limit 30s --launch -- com.tauri.tiptap-editor
```

---

## Optimization Settings

The following Cargo optimizations are enabled in `src-tauri/Cargo.toml`:

```toml
[profile.release]
opt-level = "z"      # Optimize for size
lto = true           # Link-time optimization
codegen-units = 1    # Better optimization
strip = true         # Strip debug symbols
panic = "abort"      # Smaller binary
```

---

## Notes

- Memory includes TipTap/ProseMirror editor overhead (~50-60 MB)
- macOS uses WKWebView (Safari engine) - no bundled browser
- First startup may be slower due to macOS security checks (Gatekeeper)
- Subsequent starts benefit from system caching
