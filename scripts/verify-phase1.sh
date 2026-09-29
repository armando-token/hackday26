#!/usr/bin/env bash
set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "=== Running Phase 1 Verification Suite ==="
npx --prefix "$DIR/b2b-backend" ts-node --compiler-options '{"moduleResolution":"nodenext"}' "$DIR/scripts/verify-phase1.ts"
