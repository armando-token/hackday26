#!/usr/bin/env bash
set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "=== Running Phase 2 Verification Suite (Puerta 2) ==="
npx --prefix "$DIR/b2b-backend" ts-node --compiler-options '{"moduleResolution":"nodenext"}' "$DIR/scripts/verify-phase2.ts"

echo ""
echo "=== Running Dedicated Boundaries & Contraexamples Test Suite ==="
npx tsx "$DIR/scripts/test-muse-boundaries.ts"
