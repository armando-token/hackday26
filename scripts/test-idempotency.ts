/**
 * Automated Test Suite: Idempotency Replay & Conflict Verification
 * Gate 3 (Puerta 3) — Controlnautas × Meta Muse (Hack Day 2026)
 *
 * Test Sequence:
 *  1. POST /api/muse/v1/preliminary-quotes with idempotency_key='idem-test-123' and body { variant_id, quantity: 2 }.
 *  2. Verify response HTTP 201 Created and record quote_id and pdf_url.
 *  3. POST again with same idempotency_key='idem-test-123' and exact same body.
 *  4. Verify response HTTP 200 or 201 with IDENTICAL quote_id and pdf_url (Idempotency Replay).
 *  5. POST again with same idempotency_key='idem-test-123' but different body { variant_id, quantity: 3 }.
 *  6. Verify response HTTP 409 Conflict with error.code: 'IDEMPOTENCY_CONFLICT'.
 *  7. Report PASS/FAIL with comprehensive audit report.
 *
 * Execution:
 *  npx tsx scripts/test-idempotency.ts
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
let cliKey: string | undefined

for (let i = 0; i < args.length; i++) {
  if (args[i] === "--base-url" && args[i + 1]) {
    cliBaseUrl = args[++i]
  } else if (args[i] === "--token" && args[i + 1]) {
    cliToken = args[++i]
  } else if (args[i] === "--variant" && args[i + 1]) {
    cliVariantId = args[++i]
  } else if (args[i] === "--key" && args[i + 1]) {
    cliKey = args[++i]
  } else if (args[i] === "--help" || args[i] === "-h") {
    console.log(`
Usage: npx tsx scripts/test-idempotency.ts [options]

Options:
  --base-url <url>      Base URL of Medusa backend (default: http://127.0.0.1:9000)
  --token <token>       MUSE API Bearer Token
  --variant <id>        Variant ID for demo product
  --key <key>           Idempotency key to test (default: idem-test-123)
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

const IDEMPOTENCY_KEY = cliKey || process.env.IDEMPOTENCY_KEY || "idem-test-123"

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
 * Resolves demo variant ID from manifest or database query
 */
function resolveDemoVariantId(): { variantId: string; sku: string } {
  if (cliVariantId && cliVariantId.trim().length > 0) {
    return { variantId: cliVariantId.trim(), sku: "CLI-OVERRIDE" }
  }

  // 1. Try manifest
  if (fs.existsSync(MANIFEST_PATH)) {
    try {
      const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8"))
      const products = manifest.products || manifest
      // Prefer PLC demo
      if (products["CN-X5PRIME-HE-XP5"]?.variant_id) {
        return {
          variantId: products["CN-X5PRIME-HE-XP5"].variant_id,
          sku: "CN-X5PRIME-HE-XP5",
        }
      }
      // Any first product
      for (const [sku, prod] of Object.entries<any>(products)) {
        if (prod?.variant_id) {
          return { variantId: prod.variant_id, sku }
        }
      }
    } catch {
      // fallback to DB below
    }
  }

  // 2. Try DB fallback
  try {
    const sql = `
      SELECT pv.id as variant_id, pv.sku
      FROM product_variant pv
      INNER JOIN technical_profile tp ON tp.variant_id = pv.id
      WHERE pv.sku LIKE 'CN-%' AND sku NOT LIKE 'CN-DEMO-TEST-%' AND sku NOT LIKE 'CN-DEMO-INVENTED-%' AND pv.deleted_at IS NULL AND tp.demo = true
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
        return { variantId: rows[0].variant_id, sku: rows[0].sku }
      }
    }
  } catch (e: any) {
    // Ignore db fallback error
  }

  throw new Error("Could not resolve any active demo variant ID from manifest or database.")
}

/**
 * Cleans up any existing preliminary_quote record with the target idempotency key
 * to ensure deterministic test execution across repeated runs.
 */
function cleanPreviousTestQuotes(key: string): void {
  try {
    const escapedKey = key.replace(/'/g, "''")
    const sql = `DELETE FROM preliminary_quote WHERE idempotency_key = '${escapedKey}';`
    execSync(
      `PGPASSWORD=password psql -U postgres -h localhost -d medusa -c "${sql}"`,
      { encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] }
    )
  } catch (e: any) {
    // Database table might not exist yet or psql failed; ignore gracefully
  }
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
    const url = new URL(urlStr)
    const isHttps = url.protocol === "https:"
    const client = isHttps ? https : http

    const method = (options.method || "GET").toUpperCase()
    const headers: Record<string, string> = {
      Accept: "application/json",
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
        let rawBody = ""
        res.on("data", (chunk) => {
          rawBody += chunk
        })
        res.on("end", () => {
          let data: T | null = null
          const contentType = res.headers["content-type"] || ""
          if (contentType.includes("application/json") || rawBody.trim().startsWith("{") || rawBody.trim().startsWith("[")) {
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

  const statusLabel = condition
    ? `${GREEN}✔ PASS${RESET}`
    : `${RED}✘ FAIL${RESET}`

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
async function runIdempotencySuite(): Promise<boolean> {
  console.log(`\n${BOLD}${CYAN}==============================================================================${RESET}`)
  console.log(`${BOLD}${CYAN}  CONTROLNAUTAS × META MUSE: IDEMPOTENCY REPLAY & CONFLICT TEST SUITE        ${RESET}`)
  console.log(`${BOLD}${CYAN}==============================================================================${RESET}`)
  console.log(`${GRAY}Backend URL:      ${RESET}${BASE_URL}`)
  console.log(`${GRAY}Idempotency Key:  ${RESET}${IDEMPOTENCY_KEY}`)

  // 1. Resolve Auth Token & Variant
  let token: string
  try {
    token = resolveMuseToken()
    console.log(`${GRAY}Auth Token:       ${RESET}${token.slice(0, 10)}...${token.slice(-6)} (verified)`)
  } catch (err: any) {
    console.error(`\n${RED}✘ Failed to resolve MUSE API Token:${RESET} ${err.message}`)
    return false
  }

  let demoVariant: { variantId: string; sku: string }
  try {
    demoVariant = resolveDemoVariantId()
    console.log(`${GRAY}Target Variant:   ${RESET}${demoVariant.sku} (${demoVariant.variantId})`)
  } catch (err: any) {
    console.error(`\n${RED}✘ Failed to resolve Demo Variant:${RESET} ${err.message}`)
    return false
  }

  const endpointUrl = `${BASE_URL}/api/muse/v1/preliminary-quotes`

  // 2. Pre-test cleanup: delete previous record with this idempotency key to ensure clean baseline
  console.log(`\n${CYAN}--- Preparing Clean Test Environment ---${RESET}`)
  cleanPreviousTestQuotes(IDEMPOTENCY_KEY)
  console.log(`  ${GRAY}Purged any existing preliminary_quote record for key '${IDEMPOTENCY_KEY}'${RESET}`)

  // --------------------------------------------------------------------------
  // STEP 1 & 2: Initial Quote Creation
  // --------------------------------------------------------------------------
  console.log(`\n${BOLD}[PHASE 1] Initial Quote Creation (Quantity: 2)${RESET}`)
  console.log(`  ${GRAY}POST ${endpointUrl} (idempotency_key='${IDEMPOTENCY_KEY}', quantity=2)${RESET}`)

  const bodyReq1 = {
    variant_id: demoVariant.variantId,
    quantity: 2,
    idempotency_key: IDEMPOTENCY_KEY,
  }

  let res1: HttpResponse<any>
  try {
    res1 = await httpRequest(endpointUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Idempotency-Key": IDEMPOTENCY_KEY,
      },
      body: bodyReq1,
    })
  } catch (e: any) {
    console.error(`${RED}✘ Request 1 failed at network level:${RESET} ${e.message}`)
    assertCheck(1, "POST request 1 executes without network error", false, "HTTP 201 Created", e.message)
    return false
  }

  // Step 2 assertions: HTTP 201 Created and record quote_id and pdf_url
  const step2HttpPass = assertCheck(
    2,
    "Verify response HTTP 201 Created on new quote",
    res1.status === 201,
    "201 Created",
    `${res1.status} (${res1.data?.error?.message || res1.rawBody.slice(0, 100)})`
  )

  const quoteId1 = res1.data?.quote_id || ""
  const pdfUrl1 = res1.data?.pdf_url || ""

  assertCheck(
    2,
    "Verify response contains valid non-empty quote_id",
    typeof quoteId1 === "string" && quoteId1.length > 0,
    "Non-empty string",
    JSON.stringify(quoteId1)
  )

  assertCheck(
    2,
    "Verify response contains valid non-empty pdf_url",
    typeof pdfUrl1 === "string" && pdfUrl1.length > 0,
    "Non-empty string",
    JSON.stringify(pdfUrl1)
  )

  console.log(`  ${MAGENTA}→ Recorded Quote ID: ${BOLD}${quoteId1 || "N/A"}${RESET}`)
  console.log(`  ${MAGENTA}→ Recorded PDF URL:  ${BOLD}${pdfUrl1 || "N/A"}${RESET}`)

  if (!step2HttpPass || !quoteId1) {
    console.error(`\n${RED}Aborting idempotency suite because initial quote creation failed.${RESET}`)
    return reportSummary()
  }

  // --------------------------------------------------------------------------
  // STEP 3 & 4: Replay with Same Idempotency Key and Exact Same Body
  // --------------------------------------------------------------------------
  console.log(`\n${BOLD}[PHASE 2] Replay with Exact Same Key & Body (Quantity: 2)${RESET}`)
  console.log(`  ${GRAY}POST ${endpointUrl} (idempotency_key='${IDEMPOTENCY_KEY}', quantity=2)${RESET}`)

  const bodyReq2 = {
    variant_id: demoVariant.variantId,
    quantity: 2,
    idempotency_key: IDEMPOTENCY_KEY,
  }

  let res2: HttpResponse<any>
  try {
    res2 = await httpRequest(endpointUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Idempotency-Key": IDEMPOTENCY_KEY,
      },
      body: bodyReq2,
    })
  } catch (e: any) {
    console.error(`${RED}✘ Request 2 failed at network level:${RESET} ${e.message}`)
    assertCheck(3, "POST request 2 executes without network error", false, "HTTP 200 or 201", e.message)
    return reportSummary()
  }

  // Step 4 assertions: HTTP 200 or 201, IDENTICAL quote_id and IDENTICAL pdf_url
  assertCheck(
    4,
    "Verify response HTTP 200 OK or 201 Created on idempotency replay",
    res2.status === 200 || res2.status === 201,
    "200 OK or 201 Created",
    `${res2.status} (${res2.data?.error?.message || "OK"})`
  )

  const quoteId2 = res2.data?.quote_id || ""
  const pdfUrl2 = res2.data?.pdf_url || ""

  assertCheck(
    4,
    "Verify replayed quote_id is IDENTICAL to original quote_id",
    quoteId2 === quoteId1,
    quoteId1,
    quoteId2
  )

  assertCheck(
    4,
    "Verify replayed pdf_url is IDENTICAL to original pdf_url",
    pdfUrl2 === pdfUrl1,
    pdfUrl1,
    pdfUrl2
  )

  // --------------------------------------------------------------------------
  // STEP 5 & 6: Conflict Test with Same Key but Different Body (Quantity: 3)
  // --------------------------------------------------------------------------
  console.log(`\n${BOLD}[PHASE 3] Mutated Body Conflict Test (Same Key, Quantity: 3)${RESET}`)
  console.log(`  ${GRAY}POST ${endpointUrl} (idempotency_key='${IDEMPOTENCY_KEY}', quantity=3 [MUTATED])${RESET}`)

  const bodyReq3 = {
    variant_id: demoVariant.variantId,
    quantity: 3,
    idempotency_key: IDEMPOTENCY_KEY,
  }

  let res3: HttpResponse<any>
  try {
    res3 = await httpRequest(endpointUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Idempotency-Key": IDEMPOTENCY_KEY,
      },
      body: bodyReq3,
    })
  } catch (e: any) {
    console.error(`${RED}✘ Request 3 failed at network level:${RESET} ${e.message}`)
    assertCheck(5, "POST request 3 executes without network error", false, "HTTP 409 Conflict", e.message)
    return reportSummary()
  }

  // Step 6 assertions: HTTP 409 Conflict with error.code: 'IDEMPOTENCY_CONFLICT'
  assertCheck(
    6,
    "Verify response HTTP 409 Conflict upon mutated payload replay",
    res3.status === 409,
    "409 Conflict",
    `${res3.status}`
  )

  const errorCode = res3.data?.error?.code || ""
  const errorMessage = res3.data?.error?.message || res3.rawBody

  assertCheck(
    6,
    "Verify error.code is 'IDEMPOTENCY_CONFLICT'",
    errorCode === "IDEMPOTENCY_CONFLICT",
    "IDEMPOTENCY_CONFLICT",
    errorCode || `(message: ${errorMessage.slice(0, 100)})`
  )

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
    console.log(`${BOLD}${GREEN}  FINAL RESULT: PASS — 100% IDEMPOTENCY CONTRACT REQUIREMENTS VERIFIED       ${RESET}`)
    console.log(`${BOLD}==============================================================================${RESET}\n`)
    return true
  } else {
    console.log(`${BOLD}${RED}  FINAL RESULT: FAIL — IDEMPOTENCY CONTRACT REQUIREMENTS NOT MET               ${RESET}`)
    console.log(`${BOLD}==============================================================================${RESET}\n`)
    return false
  }
}

// ============================================================================
// Entrypoint
// ============================================================================
runIdempotencySuite()
  .then((success) => {
    process.exit(success ? 0 : 1)
  })
  .catch((err) => {
    console.error(`\n${RED}Unhandled Exception during test execution:${RESET}`, err)
    process.exit(1)
  })
