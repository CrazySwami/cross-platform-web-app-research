# iOS Build Guide - Fixing the Black Screen Issue

## The Problem

When building a Tauri 2 iOS app in release mode for physical devices, you might encounter:
- **Black screen** on the iPhone
- Error message: `Failed to request http://10.223.96.75:1420/: error sending request`
- Build errors: `Command PhaseScriptExecution failed with a nonzero exit code`

## Root Cause

The issue occurs because:
1. Tauri's Xcode build script doesn't properly detect Release mode
2. It defaults to "dev mode" behavior, trying to connect to `localhost:1420`
3. Frontend assets (HTML, JS, CSS) don't get bundled into the app

## The Fix

We've implemented two solutions:

### Solution 1: Automated Build Script (Recommended)

Run the automated build script:

```bash
./build-ios-release.sh
```

This script:
- ✅ Cleans previous build artifacts
- ✅ Builds the frontend (`dist/`)
- ✅ Verifies the build
- ✅ Sets `TAURI_ENV_DEBUG=false` to force release mode
- ✅ Builds the iOS app with proper configuration

### Solution 2: Manual Xcode Build

If you prefer to build in Xcode:

1. **First, run the frontend build:**
   ```bash
   pnpm build
   ```

2. **Open Xcode:**
   ```bash
   open src-tauri/gen/apple/tauri-tiptap-editor.xcodeproj
   ```

3. **Clean build folder:**
   - Product → Clean Build Folder (Cmd+Shift+K)

4. **Verify Release configuration:**
   - Product → Scheme → Edit Scheme
   - Select "Run" on the left
   - Change "Build Configuration" to **Release**
   - Click Close

5. **Select your device:**
   - Choose your iPhone from the device dropdown (top left)

6. **Build and run:**
   - Press Cmd+R or click the Play button

## What We Fixed

### 1. Updated Xcode Build Script

The `project.pbxproj` now includes:

```bash
if [ "$CONFIGURATION" = "Release" ] || [ "$CONFIGURATION" = "release" ]; then
  export TAURI_ENV_DEBUG=false
fi
```

This ensures Tauri knows it's a release build and should:
- Bundle assets into the app
- NOT try to connect to dev server
- Use `frontendDist` instead of `devUrl`

### 2. Proper Build Sequence

The build script follows this exact sequence:

1. Clean old artifacts
2. Build frontend → `dist/`
3. Verify `dist/index.html` exists
4. Set environment variables
5. Run `pnpm tauri ios build`

## Verification

After building, verify the app works:

1. **Check the app bundle has assets:**
   ```bash
   ls -la "src-tauri/gen/apple/build/Build/Products/release-iphoneos/TipTap Editor.app/assets/"
   ```
   You should see your JS, CSS, and HTML files.

2. **Check for dev server references (should be none):**
   ```bash
   grep -q "1420" "src-tauri/gen/apple/build/Build/Products/release-iphoneos/TipTap Editor.app/TipTap Editor" && echo "⚠️  Still has dev reference" || echo "✅ Clean release build"
   ```

3. **Install on device:**
   - Via Xcode: Cmd+R with iPhone selected
   - Via command line: `ios-deploy --bundle "path/to/app"`

## Troubleshooting

### Still seeing black screen?

1. **Check dist folder:**
   ```bash
   ls -la dist/
   ```
   Should contain `index.html` and `assets/` folder

2. **Check Info.plist:**
   ```bash
   cat src-tauri/gen/apple/tauri-tiptap-editor_iOS/Info.plist
   ```
   Should NOT contain references to localhost:1420

3. **Force clean everything:**
   ```bash
   rm -rf src-tauri/gen/apple/build
   rm -rf src-tauri/target
   rm -rf dist
   pnpm build
   ./build-ios-release.sh
   ```

### Build fails with WebSocket error?

This means Tauri CLI is trying to connect to a server that isn't running. The fix:
- Use the build script which sets `TAURI_ENV_DEBUG=false`
- OR ensure the Xcode project file has been updated (see "What We Fixed" above)

## Configuration Reference

Your `tauri.conf.json` should have:

```json
{
  "build": {
    "beforeBuildCommand": "pnpm build",
    "devUrl": "http://localhost:1420",
    "frontendDist": "../dist"
  },
  "bundle": {
    "identifier": "com.tauri.tiptap-editor",
    "active": true
  }
}
```

## Related Issues

- [GitHub Issue #8195](https://github.com/tauri-apps/tauri/issues/8195) - iOS using devPath instead of distDir
- [GitHub Issue #10925](https://github.com/tauri-apps/tauri/issues/10925) - PhaseScriptExecution failures

## Summary

The black screen issue was caused by Tauri's iOS build system not properly detecting Release mode, causing it to default to dev server behavior. The fix ensures the `TAURI_ENV_DEBUG=false` environment variable is set, forcing proper release build behavior with bundled assets.

Use the `build-ios-release.sh` script for the most reliable builds!
