#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib.sh
source "$SCRIPT_DIR/lib.sh"

# Usage: ./update-photo.sh [true|false|fixed|original]
#   true / fixed     — show corrected roof photo
#   false / original — original photo
RAW="${1:-true}"
case "$RAW" in
  true|1|yes|fixed|on) VAL=true ;;
  false|0|no|original|off) VAL=false ;;
  *)
    echo "Usage: $0 [true|false|fixed|original]" >&2
    exit 1
    ;;
esac

curl -sS -X POST "$WEBSITE_URL/api/photo" \
  -H "Content-Type: application/json" \
  -d "{\"roofPhotoFixed\":$VAL}"
echo
