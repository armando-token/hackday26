/**
 * Automated Test Suite: Manual Review Fallback & Zero-Price Immunity Verification
 * Gate 3 (Puerta 3) — Controlnautas × Meta Muse (Hack Day 2026)
 *
 * Scope & Requirements:
 * 1. Test creating a quote for scenarios where price is removed or invalid:
 *    - Scenario A: Dummy test product with NO price configured (unpriced variant).
 *    - Scenario B: Existing demo product with price temporarily set to 0.00 (invalid <= 0 price).
 *    - Scenario C: Existing demo product with price temporarily soft-deleted / NULL in DB.
 *    - Scenario D: Direct Node.js PDF wrapper generation for manual_review quote payload.
 * 2. Assertions on both getLiveOffer engine and POST /api/muse/v1/preliminary-quotes:
 *    - Verify state / status is strictly 'manual_review'.
 *    - Verify unit_price and subtotal are NULL (or omitted) and strictly NOT 0.
 *    - Verify unit_price_minor and subtotal_minor are NULL and NOT 0.
 *    - Verify PDF generated contains 'EN REVISIÓN MANUAL — SIN IMPORTE'.
 *    - Verify PDF does NOT display false 0.00 currency amounts (e.g. S/ 0.00, PEN 0.00 in table/totals).
 * 3. Strict clean-up & restoration guarantees:
 *    - All database mutations are wrapped in try...finally blocks.
 *    - Original price amounts and statuses are restored immediately.
 *    - Dummy variants, profiles, test quotes, and generated PDF files are cleanly wiped.
 *    - Final audit step confirms clean state across all 3 demo catalog products.
 * 4. Report comprehensive PASS/FAIL audit summary table and exit 0 (success) or 1 (failure).
 *
 * Execution:
 *  npx tsx scripts/test-manual-review-fallback.ts
 */

import fs from "fs"
import path from "path"
import http from "http"
import https from "https"
import { execSync, spawnSync } from "child_process"
import { getPool, closePool } from "../b2b-backend/apps/backend/src/lib/muse/db"
import { getLiveOffer } from "../b2b-backend/apps/backend/src/lib/muse/offer"
import { generateQuotePdf } from "../b2b-backend/apps/backend/src/lib/muse/pdf-generator"

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
const args = process.argv.slice(2)
let cliBaseUrl: string | undefined
let cliToken: string | undefined

for (let i = 0; i < args.length; i++) {
  if (args[i] === "--base-url" && args[i + 1]) {
    cliBaseUrl = args[++i]
  } else if (args[i] === "--token" && args[i + 1]) {
    cliToken = args[++i]
  } else if (args[i] === "--help" || args[i] === "-h") {
    console.log(`
Usage: npx tsx scripts/test-manual-review-fallback.ts [options]

Options:
  --base-url <url>      Base URL of Medusa backend (default: http://127.0.0.1:9000)
  --token <token>       MUSE API Bearer Token
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
  throw new Error(`[Configuration Error] MUSE_API_TOKEN could not be resolved from env or ${BACKEND_ENV_PATH}`)
}

// ============================================================================
// PDF Text Decoding Helper (ReportLab Adobe ASCII85 + FlateDecode)
// ============================================================================
function decodePdfText(filePath: string): string {
  if (!fs.existsSync(filePath)) return ""
  try {
    const pyScript = `
import sys, base64, zlib, re

def decode_pdf_text(path):
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
    full = "\\n".join(all_text)
    extracted = []
    for m in re.finditer(r"\\((.*?)\\)\\s*Tj", full):
        s = m.group(1)
        s = re.sub(r"\\\\([0-7]{3})", lambda match: chr(int(match.group(1), 8)), s)
        s = s.replace(r"\\(", "(").replace(r"\\)", ")").replace(r"\\\\", "\\\\")
        s = s.replace("\\x97", "—").replace("\\x96", "–")
        extracted.append(s)
    text = " ".join(extracted)
    text = re.sub(r"\\s+", " ", text)
    return text

if __name__ == "__main__":
    print(decode_pdf_text(sys.argv[1]))
`
    const res = spawnSync("python3", ["-c", pyScript, filePath], { encoding: "utf8" })
    if (res.error) {
      console.error(`decodePdfText error on ${filePath}:`, res.error.message)
      return ""
    }
    return res.stdout || ""
  } catch (err: any) {
    console.error(`decodePdfText error on ${filePath}:`, err.message)
    return ""
  }
}

// ============================================================================
// HTTP Client Helper
// ============================================================================
interface HttpResponse<T = any> {
  status: number
  headers: Record<string, string | string[]>
  data: T
  rawBody: string
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
    const url = new URL(urlStr)
    const isHttps = url.protocol === "https:"
    const client = isHttps ? https : http

    const headers: Record<string, string> = {
      Accept: "application/json",
      ...options.headers,
    }

    let payload: string | undefined
    if (options.body !== undefined) {
      if (typeof options.body === "string") {
        payload = options.body
      } else {
        payload = JSON.stringify(options.body)
        headers["Content-Type"] = "application/json"
      }
      headers["Content-Length"] = Buffer.byteLength(payload).toString()
    }

    const req = client.request(
      url,
      {
        method: options.method || "GET",
        headers,
        timeout: options.timeoutMs || 15000,
      },
      (res) => {
        const chunks: Buffer[] = []
        res.on("data", (chunk) => chunks.push(chunk))
        res.on("end", () => {
          const rawBody = Buffer.concat(chunks).toString("utf8")
          let data: any = rawBody
          const contentType = res.headers["content-type"] || ""
          if (contentType.includes("application/json")) {
            try {
              data = JSON.parse(rawBody)
            } catch {
              // fallback to raw string
            }
          }
          resolve({
            status: res.statusCode || 0,
            headers: res.headers as Record<string, string | string[]>,
            data,
            rawBody,
          })
        })
      }
    )

    req.on("error", (err) => reject(err))
    req.on("timeout", () => {
      req.destroy()
      reject(new Error(`HTTP request timed out after ${options.timeoutMs || 15000}ms`))
    })

    if (payload) {
      req.write(payload)
    }
    req.end()
  })
}

// ============================================================================
// Test Assertion Tracker
// ============================================================================
interface AssertionResult {
  step: string
  description: string
  passed: boolean
  expected: string
  actual: string
}

const assertions: AssertionResult[] = []

function assertCheck(
  step: string,
  description: string,
  condition: boolean,
  expected: string,
  actual: any
): boolean {
  const actualStr =
    actual === null
      ? "null"
      : actual === undefined
      ? "undefined"
      : typeof actual === "object"
      ? JSON.stringify(actual)
      : String(actual)

  assertions.push({
    step,
    description,
    passed: condition,
    expected,
    actual: actualStr,
  })

  if (condition) {
    console.log(`  ${GREEN}✔ [PASS]${RESET} [${step}] ${description}`)
  } else {
    console.log(`  ${RED}✘ [FAIL]${RESET} [${step}] ${description}`)
    console.log(`    ${DIM}Expected:${RESET} ${expected}`)
    console.log(`    ${DIM}Actual:  ${RESET} ${actualStr}`)
  }
  return condition
}

// ============================================================================
// Main Test Suite Runner
// ============================================================================
async function runManualReviewSuite(): Promise<boolean> {
  console.log(`\n${BOLD}${CYAN}==============================================================================${RESET}`)
  console.log(`${BOLD}${CYAN}  CONTROLNAUTAS × META MUSE — TEST SUITE: MANUAL REVIEW FALLBACK & IMMUNITY  ${RESET}`)
  console.log(`${BOLD}${CYAN}  Gate 3 (Puerta 3) — Automated Fallback & Zero-Price Immunity Verification  ${RESET}`)
  console.log(`${BOLD}${CYAN}==============================================================================${RESET}`)

  const token = resolveMuseToken()
  const pool = getPool()
  const quoteEndpointUrl = `${BASE_URL}/api/muse/v1/preliminary-quotes`

  console.log(`\n${BOLD}Environment Parameters:${RESET}`)
  console.log(`  Base URL:         ${CYAN}${BASE_URL}${RESET}`)
  console.log(`  Quote Endpoint:   ${CYAN}${quoteEndpointUrl}${RESET}`)
  console.log(`  Token:            ${DIM}${token.slice(0, 10)}...${token.slice(-6)}${RESET}`)
  console.log(`  Postgres Pool:    ${GREEN}Connected${RESET}`)

  // --------------------------------------------------------------------------
  // Resolve Target Demo Products for Live Mutations
  // --------------------------------------------------------------------------
  const demoProductsRes = await pool.query(`
    SELECT pv.sku, pv.id as variant_id, pr.id as price_id, pr.amount::numeric as amount, pr.currency_code, p.id as product_id
    FROM product_variant pv
    INNER JOIN product p ON p.id = pv.product_id AND p.deleted_at IS NULL
    INNER JOIN technical_profile tp ON tp.variant_id = pv.id AND tp.deleted_at IS NULL
    LEFT JOIN product_variant_price_set pvps ON pvps.variant_id = pv.id AND pvps.deleted_at IS NULL
    LEFT JOIN price pr ON pr.price_set_id = pvps.price_set_id AND pr.currency_code = 'pen' AND pr.deleted_at IS NULL
    WHERE pv.sku LIKE 'CN-DEMO-%' AND pv.deleted_at IS NULL AND tp.demo = true
    ORDER BY pv.sku ASC
  `)

  if (demoProductsRes.rows.length === 0) {
    throw new Error("No demo products found in PostgreSQL medusa. Ensure seed:demo has been executed.")
  }

  const pt100 = demoProductsRes.rows.find((r) => r.sku === "CN-DEMO-PT100-3W-A1") || demoProductsRes.rows[0]
  const baseProductId = pt100.product_id

  console.log(`\n${BOLD}Target Test Subject (PT100 Sensor):${RESET}`)
  console.log(`  SKU:             ${CYAN}${pt100.sku}${RESET}`)
  console.log(`  Variant ID:      ${CYAN}${pt100.variant_id}${RESET}`)
  console.log(`  Price ID:        ${CYAN}${pt100.price_id}${RESET}`)
  console.log(`  Original Price:  ${GREEN}S/ ${pt100.amount} ${pt100.currency_code.toUpperCase()}${RESET}`)

  const quotesToCleanup: string[] = []
  const filesToCleanup: string[] = []

  try {
    // ========================================================================
    // SCENARIO 1: DUMMY TEST PRODUCT WITH NO PRICE CONFIGURED (PRICE REMOVED / MISSING)
    // ========================================================================
    console.log(`\n${BOLD}${MAGENTA}------------------------------------------------------------------------------${RESET}`)
    console.log(`${BOLD}${MAGENTA}  SCENARIO 1: Dummy Test Product with NO Price Configured (Unpriced Variant)  ${RESET}`)
    console.log(`${BOLD}${MAGENTA}------------------------------------------------------------------------------${RESET}`)

    const dummyTimestamp = Date.now()
    const dummyVariantId = `variant_test_dummy_noprice_${dummyTimestamp}`
    const dummyProfileId = `techprof_test_dummy_noprice_${dummyTimestamp}`
    const dummySku = `CN-DEMO-TEST-FALLBACK-${dummyTimestamp}`

    console.log(`  ${GRAY}Creating dummy product variant without price set: ${dummySku}${RESET}`)

    try {
      // 1. Insert dummy variant and technical profile
      await pool.query(`
        INSERT INTO product_variant (id, title, sku, product_id, manage_inventory, allow_backorder)
        VALUES ($1, $2, $3, $4, true, false)
      `, [dummyVariantId, "Sonda de Prueba Sin Precio (Fallback Test)", dummySku, baseProductId])

      await pool.query(`
        INSERT INTO technical_profile (id, variant_id, model, revision, demo)
        VALUES ($1, $2, $3, $4, true)
      `, [dummyProfileId, dummyVariantId, "CN-TEST-DUMMY", "rev-2026.1"])

      // Step 1.1: Call getLiveOffer directly on dummy unpriced variant
      console.log(`  ${GRAY}Executing getLiveOffer('${dummyVariantId}', quantity=1)...${RESET}`)
      const offer1 = await getLiveOffer(dummyVariantId, 1)

      assertCheck(
        "1.1",
        "getLiveOffer returns state 'manual_review' for unpriced dummy variant",
        offer1.state === "manual_review",
        "manual_review",
        offer1.state
      )

      assertCheck(
        "1.2",
        "getLiveOffer unit_price is NULL (strictly NOT 0) for unpriced variant",
        offer1.unit_price === null,
        "null",
        offer1.unit_price
      )

      assertCheck(
        "1.3",
        "getLiveOffer subtotal is NULL (strictly NOT 0) for unpriced variant",
        offer1.subtotal === null,
        "null",
        offer1.subtotal
      )

      assertCheck(
        "1.4",
        "getLiveOffer unit_price_minor is NULL (strictly NOT 0)",
        offer1.unit_price_minor === null,
        "null",
        offer1.unit_price_minor
      )

      assertCheck(
        "1.5",
        "getLiveOffer subtotal_minor is NULL (strictly NOT 0)",
        offer1.subtotal_minor === null,
        "null",
        offer1.subtotal_minor
      )

      assertCheck(
        "1.6",
        "getLiveOffer includes descriptive review_reason",
        typeof offer1.review_reason === "string" && offer1.review_reason.length > 5,
        "descriptive non-empty review_reason",
        offer1.review_reason
      )

      // Step 1.2: Call POST /api/muse/v1/preliminary-quotes via HTTP
      console.log(`  ${GRAY}POST /api/muse/v1/preliminary-quotes with dummy unpriced variant...${RESET}`)
      const httpRes1 = await httpRequest(quoteEndpointUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: {
          variant_id: dummyVariantId,
          quantity: 1,
        },
      })

      assertCheck(
        "1.7",
        "POST /preliminary-quotes returns HTTP 201 Created for manual_review quote",
        httpRes1.status === 201,
        "HTTP 201",
        `HTTP ${httpRes1.status}`
      )

      const quote1 = httpRes1.data
      if (quote1?.quote_id) quotesToCleanup.push(quote1.quote_id)
      if (quote1?.opaque_public_id) {
        filesToCleanup.push(path.join(STORAGE_QUOTES_DIR, `${quote1.opaque_public_id}.pdf`))
      }

      assertCheck(
        "1.8",
        "POST /preliminary-quotes response status is 'manual_review'",
        quote1?.status === "manual_review",
        "manual_review",
        quote1?.status
      )

      assertCheck(
        "1.9",
        "POST /preliminary-quotes summary.unit_price is NULL (strictly NOT 0)",
        quote1?.summary?.unit_price === null,
        "null",
        quote1?.summary?.unit_price
      )

      assertCheck(
        "1.10",
        "POST /preliminary-quotes summary.subtotal is NULL (strictly NOT 0)",
        quote1?.summary?.subtotal === null,
        "null",
        quote1?.summary?.subtotal
      )

      assertCheck(
        "1.11",
        "POST /preliminary-quotes returns non-empty pdf_url",
        typeof quote1?.pdf_url === "string" && quote1.pdf_url.includes("/pdf?token="),
        "valid pdf_url with download token",
        quote1?.pdf_url
      )

      // Step 1.3: Inspect Generated PDF on Disk
      const pdfPath1 = path.join(STORAGE_QUOTES_DIR, `${quote1.opaque_public_id}.pdf`)
      const pdfExists1 = fs.existsSync(pdfPath1)

      assertCheck(
        "1.12",
        `Generated PDF file exists on disk (${quote1.opaque_public_id}.pdf)`,
        pdfExists1,
        "true",
        pdfExists1
      )

      if (pdfExists1) {
        const fileSize1 = fs.statSync(pdfPath1).size
        assertCheck(
          "1.13",
          `Generated PDF file is non-empty (> 1000 bytes)`,
          fileSize1 > 1000,
          "> 1000 bytes",
          `${fileSize1} bytes`
        )

        const text1 = decodePdfText(pdfPath1)

        const hasManualReviewHeader1 =
          text1.includes("UNDER MANUAL REVIEW — NO COMMERCIAL PRICE AVAILABLE") ||
          text1.includes("EN REVISIÓN MANUAL — SIN IMPORTE")
        assertCheck(
          "1.14",
          "Generated PDF contains mandatory header 'UNDER MANUAL REVIEW — NO COMMERCIAL PRICE AVAILABLE'",
          hasManualReviewHeader1,
          "contains 'UNDER MANUAL REVIEW — NO COMMERCIAL PRICE AVAILABLE' or 'EN REVISIÓN MANUAL — SIN IMPORTE'",
          hasManualReviewHeader1 ? "FOUND" : "NOT FOUND"
        )

        // Verify no false 0.00 currency amount in pricing table / totals
        const hasPricedZero1 =
          /Total Preliminar.*0\.00/i.test(text1) ||
          /Subtotal Neto.*0\.00/i.test(text1) ||
          /P\.\s*Unitario.*0\.00/i.test(text1) ||
          /Estimated Total.*0\.00/i.test(text1) ||
          /Unit Price.*0\.00/i.test(text1) ||
          /USD\s*0\.00/i.test(text1) ||
          /PEN\s*0\.00/i.test(text1)

        assertCheck(
          "1.15",
          "Generated PDF has NO false 0.00 currency amounts in totals or item tables",
          !hasPricedZero1,
          "no false 0.00 in pricing table/totals",
          hasPricedZero1 ? "FALSE ZERO FOUND" : "CLEAN (NO FALSE ZERO)"
        )

        const hasZeroPolicy1 =
          text1.includes("does not issue false zero prices") ||
          text1.includes("NO emite precios cero")
        assertCheck(
          "1.16",
          "Generated PDF explains zero-price immunity policy in disclaimer",
          hasZeroPolicy1,
          "contains policy note 'does not issue false zero prices'",
          hasZeroPolicy1 ? "FOUND" : "NOT FOUND"
        )
      }

      // Step 1.4: Verify PostgreSQL 'preliminary_quote' table record
      const dbQuoteRes1 = await pool.query(`
        SELECT id, status, unit_price_minor, unit_price_decimal, subtotal_minor, subtotal_decimal, review_reason
        FROM preliminary_quote
        WHERE id = $1
      `, [quote1.quote_id])

      const dbRow1 = dbQuoteRes1.rows[0]
      assertCheck(
        "1.17",
        "PostgreSQL record in 'preliminary_quote' has status 'manual_review'",
        dbRow1?.status === "manual_review",
        "manual_review",
        dbRow1?.status
      )

      assertCheck(
        "1.18",
        "PostgreSQL record has unit_price_minor and unit_price_decimal as NULL (NOT 0)",
        dbRow1?.unit_price_minor === null && dbRow1?.unit_price_decimal === null,
        "both NULL",
        `unit_price_minor: ${dbRow1?.unit_price_minor}, unit_price_decimal: ${dbRow1?.unit_price_decimal}`
      )

      assertCheck(
        "1.19",
        "PostgreSQL record has subtotal_minor and subtotal_decimal as NULL (NOT 0)",
        dbRow1?.subtotal_minor === null && dbRow1?.subtotal_decimal === null,
        "both NULL",
        `subtotal_minor: ${dbRow1?.subtotal_minor}, subtotal_decimal: ${dbRow1?.subtotal_decimal}`
      )
    } finally {
      // Clean up dummy variant and profile immediately
      console.log(`  ${GRAY}Cleaning up dummy variant and profile from DB...${RESET}`)
      await pool.query("DELETE FROM technical_profile WHERE id = $1", [dummyProfileId]).catch(() => {})
      await pool.query("DELETE FROM product_variant WHERE id = $1", [dummyVariantId]).catch(() => {})
    }

    // ========================================================================
    // SCENARIO 2: EXISTING DEMO PRODUCT WITH PRICE TEMPORARILY SET TO 0.00
    // ========================================================================
    console.log(`\n${BOLD}${MAGENTA}------------------------------------------------------------------------------${RESET}`)
    console.log(`${BOLD}${MAGENTA}  SCENARIO 2: Existing Product with Price Temporarily Set to 0.00 (Price <= 0)  ${RESET}`)
    console.log(`${BOLD}${MAGENTA}------------------------------------------------------------------------------${RESET}`)

    const originalPt100Amount = pt100.amount
    const pt100PriceId = pt100.price_id
    const pt100VariantId = pt100.variant_id

    console.log(`  ${GRAY}Temporarily setting price ${pt100PriceId} amount to 0.00...${RESET}`)

    try {
      // Set price to 0 in PostgreSQL
      await pool.query(`UPDATE price SET amount = 0, updated_at = now() WHERE id = $1`, [pt100PriceId])

      // Step 2.1: Call getLiveOffer directly
      console.log(`  ${GRAY}Executing getLiveOffer('${pt100VariantId}', quantity=2)...${RESET}`)
      const offer2 = await getLiveOffer(pt100VariantId, 2)

      assertCheck(
        "2.1",
        "getLiveOffer returns state 'manual_review' when price is 0.00",
        offer2.state === "manual_review",
        "manual_review",
        offer2.state
      )

      assertCheck(
        "2.2",
        "getLiveOffer unit_price is NULL (strictly NOT 0) when price is 0.00",
        offer2.unit_price === null,
        "null",
        offer2.unit_price
      )

      assertCheck(
        "2.3",
        "getLiveOffer subtotal is NULL (strictly NOT 0) when price is 0.00",
        offer2.subtotal === null,
        "null",
        offer2.subtotal
      )

      assertCheck(
        "2.4",
        "getLiveOffer review_reason mentions non-positive or invalid price amount",
        typeof offer2.review_reason === "string" && offer2.review_reason.includes("Non-positive"),
        "contains 'Non-positive'",
        offer2.review_reason
      )

      // Step 2.2: Call POST /api/muse/v1/preliminary-quotes via HTTP
      console.log(`  ${GRAY}POST /api/muse/v1/preliminary-quotes with 0-priced variant...${RESET}`)
      const httpRes2 = await httpRequest(quoteEndpointUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: {
          variant_id: pt100VariantId,
          quantity: 2,
        },
      })

      assertCheck(
        "2.5",
        "POST /preliminary-quotes returns HTTP 201 Created for 0-price fallback",
        httpRes2.status === 201,
        "HTTP 201",
        `HTTP ${httpRes2.status}`
      )

      const quote2 = httpRes2.data
      if (quote2?.quote_id) quotesToCleanup.push(quote2.quote_id)
      if (quote2?.opaque_public_id) {
        filesToCleanup.push(path.join(STORAGE_QUOTES_DIR, `${quote2.opaque_public_id}.pdf`))
      }

      assertCheck(
        "2.6",
        "POST /preliminary-quotes response status is 'manual_review' for 0-price",
        quote2?.status === "manual_review",
        "manual_review",
        quote2?.status
      )

      assertCheck(
        "2.7",
        "POST /preliminary-quotes summary.unit_price is NULL (strictly NOT 0)",
        quote2?.summary?.unit_price === null,
        "null",
        quote2?.summary?.unit_price
      )

      assertCheck(
        "2.8",
        "POST /preliminary-quotes summary.subtotal is NULL (strictly NOT 0)",
        quote2?.summary?.subtotal === null,
        "null",
        quote2?.summary?.subtotal
      )

      // Step 2.3: Verify PDF generated for 0-price scenario
      const pdfPath2 = path.join(STORAGE_QUOTES_DIR, `${quote2.opaque_public_id}.pdf`)
      const pdfExists2 = fs.existsSync(pdfPath2)

      assertCheck(
        "2.9",
        `Generated PDF file exists on disk (${quote2.opaque_public_id}.pdf)`,
        pdfExists2,
        "true",
        pdfExists2
      )

      if (pdfExists2) {
        const text2 = decodePdfText(pdfPath2)

        const hasManualReviewHeader2 =
          text2.includes("UNDER MANUAL REVIEW — NO COMMERCIAL PRICE AVAILABLE") ||
          text2.includes("EN REVISIÓN MANUAL — SIN IMPORTE")
        assertCheck(
          "2.10",
          "Generated PDF contains header 'UNDER MANUAL REVIEW — NO COMMERCIAL PRICE AVAILABLE'",
          hasManualReviewHeader2,
          "contains 'UNDER MANUAL REVIEW — NO COMMERCIAL PRICE AVAILABLE' or 'EN REVISIÓN MANUAL — SIN IMPORTE'",
          hasManualReviewHeader2 ? "FOUND" : "NOT FOUND"
        )

        const hasPricedZero2 =
          /Total Preliminar.*0\.00/i.test(text2) ||
          /Subtotal Neto.*0\.00/i.test(text2) ||
          /P\.\s*Unitario.*0\.00/i.test(text2) ||
          /Estimated Total.*0\.00/i.test(text2) ||
          /Unit Price.*0\.00/i.test(text2) ||
          /USD\s*0\.00/i.test(text2) ||
          /PEN\s*0\.00/i.test(text2)

        assertCheck(
          "2.11",
          "Generated PDF has NO false 0.00 currency amounts in totals or item tables",
          !hasPricedZero2,
          "no false 0.00 in pricing table/totals",
          hasPricedZero2 ? "FALSE ZERO FOUND" : "CLEAN (NO FALSE ZERO)"
        )
      }
    } finally {
      // RESTORE ORIGINAL PRICE AMOUNT CLEANLY
      console.log(`  ${GRAY}Restoring original price for ${pt100PriceId} (amount: ${originalPt100Amount})...${RESET}`)
      await pool.query(`UPDATE price SET amount = $1, updated_at = now() WHERE id = $2`, [
        originalPt100Amount,
        pt100PriceId,
      ])
    }

    // Verify clean restoration
    const restoredCheck1 = await pool.query(`SELECT amount::numeric as amount FROM price WHERE id = $1`, [
      pt100PriceId,
    ])
    assertCheck(
      "2.12",
      `Clean Restoration: price ${pt100PriceId} successfully restored to original ${originalPt100Amount} PEN`,
      Number(restoredCheck1.rows[0]?.amount) === Number(originalPt100Amount),
      String(originalPt100Amount),
      String(restoredCheck1.rows[0]?.amount)
    )

    // ========================================================================
    // SCENARIO 3: EXISTING DEMO PRODUCT WITH PRICE TEMPORARILY SOFT-DELETED (NULL PRICE)
    // ========================================================================
    console.log(`\n${BOLD}${MAGENTA}------------------------------------------------------------------------------${RESET}`)
    console.log(`${BOLD}${MAGENTA}  SCENARIO 3: Existing Product with Price Temporarily Soft-Deleted (NULL Price) ${RESET}`)
    console.log(`${BOLD}${MAGENTA}------------------------------------------------------------------------------${RESET}`)

    console.log(`  ${GRAY}Temporarily soft-deleting price ${pt100PriceId} (deleted_at = now())...${RESET}`)

    try {
      await pool.query(`UPDATE price SET deleted_at = now() WHERE id = $1`, [pt100PriceId])

      // Step 3.1: Call getLiveOffer directly
      console.log(`  ${GRAY}Executing getLiveOffer('${pt100VariantId}', quantity=1)...${RESET}`)
      const offer3 = await getLiveOffer(pt100VariantId, 1)

      assertCheck(
        "3.1",
        "getLiveOffer returns state 'manual_review' when price is soft-deleted/missing",
        offer3.state === "manual_review",
        "manual_review",
        offer3.state
      )

      assertCheck(
        "3.2",
        "getLiveOffer unit_price is NULL (strictly NOT 0) when price is missing",
        offer3.unit_price === null,
        "null",
        offer3.unit_price
      )

      assertCheck(
        "3.3",
        "getLiveOffer subtotal is NULL (strictly NOT 0) when price is missing",
        offer3.subtotal === null,
        "null",
        offer3.subtotal
      )

      // Step 3.2: Call POST /api/muse/v1/preliminary-quotes via HTTP
      console.log(`  ${GRAY}POST /api/muse/v1/preliminary-quotes with unpriced variant...${RESET}`)
      const httpRes3 = await httpRequest(quoteEndpointUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: {
          variant_id: pt100VariantId,
          quantity: 1,
        },
      })

      assertCheck(
        "3.4",
        "POST /preliminary-quotes returns HTTP 201 Created for unpriced fallback",
        httpRes3.status === 201,
        "HTTP 201",
        `HTTP ${httpRes3.status}`
      )

      const quote3 = httpRes3.data
      if (quote3?.quote_id) quotesToCleanup.push(quote3.quote_id)
      if (quote3?.opaque_public_id) {
        filesToCleanup.push(path.join(STORAGE_QUOTES_DIR, `${quote3.opaque_public_id}.pdf`))
      }

      assertCheck(
        "3.5",
        "POST /preliminary-quotes response status is 'manual_review'",
        quote3?.status === "manual_review",
        "manual_review",
        quote3?.status
      )

      assertCheck(
        "3.6",
        "POST /preliminary-quotes summary.unit_price is NULL (strictly NOT 0)",
        quote3?.summary?.unit_price === null,
        "null",
        quote3?.summary?.unit_price
      )

      assertCheck(
        "3.7",
        "POST /preliminary-quotes summary.subtotal is NULL (strictly NOT 0)",
        quote3?.summary?.subtotal === null,
        "null",
        quote3?.summary?.subtotal
      )

      // Step 3.3: Verify PDF generated
      const pdfPath3 = path.join(STORAGE_QUOTES_DIR, `${quote3.opaque_public_id}.pdf`)
      const pdfExists3 = fs.existsSync(pdfPath3)

      assertCheck(
        "3.8",
        `Generated PDF file exists on disk (${quote3.opaque_public_id}.pdf)`,
        pdfExists3,
        "true",
        pdfExists3
      )

      if (pdfExists3) {
        const text3 = decodePdfText(pdfPath3)

        const hasManualReviewHeader3 =
          text3.includes("UNDER MANUAL REVIEW — NO COMMERCIAL PRICE AVAILABLE") ||
          text3.includes("EN REVISIÓN MANUAL — SIN IMPORTE")
        assertCheck(
          "3.9",
          "Generated PDF contains header 'UNDER MANUAL REVIEW — NO COMMERCIAL PRICE AVAILABLE'",
          hasManualReviewHeader3,
          "contains 'UNDER MANUAL REVIEW — NO COMMERCIAL PRICE AVAILABLE' or 'EN REVISIÓN MANUAL — SIN IMPORTE'",
          hasManualReviewHeader3 ? "FOUND" : "NOT FOUND"
        )

        const hasPricedZero3 =
          /Total Preliminar.*0\.00/i.test(text3) ||
          /Subtotal Neto.*0\.00/i.test(text3) ||
          /P\.\s*Unitario.*0\.00/i.test(text3) ||
          /Estimated Total.*0\.00/i.test(text3) ||
          /Unit Price.*0\.00/i.test(text3) ||
          /USD\s*0\.00/i.test(text3) ||
          /PEN\s*0\.00/i.test(text3)

        assertCheck(
          "3.10",
          "Generated PDF has NO false 0.00 currency amounts in totals or item tables",
          !hasPricedZero3,
          "no false 0.00 in pricing table/totals",
          hasPricedZero3 ? "FALSE ZERO FOUND" : "CLEAN (NO FALSE ZERO)"
        )
      }
    } finally {
      // RESTORE SOFT-DELETED PRICE CLEANLY
      console.log(`  ${GRAY}Restoring soft-deleted price ${pt100PriceId} (deleted_at = NULL)...${RESET}`)
      await pool.query(`UPDATE price SET deleted_at = NULL, updated_at = now() WHERE id = $1`, [pt100PriceId])
    }

    // Verify clean restoration
    const restoredCheck2 = await pool.query(
      `SELECT deleted_at, amount::numeric as amount FROM price WHERE id = $1`,
      [pt100PriceId]
    )
    assertCheck(
      "3.11",
      `Clean Restoration: price ${pt100PriceId} deleted_at successfully restored to NULL`,
      restoredCheck2.rows[0]?.deleted_at === null,
      "null",
      String(restoredCheck2.rows[0]?.deleted_at)
    )

    // ========================================================================
    // SCENARIO 4: DIRECT NODE.JS PDF WRAPPER TEST (generateQuotePdf)
    // ========================================================================
    console.log(`\n${BOLD}${MAGENTA}------------------------------------------------------------------------------${RESET}`)
    console.log(`${BOLD}${MAGENTA}  SCENARIO 4: Direct Node.js PDF Wrapper Generation for manual_review Quote   ${RESET}`)
    console.log(`${BOLD}${MAGENTA}------------------------------------------------------------------------------${RESET}`)

    const directOpaqueId = `quot_pub_direct_manual_review_${Date.now()}`
    const directPdfPayload = {
      quote_id: `QT-DIRECT-${Date.now()}`,
      opaque_public_id: directOpaqueId,
      status: "manual_review",
      sku: "CN-DEMO-PLC-DIN-420-MR1",
      model: "CN-DIN-PLC-A1",
      title: "Controlador Lógico Programable DIN 4-20 mA",
      quantity: 5,
      currency: "PEN",
      unit_price: null,
      subtotal: null,
      reason: "Configuración especial de ingeniería requiere validación de margen por asesor comercial.",
      availability: {
        status: "limited_stock",
        available_quantity: 3,
        stocked_quantity: 3,
        reserved_quantity: 0,
        manage_inventory: true,
        allow_backorder: false,
      },
      observed_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 86400000).toISOString(),
    }

    filesToCleanup.push(path.join(STORAGE_QUOTES_DIR, `${directOpaqueId}.pdf`))

    console.log(`  ${GRAY}Executing generateQuotePdf with manual_review payload...${RESET}`)
    const directPdfResult = await generateQuotePdf(directPdfPayload)

    assertCheck(
      "4.1",
      "generateQuotePdf generates file successfully with sha256 checksum",
      typeof directPdfResult.checksum === "string" && directPdfResult.checksum.length === 64,
      "64-char sha256 checksum",
      directPdfResult.checksum
    )

    const directPdfExists = fs.existsSync(directPdfResult.filePath)
    assertCheck(
      "4.2",
      "generateQuotePdf output file exists on disk",
      directPdfExists,
      "true",
      directPdfExists
    )

    if (directPdfExists) {
      const directSize = fs.statSync(directPdfResult.filePath).size
      assertCheck(
        "4.3",
        "generateQuotePdf output file size is > 1000 bytes",
        directSize > 1000,
        "> 1000 bytes",
        `${directSize} bytes`
      )

      const directText = decodePdfText(directPdfResult.filePath)
      const hasDirectManualReviewHeader =
        directText.includes("UNDER MANUAL REVIEW — NO COMMERCIAL PRICE AVAILABLE") ||
        directText.includes("EN REVISIÓN MANUAL — SIN IMPORTE")
      assertCheck(
        "4.4",
        "Direct PDF contains 'UNDER MANUAL REVIEW — NO COMMERCIAL PRICE AVAILABLE'",
        hasDirectManualReviewHeader,
        "contains 'UNDER MANUAL REVIEW — NO COMMERCIAL PRICE AVAILABLE' or 'EN REVISIÓN MANUAL — SIN IMPORTE'",
        hasDirectManualReviewHeader ? "FOUND" : "NOT FOUND"
      )

      assertCheck(
        "4.5",
        "Direct PDF contains specific review reason",
        directText.includes("Configuración especial de ingeniería"),
        "contains review reason",
        directText.includes("Configuración especial de ingeniería") ? "FOUND" : "NOT FOUND"
      )

      const hasDirectZero =
        /Total Preliminar.*0\.00/i.test(directText) ||
        /Subtotal Neto.*0\.00/i.test(directText) ||
        /P\.\s*Unitario.*0\.00/i.test(directText) ||
        /Estimated Total.*0\.00/i.test(directText) ||
        /Unit Price.*0\.00/i.test(directText) ||
        /USD\s*0\.00/i.test(directText) ||
        /PEN\s*0\.00/i.test(directText)

      assertCheck(
        "4.6",
        "Direct PDF has NO false 0.00 currency amounts in table or totals",
        !hasDirectZero,
        "no false 0.00 in pricing table/totals",
        hasDirectZero ? "FALSE ZERO FOUND" : "CLEAN (NO FALSE ZERO)"
      )
    }

    // ========================================================================
    // SCENARIO 5: FINAL CLEAN DATA RESTORATION & CATALOG INTEGRITY AUDIT
    // ========================================================================
    console.log(`\n${BOLD}${MAGENTA}------------------------------------------------------------------------------${RESET}`)
    console.log(`${BOLD}${MAGENTA}  SCENARIO 5: Catalog Integrity & Database Clean State Audit                  ${RESET}`)
    console.log(`${BOLD}${MAGENTA}------------------------------------------------------------------------------${RESET}`)

    const auditPricesRes = await pool.query(`
      SELECT pv.sku, pr.amount::numeric as amount, pr.currency_code, pr.deleted_at
      FROM product_variant pv
      INNER JOIN product_variant_price_set pvps ON pvps.variant_id = pv.id AND pvps.deleted_at IS NULL
      INNER JOIN price pr ON pr.price_set_id = pvps.price_set_id
      WHERE pv.sku LIKE 'CN-DEMO-%' AND pv.deleted_at IS NULL
      ORDER BY pv.sku ASC
    `)

    console.log(`  ${GRAY}Checking prices of demo catalog products:${RESET}`)
    for (const row of auditPricesRes.rows) {
      console.log(`    ${CYAN}${row.sku.padEnd(26, " ")}${RESET}: S/ ${String(row.amount).padStart(5, " ")} ${row.currency_code.toUpperCase()} (deleted_at: ${row.deleted_at || "NULL"})`)
    }

    const plcRow = auditPricesRes.rows.find((r) => r.sku === "CN-DEMO-PLC-DIN-420-MR1")
    const pidRow = auditPricesRes.rows.find((r) => r.sku === "CN-DEMO-PID-PT100-RS1")
    const pt100Row = auditPricesRes.rows.find((r) => r.sku === "CN-DEMO-PT100-3W-A1")

    assertCheck(
      "5.1",
      "Demo PLC DIN price is intact (890 PEN, not deleted)",
      Number(plcRow?.amount) === 890 && plcRow?.deleted_at === null,
      "890 PEN, active",
      `${plcRow?.amount} ${plcRow?.currency_code}, deleted_at: ${plcRow?.deleted_at}`
    )

    assertCheck(
      "5.2",
      "Demo PID price is intact (480 PEN, not deleted)",
      Number(pidRow?.amount) === 480 && pidRow?.deleted_at === null,
      "480 PEN, active",
      `${pidRow?.amount} ${pidRow?.currency_code}, deleted_at: ${pidRow?.deleted_at}`
    )

    assertCheck(
      "5.3",
      "Demo PT100 price is intact (75 PEN, not deleted)",
      Number(pt100Row?.amount) === 75 && pt100Row?.deleted_at === null,
      "75 PEN, active",
      `${pt100Row?.amount} ${pt100Row?.currency_code}, deleted_at: ${pt100Row?.deleted_at}`
    )

    // Check no orphan dummy variants
    const orphanCheck = await pool.query(`
      SELECT count(*)::integer as count FROM product_variant WHERE sku LIKE 'CN-DEMO-TEST-FALLBACK-%'
    `)
    assertCheck(
      "5.4",
      "No orphaned test dummy variants remaining in database",
      orphanCheck.rows[0]?.count === 0,
      "0",
      String(orphanCheck.rows[0]?.count)
    )

  } finally {
    // ------------------------------------------------------------------------
    // Clean up created preliminary quotes and generated PDF files
    // ------------------------------------------------------------------------
    console.log(`\n${BOLD}Final Clean-Up Phase:${RESET}`)
    if (quotesToCleanup.length > 0) {
      console.log(`  ${GRAY}Deleting ${quotesToCleanup.length} test quotes from preliminary_quote table...${RESET}`)
      for (const qId of quotesToCleanup) {
        await pool.query("DELETE FROM preliminary_quote WHERE id = $1", [qId]).catch(() => {})
      }
    }

    if (filesToCleanup.length > 0) {
      console.log(`  ${GRAY}Deleting ${filesToCleanup.length} temporary PDF test files from storage...${RESET}`)
      for (const fPath of filesToCleanup) {
        try {
          if (fs.existsSync(fPath)) fs.unlinkSync(fPath)
        } catch {}
      }
    }

    // Ensure database pool is closed
    await closePool().catch(() => {})
  }

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

  console.log(`| Step  | Assertion Description                                 | Status  |`)
  console.log(`| :---- | :---------------------------------------------------- | :------ |`)
  for (const a of assertions) {
    const statusCol = a.passed ? `${GREEN}PASS${RESET}` : `${RED}FAIL${RESET}`
    const desc = a.description.padEnd(53, " ").slice(0, 53)
    const stepCol = a.step.padEnd(5, " ")
    console.log(`| ${stepCol} | ${desc} | ${statusCol}   |`)
  }

  console.log(`\n${BOLD}==============================================================================${RESET}`)
  if (allPassed) {
    console.log(`${BOLD}${GREEN}  FINAL RESULT: PASS — 100% MANUAL REVIEW FALLBACK REQUIREMENTS VERIFIED      ${RESET}`)
    console.log(`${BOLD}==============================================================================${RESET}\n`)
    return true
  } else {
    console.log(`${BOLD}${RED}  FINAL RESULT: FAIL — MANUAL REVIEW FALLBACK REQUIREMENTS NOT MET              ${RESET}`)
    console.log(`${BOLD}==============================================================================${RESET}\n`)
    return false
  }
}

// ============================================================================
// Entrypoint Execution
// ============================================================================
runManualReviewSuite()
  .then((success) => {
    process.exit(success ? 0 : 1)
  })
  .catch((err) => {
    console.error(`\n${RED}Unhandled Exception during test execution:${RESET}`, err)
    process.exit(1)
  })
