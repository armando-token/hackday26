/**
 * Latency Benchmark and Profiling Suite for /api/muse/v1
 * Controlnautas × Meta Muse (Hack Day 2026)
 *
 * Objectives:
 * 1. Measure latency of:
 *    - GET /healthz (target: < 20 ms)
 *    - GET /api/muse/v1/products/search?q=din (target: < 50 ms)
 *    - GET /api/muse/v1/products/{variantId} (target: < 50 ms)
 *    - POST /api/muse/v1/evaluate (target: < 50 ms)
 * 2. Execute 10 repetitions per endpoint.
 * 3. Output comprehensive report with Min, Mean, Max, and p95 latency.
 */

import fs from "fs";
import path from "path";

// ANSI Styling
const RESET = "\x1b[0m";
const BOLD = "\x1b[1m";
const GREEN = "\x1b[32m";
const RED = "\x1b[31m";
const YELLOW = "\x1b[33m";
const CYAN = "\x1b[36m";
const MAGENTA = "\x1b[35m";
const GRAY = "\x1b[90m";

interface EndpointBenchmarkConfig {
  name: string;
  method: "GET" | "POST";
  pathTemplate: string;
  targetMaxMeanMs: number;
  targetMaxP95Ms: number;
  authRequired: boolean;
  getBody?: (context: BenchmarkContext) => any;
}

interface BenchmarkContext {
  baseUrl: string;
  token: string;
  variantId: string;
  sku: string;
}

interface IterationResult {
  iteration: number;
  status: number;
  latencyMs: number;
  bodySnippet: string;
  requestId?: string;
  success: boolean;
  error?: string;
}

interface EndpointStats {
  name: string;
  method: string;
  url: string;
  repetitions: number;
  successfulRequests: number;
  failedRequests: number;
  minMs: number;
  meanMs: number;
  medianMs: number;
  maxMs: number;
  p95Ms: number;
  stdDevMs: number;
  targetMeanMs: number;
  targetP95Ms: number;
  meanTargetMet: boolean;
  p95TargetMet: boolean;
  allTargetsMet: boolean;
  iterations: IterationResult[];
}

export interface BenchmarkReport {
  timestamp: string;
  host: string;
  baseUrl: string;
  maskedToken: string;
  variantId: string;
  sku: string;
  totalIterationsPerEndpoint: number;
  endpoints: EndpointStats[];
  overallSuccess: boolean;
}

/**
 * Calculates a given percentile (e.g. 95) from a sorted list of numbers.
 */
function calculatePercentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  if (sorted.length === 1) return sorted[0];
  const index = (p / 100) * (sorted.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const weight = index - lower;
  return sorted[lower] * (1 - weight) + sorted[upper] * weight;
}

/**
 * Masks a token for safe display (e.g. mus_3f...0965).
 */
function maskToken(token: string): string {
  if (!token || token.length <= 8) return "****";
  return `${token.slice(0, 6)}...${token.slice(-4)}`;
}

/**
 * Resolves context: Base URL, Token, and Demo Variant ID.
 */
function resolveContext(): BenchmarkContext {
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
  let variantId = "variant_01M3Q80TB1MN6861FT63TR6BTP"; // Fallback demo PLC
  let sku = "CN-X5PRIME-HE-XP5";
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
 * Endpoint configurations to benchmark
 */
const ENDPOINTS_TO_BENCHMARK: EndpointBenchmarkConfig[] = [
  {
    name: "GET /healthz",
    method: "GET",
    pathTemplate: "/healthz",
    targetMaxMeanMs: 20,
    targetMaxP95Ms: 20,
    authRequired: false,
  },
  {
    name: "GET /api/muse/v1/products/search?q=din",
    method: "GET",
    pathTemplate: "/api/muse/v1/products/search?q=din",
    targetMaxMeanMs: 50,
    targetMaxP95Ms: 50,
    authRequired: true,
  },
  {
    name: "GET /api/muse/v1/products/{variantId}",
    method: "GET",
    pathTemplate: "/api/muse/v1/products/{variantId}",
    targetMaxMeanMs: 50,
    targetMaxP95Ms: 50,
    authRequired: true,
  },
  {
    name: "POST /api/muse/v1/evaluate",
    method: "POST",
    pathTemplate: "/api/muse/v1/evaluate",
    targetMaxMeanMs: 50,
    targetMaxP95Ms: 50,
    authRequired: true,
    getBody: (ctx) => ({
      variant_id: ctx.variantId,
      requirements: [
        {
          id: "r1",
          property: "mounting",
          operator: "equals",
          value: "din_35mm",
        },
        {
          id: "r2",
          property: "analog_input",
          operator: "range_contains",
          min: 4,
          max: 20,
          unit: "mA",
          channels_at_least: 2,
        },
        {
          id: "r3",
          property: "protocol",
          operator: "equals",
          value: "modbus_rtu",
        },
      ],
    }),
  },
];

/**
 * Executes a single HTTP request with high-resolution timing.
 */
async function measureRequest(
  url: string,
  method: "GET" | "POST",
  headers: Record<string, string>,
  body?: string
): Promise<{ status: number; latencyMs: number; bodySnippet: string; requestId?: string }> {
  const start = process.hrtime.bigint();
  let status = 0;
  let bodySnippet = "";
  let requestId: string | undefined;

  try {
    const response = await fetch(url, {
      method,
      headers,
      body: method === "POST" ? body : undefined,
    });
    status = response.status;
    requestId = response.headers.get("x-request-id") || undefined;
    const text = await response.text();
    bodySnippet = text.slice(0, 120).replace(/\s+/g, " ");
  } catch (err: any) {
    status = 0;
    bodySnippet = `ERR: ${err.message || String(err)}`;
  }

  const end = process.hrtime.bigint();
  const latencyMs = Number(end - start) / 1_000_000;

  return { status, latencyMs, bodySnippet, requestId };
}

/**
 * Runs the benchmark for a single endpoint.
 */
async function benchmarkEndpoint(
  config: EndpointBenchmarkConfig,
  context: BenchmarkContext,
  iterationsCount = 10,
  warmupCount = 1
): Promise<EndpointStats> {
  const resolvedPath = config.pathTemplate.replace("{variantId}", context.variantId);
  const fullUrl = `${context.baseUrl}${resolvedPath}`;

  const headers: Record<string, string> = {
    Accept: "application/json",
  };
  if (config.authRequired && context.token) {
    headers["Authorization"] = `Bearer ${context.token}`;
  }
  if (config.method === "POST") {
    headers["Content-Type"] = "application/json";
  }

  const bodyString = config.getBody ? JSON.stringify(config.getBody(context)) : undefined;

  // Warmup requests (not included in statistical sample)
  for (let w = 0; w < warmupCount; w++) {
    await measureRequest(fullUrl, config.method, headers, bodyString);
  }

  const iterationResults: IterationResult[] = [];
  const latencies: number[] = [];

  for (let i = 1; i <= iterationsCount; i++) {
    const res = await measureRequest(fullUrl, config.method, headers, bodyString);
    const success = res.status === 200;

    iterationResults.push({
      iteration: i,
      status: res.status,
      latencyMs: res.latencyMs,
      bodySnippet: res.bodySnippet,
      requestId: res.requestId,
      success,
    });

    latencies.push(res.latencyMs);
    // Slight jitter to prevent TCP socket starvation while maintaining realism
    await new Promise((r) => setTimeout(r, 10));
  }

  // Statistical calculations
  const sortedLatencies = [...latencies].sort((a, b) => a - b);
  const minMs = sortedLatencies[0] || 0;
  const maxMs = sortedLatencies[sortedLatencies.length - 1] || 0;
  const sumMs = sortedLatencies.reduce((acc, v) => acc + v, 0);
  const meanMs = sumMs / (sortedLatencies.length || 1);
  const medianMs = sortedLatencies[Math.floor(sortedLatencies.length * 0.5)] || 0;
  const p95Ms = calculatePercentile(sortedLatencies, 95);

  const variance =
    sortedLatencies.reduce((acc, v) => acc + Math.pow(v - meanMs, 2), 0) /
    (sortedLatencies.length || 1);
  const stdDevMs = Math.sqrt(variance);

  const successfulRequests = iterationResults.filter((r) => r.success).length;
  const failedRequests = iterationResults.length - successfulRequests;

  const meanTargetMet = meanMs < config.targetMaxMeanMs && successfulRequests === iterationsCount;
  const p95TargetMet = p95Ms < config.targetMaxP95Ms && successfulRequests === iterationsCount;
  const allTargetsMet = meanTargetMet && p95TargetMet;

  return {
    name: config.name,
    method: config.method,
    url: fullUrl,
    repetitions: iterationsCount,
    successfulRequests,
    failedRequests,
    minMs: Number(minMs.toFixed(2)),
    meanMs: Number(meanMs.toFixed(2)),
    medianMs: Number(medianMs.toFixed(2)),
    maxMs: Number(maxMs.toFixed(2)),
    p95Ms: Number(p95Ms.toFixed(2)),
    stdDevMs: Number(stdDevMs.toFixed(2)),
    targetMeanMs: config.targetMaxMeanMs,
    targetP95Ms: config.targetMaxP95Ms,
    meanTargetMet,
    p95TargetMet,
    allTargetsMet,
    iterations: iterationResults,
  };
}

/**
 * Main execution function
 */
export async function runBenchmark(options?: {
  baseUrl?: string;
  token?: string;
  variantId?: string;
  iterations?: number;
  jsonOutputPath?: string;
}): Promise<BenchmarkReport> {
  const context = resolveContext();
  if (options?.baseUrl) context.baseUrl = options.baseUrl;
  if (options?.token) context.token = options.token;
  if (options?.variantId) context.variantId = options.variantId;

  const iterations = options?.iterations || 10;

  console.log(`\n${BOLD}${CYAN}================================================================${RESET}`);
  console.log(`${BOLD}${CYAN}   CONTROLNAUTAS × META MUSE — API LATENCY BENCHMARK SUITE       ${RESET}`);
  console.log(`${BOLD}${CYAN}================================================================${RESET}`);
  console.log(`${BOLD}Timestamp:${RESET}      ${new Date().toISOString()}`);
  console.log(`${BOLD}Base URL:${RESET}       ${context.baseUrl}`);
  console.log(`${BOLD}Bearer Token:${RESET}   ${maskToken(context.token)}`);
  console.log(`${BOLD}Target SKU:${RESET}     ${context.sku}`);
  console.log(`${BOLD}Target Variant:${RESET} ${context.variantId}`);
  console.log(`${BOLD}Repetitions:${RESET}    ${iterations} per endpoint`);
  console.log(`${CYAN}----------------------------------------------------------------${RESET}\n`);

  const endpointStatsList: EndpointStats[] = [];

  for (const config of ENDPOINTS_TO_BENCHMARK) {
    process.stdout.write(`Benchmarking ${BOLD}${config.name}${RESET} ... `);
    const stats = await benchmarkEndpoint(config, context, iterations, 1);
    endpointStatsList.push(stats);

    const statusBadge = stats.allTargetsMet
      ? `${GREEN}${BOLD}✓ PASS${RESET}`
      : `${RED}${BOLD}✗ FAIL${RESET}`;
    console.log(
      `${statusBadge} (mean: ${stats.meanMs}ms, p95: ${stats.p95Ms}ms, min: ${stats.minMs}ms, max: ${stats.maxMs}ms)`
    );
  }

  // Summary Table
  console.log(`\n${BOLD}${MAGENTA}=== RESUMEN EJECUTIVO DE RENDIMIENTO Y LATENCIA ===${RESET}\n`);
  console.log(
    `${BOLD}${"Endpoint".padEnd(42)} ${"Reps".padStart(5)} ${"Min".padStart(8)} ${"Mean".padStart(8)} ${"p95".padStart(8)} ${"Max".padStart(8)} ${"Target".padStart(9)} ${"Status".padStart(8)}${RESET}`
  );
  console.log("-".repeat(102));

  let allOverallTargetsMet = true;

  for (const s of endpointStatsList) {
    if (!s.allTargetsMet) {
      allOverallTargetsMet = false;
    }

    const statusLabel = s.allTargetsMet ? `${GREEN}PASS${RESET}` : `${RED}FAIL${RESET}`;
    const targetLabel = `< ${s.targetMeanMs}ms`;

    console.log(
      `${s.name.padEnd(42)} ` +
      `${String(s.repetitions).padStart(5)} ` +
      `${`${s.minMs} ms`.padStart(8)} ` +
      `${`${s.meanMs} ms`.padStart(8)} ` +
      `${`${s.p95Ms} ms`.padStart(8)} ` +
      `${`${s.maxMs} ms`.padStart(8)} ` +
      `${targetLabel.padStart(9)} ` +
      `${statusLabel.padStart(8 + (s.allTargetsMet ? GREEN.length + RESET.length : RED.length + RESET.length))}`
    );
  }

  console.log("-".repeat(102));

  // Iteration details table
  console.log(`\n${BOLD}${CYAN}=== DESGLOSE DETALLADO DE ITERACIONES (1..${iterations}) ===${RESET}`);
  for (const s of endpointStatsList) {
    console.log(`\n${BOLD}Endpoint: ${s.name}${RESET} (${s.url})`);
    console.log(`  Repeticiones: ${s.successfulRequests}/${s.repetitions} exitosas (HTTP 200)`);
    const latenciesStr = s.iterations
      .map((it) => `${it.latencyMs.toFixed(1)}ms (${it.status})`)
      .join(", ");
    console.log(`  Muestras: [ ${latenciesStr} ]`);
    console.log(
      `  Métrica: Mín = ${s.minMs} ms | Media = ${s.meanMs} ms | Mediana = ${s.medianMs} ms | p95 = ${s.p95Ms} ms | Máx = ${s.maxMs} ms | Desv = ${s.stdDevMs} ms`
    );
  }

  console.log(`\n${BOLD}${CYAN}================================================================${RESET}`);
  if (allOverallTargetsMet) {
    console.log(
      `${GREEN}${BOLD}✓ VEREDICTO FINAL: 100% DE LOS OBJETIVOS DE LATENCIA SUPERADOS (< 20ms / < 50ms)${RESET}`
    );
  } else {
    console.log(
      `${RED}${BOLD}✗ VEREDICTO FINAL: AL MENOS UN ENDPOINT NO CUMPLIÓ LOS CRITERIOS DE LATENCIA${RESET}`
    );
  }
  console.log(`${BOLD}${CYAN}================================================================${RESET}\n`);

  const report: BenchmarkReport = {
    timestamp: new Date().toISOString(),
    host: require("os").hostname(),
    baseUrl: context.baseUrl,
    maskedToken: maskToken(context.token),
    variantId: context.variantId,
    sku: context.sku,
    totalIterationsPerEndpoint: iterations,
    endpoints: endpointStatsList,
    overallSuccess: allOverallTargetsMet,
  };

  const outputPath =
    options?.jsonOutputPath ||
    path.join(path.resolve(__dirname, ".."), "scripts", "benchmark-muse-report.json");

  try {
    fs.writeFileSync(outputPath, JSON.stringify(report, null, 2), "utf8");
    console.log(`${GRAY}Reporte JSON exportado en: ${outputPath}${RESET}\n`);
  } catch (err: any) {
    console.warn(`No se pudo guardar el reporte JSON: ${err.message}`);
  }

  return report;
}

// Standalone execution entrypoint
if (require.main === module || process.argv[1]?.endsWith("benchmark-muse-api.ts")) {
  const args = process.argv.slice(2);
  const iterationsArg = args.find((a) => a.startsWith("--iterations="));
  const iterations = iterationsArg ? parseInt(iterationsArg.split("=")[1], 10) : 10;

  runBenchmark({ iterations })
    .then((report) => {
      if (!report.overallSuccess) {
        process.exitCode = 1;
      }
    })
    .catch((err) => {
      console.error(`${RED}Error ejecutando el benchmark:${RESET}`, err);
      process.exit(1);
    });
}
