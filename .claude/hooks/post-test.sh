#!/bin/bash
# Post-test hook - sends notification after test completion
# Reads from stdin (Claude Code hook input)

set -e

# Read hook input
INPUT=$(cat -)

# Extract command that was run
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty')
STDOUT=$(echo "$INPUT" | jq -r '.tool_response.stdout // empty')

# Check if this was a test command
if echo "$COMMAND" | grep -qE 'test:e2e|playwright|vitest'; then
  # Determine success/failure from output
  if echo "$STDOUT" | grep -qE 'passed|✓'; then
    # Get pass count
    PASSED=$(echo "$STDOUT" | grep -oE '[0-9]+ passed' | head -1 || echo "Tests passed")

    # Send success notification
    "$CLAUDE_PROJECT_DIR/.claude/hooks/notify.sh" \
      "Tests Passed ✅" \
      "$PASSED" \
      "default" \
      "white_check_mark,test"
  elif echo "$STDOUT" | grep -qE 'failed|✗|error'; then
    # Get failure count
    FAILED=$(echo "$STDOUT" | grep -oE '[0-9]+ failed' | head -1 || echo "Tests failed")

    # Send failure notification
    "$CLAUDE_PROJECT_DIR/.claude/hooks/notify.sh" \
      "Tests Failed ❌" \
      "$FAILED" \
      "high" \
      "x,warning"
  fi
fi
