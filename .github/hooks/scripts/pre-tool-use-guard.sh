#!/usr/bin/env bash
set -euo pipefail

# Read hook input from stdin
INPUT=$(cat)

# Extract tool_name using python3
TOOL=$(echo "$INPUT" | python3 -c "import sys,json; print(json.load(sys.stdin).get('tool_name',''))" 2>/dev/null || echo "")

# Check all known terminal tool names
case "$TOOL" in
  execute|shell|Bash|bash|runTerminalCommand|runCommands)
    # Extract the command string from tool_input
    CMD=$(echo "$INPUT" | python3 -c "
import sys, json
data = json.load(sys.stdin)
tool_input = data.get('tool_input', {})
if isinstance(tool_input, str):
    tool_input = json.loads(tool_input)
print(tool_input.get('command', ''))
" 2>/dev/null || echo "")

    # Block destructive commands
    case "$CMD" in
      *"rm -rf"*|*"--force"*|*"DROP TABLE"*|*"DROP DATABASE"*|*"git push -f"*|*"git push --force"*|*"git reset --hard"*)
        echo '{
          "continue": true,
          "hookSpecificOutput": {
            "hookEventName": "PreToolUse",
            "permissionDecision": "deny",
            "permissionDecisionReason": "Destructive command blocked by quality gate"
          }
        }'
        exit 0
        ;;
    esac
    ;;
esac

# Allow by default
echo '{"continue": true}'
