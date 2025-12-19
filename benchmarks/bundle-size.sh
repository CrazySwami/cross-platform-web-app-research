#!/bin/bash
# Bundle Size Analysis Script
# Usage: ./bundle-size.sh

echo "=== Tauri TipTap Editor Bundle Size Analysis ==="
echo ""

BUNDLE_PATH="../src-tauri/target/release/bundle"

# macOS App Bundle
if [ -d "$BUNDLE_PATH/macos" ]; then
    echo "=== macOS Bundle ==="
    APP_SIZE=$(du -sh "$BUNDLE_PATH/macos/"*.app 2>/dev/null | cut -f1)
    echo "App Bundle: $APP_SIZE"

    # Detailed breakdown
    echo ""
    echo "Contents breakdown:"
    du -sh "$BUNDLE_PATH/macos/"*.app/Contents/* 2>/dev/null | sort -h
fi

echo ""

# DMG
if [ -d "$BUNDLE_PATH/dmg" ]; then
    echo "=== DMG Installer ==="
    DMG_SIZE=$(ls -lh "$BUNDLE_PATH/dmg/"*.dmg 2>/dev/null | awk '{print $5}')
    echo "DMG Size: $DMG_SIZE"
fi

echo ""

# Binary size
BINARY_PATH="../src-tauri/target/release/tauri-tiptap-editor"
if [ -f "$BINARY_PATH" ]; then
    echo "=== Binary Size ==="
    BINARY_SIZE=$(ls -lh "$BINARY_PATH" | awk '{print $5}')
    echo "Raw Binary: $BINARY_SIZE"
fi

echo ""

# Frontend build
DIST_PATH="../dist"
if [ -d "$DIST_PATH" ]; then
    echo "=== Frontend Build ==="
    DIST_SIZE=$(du -sh "$DIST_PATH" | cut -f1)
    echo "Total: $DIST_SIZE"
    echo ""
    echo "Breakdown:"
    du -sh "$DIST_PATH"/* 2>/dev/null | sort -h
fi

echo ""
echo "=== Comparison Reference ==="
echo "Typical Tauri app: 3-10 MB"
echo "Typical Electron app: 100-200 MB"
