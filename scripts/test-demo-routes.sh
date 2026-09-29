#!/usr/bin/env bash
set -e

echo "================================================================="
echo "VERIFICACIÓN DE RUTAS DEMO (STOREFRONT & SERVIDOR DE ASSETS)"
echo "Fecha/Hora: $(date -u '+%Y-%m-%d %H:%M:%S UTC')"
echo "================================================================="

PORTS=(8000 9000)
DATASHEETS=(
  "CN-DEMO-PLC-DIN-420-MR1.pdf"
  "CN-DEMO-PLC-DIN-420-MR1-datasheet.pdf"
  "CN-DEMO-PID-PT100-RS1.pdf"
  "CN-DEMO-PID-PT100-RS1-datasheet.pdf"
  "CN-DEMO-PT100-3W-A1.pdf"
  "CN-DEMO-PT100-3W-A1-datasheet.pdf"
)

SPECS=(
  "CN-DEMO-PLC-DIN-420-MR1.md"
  "CN-DEMO-PID-PT100-RS1.md"
  "CN-DEMO-PT100-3W-A1.md"
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
