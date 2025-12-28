#!/bin/bash
# NTFY notification helper for Layers project
# Usage: notify.sh "Title" "Message" [priority] [tags]

NTFY_TOPIC="${NTFY_TOPIC:-layers-mf-08ebf1d1}"
TITLE="${1:-Layers Update}"
MESSAGE="${2:-Notification from Layers}"
PRIORITY="${3:-default}"
TAGS="${4:-layers}"

curl -s \
  -H "Title: $TITLE" \
  -H "Priority: $PRIORITY" \
  -H "Tags: $TAGS" \
  -d "$MESSAGE" \
  "ntfy.sh/$NTFY_TOPIC" > /dev/null 2>&1
