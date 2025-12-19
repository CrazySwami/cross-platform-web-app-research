#!/bin/bash
# iOS Benchmark Script for Tauri TipTap Editor
# Usage: ./ios-benchmark.sh [device-name] [duration-seconds]

DEVICE_NAME="${1:-iPhone 16 Pro}"
DURATION="${2:-30}"
BUNDLE_ID="com.tauri.tiptap-editor"
LOG_FILE="ios_memory_$(date +%Y%m%d_%H%M%S).csv"

echo "=== iOS Benchmark for TipTap Editor ==="
echo "Device: $DEVICE_NAME"
echo "Duration: ${DURATION}s"
echo "Output: $LOG_FILE"
echo ""

# Get device UDID
UDID=$(xcrun simctl list devices available | grep "$DEVICE_NAME" | grep -o '[A-F0-9-]\{36\}' | head -1)

if [ -z "$UDID" ]; then
    echo "Error: Device '$DEVICE_NAME' not found"
    echo "Available devices:"
    xcrun simctl list devices available | grep -E "iPhone|iPad" | head -10
    exit 1
fi

echo "UDID: $UDID"

# Boot simulator if needed
xcrun simctl boot "$UDID" 2>/dev/null || echo "Simulator already booted"
sleep 2

# Build iOS app for simulator
echo ""
echo "Building iOS app..."
cd "$(dirname "$0")/.."
APP_PATH="src-tauri/gen/apple/build/Build/Products/debug-iphonesimulator/TipTap Editor.app"

if [ ! -d "$APP_PATH" ]; then
    echo "Building app first..."
    cd src-tauri/gen/apple
    xcodebuild -scheme tauri-tiptap-editor_iOS -sdk iphonesimulator -configuration Debug -derivedDataPath build -quiet
    cd ../../..
fi

# Install and launch
echo "Installing app..."
xcrun simctl install "$UDID" "$APP_PATH"

echo "Launching app..."
xcrun simctl terminate "$UDID" "$BUNDLE_ID" 2>/dev/null
sleep 1
xcrun simctl launch "$UDID" "$BUNDLE_ID"
sleep 2

# Get app PID
APP_PID=$(ps aux | grep -i "TipTap Editor" | grep -v grep | grep "$UDID" | awk '{print $2}' | head -1)

if [ -z "$APP_PID" ]; then
    # Fallback: find by bundle
    APP_PID=$(pgrep -f "TipTap Editor" | head -1)
fi

echo "App PID: $APP_PID"

# Create CSV header
cd benchmarks 2>/dev/null || true
echo "timestamp,app_rss_mb,webkit_rss_mb,total_mb,cpu_percent" > "$LOG_FILE"

# Monitor memory
echo ""
echo "Monitoring memory for ${DURATION}s..."
END_TIME=$(($(date +%s) + DURATION))

while [ $(date +%s) -lt $END_TIME ]; do
    TIMESTAMP=$(date +%s)

    # Get app memory
    APP_MEM=$(ps -p "$APP_PID" -o rss= 2>/dev/null | awk '{printf "%.1f", $1/1024}')
    APP_CPU=$(ps -p "$APP_PID" -o %cpu= 2>/dev/null | awk '{print $1}')

    # Get WebKit memory (associated with simulator)
    WEBKIT_MEM=$(ps aux | grep -i "com.apple.WebKit.WebContent" | grep -v grep | head -1 | awk '{printf "%.1f", $6/1024}')

    if [ -n "$APP_MEM" ] && [ -n "$WEBKIT_MEM" ]; then
        TOTAL=$(echo "$APP_MEM $WEBKIT_MEM" | awk '{printf "%.1f", $1 + $2}')
        echo "$TIMESTAMP,$APP_MEM,$WEBKIT_MEM,$TOTAL,$APP_CPU" >> "$LOG_FILE"
    fi

    sleep 1
done

echo ""
echo "=== iOS Benchmark Results ==="
echo ""

# Calculate statistics
awk -F',' 'NR>1 {
    app_sum+=$2; webkit_sum+=$3; total_sum+=$4; cpu_sum+=$5; count++
    if ($2 > max_app) max_app=$2
    if ($4 > max_total) max_total=$4
} END {
    if (count > 0) {
        printf "Samples: %d\n", count
        printf "\n=== Memory (RSS) ===\n"
        printf "App Process:    Avg %.1f MB | Peak %.1f MB\n", app_sum/count, max_app
        printf "WebKit Process: Avg %.1f MB\n", webkit_sum/count
        printf "Total:          Avg %.1f MB | Peak %.1f MB\n", total_sum/count, max_total
        printf "\n=== CPU ===\n"
        printf "Average: %.1f%%\n", cpu_sum/count
    }
}' "$LOG_FILE"

echo ""
echo "Results saved to: $LOG_FILE"

# Bundle size
echo ""
echo "=== Bundle Size ==="
APP_SIZE=$(du -sh "../$APP_PATH" 2>/dev/null | cut -f1)
echo "iOS Simulator App: $APP_SIZE (debug build)"
