#!/usr/bin/env bash
set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

export NODE_PATH="$DIR/b2b-backend/node_modules:$DIR/b2b-backend/apps/backend/node_modules${NODE_PATH:+:$NODE_PATH}"

# Execute rehearsal walkthrough via tsx for high performance and full TypeScript support
if command -v tsx >/dev/null 2>&1; then
  tsx "$DIR/scripts/demo-e2e-pitch.ts" "$@"
elif npx --yes tsx --version >/dev/null 2>&1; then
  npx tsx "$DIR/scripts/demo-e2e-pitch.ts" "$@"
else
  npx --prefix "$DIR/b2b-backend" ts-node --compiler-options '{"moduleResolution":"nodenext"}' "$DIR/scripts/demo-e2e-pitch.ts" "$@"
fi
