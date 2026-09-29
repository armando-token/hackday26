/**
 * Automated Verification & Audit Suite for Phase 4 & Phase 5 (Puerta 4/5)
 * Controlnautas × Meta Muse (Hack Day 2026)
 *
 * Comprehensive End-to-End Verification across 13 Gate 4/5 Requirements:
 *  1. TLS certificate validity, issuer (Let's Encrypt), expiration, TLS 1.3 on 'data.controlnautas.com'.
 *  2. HTTP -> HTTPS redirect (301/308).
 *  3. www.data.controlnautas.com -> https://data.controlnautas.com redirect.
 *  4. Public admin blocking (/admin -> 403).
 *  5. /healthz public status over HTTPS.
 *  6. /products/search, /products/{variantId}, /evaluate over HTTPS.
 *  7. /products/{variantId}/offer (quantities 1, 2, 0, 21) over HTTPS.
 *  8. /preliminary-quotes creation and PDF URL on https://data.controlnautas.com.
 *  9. /quotes/{id}/pdf download over HTTPS without Bearer token.
 * 10. Idempotency (replay and 409 conflict) over HTTPS.
 * 11. Price tampering immunity over HTTPS.
 * 12. Storefront PDPs and demo assets over HTTPS.
 * 13. Regression checks: verify-phase1, verify-phase2, verify-phase3.
 */

import fs from "fs";
import path from "path";
import tls from "tls";
import http from "http";
import https from "https";
import crypto from "crypto";
import { execSync, spawnSync } from "child_process";

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
  criterion: number;
  name: string;
  passed: boolean;
  expected: string;
  actual: string;
  details?: any;
}

const results: TestResult[] = [];

function record(
  gate: string,
  criterion: number,
  name: string,
  passed: boolean,
  expected: string,
  actual: string,
  details?: any
) {
  results.push({ gate, criterion, name, passed, expected, actual, details });
  const status = passed ? `${GREEN}✔ PASS${RESET}` : `${RED}✘ FAIL${RESET}`;
  console.log(`  [${status}] [G4-C${criterion}][${gate}] ${BOLD}${name}${RESET}`);
  if (!passed) {
    console.log(`         ${YELLOW}Expected:${RESET} ${expected}`);
    console.log(`         ${RED}Actual:${RESET}   ${actual}`);
  }
}

// HTTP / HTTPS Response Interface
interface HttpResponse<T = any> {
  status: number;
  headers: Record<string, string>;
  rawBody: string;
  buffer: Buffer;
  data: T | null;
  durationMs: number;
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
    const startTime = Date.now();
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
      timeout: options.timeoutMs || 15000,
    };

    const req = transport.request(reqOptions, (res) => {
      const chunks: Buffer[] = [];
      res.on("data", (chunk) => chunks.push(chunk));
      res.on("end", () => {
        const buffer = Buffer.concat(chunks);
        const rawBody = buffer.toString("utf8");
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
          buffer,
          data,
          durationMs: Date.now() - startTime,
        });
      });
    });

    req.on("error", (err) => reject(err));
    req.on("timeout", () => {
      req.destroy();
      reject(new Error(`HTTP request timeout after ${options.timeoutMs || 15000}ms`));
    });

    if (payload) {
      req.write(payload);
    }
    req.end();
  });
}

// TLS Certificate Inspection Helper
interface TlsInspectionResult {
  authorized: boolean;
  protocol: string;
  cipherName: string;
  subjectCn: string;
  issuerOrg: string;
  issuerCn: string;
  validFrom: string;
  validTo: string;
  daysRemaining: number;
}

function inspectTlsCertificate(hostname: string, port = 443): Promise<TlsInspectionResult> {
  return new Promise((resolve, reject) => {
    const socket = tls.connect(
      {
        host: hostname,
        port,
        servername: hostname,
        minVersion: "TLSv1.3",
        maxVersion: "TLSv1.3",
        timeout: 10000,
      },
      () => {
        try {
          const authorized = socket.authorized;
          const protocol = socket.getProtocol() || "";
          const cipher = socket.getCipher();
          const cert = socket.getPeerCertificate(true);

          const validFrom = cert.valid_from || "";
          const validTo = cert.valid_to || "";
          const validToMs = Date.parse(validTo);
          const daysRemaining = Math.floor((validToMs - Date.now()) / (1000 * 60 * 60 * 24));

          socket.end();

          resolve({
            authorized,
            protocol,
            cipherName: cipher?.name || "",
            subjectCn: (cert.subject as any)?.CN || "",
            issuerOrg: (cert.issuer as any)?.O || "",
            issuerCn: (cert.issuer as any)?.CN || "",
            validFrom,
            validTo,
            daysRemaining,
          });
        } catch (err) {
          socket.destroy();
          reject(err);
        }
      }
    );

    socket.on("error", (err) => reject(err));
    socket.on("timeout", () => {
      socket.destroy();
      reject(new Error(`TLS connection timeout after 10000ms connecting to ${hostname}:${port}`));
    });
  });
}

// PostgreSQL Query Helper
function psqlQuery<T = any>(sql: string): T[] {
  try {
    const wrapped = `SELECT json_agg(t) FROM (${sql.trim().replace(/;+$/, "")}) t;`;
    const stdout = execSync(
      `PGPASSWORD=password psql -U postgres -h localhost -d medusa -t -A`,
      { input: wrapped, encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] }
    );
    const trimmed = stdout.trim();
    if (!trimmed || trimmed === "") return [];
    return JSON.parse(trimmed) || [];
  } catch {
    return [];
  }
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

function maskToken(token: string): string {
  if (!token || token.length <= 8) return "****";
  return `${token.slice(0, 4)}...${token.slice(-4)}`;
}

// Dynamic Variant ID Resolver (DB live authoritative truth + manifest fallback)
function getDemoVariantMap(manifestPath: string): Record<string, string> {
  const map: Record<string, string> = {};

  // 1. Query Medusa PostgreSQL directly as authoritative live truth
  try {
    const rows = psqlQuery<{ sku: string; variant_id: string }>(`
      SELECT pv.sku, pv.id as variant_id
      FROM product_variant pv
      INNER JOIN technical_profile tp ON tp.variant_id = pv.id
      WHERE tp.demo = true AND pv.sku LIKE 'CN-%' AND sku NOT LIKE 'CN-DEMO-TEST-%' AND sku NOT LIKE 'CN-DEMO-INVENTED-%' AND pv.deleted_at IS NULL;
    `);
    for (const r of rows) {
      if (r.sku && r.variant_id) {
        map[r.sku] = r.variant_id;
      }
    }
  } catch {}

  // 2. Fallback to manifest if DB query returned empty
  if (!map["CN-X5PRIME-HE-XP5"]) {
    try {
      if (fs.existsSync(manifestPath)) {
        const data = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
        if (data.products) {
          for (const [sku, p] of Object.entries<any>(data.products)) {
            if (p?.variant_id) {
              map[sku] = p.variant_id;
            }
          }
        }
      }
    } catch {}
  }

  return map;
}

// Helper to decode text content from ReportLab PDF (decompresses flate / ASCII85 streams)
function extractPdfText(pdfRawOrPath: string | Buffer): string {
  let tmpPath = "";
  let cleanup = false;
  if (Buffer.isBuffer(pdfRawOrPath) || (typeof pdfRawOrPath === "string" && !fs.existsSync(pdfRawOrPath))) {
    tmpPath = path.join("/tmp", `p4_pdf_${Date.now()}_${crypto.randomBytes(4).toString("hex")}.pdf`);
    fs.writeFileSync(tmpPath, pdfRawOrPath);
    cleanup = true;
  } else {
    tmpPath = pdfRawOrPath as string;
  }
  try {
    const pyCode = [
      "import sys, base64, zlib, re",
      "with open(sys.argv[1], \"rb\") as f: data = f.read()",
      "idx = 0",
      "all_text = []",
      "while True:",
      "    pos = data.find(b\"stream\", idx)",
      "    if pos == -1: break",
      "    start = pos + 6",
      "    if data[start:start+1] == b\"\\r\": start += 1",
      "    if data[start:start+1] == b\"\\n\": start += 1",
      "    endpos = data.find(b\"endstream\", start)",
      "    if endpos == -1: break",
      "    raw = data[start:endpos].strip()",
      "    try:",
      "        a85 = base64.a85decode(raw, adobe=True)",
      "        all_text.append(zlib.decompress(a85).decode(\"latin1\", errors=\"ignore\"))",
      "    except Exception:",
      "        try:",
      "            all_text.append(zlib.decompress(raw).decode(\"latin1\", errors=\"ignore\"))",
      "        except Exception: pass",
      "    idx = endpos + 9",
      "full = \"\\n\".join(all_text)",
      "extracted = []",
      "for m in re.finditer(r\"\\((.*?)\\)\\s*Tj\", full):",
      "    s = m.group(1)",
      "    s = re.sub(r\"\\\\([0-7]{3})\", lambda match: chr(int(match.group(1), 8)), s)",
      "    s = s.replace(\"\\\\(\", \"(\").replace(\"\\\\)\", \")\").replace(\"\\\\\\\\\", \"\\\\\")",
      "    s = s.replace(\"\\x97\", \"—\").replace(\"\\x96\", \"–\")",
      "    extracted.append(s)",
      "print(\" \".join(extracted))"
    ].join("\n");
    const res = spawnSync("python3", ["-c", pyCode, tmpPath], { encoding: "utf8" });
    return res.stdout || "";
  } catch {
    return "";
  } finally {
    if (cleanup && fs.existsSync(tmpPath)) {
      try { fs.unlinkSync(tmpPath); } catch {}
    }
  }
}

// Main Verification Suite Execution
async function runSuite() {
  const args = process.argv.slice(2);
  const skipRegression = args.includes("--skip-regression");
  const onlyRegression = args.includes("--only-regression");

  console.log(`${BOLD}${CYAN}==============================================================================${RESET}`);
  console.log(`${BOLD}${CYAN}  CONTROLNAUTAS × META MUSE — AUDITORÍA AUTOMATIZADA DE FASE 4+5 (PUERTA 4/5) ${RESET}`);
  console.log(`${BOLD}${CYAN}  Dominio de Producción, TLS 1.3, Redirecciones, Seguridad HTTPS y Regresión   ${RESET}`);
  console.log(`${BOLD}${CYAN}==============================================================================${RESET}\n`);

  const ROOT_DIR = path.resolve(__dirname, "..");
  const BASE_DOMAIN = "data.controlnautas.com";
  const HTTPS_BASE_URL = `https://${BASE_DOMAIN}`;
  const MANIFEST_PATH = path.join(ROOT_DIR, "hackday-demo-manifest.json");

  const token = loadMuseToken(ROOT_DIR);
  console.log(`  ${BOLD}Target HTTPS Base:${RESET}     ${HTTPS_BASE_URL}`);
  console.log(`  ${BOLD}Token Configurado:${RESET}     ${maskToken(token)} (longitud: ${token.length})`);
  console.log(`  ${BOLD}Manifiesto Path:${RESET}       ${MANIFEST_PATH}`);

  let variantMap = getDemoVariantMap(MANIFEST_PATH);
  let plcVariantId = variantMap["CN-X5PRIME-HE-XP5"] || "";
  let pidVariantId = variantMap["CN-N1200"] || "";
  let pt100VariantId = variantMap["CN-THT02"] || "";

  console.log(`  ${BOLD}PLC Variant ID:${RESET}        ${plcVariantId}`);
  console.log(`  ${BOLD}PID Variant ID:${RESET}        ${pidVariantId}`);
  console.log(`  ${BOLD}PT100 Variant ID:${RESET}      ${pt100VariantId}\n`);

  if (!plcVariantId || !token) {
    console.error(`${RED}Error fatal: No se detectaron variantes demo o token MUSE_API_TOKEN.${RESET}`);
    process.exit(1);
  }

  const authHeaders = {
    Authorization: `Bearer ${token}`,
  };

  if (!onlyRegression) {
    // ============================================================================
    // CRITERION 1: Verify TLS certificate validity, issuer (Let's Encrypt), expiration, TLS 1.3
    // ============================================================================
    console.log(`\n${BOLD}[CRITERIO 1] VALIDEZ DE CERTIFICADO TLS, EMISOR (LET'S ENCRYPT), EXPIRACIÓN Y TLS 1.3${RESET}`);
    try {
      const tlsInfo = await inspectTlsCertificate(BASE_DOMAIN, 443);

      record(
        "TLS-1.3-NEGOTIATION",
        1,
        "Negociación estricta de protocolo TLS 1.3 sobre data.controlnautas.com",
        tlsInfo.protocol === "TLSv1.3",
        "TLSv1.3",
        tlsInfo.protocol
      );

      record(
        "TLS-CERT-AUTHORIZED",
        1,
        "Cadena de confianza del certificado TLS es válida y autorizada (sin errores CA)",
        tlsInfo.authorized === true,
        "authorized: true",
        `authorized: ${tlsInfo.authorized}`
      );

      const isLetsEncrypt =
        tlsInfo.issuerOrg.toLowerCase().includes("let's encrypt") ||
        tlsInfo.issuerCn.toLowerCase().includes("let's encrypt") ||
        ["ye1", "e5", "e6", "r3", "r10", "r11"].includes(tlsInfo.issuerCn.toLowerCase());
      record(
        "TLS-ISSUER-LETSENCRYPT",
        1,
        "Emisor de la Autoridad Certificadora (CA) es Let's Encrypt",
        isLetsEncrypt,
        "Let's Encrypt",
        `${tlsInfo.issuerOrg} (${tlsInfo.issuerCn})`
      );

      record(
        "TLS-SUBJECT-DOMAIN",
        1,
        "Subject CN del certificado coincide exactamente con data.controlnautas.com",
        tlsInfo.subjectCn === BASE_DOMAIN,
        BASE_DOMAIN,
        tlsInfo.subjectCn
      );

      record(
        "TLS-EXPIRATION-VALID",
        1,
        "Certificado TLS vigente (no expirado y con más de 14 días de validez restante)",
        tlsInfo.daysRemaining > 14,
        "> 14 días restantes",
        `${tlsInfo.daysRemaining} días restantes (válido hasta: ${tlsInfo.validTo})`
      );

      record(
        "TLS-CIPHER-SUITE",
        1,
        "Suite de cifrado TLS 1.3 moderna y robusta en uso",
        Boolean(tlsInfo.cipherName && tlsInfo.cipherName.includes("GCM")),
        "Cifrado GCM moderno (ej. TLS_AES_128_GCM_SHA256)",
        tlsInfo.cipherName
      );
    } catch (err: any) {
      record("TLS-CERT-CRITICAL", 1, "Inspección de certificado TLS", false, "Sin error", err.message);
    }

    // ============================================================================
    // CRITERION 2: Verify HTTP -> HTTPS redirect (301/308)
    // ============================================================================
    console.log(`\n${BOLD}[CRITERIO 2] REDIRECCIÓN OBLIGATORIA HTTP -> HTTPS (301/308)${RESET}`);
    try {
      const httpRes = await httpRequest(`http://${BASE_DOMAIN}/healthz`, {
        method: "GET",
      });

      const isRedirectStatus = httpRes.status === 301 || httpRes.status === 308;
      record(
        "HTTP-REDIRECT-STATUS",
        2,
        "Petición HTTP insegura a puerto 80 responde con código de redirección permanente (301 o 308)",
        isRedirectStatus,
        "HTTP 301 o 308",
        `HTTP ${httpRes.status}`
      );

      const locationHeader = httpRes.headers["location"] || "";
      const isHttpsRedirect = locationHeader.startsWith(`https://${BASE_DOMAIN}`);
      record(
        "HTTP-REDIRECT-LOCATION",
        2,
        "Cabecera Location redirige canónicamente hacia esquema https://data.controlnautas.com",
        isHttpsRedirect,
        `https://${BASE_DOMAIN}/healthz`,
        locationHeader || "Cabecera ausente"
      );

      // Verify root redirect
      const httpRootRes = await httpRequest(`http://${BASE_DOMAIN}/`, { method: "GET" });
      const rootRedirectOk =
        (httpRootRes.status === 301 || httpRootRes.status === 308) &&
        (httpRootRes.headers["location"] || "").startsWith(`https://${BASE_DOMAIN}`);
      record(
        "HTTP-ROOT-REDIRECT",
        2,
        "Redirección raíz http://data.controlnautas.com/ hacia HTTPS conforme",
        rootRedirectOk,
        `HTTP 301/308 a https://${BASE_DOMAIN}/`,
        `HTTP ${httpRootRes.status} -> ${httpRootRes.headers["location"] || "ausente"}`
      );
    } catch (err: any) {
      record("HTTP-REDIRECT-CRITICAL", 2, "Verificación de redirección HTTP a HTTPS", false, "Sin error", err.message);
    }

    // ============================================================================
    // CRITERION 3: Verify www.data.controlnautas.com -> https://data.controlnautas.com redirect
    // ============================================================================
    console.log(`\n${BOLD}[CRITERIO 3] REDIRECCIÓN www.data.controlnautas.com -> https://data.controlnautas.com${RESET}`);
    try {
      const wwwHttpsRes = await httpRequest(`https://www.data.controlnautas.com/`, {
        method: "GET",
      });

      const isWwwRedirect = wwwHttpsRes.status === 301 || wwwHttpsRes.status === 308;
      const wwwLocation = wwwHttpsRes.headers["location"] || "";
      const targetsApex = wwwLocation.startsWith(`https://${BASE_DOMAIN}`);

      record(
        "WWW-HTTPS-REDIRECT-STATUS",
        3,
        "Acceso HTTPS a www.data.controlnautas.com responde con redirección permanente (301)",
        isWwwRedirect,
        "HTTP 301 o 308",
        `HTTP ${wwwHttpsRes.status}`
      );

      record(
        "WWW-HTTPS-REDIRECT-LOCATION",
        3,
        "Cabecera Location de www redirige a la URL canónica https://data.controlnautas.com/",
        targetsApex,
        `https://${BASE_DOMAIN}/`,
        wwwLocation || "Cabecera ausente"
      );

      // Plain HTTP www redirect
      const wwwHttpRes = await httpRequest(`http://www.data.controlnautas.com/`, {
        method: "GET",
      });
      const wwwHttpRedirectOk =
        (wwwHttpRes.status === 301 || wwwHttpRes.status === 308) &&
        (wwwHttpRes.headers["location"] || "").includes("data.controlnautas.com");
      record(
        "WWW-HTTP-REDIRECT",
        3,
        "Acceso HTTP puerto 80 a www.data.controlnautas.com redirige hacia HTTPS",
        wwwHttpRedirectOk,
        "HTTP 301/308 hacia HTTPS",
        `HTTP ${wwwHttpRes.status} -> ${wwwHttpRes.headers["location"] || "ausente"}`
      );
    } catch (err: any) {
      record("WWW-REDIRECT-CRITICAL", 3, "Verificación de redirección de subdominio www", false, "Sin error", err.message);
    }

    // ============================================================================
    // CRITERION 4: Verify public admin blocking (/admin -> 403)
    // ============================================================================
    console.log(`\n${BOLD}[CRITERIO 4] BLOQUEO DE ACCESO PÚBLICO AL PANEL ADMIN (/admin -> 403)${RESET}`);
    try {
      const adminRes = await httpRequest(`${HTTPS_BASE_URL}/admin`, { method: "GET" });
      record(
        "ADMIN-PUBLIC-BLOCK-403",
        4,
        "GET /admin responde HTTP 403 Forbidden en el gateway público",
        adminRes.status === 403,
        "HTTP 403 Forbidden",
        `HTTP ${adminRes.status}`
      );

      const appRes = await httpRequest(`${HTTPS_BASE_URL}/app`, { method: "GET" });
      record(
        "APP-PUBLIC-BLOCK-403",
        4,
        "GET /app responde HTTP 403 Forbidden en el gateway público",
        appRes.status === 403,
        "HTTP 403 Forbidden",
        `HTTP ${appRes.status}`
      );

      const hasForbiddenNotice =
        adminRes.rawBody.toLowerCase().includes("forbidden") ||
        adminRes.rawBody.toLowerCase().includes("disabled");
      record(
        "ADMIN-BLOCK-EXPLANATION",
        4,
        "Cuerpo de respuesta 403 notifica que el panel administrativo está deshabilitado",
        hasForbiddenNotice,
        "Mensaje explícito de panel deshabilitado",
        adminRes.rawBody.trim() || "Cuerpo vacío"
      );
    } catch (err: any) {
      record("ADMIN-BLOCK-CRITICAL", 4, "Verificación de bloqueo perimetral de administración", false, "Sin error", err.message);
    }

    // ============================================================================
    // CRITERION 5: Verify /healthz public status over HTTPS
    // ============================================================================
    console.log(`\n${BOLD}[CRITERIO 5] ESTADO PÚBLICO Y DIAGNÓSTICO /healthz SOBRE HTTPS${RESET}`);
    try {
      const healthzRes = await httpRequest(`${HTTPS_BASE_URL}/healthz`, {
        method: "GET",
        // NO Authorization header (public endpoint)
      });

      record(
        "HEALTHZ-HTTPS-STATUS-200",
        5,
        "GET /healthz sobre HTTPS responde HTTP 200 OK públicamente sin token",
        healthzRes.status === 200,
        "HTTP 200",
        `HTTP ${healthzRes.status}`
      );

      const isJson = (healthzRes.headers["content-type"] || "").includes("application/json");
      record(
        "HEALTHZ-HTTPS-CONTENT-TYPE",
        5,
        "Cabecera Content-Type de /healthz es application/json",
        isJson,
        "application/json",
        healthzRes.headers["content-type"] || "ausente"
      );

      const payloadOk =
        healthzRes.data?.status === "ok" &&
        Boolean(healthzRes.data?.version) &&
        Boolean(healthzRes.data?.commit);
      record(
        "HEALTHZ-HTTPS-PAYLOAD-SCHEMA",
        5,
        "Payload de /healthz respeta el contrato estándar { status: 'ok', version, commit }",
        payloadOk,
        "{ status: 'ok', version: string, commit: string }",
        JSON.stringify(healthzRes.data)
      );

      const leaksSecrets =
        healthzRes.rawBody.includes(token) ||
        healthzRes.rawBody.toLowerCase().includes("postgres") ||
        healthzRes.rawBody.toLowerCase().includes("password");
      record(
        "HEALTHZ-HTTPS-NO-SECRETS",
        5,
        "PROHIBICIÓN ESTRICTA: /healthz no filtra secretos, cadenas de conexión ni tokens",
        !leaksSecrets,
        "Sin secretos en respuesta",
        leaksSecrets ? "Fuga de secretos detectada" : "Completamente limpio"
      );
    } catch (err: any) {
      record("HEALTHZ-HTTPS-CRITICAL", 5, "Verificación de /healthz sobre HTTPS", false, "Sin error", err.message);
    }

    // ============================================================================
    // CRITERION 6: Verify /products/search, /products/{variantId}, /evaluate over HTTPS
    // ============================================================================
    console.log(`\n${BOLD}[CRITERIO 6] CONTRATO TÉCNICO AGENT-COMMERCE SOBRE HTTPS (SEARCH, GET, EVALUATE)${RESET}`);
    try {
      // 1. Search over HTTPS
      const searchRes = await httpRequest(`${HTTPS_BASE_URL}/api/muse/v1/products/search?q=PLC`, {
        headers: authHeaders,
      });

      const searchOk =
        searchRes.status === 200 &&
        Array.isArray(searchRes.data?.products) &&
        searchRes.data.products.length > 0;
      record(
        "SEARCH-HTTPS-STATUS-200",
        6,
        "GET /api/muse/v1/products/search?q=PLC sobre HTTPS responde HTTP 200 con resultados",
        searchOk,
        "HTTP 200 con products > 0",
        `HTTP ${searchRes.status}, count=${searchRes.data?.products?.length}`
      );

      record(
        "SEARCH-HTTPS-SECURITY-HEADERS",
        6,
        "GET /products/search propaga headers Cache-Control: no-store y X-Request-Id",
        searchRes.headers["cache-control"] === "no-store" && Boolean(searchRes.headers["x-request-id"]),
        "Cache-Control: no-store y X-Request-Id presente",
        `Cache-Control: ${searchRes.headers["cache-control"]}, X-Request-Id: ${searchRes.headers["x-request-id"]}`
      );

      // 2. Product Details over HTTPS
      const productRes = await httpRequest(`${HTTPS_BASE_URL}/api/muse/v1/products/${plcVariantId}`, {
        headers: authHeaders,
      });

      const productOk =
        productRes.status === 200 &&
        Boolean(productRes.data?.profile?.model) &&
        Array.isArray(productRes.data?.facts) &&
        productRes.data.facts.length >= 7 &&
        Array.isArray(productRes.data?.sources) &&
        productRes.data.sources.length >= 1;
      record(
        "PRODUCT-HTTPS-DETAILS",
        6,
        "GET /api/muse/v1/products/{id} sobre HTTPS devuelve perfil técnico, >= 7 hechos y fuentes citables",
        productOk,
        "HTTP 200, profile presente, facts >= 7, sources >= 1",
        `HTTP ${productRes.status}, model=${productRes.data?.profile?.model}, facts=${productRes.data?.facts?.length}, sources=${productRes.data?.sources?.length}`
      );

      // 3. Positive Evaluation over HTTPS
      const evalPosRes = await httpRequest(`${HTTPS_BASE_URL}/api/muse/v1/evaluate`, {
        method: "POST",
        headers: authHeaders,
        body: {
          variant_id: plcVariantId,
          requirements: [
            { id: "req_mounting", property: "mounting", operator: "equals", value: "din_35mm" },
            { id: "req_protocol", property: "protocol", operator: "equals", value: "modbus_rtu" },
            { id: "req_voltage", property: "supply_voltage", operator: "equals", value: "24vdc" },
          ],
        },
      });

      const evalPosOk =
        evalPosRes.status === 200 &&
        evalPosRes.data?.overall_satisfied === true &&
        Array.isArray(evalPosRes.data?.evaluations) &&
        evalPosRes.data.evaluations.every((e: any) => e.satisfied === true && (e.source_evidence || e.citation));
      record(
        "EVALUATE-HTTPS-POSITIVE",
        6,
        "POST /api/muse/v1/evaluate sobre HTTPS evalúa requerimientos y responde overall_satisfied: true con citas",
        evalPosOk,
        "HTTP 200, overall_satisfied=true con citas formales",
        `HTTP ${evalPosRes.status}, overall_satisfied=${evalPosRes.data?.overall_satisfied}`
      );

      // 4. Contraexample / Negative Evaluation over HTTPS
      const evalContraRes = await httpRequest(`${HTTPS_BASE_URL}/api/muse/v1/evaluate`, {
        method: "POST",
        headers: authHeaders,
        body: {
          variant_id: plcVariantId,
          requirements: [
            { id: "req_bad_proto", property: "protocol", operator: "equals", value: "modbus_tcp" },
          ],
        },
      });

      const evalContraOk =
        evalContraRes.status === 200 && evalContraRes.data?.overall_satisfied === false;
      record(
        "EVALUATE-HTTPS-CONTRAEXAMPLE",
        6,
        "POST /api/muse/v1/evaluate sobre HTTPS rechaza requerimiento no soportado (Modbus TCP en PLC -> false)",
        evalContraOk,
        "HTTP 200, overall_satisfied=false",
        `HTTP ${evalContraRes.status}, overall_satisfied=${evalContraRes.data?.overall_satisfied}`
      );
    } catch (err: any) {
      record("AGENT-COMMERCE-HTTPS-CRITICAL", 6, "Verificación de contrato Agent-Commerce sobre HTTPS", false, "Sin error", err.message);
    }

    // ============================================================================
    // CRITERION 7: Verify /products/{variantId}/offer (quantities 1, 2, 0, 21) over HTTPS
    // ============================================================================
    console.log(`\n${BOLD}[CRITERIO 7] OFERTA COMERCIAL VIVA SOBRE HTTPS (/offer CON CANTIDADES 1, 2, 0, 21)${RESET}`);
    try {
      // 1. Quantity = 1
      const offerQ1Res = await httpRequest(
        `${HTTPS_BASE_URL}/api/muse/v1/products/${plcVariantId}/offer?quantity=1`,
        { headers: authHeaders }
      );

      const q1Ok =
        offerQ1Res.status === 200 &&
        offerQ1Res.data?.state === "priced" &&
        offerQ1Res.data?.unit_price === 890 &&
        offerQ1Res.data?.unit_price_minor === 89000 &&
        offerQ1Res.data?.subtotal === 890 &&
        offerQ1Res.data?.subtotal_minor === 89000 &&
        offerQ1Res.data?.currency?.toLowerCase() === "usd" &&
        offerQ1Res.data?.availability?.status === "in_stock" &&
        offerQ1Res.data?.availability?.stocked_quantity === 3;
      record(
        "OFFER-HTTPS-QTY-1",
        7,
        "GET /products/{id}/offer?quantity=1 sobre HTTPS refleja precio Medusa 890 USD y stock 3",
        q1Ok,
        "HTTP 200, state='priced', unit_price=890, subtotal=890, stock=3",
        `HTTP ${offerQ1Res.status}, state=${offerQ1Res.data?.state}, price=${offerQ1Res.data?.unit_price}, subtotal=${offerQ1Res.data?.subtotal}, stock=${offerQ1Res.data?.availability?.stocked_quantity}`
      );

      // 2. Quantity = 2 (2x multiplier)
      const offerQ2Res = await httpRequest(
        `${HTTPS_BASE_URL}/api/muse/v1/products/${plcVariantId}/offer?quantity=2`,
        { headers: authHeaders }
      );

      const q2Ok =
        offerQ2Res.status === 200 &&
        offerQ2Res.data?.unit_price === 890 &&
        offerQ2Res.data?.unit_price_minor === 89000 &&
        offerQ2Res.data?.subtotal === 1780 &&
        offerQ2Res.data?.subtotal_minor === 178000 &&
        offerQ2Res.data?.currency?.toLowerCase() === "usd" &&
        offerQ2Res.data?.scale === 2;
      record(
        "OFFER-HTTPS-QTY-2-MULTIPLIER",
        7,
        "GET /products/{id}/offer?quantity=2 sobre HTTPS calcula subtotal exacto 1780 USD (2x unit_price)",
        q2Ok,
        "HTTP 200, unit_price=890, subtotal=1780, scale=2",
        `HTTP ${offerQ2Res.status}, unit_price=${offerQ2Res.data?.unit_price}, subtotal=${offerQ2Res.data?.subtotal}, scale=${offerQ2Res.data?.scale}`
      );

      // 3. Boundary: Quantity = 0 (Reject 400)
      const offerQ0Res = await httpRequest(
        `${HTTPS_BASE_URL}/api/muse/v1/products/${plcVariantId}/offer?quantity=0`,
        { headers: authHeaders }
      );

      const q0Ok =
        offerQ0Res.status === 400 &&
        Boolean(offerQ0Res.data?.error?.code);
      record(
        "OFFER-HTTPS-QTY-0-BOUNDARY",
        7,
        "GET /products/{id}/offer?quantity=0 sobre HTTPS es rechazado con HTTP 400 Bad Request estructurado",
        q0Ok,
        "HTTP 400 Bad Request con error.code",
        `HTTP ${offerQ0Res.status}, code=${offerQ0Res.data?.error?.code}`
      );

      // 4. Boundary: Quantity = 21 (Reject 400, exceeds max 20)
      const offerQ21Res = await httpRequest(
        `${HTTPS_BASE_URL}/api/muse/v1/products/${plcVariantId}/offer?quantity=21`,
        { headers: authHeaders }
      );

      const q21Ok =
        offerQ21Res.status === 400 &&
        Boolean(offerQ21Res.data?.error?.code);
      record(
        "OFFER-HTTPS-QTY-21-BOUNDARY",
        7,
        "GET /products/{id}/offer?quantity=21 sobre HTTPS es rechazado con HTTP 400 Bad Request (límite 20)",
        q21Ok,
        "HTTP 400 Bad Request con error.code",
        `HTTP ${offerQ21Res.status}, code=${offerQ21Res.data?.error?.code}`
      );
    } catch (err: any) {
      record("OFFER-HTTPS-CRITICAL", 7, "Verificación de oferta viva sobre HTTPS", false, "Sin error", err.message);
    }

    // ============================================================================
    // CRITERION 8: Verify /preliminary-quotes creation and PDF URL on https://data.controlnautas.com
    // ============================================================================
    console.log(`\n${BOLD}[CRITERIO 8] CREACIÓN DE COTIZACIÓN PRELIMINAR Y URL PDF EN https://data.controlnautas.com${RESET}`);
    let activePdfUrl = "";
    let activePublicId = "";
    try {
      const quoteRes = await httpRequest(`${HTTPS_BASE_URL}/api/muse/v1/preliminary-quotes`, {
        method: "POST",
        headers: authHeaders,
        body: {
          variant_id: plcVariantId,
          quantity: 1,
        },
      });

      const quoteCreated = quoteRes.status === 201;
      record(
        "QUOTE-HTTPS-STATUS-201",
        8,
        "POST /api/muse/v1/preliminary-quotes sobre HTTPS responde HTTP 201 Created",
        quoteCreated,
        "HTTP 201 Created",
        `HTTP ${quoteRes.status}`
      );

      activePdfUrl = quoteRes.data?.pdf_url || "";
      activePublicId = quoteRes.data?.opaque_public_id || "";

      const pdfUrlValid =
        activePdfUrl.startsWith(`https://${BASE_DOMAIN}/api/muse/v1/quotes/`) &&
        activePdfUrl.includes("/pdf?token=");
      record(
        "QUOTE-HTTPS-PDF-URL-HOST",
        8,
        "Campo pdf_url apunta canónicamente a https://data.controlnautas.com sin IPs ni esquemas inseguros",
        pdfUrlValid,
        `https://${BASE_DOMAIN}/api/muse/v1/quotes/{id}/pdf?token={download_token}`,
        activePdfUrl || "ausente"
      );

      const noBearerLeak =
        !activePdfUrl.includes(token) && !activePdfUrl.toLowerCase().includes("bearer");
      record(
        "QUOTE-HTTPS-NO-BEARER-LEAK",
        8,
        "PROHIBICIÓN ESTRICTA: La URL generada para el PDF no filtra el Bearer API token en parámetros",
        noBearerLeak,
        "Limpio de secretos API",
        noBearerLeak ? "Sin token Bearer en URL" : "Fuga de API token detectada en URL"
      );

      const identifiersOk =
        String(quoteRes.data?.quote_id).startsWith("pquote_") &&
        activePublicId.length >= 16;
      record(
        "QUOTE-HTTPS-IDENTIFIERS",
        8,
        "Identificadores de cotización con prefijo oficial 'pquote_' y alta entropía (opaque_public_id >= 16 chars)",
        identifiersOk,
        "quote_id: pquote_*, opaque_public_id: hex >= 16",
        `quote_id=${quoteRes.data?.quote_id}, opaque_public_id=${activePublicId} (len=${activePublicId.length})`
      );

      const summary = quoteRes.data?.summary;
      const summaryOk =
        summary?.sku === "CN-X5PRIME-HE-XP5" &&
        summary?.unit_price === 890 &&
        summary?.subtotal === 890 &&
        summary?.currency?.toLowerCase() === "usd" &&
        summary?.availability?.status === "in_stock" &&
        (summary?.product_url || "").startsWith(`https://${BASE_DOMAIN}/us/products/`);
      record(
        "QUOTE-HTTPS-SUMMARY-INTEGRITY",
        8,
        "Resumen comercial inmutable contiene SKU, precios, stock y URL pública de PDP en Storefront (/us/products/)",
        summaryOk,
        "Precios oficiales 890 USD y product_url en https://data.controlnautas.com/us/products/",
        `unit_price=${summary?.unit_price}, subtotal=${summary?.subtotal}, currency=${summary?.currency}, product_url=${summary?.product_url}`
      );
    } catch (err: any) {
      record("QUOTE-HTTPS-CRITICAL", 8, "Creación de cotización preliminar sobre HTTPS", false, "Sin error", err.message);
    }

    // ============================================================================
    // CRITERION 9: Verify /quotes/{id}/pdf download over HTTPS without Bearer token
    // ============================================================================
    console.log(`\n${BOLD}[CRITERIO 9] DESCARGA PÚBLICA DE PDF SOBRE HTTPS SIN BEARER TOKEN${RESET}`);
    try {
      if (!activePdfUrl) {
        throw new Error("No active PDF URL available from Criterion 8");
      }

      // Download WITHOUT Authorization header
      const pdfRes = await httpRequest(activePdfUrl, {
        method: "GET",
      });

      record(
        "PDF-HTTPS-DOWNLOAD-200",
        9,
        "Descarga de PDF de cotización responde HTTP 200 OK públicamente sin header Authorization",
        pdfRes.status === 200,
        "HTTP 200",
        `HTTP ${pdfRes.status}`
      );

      const isPdfContent = (pdfRes.headers["content-type"] || "").includes("application/pdf");
      record(
        "PDF-HTTPS-CONTENT-TYPE",
        9,
        "Cabecera Content-Type es estrictamente application/pdf",
        isPdfContent,
        "application/pdf",
        pdfRes.headers["content-type"] || "ausente"
      );

      const hasPdfMagic = pdfRes.rawBody.startsWith("%PDF-");
      record(
        "PDF-HTTPS-MAGIC-BYTES",
        9,
        "Contenido binario comienza con magic bytes de PDF estándar (%PDF-)",
        hasPdfMagic,
        "Empieza con %PDF-",
        pdfRes.rawBody.slice(0, 7)
      );

      record(
        "PDF-HTTPS-FILE-SIZE",
        9,
        "Tamaño del documento PDF generado es consistente (> 1000 bytes)",
        pdfRes.rawBody.length > 1000,
        "> 1000 bytes",
        `${pdfRes.rawBody.length} bytes`
      );

      // Verificación de contenido en inglés y USD sobre HTTPS
      const pdfText = extractPdfText(pdfRes.buffer);
      const hasUsdOrDollar = pdfText.includes("$") || pdfText.includes("USD");
      const hasEnglishDisclaimer = pdfText.includes("SIMULATION — NOT A VALID COMMERCIAL OFFER");
      const hasNoPen = !pdfText.includes("PEN") && !pdfText.includes("S/.");

      record(
        "PDF-HTTPS-ENGLISH-DISCLAIMER-USD",
        9,
        "Documento PDF sobre HTTPS incluye disclaimer en inglés 'SIMULATION — NOT A VALID COMMERCIAL OFFER' y precios USD",
        hasUsdOrDollar && hasEnglishDisclaimer && hasNoPen,
        "USD/$ presente, Disclaimer en inglés presente, sin PEN ni S/.",
        `USD=${hasUsdOrDollar}, disclaimer=${hasEnglishDisclaimer}, no_pen=${hasNoPen}`
      );

      // Security: Tampered download token returns 404
      const tamperedUrl = activePdfUrl.replace(/token=[^&]+/, "token=bad_forged_token_123");
      const tamperedRes = await httpRequest(tamperedUrl, { method: "GET" });
      record(
        "PDF-HTTPS-TAMPERED-TOKEN-404",
        9,
        "Descarga con token adulterado o inválido es rechazada con HTTP 404 Not Found",
        tamperedRes.status === 404,
        "HTTP 404",
        `HTTP ${tamperedRes.status}`
      );

      // Security: Fake public ID returns 404
      const fakeIdUrl = activePdfUrl.replace(/\/quotes\/[^/]+\/pdf/, "/quotes/nonexistent_fake_id_000/pdf");
      const fakeIdRes = await httpRequest(fakeIdUrl, { method: "GET" });
      record(
        "PDF-HTTPS-FAKE-ID-404",
        9,
        "Intento de enumeración con opaque_public_id inexistente retorna HTTP 404 Not Found",
        fakeIdRes.status === 404,
        "HTTP 404",
        `HTTP ${fakeIdRes.status}`
      );

      // Security: Passing MUSE_API_TOKEN in query parameter is rejected
      const forbiddenApiTokenUrl = `${HTTPS_BASE_URL}/api/muse/v1/quotes/${activePublicId}/pdf?token=${token}`;
      const forbiddenTokenRes = await httpRequest(forbiddenApiTokenUrl, { method: "GET" });
      const rejectsApiToken = forbiddenTokenRes.status === 400 || forbiddenTokenRes.status === 403 || forbiddenTokenRes.status === 404;
      record(
        "PDF-HTTPS-REJECT-API-TOKEN",
        9,
        "Ruta de descarga rechaza explícitamente el uso de MUSE_API_TOKEN como query param",
        rejectsApiToken,
        "HTTP 400, 403 o 404",
        `HTTP ${forbiddenTokenRes.status}`
      );
    } catch (err: any) {
      record("PDF-HTTPS-CRITICAL", 9, "Descarga segura de PDF sobre HTTPS", false, "Sin error", err.message);
    }

    // ============================================================================
    // CRITERION 10: Verify idempotency (replay and 409 conflict) over HTTPS
    // ============================================================================
    console.log(`\n${BOLD}[CRITERIO 10] IDEMPOTENCIA Y MANEJO DE CONFLICTO (REPLAY Y 409) SOBRE HTTPS${RESET}`);
    try {
      const idempotencyKey = `idem_https_${Date.now()}_${crypto.randomBytes(6).toString("hex")}`;
      const payloadA = { variant_id: plcVariantId, quantity: 1 };
      const payloadB = { variant_id: plcVariantId, quantity: 2 };

      // 1. Initial POST with Idempotency-Key
      const post1Res = await httpRequest(`${HTTPS_BASE_URL}/api/muse/v1/preliminary-quotes`, {
        method: "POST",
        headers: {
          ...authHeaders,
          "Idempotency-Key": idempotencyKey,
        },
        body: payloadA,
      });

      const initialCreated = post1Res.status === 201;
      const quoteId1 = post1Res.data?.quote_id;
      const publicId1 = post1Res.data?.opaque_public_id;
      const pdfUrl1 = post1Res.data?.pdf_url;

      record(
        "IDEMPOTENCY-HTTPS-INITIAL-POST",
        10,
        "POST inicial con cabecera Idempotency-Key sobre HTTPS crea cotización con HTTP 201 Created",
        initialCreated && Boolean(quoteId1),
        "HTTP 201 con quote_id",
        `HTTP ${post1Res.status}, quote_id=${quoteId1}`
      );

      // 2. Replay with identical body and same key
      const replayRes = await httpRequest(`${HTTPS_BASE_URL}/api/muse/v1/preliminary-quotes`, {
        method: "POST",
        headers: {
          ...authHeaders,
          "Idempotency-Key": idempotencyKey,
        },
        body: payloadA,
      });

      const replayOk =
        (replayRes.status === 200 || replayRes.status === 201) &&
        replayRes.data?.quote_id === quoteId1 &&
        replayRes.data?.opaque_public_id === publicId1 &&
        replayRes.data?.pdf_url === pdfUrl1;
      record(
        "IDEMPOTENCY-HTTPS-REPLAY",
        10,
        "Replay idéntico sobre HTTPS devuelve exactamente la misma cotización (mismo quote_id, public_id y pdf_url)",
        replayOk,
        "Misma cotización sin duplicar",
        `HTTP ${replayRes.status}, quote_id_match=${replayRes.data?.quote_id === quoteId1}`
      );

      // 3. PostgreSQL database check: exactly 1 row
      const dbRows = psqlQuery<{ count: string }>(`
        SELECT count(*) as count FROM preliminary_quote WHERE idempotency_key = '${idempotencyKey}';
      `);
      const dbCount = parseInt(dbRows[0]?.count || "0", 10);
      record(
        "IDEMPOTENCY-HTTPS-DB-UNIQUENESS",
        10,
        "Base de datos PostgreSQL garantiza unicidad estricta (exactamente 1 fila persistida para la clave)",
        dbCount === 1,
        "count = 1",
        `count = ${dbCount}`
      );

      // 4. Conflict POST with same key but different body (quantity 2)
      const conflictRes = await httpRequest(`${HTTPS_BASE_URL}/api/muse/v1/preliminary-quotes`, {
        method: "POST",
        headers: {
          ...authHeaders,
          "Idempotency-Key": idempotencyKey,
        },
        body: payloadB,
      });

      const conflictOk =
        conflictRes.status === 409 &&
        conflictRes.data?.error?.code === "IDEMPOTENCY_CONFLICT";
      record(
        "IDEMPOTENCY-HTTPS-CONFLICT-409",
        10,
        "Petición conflictiva (misma clave con payload diferente) retorna HTTP 409 e IDEMPOTENCY_CONFLICT",
        conflictOk,
        "HTTP 409, error.code: 'IDEMPOTENCY_CONFLICT'",
        `HTTP ${conflictRes.status}, code=${conflictRes.data?.error?.code}`
      );
    } catch (err: any) {
      record("IDEMPOTENCY-HTTPS-CRITICAL", 10, "Verificación de idempotencia sobre HTTPS", false, "Sin error", err.message);
    }

    // ============================================================================
    // CRITERION 11: Verify price tampering immunity over HTTPS
    // ============================================================================
    console.log(`\n${BOLD}[CRITERIO 11] INMUNIDAD A ADULTERACIÓN DE PRECIOS POR CLIENTE SOBRE HTTPS${RESET}`);
    try {
      const tamperingPayload = {
        variant_id: plcVariantId,
        quantity: 1,
        // Injected malicious values attempting price and stock override
        price: 0.01,
        unit_price: 0.01,
        subtotal: 0.01,
        in_stock: 99999,
        stock: 99999,
        currency: "EUR",
      };

      const tamperRes = await httpRequest(`${HTTPS_BASE_URL}/api/muse/v1/preliminary-quotes`, {
        method: "POST",
        headers: authHeaders,
        body: tamperingPayload,
      });

      const summary = tamperRes.data?.summary;
      const immuneApi =
        tamperRes.status === 201 &&
        summary?.unit_price === 890 &&
        summary?.subtotal === 890 &&
        summary?.currency?.toLowerCase() === "usd" &&
        summary?.availability?.status === "in_stock" &&
        summary?.availability?.stocked_quantity === 3;

      record(
        "PRICE-TAMPERING-HTTPS-API",
        11,
        "Los valores comerciales inyectados por el cliente son ignorados; la API devuelve precio Medusa 890 USD",
        immuneApi,
        "unit_price=890, subtotal=890, currency='usd'",
        `HTTP ${tamperRes.status}, unit_price=${summary?.unit_price}, subtotal=${summary?.subtotal}, currency=${summary?.currency}`
      );

      // Verify PostgreSQL snapshot record
      const quoteId = tamperRes.data?.quote_id || "";
      const quoteDb = psqlQuery<{ unit_price_minor: number; subtotal_minor: number }>(`
        SELECT unit_price_minor, subtotal_minor FROM preliminary_quote WHERE id = '${quoteId}';
      `);

      const dbPrices = quoteDb[0];
      const immuneDb =
        Number(dbPrices?.unit_price_minor) === 89000 &&
        Number(dbPrices?.subtotal_minor) === 89000;
      record(
        "PRICE-TAMPERING-HTTPS-DB-SNAPSHOT",
        11,
        "Snapshot persistido en PostgreSQL almacena valores oficiales (89000 minor) sin afectación",
        immuneDb,
        "unit_price_minor=89000, subtotal_minor=89000",
        `unit_price_minor=${dbPrices?.unit_price_minor}, subtotal_minor=${dbPrices?.subtotal_minor}`
      );
    } catch (err: any) {
      record("PRICE-TAMPERING-HTTPS-CRITICAL", 11, "Verificación de inmunidad a manipulación de precios", false, "Sin error", err.message);
    }

    // ============================================================================
    // CRITERION 12: Verify Storefront PDPs and demo assets over HTTPS
    // ============================================================================
    console.log(`\n${BOLD}[CRITERIO 12] PÁGINAS STOREFRONT (PDPs) Y ACTIVOS DEMO SOBRE HTTPS${RESET}`);
    try {
      const demoProducts = [
        { sku: "CN-X5PRIME-HE-XP5", handle: "cn-x5prime-he-xp5" },
        { sku: "CN-N1200", handle: "cn-n1200" },
        { sku: "CN-THT02", handle: "cn-tht02" },
      ];

      for (const p of demoProducts) {
        // 1. Storefront PDP HTML over HTTPS
        const pdpUrl = `${HTTPS_BASE_URL}/us/products/${p.handle}`;
        const pdpRes = await httpRequest(pdpUrl, { method: "GET", timeoutMs: 20000 });

        const pdpHasNotice =
          pdpRes.rawBody.includes("FICTITIOUS PRODUCT") ||
          pdpRes.rawBody.includes("DEMONSTRATION") ||
          pdpRes.rawBody.includes("disclaimer") ||
          pdpRes.rawBody.includes("fictitious") ||
          pdpRes.rawBody.includes("PRODUCTO FICTICIO") ||
          pdpRes.rawBody.includes("DEMOSTRACIÓN");

        record(
          `STOREFRONT-PDP-HTTPS-${p.sku}`,
          12,
          `Página humana Storefront responde HTTP 200 OK y muestra banner de ficción sobre HTTPS (${p.handle})`,
          pdpRes.status === 200 && pdpHasNotice,
          "HTTP 200 con marca de producto ficticio en inglés",
          `HTTP ${pdpRes.status}, aviso_presente=${pdpHasNotice}`
        );

        // 2. Datasheet PDF over HTTPS
        const datasheetUrl = `${HTTPS_BASE_URL}/demo/datasheets/${p.sku}.pdf`;
        const datasheetRes = await httpRequest(datasheetUrl, { method: "GET" });

        const isPdf =
          datasheetRes.status === 200 &&
          (datasheetRes.headers["content-type"] || "").includes("application/pdf") &&
          datasheetRes.rawBody.startsWith("%PDF-") &&
          datasheetRes.rawBody.length > 1000;

        record(
          `DEMO-ASSET-PDF-HTTPS-${p.sku}`,
          12,
          `Datasheet PDF demo descarga HTTP 200 application/pdf sobre HTTPS (${p.sku}.pdf)`,
          isPdf,
          "HTTP 200 application/pdf con magic bytes %PDF-",
          `HTTP ${datasheetRes.status}, type=${datasheetRes.headers["content-type"]}, bytes=${datasheetRes.rawBody.length}`
        );

        // 3. Technical Spec Markdown over HTTPS
        const specUrl = `${HTTPS_BASE_URL}/demo/specs/${p.sku}.md`;
        const specRes = await httpRequest(specUrl, { method: "GET" });

        const isMd =
          specRes.status === 200 &&
          specRes.rawBody.length > 100 &&
          (specRes.rawBody.includes("Specification") ||
            specRes.rawBody.includes("Datasheet") ||
            specRes.rawBody.includes("CN-DEMO") ||
            specRes.rawBody.includes("Ficha") ||
            specRes.rawBody.includes("Especificación"));

        record(
          `DEMO-ASSET-SPEC-HTTPS-${p.sku}`,
          12,
          `Ficha Markdown técnica descarga HTTP 200 sobre HTTPS (${p.sku}.md)`,
          isMd,
          "HTTP 200 con contenido Markdown estructurado",
          `HTTP ${specRes.status}, bytes=${specRes.rawBody.length}`
        );
      }
    } catch (err: any) {
      record("STOREFRONT-HTTPS-CRITICAL", 12, "Verificación de Storefront PDPs y activos sobre HTTPS", false, "Sin error", err.message);
    }
  }

  // ============================================================================
  // CRITERION 13: Regression checks (verify-phase1, verify-phase2, verify-phase3)
  // ============================================================================
  console.log(`\n${BOLD}[CRITERIO 13] REGRESIÓN INTEGRAL: verify-phase1, verify-phase2, verify-phase3 (100% PASS)${RESET}`);
  if (skipRegression) {
    console.log(`    ${YELLOW}Regresión omitida por bandera --skip-regression${RESET}`);
  } else {
    // 1. Regression Phase 1
    console.log(`    ${GRAY}Ejecutando suite de regresión Fase 1 (scripts/verify-phase1.sh)...${RESET}`);
    try {
      const p1Output = execSync(`bash ${path.join(ROOT_DIR, "scripts", "verify-phase1.sh")}`, {
        encoding: "utf8",
        stdio: ["pipe", "pipe", "pipe"],
      });
      const p1Pass =
        p1Output.includes("TODAS LAS PRUEBAS DE LA PUERTA 1 FUERON SUPERADAS") ||
        p1Output.includes("TODAS LAS PRUEBAS DE LA FASE 1 FUERON SUPERADAS");
      record(
        "REGRESSION-PHASE1-SUITE",
        13,
        "Suite completa de Fase 1 (verify-phase1.sh) ejecuta y supera 100% de criterios",
        p1Pass,
        "100% PASS (55/55)",
        p1Pass ? "PASS (100% verificado)" : "FAIL"
      );
    } catch (err: any) {
      record("REGRESSION-PHASE1-SUITE", 13, "Ejecución de scripts/verify-phase1.sh", false, "100% PASS", err.message);
    }

    // 2. Regression Phase 2
    console.log(`    ${GRAY}Ejecutando suite de regresión Fase 2 (scripts/verify-phase2.sh)...${RESET}`);
    try {
      const p2Output = execSync(`bash ${path.join(ROOT_DIR, "scripts", "verify-phase2.sh")}`, {
        encoding: "utf8",
        stdio: ["pipe", "pipe", "pipe"],
      });
      const p2Pass =
        p2Output.includes("TODAS LAS PRUEBAS DE LA PUERTA 2 FUERON SUPERADAS") ||
        p2Output.includes("TODAS LAS PRUEBAS DE LA FASE 2 FUERON SUPERADAS");
      record(
        "REGRESSION-PHASE2-SUITE",
        13,
        "Suite completa de Fase 2 (verify-phase2.sh) ejecuta y supera 100% de criterios y límites",
        p2Pass,
        "100% PASS",
        p2Pass ? "PASS (100% verificado)" : "FAIL"
      );
    } catch (err: any) {
      record("REGRESSION-PHASE2-SUITE", 13, "Ejecución de scripts/verify-phase2.sh", false, "100% PASS", err.message);
    }

    // 3. Regression Phase 3
    console.log(`    ${GRAY}Ejecutando suite de regresión Fase 3 (scripts/verify-phase3.sh)...${RESET}`);
    try {
      // Small settle pause to ensure database connections are synchronized after Phase 1 re-seed
      execSync("sleep 2");
      const p3Output = execSync(`bash ${path.join(ROOT_DIR, "scripts", "verify-phase3.sh")}`, {
        encoding: "utf8",
        stdio: ["pipe", "pipe", "pipe"],
      });
      const p3Pass =
        p3Output.includes("TODAS LAS PRUEBAS DE LA PUERTA 3 FUERON SUPERADAS") ||
        p3Output.includes("TODAS LAS PRUEBAS DE LA FASE 3 FUERON SUPERADAS");
      record(
        "REGRESSION-PHASE3-SUITE",
        13,
        "Suite completa de Fase 3 (verify-phase3.sh) ejecuta y supera 100% de criterios comerciales",
        p3Pass,
        "100% PASS (79/79)",
        p3Pass ? "PASS (100% verificado)" : "FAIL"
      );
    } catch (err: any) {
      record("REGRESSION-PHASE3-SUITE", 13, "Ejecución de scripts/verify-phase3.sh", false, "100% PASS", err.message);
    }
  }

  // ============================================================================
  // AUDIT REPORT TABLE & EXIT CODE
  // ============================================================================
  console.log(`\n${BOLD}${CYAN}==============================================================================${RESET}`);
  console.log(`${BOLD}${CYAN}  TABLA DETALLADA DE AUDITORÍA — REQUISITOS DE PUERTA 4 Y PUERTA 5            ${RESET}`);
  console.log(`${BOLD}${CYAN}==============================================================================${RESET}\n`);

  console.log(`| Criterio   | Código de Prueba                 | Descripción de Verificación                                      | Estado  |`);
  console.log(`| :--------- | :------------------------------- | :---------------------------------------------------------------- | :------ |`);

  for (const r of results) {
    const statusCol = r.passed ? `${GREEN}✔ PASS${RESET}` : `${RED}✘ FAIL${RESET}`;
    const critCol = `Puerta 4.${r.criterion}`.padEnd(10, " ");
    const codeCol = r.gate.padEnd(32, " ").slice(0, 32);
    const descCol = r.name.padEnd(65, " ").slice(0, 65);
    console.log(`| ${critCol} | ${codeCol} | ${descCol} | ${statusCol} |`);
  }

  console.log(`\n${BOLD}${CYAN}==============================================================================${RESET}`);
  console.log(`${BOLD}${CYAN}  RESUMEN FINAL DE AUDITORÍA — CONTROL DE CALIDAD PUERTA 4/5                  ${RESET}`);
  console.log(`${BOLD}${CYAN}==============================================================================${RESET}`);

  const total = results.length;
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;
  const passRate = total > 0 ? ((passed / total) * 100).toFixed(1) : "0";

  console.log(`  Total de verificaciones ejecutadas : ${BOLD}${total}${RESET}`);
  console.log(`  Verificaciones superadas (${GREEN}PASS${RESET})   : ${GREEN}${BOLD}${passed}${RESET}`);
  console.log(`  Verificaciones fallidas  (${RED}FAIL${RESET})   : ${failed > 0 ? `${RED}${BOLD}${failed}${RESET}` : `${GREEN}0${RESET}`}`);
  console.log(`  Tasa de conformidad global         : ${failed === 0 ? GREEN : RED}${BOLD}${passRate}%${RESET}`);

  // Summary by criteria (1 to 13)
  console.log(`\n  ${BOLD}Resumen por Criterio de Puerta 4/5:${RESET}`);
  for (let c = 1; c <= 13; c++) {
    if (skipRegression && c === 13) continue;
    const cResults = results.filter((r) => r.criterion === c);
    const cTotal = cResults.length;
    const cPassed = cResults.filter((r) => r.passed).length;
    const cOk = cPassed === cTotal && cTotal > 0;
    const cStatus = cOk
      ? `${GREEN}✔ PASS (${cPassed}/${cTotal})${RESET}`
      : `${RED}✘ FAIL (${cPassed}/${cTotal})${RESET}`;
    console.log(`    - Criterio ${String(c).padStart(2, " ")}: ${cStatus}`);
  }

  if (failed === 0) {
    console.log(`\n${BOLD}${GREEN}✔ TODAS LAS PRUEBAS DE LA PUERTA 4+5 FUERON SUPERADAS EXITOSAMENTE (100% PASS).${RESET}`);
    console.log(`${GREEN}El despliegue en producción con TLS 1.3, dominio canónico y seguridad HTTPS está verificado.${RESET}\n`);
    process.exit(0);
  } else {
    console.log(`\n${BOLD}${RED}✘ SE DETECTARON ${failed} PRUEBAS NO CONFORMES EN LA PUERTA 4+5.${RESET}`);
    console.log(`${RED}Por favor revise las no conformidades detalladas en la tabla antes de proceder.${RESET}\n`);
    process.exit(1);
  }
}

runSuite().catch((err) => {
  console.error("Error fatal durante la ejecución de la suite Puerta 4/5:", err);
  process.exit(1);
});
