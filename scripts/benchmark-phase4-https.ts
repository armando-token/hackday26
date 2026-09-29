/**
 * M2M Performance & Latency Benchmark Suite over HTTPS (Phase 4)
 * Controlnautas × Meta Muse (Hack Day 2026)
 *
 * Requirements:
 * 1. Benchmark endpoints via public HTTPS ('https://data.controlnautas.com'):
 *    - GET /healthz (20 iterations)
 *    - GET /api/muse/v1/products/search?q=PLC (20 iterations)
 *    - GET /api/muse/v1/products/{variantId}/offer?quantity=1 (30 iterations)
 *    - POST /api/muse/v1/preliminary-quotes (15 iterations)
 *    - GET /api/muse/v1/quotes/{id}/pdf?token=... (15 iterations)
 * 2. Compute min, median (p50), mean, p95, p99 latencies.
 * 3. Save structured benchmark report to 'scripts/benchmark-phase4-https-report.json'.
 * 4. Confirm target thresholds:
 *    - offer p95 < 60ms
 *    - quote p95 < 600ms
 *    - pdf p95 < 120ms
 */

import fs from "fs";
import path from "path";
import os from "os";

// ANSI Terminal Colors
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
  targetMaxP95Ms?: number;
  p95TargetMet?: boolean;
  allTargetsMet: boolean;
  iterations: IterationResult[];
}

export interface BenchmarkPhase4HttpsReport {
  timestamp: string;
  host: string;
  baseUrl: string;
  protocol: "HTTPS";
  maskedToken: string;
  variantId: string;
  sku: string;
  targets: {
    offerP95Ms: number;
    quoteP95Ms: number;
    pdfP95Ms: number;
  };
  summary: {
    healthz: {
      repetitions: number;
      minMs: number;
      medianMs: number;
      meanMs: number;
      p95Ms: number;
      p99Ms: number;
      maxMs: number;
    };
    search: {
      repetitions: number;
      minMs: number;
      medianMs: number;
      meanMs: number;
      p95Ms: number;
      p99Ms: number;
      maxMs: number;
    };
    offer: {
      repetitions: number;
      minMs: number;
      medianMs: number;
      meanMs: number;
      p95Ms: number;
      p99Ms: number;
      maxMs: number;
      targetP95Ms: number;
      targetMet: boolean;
    };
    quote: {
      repetitions: number;
      minMs: number;
      medianMs: number;
      meanMs: number;
      p95Ms: number;
      p99Ms: number;
      maxMs: number;
      targetP95Ms: number;
      targetMet: boolean;
    };
    pdf: {
      repetitions: number;
      minMs: number;
      medianMs: number;
      meanMs: number;
      p95Ms: number;
      p99Ms: number;
      maxMs: number;
      targetP95Ms: number;
      targetMet: boolean;
    };
    allRequiredTargetsMet: boolean;
  };
  endpoints: EndpointStats[];
  overallSuccess: boolean;
}

/**
 * Calculates a given percentile (e.g. 50, 95, 99) using linear interpolation.
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
 * Masks a token for safe logging.
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

  // Default to public HTTPS endpoint
  const baseUrl = (process.env.BENCHMARK_BASE_URL || "https://data.controlnautas.com").replace(/\/+$/, "");

  // Token discovery
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

  // Variant discovery from manifest
  let variantId = "variant_01M3QBABE23B00D9EFMZBTEMWP";
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
      // keep fallback
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
 * Computes statistical distribution from iteration results.
 */
function computeStats(
  name: string,
  method: "GET" | "POST",
  url: string,
  iterationResults: IterationResult[],
  targetMaxP95Ms?: number
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

  const p95TargetMet = targetMaxP95Ms !== undefined
    ? p95Ms < targetMaxP95Ms && successfulRequests === iterationResults.length
    : successfulRequests === iterationResults.length;

  const allTargetsMet = p95TargetMet && successfulRequests === iterationResults.length;

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
    targetMaxP95Ms,
    p95TargetMet,
    allTargetsMet,
    iterations: iterationResults,
  };
}

export interface RunPhase4BenchmarkOptions {
  baseUrl?: string;
  token?: string;
  variantId?: string;
  healthzIterations?: number;
  searchIterations?: number;
  offerIterations?: number;
  quoteIterations?: number;
  pdfIterations?: number;
  warmupCount?: number;
  jsonOutputPath?: string;
}

/**
 * Main benchmark runner for Phase 4 (Public HTTPS)
 */
export async function runPhase4Benchmark(options?: RunPhase4BenchmarkOptions): Promise<BenchmarkPhase4HttpsReport> {
  const context = resolveContext();
  if (options?.baseUrl) context.baseUrl = options.baseUrl.replace(/\/+$/, "");
  if (options?.token) context.token = options.token;
  if (options?.variantId) context.variantId = options.variantId;

  const healthzIterations = options?.healthzIterations ?? 20;
  const searchIterations = options?.searchIterations ?? 20;
  const offerIterations = options?.offerIterations ?? 30;
  const quoteIterations = options?.quoteIterations ?? 15;
  const pdfIterations = options?.pdfIterations ?? 15;
  const warmupCount = options?.warmupCount ?? 3;

  console.log(`\n${BOLD}${CYAN}================================================================================${RESET}`);
  console.log(`${BOLD}${CYAN}   CONTROLNAUTAS × META MUSE — M2M HTTPS BENCHMARK SUITE (PHASE 4)               ${RESET}`);
  console.log(`${BOLD}${CYAN}================================================================================${RESET}`);
  console.log(`${BOLD}Timestamp:${RESET}          ${new Date().toISOString()}`);
  console.log(`${BOLD}Host:${RESET}               ${os.hostname()}`);
  console.log(`${BOLD}Base URL:${RESET}           ${context.baseUrl}`);
  console.log(`${BOLD}Bearer Token:${RESET}       ${maskToken(context.token)}`);
  console.log(`${BOLD}Target SKU:${RESET}         ${context.sku}`);
  console.log(`${BOLD}Target Variant:${RESET}     ${context.variantId}`);
  console.log(`${BOLD}Iterations:${RESET}         Healthz: ${healthzIterations}, Search: ${searchIterations}, Offer: ${offerIterations}, Quote: ${quoteIterations}, PDF: ${pdfIterations}`);
  console.log(`${BOLD}Target Thresholds:${RESET}  Offer p95 < 60 ms | Quote p95 < 600 ms | PDF p95 < 120 ms`);
  console.log(`${CYAN}--------------------------------------------------------------------------------${RESET}\n`);

  const endpointStatsList: EndpointStats[] = [];

  // ========================================================================
  // 1. BENCHMARK GET /healthz (20 iterations)
  // ========================================================================
  const healthzUrl = `${context.baseUrl}/healthz`;
  const healthzHeaders: Record<string, string> = { Accept: "application/json" };

  process.stdout.write(`[1/5] Benchmarking ${BOLD}GET /healthz${RESET} (${healthzIterations} reps) ... `);

  // Warmup
  for (let w = 0; w < warmupCount; w++) {
    await measureRequest(healthzUrl, "GET", healthzHeaders);
  }

  const healthzIterationResults: IterationResult[] = [];
  for (let i = 1; i <= healthzIterations; i++) {
    const res = await measureRequest(healthzUrl, "GET", healthzHeaders);
    const success = res.status === 200;
    healthzIterationResults.push({
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

  const healthzStats = computeStats(
    "GET /healthz",
    "GET",
    healthzUrl,
    healthzIterationResults
  );
  endpointStatsList.push(healthzStats);

  const healthzBadge = healthzStats.allTargetsMet ? `${GREEN}${BOLD}✓ PASS${RESET}` : `${RED}${BOLD}✗ FAIL${RESET}`;
  console.log(
    `${healthzBadge} (p50: ${healthzStats.medianMs}ms, p95: ${healthzStats.p95Ms}ms, p99: ${healthzStats.p99Ms}ms, mean: ${healthzStats.meanMs}ms, min: ${healthzStats.minMs}ms, max: ${healthzStats.maxMs}ms)`
  );

  // ========================================================================
  // 2. BENCHMARK GET /api/muse/v1/products/search?q=PLC (20 iterations)
  // ========================================================================
  const searchUrl = `${context.baseUrl}/api/muse/v1/products/search?q=PLC`;
  const authHeaders: Record<string, string> = {
    Accept: "application/json",
    Authorization: `Bearer ${context.token}`,
  };

  process.stdout.write(`[2/5] Benchmarking ${BOLD}GET /api/muse/v1/products/search?q=PLC${RESET} (${searchIterations} reps) ... `);

  // Warmup
  for (let w = 0; w < warmupCount; w++) {
    await measureRequest(searchUrl, "GET", authHeaders);
  }

  const searchIterationResults: IterationResult[] = [];
  for (let i = 1; i <= searchIterations; i++) {
    const res = await measureRequest(searchUrl, "GET", authHeaders);
    const success = res.status === 200;
    searchIterationResults.push({
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

  const searchStats = computeStats(
    "GET /api/muse/v1/products/search?q=PLC",
    "GET",
    searchUrl,
    searchIterationResults
  );
  endpointStatsList.push(searchStats);

  const searchBadge = searchStats.allTargetsMet ? `${GREEN}${BOLD}✓ PASS${RESET}` : `${RED}${BOLD}✗ FAIL${RESET}`;
  console.log(
    `${searchBadge} (p50: ${searchStats.medianMs}ms, p95: ${searchStats.p95Ms}ms, p99: ${searchStats.p99Ms}ms, mean: ${searchStats.meanMs}ms, min: ${searchStats.minMs}ms, max: ${searchStats.maxMs}ms)`
  );

  // ========================================================================
  // 3. BENCHMARK GET /api/muse/v1/products/{variantId}/offer?quantity=1 (30 iterations)
  // Target: p95 < 60ms
  // ========================================================================
  const offerUrl = `${context.baseUrl}/api/muse/v1/products/${context.variantId}/offer?quantity=1`;

  process.stdout.write(`[3/5] Benchmarking ${BOLD}GET /api/muse/v1/products/{variantId}/offer?quantity=1${RESET} (${offerIterations} reps) ... `);

  // Warmup
  for (let w = 0; w < warmupCount; w++) {
    await measureRequest(offerUrl, "GET", authHeaders);
  }

  const offerIterationResults: IterationResult[] = [];
  for (let i = 1; i <= offerIterations; i++) {
    const res = await measureRequest(offerUrl, "GET", authHeaders);
    const success = res.status === 200;
    offerIterationResults.push({
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

  const offerStats = computeStats(
    "GET /api/muse/v1/products/{variantId}/offer?quantity=1",
    "GET",
    offerUrl,
    offerIterationResults,
    60 // target p95 < 60ms
  );
  endpointStatsList.push(offerStats);

  const offerBadge = offerStats.allTargetsMet ? `${GREEN}${BOLD}✓ PASS${RESET}` : `${RED}${BOLD}✗ FAIL${RESET}`;
  console.log(
    `${offerBadge} (p50: ${offerStats.medianMs}ms, p95: ${offerStats.p95Ms}ms, p99: ${offerStats.p99Ms}ms, mean: ${offerStats.meanMs}ms, min: ${offerStats.minMs}ms, max: ${offerStats.maxMs}ms)`
  );

  // ========================================================================
  // 4. BENCHMARK POST /api/muse/v1/preliminary-quotes (15 iterations)
  // Target: p95 < 600ms
  // ========================================================================
  const quotesUrl = `${context.baseUrl}/api/muse/v1/preliminary-quotes`;
  const quotesHeaders: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
    Authorization: `Bearer ${context.token}`,
  };

  process.stdout.write(`[4/5] Benchmarking ${BOLD}POST /api/muse/v1/preliminary-quotes${RESET} (${quoteIterations} reps) ... `);

  // Warmup
  for (let w = 0; w < warmupCount; w++) {
    const warmupBody = JSON.stringify({
      variant_id: context.variantId,
      quantity: 1,
      idempotency_key: `warmup-p4-${Date.now()}-${w}`,
    });
    await measureRequest(quotesUrl, "POST", quotesHeaders, warmupBody);
  }

  let capturedPdfUrl: string | undefined;
  let capturedQuoteId: string | undefined;
  let capturedDownloadToken: string | undefined;

  const quoteIterationResults: IterationResult[] = [];
  for (let i = 1; i <= quoteIterations; i++) {
    const idempotencyKey = `bench-p4-quote-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 8)}`;
    const reqBody = JSON.stringify({
      variant_id: context.variantId,
      quantity: 1,
      idempotency_key: idempotencyKey,
    });

    const res = await measureRequest(quotesUrl, "POST", quotesHeaders, reqBody);
    const success = res.status === 201 || res.status === 200;

    if (success && !capturedPdfUrl && res.rawText) {
      try {
        const parsed = JSON.parse(res.rawText);
        if (parsed.pdf_url) capturedPdfUrl = parsed.pdf_url;
        if (parsed.quote_id) capturedQuoteId = parsed.quote_id;
        if (parsed.opaque_public_id) capturedQuoteId = parsed.opaque_public_id;
        if (parsed.download_token) capturedDownloadToken = parsed.download_token;
      } catch {
        // ignore
      }
    }

    quoteIterationResults.push({
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

    await new Promise((r) => setTimeout(r, 15));
  }

  const quotesStats = computeStats(
    "POST /api/muse/v1/preliminary-quotes",
    "POST",
    quotesUrl,
    quoteIterationResults,
    600 // target p95 < 600ms
  );
  endpointStatsList.push(quotesStats);

  const quotesBadge = quotesStats.allTargetsMet ? `${GREEN}${BOLD}✓ PASS${RESET}` : `${RED}${BOLD}✗ FAIL${RESET}`;
  console.log(
    `${quotesBadge} (p50: ${quotesStats.medianMs}ms, p95: ${quotesStats.p95Ms}ms, p99: ${quotesStats.p99Ms}ms, mean: ${quotesStats.meanMs}ms, min: ${quotesStats.minMs}ms, max: ${quotesStats.maxMs}ms)`
  );

  // ========================================================================
  // 5. BENCHMARK GET /api/muse/v1/quotes/{id}/pdf?token=... (15 iterations)
  // Target: p95 < 120ms
  // ========================================================================
  let pdfDownloadUrl = "";
  if (capturedPdfUrl) {
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
    // If no quote created, make a dedicated one
    console.log(`\n${YELLOW}Generating dedicated quote for PDF benchmark...${RESET}`);
    const res = await measureRequest(
      quotesUrl,
      "POST",
      quotesHeaders,
      JSON.stringify({
        variant_id: context.variantId,
        quantity: 1,
        idempotency_key: `pdf-prep-${Date.now()}`,
      })
    );
    const parsed = JSON.parse(res.rawText);
    const u = new URL(parsed.pdf_url);
    pdfDownloadUrl = `${context.baseUrl}${u.pathname}${u.search}`;
  }

  process.stdout.write(`[5/5] Benchmarking ${BOLD}GET /api/muse/v1/quotes/{id}/pdf?token=...${RESET} (${pdfIterations} reps) ... `);

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
    "GET /api/muse/v1/quotes/{id}/pdf?token=...",
    "GET",
    pdfDownloadUrl,
    pdfIterationResults,
    120 // target p95 < 120ms
  );
  endpointStatsList.push(pdfStats);

  const pdfBadge = pdfStats.allTargetsMet ? `${GREEN}${BOLD}✓ PASS${RESET}` : `${RED}${BOLD}✗ FAIL${RESET}`;
  console.log(
    `${pdfBadge} (p50: ${pdfStats.medianMs}ms, p95: ${pdfStats.p95Ms}ms, p99: ${pdfStats.p99Ms}ms, mean: ${pdfStats.meanMs}ms, min: ${pdfStats.minMs}ms, max: ${pdfStats.maxMs}ms)`
  );

  // ========================================================================
  // EXECUTIVE SUMMARY TABLE
  // ========================================================================
  console.log(`\n${BOLD}${MAGENTA}================== RESUMEN EJECUTIVO DE LATENCIA M2M HTTPS (FASE 4) ==================${RESET}\n`);
  console.log(
    `${BOLD}${"Endpoint".padEnd(52)} ${"Reps".padStart(5)} ${"p50".padStart(9)} ${"p95".padStart(9)} ${"p99".padStart(9)} ${"Mean".padStart(9)} ${"Target p95".padStart(12)} ${"Status".padStart(8)}${RESET}`
  );
  console.log("-".repeat(118));

  let allRequiredTargetsMet = true;
  for (const s of endpointStatsList) {
    if (!s.allTargetsMet) {
      allRequiredTargetsMet = false;
    }
    const statusLabel = s.allTargetsMet ? `${GREEN}PASS${RESET}` : `${RED}FAIL${RESET}`;
    const targetLabel = s.targetMaxP95Ms ? `< ${s.targetMaxP95Ms}ms` : "N/A";

    console.log(
      `${s.name.padEnd(52)} ` +
      `${String(s.repetitions).padStart(5)} ` +
      `${`${s.medianMs} ms`.padStart(9)} ` +
      `${`${s.p95Ms} ms`.padStart(9)} ` +
      `${`${s.p99Ms} ms`.padStart(9)} ` +
      `${`${s.meanMs} ms`.padStart(9)} ` +
      `${targetLabel.padStart(12)} ` +
      `${statusLabel.padStart(8 + (s.allTargetsMet ? GREEN.length + RESET.length : RED.length + RESET.length))}`
    );
  }
  console.log("-".repeat(118));

  // SLA Verification Details
  console.log(`\n${BOLD}${CYAN}=== VALIDACIÓN FORMAL DE UMBRALES OBJETIVO (FASE 4) ===${RESET}`);
  console.log(
    `1. Offer p95 < 60 ms:    ${
      offerStats.p95Ms < 60
        ? `${GREEN}${BOLD}✓ CUMPLIDO (${offerStats.p95Ms} ms < 60 ms)${RESET}`
        : `${RED}${BOLD}✗ NO CUMPLIDO (${offerStats.p95Ms} ms >= 60 ms)${RESET}`
    }`
  );
  console.log(
    `2. Quote p95 < 600 ms:   ${
      quotesStats.p95Ms < 600
        ? `${GREEN}${BOLD}✓ CUMPLIDO (${quotesStats.p95Ms} ms < 600 ms)${RESET}`
        : `${RED}${BOLD}✗ NO CUMPLIDO (${quotesStats.p95Ms} ms >= 600 ms)${RESET}`
    }`
  );
  console.log(
    `3. PDF p95 < 120 ms:     ${
      pdfStats.p95Ms < 120
        ? `${GREEN}${BOLD}✓ CUMPLIDO (${pdfStats.p95Ms} ms < 120 ms)${RESET}`
        : `${RED}${BOLD}✗ NO CUMPLIDO (${pdfStats.p95Ms} ms >= 120 ms)${RESET}`
    }`
  );

  console.log(`\n${BOLD}${CYAN}================================================================================${RESET}`);
  if (allRequiredTargetsMet) {
    console.log(`${GREEN}${BOLD}✓ VEREDICTO FINAL: 100% DE LOS OBJETIVOS DE LATENCIA M2M HTTPS SUPERADOS EXITOSAMENTE${RESET}`);
  } else {
    console.log(`${RED}${BOLD}✗ VEREDICTO FINAL: AL MENOS UN ENDPOINT NO CUMPLIÓ CON EL SLA DE LATENCIA${RESET}`);
  }
  console.log(`${BOLD}${CYAN}================================================================================${RESET}\n`);

  const report: BenchmarkPhase4HttpsReport = {
    timestamp: new Date().toISOString(),
    host: os.hostname(),
    baseUrl: context.baseUrl,
    protocol: "HTTPS",
    maskedToken: maskToken(context.token),
    variantId: context.variantId,
    sku: context.sku,
    targets: {
      offerP95Ms: 60,
      quoteP95Ms: 600,
      pdfP95Ms: 120,
    },
    summary: {
      healthz: {
        repetitions: healthzStats.repetitions,
        minMs: healthzStats.minMs,
        medianMs: healthzStats.medianMs,
        meanMs: healthzStats.meanMs,
        p95Ms: healthzStats.p95Ms,
        p99Ms: healthzStats.p99Ms,
        maxMs: healthzStats.maxMs,
      },
      search: {
        repetitions: searchStats.repetitions,
        minMs: searchStats.minMs,
        medianMs: searchStats.medianMs,
        meanMs: searchStats.meanMs,
        p95Ms: searchStats.p95Ms,
        p99Ms: searchStats.p99Ms,
        maxMs: searchStats.maxMs,
      },
      offer: {
        repetitions: offerStats.repetitions,
        minMs: offerStats.minMs,
        medianMs: offerStats.medianMs,
        meanMs: offerStats.meanMs,
        p95Ms: offerStats.p95Ms,
        p99Ms: offerStats.p99Ms,
        maxMs: offerStats.maxMs,
        targetP95Ms: 60,
        targetMet: offerStats.p95TargetMet ?? false,
      },
      quote: {
        repetitions: quotesStats.repetitions,
        minMs: quotesStats.minMs,
        medianMs: quotesStats.medianMs,
        meanMs: quotesStats.meanMs,
        p95Ms: quotesStats.p95Ms,
        p99Ms: quotesStats.p99Ms,
        maxMs: quotesStats.maxMs,
        targetP95Ms: 600,
        targetMet: quotesStats.p95TargetMet ?? false,
      },
      pdf: {
        repetitions: pdfStats.repetitions,
        minMs: pdfStats.minMs,
        medianMs: pdfStats.medianMs,
        meanMs: pdfStats.meanMs,
        p95Ms: pdfStats.p95Ms,
        p99Ms: pdfStats.p99Ms,
        maxMs: pdfStats.maxMs,
        targetP95Ms: 120,
        targetMet: pdfStats.p95TargetMet ?? false,
      },
      allRequiredTargetsMet,
    },
    endpoints: endpointStatsList,
    overallSuccess: allRequiredTargetsMet,
  };

  const outputPath =
    options?.jsonOutputPath ||
    path.join(path.resolve(__dirname, ".."), "scripts", "benchmark-phase4-https-report.json");

  try {
    fs.writeFileSync(outputPath, JSON.stringify(report, null, 2), "utf8");
    console.log(`${GRAY}Reporte JSON guardado en: ${outputPath}${RESET}\n`);
  } catch (err: any) {
    console.warn(`No se pudo guardar el reporte JSON: ${err.message}`);
  }

  return report;
}

// Standalone CLI execution
if (require.main === module || process.argv[1]?.endsWith("benchmark-phase4-https.ts")) {
  const args = process.argv.slice(2);
  const getArg = (prefix: string) => {
    const found = args.find((a) => a.startsWith(prefix));
    return found ? found.split("=")[1] : undefined;
  };

  const healthzIterations = getArg("--iterations-healthz=") ? parseInt(getArg("--iterations-healthz=")!, 10) : 20;
  const searchIterations = getArg("--iterations-search=") ? parseInt(getArg("--iterations-search=")!, 10) : 20;
  const offerIterations = getArg("--iterations-offer=") ? parseInt(getArg("--iterations-offer=")!, 10) : 30;
  const quoteIterations = getArg("--iterations-quote=") ? parseInt(getArg("--iterations-quote=")!, 10) : 15;
  const pdfIterations = getArg("--iterations-pdf=") ? parseInt(getArg("--iterations-pdf=")!, 10) : 15;
  const baseUrl = getArg("--base-url=");
  const token = getArg("--token=");
  const outputPath = getArg("--output=");

  runPhase4Benchmark({
    healthzIterations,
    searchIterations,
    offerIterations,
    quoteIterations,
    pdfIterations,
    baseUrl,
    token,
    jsonOutputPath: outputPath,
  })
    .then((report) => {
      if (!report.overallSuccess) {
        process.exitCode = 1;
      }
    })
    .catch((err) => {
      console.error(`${RED}Error ejecutando el benchmark de Fase 4 HTTPS:${RESET}`, err);
      process.exit(1);
    });
}
