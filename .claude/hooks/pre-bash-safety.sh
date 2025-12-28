#!/bin/bash
# Pre-bash safety hook - blocks dangerous commands before execution
# This hook runs BEFORE a bash command is executed
# Exit 0 = allow command
# Exit 2 = block command and inform Claude

set -euo pipefail

# Read hook input from stdin
INPUT=$(cat -)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty')

# If no command, allow (shouldn't happen but be safe)
if [ -z "$COMMAND" ]; then
  exit 0
fi

# Dangerous patterns to block
# These are catastrophic commands that should never be run
DANGEROUS_PATTERNS=(
  'rm -rf /'           # Delete root
  'rm -rf ~'           # Delete home directory
  'rm -rf \$HOME'      # Delete home directory (variable)
  'rm -rf /home'       # Delete all user directories
  'rm -rf /Users'      # Delete all user directories (macOS)
  'sudo rm -rf'        # Elevated dangerous delete
  '> /dev/sd'          # Overwrite disk
  '> /dev/nvme'        # Overwrite NVMe disk
  'mkfs\.'             # Format filesystem
  ':(){:|:&};:'        # Fork bomb
  'dd if=/dev/zero'    # Overwrite with zeros
  'dd if=/dev/random'  # Overwrite with random data
  'chmod -R 777 /'     # Dangerous permissions on root
  'chown -R.*/'        # Dangerous ownership change on root
)

# Check each pattern
for pattern in "${DANGEROUS_PATTERNS[@]}"; do
  if echo "$COMMAND" | grep -qE "$pattern"; then
    echo ""
    echo "🛑 BLOCKED: Potentially destructive command detected"
    echo "   Pattern matched: $pattern"
    echo "   Command: $COMMAND"
    echo ""
    echo "If you believe this is a false positive, please modify the command"
    echo "to be more specific (e.g., use absolute paths to specific directories)."
    exit 2  # Exit 2 = block and inform Claude
  fi
done

# Additional check: block any rm -rf without a specific path
if echo "$COMMAND" | grep -qE 'rm\s+(-[rRf]+\s+)*-[rRf]*\s*$'; then
  echo ""
  echo "🛑 BLOCKED: rm -rf without target path"
  echo "   Please specify the exact path to delete."
  exit 2
fi

# Allow the command
exit 0
