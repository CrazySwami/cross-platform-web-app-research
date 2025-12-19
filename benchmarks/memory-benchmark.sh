#!/bin/bash
# Memory Benchmark Script for Tauri TipTap Editor
# Usage: ./memory-benchmark.sh [app-name] [duration-seconds]

APP_NAME="${1:-TipTap Editor}"
DURATION="${2:-60}"
INTERVAL=1
LOG_FILE="memory_$(date +%Y%m%d_%H%M%S).csv"

echo "Memory Benchmark for: $APP_NAME"
echo "Duration: ${DURATION}s, Interval: ${INTERVAL}s"
echo "Output: $LOG_FILE"
echo ""

# Create CSV header
echo "timestamp,pid,rss_kb,vsz_kb,cpu_percent,mem_percent" > "$LOG_FILE"

END_TIME=$(($(date +%s) + DURATION))

while [ $(date +%s) -lt $END_TIME ]; do
    # Find the process (may have multiple for WebView)
    PIDS=$(pgrep -f "$APP_NAME" 2>/dev/null)

    if [ -n "$PIDS" ]; then
        for PID in $PIDS; do
            TIMESTAMP=$(date +%s)
            STATS=$(ps -p $PID -o rss=,vsz=,%cpu=,%mem= 2>/dev/null | awk '{print $1","$2","$3","$4}')
            if [ -n "$STATS" ]; then
                echo "$TIMESTAMP,$PID,$STATS" >> "$LOG_FILE"
            fi
        done
    else
        echo "Waiting for $APP_NAME to start..."
    fi

    sleep $INTERVAL
done

echo ""
echo "Benchmark complete!"
echo ""

# Calculate statistics
if [ -f "$LOG_FILE" ]; then
    echo "=== Summary ==="
    echo "Total samples: $(tail -n +2 "$LOG_FILE" | wc -l | tr -d ' ')"

    # Calculate averages (using awk for portability)
    awk -F',' 'NR>1 {
        rss_sum+=$3; vsz_sum+=$4; cpu_sum+=$5; count++
    } END {
        if (count > 0) {
            printf "Average RSS: %.2f MB\n", rss_sum/count/1024
            printf "Average VSZ: %.2f MB\n", vsz_sum/count/1024
            printf "Average CPU: %.2f%%\n", cpu_sum/count
        }
    }' "$LOG_FILE"

    # Peak values
    awk -F',' 'NR>1 {
        if ($3 > max_rss) max_rss=$3
        if ($4 > max_vsz) max_vsz=$4
    } END {
        printf "Peak RSS: %.2f MB\n", max_rss/1024
        printf "Peak VSZ: %.2f MB\n", max_vsz/1024
    }' "$LOG_FILE"
fi
