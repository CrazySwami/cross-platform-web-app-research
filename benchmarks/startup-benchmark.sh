#!/bin/bash
# Startup Time Benchmark Script for Tauri TipTap Editor
# Usage: ./startup-benchmark.sh [app-path] [iterations]

APP_PATH="${1:-../src-tauri/target/release/bundle/macos/TipTap Editor.app}"
ITERATIONS="${2:-5}"
LOG_FILE="startup_$(date +%Y%m%d_%H%M%S).csv"

echo "Startup Benchmark"
echo "App: $APP_PATH"
echo "Iterations: $ITERATIONS"
echo "Output: $LOG_FILE"
echo ""

# Create CSV header
echo "iteration,startup_ms" > "$LOG_FILE"

total_time=0

for i in $(seq 1 $ITERATIONS); do
    echo "Run $i of $ITERATIONS..."

    # Measure startup time
    START=$(python3 -c 'import time; print(int(time.time() * 1000))')

    # Start the app
    open "$APP_PATH" &

    # Wait for window to appear
    sleep 1
    APP_PID=$(pgrep -n "TipTap Editor" 2>/dev/null)

    END=$(python3 -c 'import time; print(int(time.time() * 1000))')

    DURATION=$((END - START))
    total_time=$((total_time + DURATION))

    echo "$i,$DURATION" >> "$LOG_FILE"
    echo "  Startup time: ${DURATION}ms"

    # Kill the app
    if [ -n "$APP_PID" ]; then
        kill $APP_PID 2>/dev/null
    fi
    pkill -f "TipTap Editor" 2>/dev/null
    sleep 1
done

echo ""
echo "=== Summary ==="
avg_time=$((total_time / ITERATIONS))
echo "Average startup time: ${avg_time}ms"
echo ""
echo "Results saved to: $LOG_FILE"
