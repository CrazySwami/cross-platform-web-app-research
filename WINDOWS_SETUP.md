# Windows Setup Guide: Tauri Desktop + Capacitor Android

This guide walks you through setting up the development environment on Windows to run:
- **Tauri Desktop** (Windows native app)
- **Capacitor Android** (Mobile app)

## Quick Start Commands

Once everything is installed:

```powershell
# Tauri Desktop (Windows)
pnpm tauri dev           # Development mode
pnpm tauri build         # Production build (~12 MB)

# Capacitor Android
pnpm run cap:build:android    # Build and open in Android Studio
```

## Prerequisites

### 1. Install Node.js and pnpm

**Node.js:**
1. Download from https://nodejs.org/ (LTS version recommended)
2. Run installer, check "Automatically install necessary tools" checkbox
3. Verify installation:
```powershell
node --version
npm --version
```

**pnpm:**
```powershell
npm install -g pnpm
pnpm --version
```

### 2. Install Rust (for Tauri Desktop)

**Using rustup-init.exe:**
1. Download from https://rustup.rs/
2. Run `rustup-init.exe`
3. Choose default installation (option 1)
4. Restart terminal
5. Verify installation:
```powershell
rustc --version
cargo --version
```

### 3. Install Visual Studio Build Tools (for Tauri)

Tauri on Windows requires Microsoft C++ build tools.

**Option A - Visual Studio 2022 Community (Recommended):**
1. Download from https://visualstudio.microsoft.com/downloads/
2. Install with these workloads:
   - ✅ Desktop development with C++
   - ✅ .NET desktop development (optional)

**Option B - Build Tools Only:**
1. Download "Build Tools for Visual Studio 2022"
2. Select "C++ build tools"
3. Ensure these are checked:
   - MSVC v143 - VS 2022 C++ x64/x86 build tools
   - Windows 10/11 SDK

### 4. Install Android Studio (for Capacitor Android)

1. Download from https://developer.android.com/studio
2. Run installer, use default settings
3. On first launch, complete the setup wizard
4. Install Android SDK, SDK Platform Tools, and Android Emulator

**Set Environment Variables (PowerShell as Administrator):**
```powershell
[System.Environment]::SetEnvironmentVariable("ANDROID_HOME", "$env:LOCALAPPDATA\Android\Sdk", "User")

$currentPath = [System.Environment]::GetEnvironmentVariable("Path", "User")
$newPath = "$currentPath;$env:LOCALAPPDATA\Android\Sdk\platform-tools"
[System.Environment]::SetEnvironmentVariable("Path", $newPath, "User")
```

Restart terminal and verify:
```powershell
echo $env:ANDROID_HOME
adb --version
```

### 5. Install Java JDK

Android requires JDK 11 or higher.

**Use JDK from Android Studio:**
```powershell
[System.Environment]::SetEnvironmentVariable("JAVA_HOME", "C:\Program Files\Android\Android Studio\jbr", "User")
```

Verify:
```powershell
java -version
```

## Clone and Setup

```powershell
git clone https://github.com/CrazySwami/cross-platform-web-app-research.git
cd cross-platform-web-app-research
pnpm install
```

## Running Tauri Desktop (Windows)

### Development Mode
```powershell
pnpm tauri dev
```

- Starts Vite dev server
- Launches Windows native app
- Hot reload enabled
- First build takes 5-10 minutes

### Production Build
```powershell
pnpm tauri build
```

**Output:**
- `src-tauri\target\release\bundle\nsis\*.exe` (NSIS installer)
- `src-tauri\target\release\bundle\msi\*.msi` (MSI installer)
- `src-tauri\target\release\tauri-tiptap-editor.exe` (portable)

**Size:** ~10-15 MB (vs Electron's ~200 MB!)

## Running Capacitor Android

### Create Android Emulator

1. Open Android Studio
2. Click "More Actions" → "Virtual Device Manager"  
3. Click "Create Device"
4. Select Pixel 5 → Next
5. Download Android 13 (API 33) → Next → Finish
6. Start emulator with ▶️ button

### Build and Run

```powershell
# One command (recommended)
pnpm run cap:build:android
```

This will:
1. Build frontend
2. Sync to Android project
3. Open Android Studio

**In Android Studio:**
1. Wait for Gradle sync (5-10 min first time)
2. Select emulator from dropdown
3. Click Run ▶️ (Shift+F10)

### Using Physical Device

1. Enable Developer Options on phone (tap Build Number 7 times)
2. Enable USB Debugging
3. Connect via USB
4. Verify: `adb devices`
5. Select device in Android Studio and Run

## Troubleshooting

### Tauri Issues

**"MSVC not found":**
- Install Visual Studio Build Tools with C++ workload
- Restart terminal

**WebView2 errors:**
- Install from https://developer.microsoft.com/en-us/microsoft-edge/webview2/

**Long build times:**
- First build: 5-10 min (normal)
- After: 30s-1min
- Use `pnpm tauri dev` for faster iteration

### Android Issues

**"ANDROID_HOME not set":**
```powershell
echo $env:ANDROID_HOME
# Should output: C:\Users\YourUsername\AppData\Local\Android\Sdk
```

**Gradle fails:**
- File → Invalidate Caches → Restart in Android Studio

**Emulator won't start:**
- Enable Virtualization in BIOS
- Install Intel HAXM or enable Hyper-V

## Performance on Windows

| Metric | Tauri (Windows) | Capacitor (Android) |
|--------|-----------------|---------------------|
| Bundle Size | ~12-15 MB | ~8-12 MB |
| Startup Time | ~0.7-1s | ~1-2s |
| Memory Usage | ~180-200 MB | ~150-250 MB |
| Build Time | 3-5 min (first) | 2-5 min (first) |

## Windows-Specific Tips

### Use Windows Terminal
- Install from Microsoft Store
- Better experience than PowerShell/CMD

### Antivirus Exclusions
Add to exclusions for faster builds:
- Your project folder
- `C:\Users\YourUsername\.cargo`
- `C:\Users\YourUsername\AppData\Local\Android`

### Windows Defender SmartScreen
When running your built `.exe`:
- Click "More info" → "Run anyway"
- Normal for unsigned apps

## What You Can Build on Windows

✅ **Tauri Desktop** - Native Windows app  
✅ **Capacitor Android** - Native Android app  
✅ **Web** - Browser-based  
❌ **Capacitor iOS** - Requires macOS + Xcode

Full desktop (Windows) and mobile (Android) coverage from Windows!

## Documentation

- [README.md](README.md) - Project overview
- [STACK_COMPARISON.md](STACK_COMPARISON.md) - Tauri vs Electron comparison
- [PERFORMANCE_RESULTS.md](PERFORMANCE_RESULTS.md) - Benchmarks

## Support

- **Tauri Discord**: https://discord.gg/tauri
- **Capacitor Discord**: https://discord.gg/capacitor
- **Repository**: https://github.com/CrazySwami/cross-platform-web-app-research
