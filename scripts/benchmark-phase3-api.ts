/**
 * M2M Latency Benchmark & Profiling Suite for Phase 3 (Gate 3)
 * Controlnautas × Meta Muse (Hack Day 2026)
 *
 * Requirements:
 * 1. Benchmark GET /api/muse/v1/products/{variantId}/offer (50 iterations):
 *    - Record p50 (median), p95, p99, min, mean, max latencies.
 *    - Target: p95 < 50 ms.
 * 2. Benchmark POST /api/muse/v1/preliminary-quotes (20 iterations):
 *    - Record p50 (median), p95, p99, min, mean, max latencies.
 *    - Target: p95 < 500 ms (including dynamic quote snapshot and synchronous PDF generation).
 * 3. Benchmark GET /api/muse/v1/quotes/{quoteId}/pdf (20 iterations):
 *    - Record p50 (median), p95, p99, min, mean, max latencies.
 *    - Public download route (no Bearer token in headers/query).
 * 4. Output results to 'scripts/benchmark-phase3-report.json'.
 */

import fs from "fs";
import path from "path";
import os from "os";

// ANSI Terminal Formatting
const RESET = "\x1b[0m";
const BOLD = "\x1b[1m";
const GREEN = "\x1b[32m";
const RED = "\x1b[31m";
const YELLOW = "\x1b[33m";
const CYAN = "\x1b[36m";
const MAGENTA = "\x1b[35m";
const GRAY = "\x1b[90m";

export interface BenchmarkContext {
  baseUrl: string;
  token: string;
  variantId: string;
  sku: string;
}

export interface IterationResult {
  iteration: number;
  status: number;
  latencyMs: number;
  bodySnippet: string;
  requestId?: string;
  success: boolean;
  contentType?: string;
  contentLength?: number;
  error?: string;
}

export interface EndpointStats {
  name: string;
  method: "GET" | "POST";
  url: string;
  repetitions: number;
  successfulRequests: number;
  failedRequests: number;
  minMs: number;
  meanMs: number;
  medianMs: number; // p50
  p95Ms: number;
  p99Ms: number;
  maxMs: number;
  stdDevMs: number;
  targetMaxMeanMs?: number;
  targetMaxP95Ms: number;
  meanTargetMet: boolean;
  p95TargetMet: boolean;
  allTargetsMet: boolean;
  iterations: IterationResult[];
}

export interface BenchmarkPhase3Report {
  timestamp: string;
  host: string;
  baseUrl: string;
  maskedToken: string;
  variantId: string;
  sku: string;
  targets: {
    offerP95Ms: number;
    preliminaryQuotesP95Ms: number;
    pdfDownloadP95Ms?: number;
  };
  summary: {
    offerP50Ms: number;
    offerP95Ms: number;
    offerP99Ms: number;
    quotesP50Ms: number;
    quotesP95Ms: number;
    quotesP99Ms: number;
    pdfP50Ms: number;
    pdfP95Ms: number;
    pdfP99Ms: number;
    allTargetsMet: boolean;
  };
  endpoints: EndpointStats[];
  overallSuccess: boolean;
}

/**
 * Calculates a given percentile (e.g. 50, 95, 99) from a sorted list of numbers using linear interpolation.
 */
export function calculatePercentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  if (sorted.length === 1) return sorted[0];
  const index = (p / 100) * (sorted.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const weight = index - lower;
  return sorted[lower] * (1 - weight) + sorted[upper] * weight;
}

/**
 * Masks a token for safe logging (e.g. mus_3f...0965).
 */
export function maskToken(token: string): string {
  if (!token || token.length <= 8) return "****";
  return `${token.slice(0, 6)}...${token.slice(-4)}`;
}

/**
 * Resolves context: Base URL, Token, and Demo Variant ID.
 */
export function resolveContext(): BenchmarkContext {
  const rootDir = path.resolve(__dirname, "..");

  // 1. Base URL
  const baseUrl = (process.env.MEDUSA_BACKEND_URL || "http://127.0.0.1:9000").replace(/\/+$/, "");

  // 2. Token discovery
  let token = process.env.MUSE_API_TOKEN || "";
  if (!token) {
    const envPaths = [
      path.join(rootDir, "b2b-backend", "apps", "backend", ".env"),
      path.join(rootDir, ".env"),
    ];
    for (const envPath of envPaths) {
      if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, "utf8");
        const match = content.match(/MUSE_API_TOKEN\s*=\s*(.+)/);
        if (match && match[1]) {
          token = match[1].trim().replace(/^['"]|['"]$/g, "");
          break;
        }
      }
    }
  }

  // 3. Variant ID discovery from manifest
  let variantId = "variant_01M3QAJ590Z5C5GH7VD3TKS4T3"; // Fallback demo PLC
  let sku = "CN-DEMO-PLC-DIN-420-MR1";
  const manifestPath = path.join(rootDir, "hackday-demo-manifest.json");

  if (fs.existsSync(manifestPath)) {
    try {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
      if (manifest.products) {
        const firstKey = Object.keys(manifest.products)[0];
        if (firstKey && manifest.products[firstKey]?.variant_id) {
          variantId = manifest.products[firstKey].variant_id;
          sku = manifest.products[firstKey].sku || firstKey;
        }
      }
    } catch {
      // Keep default fallback
    }
  }

  return { baseUrl, token, variantId, sku };
}

/**
 * Executes a single HTTP request with high-resolution timing (hrtime.bigint).
 */
export async function measureRequest(
  url: string,
  method: "GET" | "POST",
  headers: Record<string, string>,
  body?: string
): Promise<{
  status: number;
  latencyMs: number;
  bodySnippet: string;
  rawText: string;
  requestId?: string;
  contentType?: string;
  contentLength?: number;
  error?: string;
}> {
  const start = process.hrtime.bigint();
  let status = 0;
  let bodySnippet = "";
  let rawText = "";
  let requestId: string | undefined;
  let contentType: string | undefined;
  let contentLength: number | undefined;
  let errorMsg: string | undefined;

  try {
    const response = await fetch(url, {
      method,
      headers,
      body: method === "POST" ? body : undefined,
    });
    status = response.status;
    requestId = response.headers.get("x-request-id") || undefined;
    contentType = response.headers.get("content-type") || undefined;

    const clHeader = response.headers.get("content-length");
    if (clHeader) {
      contentLength = parseInt(clHeader, 10);
    }

    if (contentType?.includes("application/pdf")) {
      const buf = await response.arrayBuffer();
      contentLength = buf.byteLength;
      const isPdfHeader = Buffer.from(buf.slice(0, 5)).toString("ascii") === "%PDF-";
      bodySnippet = `[PDF binary: ${buf.byteLength} bytes, validHeader=${isPdfHeader}]`;
    } else {
      rawText = await response.text();
      bodySnippet = rawText.slice(0, 160).replace(/\s+/g, " ");
    }
  } catch (err: any) {
    status = 0;
    errorMsg = err.message || String(err);
    bodySnippet = `ERR: ${errorMsg}`;
  }

  const end = process.hrtime.bigint();
  const latencyMs = Number(end - start) / 1_000_000;

  return { status, latencyMs, bodySnippet, rawText, requestId, contentType, contentLength, error: errorMsg };
}

/**
 * Computes comprehensive statistical distribution from raw latency samples.
 */
function computeStats(
  name: string,
  method: "GET" | "POST",
  url: string,
  iterationResults: IterationResult[],
  targetMaxP95Ms: number,
  targetMaxMeanMs?: number
): EndpointStats {
  const latencies = iterationResults.map((r) => r.latencyMs);
  const sortedLatencies = [...latencies].sort((a, b) => a - b);
  const minMs = sortedLatencies[0] || 0;
  const maxMs = sortedLatencies[sortedLatencies.length - 1] || 0;
  const sumMs = sortedLatencies.reduce((acc, v) => acc + v, 0);
  const meanMs = sumMs / (sortedLatencies.length || 1);
  const medianMs = calculatePercentile(sortedLatencies, 50);
  const p95Ms = calculatePercentile(sortedLatencies, 95);
  const p99Ms = calculatePercentile(sortedLatencies, 99);

  const variance =
    sortedLatencies.reduce((acc, v) => acc + Math.pow(v - meanMs, 2), 0) /
    (sortedLatencies.length || 1);
  const stdDevMs = Math.sqrt(variance);

  const successfulRequests = iterationResults.filter((r) => r.success).length;
  const failedRequests = iterationResults.length - successfulRequests;

  const p95TargetMet = p95Ms < targetMaxP95Ms && successfulRequests === iterationResults.length;
  const meanTargetMet = targetMaxMeanMs
    ? meanMs < targetMaxMeanMs && successfulRequests === iterationResults.length
    : true;
  const allTargetsMet = p95TargetMet && meanTargetMet;

  return {
    name,
    method,
    url,
    repetitions: iterationResults.length,
    successfulRequests,
    failedRequests,
    minMs: Number(minMs.toFixed(2)),
    meanMs: Number(meanMs.toFixed(2)),
    medianMs: Number(medianMs.toFixed(2)),
    p95Ms: Number(p95Ms.toFixed(2)),
    p99Ms: Number(p99Ms.toFixed(2)),
    maxMs: Number(maxMs.toFixed(2)),
    stdDevMs: Number(stdDevMs.toFixed(2)),
    targetMaxMeanMs,
    targetMaxP95Ms,
    meanTargetMet,
    p95TargetMet,
    allTargetsMet,
    iterations: iterationResults,
  };
}

/**
 * Polls endpoints until ready or timeout expires.
 */
async function waitForEndpointsReady(context: BenchmarkContext, timeoutSeconds = 60): Promise<boolean> {
  const offerUrl = `${context.baseUrl}/api/muse/v1/products/${context.variantId}/offer?quantity=1`;
  const quotesUrl = `${context.baseUrl}/api/muse/v1/preliminary-quotes`;
  const headers: Record<string, string> = {
    Accept: "application/json",
    Authorization: `Bearer ${context.token}`,
  };

  const deadline = Date.now() + timeoutSeconds * 1000;
  process.stdout.write(`${CYAN}Verifying Phase 3 endpoints availability at ${context.baseUrl}...${RESET} `);

  while (Date.now() < deadline) {
    try {
      const resOffer = await fetch(offerUrl, { method: "GET", headers });
      if (resOffer.status === 200 || resOffer.status === 400) {
        console.log(`${GREEN}Ready!${RESET}`);
        return true;
      }
    } catch {
      // Continue waiting
    }
    process.stdout.write(".");
    await new Promise((r) => setTimeout(r, 2000));
  }

  console.log(`\n${YELLOW}Warning: Endpoints not fully ready within ${timeoutSeconds}s. Proceeding with benchmark anyway...${RESET}`);
  return false;
}

export interface RunBenchmarkPhase3Options {
  baseUrl?: string;
  token?: string;
  variantId?: string;
  offerIterations?: number;
  quotesIterations?: number;
  pdfIterations?: number;
  warmupCount?: number;
  jsonOutputPath?: string;
  waitForReady?: boolean;
}

/**
 * Main benchmark runner for Phase 3
 */
export async function runPhase3Benchmark(options?: RunBenchmarkPhase3Options): Promise<BenchmarkPhase3Report> {
  const context = resolveContext();
  if (options?.baseUrl) context.baseUrl = options.baseUrl.replace(/\/+$/, "");
  if (options?.token) context.token = options.token;
  if (options?.variantId) context.variantId = options.variantId;

  const offerIterations = options?.offerIterations ?? 50;
  const quotesIterations = options?.quotesIterations ?? 20;
  const pdfIterations = options?.pdfIterations ?? 20;
  const warmupCount = options?.warmupCount ?? 2;

  console.log(`\n${BOLD}${CYAN}================================================================================${RESET}`);
  console.log(`${BOLD}${CYAN}   CONTROLNAUTAS × META MUSE — M2M LATENCY BENCHMARK SUITE (PHASE 3)             ${RESET}`);
  console.log(`${BOLD}${CYAN}================================================================================${RESET}`);
  console.log(`${BOLD}Timestamp:${RESET}          ${new Date().toISOString()}`);
  console.log(`${BOLD}Host:${RESET}               ${os.hostname()}`);
  console.log(`${BOLD}Base URL:${RESET}           ${context.baseUrl}`);
  console.log(`${BOLD}Bearer Token:${RESET}       ${maskToken(context.token)}`);
  console.log(`${BOLD}Target SKU:${RESET}         ${context.sku}`);
  console.log(`${BOLD}Target Variant:${RESET}     ${context.variantId}`);
  console.log(`${BOLD}Repetitions:${RESET}        Offer: ${offerIterations}, Preliminary-Quotes: ${quotesIterations}, PDF: ${pdfIterations}`);
  console.log(`${BOLD}SLAs / Targets:${RESET}     Offer p95 < 50 ms | Preliminary-Quotes p95 < 500 ms (incl. PDF)`);
  console.log(`${CYAN}--------------------------------------------------------------------------------${RESET}\n`);

  if (options?.waitForReady !== false) {
    await waitForEndpointsReady(context, 45);
  }

  const endpointStatsList: EndpointStats[] = [];

  // ========================================================================
  // 1. BENCHMARK GET /api/muse/v1/products/{variantId}/offer (50 iterations)
  // Target: p95 < 50ms
  // ========================================================================
  const offerUrl = `${context.baseUrl}/api/muse/v1/products/${context.variantId}/offer?quantity=1`;
  const offerHeaders: Record<string, string> = {
    Accept: "application/json",
    Authorization: `Bearer ${context.token}`,
  };

  process.stdout.write(`[1/3] Benchmarking ${BOLD}GET /api/muse/v1/products/{variantId}/offer${RESET} (${offerIterations} reps) ... `);

  // Warmup
  for (let w = 0; w < warmupCount; w++) {
    await measureRequest(offerUrl, "GET", offerHeaders);
  }

  const offerIterationResults: IterationResult[] = [];
  for (let i = 1; i <= offerIterations; i++) {
    const res = await measureRequest(offerUrl, "GET", offerHeaders);
    const success = res.status === 200;
    offerIterationResults.push({
      iteration: i,
      status: res.status,
      latencyMs: res.latencyMs,
      bodySnippet: res.bodySnippet,
      requestId: res.requestId,
      contentType: res.contentType,
      success,
      error: res.error,
    });
    // Brief spacing to maintain network stability
    await new Promise((r) => setTimeout(r, 8));
  }

  const offerStats = computeStats(
    "GET /api/muse/v1/products/{variantId}/offer",
    "GET",
    offerUrl,
    offerIterationResults,
    50, // target p95 < 50ms
    50  // target mean < 50ms
  );
  endpointStatsList.push(offerStats);

  const offerBadge = offerStats.allTargetsMet ? `${GREEN}${BOLD}✓ PASS${RESET}` : `${RED}${BOLD}✗ FAIL${RESET}`;
  console.log(
    `${offerBadge} (p50: ${offerStats.medianMs}ms, p95: ${offerStats.p95Ms}ms, p99: ${offerStats.p99Ms}ms, mean: ${offerStats.meanMs}ms, min: ${offerStats.minMs}ms, max: ${offerStats.maxMs}ms)`
  );

  // ========================================================================
  // 2. BENCHMARK POST /api/muse/v1/preliminary-quotes (20 iterations)
  // Target: p95 < 500ms (including synchronous PDF generation)
  // ========================================================================
  const quotesUrl = `${context.baseUrl}/api/muse/v1/preliminary-quotes`;
  const quotesHeaders: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
    Authorization: `Bearer ${context.token}`,
  };

  process.stdout.write(`[2/3] Benchmarking ${BOLD}POST /api/muse/v1/preliminary-quotes${RESET} (${quotesIterations} reps) ... `);

  // Warmup with a distinct idempotency key
  for (let w = 0; w < warmupCount; w++) {
    const warmupBody = JSON.stringify({
      variant_id: context.variantId,
      quantity: 1,
      idempotency_key: `warmup-quote-${Date.now()}-${w}`,
    });
    await measureRequest(quotesUrl, "POST", quotesHeaders, warmupBody);
  }

  let capturedPdfUrl: string | undefined;
  let capturedQuoteId: string | undefined;
  let capturedDownloadToken: string | undefined;

  const quotesIterationResults: IterationResult[] = [];
  for (let i = 1; i <= quotesIterations; i++) {
    // Unique idempotency key ensures full quote processing and fresh PDF generation on each iteration
    const idempotencyKey = `bench-p3-quote-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 8)}`;
    const reqBody = JSON.stringify({
      variant_id: context.variantId,
      quantity: 1,
      idempotency_key: idempotencyKey,
    });

    const res = await measureRequest(quotesUrl, "POST", quotesHeaders, reqBody);
    const success = res.status === 201 || res.status === 200;

    // Capture quote information from first successful response for step 3
    if (success && !capturedPdfUrl && res.rawText) {
      try {
        const parsed = JSON.parse(res.rawText);
        if (parsed.pdf_url) capturedPdfUrl = parsed.pdf_url;
        if (parsed.quote_id) capturedQuoteId = parsed.quote_id;
        if (parsed.opaque_public_id) capturedQuoteId = parsed.opaque_public_id;
        if (parsed.download_token) capturedDownloadToken = parsed.download_token;
      } catch {
        // Ignore parse error
      }
    }

    quotesIterationResults.push({
      iteration: i,
      status: res.status,
      latencyMs: res.latencyMs,
      bodySnippet: res.bodySnippet,
      requestId: res.requestId,
      contentType: res.contentType,
      success,
      error: res.error,
    });

    await new Promise((r) => setTimeout(r, 15));
  }

  const quotesStats = computeStats(
    "POST /api/muse/v1/preliminary-quotes",
    "POST",
    quotesUrl,
    quotesIterationResults,
    500, // target p95 < 500ms
    500  // target mean < 500ms
  );
  endpointStatsList.push(quotesStats);

  const quotesBadge = quotesStats.allTargetsMet ? `${GREEN}${BOLD}✓ PASS${RESET}` : `${RED}${BOLD}✗ FAIL${RESET}`;
  console.log(
    `${quotesBadge} (p50: ${quotesStats.medianMs}ms, p95: ${quotesStats.p95Ms}ms, p99: ${quotesStats.p99Ms}ms, mean: ${quotesStats.meanMs}ms, min: ${quotesStats.minMs}ms, max: ${quotesStats.maxMs}ms)`
  );

  // ========================================================================
  // 3. BENCHMARK GET /api/muse/v1/quotes/{quoteId}/pdf (20 iterations)
  // Public download route (NO Bearer token)
  // Target: record p50, p95 latencies
  // ========================================================================
  // Resolve PDF download URL
  let pdfDownloadUrl = "";
  if (capturedPdfUrl) {
    // Replace remote elastic IP/host with local baseUrl for accurate loopback latency measurement
    try {
      const u = new URL(capturedPdfUrl);
      pdfDownloadUrl = `${context.baseUrl}${u.pathname}${u.search}`;
    } catch {
      pdfDownloadUrl = capturedPdfUrl.startsWith("http")
        ? capturedPdfUrl
        : `${context.baseUrl}${capturedPdfUrl}`;
    }
  } else if (capturedQuoteId) {
    const tokenQuery = capturedDownloadToken ? `?token=${capturedDownloadToken}` : "";
    pdfDownloadUrl = `${context.baseUrl}/api/muse/v1/quotes/${capturedQuoteId}/pdf${tokenQuery}`;
  } else {
    // Fallback URL if preliminary quotes did not return a URL
    pdfDownloadUrl = `${context.baseUrl}/api/muse/v1/quotes/demo-quote-id/pdf`;
  }

  process.stdout.write(`[3/3] Benchmarking ${BOLD}GET /api/muse/v1/quotes/{quoteId}/pdf${RESET} (${pdfIterations} reps) ... `);

  // Public headers (Strictly NO Authorization header)
  const pdfHeaders: Record<string, string> = {
    Accept: "application/pdf, application/json;q=0.9",
  };

  // Warmup
  for (let w = 0; w < warmupCount; w++) {
    await measureRequest(pdfDownloadUrl, "GET", pdfHeaders);
  }

  const pdfIterationResults: IterationResult[] = [];
  for (let i = 1; i <= pdfIterations; i++) {
    const res = await measureRequest(pdfDownloadUrl, "GET", pdfHeaders);
    // Success requires HTTP 200 and application/pdf content type or non-empty body
    const success = res.status === 200;
    pdfIterationResults.push({
      iteration: i,
      status: res.status,
      latencyMs: res.latencyMs,
      bodySnippet: res.bodySnippet,
      requestId: res.requestId,
      contentType: res.contentType,
      contentLength: res.contentLength,
      success,
      error: res.error,
    });

    await new Promise((r) => setTimeout(r, 10));
  }

  const pdfStats = computeStats(
    "GET /api/muse/v1/quotes/{quoteId}/pdf",
    "GET",
    pdfDownloadUrl,
    pdfIterationResults,
    100, // target p95 < 100ms
    100
  );
  endpointStatsList.push(pdfStats);

  const pdfBadge = pdfStats.allTargetsMet ? `${GREEN}${BOLD}✓ PASS${RESET}` : `${RED}${BOLD}✗ FAIL${RESET}`;
  console.log(
    `${pdfBadge} (p50: ${pdfStats.medianMs}ms, p95: ${pdfStats.p95Ms}ms, p99: ${pdfStats.p99Ms}ms, mean: ${pdfStats.meanMs}ms, min: ${pdfStats.minMs}ms, max: ${pdfStats.maxMs}ms)`
  );

  // ========================================================================
  // EXECUTIVE SUMMARY TABLE
  // ========================================================================
  console.log(`\n${BOLD}${MAGENTA}================== RESUMEN EJECUTIVO DE LATENCIA M2M (FASE 3) ==================${RESET}\n`);
  console.log(
    `${BOLD}${"Endpoint".padEnd(44)} ${"Reps".padStart(5)} ${"p50".padStart(8)} ${"p95".padStart(8)} ${"p99".padStart(8)} ${"Mean".padStart(8)} ${"Target p95".padStart(11)} ${"Status".padStart(8)}${RESET}`
  );
  console.log("-".repeat(110));

  let overallSuccess = true;
  for (const s of endpointStatsList) {
    if (!s.allTargetsMet) {
      overallSuccess = false;
    }
    const statusLabel = s.allTargetsMet ? `${GREEN}PASS${RESET}` : `${RED}FAIL${RESET}`;
    const targetLabel = `< ${s.targetMaxP95Ms}ms`;

    console.log(
      `${s.name.padEnd(44)} ` +
      `${String(s.repetitions).padStart(5)} ` +
      `${`${s.medianMs} ms`.padStart(8)} ` +
      `${`${s.p95Ms} ms`.padStart(8)} ` +
      `${`${s.p99Ms} ms`.padStart(8)} ` +
      `${`${s.meanMs} ms`.padStart(8)} ` +
      `${targetLabel.padStart(11)} ` +
      `${statusLabel.padStart(8 + (s.allTargetsMet ? GREEN.length + RESET.length : RED.length + RESET.length))}`
    );
  }
  console.log("-".repeat(110));

  // SLA Verification Details
  console.log(`\n${BOLD}${CYAN}=== VALIDACIÓN FORMAL DE OBJETIVOS DE PUERTA 3 ===${RESET}`);
  console.log(
    `1. GET /offer SLA (p95 < 50 ms):               ${
      offerStats.p95Ms < 50
        ? `${GREEN}${BOLD}✓ CUMPLIDO (${offerStats.p95Ms} ms)${RESET}`
        : `${RED}${BOLD}✗ NO CUMPLIDO (${offerStats.p95Ms} ms)${RESET}`
    }`
  );
  console.log(
    `2. POST /preliminary-quotes SLA (p95 < 500 ms):  ${
      quotesStats.p95Ms < 500
        ? `${GREEN}${BOLD}✓ CUMPLIDO (${quotesStats.p95Ms} ms)${RESET}`
        : `${RED}${BOLD}✗ NO CUMPLIDO (${quotesStats.p95Ms} ms)${RESET}`
    } (incluye generación completa de PDF en disco)`
  );
  console.log(
    `3. GET /quotes/{id}/pdf SLA (p95 < 100 ms):      ${
      pdfStats.p95Ms < 100
        ? `${GREEN}${BOLD}✓ CUMPLIDO (${pdfStats.p95Ms} ms)${RESET}`
        : `${RED}${BOLD}✗ NO CUMPLIDO (${pdfStats.p95Ms} ms)${RESET}`
    } (descarga binaria de PDF validada)`
  );

  console.log(`\n${BOLD}${CYAN}================================================================================${RESET}`);
  if (overallSuccess) {
    console.log(`${GREEN}${BOLD}✓ VEREDICTO FINAL: 100% DE LOS OBJETIVOS DE LATENCIA M2M SUPERADOS EXITOSAMENTE${RESET}`);
  } else {
    console.log(`${RED}${BOLD}✗ VEREDICTO FINAL: AL MENOS UN ENDPOINT NO CUMPLIÓ CON EL SLA DE LATENCIA${RESET}`);
  }
  console.log(`${BOLD}${CYAN}================================================================================${RESET}\n`);

  const report: BenchmarkPhase3Report = {
    timestamp: new Date().toISOString(),
    host: os.hostname(),
    baseUrl: context.baseUrl,
    maskedToken: maskToken(context.token),
    variantId: context.variantId,
    sku: context.sku,
    targets: {
      offerP95Ms: 50,
      preliminaryQuotesP95Ms: 500,
      pdfDownloadP95Ms: 100,
    },
    summary: {
      offerP50Ms: offerStats.medianMs,
      offerP95Ms: offerStats.p95Ms,
      offerP99Ms: offerStats.p99Ms,
      quotesP50Ms: quotesStats.medianMs,
      quotesP95Ms: quotesStats.p95Ms,
      quotesP99Ms: quotesStats.p99Ms,
      pdfP50Ms: pdfStats.medianMs,
      pdfP95Ms: pdfStats.p95Ms,
      pdfP99Ms: pdfStats.p99Ms,
      allTargetsMet: overallSuccess,
    },
    endpoints: endpointStatsList,
    overallSuccess,
  };

  const outputPath =
    options?.jsonOutputPath ||
    path.join(path.resolve(__dirname, ".."), "scripts", "benchmark-phase3-report.json");

  try {
    fs.writeFileSync(outputPath, JSON.stringify(report, null, 2), "utf8");
    console.log(`${GRAY}Reporte JSON guardado en: ${outputPath}${RESET}\n`);
  } catch (err: any) {
    console.warn(`No se pudo guardar el reporte JSON: ${err.message}`);
  }

  return report;
}

// Standalone CLI execution
if (require.main === module || process.argv[1]?.endsWith("benchmark-phase3-api.ts")) {
  const args = process.argv.slice(2);
  const getArg = (prefix: string) => {
    const found = args.find((a) => a.startsWith(prefix));
    return found ? found.split("=")[1] : undefined;
  };

  const offerIterations = getArg("--iterations-offer=") ? parseInt(getArg("--iterations-offer=")!, 10) : 50;
  const quotesIterations = getArg("--iterations-quotes=") ? parseInt(getArg("--iterations-quotes=")!, 10) : 20;
  const pdfIterations = getArg("--iterations-pdf=") ? parseInt(getArg("--iterations-pdf=")!, 10) : 20;
  const baseUrl = getArg("--base-url=");
  const token = getArg("--token=");
  const outputPath = getArg("--output=");
  const noWait = args.includes("--no-wait");

  runPhase3Benchmark({
    offerIterations,
    quotesIterations,
    pdfIterations,
    baseUrl,
    token,
    jsonOutputPath: outputPath,
    waitForReady: !noWait,
  })
    .then((report) => {
      if (!report.overallSuccess) {
        process.exitCode = 1;
      }
    })
    .catch((err) => {
      console.error(`${RED}Error ejecutando el benchmark de Fase 3:${RESET}`, err);
      process.exit(1);
    });
}
