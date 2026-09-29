#!/usr/bin/env bash
set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "=== Running Inventory & Availability Audit (Puerta 3) ==="
npx tsx "$DIR/scripts/test-inventory-availability.ts" "$@"
