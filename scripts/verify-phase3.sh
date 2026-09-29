#!/usr/bin/env bash
set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "================================================================================"
echo "  CONTROLNAUTAS × META MUSE — VERIFICACIÓN AUTOMATIZADA DE FASE 3 (PUERTA 3)   "
echo "  Comercio Técnico Preliminar, Oferta Comercial Viva, Snapshots e Idempotencia "
echo "================================================================================"
echo ""

export NODE_PATH="$DIR/b2b-backend/node_modules:$DIR/b2b-backend/apps/backend/node_modules${NODE_PATH:+:$NODE_PATH}"

# Execute verification suite via tsx for high performance and full TypeScript support
if npx --yes tsx --version >/dev/null 2>&1; then
  npx tsx "$DIR/scripts/verify-phase3.ts" "$@"
else
  npx --prefix "$DIR/b2b-backend" ts-node --compiler-options '{"moduleResolution":"nodenext"}' "$DIR/scripts/verify-phase3.ts" "$@"
fi
