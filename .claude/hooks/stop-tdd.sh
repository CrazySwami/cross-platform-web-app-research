#!/bin/bash
# TDD Stop Hook with Circuit Breaker
# Always-on: runs tests after Claude finishes each response
# Bypass: claude --no-hooks for quick questions
#
# This enables continuous autonomous operation (Boris Cherny style)
# but with safety limits to prevent infinite loops.

set -euo pipefail

# Skip if explicitly disabled via environment variable
if [ "${SKIP_TDD:-}" = "1" ]; then
  exit 0
fi

# Skip if we're in a read-only/research context (no code changes)
# Check if any code files were modified in this session
# This is a heuristic - we run tests if it looks like code was touched

# Use session-based state file (persists across Claude responses in same session)
STATE_FILE="${TMPDIR:-/tmp}/claude-tdd-failures-${CLAUDE_SESSION_ID:-$$}"
MAX_FAILURES=3

# Read current failure count
FAILURES=$(cat "$STATE_FILE" 2>/dev/null || echo 0)

# If we've already hit the circuit breaker this session, don't run tests again
BREAKER_FILE="${TMPDIR:-/tmp}/claude-tdd-breaker-${CLAUDE_SESSION_ID:-$$}"
if [ -f "$BREAKER_FILE" ]; then
  echo "ℹ️  Circuit breaker active. Run tests manually or start a new session."
  exit 0
fi

# Run tests (chromium = fast, covers most platforms)
echo ""
echo "🧪 Running E2E tests (chromium)..."
echo ""

cd "$CLAUDE_PROJECT_DIR"

# Capture test output
TEST_OUTPUT=$(pnpm test:e2e --project=chromium 2>&1) || TEST_EXIT=$?
TEST_EXIT=${TEST_EXIT:-0}

if [ $TEST_EXIT -eq 0 ]; then
  # Success - reset failure counter
  rm -f "$STATE_FILE"

  # Extract pass count
  PASSED=$(echo "$TEST_OUTPUT" | grep -oE '[0-9]+ passed' | head -1 || echo "Tests passed")

  echo "✅ $PASSED"
  echo ""

  # Send success notification
  if [ -x "$CLAUDE_PROJECT_DIR/.claude/hooks/notify.sh" ]; then
    "$CLAUDE_PROJECT_DIR/.claude/hooks/notify.sh" \
      "Tests Passed ✅" \
      "$PASSED" \
      "default" \
      "white_check_mark,test" 2>/dev/null || true
  fi

  exit 0
else
  # Failure - increment counter
  FAILURES=$((FAILURES + 1))
  echo "$FAILURES" > "$STATE_FILE"

  if [ $FAILURES -ge $MAX_FAILURES ]; then
    # Circuit breaker triggered - notify and stop
    rm -f "$STATE_FILE"
    touch "$BREAKER_FILE"  # Mark breaker as triggered

    # Send failure notification
    if [ -x "$CLAUDE_PROJECT_DIR/.claude/hooks/notify.sh" ]; then
      "$CLAUDE_PROJECT_DIR/.claude/hooks/notify.sh" \
        "TDD Circuit Breaker ⚠️" \
        "$MAX_FAILURES consecutive failures. Human review needed." \
        "high" \
        "warning,stop" 2>/dev/null || true
    fi

    echo ""
    echo "⚠️  CIRCUIT BREAKER TRIGGERED"
    echo "   $MAX_FAILURES consecutive test failures detected."
    echo ""
    echo "   The tests may have a fundamental issue that needs human review."
    echo "   Please run tests manually to diagnose:"
    echo "   $ pnpm test:e2e --project=chromium"
    echo ""
    echo "   To reset and try again, start a new Claude session."
    echo ""

    exit 0  # Exit 0 = stop Claude, don't continue
  else
    # Continue fixing - show summary, not full output
    echo ""
    echo "❌ Tests failed (attempt $FAILURES/$MAX_FAILURES)"
    echo ""

    # Show just the failing tests
    echo "Failed tests:"
    echo "$TEST_OUTPUT" | grep -E '(✘|FAIL|Error:)' | head -20 || true
    echo ""

    # Show the actual error messages
    echo "Error details:"
    echo "$TEST_OUTPUT" | grep -A 3 'Error:' | head -30 || true
    echo ""

    echo "Please fix the failing tests above."
    echo ""

    exit 2  # Exit 2 = feed error to Claude, continue working
  fi
fi
