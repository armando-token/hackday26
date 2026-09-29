/**
 * Automated Verification & Audit Suite for Phase 2 (Puerta 2)
 * Controlnautas × Meta Muse (Hack Day 2026)
 *
 * Verifies 100% of Acceptance Criteria:
 *  1. GET /healthz público: 200 OK, {status: 'ok', version, commit}, sin secretos.
 *  2. Seguridad Auth: 401 sin Bearer, 401 con Bearer inválido, 200 con Bearer válido.
 *  3. Headers obligatorios: X-Request-Id y Cache-Control: no-store en evaluate y search.
 *  4. GET /api/muse/v1/products/search: validación de q (<=200) y limit (1..3), lista solo demo, sin precio cacheado.
 *  5. GET /api/muse/v1/products/{variantId}: datos completos, profile, facts y sources para los 3 SKUs demo; 404 para variante inexistente.
 *  6. POST /api/muse/v1/evaluate: evaluación de predicados requeridos positivos para los 3 SKUs (overall_satisfied: true).
 *  7. Contraejemplos evaluados: Modbus TCP en PLC, Salida 4-20mA en PLC, DIN en PID, Entrada 4-20mA en PID, 4-20mA/Modbus en PT100 (overall_satisfied: false).
 *  8. Respuestas de error uniformes: { error: { code, message }, request_id }.
 *  9. Manifiesto actualizado y activo: URLs válidas con IP elástica 52.20.66.203.
 * 10. Resumen detallado con formato ANSI y exit code 0 únicamente si el 100% de las pruebas pasa.
 */

import fs from "fs";
import path from "path";
import http from "http";
import https from "https";
import { execSync } from "child_process";

// ANSI Styling Constants
const RESET = "\x1b[0m";
const BOLD = "\x1b[1m";
const GREEN = "\x1b[32m";
const RED = "\x1b[31m";
const YELLOW = "\x1b[33m";
const CYAN = "\x1b[36m";
const MAGENTA = "\x1b[35m";
const GRAY = "\x1b[90m";

interface TestResult {
  gate: string;
  name: string;
  passed: boolean;
  expected: string;
  actual: string;
  details?: any;
}

const results: TestResult[] = [];

function record(
  gate: string,
  name: string,
  passed: boolean,
  expected: string,
  actual: string,
  details?: any
) {
  results.push({ gate, name, passed, expected, actual, details });
  const status = passed
    ? `${GREEN}✔ PASS${RESET}`
    : `${RED}✘ FAIL${RESET}`;
  console.log(`  [${status}] [${gate}] ${BOLD}${name}${RESET}`);
  if (!passed) {
    console.log(`         ${YELLOW}Expected:${RESET} ${expected}`);
    console.log(`         ${RED}Actual:${RESET}   ${actual}`);
  }
}

// HTTP request helper returning parsed json, status, and raw headers
interface HttpResponse<T = any> {
  status: number;
  headers: Record<string, string>;
  rawBody: string;
  data: T | null;
}

function httpRequest<T = any>(
  urlStr: string,
  options: {
    method?: string;
    headers?: Record<string, string>;
    body?: any;
    timeoutMs?: number;
  } = {}
): Promise<HttpResponse<T>> {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(urlStr);
    const isHttps = parsedUrl.protocol === "https:";
    const transport = isHttps ? https : http;

    const payload =
      options.body !== undefined
        ? typeof options.body === "string"
          ? options.body
          : JSON.stringify(options.body)
        : null;

    const reqHeaders: Record<string, string> = {
      ...(options.headers || {}),
    };

    if (payload && !reqHeaders["Content-Type"] && !reqHeaders["content-type"]) {
      reqHeaders["Content-Type"] = "application/json";
    }
    if (payload && !reqHeaders["Content-Length"] && !reqHeaders["content-length"]) {
      reqHeaders["Content-Length"] = String(Buffer.byteLength(payload));
    }

    const reqOptions: http.RequestOptions = {
      method: options.method || "GET",
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || (isHttps ? 443 : 80),
      path: parsedUrl.pathname + parsedUrl.search,
      headers: reqHeaders,
      timeout: options.timeoutMs || 10000,
    };

    const req = transport.request(reqOptions, (res) => {
      let chunks: Buffer[] = [];
      res.on("data", (chunk) => chunks.push(chunk));
      res.on("end", () => {
        const rawBody = Buffer.concat(chunks).toString("utf8");
        const lowerHeaders: Record<string, string> = {};
        for (const [k, v] of Object.entries(res.headers)) {
          if (v !== undefined) {
            lowerHeaders[k.toLowerCase()] = Array.isArray(v) ? v.join(", ") : v;
          }
        }

        let data: T | null = null;
        try {
          data = JSON.parse(rawBody);
        } catch {
          data = null;
        }

        resolve({
          status: res.statusCode || 0,
          headers: lowerHeaders,
          rawBody,
          data,
        });
      });
    });

    req.on("error", (err) => reject(err));
    req.on("timeout", () => {
      req.destroy();
      reject(new Error(`HTTP request timeout after ${options.timeoutMs || 10000}ms`));
    });

    if (payload) {
      req.write(payload);
    }
    req.end();
  });
}

// Safe token loader
function loadMuseToken(rootDir: string): string {
  if (process.env.MUSE_API_TOKEN) {
    return process.env.MUSE_API_TOKEN.trim();
  }
  const candidatePaths = [
    path.join(rootDir, "b2b-backend", "apps", "backend", ".env"),
    path.join(rootDir, ".env"),
  ];
  for (const envPath of candidatePaths) {
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, "utf8");
      const match = content.match(/^MUSE_API_TOKEN\s*=\s*(.+)$/m);
      if (match && match[1]) {
        return match[1].trim().replace(/^['"]|['"]$/g, "");
      }
    }
  }
  return "";
}

// Mask token for safe printing
function maskToken(token: string): string {
  if (!token || token.length <= 8) return "****";
  return `${token.slice(0, 4)}...${token.slice(-4)}`;
}

// Helper: Query Postgres DB directly for database facts
function psqlQuery<T = any>(sql: string): T[] {
  try {
    const wrapped = `SELECT json_agg(t) FROM (${sql.trim().replace(/;+$/, "")}) t;`;
    const stdout = execSync(
      `PGPASSWORD=password psql -U postgres -h localhost -d medusa -t -A -c "${wrapped}"`,
      { encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] }
    );
    const trimmed = stdout.trim();
    if (!trimmed || trimmed === "") return [];
    return JSON.parse(trimmed) || [];
  } catch (err: any) {
    return [];
  }
}

async function runSuite() {
  console.log(`${BOLD}${CYAN}================================================================${RESET}`);
  console.log(`${BOLD}${CYAN}  CONTROLNAUTAS × META MUSE — AUDITORÍA AUTOMATIZADA DE FASE 2  ${RESET}`);
  console.log(`${BOLD}${CYAN}  Verificación Integral de Criterios de Aceptación (Puerta 2)   ${RESET}`);
  console.log(`${BOLD}${CYAN}================================================================${RESET}\n`);

  const ROOT_DIR = path.resolve(__dirname, "..");
  const BACKEND_URL = (process.env.MEDUSA_BACKEND_URL || "http://127.0.0.1:9000").replace(/\/+$/, "");
  const STOREFRONT_URL = (process.env.STOREFRONT_URL || "http://127.0.0.1:8000").replace(/\/+$/, "");
  const candidateManifestPaths = [
    path.join(ROOT_DIR, "hackday-demo-manifest.json"),
    path.join(ROOT_DIR, "hackday26", "hackday-demo-manifest.json"),
    "/home/ubuntu/hackday26/hackday-demo-manifest.json",
  ];
  const MANIFEST_PATH = candidateManifestPaths.find((p) => fs.existsSync(p)) || candidateManifestPaths[0];

  const token = loadMuseToken(ROOT_DIR);
  console.log(`  ${BOLD}Host Backend URL:${RESET}      ${BACKEND_URL}`);
  console.log(`  ${BOLD}Storefront URL:${RESET}        ${STOREFRONT_URL}`);
  console.log(`  ${BOLD}Token Configurado:${RESET}     ${maskToken(token)} (longitud: ${token.length})`);
  console.log(`  ${BOLD}Manifiesto Path:${RESET}       ${MANIFEST_PATH}\n`);

  // Verify token exists
  record(
    "G2-ENV-SECURITY",
    "MUSE_API_TOKEN existe en el entorno del servidor y tiene entropía adecuada (> 32 chars)",
    token.length >= 32,
    "Token criptográfico >= 32 caracteres",
    token ? `Token configurado con longitud ${token.length}` : "Token vacío o no configurado"
  );

  // Load manifest
  let manifest: any = null;
  let variantMapping: Record<string, string> = {};
  if (fs.existsSync(MANIFEST_PATH)) {
    try {
      manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8"));
      if (manifest.products) {
        for (const [sku, item] of Object.entries<any>(manifest.products)) {
          if (item?.variant_id) {
            variantMapping[sku] = item.variant_id;
          }
        }
      }
    } catch (err: any) {
      console.error("Error leyendo manifiesto:", err.message);
    }
  }

  // -------------------------------------------------------------
  // [GATE 1] AUDITORÍA GET /healthz (Público, sin secretos)
  // -------------------------------------------------------------
  console.log(`\n${BOLD}[1] AUDITORÍA GET /healthz (ENDPOINT PÚBLICO Y DIAGNÓSTICO)${RESET}`);
  try {
    const res = await httpRequest(`${BACKEND_URL}/healthz`);
    
    // Status 200
    record(
      "G2-HEALTHZ-200",
      "GET /healthz responde HTTP 200 OK de forma pública (sin header Authorization)",
      res.status === 200,
      "HTTP 200 OK",
      `HTTP ${res.status}`
    );

    // Schema validation
    const hasStatusOk = res.data?.status === "ok";
    const hasVersion = typeof res.data?.version === "string" && res.data.version.length > 0;
    const hasCommit = typeof res.data?.commit === "string" && res.data.commit.length > 0;

    record(
      "G2-HEALTHZ-SCHEMA",
      "GET /healthz payload cumple contrato estándar: { status: 'ok', version, commit }",
      hasStatusOk && hasVersion && hasCommit,
      "{ status: 'ok', version: string, commit: string }",
      JSON.stringify(res.data)
    );

    // Zero secrets check
    const rawLower = res.rawBody.toLowerCase();
    const tokenInBody = token && res.rawBody.includes(token);
    const postgresInBody = rawLower.includes("postgres://") || rawLower.includes("password=");
    const secretKeyInBody = rawLower.includes("secret") || rawLower.includes("private_key");

    const noSecrets = !tokenInBody && !postgresInBody && !secretKeyInBody;
    record(
      "G2-HEALTHZ-NO-SECRETS",
      "GET /healthz no expone credenciales, cadenas de base de datos ni tokens Bearer",
      noSecrets,
      "Payload completamente libre de secretos",
      noSecrets ? "Sin secretos detectados" : "ALERTA: Se detectaron posibles secretos en la respuesta"
    );
  } catch (err: any) {
    record("G2-HEALTHZ-CONNECT", "Conexión a GET /healthz", false, "200 OK", `Fallo de conexión: ${err.message}`);
  }

  // -------------------------------------------------------------
  // [GATE 2] SEGURIDAD AUTH (BEARER TOKEN GUARD & HEADER VALIDATION)
  // -------------------------------------------------------------
  console.log(`\n${BOLD}[2] SEGURIDAD AUTH Y PROTOCOLO DE AUTENTICACIÓN BEARER${RESET}`);
  
  // 2.1 Without token -> 401
  try {
    const resSearchNoAuth = await httpRequest(`${BACKEND_URL}/api/muse/v1/products/search`);
    record(
      "G2-AUTH-NO-TOKEN-SEARCH",
      "GET /api/muse/v1/products/search sin header Authorization retorna HTTP 401 Unauthorized",
      resSearchNoAuth.status === 401,
      "HTTP 401 Unauthorized",
      `HTTP ${resSearchNoAuth.status}`
    );

    const resEvalNoAuth = await httpRequest(`${BACKEND_URL}/api/muse/v1/evaluate`, {
      method: "POST",
      body: { variant_id: "variant_test", requirements: [] },
    });
    record(
      "G2-AUTH-NO-TOKEN-EVALUATE",
      "POST /api/muse/v1/evaluate sin header Authorization retorna HTTP 401 Unauthorized",
      resEvalNoAuth.status === 401,
      "HTTP 401 Unauthorized",
      `HTTP ${resEvalNoAuth.status}`
    );
  } catch (err: any) {
    record("G2-AUTH-NO-TOKEN", "Prueba de rechazo 401 sin token", false, "401", err.message);
  }

  // 2.2 Invalid token -> 401
  try {
    const resSearchBadToken = await httpRequest(`${BACKEND_URL}/api/muse/v1/products/search`, {
      headers: { Authorization: "Bearer token-falso-y-completamente-invalido-9999" },
    });
    record(
      "G2-AUTH-INVALID-TOKEN",
      "GET /api/muse/v1/products/search con Bearer inválido retorna HTTP 401 Unauthorized",
      resSearchBadToken.status === 401,
      "HTTP 401 Unauthorized",
      `HTTP ${resSearchBadToken.status}`
    );

    const resMalformed = await httpRequest(`${BACKEND_URL}/api/muse/v1/products/search`, {
      headers: { Authorization: "Basic dXNlcjpwYXNz" },
    });
    record(
      "G2-AUTH-MALFORMED-SCHEME",
      "GET /api/muse/v1/products/search con esquema de autorización no Bearer retorna HTTP 401",
      resMalformed.status === 401,
      "HTTP 401 Unauthorized",
      `HTTP ${resMalformed.status}`
    );
  } catch (err: any) {
    record("G2-AUTH-BAD-TOKEN", "Prueba de rechazo 401 con token inválido", false, "401", err.message);
  }

  // 2.3 Valid token -> 200
  try {
    const resValid = await httpRequest(`${BACKEND_URL}/api/muse/v1/products/search`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    record(
      "G2-AUTH-VALID-TOKEN",
      "GET /api/muse/v1/products/search con Bearer token válido autoriza y responde HTTP 200 OK",
      resValid.status === 200,
      "HTTP 200 OK",
      `HTTP ${resValid.status}`
    );
  } catch (err: any) {
    record("G2-AUTH-VALID-TOKEN", "Prueba de autorización válida", false, "200", err.message);
  }

  // -------------------------------------------------------------
  // [GATE 3] HEADERS OBLIGATORIOS (X-Request-Id & Cache-Control: no-store)
  // -------------------------------------------------------------
  console.log(`\n${BOLD}[3] HEADERS OBLIGATORIOS DE PROTOCOLO (X-Request-Id y Cache-Control: no-store)${RESET}`);
  try {
    const customReqIdSearch = "req-audit-search-" + Date.now();
    const resHeadersSearch = await httpRequest(`${BACKEND_URL}/api/muse/v1/products/search`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "X-Request-Id": customReqIdSearch,
      },
    });

    const cacheControlSearch = resHeadersSearch.headers["cache-control"] || "";
    const returnedReqIdSearch = resHeadersSearch.headers["x-request-id"] || "";
    const bodyReqIdSearch = resHeadersSearch.data?.request_id || "";

    record(
      "G2-HEADER-CACHE-CONTROL-SEARCH",
      "GET /api/muse/v1/products/search incluye header 'Cache-Control: no-store'",
      cacheControlSearch.includes("no-store"),
      "Cache-Control: no-store",
      `Cache-Control: ${cacheControlSearch || "(ausente)"}`
    );

    record(
      "G2-HEADER-REQUEST-ID-SEARCH",
      "GET /api/muse/v1/products/search propaga X-Request-Id en header y cuerpo JSON",
      returnedReqIdSearch === customReqIdSearch && bodyReqIdSearch === customReqIdSearch,
      `X-Request-Id: ${customReqIdSearch} (header y body)`,
      `header: ${returnedReqIdSearch}, body: ${bodyReqIdSearch}`
    );

    // Evaluate headers
    const customReqIdEval = "req-audit-eval-" + Date.now();
    const firstVariantId = Object.values(variantMapping)[0] || "variant_demo";
    const resHeadersEval = await httpRequest(`${BACKEND_URL}/api/muse/v1/evaluate`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "X-Request-Id": customReqIdEval,
      },
      body: {
        variant_id: firstVariantId,
        requirements: [
          { id: "r1", property: "mounting", operator: "equals", value: "din_35mm" },
        ],
      },
    });

    const cacheControlEval = resHeadersEval.headers["cache-control"] || "";
    const returnedReqIdEval = resHeadersEval.headers["x-request-id"] || "";
    const bodyReqIdEval = resHeadersEval.data?.request_id || "";

    record(
      "G2-HEADER-CACHE-CONTROL-EVALUATE",
      "POST /api/muse/v1/evaluate incluye header 'Cache-Control: no-store'",
      cacheControlEval.includes("no-store"),
      "Cache-Control: no-store",
      `Cache-Control: ${cacheControlEval || "(ausente)"}`
    );

    record(
      "G2-HEADER-REQUEST-ID-EVALUATE",
      "POST /api/muse/v1/evaluate propaga X-Request-Id en header y cuerpo JSON",
      returnedReqIdEval === customReqIdEval && bodyReqIdEval === customReqIdEval,
      `X-Request-Id: ${customReqIdEval} (header y body)`,
      `header: ${returnedReqIdEval}, body: ${bodyReqIdEval}`
    );
  } catch (err: any) {
    record("G2-HEADERS-VERIFY", "Verificación de headers obligatorios", false, "Headers conformes", err.message);
  }

  // -------------------------------------------------------------
  // [GATE 4] BÚSQUEDA TÉCNICA (GET /api/muse/v1/products/search)
  // -------------------------------------------------------------
  console.log(`\n${BOLD}[4] BÚSQUEDA TÉCNICA (VALIDACIONES, ALCANCE DEMO Y SIN PRECIO CACHEADO)${RESET}`);
  
  // 4.1 Parameter validation: q <= 200
  try {
    const longQ = "A".repeat(201);
    const resLongQ = await httpRequest(`${BACKEND_URL}/api/muse/v1/products/search?q=${longQ}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    record(
      "G2-SEARCH-Q-MAX-LENGTH",
      "GET /products/search con q > 200 caracteres es rechazado con HTTP 400 Bad Request",
      resLongQ.status === 400,
      "HTTP 400 Bad Request",
      `HTTP ${resLongQ.status}`
    );

    const normalQ = "A".repeat(200);
    const resNormalQ = await httpRequest(`${BACKEND_URL}/api/muse/v1/products/search?q=${normalQ}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    record(
      "G2-SEARCH-Q-BOUNDARY-200",
      "GET /products/search con q = 200 caracteres es aceptado con HTTP 200 OK",
      resNormalQ.status === 200,
      "HTTP 200 OK",
      `HTTP ${resNormalQ.status}`
    );
  } catch (err: any) {
    record("G2-SEARCH-Q-VALIDATION", "Validación de longitud de q", false, "400 y 200", err.message);
  }

  // 4.2 Parameter validation: limit (1..3)
  try {
    const resLimitZero = await httpRequest(`${BACKEND_URL}/api/muse/v1/products/search?limit=0`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const resLimitFour = await httpRequest(`${BACKEND_URL}/api/muse/v1/products/search?limit=4`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const resLimitAlpha = await httpRequest(`${BACKEND_URL}/api/muse/v1/products/search?limit=abc`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const limitsRejected =
      resLimitZero.status === 400 && resLimitFour.status === 400 && resLimitAlpha.status === 400;

    record(
      "G2-SEARCH-LIMIT-RANGE-VALIDATION",
      "GET /products/search con limit < 1, limit > 3 o limit no entero es rechazado con HTTP 400",
      limitsRejected,
      "HTTP 400 para limit=0, limit=4 y limit=abc",
      `limit=0 (${resLimitZero.status}), limit=4 (${resLimitFour.status}), limit=abc (${resLimitAlpha.status})`
    );

    const resLimitOne = await httpRequest(`${BACKEND_URL}/api/muse/v1/products/search?limit=1`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const limitOneOk =
      resLimitOne.status === 200 &&
      Array.isArray(resLimitOne.data?.products) &&
      resLimitOne.data.products.length === 1;

    record(
      "G2-SEARCH-LIMIT-ONE-RESPECTED",
      "GET /products/search con limit=1 retorna exactamente 1 producto",
      limitOneOk,
      "HTTP 200 con products.length === 1",
      `HTTP ${resLimitOne.status} con products.length = ${resLimitOne.data?.products?.length}`
    );
  } catch (err: any) {
    record("G2-SEARCH-LIMIT-VALIDATION", "Validación de parámetro limit", false, "Conforme", err.message);
  }

  // 4.3 Demo-only isolation and schema
  try {
    const resAllDemo = await httpRequest(`${BACKEND_URL}/api/muse/v1/products/search?limit=3`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const products: any[] = resAllDemo.data?.products || [];
    const allAreDemo =
      products.length > 0 &&
      products.every(
        (p) => p.demo === true && typeof p.sku === "string" && p.sku.startsWith("CN-DEMO-")
      );

    record(
      "G2-SEARCH-DEMO-ISOLATION",
      "GET /products/search retorna estrictamente productos del catálogo de demostración (demo: true, SKU CN-DEMO-*)",
      allAreDemo,
      "Todos los productos son demo (demo=true, SKU=CN-DEMO-*)",
      products.map((p) => `${p.sku} (demo:${p.demo})`).join(", ") || "Sin productos"
    );

    // Check mandatory fields
    const hasRequiredFields = products.every(
      (p) =>
        p.variant_id &&
        p.sku &&
        p.model &&
        p.title &&
        p.product_url &&
        typeof p.technical_summary === "string" &&
        p.demo === true
    );

    record(
      "G2-SEARCH-ITEM-SCHEMA",
      "Cada ítem de búsqueda contiene variant_id, sku, model, title, product_url, technical_summary y demo",
      hasRequiredFields,
      "Esquema completo y tipado en todos los ítems",
      hasRequiredFields ? "Esquema verificado en todos los productos" : "Faltan campos requeridos en ítems"
    );

    // 4.3.1 Product search product_url check: starts with 'https://data.controlnautas.com/us/products/'
    const allUrlsValidUs =
      products.length > 0 &&
      products.every(
        (p) =>
          typeof p.product_url === "string" &&
          p.product_url.startsWith("https://data.controlnautas.com/us/products/")
      );

    record(
      "G2-SEARCH-PRODUCT-URL-US",
      "product_url en GET /products/search inicia con 'https://data.controlnautas.com/us/products/'",
      allUrlsValidUs,
      "https://data.controlnautas.com/us/products/<handle> en todos los ítems",
      allUrlsValidUs
        ? "Todas las URLs cumplen con el prefijo /us/products/ de producción"
        : `URLs encontradas: ${products.map((p) => p.product_url).join(", ")}`
    );

    // 4.4 STRICT PROHIBITION: Zero price or stock in search response
    let hasPriceOrStockLeak = false;
    const leakedKeys: string[] = [];
    for (const p of products) {
      const forbiddenKeys = [
        "price",
        "price_pen",
        "price_usd",
        "amount",
        "unit_price",
        "unit_price_cents",
        "subtotal",
        "calculated_price",
        "currency_code",
        "stock",
        "inventory_quantity",
        "stocked_quantity",
        "available_quantity",
      ];
      for (const k of forbiddenKeys) {
        if (p[k] !== undefined) {
          hasPriceOrStockLeak = true;
          leakedKeys.push(`${p.sku}:${k}`);
        }
      }
    }

    record(
      "G2-SEARCH-NO-PRICE-STOCK-LEAK",
      "PROHIBICIÓN ESTRICTA: La respuesta de búsqueda no contiene precios cacheados (ni PEN ni USD) ni inventario/stock",
      !hasPriceOrStockLeak,
      "Zero campos de precio ni stock en la respuesta técnica",
      hasPriceOrStockLeak
        ? `ALERTA: Se detectaron campos filtrados: ${leakedKeys.join(", ")}`
        : "Sin precio ni stock en payload (100% libre de fuga comercial)"
    );
  } catch (err: any) {
    record("G2-SEARCH-DEMO", "Aislamiento demo en búsqueda", false, "Conforme", err.message);
  }

  // -------------------------------------------------------------
  // [GATE 5] DETALLES DE PRODUCTO (GET /api/muse/v1/products/{variantId})
  // -------------------------------------------------------------
  console.log(`\n${BOLD}[5] DETALLES TÉCNICOS POR VARIANTE (PERFIL, HECHOS, FUENTES Y 404)${RESET}`);

  const EXPECTED_SKUS = [
    { sku: "CN-DEMO-PLC-DIN-420-MR1", model: "CN-DIN-PLC-A1" },
    { sku: "CN-DEMO-PID-PT100-RS1", model: "CN-PID-T1" },
    { sku: "CN-DEMO-PT100-3W-A1", model: "CN-RTD-P1" },
  ];

  for (const exp of EXPECTED_SKUS) {
    const variantId = variantMapping[exp.sku];
    try {
      if (!variantId) {
        record(
          `G2-PROD-DETAILS-${exp.sku}`,
          `Obtener detalles técnicos para ${exp.sku}`,
          false,
          "variant_id presente en manifiesto",
          "No encontrado en manifiesto"
        );
        continue;
      }

      const resProd = await httpRequest(`${BACKEND_URL}/api/muse/v1/products/${variantId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const is200 = resProd.status === 200;
      const data = resProd.data;
      const validProfile = data?.profile && data.profile.variant_id === variantId && data.profile.demo === true;
      const validFacts = Array.isArray(data?.facts) && data.facts.length > 0;
      const validSources = Array.isArray(data?.sources) && data.sources.length > 0;

      // Check no price or stock
      const hasPrice =
        data?.price !== undefined ||
        data?.price_pen !== undefined ||
        data?.price_usd !== undefined ||
        data?.amount !== undefined ||
        data?.unit_price !== undefined ||
        data?.profile?.price !== undefined ||
        data?.profile?.price_pen !== undefined ||
        data?.profile?.price_usd !== undefined ||
        data?.stock !== undefined ||
        data?.profile?.stock !== undefined ||
        data?.profile?.available_quantity !== undefined;

      const fullCheck = is200 && validProfile && validFacts && validSources && !hasPrice;

      record(
        `G2-PROD-DETAILS-${exp.sku}`,
        `GET /products/${variantId} (${exp.sku}): perfil, hechos, fuentes versionadas y sin precio`,
        fullCheck,
        `HTTP 200, facts > 0, sources > 0, sin precio ni stock`,
        is200
          ? `Status 200, facts: ${data?.facts?.length}, sources: ${data?.sources?.length}, precio filtrado: ${!hasPrice}`
          : `HTTP ${resProd.status}`
      );
    } catch (err: any) {
      record(`G2-PROD-DETAILS-${exp.sku}`, `Consulta de ${exp.sku}`, false, "200 OK", err.message);
    }
  }

  // 5.2 Non-existent variant returns 404
  try {
    const resNotFound = await httpRequest(
      `${BACKEND_URL}/api/muse/v1/products/variant_inexistente_inventada_999999`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const is404 = resNotFound.status === 404;
    const hasStandardError =
      resNotFound.data?.error &&
      typeof resNotFound.data.error.code === "string" &&
      typeof resNotFound.data.error.message === "string" &&
      typeof resNotFound.data.request_id === "string";

    record(
      "G2-PROD-404-NONEXISTENT",
      "GET /products/{variantId} con variante inexistente retorna HTTP 404 NOT_FOUND estructurado",
      is404 && hasStandardError,
      "HTTP 404 con { error: { code, message }, request_id }",
      `HTTP ${resNotFound.status}: ${JSON.stringify(resNotFound.data)}`
    );
  } catch (err: any) {
    record("G2-PROD-404", "Prueba de variante 404", false, "404", err.message);
  }

  // 5.3 Non-demo variant returns 404 (Isolation test)
  try {
    const resNonDemo = await httpRequest(
      `${BACKEND_URL}/api/muse/v1/products/variant_non_demo_standard_catalog_404`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const isNonDemo404 = resNonDemo.status === 404;
    const hasNonDemoError =
      resNonDemo.data?.error &&
      typeof resNonDemo.data.error.code === "string" &&
      typeof resNonDemo.data.error.message === "string" &&
      typeof resNonDemo.data.request_id === "string";

    record(
      "G2-PROD-404-NONDEMO",
      "GET /products/{variantId} con variante fuera de demo retorna HTTP 404 NOT_FOUND estructurado",
      isNonDemo404 && hasNonDemoError,
      "HTTP 404 con { error: { code: 'NOT_FOUND', message }, request_id }",
      `HTTP ${resNonDemo.status}: ${JSON.stringify(resNonDemo.data)}`
    );
  } catch (err: any) {
    record("G2-PROD-404-NONDEMO", "Prueba de variante no-demo 404", false, "404", err.message);
  }

  // -------------------------------------------------------------
  // [GATE 6] EVALUADOR TÉCNICO POSITIVO (POST /api/muse/v1/evaluate)
  // -------------------------------------------------------------
  console.log(`\n${BOLD}[6] MOTOR DE EVALUACIÓN DETERMINISTA: PREDICADOS REQUERIDOS POSITIVOS (3 SKUS)${RESET}`);

  // 6.1 SKU 1: PLC DIN (overall_satisfied: true)
  const plcVariantId = variantMapping["CN-DEMO-PLC-DIN-420-MR1"];
  try {
    const resEvalPlc = await httpRequest(`${BACKEND_URL}/api/muse/v1/evaluate`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: {
        variant_id: plcVariantId,
        requirements: [
          { id: "req_plc_mounting", property: "mounting", operator: "equals", value: "din_35mm" },
          { id: "req_plc_voltage", property: "supply_voltage", operator: "equals", value: "24vdc" },
          {
            id: "req_plc_analog_in",
            property: "analog_input",
            operator: "range_contains",
            min: 4,
            max: 20,
            unit: "mA",
            channels_at_least: 2,
          },
          { id: "req_plc_protocol", property: "protocol", operator: "equals", value: "modbus_rtu" },
          { id: "req_plc_interface", property: "interface", operator: "equals", value: "rs485" },
        ],
      },
    });

    const is200 = resEvalPlc.status === 200;
    const overallSatisfied =
      resEvalPlc.data?.overall_satisfied === true || resEvalPlc.data?.overall_match === true;
    const evals = resEvalPlc.data?.evaluations || [];
    const allPassed = evals.length === 5 && evals.every((e: any) => e.satisfied === true);
    const hasCitations = evals.every((e: any) => e.source_evidence && e.source_evidence.url);
    const hasEnglishFacts = evals.some((e: any) =>
      e.fact_display_value &&
      (e.fact_display_value.includes("DIN Rail") ||
        e.fact_display_value.includes("Modbus RTU") ||
        e.fact_display_value.includes("24 VDC"))
    );

    record(
      "G2-EVAL-PLC-POSITIVE-CONJUNCTION",
      "POST /evaluate en SKU 1 (PLC DIN): Conjunción de 5 predicados requeridos con hechos en inglés -> overall_satisfied = true",
      is200 && overallSatisfied && allPassed && hasCitations && hasEnglishFacts,
      "overall_satisfied = true, 5/5 requisitos satisfied=true con citas y hechos en inglés",
      `HTTP ${resEvalPlc.status}, overall_satisfied: ${overallSatisfied}, evaluaciones: ${evals.length}/5 pasadas: ${allPassed}, hechos en inglés: ${hasEnglishFacts}`
    );
  } catch (err: any) {
    record("G2-EVAL-PLC-POS", "Evaluación positiva SKU 1 PLC", false, "overall_satisfied=true", err.message);
  }

  // 6.2 SKU 2: PID Controller (overall_satisfied: true)
  const pidVariantId = variantMapping["CN-DEMO-PID-PT100-RS1"];
  try {
    const resEvalPid = await httpRequest(`${BACKEND_URL}/api/muse/v1/evaluate`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: {
        variant_id: pidVariantId,
        requirements: [
          { id: "req_pid_mounting", property: "mounting", operator: "equals", value: "panel" },
          { id: "req_pid_sensor", property: "sensor_element", operator: "equals", value: "pt100" },
          { id: "req_pid_control", property: "control_function", operator: "equals", value: "pid" },
          {
            id: "req_pid_analog_out",
            property: "analog_output",
            operator: "range_contains",
            min: 4,
            max: 20,
            unit: "mA",
          },
          { id: "req_pid_protocol", property: "protocol", operator: "equals", value: "modbus_rtu" },
        ],
      },
    });

    const is200 = resEvalPid.status === 200;
    const overallSatisfied =
      resEvalPid.data?.overall_satisfied === true || resEvalPid.data?.overall_match === true;
    const evals = resEvalPid.data?.evaluations || [];
    const allPassed = evals.length === 5 && evals.every((e: any) => e.satisfied === true);
    const hasEnglishFacts = evals.some((e: any) =>
      e.fact_display_value &&
      (e.fact_display_value.includes("Panel") ||
        e.fact_display_value.includes("Pt100") ||
        e.fact_display_value.includes("PID"))
    );

    record(
      "G2-EVAL-PID-POSITIVE-CONJUNCTION",
      "POST /evaluate en SKU 2 (PID Panel): Conjunción de 5 predicados requeridos con hechos en inglés -> overall_satisfied = true",
      is200 && overallSatisfied && allPassed && hasEnglishFacts,
      "overall_satisfied = true, 5/5 requisitos satisfied=true con hechos en inglés",
      `HTTP ${resEvalPid.status}, overall_satisfied: ${overallSatisfied}, evaluaciones: ${evals.length}/5 pasadas: ${allPassed}, hechos en inglés: ${hasEnglishFacts}`
    );
  } catch (err: any) {
    record("G2-EVAL-PID-POS", "Evaluación positiva SKU 2 PID", false, "overall_satisfied=true", err.message);
  }

  // 6.3 SKU 3: Sensor PT100 (overall_satisfied: true)
  const pt100VariantId = variantMapping["CN-DEMO-PT100-3W-A1"];
  try {
    const resEvalPt100 = await httpRequest(`${BACKEND_URL}/api/muse/v1/evaluate`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: {
        variant_id: pt100VariantId,
        requirements: [
          { id: "req_pt100_sensor", property: "sensor_element", operator: "equals", value: "pt100" },
          { id: "req_pt100_mount", property: "mounting", operator: "equals", value: "thread" },
        ],
      },
    });

    const is200 = resEvalPt100.status === 200;
    const overallSatisfied =
      resEvalPt100.data?.overall_satisfied === true || resEvalPt100.data?.overall_match === true;
    const evals = resEvalPt100.data?.evaluations || [];
    const allPassed = evals.length === 2 && evals.every((e: any) => e.satisfied === true);
    const hasEnglishFacts = evals.some((e: any) =>
      e.fact_display_value &&
      (e.fact_display_value.includes("Pt100") ||
        e.fact_display_value.includes("probe") ||
        e.fact_display_value.includes("Threaded") ||
        e.fact_display_value.includes("3-Wire") ||
        e.fact_display_value.includes("3-wire"))
    );

    record(
      "G2-EVAL-PT100-POSITIVE-CONJUNCTION",
      "POST /evaluate en SKU 3 (Sonda PT100): Conjunción de predicados requeridos con hechos en inglés -> overall_satisfied = true",
      is200 && overallSatisfied && allPassed && hasEnglishFacts,
      "overall_satisfied = true, 2/2 requisitos satisfied=true con hechos en inglés",
      `HTTP ${resEvalPt100.status}, overall_satisfied: ${overallSatisfied}, evaluaciones: ${evals.length}/2 pasadas: ${allPassed}, hechos en inglés: ${hasEnglishFacts}`
    );
  } catch (err: any) {
    record("G2-EVAL-PT100-POS", "Evaluación positiva SKU 3 PT100", false, "overall_satisfied=true", err.message);
  }

  // -------------------------------------------------------------
  // [GATE 7] CONTRAEJEMPLOS EVALUADOS (overall_satisfied: false)
  // -------------------------------------------------------------
  console.log(`\n${BOLD}[7] EVALUACIÓN DE CONTRAEJEMPLOS Y RESTRICCIONES (overall_satisfied: false)${RESET}`);

  // Contraejemplo 1: PLC NO tiene Modbus TCP
  try {
    const resPlcTcp = await httpRequest(`${BACKEND_URL}/api/muse/v1/evaluate`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: {
        variant_id: plcVariantId,
        requirements: [
          { id: "req_contra_plc_tcp", property: "protocol", operator: "equals", value: "modbus_tcp" },
        ],
      },
    });

    const overallFalse =
      resPlcTcp.data?.overall_satisfied === false || resPlcTcp.data?.overall_match === false;
    const evalFalse = resPlcTcp.data?.evaluations?.[0]?.satisfied === false;

    record(
      "G2-CONTRA-PLC-MODBUS-TCP",
      "Contraejemplo 1: Requerir Modbus TCP en PLC DIN resulta en overall_satisfied = false",
      resPlcTcp.status === 200 && overallFalse && evalFalse,
      "overall_satisfied = false (PLC solo soporta Modbus RTU / RS-485)",
      `overall_satisfied: ${overallFalse}, requirement.satisfied: ${evalFalse}`
    );
  } catch (err: any) {
    record("G2-CONTRA-PLC-TCP", "Contraejemplo Modbus TCP en PLC", false, "false", err.message);
  }

  // Contraejemplo 2: PLC NO tiene Salida Analógica 4-20mA
  try {
    const resPlcAo = await httpRequest(`${BACKEND_URL}/api/muse/v1/evaluate`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: {
        variant_id: plcVariantId,
        requirements: [
          {
            id: "req_contra_plc_ao",
            property: "analog_output",
            operator: "range_contains",
            min: 4,
            max: 20,
            unit: "mA",
          },
        ],
      },
    });

    const overallFalse =
      resPlcAo.data?.overall_satisfied === false || resPlcAo.data?.overall_match === false;
    const evalFalse = resPlcAo.data?.evaluations?.[0]?.satisfied === false;

    record(
      "G2-CONTRA-PLC-ANALOG-OUTPUT",
      "Contraejemplo 2: Requerir Salida Analógica 4–20 mA en PLC resulta en overall_satisfied = false",
      resPlcAo.status === 200 && overallFalse && evalFalse,
      "overall_satisfied = false (PLC no posee salida analógica)",
      `overall_satisfied: ${overallFalse}, requirement.satisfied: ${evalFalse}`
    );
  } catch (err: any) {
    record("G2-CONTRA-PLC-AO", "Contraejemplo Salida 4-20mA en PLC", false, "false", err.message);
  }

  // Contraejemplo 3: PID NO tiene Montaje DIN (Montaje es Panel)
  try {
    const resPidDin = await httpRequest(`${BACKEND_URL}/api/muse/v1/evaluate`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: {
        variant_id: pidVariantId,
        requirements: [
          { id: "req_contra_pid_din", property: "mounting", operator: "equals", value: "din_35mm" },
        ],
      },
    });

    const overallFalse =
      resPidDin.data?.overall_satisfied === false || resPidDin.data?.overall_match === false;
    const evalFalse = resPidDin.data?.evaluations?.[0]?.satisfied === false;

    record(
      "G2-CONTRA-PID-DIN-MOUNT",
      "Contraejemplo 3: Requerir montaje Riel DIN en Controlador PID resulta en overall_satisfied = false",
      resPidDin.status === 200 && overallFalse && evalFalse,
      "overall_satisfied = false (PID es montaje en panel frontal, no DIN)",
      `overall_satisfied: ${overallFalse}, requirement.satisfied: ${evalFalse}`
    );
  } catch (err: any) {
    record("G2-CONTRA-PID-DIN", "Contraejemplo DIN en PID", false, "false", err.message);
  }

  // Contraejemplo 4: PID NO tiene Entrada Analógica 4-20mA (Entrada es Pt100)
  try {
    const resPidAi = await httpRequest(`${BACKEND_URL}/api/muse/v1/evaluate`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: {
        variant_id: pidVariantId,
        requirements: [
          {
            id: "req_contra_pid_ai",
            property: "analog_input",
            operator: "range_contains",
            min: 4,
            max: 20,
            unit: "mA",
          },
        ],
      },
    });

    const overallFalse =
      resPidAi.data?.overall_satisfied === false || resPidAi.data?.overall_match === false;
    const evalFalse = resPidAi.data?.evaluations?.[0]?.satisfied === false;

    record(
      "G2-CONTRA-PID-ANALOG-INPUT",
      "Contraejemplo 4: Requerir Entrada Analógica 4–20 mA en PID resulta en overall_satisfied = false",
      resPidAi.status === 200 && overallFalse && evalFalse,
      "overall_satisfied = false (Salida ≠ entrada; la entrada del PID es RTD Pt100, no 4-20mA)",
      `overall_satisfied: ${overallFalse}, requirement.satisfied: ${evalFalse}`
    );
  } catch (err: any) {
    record("G2-CONTRA-PID-AI", "Contraejemplo Entrada 4-20mA en PID", false, "false", err.message);
  }

  // Contraejemplo 5: PT100 NO tiene Protocolo Digital ni Salida Activa
  try {
    const resPt100Modbus = await httpRequest(`${BACKEND_URL}/api/muse/v1/evaluate`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: {
        variant_id: pt100VariantId,
        requirements: [
          { id: "req_contra_pt100_modbus", property: "protocol", operator: "equals", value: "modbus_rtu" },
        ],
      },
    });

    const overallFalseModbus =
      resPt100Modbus.data?.overall_satisfied === false || resPt100Modbus.data?.overall_match === false;
    const evalFalseModbus = resPt100Modbus.data?.evaluations?.[0]?.satisfied === false;

    record(
      "G2-CONTRA-PT100-PROTOCOL",
      "Contraejemplo 5a: Requerir Modbus RTU en Sonda PT100 resulta en overall_satisfied = false",
      resPt100Modbus.status === 200 && overallFalseModbus && evalFalseModbus,
      "overall_satisfied = false (PT100 es sensor pasivo resistivo sin electrónica ni protocolo)",
      `overall_satisfied: ${overallFalseModbus}, requirement.satisfied: ${evalFalseModbus}`
    );

    const resPt100Ao = await httpRequest(`${BACKEND_URL}/api/muse/v1/evaluate`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: {
        variant_id: pt100VariantId,
        requirements: [
          {
            id: "req_contra_pt100_ao",
            property: "analog_output",
            operator: "range_contains",
            min: 4,
            max: 20,
            unit: "mA",
          },
        ],
      },
    });

    const overallFalseAo =
      resPt100Ao.data?.overall_satisfied === false || resPt100Ao.data?.overall_match === false;

    record(
      "G2-CONTRA-PT100-ANALOG-OUTPUT",
      "Contraejemplo 5b: Requerir salida 4–20 mA en Sonda PT100 resulta en overall_satisfied = false",
      resPt100Ao.status === 200 && overallFalseAo,
      "overall_satisfied = false (Sonda pasiva sin transmisor de corriente 4-20mA)",
      `overall_satisfied: ${overallFalseAo}`
    );
  } catch (err: any) {
    record("G2-CONTRA-PT100", "Contraejemplos en Sonda PT100", false, "false", err.message);
  }

  // -------------------------------------------------------------
  // [GATE 8] RESPUESTAS DE ERROR UNIFORMES ({ error: { code, message }, request_id })
  // -------------------------------------------------------------
  console.log(`\n${BOLD}[8] FORMATO UNIFORME DE ERRORES ({ error: { code, message }, request_id })${RESET}`);

  const errorTestCases = [
    {
      name: "401 Unauthorized sin token",
      url: `${BACKEND_URL}/api/muse/v1/products/search`,
      options: {},
      expectedStatus: 401,
    },
    {
      name: "401 Unauthorized token inválido",
      url: `${BACKEND_URL}/api/muse/v1/products/search`,
      options: { headers: { Authorization: "Bearer bad_token_123" } },
      expectedStatus: 401,
    },
    {
      name: "400 Bad Request búsqueda q > 200",
      url: `${BACKEND_URL}/api/muse/v1/products/search?q=${"X".repeat(201)}`,
      options: { headers: { Authorization: `Bearer ${token}` } },
      expectedStatus: 400,
    },
    {
      name: "400 Bad Request búsqueda limit=99",
      url: `${BACKEND_URL}/api/muse/v1/products/search?limit=99`,
      options: { headers: { Authorization: `Bearer ${token}` } },
      expectedStatus: 400,
    },
    {
      name: "400 Bad Request evaluate requirements vacío",
      url: `${BACKEND_URL}/api/muse/v1/evaluate`,
      options: {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: { variant_id: plcVariantId, requirements: [] },
      },
      expectedStatus: 400,
    },
    {
      name: "400 Bad Request evaluate propiedad fuera de vocabulario cerrado",
      url: `${BACKEND_URL}/api/muse/v1/evaluate`,
      options: {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: {
          variant_id: plcVariantId,
          requirements: [
            { id: "r1", property: "invented_prop_wifi_speed", operator: "equals", value: "1Gbps" },
          ],
        },
      },
      expectedStatus: 400,
    },
    {
      name: "400 Bad Request evaluate operador no soportado",
      url: `${BACKEND_URL}/api/muse/v1/evaluate`,
      options: {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: {
          variant_id: plcVariantId,
          requirements: [
            { id: "r1", property: "mounting", operator: "quantum_entanglement", value: "din" },
          ],
        },
      },
      expectedStatus: 400,
    },
    {
      name: "404 Not Found evaluate variante inexistente",
      url: `${BACKEND_URL}/api/muse/v1/evaluate`,
      options: {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: {
          variant_id: "variant_completamente_falsa_9999",
          requirements: [
            { id: "r1", property: "mounting", operator: "equals", value: "din_35mm" },
          ],
        },
      },
      expectedStatus: 404,
    },
  ];

  for (const tc of errorTestCases) {
    try {
      const res = await httpRequest(tc.url, tc.options);
      const isStatusOk = res.status === tc.expectedStatus;
      const data = res.data;
      const hasErrorObj =
        data?.error &&
        typeof data.error.code === "string" &&
        data.error.code.length > 0 &&
        typeof data.error.message === "string" &&
        data.error.message.length > 0;
      const hasRequestId = typeof data?.request_id === "string" && data.request_id.length > 0;

      const passed = isStatusOk && hasErrorObj && hasRequestId;
      record(
        `G2-ERR-SCHEMA-${tc.expectedStatus}`,
        `Formato uniforme de error en caso: ${tc.name}`,
        passed,
        `Status ${tc.expectedStatus} con { error: { code, message }, request_id }`,
        `Status ${res.status}: code="${data?.error?.code}", message="${data?.error?.message?.slice(0, 50)}...", request_id="${data?.request_id}"`
      );
    } catch (err: any) {
      record(`G2-ERR-SCHEMA-${tc.expectedStatus}`, `Error en caso ${tc.name}`, false, "Conforme", err.message);
    }
  }

  // -------------------------------------------------------------
  // [GATE 9] MANIFIESTO ACTUALIZADO Y ACTIVO (IP ELÁSTICA 52.20.66.203)
  // -------------------------------------------------------------
  console.log(`\n${BOLD}[9] MANIFIESTO DEMO ACTUALIZADO Y ACTIVO CON IP ELÁSTICA 52.20.66.203${RESET}`);
  if (!manifest) {
    record("G2-MANIFEST-EXISTS", "hackday-demo-manifest.json existe y es legible", false, "Existe", "No existe");
  } else {
    const timestamp = manifest.generated_at || manifest.updated_at;
    record(
      "G2-MANIFEST-EXISTS",
      "hackday-demo-manifest.json existe, parsea limpiamente y contiene metadatos de sincronización",
      Boolean(timestamp && manifest.products),
      "Manifiesto válido con timestamp y products",
      `Generado: ${timestamp}, productos: ${Object.keys(manifest.products || {}).length}`
    );

    // Check no broken /static/demo paths and valid host (IP or data.controlnautas.com)
    const manifestStr = JSON.stringify(manifest);
    const hasStaticBroken = manifestStr.includes("/static/demo/");
    const usesValidHost = manifestStr.includes("52.20.66.203") || manifestStr.includes("data.controlnautas.com");

    record(
      "G2-MANIFEST-URL-SANITY",
      "Manifiesto libre de rutas rotas /static/demo/ y con host válido (52.20.66.203 o data.controlnautas.com)",
      !hasStaticBroken && usesValidHost,
      "Sin /static/demo/, con host válido",
      `/static/demo/: ${hasStaticBroken ? "DETECTADO (FALLA)" : "LIMPIO"}, Host válido: ${usesValidHost ? "PRESENTE" : "AUSENTE"}`
    );

    // Verify live assets respond 200 via local storefront port 8000
    for (const exp of EXPECTED_SKUS) {
      const p = manifest.products?.[exp.sku] || manifest[exp.sku];
      if (p) {
        // Datasheet PDF
        const rawPdfUrl = p.urls?.pdf_datasheet || p.datasheet_pdf_url || "";
        const pdfUrl = rawPdfUrl
          .replace("52.20.66.203:8000", "127.0.0.1:8000")
          .replace("https://data.controlnautas.com", "http://127.0.0.1:8000");
        try {
          const resPdf = await httpRequest(pdfUrl, { timeoutMs: 15000 });
          record(
            `G2-ASSET-PDF-${exp.sku}`,
            `Datasheet PDF demo responde 200 OK (${path.basename(rawPdfUrl)})`,
            resPdf.status === 200 && resPdf.rawBody.length > 500,
            "HTTP 200 OK con contenido binario PDF",
            `HTTP ${resPdf.status} (${resPdf.rawBody.length} bytes)`
          );
        } catch (err: any) {
          record(`G2-ASSET-PDF-${exp.sku}`, `Verificación de PDF ${exp.sku}`, false, "200 OK", err.message);
        }

        // Spec Markdown
        const rawSpecUrl = p.urls?.markdown_spec || p.spec_markdown_url || "";
        const specUrl = rawSpecUrl
          .replace("52.20.66.203:8000", "127.0.0.1:8000")
          .replace("https://data.controlnautas.com", "http://127.0.0.1:8000");
        try {
          const resSpec = await httpRequest(specUrl, { timeoutMs: 15000 });
          record(
            `G2-ASSET-SPEC-${exp.sku}`,
            `Spec Markdown demo responde 200 OK (${path.basename(rawSpecUrl)})`,
            resSpec.status === 200 && resSpec.rawBody.length > 100,
            "HTTP 200 OK con texto Markdown",
            `HTTP ${resSpec.status} (${resSpec.rawBody.length} bytes)`
          );
        } catch (err: any) {
          record(`G2-ASSET-SPEC-${exp.sku}`, `Verificación de Spec ${exp.sku}`, false, "200 OK", err.message);
        }

        // Storefront Human PDP
        const rawPdpUrl = p.urls?.pdp_human || p.storefront_url || "";
        const pdpUrl = rawPdpUrl
          .replace("52.20.66.203:8000", "127.0.0.1:8000")
          .replace("https://data.controlnautas.com", "http://127.0.0.1:8000");
        const productHandle = p.handle || p.product_handle || "";
        try {
          const resPdp = await httpRequest(pdpUrl, { timeoutMs: 20000 });
          const hasUsPrefix = rawPdpUrl.includes("/us/products/");
          record(
            `G2-ASSET-PDP-${exp.sku}`,
            `Página humana Storefront responde 200 OK y usa ruta /us/products/ (${productHandle})`,
            resPdp.status === 200 && hasUsPrefix,
            "HTTP 200 OK con ruta /us/products/",
            `HTTP ${resPdp.status}, ruta US: ${hasUsPrefix ? "Presente" : "Ausente"}`
          );
        } catch (err: any) {
          record(`G2-ASSET-PDP-${exp.sku}`, `Verificación de PDP ${exp.sku}`, false, "200 OK", err.message);
        }
      }
    }
  }

  // -------------------------------------------------------------
  // [GATE 10] RESUMEN Y CÓDIGO DE SALIDA
  // -------------------------------------------------------------
  console.log(`\n${BOLD}${CYAN}================================================================${RESET}`);
  console.log(`${BOLD}${CYAN}  RESUMEN DE AUDITORÍA Y CONTROL DE CALIDAD (PUERTA 2)          ${RESET}`);
  console.log(`${BOLD}${CYAN}================================================================${RESET}`);

  const total = results.length;
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;
  const passRate = total > 0 ? ((passed / total) * 100).toFixed(1) : "0";

  console.log(`  Total de pruebas ejecutadas : ${BOLD}${total}${RESET}`);
  console.log(`  Pruebas superadas (${GREEN}PASS${RESET})   : ${GREEN}${BOLD}${passed}${RESET}`);
  console.log(`  Pruebas fallidas  (${RED}FAIL${RESET})   : ${failed > 0 ? `${RED}${BOLD}${failed}${RESET}` : `${GREEN}0${RESET}`}`);
  console.log(`  Tasa de conformidad         : ${failed === 0 ? GREEN : RED}${passRate}%${RESET}`);

  if (failed === 0) {
    console.log(`\n${BOLD}${GREEN}✔ TODAS LAS PRUEBAS DE LA PUERTA 2 FUERON SUPERADAS EXITOSAMENTE (100% PASS).${RESET}`);
    console.log(`${GREEN}El contrato HTTP técnico de Agent-Commerce (/api/muse/v1) se encuentra 100% verificado y conforme para la auditoría de Cursor.${RESET}\n`);
    process.exit(0);
  } else {
    console.log(`\n${BOLD}${RED}✘ SE ENCONTRARON ${failed} PRUEBAS NO CONFORMES.${RESET}`);
    console.log(`${RED}Por favor corrija las no conformidades indicadas antes de someter a Cursor.${RESET}\n`);
    process.exit(1);
  }
}

runSuite().catch((err) => {
  console.error("Error fatal durante la ejecución de la suite Puerta 2:", err);
  process.exit(1);
});
