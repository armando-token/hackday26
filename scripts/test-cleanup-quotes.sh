#!/usr/bin/env bash
# ==============================================================================
# Controlnautas B2B — Quote Retention & Integrity Guard Test Suite
# File: scripts/test-cleanup-quotes.sh
# ==============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
CLEANUP_SCRIPT="${SCRIPT_DIR}/cleanup-quotes.sh"
LIVE_STORAGE_DIR="${REPO_ROOT}/storage/quotes"

# ANSI colors
if [ -t 1 ] && [ -z "${NO_COLOR:-}" ]; then
  BOLD=$'\033[1m'
  GREEN=$'\033[0;32m'
  YELLOW=$'\033[0;33m'
  RED=$'\033[0;31m'
  CYAN=$'\033[0;36m'
  RESET=$'\033[0m'
else
  BOLD=''
  GREEN=''
  YELLOW=''
  RED=''
  CYAN=''
  RESET=''
fi

echo "${BOLD}========================================================================${RESET}"
echo "${BOLD} TEST SUITE: Quote Retention & Cleanup ('scripts/cleanup-quotes.sh')${RESET}"
echo " Timestamp: $(date -u '+%Y-%m-%d %H:%M:%S UTC')"
echo "${BOLD}========================================================================${RESET}"

TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

assert_eq() {
  local expected="$1"
  local actual="$2"
  local test_name="$3"
  TOTAL_TESTS=$((TOTAL_TESTS + 1))

  if [ "$expected" = "$actual" ]; then
    echo "  [PASS] ${test_name}"
    PASSED_TESTS=$((PASSED_TESTS + 1))
  else
    echo "  ${RED}[FAIL] ${test_name}${RESET}"
    echo "         Expected: '${expected}'"
    echo "         Actual:   '${actual}'"
    FAILED_TESTS=$((FAILED_TESTS + 1))
  fi
}

assert_contains() {
  local haystack="$1"
  local needle="$2"
  local test_name="$3"
  TOTAL_TESTS=$((TOTAL_TESTS + 1))

  if [[ "$haystack" == *"$needle"* ]]; then
    echo "  [PASS] ${test_name}"
    PASSED_TESTS=$((PASSED_TESTS + 1))
  else
    echo "  ${RED}[FAIL] ${test_name}${RESET}"
    echo "         Expected substring: '${needle}'"
    FAILED_TESTS=$((FAILED_TESTS + 1))
  fi
}

# Setup isolated temporary test directory
TEST_DIR="$(mktemp -d /tmp/cn_quote_test_XXXXXX)"
trap 'rm -rf "${TEST_DIR}"' EXIT

echo -e "\n${CYAN}1. Testing CLI argument handling and --help${RESET}"
HELP_OUT="$("${CLEANUP_SCRIPT}" --help)"
assert_contains "$HELP_OUT" "Quote Retention & PDF Integrity Guard" "Help output contains script title"
assert_contains "$HELP_OUT" "--dry-run" "Help output documents --dry-run"
assert_contains "$HELP_OUT" "--force" "Help output documents --force"
assert_contains "$HELP_OUT" "--retention-days" "Help output documents --retention-days"

echo -e "\n${CYAN}2. Testing Storage Directory Permissions Enforcement (775)${RESET}"
# Create test directory with restrictive 700 permissions
PERM_TEST_DIR="${TEST_DIR}/perm_test_quotes"
mkdir -p -m 700 "$PERM_TEST_DIR"
INITIAL_PERM=$(stat -c "%a" "$PERM_TEST_DIR")
assert_eq "700" "$INITIAL_PERM" "Initial test directory permissions set to 700"

# Dry-run check should warn but not change permissions
DRY_OUT="$("${CLEANUP_SCRIPT}" --dir "$PERM_TEST_DIR" --dry-run)"
POST_DRY_PERM=$(stat -c "%a" "$PERM_TEST_DIR")
assert_eq "700" "$POST_DRY_PERM" "Dry-run preserves permissions without modifying them"
assert_contains "$DRY_OUT" "expected 775" "Dry-run warns about non-775 permissions"

# Force mode should actively update permissions to 775
FORCE_OUT="$("${CLEANUP_SCRIPT}" --dir "$PERM_TEST_DIR" --force)"
UPDATED_PERM=$(stat -c "%a" "$PERM_TEST_DIR")
assert_eq "775" "$UPDATED_PERM" "Force mode enforces secure 775 directory permissions"
assert_contains "$FORCE_OUT" "Updating storage permissions" "Force mode logs permission update"

echo -e "\n${CYAN}3. Generating Synthetic Fixtures for Integrity, Retention & Expiration${RESET}"
FIXTURE_DIR="${TEST_DIR}/fixtures_quotes"
mkdir -p -m 775 "$FIXTURE_DIR"

python3 - << PYFIXTURES
import os
import datetime
from reportlab.pdfgen import canvas

target = "${FIXTURE_DIR}"

def create_pdf(name, text_lines=[], exp_utc=None, obs_utc=None):
    fpath = os.path.join(target, name)
    c = canvas.Canvas(fpath)
    y = 750
    for line in text_lines:
        c.drawString(72, y, line)
        y -= 20
    if exp_utc:
        c.drawString(72, y, f"Expiracion Estimada: {exp_utc} UTC")
        y -= 20
    if obs_utc:
        c.drawString(72, y, f"Emision UTC: {obs_utc} UTC")
    c.save()
    return fpath

# 1. Valid Active Quote (recent, future expiration date)
create_pdf("quote_active_valid.pdf",
           ["Controlnautas B2B Industrial", "ID Cotizacion: QT-TEST-001"],
           exp_utc="2099-12-31 23:59:59")

# 2. Valid Expired Quote (by embedded text, expiration in past: 2026-01-01)
create_pdf("quote_expired_in_content.pdf",
           ["Controlnautas B2B Industrial", "ID Cotizacion: QT-TEST-002"],
           exp_utc="2026-01-01 12:00:00")

# 3. Valid Quote with expired date in filename (exp_2026-01-01)
create_pdf("quote_order_exp_2026-01-01.pdf",
           ["Controlnautas B2B Industrial", "ID Cotizacion: QT-TEST-003"])

# 4. Valid Quote with future expiration date in filename
create_pdf("quote_order_exp_2099-12-31.pdf",
           ["Controlnautas B2B Industrial", "ID Cotizacion: QT-TEST-004"])

# 5. Quote with sidecar JSON marked as expired
create_pdf("quote_sidecar_expired.pdf",
           ["Controlnautas B2B Industrial", "ID Cotizacion: QT-TEST-005"])
with open(os.path.join(target, "quote_sidecar_expired.json"), "w") as jf:
    jf.write('{"status": "expired", "quote_id": "QT-TEST-005"}')
with open(os.path.join(target, "quote_sidecar_expired.sha256"), "w") as sf:
    sf.write("dummy_sha256_hash_here")

# 6. Valid Quote older than 7 days (will touch mtime below)
create_pdf("quote_retention_old.pdf",
           ["Controlnautas B2B Industrial", "ID Cotizacion: QT-TEST-006"])

# 7. Corrupted 1: Zero-byte file
with open(os.path.join(target, "quote_corrupted_empty.pdf"), "w") as f:
    pass

# 8. Corrupted 2: Text file disguised as PDF
with open(os.path.join(target, "quote_corrupted_fake.pdf"), "w") as f:
    f.write("This is a plain text file, not a real PDF document.")

# 9. Corrupted 3: Truncated PDF (missing %%EOF trailer)
with open(os.path.join(target, "quote_corrupted_truncated.pdf"), "wb") as f:
    f.write(b"%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\nstartxref\n100\n")

print("Fixtures created successfully.")
PYFIXTURES

# Backdate quote_retention_old.pdf by 10 days
touch -d "10 days ago" "${FIXTURE_DIR}/quote_retention_old.pdf"

echo -e "\n${CYAN}4. Testing PDF Integrity Verification (Valid vs Corrupted)${RESET}"
JSON_AUDIT="$("${CLEANUP_SCRIPT}" --dir "$FIXTURE_DIR" --dry-run --json)"

python3 - << PYCHECK
import json
data = json.loads('''${JSON_AUDIT}''')

summary = data["summary"]
files = {f["filename"]: f for f in data["files"]}

# Checks
assert summary["total_scanned"] == 9, f"Expected 9 files, got {summary['total_scanned']}"
assert summary["valid_pdfs"] == 6, f"Expected 6 valid PDFs, got {summary['valid_pdfs']}"
assert summary["corrupted_pdfs"] == 3, f"Expected 3 corrupted PDFs, got {summary['corrupted_pdfs']}"

# Verify specific corruptions
assert files["quote_corrupted_empty.pdf"]["is_valid"] is False
assert "Empty file" in files["quote_corrupted_empty.pdf"]["integrity_reason"]

assert files["quote_corrupted_fake.pdf"]["is_valid"] is False
assert "Missing %PDF-" in files["quote_corrupted_fake.pdf"]["integrity_reason"]

assert files["quote_corrupted_truncated.pdf"]["is_valid"] is False
assert "Missing %%EOF" in files["quote_corrupted_truncated.pdf"]["integrity_reason"]

# Verify valid files
assert files["quote_active_valid.pdf"]["is_valid"] is True
assert files["quote_active_valid.pdf"]["sha256"] is not None

print("PDF Integrity assertions passed.")
PYCHECK
assert_eq "0" "$?" "Integrity detection identifies 6 valid PDFs and 3 corrupted PDFs"

echo -e "\n${CYAN}5. Testing Retention Policy & Expiration Logic${RESET}"
python3 - << PYCHECK2
import json
data = json.loads('''${JSON_AUDIT}''')
files = {f["filename"]: f for f in data["files"]}

# 1. Active quote should be RETAINED
assert files["quote_active_valid.pdf"]["should_delete"] is False, "Active valid quote should NOT be deleted"
assert files["quote_active_valid.pdf"]["action"] == "RETAIN"

# 2. Quote with future date in filename should be RETAINED
assert files["quote_order_exp_2099-12-31.pdf"]["should_delete"] is False, "Future exp quote should NOT be deleted"
assert files["quote_order_exp_2099-12-31.pdf"]["action"] == "RETAIN"

# 3. Quote older than 7 days should be marked for DELETION
assert files["quote_retention_old.pdf"]["should_delete"] is True, "Old quote should be deleted"
assert files["quote_retention_old.pdf"]["is_older_than_retention"] is True
assert "retention limit" in files["quote_retention_old.pdf"]["reason"]

# 4. Quote with expired date in content should be marked for DELETION
assert files["quote_expired_in_content.pdf"]["should_delete"] is True, "Content-expired quote should be deleted"
assert files["quote_expired_in_content.pdf"]["is_expired"] is True

# 5. Quote with expired date in filename should be marked for DELETION
assert files["quote_order_exp_2026-01-01.pdf"]["should_delete"] is True, "Filename-expired quote should be deleted"
assert files["quote_order_exp_2026-01-01.pdf"]["is_expired"] is True

# 6. Quote with expired sidecar should be marked for DELETION
assert files["quote_sidecar_expired.pdf"]["should_delete"] is True, "Sidecar-expired quote should be deleted"
assert files["quote_sidecar_expired.pdf"]["is_expired"] is True

print("Retention & expiration policy assertions passed.")
PYCHECK2
assert_eq "0" "$?" "Retention policy correctly categorizes active vs expired/old quotes"

echo -e "\n${CYAN}6. Testing --dry-run Mode Safety (No Files Deleted)${RESET}"
FILES_BEFORE=$(ls -1 "${FIXTURE_DIR}" | wc -l)
DRY_RUN_OUTPUT="$("${CLEANUP_SCRIPT}" --dir "$FIXTURE_DIR" --dry-run)"
FILES_AFTER=$(ls -1 "${FIXTURE_DIR}" | wc -l)

assert_eq "$FILES_BEFORE" "$FILES_AFTER" "--dry-run guarantees zero files deleted from disk"
assert_contains "$DRY_RUN_OUTPUT" "WOULD DELETE" "--dry-run displays preview actions"

echo -e "\n${CYAN}7. Testing --force Mode Execution (Deletion & Sidecar Cleanup)${RESET}"
# Verify sidecar exists before force
assert_eq "true" "$([ -f "${FIXTURE_DIR}/quote_sidecar_expired.json" ] && echo true || echo false)" "Sidecar JSON exists prior to deletion"

FORCE_OUTPUT="$("${CLEANUP_SCRIPT}" --dir "$FIXTURE_DIR" --force)"

# Verify deleted files are gone
assert_eq "false" "$([ -f "${FIXTURE_DIR}/quote_retention_old.pdf" ] && echo true || echo false)" "Old quote was deleted"
assert_eq "false" "$([ -f "${FIXTURE_DIR}/quote_expired_in_content.pdf" ] && echo true || echo false)" "Content-expired quote was deleted"
assert_eq "false" "$([ -f "${FIXTURE_DIR}/quote_order_exp_2026-01-01.pdf" ] && echo true || echo false)" "Filename-expired quote was deleted"
assert_eq "false" "$([ -f "${FIXTURE_DIR}/quote_sidecar_expired.pdf" ] && echo true || echo false)" "Sidecar-expired quote was deleted"

# Verify sidecar files were cleaned up
assert_eq "false" "$([ -f "${FIXTURE_DIR}/quote_sidecar_expired.json" ] && echo true || echo false)" "Sidecar JSON was cleaned up"
assert_eq "false" "$([ -f "${FIXTURE_DIR}/quote_sidecar_expired.sha256" ] && echo true || echo false)" "Sidecar SHA256 was cleaned up"

# Verify retained active files remain intact
assert_eq "true" "$([ -f "${FIXTURE_DIR}/quote_active_valid.pdf" ] && echo true || echo false)" "Active valid quote was preserved"
assert_eq "true" "$([ -f "${FIXTURE_DIR}/quote_order_exp_2099-12-31.pdf" ] && echo true || echo false)" "Future expiration quote was preserved"

# Verify directory permissions remain 775 after force
AFTER_FORCE_PERM=$(stat -c "%a" "$FIXTURE_DIR")
assert_eq "775" "$AFTER_FORCE_PERM" "Directory permissions remain 775 after file deletion"

echo -e "\n${CYAN}8. Testing --clean-corrupted Mode${RESET}"
assert_eq "true" "$([ -f "${FIXTURE_DIR}/quote_corrupted_empty.pdf" ] && echo true || echo false)" "Corrupted file preserved without --clean-corrupted"

"${CLEANUP_SCRIPT}" --dir "$FIXTURE_DIR" --clean-corrupted --force >/dev/null

assert_eq "false" "$([ -f "${FIXTURE_DIR}/quote_corrupted_empty.pdf" ] && echo true || echo false)" "Corrupted file deleted when --clean-corrupted is supplied"
assert_eq "false" "$([ -f "${FIXTURE_DIR}/quote_corrupted_fake.pdf" ] && echo true || echo false)" "Fake PDF deleted when --clean-corrupted is supplied"
assert_eq "false" "$([ -f "${FIXTURE_DIR}/quote_corrupted_truncated.pdf" ] && echo true || echo false)" "Truncated PDF deleted when --clean-corrupted is supplied"

# Still preserved active quotes
assert_eq "true" "$([ -f "${FIXTURE_DIR}/quote_active_valid.pdf" ] && echo true || echo false)" "Active quote preserved after cleaning corrupted files"

echo -e "\n${CYAN}9. Testing Production Storage Directory Compliance${RESET}"
PROD_PERM=$(stat -c "%a" "$LIVE_STORAGE_DIR")
assert_eq "775" "$PROD_PERM" "Production directory '${LIVE_STORAGE_DIR}' permissions are 775"

LIVE_VERIFY="$("${CLEANUP_SCRIPT}" --verify-only)"
assert_contains "$LIVE_VERIFY" "Secure 775 OK" "Production verification confirms 775 permissions"
assert_contains "$LIVE_VERIFY" "SUMMARY STATISTICS" "Production verification completes cleanly"

echo -e "\n${BOLD}========================================================================${RESET}"
echo "${BOLD} TEST SUMMARY: ${PASSED_TESTS}/${TOTAL_TESTS} tests passed (${FAILED_TESTS} failures)${RESET}"
echo "${BOLD}========================================================================${RESET}"

if [ "$FAILED_TESTS" -eq 0 ]; then
  echo "${GREEN}${BOLD}ALL TESTS PASSED SUCCESSFULLY!${RESET}"
  exit 0
else
  echo "${RED}${BOLD}SOME TESTS FAILED!${RESET}"
  exit 1
fi
