#!/usr/bin/env bash
set -euo pipefail

# Read hook input from stdin
INPUT=$(cat)

# Extract tool_name and file path from tool_input
TOOL=$(echo "$INPUT" | python3 -c "import sys,json; print(json.load(sys.stdin).get('tool_name',''))" 2>/dev/null || echo "")

if [ "$TOOL" = "editFiles" ] || [ "$TOOL" = "edit" ] || [ "$TOOL" = "Edit" ]; then
  FILE=$(echo "$INPUT" | python3 -c "
import sys, json
data = json.load(sys.stdin)
tool_input = data.get('tool_input', {})
if isinstance(tool_input, str):
    tool_input = json.loads(tool_input)
# Try common field names for the edited file path
path = tool_input.get('filePath', tool_input.get('file', tool_input.get('path', '')))
# Also check 'files' array format
if not path:
    files = tool_input.get('files', [])
    if isinstance(files, list) and files:
        path = files[0] if isinstance(files[0], str) else files[0].get('path', files[0].get('filePath', ''))
if isinstance(path, list):
    path = path[0] if path else ''
print(path)
" 2>/dev/null || echo "")

  case "$FILE" in
    */domain/model/*)
      echo '{
        "continue": true,
        "hookSpecificOutput": {
          "hookEventName": "PostToolUse",
          "additionalContext": "Domain model edited. Remember: domain models must not contain JPA annotations. Cross-context access must use Module APIs only."
        }
      }'
      exit 0
      ;;
    */infrastructure/persistence/*)
      echo '{
        "continue": true,
        "hookSpecificOutput": {
          "hookEventName": "PostToolUse",
          "additionalContext": "Persistence layer edited. Remember: do NOT use @GeneratedValue. Use hand-written @Component mapper with full-args constructor for toDomainModel()."
        }
      }'
      exit 0
      ;;
    */docs/api/*.yaml|*/docs/api/*.yml|docs/api/*.yaml|docs/api/*.yml)
      echo '{
        "continue": true,
        "hookSpecificOutput": {
          "hookEventName": "PostToolUse",
          "additionalContext": "OpenAPI spec edited. Remember: operationId must be unique camelCase, tags must match bounded contexts, error responses must use ProblemDetail, validation constraints must map to Jakarta annotations."
        }
      }'
      exit 0
      ;;
  esac
fi

# No special reminder
echo '{"continue": true}'
