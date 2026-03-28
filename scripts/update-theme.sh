#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib.sh
source "$SCRIPT_DIR/lib.sh"

# Usage: ./update-theme.sh [slate|earthy]
#   slate  — cool, modern greys + sans-serif
#   earthy — warm cream/terracotta + serif
VARIANT="${1:-slate}"
if [[ "$VARIANT" != "slate" && "$VARIANT" != "earthy" ]]; then
  echo "Usage: $0 [slate|earthy]" >&2
  exit 1
fi

curl -sS -X POST "$WEBSITE_URL/api/theme" \
  -H "Content-Type: application/json" \
  -d "{\"themeVariant\":\"$VARIANT\"}"
echo
