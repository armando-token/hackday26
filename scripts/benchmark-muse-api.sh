#!/usr/bin/env bash
set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "=== Running Muse API Latency Benchmark Suite ==="
/home/ubuntu/hackday26/b2b-backend/node_modules/.bin/ts-node --compiler-options '{"moduleResolution":"nodenext"}' "$DIR/scripts/benchmark-muse-api.ts" "$@"
