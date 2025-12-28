#!/bin/bash
# Post-Linear hook - sends notification after Linear issue updates
# Reads from stdin (Claude Code hook input)

set -e

# Read hook input
INPUT=$(cat -)

# Extract tool name and response
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // empty')

# Check if this was a Linear update
if [ "$TOOL_NAME" = "mcp__linear__update_issue" ]; then
  ISSUE_ID=$(echo "$INPUT" | jq -r '.tool_response.identifier // empty')
  STATUS=$(echo "$INPUT" | jq -r '.tool_response.status // empty')
  TITLE=$(echo "$INPUT" | jq -r '.tool_response.title // empty')

  if [ -n "$ISSUE_ID" ]; then
    "$CLAUDE_PROJECT_DIR/.claude/hooks/notify.sh" \
      "Linear: $ISSUE_ID → $STATUS" \
      "$TITLE" \
      "default" \
      "ticket,linear"
  fi
fi

# Check if this was a comment creation
if [ "$TOOL_NAME" = "mcp__linear__create_comment" ]; then
  "$CLAUDE_PROJECT_DIR/.claude/hooks/notify.sh" \
    "Linear Comment Added" \
    "Comment added to issue" \
    "low" \
    "speech_balloon"
fi
