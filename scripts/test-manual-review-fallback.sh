#!/usr/bin/env bash
set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "=== Running Manual Review Fallback & Zero-Price Immunity Test Suite (Puerta 3) ==="
npx tsx "$DIR/scripts/test-manual-review-fallback.ts" "$@"
