# Windows Setup Guide: Tauri Desktop + Capacitor Android

This guide walks you through setting up the development environment on Windows to run:
- **Tauri Desktop** (Windows native app)
- **Capacitor Android** (Mobile app)

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
1. Download "Build Tools for Visual Studio 2022" from https://visualstudio.microsoft.com/downloads/
2. Select "C++ build tools"
3. Ensure these are checked:
   - MSVC v143 - VS 2022 C++ x64/x86 build tools
   - Windows 10/11 SDK

**Verify:**
```powershell
# Should show cl.exe location
where cl
```

### 4. Install WebView2 (for Tauri)

Windows 10/11 usually has this pre-installed. If not:
1. Download from https://developer.microsoft.com/en-us/microsoft-edge/webview2/
2. Run the Evergreen Bootstrapper installer

### 5. Install Android Studio (for Capacitor Android)

**Download and Install:**
1. Download from https://developer.android.com/studio
2. Run installer, use default settings
3. On first launch, complete the setup wizard
4. Install Android SDK, SDK Platform Tools, and Android Emulator

**Set Environment Variables:**

Open PowerShell as Administrator and run:
```powershell
# Set ANDROID_HOME
[System.Environment]::SetEnvironmentVariable("ANDROID_HOME", "$env:LOCALAPPDATA\Android\Sdk", "User")

# Add to PATH
$currentPath = [System.Environment]::GetEnvironmentVariable("Path", "User")
$newPath = "$currentPath;$env:LOCALAPPDATA\Android\Sdk\platform-tools;$env:LOCALAPPDATA\Android\Sdk\tools;$env:LOCALAPPDATA\Android\Sdk\tools\bin"
[System.Environment]::SetEnvironmentVariable("Path", $newPath, "User")
```

Restart your terminal and verify:
```powershell
echo $env:ANDROID_HOME
adb --version
```

### 6. Install Java Development Kit (JDK)

Android requires JDK 11 or higher.

**Option A - Install via Android Studio:**
Android Studio includes a JDK. Find it at:
```
C:\Program Files\Android\Android Studio\jbr
```

Set JAVA_HOME:
```powershell
[System.Environment]::SetEnvironmentVariable("JAVA_HOME", "C:\Program Files\Android\Android Studio\jbr", "User")
```

**Option B - Install Separately:**
1. Download from https://adoptium.net/
2. Install JDK 17 or 21
3. Set JAVA_HOME to installation directory

**Verify:**
```powershell
java -version
```

## Clone and Setup the Project

```powershell
# Navigate to your projects folder
cd C:\Users\YourUsername\Documents

# Clone the repository
git clone https://github.com/CrazySwami/cross-platform-web-app-research.git
cd cross-platform-web-app-research

# Install dependencies
pnpm install
```

## Running Tauri Desktop (Windows)

### Development Mode

```powershell
# Start Tauri in dev mode
pnpm tauri dev
```

This will:
- Start Vite dev server on http://localhost:1420
- Launch the Windows native app
- Enable hot reload for instant updates

**Troubleshooting:**
- If you get "MSVC not found" error, install Visual Studio Build Tools (see Prerequisites)
- If WebView2 error appears, install WebView2 Runtime
- First build takes 5-10 minutes (compiles Rust dependencies)

### Production Build

```powershell
# Build Windows installer
pnpm tauri build
```

Output locations:
- **EXE Installer**: `src-tauri\target\release\bundle\nsis\TipTap Editor_0.1.0_x64-setup.exe`
- **MSI Installer**: `src-tauri\target\release\bundle\msi\TipTap Editor_0.1.0_x64_en-US.msi`
- **Portable EXE**: `src-tauri\target\release\tauri-tiptap-editor.exe`

**Build takes:** 2-5 minutes
**Output size:** ~10-15 MB (much smaller than Electron's ~200 MB!)

## Running Capacitor Android

### Setup Android Virtual Device (AVD)

1. **Open Android Studio**
2. Click "More Actions" → "Virtual Device Manager"
3. Click "Create Device"
4. Select a device (e.g., Pixel 5)
5. Download and select a system image (e.g., Android 13 - API 33)
6. Click "Finish"
7. Start the emulator by clicking the ▶️ play button

### Build and Run Android App

```powershell
# Option 1: One command (recommended)
pnpm run cap:build:android
```

This will:
1. Build the web frontend (`pnpm build`)
2. Sync assets to Android project (`npx cap sync android`)
3. Open Android Studio with the project

**In Android Studio:**
1. Wait for Gradle sync to complete (first time takes 5-10 minutes)
2. Select your emulator or connected device from the dropdown
3. Click the ▶️ Run button (or press Shift+F10)
4. App will install and launch on the device

### Manual Steps (Alternative)

```powershell
# 1. Build the frontend
pnpm build

# 2. Sync to Android project
npx cap sync android

# 3. Open in Android Studio
npx cap open android
```

### Using Physical Android Device

1. **Enable Developer Options on your phone:**
   - Go to Settings → About Phone
   - Tap "Build Number" 7 times
   - Go back to Settings → System → Developer Options
   - Enable "USB Debugging"

2. **Connect via USB:**
   - Connect phone to PC with USB cable
   - Allow USB debugging when prompted on phone
   - Verify connection:
   ```powershell
   adb devices
   ```

3. **Run the app:**
   - In Android Studio, select your device from dropdown
   - Click Run

## Quick Command Reference

### Tauri Desktop (Windows)

```powershell
# Development
pnpm tauri dev

# Production build
pnpm tauri build

# Check Tauri info
pnpm tauri info
```

### Capacitor Android

```powershell
# Build and open
pnpm run cap:build:android

# Manual steps
pnpm build
npx cap sync android
npx cap open android

# Just open Android Studio
npx cap open android

# Sync changes after frontend update
npx cap sync
```

### Web Development (Shared)

```powershell
# Web dev server only
pnpm dev

# Build frontend
pnpm build

# Preview production build
pnpm preview
```

## Project Structure on Windows

```
C:\Users\YourUsername\Documents\cross-platform-web-app-research\
├── src\                      # React frontend source
├── dist\                     # Built frontend (shared by all)
├── src-tauri\               # Tauri Windows backend
│   ├── src\                 # Rust source
│   ├── Cargo.toml           # Rust dependencies
│   ├── tauri.conf.json      # Tauri config
│   └── target\release\      # Windows build output
├── android\                 # Capacitor Android project
│   └── app\                 # Android app
├── ios\                     # Capacitor iOS (macOS only)
└── capacitor.config.json    # Capacitor config
```

## Troubleshooting

### Tauri Issues

**"rustc not found":**
```powershell
# Reinstall Rust
rustup update
rustup default stable
```

**"MSVC not found" or linking errors:**
- Install Visual Studio Build Tools with C++ workload
- Restart terminal after installation

**WebView2 errors:**
- Install WebView2 Runtime from Microsoft
- Update Windows to latest version

**Long build times:**
- First build compiles all dependencies (5-10 min)
- Subsequent builds are much faster (30s-1min)
- Use `pnpm tauri dev` for development (incremental compilation)

### Android Issues

**"ANDROID_HOME not set":**
```powershell
# Check if set
echo $env:ANDROID_HOME

# Should output: C:\Users\YourUsername\AppData\Local\Android\Sdk
# If not, set it (see Prerequisites section)
```

**"sdkmanager not found":**
- Open Android Studio
- Go to Tools → SDK Manager
- Install "Android SDK Command-line Tools"

**Gradle build fails:**
- Open Android Studio
- File → Invalidate Caches → Invalidate and Restart
- Let Gradle sync complete
- Try again

**Emulator won't start:**
- Enable Virtualization in BIOS (VT-x or AMD-V)
- Install Intel HAXM (for Intel CPUs) or enable Hyper-V (Windows 10/11)

**"adb devices" shows no devices:**
- Install Google USB Driver via SDK Manager
- Try different USB cable
- Enable "File Transfer" mode on phone (not just charging)

## Performance Comparison: Windows vs macOS

Based on testing, here's what to expect on Windows:

| Metric | Tauri (Windows) | Notes |
|--------|-----------------|-------|
| Bundle Size | ~12-15 MB | .exe or .msi installer |
| Startup Time | ~0.7-1s | Slightly slower than macOS |
| Memory Usage | ~180-200 MB | WebView2 overhead |
| Build Time | 3-5 min | First build, then ~1 min |

| Metric | Capacitor (Android) | Notes |
|--------|---------------------|-------|
| APK Size | ~8-12 MB | Debug build |
| Startup Time | ~1-2s | Depends on device |
| Memory Usage | ~150-250 MB | Depends on device |
| Build Time | 2-5 min | First build, then faster |

## Next Steps

1. ✅ **Test Tauri Desktop:**
   ```powershell
   pnpm tauri dev
   ```

2. ✅ **Test Android App:**
   ```powershell
   pnpm run cap:build:android
   ```

3. ✅ **Compare with Electron:**
   - See [STACK_COMPARISON.md](STACK_COMPARISON.md) for Electron setup
   - Build both and compare performance

4. ✅ **Read Full Documentation:**
   - [README.md](README.md) - Overview
   - [STACK_COMPARISON.md](STACK_COMPARISON.md) - Detailed comparison
   - [PERFORMANCE_RESULTS.md](PERFORMANCE_RESULTS.md) - Benchmarks

## Windows-Specific Tips

### Using PowerShell vs CMD

This guide uses PowerShell. If using CMD, replace:
- `$env:VARIABLE` with `%VARIABLE%`
- `echo $env:VARIABLE` with `echo %VARIABLE%`

### Using Windows Terminal (Recommended)

Install Windows Terminal from Microsoft Store for better experience:
- Multiple tabs
- Better Unicode support
- Customizable themes

### Antivirus Considerations

Some antivirus software may slow down builds. Consider adding exclusions for:
- Your project folder
- `C:\Users\YourUsername\.cargo`
- `C:\Users\YourUsername\AppData\Local\Android`

### Windows Defender SmartScreen

When running your built `.exe`, Windows may show SmartScreen warning:
- This is normal for unsigned apps
- Click "More info" → "Run anyway"
- For distribution, consider code signing certificate

## Support

- **Tauri Discord**: https://discord.gg/tauri
- **Capacitor Discord**: https://discord.gg/capacitor
- **GitHub Issues**: https://github.com/CrazySwami/cross-platform-web-app-research/issues

## Summary

On Windows, you can run:
- ✅ **Tauri Desktop** - Native Windows app (~12 MB)
- ✅ **Capacitor Android** - Native Android app (~8 MB)
- ✅ **Web** - Browser-based (standard)
- ❌ **Capacitor iOS** - Requires macOS + Xcode

This gives you full desktop (Windows) and mobile (Android) coverage from a Windows development machine!
