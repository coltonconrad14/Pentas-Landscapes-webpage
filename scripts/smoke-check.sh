#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

failures=0

pass() {
  printf '[PASS] %s\n' "$1"
}

fail() {
  printf '[FAIL] %s\n' "$1"
  failures=$((failures + 1))
}

check_file() {
  local path="$1"
  if [[ -f "$path" ]]; then
    pass "Found file: $path"
  else
    fail "Missing file: $path"
  fi
}

echo 'Running Pentas Landscapes smoke checks...'

check_file "index.html"
check_file "styles.css"
check_file "script.js"
check_file "assets/pentas-logo.png"

ids="$(grep -oE 'id="[^"]+"' index.html | sed -E 's/id="([^"]+)"/\1/' | sort -u || true)"
anchors="$(grep -oE 'href="#[^"]*"' index.html | sed -E 's/href="#([^"]*)"/\1/' | sort -u || true)"

missing_targets="$(comm -23 <(printf '%s\n' "$anchors" | grep -v '^$' | sort -u) <(printf '%s\n' "$ids" | sort -u) || true)"

if [[ -z "$missing_targets" ]]; then
  pass 'All internal anchor links resolve to valid IDs'
else
  fail 'Broken internal anchors detected:'
  printf '%s\n' "$missing_targets"
fi

empty_hash_count="$(grep -c 'href="#"' index.html || true)"
if [[ "$empty_hash_count" -gt 0 ]]; then
  pass "Found $empty_hash_count placeholder hash links (expected if client placeholders are pending)"
else
  pass 'No placeholder hash links found'
fi

if grep -Eq '(TODO|FIXME|XXX)' index.html styles.css script.js; then
  fail 'Found TODO/FIXME/XXX markers in production files'
else
  pass 'No TODO/FIXME/XXX markers in production files'
fi

if [[ "$failures" -gt 0 ]]; then
  echo
  echo "Smoke checks completed with $failures failure(s)."
  exit 1
fi

echo
echo 'Smoke checks passed.'
