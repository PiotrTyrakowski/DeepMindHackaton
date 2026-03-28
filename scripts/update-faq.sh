#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib.sh
source "$SCRIPT_DIR/lib.sh"

# Usage: ./update-faq.sh "Your first FAQ question text"
if [[ $# -lt 1 ]]; then
  echo "Usage: $0 \"First FAQ question text\"" >&2
  exit 1
fi

BODY=$(python3 -c 'import json,sys; print(json.dumps({"faqFirstQuestion": sys.argv[1]}))' "$*")

curl -sS -X POST "$WEBSITE_URL/api/faq" \
  -H "Content-Type: application/json" \
  -d "$BODY"
echo
