#!/usr/bin/env bash
# ==============================================================================
# Controlnautas B2B — Quote Storage Retention & Integrity Guard
# File: scripts/cleanup-quotes.sh
#
# Requirements fulfilled:
# 1. Cleans up PDF files in storage/quotes/ older than 7 days (or expired quotes).
# 2. Verifies integrity of existing PDFs (magic bytes, trailer, xref, catalog).
# 3. Provides '--dry-run' and '--force' modes (with interactive safe fallback).
# 4. Enforces and guarantees storage directory permissions remain secure (775).
# ==============================================================================

set -euo pipefail

# Script location and defaults
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
DEFAULT_STORAGE_DIR="${REPO_ROOT}/storage/quotes"

# Configuration variables
TARGET_DIR="${QUOTES_STORAGE_DIR:-$DEFAULT_STORAGE_DIR}"
RETENTION_DAYS=7
DRY_RUN=false
FORCE=false
CLEAN_CORRUPTED=false
VERIFY_ONLY=false
VERBOSE=false
JSON_OUTPUT=false

# ANSI colors (disabled if NO_COLOR is set or stdout is not a TTY)
if [ -t 1 ] && [ -z "${NO_COLOR:-}" ]; then
  BOLD=$'\033[1m'
  GREEN=$'\033[0;32m'
  YELLOW=$'\033[0;33m'
  RED=$'\033[0;31m'
  CYAN=$'\033[0;36m'
  BLUE=$'\033[0;34m'
  GRAY=$'\033[0;90m'
  RESET=$'\033[0m'
else
  BOLD=''
  GREEN=''
  YELLOW=''
  RED=''
  CYAN=''
  BLUE=''
  GRAY=''
  RESET=''
fi

# Print usage information
usage() {
  cat << EOF
${BOLD}Controlnautas B2B — Quote Retention & PDF Integrity Guard${RESET}

${BOLD}USAGE:${RESET}
  $0 [OPTIONS]

${BOLD}DESCRIPTION:${RESET}
  Automates retention lifecycle and integrity verification for commercial quote PDFs
  stored in '${DEFAULT_STORAGE_DIR}'.
  Cleans up PDF quotes older than the retention threshold (default: 7 days) and quotes
  identified as expired (via filename, metadata sidecar, or document content), while
  rigorously validating PDF structure and keeping storage directory permissions at 775.

${BOLD}OPTIONS:${RESET}
  --dry-run, -n              Run in simulation mode. Inspect files and show what would be
                             deleted without removing files or altering permissions.
  --force, -f                Execute file deletion without interactive confirmation.
  --dir, -d <path>           Specify quote storage directory (default: ${DEFAULT_STORAGE_DIR}).
  --retention-days, -r <N>   Quote retention age threshold in days (default: 7).
  --clean-corrupted          Also clean up corrupted PDF files failing integrity checks.
  --verify-only              Only verify PDF integrity and report status (no deletions).
  --json                     Output audit report in machine-readable JSON format.
  --verbose, -v              Display detailed technical information (SHA-256, xref offsets).
  --help, -h                 Show this help message and exit.

${BOLD}EXAMPLES:${RESET}
  # Perform a dry-run check of quotes:
  $0 --dry-run

  # Enforce retention policy and delete expired/old quotes:
  $0 --force

  # Verify PDF integrity only:
  $0 --verify-only

  # Enforce retention with a custom 14-day threshold on a specific directory:
  $0 --dir /path/to/quotes --retention-days 14 --force
EOF
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case "$1" in
    --dry-run|-n)
      DRY_RUN=true
      shift
      ;;
    --force|-f)
      FORCE=true
      shift
      ;;
    --dir|-d)
      if [[ -z "${2:-}" ]]; then
        echo "${RED}Error: --dir requires a directory path.${RESET}" >&2
        exit 1
      fi
      TARGET_DIR="$2"
      shift 2
      ;;
    --dir=*)
      TARGET_DIR="${1#*=}"
      shift
      ;;
    --retention-days|-r)
      if [[ -z "${2:-}" ]] || ! [[ "$2" =~ ^[0-9]+$ ]]; then
        echo "${RED}Error: --retention-days requires a positive integer.${RESET}" >&2
        exit 1
      fi
      RETENTION_DAYS="$2"
      shift 2
      ;;
    --retention-days=*)
      val="${1#*=}"
      if ! [[ "$val" =~ ^[0-9]+$ ]]; then
        echo "${RED}Error: --retention-days requires a positive integer.${RESET}" >&2
        exit 1
      fi
      RETENTION_DAYS="$val"
      shift
      ;;
    --clean-corrupted)
      CLEAN_CORRUPTED=true
      shift
      ;;
    --verify-only)
      VERIFY_ONLY=true
      shift
      ;;
    --json)
      JSON_OUTPUT=true
      shift
      ;;
    --verbose|-v)
      VERBOSE=true
      shift
      ;;
    --help|-h)
      usage
      exit 0
      ;;
    *)
      echo "${RED}Error: Unknown option '$1'${RESET}" >&2
      echo "Use --help to display available options." >&2
      exit 1
      ;;
  esac
done

# Ensure Python 3 is installed
if ! command -v python3 &>/dev/null; then
  echo "${RED}Error: python3 is required to inspect PDF binary structures.${RESET}" >&2
  exit 1
fi

# Determine execution mode
EXEC_MODE="interactive"
if [ "$VERIFY_ONLY" = "true" ]; then
  EXEC_MODE="verify-only"
elif [ "$DRY_RUN" = "true" ]; then
  EXEC_MODE="dry-run"
elif [ "$FORCE" = "true" ]; then
  EXEC_MODE="force"
else
  # If neither --dry-run nor --force is specified:
  if [ -t 0 ]; then
    EXEC_MODE="interactive"
  else
    # Non-interactive environment (cron / pipeline) defaults to safe preview
    EXEC_MODE="preview"
  fi
fi

# ==============================================================================
# Security: Storage Directory Permissions Enforcement (775)
# ==============================================================================
ensure_storage_security() {
  local dir="$1"
  local mode="$2"

  if [ ! -d "$dir" ]; then
    if [ "$mode" = "dry-run" ] || [ "$mode" = "preview" ] || [ "$mode" = "verify-only" ]; then
      if [ "$JSON_OUTPUT" != "true" ]; then
        echo "${YELLOW}[DRY-RUN] Target directory does not exist: ${dir} (would create with permissions 775)${RESET}"
      fi
      return 0
    else
      if [ "$JSON_OUTPUT" != "true" ]; then
        echo "${CYAN}[SECURITY] Initializing quotes storage directory: ${dir} (mode 775)...${RESET}"
      fi
      mkdir -p -m 775 "$dir"
      chmod 775 "$dir"
    fi
  fi

  local current_perm
  current_perm=$(stat -c "%a" "$dir" 2>/dev/null || echo "unknown")

  if [ "$current_perm" != "775" ]; then
    if [ "$mode" = "dry-run" ] || [ "$mode" = "preview" ] || [ "$mode" = "verify-only" ]; then
      if [ "$JSON_OUTPUT" != "true" ]; then
        echo "${YELLOW}[WARNING] Storage directory permissions are ${current_perm} (expected 775). In --force mode this will be updated to 775.${RESET}"
      fi
    else
      if [ "$JSON_OUTPUT" != "true" ]; then
        echo "${YELLOW}[SECURITY] Updating storage permissions for ${dir} from ${current_perm} to 775...${RESET}"
      fi
      chmod 775 "$dir"
      local updated_perm
      updated_perm=$(stat -c "%a" "$dir" 2>/dev/null || echo "unknown")
      if [ "$updated_perm" != "775" ]; then
        echo "${RED}Error: Failed to secure storage directory with 775 permissions (current: ${updated_perm}).${RESET}" >&2
        exit 1
      fi
    fi
  else
    if [ "$JSON_OUTPUT" != "true" ] && [ "$VERBOSE" = "true" ]; then
      echo "${GREEN}[SECURITY] Storage directory permissions verified: 775 (drwxrwxr-x).${RESET}"
    fi
  fi
}

ensure_storage_security "$TARGET_DIR" "$EXEC_MODE"

# ==============================================================================
# Python Verification and Cleanup Engine
# ==============================================================================
python3 <(cat << 'PYEOF'
import os
import sys
import re
import json
import datetime
import hashlib
import zlib
import base64

def get_dir_permissions(path):
    if not os.path.exists(path):
        return "not_found"
    try:
        import stat
        st = os.stat(path)
        return oct(stat.S_IMODE(st.st_mode))[2:]
    except Exception:
        return "unknown"

def unescape_pdf_str(s):
    """Unescapes octal and basic PDF string escape sequences."""
    try:
        s = re.sub(r"\\([0-7]{1,3})", lambda m: chr(int(m.group(1), 8)), s)
    except Exception:
        pass
    s = s.replace(r"\(", "(").replace(r"\)", ")").replace(r"\\", "\\")
    return s

def verify_pdf_integrity(file_path):
    """
    Rigorously verifies PDF document integrity:
    1. Checks file existence and regular file status
    2. Validates non-empty size (>= 32 bytes)
    3. Verifies magic %PDF- header in first 1024 bytes
    4. Verifies %%EOF trailer marker in last 2048 bytes
    5. Checks cross-reference structure (startxref / xref / XRef streams)
    6. Verifies startxref offset validity (if present, within file boundaries)
    7. Validates existence of standard root / catalog or page dictionary references
    8. Computes SHA-256 hash for auditing
    """
    if not os.path.exists(file_path):
        return False, "File does not exist", None
    if not os.path.isfile(file_path):
        return False, "Path is not a regular file", None

    size = os.path.getsize(file_path)
    if size == 0:
        return False, "Empty file (0 bytes)", None
    if size < 32:
        return False, f"File truncated / too small for valid PDF ({size} bytes)", None

    try:
        with open(file_path, "rb") as f:
            data = f.read()
    except Exception as e:
        return False, f"Read error: {str(e)}", None

    sha256_hash = hashlib.sha256(data).hexdigest()

    # 1. Header check (%PDF- in first 1024 bytes)
    head = data[:1024]
    if b"%PDF-" not in head:
        return False, "Missing %PDF- magic header", sha256_hash

    # 2. Trailer check (%%EOF in last 2048 bytes)
    tail = data[-2048:] if len(data) > 2048 else data
    if b"%%EOF" not in tail:
        return False, "Missing %%EOF marker at end of file (truncated PDF)", sha256_hash

    # 3. Cross-reference check
    has_xref = (b"startxref" in tail or b"xref" in tail or
                b"/Type /XRef" in data or b"/Type/XRef" in data or
                b"/Type  /XRef" in data)
    if not has_xref:
        return False, "Missing xref table or startxref reference", sha256_hash

    # 4. Validate startxref offset if present
    startxref_matches = list(re.finditer(rb"startxref\s+([0-9]+)", tail))
    if startxref_matches:
        try:
            offset_val = int(startxref_matches[-1].group(1))
            if offset_val < 0 or offset_val >= size:
                return False, f"Corrupted startxref offset ({offset_val} >= {size})", sha256_hash
        except ValueError:
            return False, "Corrupted non-integer startxref offset", sha256_hash

    # 5. Root Catalog / Page Dictionary presence
    has_catalog = (b"/Catalog" in data or b"/Root" in data or b"/Pages" in data)
    if not has_catalog:
        return False, "Missing PDF root catalog or page structure", sha256_hash

    return True, "Valid PDF", sha256_hash

def parse_date_candidate(raw_str):
    """Attempts to parse multiple date/datetime formats into a UTC datetime."""
    s = raw_str.strip()
    s = re.sub(r"\s+(?:UTC|GMT|PET|[A-Z]{3,4})$", "", s)
    s = s.replace(".", "-").replace("/", "-")
    for fmt in [
        "%Y-%m-%d %H:%M:%S",
        "%Y-%m-%dT%H:%M:%S",
        "%Y-%m-%d",
        "%d-%m-%Y %H:%M:%S",
        "%d-%m-%Y",
        "%Y%m%d",
    ]:
        try:
            return datetime.datetime.strptime(s, fmt).replace(tzinfo=datetime.timezone.utc)
        except ValueError:
            pass
    try:
        return datetime.datetime.strptime(s[:10], "%Y-%m-%d").replace(tzinfo=datetime.timezone.utc)
    except ValueError:
        pass
    return None

def extract_expiration_info(file_path, is_valid_pdf, now_dt):
    """
    Extracts expiration dates or status from:
    1. Filename conventions (*exp_YYYY-MM-DD*, *expired*, *vencido*, etc.)
    2. Sidecar JSON files (<stem>.json)
    3. Document content (raw text and decompressed streams)
    """
    basename = os.path.basename(file_path)
    base_lower = basename.lower()

    # 1. Filename explicit keyword check
    if "expired" in base_lower or "vencid" in base_lower:
        return True, "filename_status", None

    # Filename date matching
    date_patterns = [
        r"(?:exp|expires|expiry|valid[_-]?until|vence|vencimiento|hasta)[-_.]?(\d{4}[-_.]\d{2}[-_.]\d{2}(?:[_\sT]\d{2}[-_.]\d{2}[-_.]\d{2})?)",
        r"(?:exp|expires|expiry)[-_.]?(\d{8})"
    ]
    for dp in date_patterns:
        m = re.search(dp, base_lower)
        if m:
            raw_d = m.group(1)
            exp_dt = parse_date_candidate(raw_d)
            if exp_dt:
                exp_date_str = exp_dt.strftime("%Y-%m-%d %H:%M:%S UTC")
                if exp_dt < now_dt:
                    return True, f"filename_date ({exp_date_str})", exp_date_str
                else:
                    return False, f"filename_future ({exp_date_str})", exp_date_str

    # 2. Sidecar JSON check
    stem = os.path.splitext(file_path)[0]
    sidecars = [stem + ".json", file_path + ".json"]
    for sidecar in sidecars:
        if os.path.exists(sidecar):
            try:
                with open(sidecar, "r", encoding="utf-8") as jf:
                    meta = json.load(jf)
                status = str(meta.get("status", "")).lower()
                if status in ["expired", "vencido", "vencida", "cancelled", "void"]:
                    return True, f"sidecar_status ({status})", None
                for date_key in ["expires_at", "expiration_date", "valid_until", "expiry_date", "expires", "vencimiento"]:
                    if date_key in meta and meta[date_key]:
                        d_val = str(meta[date_key])
                        exp_dt = parse_date_candidate(d_val)
                        if exp_dt:
                            exp_date_str = exp_dt.strftime("%Y-%m-%d %H:%M:%S UTC")
                            if exp_dt < now_dt:
                                return True, f"sidecar_{date_key} ({exp_date_str})", exp_date_str
                            else:
                                return False, f"sidecar_future ({exp_date_str})", exp_date_str
            except Exception:
                pass

    # 3. PDF Content stream examination (if PDF structure is readable)
    if is_valid_pdf:
        try:
            with open(file_path, "rb") as f:
                cdata = f.read()

            raw_text = cdata.decode("latin1", errors="ignore")
            decomp_parts = []
            for sm in re.finditer(rb"stream[\r\n]+(.*?)endstream", cdata, re.DOTALL):
                sb = sm.group(1).strip()
                try:
                    decomp_parts.append(zlib.decompress(sb).decode("latin1", errors="ignore"))
                except Exception:
                    pass
                try:
                    a85 = base64.a85decode(sb, adobe=True)
                    decomp_parts.append(zlib.decompress(a85).decode("latin1", errors="ignore"))
                except Exception:
                    pass

            full_stream = raw_text + "\n" + "\n".join(decomp_parts)
            tokens = [unescape_pdf_str(x) for x in re.findall(r"\((.*?)\)", full_stream)]
            plain_text = full_stream + "\n" + " ".join(tokens)

            content_patterns = [
                r"(?i)(?:expiraci[oó]n(?:\s+estimada)?|expires|expiration(?:\s+date)?|valid[\s_-]*until|vigencia|vencimiento|validez)[\s:=]+([0-9]{4}[-/][0-9]{2}[-/][0-9]{2}(?:[\sT][0-9]{2}:[0-9]{2}:[0-9]{2})?)",
                r"(?i)(?:expiraci[oó]n(?:\s+estimada)?|expires|expiration(?:\s+date)?|valid[\s_-]*until|vigencia|vencimiento|validez)[\s:=]+([0-9]{2}/[0-9]{2}/[0-9]{4})",
                r"(?i)(?:status|estado)[\s:=]+(expired|vencid[oa]|expirad[oa])"
            ]

            for cp in content_patterns:
                m = re.search(cp, plain_text)
                if m:
                    val = m.group(1).lower()
                    if "expired" in val or "vencid" in val or "expirad" in val:
                        return True, f"content_status ({val})", None
                    else:
                        exp_dt = parse_date_candidate(m.group(1))
                        if exp_dt:
                            exp_date_str = exp_dt.strftime("%Y-%m-%d %H:%M:%S UTC")
                            if exp_dt < now_dt:
                                return True, f"content_date ({exp_date_str})", exp_date_str
                            else:
                                return False, f"content_future ({exp_date_str})", exp_date_str
        except Exception:
            pass

    return False, None, None

def find_quote_pdfs(directory):
    pdf_files = []
    if not os.path.exists(directory):
        return pdf_files
    for root, _, files in os.walk(directory):
        for f in files:
            if f.lower().endswith(".pdf"):
                pdf_files.append(os.path.join(root, f))
    pdf_files.sort()
    return pdf_files

def cleanup_sidecars(pdf_path):
    removed_sidecars = []
    stem = os.path.splitext(pdf_path)[0]
    possible_extensions = [".json", ".sha256", ".pdf.sha256", ".txt"]
    for ext in possible_extensions:
        candidate = stem + ext
        if os.path.exists(candidate) and candidate != pdf_path:
            try:
                os.remove(candidate)
                removed_sidecars.append(candidate)
            except Exception:
                pass
        cand2 = pdf_path + ext
        if os.path.exists(cand2) and cand2 != pdf_path and cand2 not in removed_sidecars:
            try:
                os.remove(cand2)
                removed_sidecars.append(cand2)
            except Exception:
                pass
    return removed_sidecars

def format_size(bytes_num):
    if bytes_num < 1024:
        return f"{bytes_num} B"
    elif bytes_num < 1024 * 1024:
        return f"{bytes_num / 1024:.1f} KB"
    else:
        return f"{bytes_num / (1024 * 1024):.2f} MB"

def main():
    target_dir = sys.argv[1]
    retention_days = int(sys.argv[2])
    mode = sys.argv[3]
    clean_corrupted = sys.argv[4].lower() == "true"
    verbose = sys.argv[5].lower() == "true"
    json_mode = sys.argv[6].lower() == "true"

    now_dt = datetime.datetime.now(datetime.timezone.utc)
    dir_perms = get_dir_permissions(target_dir)

    all_pdfs = find_quote_pdfs(target_dir)

    file_results = []
    total_scanned = len(all_pdfs)
    valid_count = 0
    corrupted_count = 0
    older_count = 0
    expired_count = 0
    to_delete_count = 0
    to_delete_bytes = 0
    retained_count = 0

    for fpath in all_pdfs:
        is_valid, integrity_reason, sha256_hash = verify_pdf_integrity(fpath)
        stat_info = os.stat(fpath) if os.path.exists(fpath) else None
        size_bytes = stat_info.st_size if stat_info else 0
        mtime_dt = datetime.datetime.fromtimestamp(stat_info.st_mtime, tz=datetime.timezone.utc) if stat_info else now_dt
        age_days = max(0.0, (now_dt - mtime_dt).total_seconds() / 86400.0)

        is_older = age_days >= retention_days
        is_expired, exp_source, exp_date = extract_expiration_info(fpath, is_valid, now_dt)

        if is_valid:
            valid_count += 1
        else:
            corrupted_count += 1

        if is_older:
            older_count += 1
        elif is_expired:
            expired_count += 1

        # Decision tree
        should_delete = False
        decision_reason = ""
        action_label = "RETAIN"

        if is_older:
            should_delete = True
            decision_reason = f"Age ({age_days:.1f}d) exceeds {retention_days}d retention limit"
            action_label = "DELETE (Retention)"
        elif is_expired:
            should_delete = True
            decision_reason = f"Expired quote [{exp_source}]"
            action_label = "DELETE (Expired)"
        elif not is_valid and clean_corrupted:
            should_delete = True
            decision_reason = f"Corrupted PDF [{integrity_reason}]"
            action_label = "DELETE (Corrupted)"
        elif not is_valid and not clean_corrupted:
            should_delete = False
            decision_reason = f"Integrity error [{integrity_reason}] (run with --clean-corrupted to delete)"
            action_label = "FLAG_CORRUPTED"
        else:
            should_delete = False
            decision_reason = f"Active quote within retention window (age: {age_days:.1f}d)"
            action_label = "RETAIN"

        if should_delete:
            to_delete_count += 1
            to_delete_bytes += size_bytes
        else:
            retained_count += 1

        file_results.append({
            "path": fpath,
            "filename": os.path.basename(fpath),
            "size_bytes": size_bytes,
            "sha256": sha256_hash,
            "age_days": round(age_days, 2),
            "is_valid": is_valid,
            "integrity_reason": integrity_reason,
            "is_older_than_retention": is_older,
            "is_expired": is_expired,
            "expiration_source": exp_source,
            "expiration_date": exp_date,
            "should_delete": should_delete,
            "action": action_label,
            "reason": decision_reason
        })

    # JSON Output mode
    if json_mode:
        report = {
            "timestamp": now_dt.isoformat(),
            "target_directory": target_dir,
            "permissions": dir_perms,
            "permissions_secure": dir_perms == "775",
            "mode": mode,
            "retention_days": retention_days,
            "clean_corrupted_enabled": clean_corrupted,
            "summary": {
                "total_scanned": total_scanned,
                "valid_pdfs": valid_count,
                "corrupted_pdfs": corrupted_count,
                "older_than_retention": older_count,
                "expired_quotes": expired_count,
                "eligible_for_deletion": to_delete_count,
                "bytes_eligible_for_deletion": to_delete_bytes,
                "actually_deleted_count": 0,
                "actually_deleted_bytes": 0,
                "retained_quotes": retained_count,
                "sidecars_removed": 0
            },
            "files": file_results
        }
        if mode == "force" and to_delete_count > 0:
            del_count = 0
            del_bytes = 0
            sc_count = 0
            for item in file_results:
                if item["should_delete"]:
                    try:
                        os.remove(item["path"])
                        del_count += 1
                        del_bytes += item["size_bytes"]
                        sc = cleanup_sidecars(item["path"])
                        sc_count += len(sc)
                        item["deleted"] = True
                    except Exception as e:
                        item["deleted"] = False
                        item["deletion_error"] = str(e)
            report["summary"]["actually_deleted_count"] = del_count
            report["summary"]["actually_deleted_bytes"] = del_bytes
            report["summary"]["sidecars_removed"] = sc_count
        print(json.dumps(report, indent=2))
        return

    # Human-Readable Formatted Output
    print("=" * 80)
    print(" Controlnautas B2B — Quote Storage Retention & PDF Integrity Guard")
    print(f" Timestamp:           {now_dt.strftime('%Y-%m-%d %H:%M:%S UTC')}")
    print(f" Target Directory:    {target_dir}")
    print(f" Directory Perms:     {dir_perms} {'(Secure 775 OK)' if dir_perms == '775' else '(ATTENTION: Expected 775)'}")
    print(f" Execution Mode:      {mode.upper()}")
    print(f" Retention Threshold: {retention_days} days")
    print("=" * 80)

    if total_scanned == 0:
        print("\n [INFO] Storage directory contains 0 quote PDF files. Nothing to process.\n")
        print("=" * 80)
        return

    print(f"\nDiscovered {total_scanned} PDF file(s) in storage:")
    print("-" * 80)

    for item in file_results:
        fn = item["filename"]
        sz = format_size(item["size_bytes"])
        age = f"{item['age_days']:.1f}d"

        if item["is_valid"]:
            int_badge = "[OK]"
        else:
            int_badge = "[CORRUPT]"

        if item["should_delete"]:
            act_str = f"--> WOULD DELETE ({item['reason']})"
        elif not item["is_valid"]:
            act_str = f"--> {item['action']} ({item['reason']})"
        else:
            act_str = f"--> {item['action']}"

        print(f" {int_badge:<9} {fn:<42} | {sz:>9} | Age: {age:>5} {act_str}")

        if verbose:
            if item["sha256"]:
                print(f"           SHA-256: {item['sha256']}")
            if not item["is_valid"]:
                print(f"           Integrity Diagnostic: {item['integrity_reason']}")
            if item["is_expired"]:
                print(f"           Expiration Detail: Source={item['expiration_source']} Date={item['expiration_date']}")

    print("\n" + "=" * 80)
    print(" SUMMARY STATISTICS")
    print("-" * 80)
    print(f"  Total Quotes Scanned:       {total_scanned}")
    print(f"  Integrity Verification:     {valid_count} Valid ({valid_count/total_scanned*100:.1f}%), {corrupted_count} Corrupted")
    print(f"  Retention Exceeded (> {retention_days}d): {older_count}")
    print(f"  Explicitly Expired Quotes:  {expired_count}")
    print(f"  Quotes Retained in Storage: {retained_count}")
    print(f"  Eligible for Deletion:      {to_delete_count} ({format_size(to_delete_bytes)} reclaimable)")
    print("=" * 80)

    # Deletion handling for force and interactive modes
    should_execute_delete = False
    if mode == "force":
        should_execute_delete = True
    elif mode == "interactive" and to_delete_count > 0:
        if sys.stdin.isatty():
            try:
                print()
                ans = input(f"Permanently delete these {to_delete_count} eligible quote file(s)? [y/N]: ").strip().lower()
                if ans in ["y", "yes"]:
                    should_execute_delete = True
                else:
                    print("\nOperation cancelled by user. No files were deleted.")
            except (EOFError, KeyboardInterrupt):
                print("\nOperation cancelled.")
        else:
            print("\n[NOTICE] Non-interactive mode detected without --force. Use --force to execute deletion.")

    if should_execute_delete and to_delete_count > 0:
        print("\nExecuting deletion of eligible quote files...")
        actually_deleted_count = 0
        actually_deleted_bytes = 0
        deleted_sidecars_list = []

        for item in file_results:
            if item["should_delete"]:
                try:
                    fsize = item["size_bytes"]
                    os.remove(item["path"])
                    actually_deleted_count += 1
                    actually_deleted_bytes += fsize
                    sidecars = cleanup_sidecars(item["path"])
                    deleted_sidecars_list.extend(sidecars)
                    print(f"  - Deleted: {item['filename']} ({format_size(fsize)})")
                except Exception as e:
                    print(f"  - Failed to delete {item['filename']}: {e}")

        if deleted_sidecars_list:
            print("\nCleaned associated metadata sidecars:")
            for sc in deleted_sidecars_list:
                print(f"  - Removed sidecar: {os.path.basename(sc)}")

        print("\n" + "=" * 80)
        print(" EXECUTION RESULTS")
        print("-" * 80)
        print(f"  Files Permanently Deleted:  {actually_deleted_count}")
        print(f"  Space Reclaimed:            {format_size(actually_deleted_bytes)}")
        print(f"  Sidecar Files Cleaned:      {len(deleted_sidecars_list)}")
        print(f"  Quotes Remaining:           {retained_count}")
        print("=" * 80)

if __name__ == "__main__":
    main()
PYEOF
) "$TARGET_DIR" "$RETENTION_DAYS" "$EXEC_MODE" "$CLEAN_CORRUPTED" "$VERBOSE" "$JSON_OUTPUT"

# Re-verify permissions to ensure they remain 775
ensure_storage_security "$TARGET_DIR" "$EXEC_MODE"
