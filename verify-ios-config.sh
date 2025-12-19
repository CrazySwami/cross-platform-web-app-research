#!/bin/bash
# Verification script for iOS build configuration

echo "🔍 Verifying iOS Build Configuration..."
echo ""

# Check 1: Xcode project exists and has our fix
echo "Check 1: Xcode Build Script Fix"
if grep -q "TAURI_ENV_DEBUG=false" src-tauri/gen/apple/tauri-tiptap-editor.xcodeproj/project.pbxproj; then
    echo "  ✅ Build script has TAURI_ENV_DEBUG fix"
else
    echo "  ❌ Build script is missing the fix"
    echo "     Run: ./build-ios-release.sh to regenerate"
fi
echo ""

# Check 2: Info.plist is clean
echo "Check 2: Info.plist Configuration"
if grep -qi "localhost\|1420" src-tauri/gen/apple/tauri-tiptap-editor_iOS/Info.plist; then
    echo "  ⚠️  Info.plist contains dev server references"
    echo "     This might cause issues. Consider regenerating."
else
    echo "  ✅ Info.plist is clean (no dev server references)"
fi
echo ""

# Check 3: Frontend is built
echo "Check 3: Frontend Build"
if [ -f "dist/index.html" ]; then
    DIST_SIZE=$(du -sh dist | cut -f1)
    echo "  ✅ Frontend built (dist/ = $DIST_SIZE)"
else
    echo "  ❌ Frontend not built"
    echo "     Run: pnpm build"
fi
echo ""

# Check 4: tauri.conf.json is correct
echo "Check 4: Tauri Configuration"
if grep -q '"frontendDist": "../dist"' src-tauri/tauri.conf.json; then
    echo "  ✅ frontendDist points to ../dist"
else
    echo "  ⚠️  frontendDist configuration may be incorrect"
fi
echo ""

# Check 5: File timestamps
echo "Check 5: File Timestamps"
XCODE_TIME=$(stat -f "%Sm" -t "%Y-%m-%d %H:%M" src-tauri/gen/apple/tauri-tiptap-editor.xcodeproj/project.pbxproj 2>/dev/null)
CONFIG_TIME=$(stat -f "%Sm" -t "%Y-%m-%d %H:%M" src-tauri/tauri.conf.json 2>/dev/null)
echo "  📅 Xcode project:   $XCODE_TIME"
echo "  📅 Tauri config:    $CONFIG_TIME"
if [[ "$XCODE_TIME" > "$CONFIG_TIME" ]]; then
    echo "  ✅ Xcode project is newer (up to date)"
else
    echo "  ⚠️  Config is newer - consider regenerating Xcode project"
fi
echo ""

# Check 6: Rust library exists
echo "Check 6: iOS Library Build"
if [ -f "src-tauri/gen/apple/Externals/arm64/release/libapp.a" ]; then
    LIB_SIZE=$(du -sh src-tauri/gen/apple/Externals/arm64/release/libapp.a | cut -f1)
    LIB_TIME=$(stat -f "%Sm" -t "%Y-%m-%d %H:%M" src-tauri/gen/apple/Externals/arm64/release/libapp.a)
    echo "  ✅ Release library exists ($LIB_SIZE, built $LIB_TIME)"
else
    echo "  ⚠️  No release library found"
    echo "     Will be built when you run ./build-ios-release.sh"
fi
echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Summary:"
if grep -q "TAURI_ENV_DEBUG=false" src-tauri/gen/apple/tauri-tiptap-editor.xcodeproj/project.pbxproj && \
   [ -f "dist/index.html" ] && \
   ! grep -qi "localhost\|1420" src-tauri/gen/apple/tauri-tiptap-editor_iOS/Info.plist; then
    echo "✅ Configuration looks good!"
    echo "   Ready to build with: ./build-ios-release.sh"
else
    echo "⚠️  Some issues detected"
    echo "   Run: ./build-ios-release.sh to fix"
fi
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
