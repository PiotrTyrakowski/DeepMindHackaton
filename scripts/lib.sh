#!/usr/bin/env bash
# Shared base URL for website API scripts. Override for other deployments:
#   WEBSITE_URL=https://example.com ./scripts/update-theme.sh earthy
export WEBSITE_URL="${WEBSITE_URL:-https://deep-mind-hackaton.vercel.app}"
