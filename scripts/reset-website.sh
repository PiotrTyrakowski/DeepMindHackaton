#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib.sh
source "$SCRIPT_DIR/lib.sh"

# Usage: ./reset-website.sh
# Restores theme, hero/integrity photo, and first FAQ question to defaults.

curl -sS -X POST "$WEBSITE_URL/api/reset" \
  -H "Content-Type: application/json" \
  -d "{}"
echo
