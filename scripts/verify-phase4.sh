#!/usr/bin/env bash
set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

export NODE_PATH="$DIR/b2b-backend/node_modules:$DIR/b2b-backend/apps/backend/node_modules${NODE_PATH:+:$NODE_PATH}"

echo "=== Running Phase 4 & 5 Verification Suite (Gates 4 & 5) ==="
if command -v tsx >/dev/null 2>&1; then
  tsx "$DIR/scripts/verify-phase4.ts" "$@"
elif npx --yes tsx --version >/dev/null 2>&1; then
  npx --yes tsx "$DIR/scripts/verify-phase4.ts" "$@"
else
  npx --prefix "$DIR/b2b-backend" ts-node --compiler-options '{"moduleResolution":"nodenext"}' "$DIR/scripts/verify-phase4.ts" "$@"
fi
