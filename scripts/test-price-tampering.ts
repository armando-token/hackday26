/**
 * Security & Integrity Test Suite: Client Price & Stock Tampering Defense
 * Gate 3 (Puerta 3) — Controlnautas × Meta Muse (Hack Day 2026)
 *
 * Requirements:
 * 1. Send POST /api/muse/v1/preliminary-quotes with malicious injected fields:
 *    {
 *      variant_id: <PLC_VARIANT_ID>,
 *      quantity: 1,
 *      unit_price: 1.00,
 *      unit_price_minor: 100,
 *      subtotal: 1.00,
 *      subtotal_minor: 100,
 *      price: 0.05,
 *      in_stock: 9999
 *    }
 * 2. Verify response status is 201 and summary.unit_price is 890 (NOT 1.00 or 0.05).
 * 3. Verify that DB record in preliminary_quote has unit_price_decimal = 890.00.
 * 4. Verify that generated PDF contains 890 and NOT the injected price.
 * 5. Report PASS/FAIL clearly.
 *
 * Execution:
 *   npx tsx scripts/test-price-tampering.ts [options]
 */

import fs from "fs"
import path from "path"
import http from "http"
import https from "https"
import crypto from "crypto"
import { execSync, spawnSync } from "child_process"

// ============================================================================
// ANSI Color Constants & Styling
// ============================================================================
const RESET = "\x1b[0m"
const BOLD = "\x1b[1m"
const DIM = "\x1b[2m"
const GREEN = "\x1b[32m"
const RED = "\x1b[31m"
const YELLOW = "\x1b[33m"
const CYAN = "\x1b[36m"
const MAGENTA = "\x1b[35m"
const GRAY = "\x1b[90m"

// ============================================================================
// Configuration & Environment Resolution
// ============================================================================
const SCRIPT_DIR = __dirname
const WORKSPACE_ROOT = path.resolve(SCRIPT_DIR, "..")
const MANIFEST_PATH = path.join(WORKSPACE_ROOT, "hackday-demo-manifest.json")
const BACKEND_ENV_PATH = path.join(WORKSPACE_ROOT, "b2b-backend/apps/backend/.env")
const STORAGE_QUOTES_DIR = path.join(WORKSPACE_ROOT, "storage/quotes")

// Parse CLI flags
const cliArgs = process.argv.slice(2)
let cliBaseUrl: string | undefined
let cliToken: string | undefined
let cliVariantId: string | undefined

for (let i = 0; i < cliArgs.length; i++) {
  if (cliArgs[i] === "--base-url" && cliArgs[i + 1]) {
    cliBaseUrl = cliArgs[++i]
  } else if (cliArgs[i] === "--token" && cliArgs[i + 1]) {
    cliToken = cliArgs[++i]
  } else if (cliArgs[i] === "--variant" && cliArgs[i + 1]) {
    cliVariantId = cliArgs[++i]
  } else if (cliArgs[i] === "--help" || cliArgs[i] === "-h") {
    console.log(`
Usage: npx tsx scripts/test-price-tampering.ts [options]

Options:
  --base-url <url>      Base URL of Medusa backend (default: http://127.0.0.1:9000)
  --token <token>       MUSE API Bearer Token
  --variant <id>        Variant ID for PLC demo product
  --help, -h            Show this help message
`)
    process.exit(0)
  }
}

const BASE_URL = (
  cliBaseUrl ||
  process.env.MUSE_BASE_URL ||
  process.env.MEDUSA_BACKEND_URL ||
  "http://127.0.0.1:9000"
).replace(/\/+$/, "")

/**
 * Resolves MUSE_API_TOKEN from CLI, process.env, or b2b-backend/apps/backend/.env
 */
function resolveMuseToken(): string {
  if (cliToken && cliToken.trim().length > 0) {
    return cliToken.trim()
  }

  if (process.env.MUSE_API_TOKEN && process.env.MUSE_API_TOKEN.trim().length > 0) {
    return process.env.MUSE_API_TOKEN.trim()
  }

  if (fs.existsSync(BACKEND_ENV_PATH)) {
    const content = fs.readFileSync(BACKEND_ENV_PATH, "utf8")
    const match = content.match(/^MUSE_API_TOKEN=(.+)$/m)
    if (match && match[1]) {
      const token = match[1].trim().replace(/^["']|["']$/g, "")
      if (token) return token
    }
  }

  throw new Error(
    `[Config Error] MUSE_API_TOKEN could not be resolved from environment or ${BACKEND_ENV_PATH}`
  )
}

/**
 * Resolves PLC Variant ID (SKU: CN-X5PRIME-HE-XP5)
 */
function resolvePlcVariantId(): { variantId: string; sku: string; officialPrice: number } {
  const TARGET_SKU = "CN-X5PRIME-HE-XP5"
  let variantId = ""

  if (cliVariantId && cliVariantId.trim().length > 0) {
    return { variantId: cliVariantId.trim(), sku: TARGET_SKU, officialPrice: 890 }
  }

  // 1. Try manifest
  if (fs.existsSync(MANIFEST_PATH)) {
    try {
      const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8"))
      const products = manifest.products || manifest
      if (products[TARGET_SKU]?.variant_id) {
        variantId = products[TARGET_SKU].variant_id
      }
    } catch {
      // fallback to DB below
    }
  }

  // 2. Try DB fallback
  if (!variantId) {
    try {
      const sql = `
        SELECT pv.id as variant_id, pv.sku
        FROM product_variant pv
        INNER JOIN technical_profile tp ON tp.variant_id = pv.id
        WHERE pv.sku = '${TARGET_SKU}' AND pv.deleted_at IS NULL AND tp.demo = true
        LIMIT 1;
      `
      const wrapped = `SELECT json_agg(t) FROM (${sql.trim().replace(/;+$/, "")}) t;`
      const out = execSync(
        `PGPASSWORD=password psql -U postgres -h localhost -d medusa -t -A -c "${wrapped}"`,
        { encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] }
      ).trim()

      if (out) {
        const rows = JSON.parse(out)
        if (rows && rows[0]?.variant_id) {
          variantId = rows[0].variant_id
        }
      }
    } catch (e: any) {
      // Ignore db error
    }
  }

  if (!variantId) {
    throw new Error(
      `Could not resolve PLC variant ID for SKU '${TARGET_SKU}'. Verify database or manifest.`
    )
  }

  return {
    variantId,
    sku: TARGET_SKU,
    officialPrice: 890,
  }
}

// ============================================================================
// Database Helper
// ============================================================================
function queryDb<T = any>(sql: string): T[] {
  const wrapped = `SELECT json_agg(t) FROM (${sql.trim().replace(/;+$/, "")}) t;`
  try {
    const out = execSync(
      `PGPASSWORD=password psql -U postgres -h localhost -d medusa -t -A -c "${wrapped}"`,
      { encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] }
    ).trim()
    if (!out || out === "") return []
    return JSON.parse(out) || []
  } catch (err: any) {
    console.error(`[DB Error] Failed to execute SQL: ${err.message}`)
    return []
  }
}

// ============================================================================
// PDF Text Extractor Helper (Python Flate/ASCII85 Decompressor via Stdin)
// ============================================================================
function extractTextFromPdf(pdfPath: string): string {
  if (!fs.existsSync(pdfPath)) {
    throw new Error(`PDF file does not exist at path: ${pdfPath}`)
  }

  const pyScript = [
    "import sys, re, base64, zlib",
    "",
    "pdf_path = sys.argv[1]",
    "with open(pdf_path, 'rb') as f:",
    "    data = f.read()",
    "",
    "extracted = []",
    "pos = 0",
    "while True:",
    "    s_idx = data.find(b'stream', pos)",
    "    if s_idx == -1: break",
    "    e_idx = data.find(b'endstream', s_idx)",
    "    if e_idx == -1: break",
    "    content_start = s_idx + 6",
    "    while content_start < e_idx and data[content_start:content_start+1] in b'\\r\\n ':",
    "        content_start += 1",
    "    content_end = e_idx",
    "    while content_end > content_start and data[content_end-1:content_end] in b'\\r\\n ':",
    "        content_end -= 1",
    "    stream_bytes = data[content_start:content_end]",
    "    pos = e_idx + 9",
    "    try:",
    "        a85 = base64.a85decode(stream_bytes, adobe=True)",
    "        dec = zlib.decompress(a85)",
    "        extracted.append(dec.decode('latin1', errors='replace'))",
    "        continue",
    "    except Exception:",
    "        pass",
    "    try:",
    "        dec = zlib.decompress(stream_bytes)",
    "        extracted.append(dec.decode('latin1', errors='replace'))",
    "        continue",
    "    except Exception:",
    "        pass",
    "    extracted.append(stream_bytes.decode('latin1', errors='replace'))",
    "",
    "raw_text = '\\n'.join(extracted)",
    "def unescape_octal(match):",
    "    try:",
    "        return chr(int(match.group(1), 8))",
    "    except Exception:",
    "        return match.group(0)",
    "clean_text = re.sub(r'\\\\([0-7]{3})', unescape_octal, raw_text)",
    "sys.stdout.write(clean_text)",
  ].join("\n")

  const proc = spawnSync("python3", ["-", pdfPath], {
    input: pyScript,
    encoding: "utf8",
    maxBuffer: 25 * 1024 * 1024,
  })

  if (proc.error) {
    throw new Error(`Failed to spawn Python PDF extractor: ${proc.error.message}`)
  }
  if (proc.status !== 0) {
    throw new Error(`PDF text extraction exited with code ${proc.status}: ${proc.stderr}`)
  }

  return proc.stdout || ""
}

// ============================================================================
// HTTP Client Implementation
// ============================================================================
interface HttpResponse<T = any> {
  status: number
  headers: Record<string, string>
  rawBody: string
  data: T | null
}

function httpRequest<T = any>(
  urlStr: string,
  options: {
    method?: string
    headers?: Record<string, string>
    body?: any
    timeoutMs?: number
  } = {}
): Promise<HttpResponse<T>> {
  return new Promise((resolve, reject) => {
    const parsed = new URL(urlStr)
    const isHttps = parsed.protocol === "https:"
    const client = isHttps ? https : http

    const method = (options.method || "GET").toUpperCase()
    const headers = { ...(options.headers || {}) }

    let payload: string | undefined
    if (options.body !== undefined) {
      if (typeof options.body === "string") {
        payload = options.body
      } else {
        payload = JSON.stringify(options.body)
        if (!headers["Content-Type"] && !headers["content-type"]) {
          headers["Content-Type"] = "application/json"
        }
      }
      headers["Content-Length"] = Buffer.byteLength(payload).toString()
    }

    const req = client.request(
      urlStr,
      {
        method,
        headers,
        timeout: options.timeoutMs || 15000,
      },
      (res) => {
        const chunks: Buffer[] = []
        res.on("data", (chunk) => chunks.push(chunk))
        res.on("end", () => {
          const rawBody = Buffer.concat(chunks).toString("utf8")
          let data: any = null
          try {
            data = JSON.parse(rawBody)
          } catch {
            data = null
          }

          const respHeaders: Record<string, string> = {}
          for (const [k, v] of Object.entries(res.headers)) {
            if (v !== undefined) {
              respHeaders[k.toLowerCase()] = Array.isArray(v) ? v.join(", ") : v
            }
          }

          resolve({
            status: res.statusCode || 0,
            headers: respHeaders,
            rawBody,
            data,
          })
        })
      }
    )

    req.on("error", reject)
    req.on("timeout", () => {
      req.destroy()
      reject(new Error(`HTTP request timed out after ${options.timeoutMs || 15000}ms: ${urlStr}`))
    })

    if (payload) {
      req.write(payload)
    }
    req.end()
  })
}

/**
 * Downloads a binary file (PDF) from an endpoint
 */
function downloadBinary(
  urlStr: string,
  options: {
    headers?: Record<string, string>
    timeoutMs?: number
  } = {}
): Promise<{ status: number; headers: Record<string, string>; buffer: Buffer }> {
  return new Promise((resolve, reject) => {
    const parsed = new URL(urlStr)
    const client = parsed.protocol === "https:" ? https : http

    const req = client.request(
      urlStr,
      {
        method: "GET",
        headers: options.headers || {},
        timeout: options.timeoutMs || 15000,
      },
      (res) => {
        const chunks: Buffer[] = []
        res.on("data", (chunk) => chunks.push(chunk))
        res.on("end", () => {
          const buffer = Buffer.concat(chunks)
          const respHeaders: Record<string, string> = {}
          for (const [k, v] of Object.entries(res.headers)) {
            if (v !== undefined) {
              respHeaders[k.toLowerCase()] = Array.isArray(v) ? v.join(", ") : v
            }
          }
          resolve({
            status: res.statusCode || 0,
            headers: respHeaders,
            buffer,
          })
        })
      }
    )

    req.on("error", reject)
    req.on("timeout", () => {
      req.destroy()
      reject(new Error(`Binary download timed out after ${options.timeoutMs || 15000}ms: ${urlStr}`))
    })
    req.end()
  })
}

/**
 * Resolves a downloadable URL by replacing public EC2 IP with localhost
 * to bypass AWS EC2 hairpin NAT limitations when called from localhost.
 */
function resolveDownloadUrl(rawUrl: string): string {
  if (rawUrl.startsWith("/")) {
    return `${BASE_URL}${rawUrl}`
  }
  // Replace 52.20.66.203 with BASE_URL host/port
  return rawUrl.replace(/https?:\/\/52\.20\.66\.203(:\d+)?/, BASE_URL)
}

/**
 * Wait for backend readiness with retry loop
 */
async function waitForBackend(maxWaitSec = 60): Promise<void> {
  const start = Date.now()
  process.stdout.write(`[Readiness] Probing backend at ${BASE_URL}... `)

  while ((Date.now() - start) / 1000 < maxWaitSec) {
    try {
      const res = await httpRequest(`${BASE_URL}/api/muse/v1/products/search?limit=1`, {
        timeoutMs: 2500,
      })
      if (res.status === 401 || res.status === 200) {
        console.log(`${GREEN}Connected (API routes active, HTTP ${res.status})${RESET}`)
        return
      }
    } catch {
      // Waiting for socket
    }
    await new Promise((r) => setTimeout(r, 1500))
    process.stdout.write(".")
  }

  console.log(`\n${YELLOW}Proceeding with test execution...${RESET}`)
}

// ============================================================================
// Test Results Aggregator
// ============================================================================
interface AssertionResult {
  code: string
  name: string
  passed: boolean
  expected: string
  actual: string
  details?: any
}

const assertions: AssertionResult[] = []

function assertCheck(
  code: string,
  name: string,
  condition: boolean,
  expected: string,
  actual: string,
  details?: any
): boolean {
  assertions.push({
    code,
    name,
    passed: condition,
    expected,
    actual,
    details,
  })

  const badge = condition ? `${GREEN}✔ PASS${RESET}` : `${RED}✘ FAIL${RESET}`
  console.log(`  [${code}] ${name.padEnd(60)} -> ${badge}`)
  if (!condition) {
    console.log(`     ${RED}Expected: ${expected}${RESET}`)
    console.log(`     ${RED}Actual:   ${actual}${RESET}`)
    if (details) {
      console.log(`     ${RED}Details:  ${typeof details === "object" ? JSON.stringify(details) : details}${RESET}`)
    }
  }
  return condition
}

// ============================================================================
// Main Security Test Suite
// ============================================================================
export async function runPriceTamperingSuite(): Promise<boolean> {
  console.log(`\n${BOLD}${CYAN}==============================================================================${RESET}`)
  console.log(`${BOLD}${CYAN}    CONTROLNAUTAS × META MUSE — SECURITY TEST SUITE: PRICE TAMPERING DEFENSE   ${RESET}`)
  console.log(`${BOLD}${CYAN}    Target: POST /api/muse/v1/preliminary-quotes & Server-Side Price Integrity ${RESET}`)
  console.log(`${BOLD}${CYAN}==============================================================================${RESET}\n`)

  await waitForBackend(60)

  const token = resolveMuseToken()
  const plc = resolvePlcVariantId()

  console.log(`${BOLD}Configuration:${RESET}`)
  console.log(`  * Base URL:            ${CYAN}${BASE_URL}${RESET}`)
  console.log(`  * PLC Variant ID:      ${CYAN}${plc.variantId}${RESET} (${plc.sku})`)
  console.log(`  * Official Catalog P.: ${CYAN}PEN ${plc.officialPrice}.00${RESET}`)
  console.log(`  * Bearer Token:        ${CYAN}SHA256=${crypto.createHash("sha256").update(token).digest("hex").slice(0, 16)}...${RESET}\n`)

  // ==========================================================================
  // REQUIREMENT 1 & 2: Primary Malicious Payload Injection
  // ==========================================================================
  console.log(`${BOLD}${YELLOW}--- [STAGE 1] Primary Malicious Price & Stock Tampering Attack ---${RESET}`)
  console.log(`Injecting attacker-controlled fields: unit_price=1.00, price=0.05, in_stock=9999...`)

  const maliciousPayload = {
    variant_id: plc.variantId,
    quantity: 1,
    unit_price: 1.0,
    unit_price_minor: 100,
    subtotal: 1.0,
    subtotal_minor: 100,
    price: 0.05,
    in_stock: 9999,
    idempotency_key: `sec-tamper-primary-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`,
  }

  const endpoint = `${BASE_URL}/api/muse/v1/preliminary-quotes`
  const res = await httpRequest(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: maliciousPayload,
  })

  // 1. Verify HTTP Status is 201 Created
  assertCheck(
    "SEC-REQ-1.1",
    "HTTP Response Status is 201 Created",
    res.status === 201,
    "HTTP 201",
    `HTTP ${res.status}`,
    res.data?.error || res.rawBody
  )

  const data = res.data || {}
  const summary = data.summary || {}

  // 2. Verify summary.unit_price is 890 (NOT 1.00 or 0.05)
  assertCheck(
    "SEC-REQ-2.1",
    "Response summary.unit_price is strictly 890 (server-calculated)",
    summary.unit_price === plc.officialPrice,
    `summary.unit_price === ${plc.officialPrice}`,
    `summary.unit_price === ${summary.unit_price}`,
    summary
  )

  assertCheck(
    "SEC-REQ-2.2",
    "Injected malicious unit_price (1.00) is NOT accepted in response",
    summary.unit_price !== 1.0 && summary.unit_price !== 1,
    "summary.unit_price !== 1.00",
    `summary.unit_price === ${summary.unit_price}`
  )

  assertCheck(
    "SEC-REQ-2.3",
    "Injected malicious price (0.05) is NOT accepted in response",
    summary.unit_price !== 0.05,
    "summary.unit_price !== 0.05",
    `summary.unit_price === ${summary.unit_price}`
  )

  assertCheck(
    "SEC-REQ-2.4",
    "Response summary.subtotal is strictly 890 (server-calculated for qty=1)",
    summary.subtotal === plc.officialPrice,
    `summary.subtotal === ${plc.officialPrice}`,
    `summary.subtotal === ${summary.subtotal}`
  )

  assertCheck(
    "SEC-REQ-2.5",
    "Injected malicious subtotal (1.00) is NOT accepted in response",
    summary.subtotal !== 1.0 && summary.subtotal !== 1,
    "summary.subtotal !== 1.00",
    `summary.subtotal === ${summary.subtotal}`
  )

  const quoteId = data.quote_id
  const opaqueId = data.opaque_public_id
  const pdfUrl = data.pdf_url

  assertCheck(
    "SEC-REQ-2.6",
    "Response contains valid quote identifiers (quote_id, opaque_public_id, pdf_url)",
    Boolean(quoteId && opaqueId && pdfUrl),
    "quote_id, opaque_public_id, pdf_url non-empty",
    `quote_id=${quoteId}, opaque_public_id=${opaqueId}, pdf_url=${pdfUrl}`
  )

  // ==========================================================================
  // REQUIREMENT 3: Database Record Verification (PostgreSQL preliminary_quote)
  // ==========================================================================
  console.log(`\n${BOLD}${YELLOW}--- [STAGE 2] Database Record Verification (Table preliminary_quote) ---${RESET}`)
  console.log(`Querying DB for record with quote_id='${quoteId}' or opaque_public_id='${opaqueId}'...`)

  const dbRows = queryDb(`
    SELECT 
      id,
      opaque_public_id,
      status,
      variant_id,
      sku,
      quantity,
      currency,
      unit_price_minor,
      unit_price_decimal,
      subtotal_minor,
      subtotal_decimal,
      pdf_storage_key,
      download_token,
      availability_snapshot_json,
      metadata
    FROM preliminary_quote
    WHERE id = '${quoteId}' OR opaque_public_id = '${opaqueId}'
    LIMIT 1;
  `)

  const dbRecord = dbRows[0]

  assertCheck(
    "SEC-REQ-3.1",
    "Database record exists in preliminary_quote table",
    Boolean(dbRecord),
    "1 row returned",
    dbRecord ? `Found row id=${dbRecord.id}` : "0 rows found"
  )

  if (dbRecord) {
    const dbUnitPriceDec = parseFloat(dbRecord.unit_price_decimal)
    const dbSubtotalDec = parseFloat(dbRecord.subtotal_decimal)
    const dbUnitPriceMinor = Number(dbRecord.unit_price_minor)
    const dbSubtotalMinor = Number(dbRecord.subtotal_minor)

    assertCheck(
      "SEC-REQ-3.2",
      "DB preliminary_quote.unit_price_decimal is strictly 890.00",
      dbUnitPriceDec === 890.0,
      "unit_price_decimal == 890.00",
      `unit_price_decimal == ${dbRecord.unit_price_decimal}`
    )

    assertCheck(
      "SEC-REQ-3.3",
      "DB preliminary_quote.unit_price_decimal does NOT match injected price 1.00",
      dbUnitPriceDec !== 1.0,
      "unit_price_decimal != 1.00",
      `unit_price_decimal == ${dbRecord.unit_price_decimal}`
    )

    assertCheck(
      "SEC-REQ-3.4",
      "DB preliminary_quote.unit_price_decimal does NOT match injected price 0.05",
      dbUnitPriceDec !== 0.05,
      "unit_price_decimal != 0.05",
      `unit_price_decimal == ${dbRecord.unit_price_decimal}`
    )

    assertCheck(
      "SEC-REQ-3.5",
      "DB preliminary_quote.unit_price_minor is 89000 (890 * 100 centavos PEN)",
      dbUnitPriceMinor === 89000,
      "unit_price_minor == 89000",
      `unit_price_minor == ${dbRecord.unit_price_minor}`
    )

    assertCheck(
      "SEC-REQ-3.6",
      "DB preliminary_quote.subtotal_decimal is strictly 890.00",
      dbSubtotalDec === 890.0,
      "subtotal_decimal == 890.00",
      `subtotal_decimal == ${dbRecord.subtotal_decimal}`
    )

    assertCheck(
      "SEC-REQ-3.7",
      "DB preliminary_quote.subtotal_minor is 89000 (NOT injected 100 centavos)",
      dbSubtotalMinor === 89000 && dbSubtotalMinor !== 100,
      "subtotal_minor == 89000",
      `subtotal_minor == ${dbRecord.subtotal_minor}`
    )

    // Check inventory snapshot is authentic, not injected 9999
    const availSnapshot =
      typeof dbRecord.availability_snapshot_json === "string"
        ? JSON.parse(dbRecord.availability_snapshot_json)
        : dbRecord.availability_snapshot_json || {}

    assertCheck(
      "SEC-REQ-3.8",
      "DB availability_snapshot_json does NOT contain attacker-injected stock 9999",
      availSnapshot.available_quantity !== 9999 &&
        availSnapshot.stocked_quantity !== 9999 &&
        availSnapshot.in_stock !== 9999,
      "Stock reflects actual physical inventory (3 units), not 9999",
      `available_quantity=${availSnapshot.available_quantity}, stocked=${availSnapshot.stocked_quantity}`
    )
  }

  // ==========================================================================
  // REQUIREMENT 4: Generated PDF Content Verification
  // ==========================================================================
  console.log(`\n${BOLD}${YELLOW}--- [STAGE 3] Generated PDF Content Verification ---${RESET}`)

  let localPdfPath = ""
  if (dbRecord?.pdf_storage_key) {
    localPdfPath = path.isAbsolute(dbRecord.pdf_storage_key)
      ? dbRecord.pdf_storage_key
      : path.join(WORKSPACE_ROOT, "storage", dbRecord.pdf_storage_key)
  }
  if (!fs.existsSync(localPdfPath) && opaqueId) {
    localPdfPath = path.join(STORAGE_QUOTES_DIR, `${opaqueId}.pdf`)
  }

  console.log(`Resolving PDF document at: ${CYAN}${localPdfPath}${RESET}`)

  assertCheck(
    "SEC-REQ-4.1",
    "Generated PDF file exists on filesystem",
    fs.existsSync(localPdfPath),
    "File exists",
    fs.existsSync(localPdfPath) ? `Exists (${fs.statSync(localPdfPath).size} bytes)` : "File not found"
  )

  // Download PDF via HTTP endpoint (using hairpin-safe URL)
  if (pdfUrl) {
    const downloadEndpoint = resolveDownloadUrl(pdfUrl)
    console.log(`Testing HTTP PDF download from: ${CYAN}${downloadEndpoint}${RESET}`)
    try {
      const dlRes = await downloadBinary(downloadEndpoint)
      assertCheck(
        "SEC-REQ-4.2",
        "Public PDF download endpoint returns HTTP 200 with application/pdf",
        dlRes.status === 200 && (dlRes.headers["content-type"]?.includes("pdf") || dlRes.buffer.length > 1000),
        "HTTP 200, Content-Type: application/pdf",
        `HTTP ${dlRes.status}, Content-Type: ${dlRes.headers["content-type"]}, Size: ${dlRes.buffer.length} bytes`
      )
    } catch (dlErr: any) {
      assertCheck(
        "SEC-REQ-4.2",
        "Public PDF download endpoint returns HTTP 200",
        false,
        "HTTP 200",
        `Download error: ${dlErr.message}`
      )
    }
  }

  if (fs.existsSync(localPdfPath)) {
    const pdfText = extractTextFromPdf(localPdfPath)

    // Check that PDF contains official price 890 / 890.00
    const hasOfficialPrice =
      pdfText.includes("890") ||
      pdfText.includes("890.00") ||
      pdfText.includes("890,00") ||
      pdfText.includes("S/ 890") ||
      pdfText.includes("PEN 890")

    assertCheck(
      "SEC-REQ-4.3",
      "Generated PDF contains official unit price 890 (890.00 PEN)",
      hasOfficialPrice,
      "PDF contains '890' or '890.00'",
      hasOfficialPrice ? "FOUND in PDF stream text" : "NOT FOUND in PDF stream text"
    )

    // Check that PDF does NOT contain injected unit price 1.00
    const hasInjectedUnitPrice =
      pdfText.includes("1.00") ||
      pdfText.includes("1,00") ||
      pdfText.includes("S/ 1.00") ||
      pdfText.includes("PEN 1.00")

    assertCheck(
      "SEC-REQ-4.4",
      "Generated PDF does NOT contain injected malicious price 1.00 in pricing table",
      !hasInjectedUnitPrice,
      "PDF does not contain '1.00' or 'PEN 1.00'",
      hasInjectedUnitPrice ? "FOUND (FAIL: Injected price leaked into PDF)" : "ABSENT (PASS)"
    )

    // Check that PDF does NOT contain injected price 0.05
    const hasInjected005 =
      pdfText.includes("0.05") ||
      pdfText.includes("0,05") ||
      pdfText.includes("S/ 0.05") ||
      pdfText.includes("PEN 0.05")

    assertCheck(
      "SEC-REQ-4.5",
      "Generated PDF does NOT contain injected malicious price 0.05",
      !hasInjected005,
      "PDF does not contain '0.05'",
      hasInjected005 ? "FOUND (FAIL: Injected price leaked into PDF)" : "ABSENT (PASS)"
    )

    // Check required disclaimers
    const hasFictitiousDisclaimer =
      pdfText.includes("PRODUCTO FICTICIO") || pdfText.includes("DATOS DE DEMOSTRACI")
    const hasSimulationDisclaimer =
      pdfText.includes("SIMULACI") || pdfText.includes("NO VÁLIDA COMO OFERTA COMERCIAL")

    assertCheck(
      "SEC-REQ-4.6",
      "Generated PDF contains mandatory simulation disclaimers ('PRODUCTO FICTICIO', 'SIMULACIÓN')",
      hasFictitiousDisclaimer && hasSimulationDisclaimer,
      "Mandatory watermark/header disclaimers present",
      `PRODUCTO FICTICIO: ${hasFictitiousDisclaimer ? "YES" : "NO"}, SIMULACIÓN: ${hasSimulationDisclaimer ? "YES" : "NO"}`
    )
  }

  // ==========================================================================
  // SUPPLEMENTARY ATTACK VECTORS: Multi-Quantity Subtotal & Negative Price Tampering
  // ==========================================================================
  console.log(`\n${BOLD}${YELLOW}--- [STAGE 4] Supplementary Security Injections & Arithmetic Integrity ---${RESET}`)

  // Scenario 2: Multi-quantity subtotal spoofing (qty = 2, injected subtotal = 10.00)
  {
    console.log(`Testing Quantity=2 with injected subtotal=10.00 (Server must compute 890 * 2 = 1780.00)...`)
    const multiPayload = {
      variant_id: plc.variantId,
      quantity: 2,
      unit_price: 5.0,
      subtotal: 10.0,
      price: 0.01,
      idempotency_key: `sec-tamper-multi-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`,
    }

    const multiRes = await httpRequest(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: multiPayload,
    })

    assertCheck(
      "SEC-SUPP-1.1",
      "Multi-quantity request returns HTTP 201 Created",
      multiRes.status === 201,
      "HTTP 201",
      `HTTP ${multiRes.status}`
    )

    const multiSummary = multiRes.data?.summary || {}
    assertCheck(
      "SEC-SUPP-1.2",
      "Server recalculates subtotal strictly as unit_price * 2 = 1780 (ignores injected 10.00)",
      multiSummary.subtotal === 1780 && multiSummary.unit_price === 890,
      "unit_price=890, subtotal=1780",
      `unit_price=${multiSummary.unit_price}, subtotal=${multiSummary.subtotal}`
    )

    // Check DB record for multi-quantity
    if (multiRes.data?.quote_id) {
      const multiDb = queryDb(`
        SELECT unit_price_decimal, subtotal_decimal, subtotal_minor
        FROM preliminary_quote WHERE id = '${multiRes.data.quote_id}' LIMIT 1;
      `)[0]
      if (multiDb) {
        assertCheck(
          "SEC-SUPP-1.3",
          "DB record stores accurate recalculated subtotal 1780.00 (178000 minor)",
          parseFloat(multiDb.subtotal_decimal) === 1780.0 && Number(multiDb.subtotal_minor) === 178000,
          "subtotal_decimal=1780.00, subtotal_minor=178000",
          `subtotal_decimal=${multiDb.subtotal_decimal}, subtotal_minor=${multiDb.subtotal_minor}`
        )
      }
    }
  }

  // Scenario 3: Negative Price Injection (-50.00)
  {
    console.log(`Testing negative price injection (price = -50.00)...`)
    const negPayload = {
      variant_id: plc.variantId,
      quantity: 1,
      price: -50.0,
      unit_price: -50.0,
      subtotal: -50.0,
      idempotency_key: `sec-tamper-neg-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`,
    }

    const negRes = await httpRequest(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: negPayload,
    })

    const negSummary = negRes.data?.summary || {}
    assertCheck(
      "SEC-SUPP-2.1",
      "Negative price injection is neutralized; server preserves official price 890",
      negRes.status === 201 && negSummary.unit_price === 890,
      "HTTP 201 and unit_price=890",
      `HTTP ${negRes.status}, unit_price=${negSummary.unit_price}`
    )
  }

  // ==========================================================================
  // Summary & Diagnostic Report
  // ==========================================================================
  const total = assertions.length
  const passed = assertions.filter((a) => a.passed).length
  const failed = assertions.filter((a) => !a.passed).length

  console.log(`\n${BOLD}${CYAN}==============================================================================${RESET}`)
  console.log(`${BOLD}${CYAN}               SECURITY AUDIT SUMMARY: PRICE TAMPERING DEFENSE                ${RESET}`)
  console.log(`${BOLD}${CYAN}==============================================================================${RESET}\n`)

  console.log(`  Total Assertions:    ${BOLD}${total}${RESET}`)
  console.log(`  Superadas (PASS):    ${GREEN}${BOLD}${passed}${RESET}`)
  console.log(`  Fallidas  (FAIL):    ${failed > 0 ? RED : GREEN}${BOLD}${failed}${RESET}\n`)

  console.log(`| ID             | Security Check Description                                   | Status  |`)
  console.log(`| :------------- | :----------------------------------------------------------- | :------ |`)
  for (const a of assertions) {
    const statusCol = a.passed ? `${GREEN}PASS${RESET}` : `${RED}FAIL${RESET}`
    const desc = a.name.padEnd(60, " ").slice(0, 60)
    const code = a.code.padEnd(14, " ").slice(0, 14)
    console.log(`| ${code} | ${desc} | ${statusCol}   |`)
  }

  console.log(`\n${BOLD}==============================================================================${RESET}`)
  if (failed === 0) {
    console.log(`${BOLD}${GREEN}  FINAL RESULT: PASS — ALL PRICE & STOCK TAMPERING DEFENSES VERIFIED (100%)  ${RESET}`)
    console.log(`${BOLD}==============================================================================${RESET}\n`)
    return true
  } else {
    console.log(`${BOLD}${RED}  FINAL RESULT: FAIL — ${failed} SECURITY INTEGRITY CHECKS FAILED             ${RESET}`)
    console.log(`${BOLD}==============================================================================${RESET}\n`)
    return false
  }
}

// Direct Execution Entrypoint
if (require.main === module || process.argv[1]?.endsWith("test-price-tampering.ts")) {
  runPriceTamperingSuite()
    .then((success) => {
      process.exit(success ? 0 : 1)
    })
    .catch((err) => {
      console.error(`\n${RED}${BOLD}[FATAL ERROR] Unhandled Exception during security test execution:${RESET}`, err)
      process.exit(1)
    })
}
