/**
 * Automated Test Suite: Boundary Cases, Negative Tests & Technical Contraexamples
 * Gate 2 (Puerta 2) — Controlnautas × Meta Muse (Hack Day 2026)
 *
 * Scope:
 *  A. Authentication & Security (401 Unauthorized):
 *     - Request without Authorization header -> 401 Unauthorized.
 *     - Request with invalid Bearer token -> 401 Unauthorized.
 *     - Verify 401 response contains `error.code` and `request_id`.
 *     - Verify security headers (X-Request-Id, Cache-Control: no-store).
 *
 *  B. Parameter Validation (400 Bad Request):
 *     - Search with q > 200 characters -> 400.
 *     - Search with limit = 0 -> 400.
 *     - Search with limit = 10 -> 400.
 *     - Evaluate with requirements empty [] -> 400.
 *     - Evaluate with > 10 requirements (e.g. 11 items) -> 400.
 *     - Evaluate with property outside closed vocabulary (e.g. 'color', 'bluetooth', 'wifi') -> 400.
 *
 *  C. Isolation & 404 (Not Found):
 *     - GET /api/muse/v1/products/<invented_variant> -> 404.
 *     - POST /api/muse/v1/evaluate with invented_variant -> 404.
 *     - Verify uniform error response format ({ error: { code, message }, request_id }).
 *
 *  D. Technical Contraexamples:
 *     - SKU 1 (PLC DIN): Require 'Modbus TCP' -> overall_satisfied = false, requirement satisfied = false.
 *     - SKU 1 (PLC DIN): Require 'analog_output' (4–20 mA output) -> overall_satisfied = false.
 *     - SKU 2 (PID): Require mounting 'din_rail' (PID is panel mount) -> overall_satisfied = false.
 *     - SKU 2 (PID): Require analog input 'analog_input' 4–20 mA (PID has 4–20 mA output, Pt100 input) -> overall_satisfied = false.
 *     - SKU 3 (PT100): Require analog output 4–20 mA or digital protocol Modbus (passive probe without transmitter) -> overall_satisfied = false.
 *
 *  E. Positive Controls (Sanity verification):
 *     - Valid assertions for SKU 1, SKU 2, SKU 3 return overall_satisfied = true,
 *       confirming that false is returned specifically because the contraexamples are negative.
 *
 * Execution:
 *  `npx tsx scripts/test-muse-boundaries.ts`
 */

import fs from "fs"
import path from "path"
import { execSync } from "child_process"

// ============================================================================
// ANSI Color Formatting
// ============================================================================
const RESET = "\x1b[0m"
const BOLD = "\x1b[1m"
const DIM = "\x1b[2m"
const GREEN = "\x1b[32m"
const RED = "\x1b[31m"
const YELLOW = "\x1b[33m"
const CYAN = "\x1b[36m"

// ============================================================================
// Configuration & Environment Resolution
// ============================================================================
const WORKSPACE_ROOT = path.resolve(__dirname, "..")
const MANIFEST_PATH = path.join(WORKSPACE_ROOT, "hackday-demo-manifest.json")
const BACKEND_ENV_PATH = path.join(WORKSPACE_ROOT, "b2b-backend/apps/backend/.env")

// Base URL: Preference: MUSE_BASE_URL -> MEDUSA_BACKEND_URL -> http://127.0.0.1:9000
const BASE_URL = (
  process.env.MUSE_BASE_URL ||
  process.env.MEDUSA_BACKEND_URL ||
  "http://127.0.0.1:9000"
).replace(/\/+$/, "")

/**
 * Load MUSE_API_TOKEN from process.env or b2b-backend/apps/backend/.env
 */
function resolveMuseToken(): string {
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
    `[Configuration Error] MUSE_API_TOKEN could not be resolved from environment or ${BACKEND_ENV_PATH}`
  )
}

/**
 * Load dynamic variant IDs for the 3 demo SKUs from hackday-demo-manifest.json
 * with fallback to PostgreSQL medusa.
 */
interface DemoVariants {
  plcVariantId: string
  pidVariantId: string
  pt100VariantId: string
}

function resolveDemoVariants(): DemoVariants {
  let plcId = ""
  let pidId = ""
  let pt100Id = ""

  if (fs.existsSync(MANIFEST_PATH)) {
    try {
      const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8"))
      const products = manifest.products || manifest
      if (products["CN-X5PRIME-HE-XP5"]) {
        plcId = products["CN-X5PRIME-HE-XP5"].variant_id || ""
      }
      if (products["CN-N1200"]) {
        pidId = products["CN-N1200"].variant_id || ""
      }
      if (products["CN-THT02"]) {
        pt100Id = products["CN-THT02"].variant_id || ""
      }
    } catch {
      // fallback to DB below
    }
  }

  if (!plcId || !pidId || !pt100Id) {
    try {
      const sql = `
        SELECT sku, id as variant_id 
        FROM product_variant 
        WHERE sku IN ('CN-X5PRIME-HE-XP5', 'CN-N1200', 'CN-THT02')
          AND deleted_at IS NULL;
      `
      const wrapped = `SELECT json_agg(t) FROM (${sql.trim().replace(/;+$/, "")}) t;`
      const out = execSync(
        `PGPASSWORD=password psql -U postgres -h localhost -d medusa -t -A -c "${wrapped}"`,
        { encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] }
      ).trim()

      if (out) {
        const rows: Array<{ sku: string; variant_id: string }> = JSON.parse(out) || []
        for (const row of rows) {
          if (row.sku === "CN-X5PRIME-HE-XP5") plcId = row.variant_id
          if (row.sku === "CN-N1200") pidId = row.variant_id
          if (row.sku === "CN-THT02") pt100Id = row.variant_id
        }
      }
    } catch (e: any) {
      console.warn("DB query fallback warning:", e.message)
    }
  }

  if (!plcId || !pidId || !pt100Id) {
    throw new Error(
      `Could not resolve all 3 demo variant IDs. Found: PLC=${plcId}, PID=${pidId}, PT100=${pt100Id}`
    )
  }

  return {
    plcVariantId: plcId,
    pidVariantId: pidId,
    pt100VariantId: pt100Id,
  }
}

// ============================================================================
// HTTP Request Client
// ============================================================================
interface HttpResponse {
  status: number
  headers: Record<string, string>
  json: any
  text: string
}

async function httpRequest(
  endpoint: string,
  options: {
    method?: string
    token?: string | null
    body?: any
    headers?: Record<string, string>
    timeoutMs?: number
  } = {}
): Promise<HttpResponse> {
  const url = `${BASE_URL}${endpoint.startsWith("/") ? endpoint : "/" + endpoint}`
  const method = options.method || "GET"
  const timeoutMs = options.timeoutMs || 8000

  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(options.headers || {}),
  }

  if (options.token !== null && options.token !== undefined) {
    headers["Authorization"] = `Bearer ${options.token}`
  }

  let bodyStr: string | undefined = undefined
  if (options.body !== undefined) {
    headers["Content-Type"] = "application/json"
    bodyStr = typeof options.body === "string" ? options.body : JSON.stringify(options.body)
  }

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const res = await fetch(url, {
      method,
      headers,
      body: bodyStr,
      signal: controller.signal,
    })

    clearTimeout(timer)

    const respHeaders: Record<string, string> = {}
    res.headers.forEach((val, key) => {
      respHeaders[key.toLowerCase()] = val
    })

    const text = await res.text()
    let parsedJson: any = null
    try {
      parsedJson = JSON.parse(text)
    } catch {
      parsedJson = null
    }

    return {
      status: res.status,
      headers: respHeaders,
      json: parsedJson,
      text,
    }
  } catch (err: any) {
    clearTimeout(timer)
    if (err.name === "AbortError") {
      throw new Error(`Request timed out after ${timeoutMs}ms: ${method} ${url}`)
    }
    throw err
  }
}

/**
 * Health check & readiness retry loop:
 * Waits for the backend and the Muse API routes to be loaded and active.
 * When routes are active, an unauthenticated GET /products/search returns 401 JSON.
 */
async function waitForBackend(maxWaitSec = 60): Promise<void> {
  const start = Date.now()
  process.stdout.write(`[Connecting] Probing backend at ${BASE_URL}... `)

  while ((Date.now() - start) / 1000 < maxWaitSec) {
    try {
      const res = await httpRequest("/api/muse/v1/products/search?limit=1", {
        token: null,
        timeoutMs: 2500,
      })
      if (res.status === 401 && res.json?.error?.code === "UNAUTHORIZED") {
        console.log(`${GREEN}Connected (Muse API routes active, HTTP 401 UNAUTHORIZED)${RESET}`)
        return
      }
    } catch {
      // Waiting for socket / restart
    }
    await new Promise((r) => setTimeout(r, 1500))
    process.stdout.write(".")
  }

  console.log(
    `\n${YELLOW}Warning: Backend did not return 401 UNAUTHORIZED on /api/muse/v1/products/search within ${maxWaitSec}s, proceeding with tests...${RESET}`
  )
}

// ============================================================================
// Test Results Aggregator
// ============================================================================
interface TestCaseResult {
  group: string
  code: string
  name: string
  passed: boolean
  expected: string
  actual: string
  details?: any
}

const testResults: TestCaseResult[] = []

function assertTest(
  group: string,
  code: string,
  name: string,
  condition: boolean,
  expected: string,
  actual: string,
  details?: any
): boolean {
  testResults.push({
    group,
    code,
    name,
    passed: condition,
    expected,
    actual,
    details,
  })

  const mark = condition ? `${GREEN}✔ PASS${RESET}` : `${RED}✘ FAIL${RESET}`
  console.log(`  [${mark}] [${group}] ${BOLD}${code}: ${name}${RESET}`)

  if (!condition) {
    console.log(`         ${YELLOW}Expected:${RESET} ${expected}`)
    console.log(`         ${RED}Actual:${RESET}   ${actual}`)
    if (details) {
      console.log(`         ${DIM}Details:  ${JSON.stringify(details).slice(0, 160)}${RESET}`)
    }
  }

  return condition
}

// ============================================================================
// Main Boundary & Contraexample Test Suite Execution
// ============================================================================
async function runBoundariesSuite(): Promise<void> {
  console.log(`\n${BOLD}${CYAN}====================================================================${RESET}`)
  console.log(`${BOLD}${CYAN}   MUSE API BOUNDARY & CONTRAEXAMPLE TEST SUITE — PUERTA 2         ${RESET}`)
  console.log(`${BOLD}${CYAN}====================================================================${RESET}`)

  // 1. Resolve configuration
  const validToken = resolveMuseToken()
  const maskedToken = `${validToken.slice(0, 4)}...${validToken.slice(-4)}`
  console.log(`\n  Target Base URL:    ${BOLD}${BASE_URL}${RESET}`)
  console.log(`  Resolved Token:     ${BOLD}${maskedToken}${RESET}`)

  const variants = resolveDemoVariants()
  console.log(`  PLC Variant ID:     ${BOLD}${variants.plcVariantId}${RESET}`)
  console.log(`  PID Variant ID:     ${BOLD}${variants.pidVariantId}${RESET}`)
  console.log(`  PT100 Variant ID:   ${BOLD}${variants.pt100VariantId}${RESET}\n`)

  // 2. Wait for backend readiness
  await waitForBackend(45)

  console.log(`\n${BOLD}--- GRUPO A: Autenticación y Seguridad (HTTP 401) ---${RESET}`)

  // A.1: Request sin header Authorization -> 401
  {
    const res = await httpRequest("/api/muse/v1/products/search?limit=1", { token: null })
    assertTest(
      "AUTH",
      "A.1",
      "GET /products/search sin header Authorization retorna 401 Unauthorized",
      res.status === 401,
      "HTTP 401",
      `HTTP ${res.status}`,
      res.json
    )
  }

  // A.2: Product Details sin header Authorization -> 401
  {
    const res = await httpRequest(`/api/muse/v1/products/${variants.plcVariantId}`, { token: null })
    assertTest(
      "AUTH",
      "A.2",
      "GET /products/{id} sin header Authorization retorna 401 Unauthorized",
      res.status === 401,
      "HTTP 401",
      `HTTP ${res.status}`,
      res.json
    )
  }

  // A.3: Evaluate sin header Authorization -> 401
  {
    const res = await httpRequest("/api/muse/v1/evaluate", {
      method: "POST",
      token: null,
      body: {
        variant_id: variants.plcVariantId,
        requirements: [{ id: "r1", property: "mounting", operator: "equals", value: "din_35mm" }],
      },
    })
    assertTest(
      "AUTH",
      "A.3",
      "POST /evaluate sin header Authorization retorna 401 Unauthorized",
      res.status === 401,
      "HTTP 401",
      `HTTP ${res.status}`,
      res.json
    )
  }

  // A.4: Request con Bearer inválido -> 401
  {
    const res = await httpRequest("/api/muse/v1/products/search?limit=1", {
      token: "invalid_bearer_token_99999_xyz",
    })
    assertTest(
      "AUTH",
      "A.4",
      "GET /products/search con Bearer inválido retorna 401 Unauthorized",
      res.status === 401,
      "HTTP 401",
      `HTTP ${res.status}`,
      res.json
    )
  }

  // A.5: Evaluate con Bearer inválido -> 401
  {
    const res = await httpRequest("/api/muse/v1/evaluate", {
      method: "POST",
      token: "invalid_bearer_token_99999_xyz",
      body: {
        variant_id: variants.plcVariantId,
        requirements: [{ id: "r1", property: "mounting", operator: "equals", value: "din_35mm" }],
      },
    })
    assertTest(
      "AUTH",
      "A.5",
      "POST /evaluate con Bearer inválido retorna 401 Unauthorized",
      res.status === 401,
      "HTTP 401",
      `HTTP ${res.status}`,
      res.json
    )
  }

  // A.6: Verificar que la respuesta 401 incluya error.code y request_id
  {
    const res = await httpRequest("/api/muse/v1/products/search", { token: null })
    const hasErrorCode =
      res.json &&
      res.json.error &&
      typeof res.json.error.code === "string" &&
      res.json.error.code.length > 0
    const hasRequestId =
      res.json &&
      typeof res.json.request_id === "string" &&
      res.json.request_id.length > 0

    assertTest(
      "AUTH",
      "A.6",
      "Respuesta 401 incluye error.code (UNAUTHORIZED) y request_id en cuerpo",
      Boolean(hasErrorCode && hasRequestId),
      "error.code y request_id presentes",
      `error.code=${res.json?.error?.code}, request_id=${res.json?.request_id}`,
      res.json
    )
  }

  // A.7: Verificar headers de seguridad en respuesta 401 (X-Request-Id y Cache-Control: no-store)
  {
    const res = await httpRequest("/api/muse/v1/products/search", { token: null })
    const hasXRequestId = Boolean(res.headers["x-request-id"])
    const hasCacheControlNoStore =
      Boolean(res.headers["cache-control"]) &&
      res.headers["cache-control"].toLowerCase().includes("no-store")

    assertTest(
      "AUTH",
      "A.7",
      "Respuesta incluye headers X-Request-Id y Cache-Control: no-store",
      hasXRequestId && hasCacheControlNoStore,
      "X-Request-Id presente y Cache-Control: no-store",
      `X-Request-Id=${res.headers["x-request-id"]}, Cache-Control=${res.headers["cache-control"]}`,
      res.headers
    )
  }

  console.log(`\n${BOLD}--- GRUPO B: Validación de Parámetros (HTTP 400 Bad Request) ---${RESET}`)

  // B.1: Search con q > 200 caracteres -> 400
  {
    const longQ = "a".repeat(201)
    const res = await httpRequest(`/api/muse/v1/products/search?q=${longQ}`, { token: validToken })
    assertTest(
      "VALIDATION",
      "B.1",
      "GET /products/search con q > 200 caracteres retorna 400 Bad Request",
      res.status === 400,
      "HTTP 400",
      `HTTP ${res.status}`,
      res.json
    )
  }

  // B.2: Search con limit = 0 -> 400
  {
    const res = await httpRequest("/api/muse/v1/products/search?limit=0", { token: validToken })
    assertTest(
      "VALIDATION",
      "B.2",
      "GET /products/search con limit = 0 retorna 400 Bad Request",
      res.status === 400,
      "HTTP 400",
      `HTTP ${res.status}`,
      res.json
    )
  }

  // B.3: Search con limit = 10 -> 400 (el límite permitido es 1..3)
  {
    const res = await httpRequest("/api/muse/v1/products/search?limit=10", { token: validToken })
    assertTest(
      "VALIDATION",
      "B.3",
      "GET /products/search con limit = 10 retorna 400 Bad Request",
      res.status === 400,
      "HTTP 400",
      `HTTP ${res.status}`,
      res.json
    )
  }

  // B.4: Evaluate con requirements vacío [] -> 400
  {
    const res = await httpRequest("/api/muse/v1/evaluate", {
      method: "POST",
      token: validToken,
      body: {
        variant_id: variants.plcVariantId,
        requirements: [],
      },
    })
    assertTest(
      "VALIDATION",
      "B.4",
      "POST /evaluate con requirements vacío [] retorna 400 Bad Request",
      res.status === 400,
      "HTTP 400",
      `HTTP ${res.status}`,
      res.json
    )
  }

  // B.5: Evaluate con > 10 requirements (11 items) -> 400
  {
    const elevenRequirements = Array.from({ length: 11 }, (_, i) => ({
      id: `req-${i + 1}`,
      property: "protocol",
      operator: "equals",
      value: "modbus_rtu",
    }))

    const res = await httpRequest("/api/muse/v1/evaluate", {
      method: "POST",
      token: validToken,
      body: {
        variant_id: variants.plcVariantId,
        requirements: elevenRequirements,
      },
    })
    assertTest(
      "VALIDATION",
      "B.5",
      "POST /evaluate con > 10 requirements (11 items) retorna 400 Bad Request",
      res.status === 400,
      "HTTP 400",
      `HTTP ${res.status}`,
      res.json
    )
  }

  // B.6: Evaluate con propiedad fuera del vocabulario cerrado: 'color' -> 400
  {
    const res = await httpRequest("/api/muse/v1/evaluate", {
      method: "POST",
      token: validToken,
      body: {
        variant_id: variants.plcVariantId,
        requirements: [
          {
            id: "req-invalid-color",
            property: "color",
            operator: "equals",
            value: "gris_industrial",
          },
        ],
      },
    })
    const is400 = res.status === 400
    const isVocabCode =
      res.json?.error?.code === "INVALID_PROPERTY" ||
      res.json?.error?.code === "INVALID_VOCABULARY" ||
      res.json?.error?.code === "INVALID_REQUEST"
    assertTest(
      "VALIDATION",
      "B.6",
      "POST /evaluate con propiedad 'color' fuera de vocabulario retorna 400",
      is400 && isVocabCode,
      "HTTP 400 (INVALID_PROPERTY / INVALID_VOCABULARY)",
      `HTTP ${res.status} (code=${res.json?.error?.code})`,
      res.json
    )
  }

  // B.7: Evaluate con propiedad fuera del vocabulario cerrado: 'bluetooth' -> 400
  {
    const res = await httpRequest("/api/muse/v1/evaluate", {
      method: "POST",
      token: validToken,
      body: {
        variant_id: variants.plcVariantId,
        requirements: [
          {
            id: "req-invalid-bt",
            property: "bluetooth",
            operator: "equals",
            value: true,
          },
        ],
      },
    })
    assertTest(
      "VALIDATION",
      "B.7",
      "POST /evaluate con propiedad 'bluetooth' fuera de vocabulario retorna 400",
      res.status === 400,
      "HTTP 400",
      `HTTP ${res.status} (code=${res.json?.error?.code})`,
      res.json
    )
  }

  // B.8: Evaluate con propiedad fuera del vocabulario cerrado: 'wifi' -> 400
  {
    const res = await httpRequest("/api/muse/v1/evaluate", {
      method: "POST",
      token: validToken,
      body: {
        variant_id: variants.plcVariantId,
        requirements: [
          {
            id: "req-invalid-wifi",
            property: "wifi",
            operator: "equals",
            value: "802.11ax",
          },
        ],
      },
    })
    assertTest(
      "VALIDATION",
      "B.8",
      "POST /evaluate con propiedad 'wifi' fuera de vocabulario retorna 400",
      res.status === 400,
      "HTTP 400",
      `HTTP ${res.status} (code=${res.json?.error?.code})`,
      res.json
    )
  }

  // B.9: Verificar estructura uniforme de error 400 ({ error: { code, message }, request_id })
  {
    const res = await httpRequest("/api/muse/v1/products/search?limit=0", { token: validToken })
    const hasStructure =
      res.json &&
      res.json.error &&
      typeof res.json.error.code === "string" &&
      typeof res.json.error.message === "string" &&
      typeof res.json.request_id === "string"
    assertTest(
      "VALIDATION",
      "B.9",
      "Estructura uniforme de error 400 { error: { code, message }, request_id }",
      Boolean(hasStructure),
      "Formato canónico { error, request_id }",
      JSON.stringify(res.json || {}),
      res.json
    )
  }

  console.log(`\n${BOLD}--- GRUPO C: Aislamiento y 404 (Not Found) ---${RESET}`)

  const FAKE_VARIANT = "variant_01M3Q99999999999INVENTADA0"

  // C.1: GET /api/muse/v1/products/<variant_inventada> -> 404
  {
    const res = await httpRequest(`/api/muse/v1/products/${FAKE_VARIANT}`, {
      token: validToken,
    })
    assertTest(
      "ISOLATION",
      "C.1",
      `GET /products/${FAKE_VARIANT} retorna 404 Not Found`,
      res.status === 404,
      "HTTP 404",
      `HTTP ${res.status}`,
      res.json
    )
  }

  // C.2: POST /api/muse/v1/evaluate con variant_inventada -> 404
  {
    const res = await httpRequest("/api/muse/v1/evaluate", {
      method: "POST",
      token: validToken,
      body: {
        variant_id: FAKE_VARIANT,
        requirements: [
          {
            id: "r1",
            property: "mounting",
            operator: "equals",
            value: "din_35mm",
          },
        ],
      },
    })
    assertTest(
      "ISOLATION",
      "C.2",
      `POST /evaluate con variant_id inventada retorna 404 Not Found`,
      res.status === 404,
      "HTTP 404",
      `HTTP ${res.status}`,
      res.json
    )
  }

  // C.3: Formato uniforme de error 404 ({ error: { code: "NOT_FOUND", message }, request_id })
  {
    const res = await httpRequest(`/api/muse/v1/products/${FAKE_VARIANT}`, {
      token: validToken,
    })
    const isCodeNotFound = res.json?.error?.code === "NOT_FOUND"
    const hasRequestId = typeof res.json?.request_id === "string"
    assertTest(
      "ISOLATION",
      "C.3",
      "Respuesta 404 incluye error.code='NOT_FOUND' y request_id",
      isCodeNotFound && hasRequestId,
      "code=NOT_FOUND y request_id presente",
      `code=${res.json?.error?.code}, request_id=${res.json?.request_id}`,
      res.json
    )
  }

  console.log(`\n${BOLD}--- GRUPO D: Contraejemplos Técnicos Deterministas ---${RESET}`)

  // D.1: SKU 1 (PLC DIN): Probar requerir 'Modbus TCP' -> overall_satisfied = false, requirement satisfied = false
  {
    const res = await httpRequest("/api/muse/v1/evaluate", {
      method: "POST",
      token: validToken,
      body: {
        variant_id: variants.plcVariantId,
        requirements: [
          {
            id: "req-plc-tcp",
            property: "protocol",
            operator: "equals",
            value: "modbus_tcp",
          },
        ],
      },
    })

    const is200 = res.status === 200
    const overallSatisfied = res.json?.overall_satisfied
    const reqEvaluation = res.json?.evaluations?.find((e: any) => e.requirement_id === "req-plc-tcp")
    const reqSatisfied = reqEvaluation?.satisfied

    assertTest(
      "CONTRAEXAMPLE",
      "D.1",
      "SKU 1 (PLC DIN): Requerir 'Modbus TCP' -> overall_satisfied = false, satisfied = false",
      is200 && overallSatisfied === false && reqSatisfied === false,
      "HTTP 200, overall_satisfied=false, satisfied=false",
      `HTTP ${res.status}, overall_satisfied=${overallSatisfied}, reqSatisfied=${reqSatisfied}`,
      reqEvaluation
    )
  }

  // D.2: SKU 1 (PLC DIN): Probar requerir 'analog_output' (4–20 mA salida) -> overall_satisfied = false
  {
    const res = await httpRequest("/api/muse/v1/evaluate", {
      method: "POST",
      token: validToken,
      body: {
        variant_id: variants.plcVariantId,
        requirements: [
          {
            id: "req-plc-ao",
            property: "analog_output",
            operator: "equals",
            value: "4-20 mA",
          },
        ],
      },
    })

    const is200 = res.status === 200
    const overallSatisfied = res.json?.overall_satisfied
    const reqEvaluation = res.json?.evaluations?.find((e: any) => e.requirement_id === "req-plc-ao")
    const reqSatisfied = reqEvaluation?.satisfied

    assertTest(
      "CONTRAEXAMPLE",
      "D.2",
      "SKU 1 (PLC DIN): Requerir 'analog_output' (4–20 mA) -> overall_satisfied = false",
      is200 && overallSatisfied === false && reqSatisfied === false,
      "HTTP 200, overall_satisfied=false, satisfied=false",
      `HTTP ${res.status}, overall_satisfied=${overallSatisfied}, reqSatisfied=${reqSatisfied}`,
      reqEvaluation
    )
  }

  // D.3: SKU 2 (PID): Probar requerir montaje 'din_rail' (el PID es panel) -> overall_satisfied = false
  {
    const res = await httpRequest("/api/muse/v1/evaluate", {
      method: "POST",
      token: validToken,
      body: {
        variant_id: variants.pidVariantId,
        requirements: [
          {
            id: "req-pid-din",
            property: "mounting",
            operator: "equals",
            value: "din_rail",
          },
        ],
      },
    })

    const is200 = res.status === 200
    const overallSatisfied = res.json?.overall_satisfied
    const reqEvaluation = res.json?.evaluations?.find((e: any) => e.requirement_id === "req-pid-din")
    const reqSatisfied = reqEvaluation?.satisfied

    assertTest(
      "CONTRAEXAMPLE",
      "D.3",
      "SKU 2 (PID): Requerir montaje 'din_rail' (el PID es panel) -> overall_satisfied = false",
      is200 && overallSatisfied === false && reqSatisfied === false,
      "HTTP 200, overall_satisfied=false, satisfied=false",
      `HTTP ${res.status}, overall_satisfied=${overallSatisfied}, reqSatisfied=${reqSatisfied}`,
      reqEvaluation
    )
  }

  // D.4: SKU 2 (PID): Probar requerir entrada analógica 'analog_input' 4–20 mA -> overall_satisfied = false
  // (El PID tiene salida 4–20 mA, entrada sensor Pt100; NUNCA confundir salida con entrada)
  {
    const res = await httpRequest("/api/muse/v1/evaluate", {
      method: "POST",
      token: validToken,
      body: {
        variant_id: variants.pidVariantId,
        requirements: [
          {
            id: "req-pid-ai",
            property: "analog_input",
            operator: "range_contains",
            min: 4,
            max: 20,
            unit: "mA",
          },
        ],
      },
    })

    const is200 = res.status === 200
    const overallSatisfied = res.json?.overall_satisfied
    const reqEvaluation = res.json?.evaluations?.find((e: any) => e.requirement_id === "req-pid-ai")
    const reqSatisfied = reqEvaluation?.satisfied

    assertTest(
      "CONTRAEXAMPLE",
      "D.4",
      "SKU 2 (PID): Requerir 'analog_input' 4–20 mA (salida ≠ entrada) -> overall_satisfied = false",
      is200 && overallSatisfied === false && reqSatisfied === false,
      "HTTP 200, overall_satisfied=false, satisfied=false",
      `HTTP ${res.status}, overall_satisfied=${overallSatisfied}, reqSatisfied=${reqSatisfied}`,
      reqEvaluation
    )
  }

  // D.5: SKU 3 (PT100): Probar requerir salida analógica 4–20 mA -> overall_satisfied = false
  // (La sonda es pasiva, NO tiene transmisor integrado)
  {
    const res = await httpRequest("/api/muse/v1/evaluate", {
      method: "POST",
      token: validToken,
      body: {
        variant_id: variants.pt100VariantId,
        requirements: [
          {
            id: "req-pt100-ao",
            property: "analog_output",
            operator: "equals",
            value: "4-20 mA",
          },
        ],
      },
    })

    const is200 = res.status === 200
    const overallSatisfied = res.json?.overall_satisfied
    const reqEvaluation = res.json?.evaluations?.find((e: any) => e.requirement_id === "req-pt100-ao")
    const reqSatisfied = reqEvaluation?.satisfied

    assertTest(
      "CONTRAEXAMPLE",
      "D.5",
      "SKU 3 (PT100): Requerir salida analógica 4–20 mA (sonda pasiva) -> overall_satisfied = false",
      is200 && overallSatisfied === false && reqSatisfied === false,
      "HTTP 200, overall_satisfied=false, satisfied=false",
      `HTTP ${res.status}, overall_satisfied=${overallSatisfied}, reqSatisfied=${reqSatisfied}`,
      reqEvaluation
    )
  }

  // D.6: SKU 3 (PT100): Probar requerir protocolo digital Modbus -> overall_satisfied = false
  // (La sonda es pasiva, NO tiene interfaz digital)
  {
    const res = await httpRequest("/api/muse/v1/evaluate", {
      method: "POST",
      token: validToken,
      body: {
        variant_id: variants.pt100VariantId,
        requirements: [
          {
            id: "req-pt100-modbus",
            property: "protocol",
            operator: "equals",
            value: "modbus_rtu",
          },
        ],
      },
    })

    const is200 = res.status === 200
    const overallSatisfied = res.json?.overall_satisfied
    const reqEvaluation = res.json?.evaluations?.find((e: any) => e.requirement_id === "req-pt100-modbus")
    const reqSatisfied = reqEvaluation?.satisfied

    assertTest(
      "CONTRAEXAMPLE",
      "D.6",
      "SKU 3 (PT100): Requerir protocolo 'modbus_rtu' (sin interfaz digital) -> overall_satisfied = false",
      is200 && overallSatisfied === false && reqSatisfied === false,
      "HTTP 200, overall_satisfied=false, satisfied=false",
      `HTTP ${res.status}, overall_satisfied=${overallSatisfied}, reqSatisfied=${reqSatisfied}`,
      reqEvaluation
    )
  }

  console.log(`\n${BOLD}--- GRUPO E: Controles Positivos (Sanity Controls) ---${RESET}`)

  // E.1: SKU 1 (PLC DIN): Afirmaciones válidas devuelven overall_satisfied = true
  {
    const res = await httpRequest("/api/muse/v1/evaluate", {
      method: "POST",
      token: validToken,
      body: {
        variant_id: variants.plcVariantId,
        requirements: [
          { id: "p1", property: "mounting", operator: "equals", value: "din_35mm" },
          { id: "p2", property: "protocol", operator: "equals", value: "modbus_rtu" },
          { id: "p3", property: "supply_voltage", operator: "equals", value: "24vdc" },
        ],
      },
    })
    const is200 = res.status === 200
    const overallSatisfied = res.json?.overall_satisfied
    assertTest(
      "POSITIVE_CONTROL",
      "E.1",
      "SKU 1 (PLC DIN): Requisitos válidos (DIN, Modbus RTU, 24VDC) -> overall_satisfied = true",
      is200 && overallSatisfied === true,
      "HTTP 200, overall_satisfied=true",
      `HTTP ${res.status}, overall_satisfied=${overallSatisfied}`,
      res.json
    )
  }

  // E.2: SKU 2 (PID): Afirmaciones válidas devuelven overall_satisfied = true
  {
    const res = await httpRequest("/api/muse/v1/evaluate", {
      method: "POST",
      token: validToken,
      body: {
        variant_id: variants.pidVariantId,
        requirements: [
          { id: "p1", property: "mounting", operator: "equals", value: "panel" },
          { id: "p2", property: "control_function", operator: "equals", value: "pid" },
          { id: "p3", property: "analog_output", operator: "range_contains", min: 4, max: 20, unit: "mA" },
          { id: "p4", property: "protocol", operator: "equals", value: "modbus_rtu" },
        ],
      },
    })
    const is200 = res.status === 200
    const overallSatisfied = res.json?.overall_satisfied
    assertTest(
      "POSITIVE_CONTROL",
      "E.2",
      "SKU 2 (PID): Requisitos válidos (Panel, PID, Salida 4-20mA, Modbus RTU) -> overall_satisfied = true",
      is200 && overallSatisfied === true,
      "HTTP 200, overall_satisfied=true",
      `HTTP ${res.status}, overall_satisfied=${overallSatisfied}`,
      res.json
    )
  }

  // E.3: SKU 3 (PT100): Afirmaciones válidas devuelven overall_satisfied = true
  {
    const res = await httpRequest("/api/muse/v1/evaluate", {
      method: "POST",
      token: validToken,
      body: {
        variant_id: variants.pt100VariantId,
        requirements: [
          { id: "p1", property: "sensor_element", operator: "equals", value: "pt100" },
        ],
      },
    })
    const is200 = res.status === 200
    const overallSatisfied = res.json?.overall_satisfied
    assertTest(
      "POSITIVE_CONTROL",
      "E.3",
      "SKU 3 (PT100): Requisito válido (sensor_element pt100) -> overall_satisfied = true",
      is200 && overallSatisfied === true,
      "HTTP 200, overall_satisfied=true",
      `HTTP ${res.status}, overall_satisfied=${overallSatisfied}`,
      res.json
    )
  }

  // ==========================================================================
  // Summary & Diagnostic Report
  // ==========================================================================
  const total = testResults.length
  const passed = testResults.filter((t) => t.passed).length
  const failed = testResults.filter((t) => !t.passed).length

  console.log(`\n${BOLD}${CYAN}====================================================================${RESET}`)
  console.log(`${BOLD}${CYAN}   RESUMEN FINAL DE PRUEBAS DE FRONTERA Y CONTRAEJEMPLOS           ${RESET}`)
  console.log(`${BOLD}${CYAN}====================================================================${RESET}`)

  const groups = Array.from(new Set(testResults.map((t) => t.group)))
  for (const group of groups) {
    const groupTests = testResults.filter((t) => t.group === group)
    const grpPassed = groupTests.filter((t) => t.passed).length
    const grpTotal = groupTests.length
    const allPass = grpPassed === grpTotal
    const badge = allPass
      ? `${GREEN}PASS (${grpPassed}/${grpTotal})${RESET}`
      : `${RED}FAIL (${grpPassed}/${grpTotal})${RESET}`

    console.log(`  * ${BOLD}${group.padEnd(18)}${RESET} ${badge}`)
  }

  console.log(`\n  Total de Pruebas:    ${BOLD}${total}${RESET}`)
  console.log(`  Superadas (PASS):    ${GREEN}${BOLD}${passed}${RESET}`)
  console.log(`  Fallidas  (FAIL):    ${failed > 0 ? RED : GREEN}${BOLD}${failed}${RESET}`)

  if (failed === 0) {
    console.log(`\n${GREEN}${BOLD}✔ TODAS LAS PRUEBAS DE FRONTERA Y CONTRAEJEMPLOS PASARON EXITOSAMENTE (100%)${RESET}\n`)
    process.exit(0)
  } else {
    console.error(`\n${RED}${BOLD}✘ SE DETECTARON ${failed} FALLOS EN LA SUITE DE FRONTERAS Y CONTRAEJEMPLOS${RESET}\n`)
    process.exit(1)
  }
}

// Direct execution entrypoint
runBoundariesSuite().catch((err) => {
  console.error(`\n${RED}${BOLD}[FATAL ERROR] Excepción no controlada en la suite:${RESET}`, err)
  process.exit(1)
})
