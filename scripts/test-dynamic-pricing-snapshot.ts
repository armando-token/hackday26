/**
 * Automated Test Suite: Dynamic Pricing & Immutable Quote Snapshot Verification
 * Gate 3 (Puerta 3) — Controlnautas × Meta Muse (Hack Day 2026)
 *
 * Requirements:
 *  1. Query initial offer for PLC (expect 890 PEN).
 *  2. Create preliminary quote A (expect 890 PEN, record quote A id and pdf).
 *  3. Temporarily update price of PLC in Medusa DB to 950 PEN.
 *  4. Query offer for PLC -> must immediately reflect 950 PEN.
 *  5. Create preliminary quote B -> must reflect 950 PEN.
 *  6. Re-check preliminary quote A from DB and its PDF -> MUST STILL BE 890 PEN (immutable snapshot guarantee).
 *  7. Restore original price 890 PEN in Medusa DB.
 *  8. Verify original price is restored.
 *  9. Report PASS/FAIL.
 *
 * Execution:
 *  npx tsx scripts/test-dynamic-pricing-snapshot.ts
 */

import fs from "fs"
import path from "path"
import http from "http"
import https from "https"
import { execSync } from "child_process"

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

// Parse CLI flags
const args = process.argv.slice(2)
let cliBaseUrl: string | undefined
let cliToken: string | undefined
let cliVariantId: string | undefined

for (let i = 0; i < args.length; i++) {
  if (args[i] === "--base-url" && args[i + 1]) {
    cliBaseUrl = args[++i]
  } else if (args[i] === "--token" && args[i + 1]) {
    cliToken = args[++i]
  } else if (args[i] === "--variant" && args[i + 1]) {
    cliVariantId = args[++i]
  } else if (args[i] === "--help" || args[i] === "-h") {
    console.log(`
Usage: npx tsx scripts/test-dynamic-pricing-snapshot.ts [options]

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
 * Resolves PLC demo variant from manifest or database query
 */
function resolvePlcVariant(): { variantId: string; sku: string; title: string } {
  if (cliVariantId && cliVariantId.trim().length > 0) {
    return {
      variantId: cliVariantId.trim(),
      sku: "CLI-PLC-OVERRIDE",
      title: "PLC Override",
    }
  }

  // 1. Try manifest
  if (fs.existsSync(MANIFEST_PATH)) {
    try {
      const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8"))
      const products = manifest.products || manifest
      if (products["CN-DEMO-PLC-DIN-420-MR1"]?.variant_id) {
        return {
          variantId: products["CN-DEMO-PLC-DIN-420-MR1"].variant_id,
          sku: "CN-DEMO-PLC-DIN-420-MR1",
          title: "PLC Carril DIN 35mm CN-DIN-PLC-A1",
        }
      }
      for (const [sku, prod] of Object.entries<any>(products)) {
        if (sku.includes("PLC") && prod?.variant_id) {
          return {
            variantId: prod.variant_id,
            sku,
            title: prod.title || sku,
          }
        }
      }
    } catch {
      // fallback to DB below
    }
  }

  // 2. Try DB fallback
  try {
    const sql = `
      SELECT pv.id as variant_id, pv.sku, pv.title
      FROM product_variant pv
      INNER JOIN technical_profile tp ON tp.variant_id = pv.id
      WHERE pv.sku LIKE '%PLC%' AND pv.deleted_at IS NULL AND tp.demo = true
      LIMIT 1;
    `
    const rows = queryDb<{ variant_id: string; sku: string; title: string }>(sql)
    if (rows && rows[0]?.variant_id) {
      return {
        variantId: rows[0].variant_id,
        sku: rows[0].sku,
        title: rows[0].title || rows[0].sku,
      }
    }
  } catch {
    // Ignore db fallback error
  }

  throw new Error("Could not resolve PLC demo variant from manifest or database.")
}

// ============================================================================
// Database Helpers (psql over localhost)
// ============================================================================
function queryDb<T = any>(sql: string): T[] {
  const wrapped = `SELECT COALESCE(json_agg(t), '[]'::json) FROM (${sql.trim().replace(/;+$/, "")}) t;`
  const out = execSync(
    `PGPASSWORD=password psql -U postgres -h localhost -d medusa -t -A -c "${wrapped.replace(/"/g, '\\"')}"`,
    { encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] }
  ).trim()
  if (!out) return []
  return JSON.parse(out)
}

function executeDb(sql: string): void {
  execSync(
    `PGPASSWORD=password psql -U postgres -h localhost -d medusa -c "${sql.replace(/"/g, '\\"')}"`,
    { encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] }
  )
}

interface PriceRecord {
  id: string
  amount: number
  currency_code: string
  raw_amount: any
}

function getVariantPriceRecord(variantId: string): PriceRecord {
  const sql = `
    SELECT pr.id, pr.amount::numeric as amount, pr.currency_code, pr.raw_amount
    FROM price pr
    JOIN product_variant_price_set pvps ON pvps.price_set_id = pr.price_set_id
    WHERE pvps.variant_id = '${variantId.replace(/'/g, "''")}'
      AND pr.currency_code = 'pen'
      AND pr.deleted_at IS NULL
    LIMIT 1;
  `
  const rows = queryDb<PriceRecord>(sql)
  if (!rows || rows.length === 0) {
    throw new Error(`No PEN price found in database for variant '${variantId}'`)
  }
  return rows[0]
}

function updateVariantPriceInDb(priceId: string, newAmount: number): void {
  const sql = `
    UPDATE price
    SET amount = ${newAmount},
        raw_amount = jsonb_build_object('value', '${newAmount}', 'precision', 20),
        updated_at = now()
    WHERE id = '${priceId.replace(/'/g, "''")}';
  `
  executeDb(sql)
}

// ============================================================================
// PDF Text Extraction Helper
// ============================================================================
function extractPdfText(filePath: string): string {
  if (!fs.existsSync(filePath)) {
    throw new Error(`PDF file not found at path: ${filePath}`)
  }

  const pyCode = `
import sys, base64, zlib

def decode_pdf(path):
    with open(path, "rb") as f:
        data = f.read()
    idx = 0
    all_text = []
    while True:
        pos = data.find(b"stream\\n", idx)
        if pos == -1:
            pos = data.find(b"stream\\r\\n", idx)
            if pos == -1: break
            offset = 9
        else:
            offset = 7
        endpos = data.find(b"endstream", pos)
        raw = data[pos+offset:endpos].strip()
        try:
            a85 = base64.a85decode(raw, adobe=True)
            dec = zlib.decompress(a85).decode("latin1", errors="ignore")
            all_text.append(dec)
        except Exception:
            try:
                dec = zlib.decompress(raw).decode("latin1", errors="ignore")
                all_text.append(dec)
            except Exception:
                pass
        idx = endpos + 9
    return "\\n".join(all_text)

print(decode_pdf(sys.argv[1]))
`
  return execSync(`python3 -c '${pyCode}' "${filePath}"`, {
    encoding: "utf8",
    stdio: ["pipe", "pipe", "pipe"],
  })
}

// ============================================================================
// HTTP Client Implementation
// ============================================================================
interface HttpResponse<T = any> {
  status: number
  headers: Record<string, string>
  rawBody: string
  binaryBody?: Buffer
  data: T | null
}

function httpRequest<T = any>(
  urlStr: string,
  options: {
    method?: string
    headers?: Record<string, string>
    body?: any
    timeoutMs?: number
    isBinary?: boolean
  } = {}
): Promise<HttpResponse<T>> {
  return new Promise((resolve, reject) => {
    const url = new URL(urlStr)
    const isHttps = url.protocol === "https:"
    const client = isHttps ? https : http

    const method = (options.method || "GET").toUpperCase()
    const headers: Record<string, string> = {
      ...(options.headers || {}),
    }

    let payload: string | undefined
    if (options.body !== undefined && options.body !== null) {
      payload = typeof options.body === "string" ? options.body : JSON.stringify(options.body)
      headers["Content-Type"] = headers["Content-Type"] || "application/json"
      headers["Content-Length"] = Buffer.byteLength(payload).toString()
    }

    const req = client.request(
      url,
      {
        method,
        headers,
        timeout: options.timeoutMs || 15000,
      },
      (res) => {
        const chunks: Buffer[] = []
        res.on("data", (chunk) => {
          chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk)
        })
        res.on("end", () => {
          const buffer = Buffer.concat(chunks)
          const rawBody = buffer.toString("utf8")
          let data: T | null = null

          const contentType = res.headers["content-type"] || ""
          if (
            contentType.includes("application/json") ||
            rawBody.trim().startsWith("{") ||
            rawBody.trim().startsWith("[")
          ) {
            try {
              data = JSON.parse(rawBody)
            } catch {
              data = null
            }
          }

          const responseHeaders: Record<string, string> = {}
          for (const [k, v] of Object.entries(res.headers)) {
            if (typeof v === "string") {
              responseHeaders[k.toLowerCase()] = v
            } else if (Array.isArray(v)) {
              responseHeaders[k.toLowerCase()] = v.join(", ")
            }
          }

          resolve({
            status: res.statusCode || 0,
            headers: responseHeaders,
            rawBody,
            binaryBody: buffer,
            data,
          })
        })
      }
    )

    req.on("timeout", () => {
      req.destroy(new Error(`HTTP request timed out after ${options.timeoutMs || 15000}ms`))
    })

    req.on("error", (err) => {
      reject(err)
    })

    if (payload) {
      req.write(payload)
    }
    req.end()
  })
}

// ============================================================================
// Test Assertion & Tracking
// ============================================================================
interface TestAssertion {
  step: number
  description: string
  passed: boolean
  expected: string
  actual: string
  details?: any
}

const assertions: TestAssertion[] = []

function assertCheck(
  step: number,
  description: string,
  condition: boolean,
  expected: string,
  actual: string,
  details?: any
): boolean {
  assertions.push({
    step,
    description,
    passed: condition,
    expected,
    actual,
    details,
  })

  const statusLabel = condition ? `${GREEN}✔ PASS${RESET}` : `${RED}✘ FAIL${RESET}`

  console.log(`  [${statusLabel}] Step ${step}: ${BOLD}${description}${RESET}`)
  if (!condition) {
    console.log(`         ${YELLOW}Expected:${RESET} ${expected}`)
    console.log(`         ${RED}Actual:${RESET}   ${actual}`)
    if (details) {
      console.log(`         ${GRAY}Details:${RESET}  ${JSON.stringify(details)}`)
    }
  }
  return condition
}

// ============================================================================
// Main Test Runner
// ============================================================================
async function runDynamicPricingSnapshotSuite(): Promise<boolean> {
  console.log(`\n${BOLD}${CYAN}==============================================================================${RESET}`)
  console.log(`${BOLD}${CYAN}  CONTROLNAUTAS × META MUSE: DYNAMIC PRICING & IMMUTABLE SNAPSHOT AUDIT       ${RESET}`)
  console.log(`${BOLD}${CYAN}==============================================================================${RESET}`)
  console.log(`${GRAY}Backend URL:      ${RESET}${BASE_URL}`)

  // 1. Resolve Auth Token & Variant
  let token: string
  try {
    token = resolveMuseToken()
    console.log(`${GRAY}Auth Token:       ${RESET}${token.slice(0, 10)}...${token.slice(-6)} (verified)`)
  } catch (err: any) {
    console.error(`\n${RED}✘ Failed to resolve MUSE API Token:${RESET} ${err.message}`)
    return false
  }

  let plc: { variantId: string; sku: string; title: string }
  try {
    plc = resolvePlcVariant()
    console.log(`${GRAY}Target Variant:   ${RESET}${plc.sku} (${plc.variantId})`)
  } catch (err: any) {
    console.error(`\n${RED}✘ Failed to resolve PLC Variant:${RESET} ${err.message}`)
    return false
  }

  // 2. Resolve Price Record in Database
  let initialPriceRecord: PriceRecord
  try {
    initialPriceRecord = getVariantPriceRecord(plc.variantId)
    console.log(
      `${GRAY}DB Price Record:  ${RESET}${initialPriceRecord.id} (amount: ${initialPriceRecord.amount} ${initialPriceRecord.currency_code})`
    )
  } catch (err: any) {
    console.error(`\n${RED}✘ Failed to retrieve initial price record from DB:${RESET} ${err.message}`)
    return false
  }

  const INITIAL_PRICE_PEN = 890
  const TEMPORARY_PRICE_PEN = 950
  let priceNeedsRestore = false

  try {
    // --------------------------------------------------------------------------
    // REQUIREMENT 1: Query initial offer for PLC (expect 890 PEN).
    // --------------------------------------------------------------------------
    console.log(`\n${BOLD}[REQUIREMENT 1] Query initial offer for PLC (expect 890 PEN)${RESET}`)
    const offerUrl1 = `${BASE_URL}/api/muse/v1/products/${plc.variantId}/offer?quantity=1`
    console.log(`  ${GRAY}GET ${offerUrl1}${RESET}`)

    const resOffer1 = await httpRequest(offerUrl1, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    assertCheck(
      1,
      "Verify initial offer HTTP 200 OK",
      resOffer1.status === 200,
      "200 OK",
      `${resOffer1.status} (${resOffer1.data?.error?.message || ""})`
    )

    const initialOfferData = resOffer1.data || {}
    assertCheck(
      1,
      "Verify initial offer state is 'priced'",
      initialOfferData.state === "priced",
      "priced",
      String(initialOfferData.state)
    )

    assertCheck(
      1,
      "Verify initial offer currency is 'pen'",
      (initialOfferData.currency || "").toLowerCase() === "pen",
      "pen",
      String(initialOfferData.currency)
    )

    assertCheck(
      1,
      `Verify initial offer unit_price is ${INITIAL_PRICE_PEN} PEN`,
      initialOfferData.unit_price === INITIAL_PRICE_PEN,
      String(INITIAL_PRICE_PEN),
      String(initialOfferData.unit_price)
    )

    assertCheck(
      1,
      `Verify initial offer unit_price_minor is ${INITIAL_PRICE_PEN * 100} centavos`,
      initialOfferData.unit_price_minor === INITIAL_PRICE_PEN * 100,
      String(INITIAL_PRICE_PEN * 100),
      String(initialOfferData.unit_price_minor)
    )

    assertCheck(
      1,
      `Verify initial offer subtotal is ${INITIAL_PRICE_PEN} PEN`,
      initialOfferData.subtotal === INITIAL_PRICE_PEN,
      String(INITIAL_PRICE_PEN),
      String(initialOfferData.subtotal)
    )

    // --------------------------------------------------------------------------
    // REQUIREMENT 2: Create preliminary quote A (expect 890 PEN, record quote A id and pdf).
    // --------------------------------------------------------------------------
    console.log(`\n${BOLD}[REQUIREMENT 2] Create preliminary quote A (expect 890 PEN, record quote A id and pdf)${RESET}`)
    const quotesUrl = `${BASE_URL}/api/muse/v1/preliminary-quotes`
    console.log(`  ${GRAY}POST ${quotesUrl} (variant_id: ${plc.variantId}, quantity: 1)${RESET}`)

    const resQuoteA = await httpRequest(quotesUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: {
        variant_id: plc.variantId,
        quantity: 1,
      },
    })

    assertCheck(
      2,
      "Verify quote A creation returns HTTP 201 Created",
      resQuoteA.status === 201,
      "201 Created",
      `${resQuoteA.status} (${resQuoteA.data?.error?.message || resQuoteA.rawBody.slice(0, 100)})`
    )

    const quoteAData = resQuoteA.data || {}
    const quoteAId = quoteAData.quote_id || ""
    const quoteAOpaqueId = quoteAData.opaque_public_id || ""
    const quoteAPdfUrl = quoteAData.pdf_url || ""

    assertCheck(
      2,
      "Verify quote A contains valid non-empty quote_id",
      typeof quoteAId === "string" && quoteAId.length > 0,
      "Non-empty string",
      JSON.stringify(quoteAId)
    )

    assertCheck(
      2,
      "Verify quote A contains valid non-empty opaque_public_id",
      typeof quoteAOpaqueId === "string" && quoteAOpaqueId.length > 0,
      "Non-empty string",
      JSON.stringify(quoteAOpaqueId)
    )

    assertCheck(
      2,
      "Verify quote A contains valid non-empty pdf_url",
      typeof quoteAPdfUrl === "string" && quoteAPdfUrl.length > 0,
      "Non-empty string",
      JSON.stringify(quoteAPdfUrl)
    )

    assertCheck(
      2,
      `Verify quote A summary unit_price is ${INITIAL_PRICE_PEN} PEN`,
      quoteAData.summary?.unit_price === INITIAL_PRICE_PEN,
      String(INITIAL_PRICE_PEN),
      String(quoteAData.summary?.unit_price)
    )

    assertCheck(
      2,
      `Verify quote A summary subtotal is ${INITIAL_PRICE_PEN} PEN`,
      quoteAData.summary?.subtotal === INITIAL_PRICE_PEN,
      String(INITIAL_PRICE_PEN),
      String(quoteAData.summary?.subtotal)
    )

    console.log(`  ${MAGENTA}→ Recorded Quote A ID:        ${BOLD}${quoteAId}${RESET}`)
    console.log(`  ${MAGENTA}→ Recorded Quote A Opaque ID: ${BOLD}${quoteAOpaqueId}${RESET}`)
    console.log(`  ${MAGENTA}→ Recorded Quote A PDF URL:   ${BOLD}${quoteAPdfUrl}${RESET}`)

    // Verify Quote A stored in DB
    const dbQuoteARows = queryDb<any>(`
      SELECT id, opaque_public_id, status, unit_price_minor, unit_price_decimal::numeric as unit_price_decimal,
             subtotal_minor, subtotal_decimal::numeric as subtotal_decimal, pdf_storage_key, download_token
      FROM preliminary_quote
      WHERE id = '${quoteAId.replace(/'/g, "''")}' OR opaque_public_id = '${quoteAOpaqueId.replace(/'/g, "''")}'
      LIMIT 1;
    `)

    assertCheck(
      2,
      "Verify quote A record exists in PostgreSQL preliminary_quote table",
      dbQuoteARows.length > 0,
      "1 row",
      `${dbQuoteARows.length} rows`
    )

    const dbQuoteA = dbQuoteARows[0] || {}
    assertCheck(
      2,
      `Verify quote A DB unit_price_decimal is ${INITIAL_PRICE_PEN}.00`,
      Number(dbQuoteA.unit_price_decimal) === INITIAL_PRICE_PEN,
      `${INITIAL_PRICE_PEN}.00`,
      String(dbQuoteA.unit_price_decimal)
    )

    assertCheck(
      2,
      `Verify quote A DB unit_price_minor is ${INITIAL_PRICE_PEN * 100}`,
      Number(dbQuoteA.unit_price_minor) === INITIAL_PRICE_PEN * 100,
      String(INITIAL_PRICE_PEN * 100),
      String(dbQuoteA.unit_price_minor)
    )

    // Verify Quote A PDF file on disk and content
    const quoteAPdfStoragePath = path.join(
      WORKSPACE_ROOT,
      "storage",
      dbQuoteA.pdf_storage_key || `quotes/${quoteAOpaqueId}.pdf`
    )

    assertCheck(
      2,
      "Verify quote A PDF file exists on filesystem",
      fs.existsSync(quoteAPdfStoragePath),
      "File exists",
      fs.existsSync(quoteAPdfStoragePath) ? `Exists at ${quoteAPdfStoragePath}` : "Missing"
    )

    let quoteAPdfText = ""
    try {
      quoteAPdfText = extractPdfText(quoteAPdfStoragePath)
    } catch (e: any) {
      console.error(`${RED}Failed extracting text from Quote A PDF:${RESET} ${e.message}`)
    }

    assertCheck(
      2,
      `Verify quote A PDF content includes original price '${INITIAL_PRICE_PEN}'`,
      quoteAPdfText.includes(String(INITIAL_PRICE_PEN)),
      `Contains '${INITIAL_PRICE_PEN}'`,
      quoteAPdfText.includes(String(INITIAL_PRICE_PEN)) ? "Found" : "Not Found"
    )

    // --------------------------------------------------------------------------
    // REQUIREMENT 3: Temporarily update price of PLC in Medusa DB to 950 PEN.
    // --------------------------------------------------------------------------
    console.log(`\n${BOLD}[REQUIREMENT 3] Temporarily update price of PLC in Medusa DB to ${TEMPORARY_PRICE_PEN} PEN${RESET}`)
    console.log(`  ${GRAY}Executing SQL UPDATE on price record ${initialPriceRecord.id} -> ${TEMPORARY_PRICE_PEN} PEN${RESET}`)

    updateVariantPriceInDb(initialPriceRecord.id, TEMPORARY_PRICE_PEN)
    priceNeedsRestore = true

    // Verify update in DB
    const updatedDbPrice = getVariantPriceRecord(plc.variantId)
    assertCheck(
      3,
      `Verify price in database successfully updated to ${TEMPORARY_PRICE_PEN} PEN`,
      Number(updatedDbPrice.amount) === TEMPORARY_PRICE_PEN,
      String(TEMPORARY_PRICE_PEN),
      String(updatedDbPrice.amount)
    )

    // --------------------------------------------------------------------------
    // REQUIREMENT 4: Query offer for PLC -> must immediately reflect 950 PEN.
    // --------------------------------------------------------------------------
    console.log(`\n${BOLD}[REQUIREMENT 4] Query offer for PLC -> must immediately reflect ${TEMPORARY_PRICE_PEN} PEN${RESET}`)
    const offerUrl2 = `${BASE_URL}/api/muse/v1/products/${plc.variantId}/offer?quantity=1`
    console.log(`  ${GRAY}GET ${offerUrl2}${RESET}`)

    const resOffer2 = await httpRequest(offerUrl2, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    assertCheck(
      4,
      "Verify updated offer HTTP 200 OK",
      resOffer2.status === 200,
      "200 OK",
      `${resOffer2.status} (${resOffer2.data?.error?.message || ""})`
    )

    const updatedOfferData = resOffer2.data || {}
    assertCheck(
      4,
      `Verify updated offer unit_price immediately reflects ${TEMPORARY_PRICE_PEN} PEN`,
      updatedOfferData.unit_price === TEMPORARY_PRICE_PEN,
      String(TEMPORARY_PRICE_PEN),
      String(updatedOfferData.unit_price)
    )

    assertCheck(
      4,
      `Verify updated offer unit_price_minor is ${TEMPORARY_PRICE_PEN * 100} centavos`,
      updatedOfferData.unit_price_minor === TEMPORARY_PRICE_PEN * 100,
      String(TEMPORARY_PRICE_PEN * 100),
      String(updatedOfferData.unit_price_minor)
    )

    assertCheck(
      4,
      `Verify updated offer subtotal is ${TEMPORARY_PRICE_PEN} PEN`,
      updatedOfferData.subtotal === TEMPORARY_PRICE_PEN,
      String(TEMPORARY_PRICE_PEN),
      String(updatedOfferData.subtotal)
    )

    // --------------------------------------------------------------------------
    // REQUIREMENT 5: Create preliminary quote B -> must reflect 950 PEN.
    // --------------------------------------------------------------------------
    console.log(`\n${BOLD}[REQUIREMENT 5] Create preliminary quote B -> must reflect ${TEMPORARY_PRICE_PEN} PEN${RESET}`)
    console.log(`  ${GRAY}POST ${quotesUrl} (variant_id: ${plc.variantId}, quantity: 1)${RESET}`)

    const resQuoteB = await httpRequest(quotesUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: {
        variant_id: plc.variantId,
        quantity: 1,
      },
    })

    assertCheck(
      5,
      "Verify quote B creation returns HTTP 201 Created",
      resQuoteB.status === 201,
      "201 Created",
      `${resQuoteB.status} (${resQuoteB.data?.error?.message || resQuoteB.rawBody.slice(0, 100)})`
    )

    const quoteBData = resQuoteB.data || {}
    const quoteBId = quoteBData.quote_id || ""
    const quoteBOpaqueId = quoteBData.opaque_public_id || ""
    const quoteBPdfUrl = quoteBData.pdf_url || ""

    assertCheck(
      5,
      "Verify quote B ID is distinct from quote A ID",
      quoteBId !== quoteAId && quoteBId.length > 0,
      `Distinct from '${quoteAId}'`,
      quoteBId
    )

    assertCheck(
      5,
      `Verify quote B summary unit_price reflects updated ${TEMPORARY_PRICE_PEN} PEN`,
      quoteBData.summary?.unit_price === TEMPORARY_PRICE_PEN,
      String(TEMPORARY_PRICE_PEN),
      String(quoteBData.summary?.unit_price)
    )

    assertCheck(
      5,
      `Verify quote B summary subtotal reflects updated ${TEMPORARY_PRICE_PEN} PEN`,
      quoteBData.summary?.subtotal === TEMPORARY_PRICE_PEN,
      String(TEMPORARY_PRICE_PEN),
      String(quoteBData.summary?.subtotal)
    )

    console.log(`  ${MAGENTA}→ Recorded Quote B ID:        ${BOLD}${quoteBId}${RESET}`)
    console.log(`  ${MAGENTA}→ Recorded Quote B Opaque ID: ${BOLD}${quoteBOpaqueId}${RESET}`)
    console.log(`  ${MAGENTA}→ Recorded Quote B PDF URL:   ${BOLD}${quoteBPdfUrl}${RESET}`)

    // Verify Quote B stored in DB
    const dbQuoteBRows = queryDb<any>(`
      SELECT id, opaque_public_id, status, unit_price_minor, unit_price_decimal::numeric as unit_price_decimal,
             subtotal_minor, subtotal_decimal::numeric as subtotal_decimal, pdf_storage_key
      FROM preliminary_quote
      WHERE id = '${quoteBId.replace(/'/g, "''")}' OR opaque_public_id = '${quoteBOpaqueId.replace(/'/g, "''")}'
      LIMIT 1;
    `)

    assertCheck(
      5,
      `Verify quote B DB unit_price_decimal is ${TEMPORARY_PRICE_PEN}.00`,
      Number(dbQuoteBRows[0]?.unit_price_decimal) === TEMPORARY_PRICE_PEN,
      `${TEMPORARY_PRICE_PEN}.00`,
      String(dbQuoteBRows[0]?.unit_price_decimal)
    )

    assertCheck(
      5,
      `Verify quote B DB unit_price_minor is ${TEMPORARY_PRICE_PEN * 100}`,
      Number(dbQuoteBRows[0]?.unit_price_minor) === TEMPORARY_PRICE_PEN * 100,
      String(TEMPORARY_PRICE_PEN * 100),
      String(dbQuoteBRows[0]?.unit_price_minor)
    )

    // --------------------------------------------------------------------------
    // REQUIREMENT 6: Re-check preliminary quote A from DB and its PDF ->
    // MUST STILL BE 890 PEN (immutable snapshot guarantee).
    // --------------------------------------------------------------------------
    console.log(
      `\n${BOLD}[REQUIREMENT 6] Re-check preliminary quote A from DB and its PDF -> MUST STILL BE ${INITIAL_PRICE_PEN} PEN (IMMUTABLE SNAPSHOT GUARANTEE)${RESET}`
    )

    // 6.1 Re-check Quote A in DB
    const dbQuoteARecheckRows = queryDb<any>(`
      SELECT id, opaque_public_id, status, unit_price_minor, unit_price_decimal::numeric as unit_price_decimal,
             subtotal_minor, subtotal_decimal::numeric as subtotal_decimal, pdf_storage_key, download_token
      FROM preliminary_quote
      WHERE id = '${quoteAId.replace(/'/g, "''")}' OR opaque_public_id = '${quoteAOpaqueId.replace(/'/g, "''")}'
      LIMIT 1;
    `)

    assertCheck(
      6,
      "Verify quote A record is retrieved on re-check from PostgreSQL",
      dbQuoteARecheckRows.length > 0,
      "1 row",
      `${dbQuoteARecheckRows.length} rows`
    )

    const recheckQuoteA = dbQuoteARecheckRows[0] || {}

    assertCheck(
      6,
      `[SNAPSHOT DB] Verify quote A DB unit_price_decimal MUST STILL BE ${INITIAL_PRICE_PEN}.00`,
      Number(recheckQuoteA.unit_price_decimal) === INITIAL_PRICE_PEN,
      `${INITIAL_PRICE_PEN}.00`,
      String(recheckQuoteA.unit_price_decimal)
    )

    assertCheck(
      6,
      `[SNAPSHOT DB] Verify quote A DB unit_price_minor MUST STILL BE ${INITIAL_PRICE_PEN * 100}`,
      Number(recheckQuoteA.unit_price_minor) === INITIAL_PRICE_PEN * 100,
      String(INITIAL_PRICE_PEN * 100),
      String(recheckQuoteA.unit_price_minor)
    )

    assertCheck(
      6,
      `[SNAPSHOT DB] Verify quote A DB subtotal_decimal MUST STILL BE ${INITIAL_PRICE_PEN}.00`,
      Number(recheckQuoteA.subtotal_decimal) === INITIAL_PRICE_PEN,
      `${INITIAL_PRICE_PEN}.00`,
      String(recheckQuoteA.subtotal_decimal)
    )

    // 6.2 Re-check Quote A PDF asset on filesystem
    const quoteAPdfRecheckPath = path.join(
      WORKSPACE_ROOT,
      "storage",
      recheckQuoteA.pdf_storage_key || `quotes/${quoteAOpaqueId}.pdf`
    )

    assertCheck(
      6,
      "Verify quote A PDF file persists on disk",
      fs.existsSync(quoteAPdfRecheckPath),
      "File exists",
      fs.existsSync(quoteAPdfRecheckPath) ? "Exists" : "Missing"
    )

    let recheckPdfText = ""
    try {
      recheckPdfText = extractPdfText(quoteAPdfRecheckPath)
    } catch (e: any) {
      console.error(`${RED}Failed extracting text from Quote A PDF during re-check:${RESET} ${e.message}`)
    }

    assertCheck(
      6,
      `[SNAPSHOT PDF] Verify Quote A PDF MUST STILL CONTAIN initial price '${INITIAL_PRICE_PEN}'`,
      recheckPdfText.includes(String(INITIAL_PRICE_PEN)),
      `Contains '${INITIAL_PRICE_PEN}'`,
      recheckPdfText.includes(String(INITIAL_PRICE_PEN)) ? "Confirmed present" : "Missing"
    )

    assertCheck(
      6,
      `[SNAPSHOT PDF] Verify Quote A PDF MUST NOT CONTAIN modified price '${TEMPORARY_PRICE_PEN}'`,
      !recheckPdfText.includes(String(TEMPORARY_PRICE_PEN)),
      `Does NOT contain '${TEMPORARY_PRICE_PEN}'`,
      !recheckPdfText.includes(String(TEMPORARY_PRICE_PEN)) ? "Confirmed absent" : "Contaminated with new price!"
    )

    // 6.3 Re-check public PDF download endpoint for Quote A
    const quoteAPublicDownloadUrl = `${BASE_URL}/api/muse/v1/quotes/${quoteAOpaqueId}/pdf?token=${recheckQuoteA.download_token}`
    console.log(`  ${GRAY}GET ${quoteAPublicDownloadUrl}${RESET}`)

    const resDownloadPdfA = await httpRequest(quoteAPublicDownloadUrl, {
      method: "GET",
      isBinary: true,
    })

    assertCheck(
      6,
      "Verify public download endpoint for Quote A returns HTTP 200 OK",
      resDownloadPdfA.status === 200,
      "200 OK",
      `${resDownloadPdfA.status}`
    )

    assertCheck(
      6,
      "Verify public download Content-Type is 'application/pdf'",
      (resDownloadPdfA.headers["content-type"] || "").includes("application/pdf"),
      "application/pdf",
      String(resDownloadPdfA.headers["content-type"])
    )

    assertCheck(
      6,
      "Verify public downloaded PDF payload is non-empty (> 1000 bytes)",
      (resDownloadPdfA.binaryBody?.length || 0) > 1000,
      "> 1000 bytes",
      `${resDownloadPdfA.binaryBody?.length || 0} bytes`
    )

  } finally {
    // --------------------------------------------------------------------------
    // REQUIREMENT 7: Restore original price 890 PEN in Medusa DB.
    // --------------------------------------------------------------------------
    console.log(`\n${BOLD}[REQUIREMENT 7] Restore original price ${INITIAL_PRICE_PEN} PEN in Medusa DB${RESET}`)
    if (priceNeedsRestore) {
      try {
        console.log(`  ${GRAY}Executing SQL UPDATE on price record ${initialPriceRecord.id} -> ${INITIAL_PRICE_PEN} PEN${RESET}`)
        updateVariantPriceInDb(initialPriceRecord.id, INITIAL_PRICE_PEN)
        priceNeedsRestore = false
      } catch (err: any) {
        console.error(`${RED}CRITICAL: Failed restoring original price in database:${RESET} ${err.message}`)
      }
    } else {
      console.log(`  ${GRAY}Price restore not needed (price was not altered).${RESET}`)
    }

    const restoredDbPrice = getVariantPriceRecord(plc.variantId)
    assertCheck(
      7,
      `Verify original price in database is restored to ${INITIAL_PRICE_PEN} PEN`,
      Number(restoredDbPrice.amount) === INITIAL_PRICE_PEN,
      String(INITIAL_PRICE_PEN),
      String(restoredDbPrice.amount)
    )

    // --------------------------------------------------------------------------
    // REQUIREMENT 8: Verify original price is restored.
    // --------------------------------------------------------------------------
    console.log(`\n${BOLD}[REQUIREMENT 8] Verify original price is restored via Live Offer API${RESET}`)
    const offerUrlRestored = `${BASE_URL}/api/muse/v1/products/${plc.variantId}/offer?quantity=1`
    console.log(`  ${GRAY}GET ${offerUrlRestored}${RESET}`)

    try {
      const resOfferRestored = await httpRequest(offerUrlRestored, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      assertCheck(
        8,
        "Verify restored offer HTTP 200 OK",
        resOfferRestored.status === 200,
        "200 OK",
        `${resOfferRestored.status} (${resOfferRestored.data?.error?.message || ""})`
      )

      const restoredOfferData = resOfferRestored.data || {}
      assertCheck(
        8,
        `Verify restored offer unit_price is ${INITIAL_PRICE_PEN} PEN`,
        restoredOfferData.unit_price === INITIAL_PRICE_PEN,
        String(INITIAL_PRICE_PEN),
        String(restoredOfferData.unit_price)
      )

      assertCheck(
        8,
        `Verify restored offer unit_price_minor is ${INITIAL_PRICE_PEN * 100} centavos`,
        restoredOfferData.unit_price_minor === INITIAL_PRICE_PEN * 100,
        String(INITIAL_PRICE_PEN * 100),
        String(restoredOfferData.unit_price_minor)
      )

      assertCheck(
        8,
        `Verify restored offer subtotal is ${INITIAL_PRICE_PEN} PEN`,
        restoredOfferData.subtotal === INITIAL_PRICE_PEN,
        String(INITIAL_PRICE_PEN),
        String(restoredOfferData.subtotal)
      )
    } catch (e: any) {
      assertCheck(8, "Verify restored offer via Live Offer API", false, "200 OK with 890 PEN", e.message)
    }
  }

  // --------------------------------------------------------------------------
  // REQUIREMENT 9: Report PASS/FAIL.
  // --------------------------------------------------------------------------
  return reportSummary()
}

// ============================================================================
// Summary & Final Reporting
// ============================================================================
function reportSummary(): boolean {
  console.log(`\n${BOLD}${CYAN}==============================================================================${RESET}`)
  console.log(`${BOLD}${CYAN}                     TEST EXECUTION AUDIT SUMMARY                             ${RESET}`)
  console.log(`${BOLD}${CYAN}==============================================================================${RESET}`)

  const total = assertions.length
  const passed = assertions.filter((a) => a.passed).length
  const failed = total - passed
  const allPassed = failed === 0 && total > 0

  console.log(
    `Total Assertions: ${BOLD}${total}${RESET} | ` +
    `Passed: ${GREEN}${BOLD}${passed}${RESET} | ` +
    `Failed: ${failed > 0 ? RED : GREEN}${BOLD}${failed}${RESET}\n`
  )

  console.log(`| Step | Assertion Description                                 | Status  |`)
  console.log(`| :--- | :---------------------------------------------------- | :------ |`)
  for (const a of assertions) {
    const statusCol = a.passed ? `${GREEN}PASS${RESET}` : `${RED}FAIL${RESET}`
    const desc = a.description.padEnd(53, " ").slice(0, 53)
    console.log(`|  ${a.step}   | ${desc} | ${statusCol}   |`)
  }

  console.log(`\n${BOLD}==============================================================================${RESET}`)
  if (allPassed) {
    console.log(`${BOLD}${GREEN}  FINAL RESULT: PASS — ALL DYNAMIC PRICING & IMMUTABLE SNAPSHOT CHECKS VERIFIED${RESET}`)
    console.log(`${BOLD}==============================================================================${RESET}\n`)
    return true
  } else {
    console.log(`${BOLD}${RED}  FINAL RESULT: FAIL — DYNAMIC PRICING / SNAPSHOT REQUIREMENTS NOT MET          ${RESET}`)
    console.log(`${BOLD}==============================================================================${RESET}\n`)
    return false
  }
}

// ============================================================================
// Entrypoint
// ============================================================================
runDynamicPricingSnapshotSuite()
  .then((success) => {
    process.exit(success ? 0 : 1)
  })
  .catch((err) => {
    console.error(`\n${RED}Unhandled Exception during test execution:${RESET}`, err)
    process.exit(1)
  })
