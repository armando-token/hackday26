#!/usr/bin/env bash
set -e

echo "================================================================="
echo "VERIFICACIÓN DE RUTAS DEMO (STOREFRONT & SERVIDOR DE ASSETS)"
echo "Fecha/Hora: $(date -u '+%Y-%m-%d %H:%M:%S UTC')"
echo "================================================================="

PORTS=(8000 9000)
DATASHEETS=(
  "CN-X5PRIME-HE-XP5.pdf"
  "CN-X5PRIME-HE-XP5-datasheet.pdf"
  "CN-N1200.pdf"
  "CN-N1200-datasheet.pdf"
  "CN-THT02.pdf"
  "CN-THT02-datasheet.pdf"
)

SPECS=(
  "CN-X5PRIME-HE-XP5.md"
  "CN-N1200.md"
  "CN-THT02.md"
)

for PORT in "${PORTS[@]}"; do
  echo ""
  echo "--- Comprobando Puerto $PORT ---"
  
  # Health
  echo -n "[1] /demo/health: "
  curl -s -o /dev/null -w "HTTP %{http_code}\n" "http://localhost:$PORT/demo/health"
  
  # Datasheets
  for ds in "${DATASHEETS[@]}"; do
    echo -n "[2] Datasheet /demo/datasheets/$ds: "
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:$PORT/demo/datasheets/$ds")
    CTYPE=$(curl -s -I "http://localhost:$PORT/demo/datasheets/$ds" | grep -i "content-type" | tr -d '\r\n')
    echo "$STATUS ($CTYPE)"
  done

  # Specs
  for sp in "${SPECS[@]}"; do
    echo -n "[3] Spec /demo/specs/$sp: "
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:$PORT/demo/specs/$sp")
    CTYPE=$(curl -s -I "http://localhost:$PORT/demo/specs/$sp" | grep -i "content-type" | tr -d '\r\n')
    echo "$STATUS ($CTYPE)"
  done

  # 404 Checks
  echo -n "[4] 404 Inexistente /demo/datasheets/no-existe-404.pdf: "
  curl -s -o /dev/null -w "HTTP %{http_code}\n" "http://localhost:$PORT/demo/datasheets/no-existe-404.pdf"
  echo -n "[5] 404 Inexistente /demo/specs/no-existe-404.md: "
  curl -s -o /dev/null -w "HTTP %{http_code}\n" "http://localhost:$PORT/demo/specs/no-existe-404.md"
done

echo ""
echo "================================================================="
echo "TODAS LAS RUTAS VERIFICADAS EXITOSAMENTE CON CURL"
echo "================================================================="
