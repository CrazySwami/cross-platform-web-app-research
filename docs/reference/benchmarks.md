# Performance Benchmarking Guide

This document describes how to measure and compare the performance of this Tauri TipTap Editor against Electron equivalents.

## Quick Start

```bash
# Build release version first
pnpm tauri build

# Run benchmarks
cd benchmarks
./bundle-size.sh
./memory-benchmark.sh "TipTap Editor" 60
./startup-benchmark.sh
```

## Metrics Overview

| Metric | Expected Tauri | Typical Electron | How to Measure |
|--------|----------------|------------------|----------------|
| Bundle Size | 5-10 MB | 100-200 MB | `./bundle-size.sh` |
| Idle Memory | 30-60 MB | 200-400 MB | `./memory-benchmark.sh` |
| Startup Time | 200-500 ms | 1-3 seconds | `./startup-benchmark.sh` |

## Detailed Benchmarking

### 1. Bundle Size

```bash
# After building
pnpm tauri build

# Check sizes
cd benchmarks
./bundle-size.sh
```

**Manual check:**
```bash
# macOS App Bundle
du -sh src-tauri/target/release/bundle/macos/*.app

# DMG Installer
ls -lh src-tauri/target/release/bundle/dmg/*.dmg

# Raw binary
ls -lh src-tauri/target/release/tauri-tiptap-editor
```

### 2. Memory Usage

```bash
# Start the app first, then run:
./memory-benchmark.sh "TipTap Editor" 60

# Or manually with Activity Monitor:
# 1. Open Activity Monitor
# 2. Search for "TipTap Editor"
# 3. Monitor Memory column
```

**Using ps command:**
```bash
# Find process
pgrep -f "TipTap Editor"

# Get memory stats
ps aux | grep "TipTap Editor"

# Continuous monitoring
while true; do
  ps -p $(pgrep -f "TipTap Editor") -o pid,rss,vsz,%mem,%cpu 2>/dev/null
  sleep 1
done
```

### 3. Startup Time

```bash
# Using hyperfine (recommended)
brew install hyperfine
hyperfine --warmup 3 'open -a "TipTap Editor"'

# Or use our script
./startup-benchmark.sh

# Manual timing
time open -a "TipTap Editor"
```

### 4. WebView Performance (DevTools)

Open DevTools in the app (Cmd+Option+I or right-click → Inspect):

```javascript
// First Contentful Paint
performance.getEntriesByName('first-contentful-paint')[0]?.startTime

// Navigation timing
performance.getEntriesByType('navigation')[0]

// Custom editor initialization timing
performance.mark('editor-start');
// ... after editor loads ...
performance.mark('editor-end');
performance.measure('editor-init', 'editor-start', 'editor-end');
console.log(performance.getEntriesByName('editor-init')[0].duration);
```

## iOS Benchmarking

### Using Xcode Instruments

1. Build iOS app: `pnpm tauri ios build`
2. Open Xcode
3. Product → Profile (Cmd+I)
4. Select template:
   - **Allocations**: Memory usage
   - **Time Profiler**: CPU usage
   - **Energy Log**: Battery impact
   - **Leaks**: Memory leak detection

### iOS Memory Limits

| Device | Approx. Memory Limit |
|--------|---------------------|
| iPhone 6s | ~650 MB |
| iPhone 7/8 | ~1.3 GB |
| iPhone X+ | ~2-3 GB |
| iPad | 2-5 GB |

## Comparison Methodology

To fairly compare Tauri vs Electron:

1. **Create identical apps** with same functionality
2. **Same test environment**: Close other apps, restart before testing
3. **Multiple runs**: Run each test 5+ times, take average
4. **Cold vs Warm**: Test both cold start (after restart) and warm start

### Comparison Template

| Metric | Tauri | Electron | Difference |
|--------|-------|----------|------------|
| App Bundle | _ MB | _ MB | _x smaller |
| DMG/Installer | _ MB | _ MB | _x smaller |
| Idle Memory | _ MB | _ MB | _x less |
| Peak Memory | _ MB | _ MB | _x less |
| Cold Start | _ ms | _ ms | _x faster |
| Warm Start | _ ms | _ ms | _x faster |
| Idle CPU | _ % | _ % | _x less |

## Optimization Tips

### Reduce Bundle Size

```toml
# src-tauri/Cargo.toml
[profile.release]
opt-level = "z"     # Optimize for size
lto = true          # Link-time optimization
codegen-units = 1   # Better optimization
strip = true        # Strip symbols
panic = "abort"     # Smaller binary
```

### Reduce Memory Usage

- Use virtual scrolling for large documents
- Lazy load TipTap extensions
- Clean up event listeners
- Code split the frontend

### Improve Startup Time

- Minimize frontend bundle
- Use Vite's code splitting
- Defer non-critical initialization
- Pre-compile Rust dependencies

## Automated CI Benchmarks

Add to `.github/workflows/benchmark.yml`:

```yaml
name: Performance Benchmarks

on: [push, pull_request]

jobs:
  benchmark:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
      - name: Install Rust
        uses: dtolnay/rust-action@stable
      - name: Build
        run: pnpm install && pnpm tauri build
      - name: Measure Bundle Size
        run: |
          cd benchmarks
          ./bundle-size.sh
```
