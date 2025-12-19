#!/bin/bash
# Tauri iOS Release Build Script
# This script properly builds and packages the iOS app for physical devices

set -e  # Exit on any error

echo "🚀 Starting Tauri iOS Release Build..."
echo ""

# Step 1: Clean previous artifacts
echo "📦 Step 1/5: Cleaning previous build artifacts..."
rm -rf src-tauri/gen/apple/build
rm -rf src-tauri/target/aarch64-apple-ios/release
echo "✅ Cleaned build directories"
echo ""

# Step 2: Build frontend
echo "🔨 Step 2/5: Building frontend assets..."
pnpm build
echo "✅ Frontend built to dist/"
echo ""

# Step 3: Verify dist folder has content
echo "🔍 Step 3/5: Verifying frontend build..."
if [ ! -f "dist/index.html" ]; then
    echo "❌ Error: dist/index.html not found!"
    echo "Frontend build may have failed."
    exit 1
fi
echo "✅ Found index.html in dist/"
echo ""

# Step 4: Set up Rust environment and build iOS
echo "🦀 Step 4/5: Building Tauri iOS app (this may take a few minutes)..."
source ~/.cargo/env
export PATH="$HOME/.cargo/bin:/opt/homebrew/bin:/usr/local/bin:/usr/bin:$PATH"
export TAURI_ENV_DEBUG=false  # Force release mode

# Build the iOS app
pnpm tauri ios build

echo "✅ iOS build completed"
echo ""

# Step 5: Provide next steps
echo "📱 Step 5/5: Next steps to deploy to your iPhone..."
echo ""
echo "Option A - Using Xcode (Recommended):"
echo "  1. Open: src-tauri/gen/apple/tauri-tiptap-editor.xcodeproj"
echo "  2. Product → Clean Build Folder"
echo "  3. Select your iPhone from device dropdown"
echo "  4. Ensure scheme is set to 'Release' (Product → Scheme → Edit Scheme)"
echo "  5. Press Cmd+R to build and run"
echo ""
echo "Option B - Command line install:"
echo "  1. Connect your iPhone via USB"
echo "  2. Find the built .app file:"
IPA_PATH=$(find src-tauri/gen/apple -name "*.ipa" 2>/dev/null | head -1)
if [ -n "$IPA_PATH" ]; then
    echo "     IPA: $IPA_PATH"
else
    APP_PATH=$(find src-tauri/gen/apple/build -name "TipTap Editor.app" 2>/dev/null | head -1)
    if [ -n "$APP_PATH" ]; then
        echo "     App: $APP_PATH"
        echo "  3. Install using: ios-deploy --bundle \"$APP_PATH\""
    else
        echo "     (Build may need to complete in Xcode first)"
    fi
fi
echo ""
echo "✨ Build script completed successfully!"
