import { randomUUID } from "crypto"
import type {
  MedusaRequest,
  MedusaResponse,
  MedusaNextFunction,
} from "@medusajs/framework/http"

/**
 * Supported structured log levels for Muse Agent Commerce API.
 */
export type MuseLogLevel = "info" | "warn" | "error"

/**
 * Strict structured log schema required for /api/muse/v1 observability.
 */
export interface MuseLogEntry {
  readonly timestamp: string
  readonly level: MuseLogLevel
  readonly request_id: string
  readonly method: string
  readonly path: string
  readonly status: number
  readonly duration_ms: number
  readonly details: Record<string, unknown>
}

/**
 * Input parameters accepted when logging an event.
 */
export interface MuseLogInput {
  timestamp?: string
  level?: MuseLogLevel
  request_id?: string
  method?: string
  path?: string
  status?: number
  duration_ms?: number
  details?: Record<string, unknown>
}

export type MuseLogSink = (entry: MuseLogEntry, rawJson: string) => void

export interface MuseMiddlewareOptions {
  includeHeaders?: boolean
  includeQuery?: boolean
  customDetailsExtractor?: (
    req: MedusaRequest,
    res: MedusaResponse
  ) => Record<string, unknown>
}

export type MuseRouteHandler = (
  req: MedusaRequest,
  res: MedusaResponse,
  next?: MedusaNextFunction
) => Promise<any> | any

// ============================================================================
// Privacy, Sanitization & PII Redaction Rules
// ============================================================================

/**
 * Sensitive field patterns covering authentication tokens, session cookies,
 * user credentials, and personally identifiable information (PII).
 */
const SENSITIVE_KEY_PATTERNS: readonly RegExp[] = [
  // Authentication & Secrets
  /^auth(orization)?$/i,
  /^proxy-auth(orization)?$/i,
  /^token$/i,
  /^access[-_]?token$/i,
  /^refresh[-_]?token$/i,
  /^id[-_]?token$/i,
  /^bearer$/i,
  /^api[-_]?key$/i,
  /^x[-_]api[-_]?key$/i,
  /^x[-_]muse[-_]?token$/i,
  /^x[-_]muse[-_]?key$/i,
  /^x[-_]auth[-_]?token$/i,
  /^secret$/i,
  /^secret[-_]?key$/i,
  /^private[-_]?key$/i,
  /^password$/i,
  /^passwd$/i,
  /^pwd$/i,
  /^client[-_]?secret$/i,

  // Sessions & Cookies
  /^cookie$/i,
  /^set-cookie$/i,
  /^session$/i,
  /^session[-_]?id$/i,
  /^sessionid$/i,
  /^sid$/i,
  /^connect\.sid$/i,
  /^jwt$/i,

  // Personal Identifiable Information (PII)
  /^email$/i,
  /^e-mail$/i,
  /^mail$/i,
  /^phone$/i,
  /^telephone$/i,
  /^tel$/i,
  /^mobile$/i,
  /^cellphone$/i,
  /^address$/i,
  /^street$/i,
  /^postal[-_]?code$/i,
  /^zip[-_]?code$/i,
  /^dni$/i,
  /^ruc$/i,
  /^ssn$/i,
  /^passport$/i,
  /^first[-_]?name$/i,
  /^last[-_]?name$/i,
  /^full[-_]?name$/i,
  /^user[-_]?name$/i,
  /^username$/i,
  /^credit[-_]?card$/i,
  /^card[-_]?number$/i,
  /^cvv$/i,
  /^cvc$/i,
  /^billing[-_]?address$/i,
  /^shipping[-_]?address$/i,
]

/**
 * Safe headers allowed in details.headers (all others are inspected or redacted).
 */
const SAFE_HEADER_WHITELIST: ReadonlySet<string> = new Set([
  "accept",
  "accept-encoding",
  "accept-language",
  "content-type",
  "content-length",
  "host",
  "user-agent",
  "x-request-id",
  "x-correlation-id",
  "x-forwarded-proto",
])

/**
 * Check whether an object key represents sensitive data (Auth, Session or PII).
 */
export function isSensitiveKey(key: string): boolean {
  if (!key || typeof key !== "string") return false
  const trimmed = key.trim()
  return SENSITIVE_KEY_PATTERNS.some((pattern) => pattern.test(trimmed))
}

/**
 * Redact sensitive strings including Bearer tokens, basic auth, JWTs,
 * Muse tokens, query parameter tokens, emails, and credit cards.
 */
export function sanitizeString(val: string): string {
  if (!val || typeof val !== "string") return val

  return val
    // Redact Bearer tokens completely (NEVER print Bearer token)
    .replace(/\bBearer\s+[A-Za-z0-9\-_.~+/]+=*/gi, "Bearer [REDACTED]")
    // Redact Basic auth credentials
    .replace(/\bBasic\s+[A-Za-z0-9+/=]+/gi, "Basic [REDACTED]")
    // Redact Meta Muse API tokens (mus_...)
    .replace(/\bmus_[a-zA-Z0-9_-]{8,}\b/g, "[REDACTED_TOKEN]")
    // Redact JSON Web Tokens (JWT)
    .replace(
      /\beyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}\b/g,
      "[REDACTED_JWT]"
    )
    // Redact sensitive query parameters in URLs
    .replace(
      /([?&](?:token|access_token|api_key|apikey|secret|password|auth|email|session|sid)=)([^&#\s]*)/gi,
      "$1[REDACTED]"
    )
    // Redact emails (PII)
    .replace(
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g,
      "[REDACTED_EMAIL]"
    )
    // Redact credit card numbers (13 to 19 digits)
    .replace(/\b(?:\d{4}[ -]?){3}\d{1,4}\b/g, "[REDACTED_CARD]")
}

/**
 * Sanitize URL paths to ensure query tokens or sensitive identifiers are redacted.
 */
export function sanitizeUrlPath(urlPath: string): string {
  if (!urlPath || typeof urlPath !== "string") return "/api/muse/v1"
  return sanitizeString(urlPath.trim())
}

/**
 * Deep recursive sanitizer that scrubs sensitive keys, redacts tokens/PII,
 * handles circular structures, errors, buffers, and non-serializable objects.
 */
export function sanitizeData(
  data: unknown,
  maxDepth = 8,
  seen = new WeakSet<object>()
): unknown {
  if (data === null || data === undefined) {
    return data
  }

  if (typeof data === "string") {
    return sanitizeString(data)
  }

  if (typeof data === "number" || typeof data === "boolean") {
    return data
  }

  if (typeof data === "bigint") {
    return data.toString()
  }

  if (typeof data === "function") {
    return "[Function]"
  }

  if (data instanceof Date) {
    return data.toISOString()
  }

  if (typeof data !== "object") {
    return String(data)
  }

  if (Buffer.isBuffer(data)) {
    return `[Buffer: ${data.length} bytes]`
  }

  if (seen.has(data)) {
    return "[Circular]"
  }

  if (maxDepth <= 0) {
    return "[MaxDepthExceeded]"
  }

  seen.add(data)

  // Handle Error instances safely
  if (data instanceof Error) {
    const errorObj: Record<string, unknown> = {
      name: data.name,
      message: sanitizeString(data.message),
    }
    if (data.stack) {
      errorObj.stack = sanitizeString(data.stack)
    }
    for (const [key, val] of Object.entries(data)) {
      if (key === "name" || key === "message" || key === "stack") continue
      if (isSensitiveKey(key)) {
        errorObj[key] = "[REDACTED]"
      } else {
        errorObj[key] = sanitizeData(val, maxDepth - 1, seen)
      }
    }
    return errorObj
  }

  // Handle Arrays
  if (Array.isArray(data)) {
    return data.map((item) => sanitizeData(item, maxDepth - 1, seen))
  }

  // Handle plain objects / records
  const result: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(data)) {
    if (isSensitiveKey(key)) {
      result[key] = "[REDACTED]"
    } else {
      result[key] = sanitizeData(value, maxDepth - 1, seen)
    }
  }

  return result
}

/**
 * Specifically scrubs an HTTP headers dictionary, ensuring Authorization,
 * Cookies, and any secret/session headers are completely redacted.
 */
export function redactSensitiveHeaders(
  headers?: Record<string, unknown> | null
): Record<string, unknown> {
  if (!headers || typeof headers !== "object") return {}
  const result: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(headers)) {
    const lowerKey = key.toLowerCase()
    if (isSensitiveKey(lowerKey)) {
      result[lowerKey] = "[REDACTED]"
    } else if (SAFE_HEADER_WHITELIST.has(lowerKey)) {
      result[lowerKey] = sanitizeData(value)
    } else if (
      lowerKey.includes("token") ||
      lowerKey.includes("auth") ||
      lowerKey.includes("key") ||
      lowerKey.includes("secret") ||
      lowerKey.includes("cookie") ||
      lowerKey.includes("session")
    ) {
      result[lowerKey] = "[REDACTED]"
    } else {
      result[lowerKey] = sanitizeData(value)
    }
  }

  return result
}

// ============================================================================
// Formatting & Core Logging
// ============================================================================

let currentLogSink: MuseLogSink | null = null

/**
 * Configure a custom sink callback (e.g. for testing or external log shippers).
 */
export function setMuseLogSink(sink: MuseLogSink | null): void {
  currentLogSink = sink
}

/**
 * Formats a MuseLogEntry strictly into the target JSON string:
 * {"timestamp":"...", "level":"info"|"warn"|"error", "request_id":"...", "method":"...", "path":"...", "status":number, "duration_ms":number, "details":{}}
 */
export function formatMuseLog(entry: MuseLogEntry): string {
  const sanitizedDetails =
    (sanitizeData(entry.details ?? {}) as Record<string, unknown>) || {}
  const safeDetailsObj =
    typeof sanitizedDetails === "object" &&
    sanitizedDetails !== null &&
    !Array.isArray(sanitizedDetails)
      ? sanitizedDetails
      : { value: sanitizedDetails }

  const payload = {
    timestamp: entry.timestamp,
    level: entry.level,
    request_id: entry.request_id,
    method: entry.method,
    path: sanitizeUrlPath(entry.path),
    status: entry.status,
    duration_ms: entry.duration_ms,
    details: safeDetailsObj,
  }

  return JSON.stringify(payload)
}

/**
 * Emits the structured log entry to the active sink or console.
 */
export function writeMuseLog(entry: MuseLogEntry): void {
  const jsonStr = formatMuseLog(entry)
  if (currentLogSink) {
    currentLogSink(entry, jsonStr)
    return
  }

  switch (entry.level) {
    case "error":
      console.error(jsonStr)
      break
    case "warn":
      console.warn(jsonStr)
      break
    case "info":
    default:
      console.log(jsonStr)
      break
  }
}

/**
 * Logs a Muse structured event with automatic defaults and sanitization.
 */
export function logMuseEvent(input: MuseLogInput): MuseLogEntry {
  const status = typeof input.status === "number" ? input.status : 200
  const level: MuseLogLevel =
    input.level || (status >= 500 ? "error" : status >= 400 ? "warn" : "info")
  const timestamp = input.timestamp || new Date().toISOString()
  const request_id = input.request_id || randomUUID()
  const method = (input.method || "GET").toUpperCase()
  const path = sanitizeUrlPath(input.path || "/api/muse/v1")
  const duration_ms =
    input.duration_ms !== undefined
      ? Math.round(input.duration_ms * 100) / 100
      : 0
  const details =
    (sanitizeData(input.details || {}) as Record<string, unknown>) || {}

  const entry: MuseLogEntry = {
    timestamp,
    level,
    request_id,
    method,
    path,
    status,
    duration_ms,
    details,
  }

  writeMuseLog(entry)
  return entry
}

/**
 * Primary Muse Logger API object.
 */
export const museLogger = {
  info(input: Omit<MuseLogInput, "level">): MuseLogEntry {
    return logMuseEvent({ ...input, level: "info" })
  },
  warn(input: Omit<MuseLogInput, "level">): MuseLogEntry {
    return logMuseEvent({ ...input, level: "warn" })
  },
  error(input: Omit<MuseLogInput, "level">): MuseLogEntry {
    return logMuseEvent({ ...input, level: "error" })
  },
  log(input: MuseLogInput): MuseLogEntry {
    return logMuseEvent(input)
  },
  format(entry: MuseLogEntry): string {
    return formatMuseLog(entry)
  },
  sanitize<T = unknown>(data: T): T {
    return sanitizeData(data) as T
  },
  setSink(sink: MuseLogSink | null): void {
    setMuseLogSink(sink)
  },
} as const

// ============================================================================
// Context & Request Extraction Helpers
// ============================================================================

/**
 * Extracts or generates a unique request_id from headers or request state.
 */
export function extractRequestId(req: MedusaRequest): string {
  const rawId =
    (req.headers?.["x-request-id"] as string | undefined) ||
    (req.headers?.["x-correlation-id"] as string | undefined) ||
    (req as any)?.requestId ||
    (req as any)?.id

  if (rawId && typeof rawId === "string" && rawId.trim().length > 0) {
    return rawId.trim()
  }

  return randomUUID()
}

/**
 * Retrieves the current request_id associated with a Medusa request.
 */
export function getMuseRequestId(req: MedusaRequest): string {
  return (req as any)?.requestId || extractRequestId(req)
}

/**
 * Overwrites custom details attached to the request for logging.
 */
export function setMuseLogDetails(
  req: MedusaRequest,
  details: Record<string, unknown>
): void {
  ;(req as any).museLogDetails = sanitizeData(details) as Record<string, unknown>
}

/**
 * Merges additional custom details into the request's log context.
 */
export function addMuseLogDetails(
  req: MedusaRequest,
  details: Record<string, unknown>
): void {
  const current = (req as any).museLogDetails || {}
  const sanitized = sanitizeData(details) as Record<string, unknown>
  ;(req as any).museLogDetails = {
    ...current,
    ...sanitized,
  }
}

// ============================================================================
// Middleware & Route Handler Wrappers
// ============================================================================

/**
 * Factory creating a Medusa / Express middleware to instrument Muse routes.
 */
export function createMuseLoggingMiddleware(options: MuseMiddlewareOptions = {}) {
  return function museLoggingMiddleware(
    req: MedusaRequest,
    res: MedusaResponse,
    next: MedusaNextFunction
  ): void {
    const requestId = extractRequestId(req)
    ;(req as any).requestId = requestId
    ;(req as any).__museMiddlewareAttached = true

    if (!(req as any).museLogDetails) {
      ;(req as any).museLogDetails = {}
    }

    if (!res.headersSent && typeof res.setHeader === "function") {
      res.setHeader("x-request-id", requestId)
    }

    const startHr = process.hrtime.bigint()
    let logged = false

    const onComplete = () => {
      if (logged) return
      logged = true

      const diffNs = process.hrtime.bigint() - startHr
      const duration_ms = Math.round(Number(diffNs) / 10_000) / 100
      const status = typeof res.statusCode === "number" ? res.statusCode : 200
      const level: MuseLogLevel =
        status >= 500 ? "error" : status >= 400 ? "warn" : "info"

      const rawUrl = req.originalUrl || req.url || ""
      const path = sanitizeUrlPath(rawUrl.split("?")[0] || "/api/muse/v1")

      const customDetails = (req as any).museLogDetails || {}
      const details: Record<string, unknown> = { ...customDetails }

      if (
        options.includeQuery !== false &&
        req.query &&
        Object.keys(req.query).length > 0
      ) {
        details.query = sanitizeData(req.query)
      }

      if (options.includeHeaders !== false && req.headers) {
        details.headers = redactSensitiveHeaders(
          req.headers as Record<string, unknown>
        )
      }

      if (options.customDetailsExtractor) {
        try {
          const extra = options.customDetailsExtractor(req, res)
          Object.assign(details, sanitizeData(extra))
        } catch {
          // ignore custom extractor failures to ensure logging never crashes
        }
      }

      logMuseEvent({
        timestamp: new Date().toISOString(),
        level,
        request_id: requestId,
        method: (req.method || "GET").toUpperCase(),
        path,
        status,
        duration_ms,
        details,
      })
    }

    if (typeof res.once === "function") {
      res.once("finish", onComplete)
      res.once("close", onComplete)
    }

    next()
  }
}

/**
 * Standard pre-configured middleware for /api/muse/v1 routes.
 */
export const museLoggingMiddleware = createMuseLoggingMiddleware()

/**
 * Wrapper function for instrumenting individual Medusa route handlers.
 * Ensures execution timing, error interception, and structured logging.
 */
export function withMuseLogging(handler: MuseRouteHandler): MuseRouteHandler {
  return async (
    req: MedusaRequest,
    res: MedusaResponse,
    next?: MedusaNextFunction
  ) => {
    const requestId = extractRequestId(req)
    ;(req as any).requestId = requestId

    if (!(req as any).museLogDetails) {
      ;(req as any).museLogDetails = {}
    }

    if (!res.headersSent && typeof res.setHeader === "function") {
      res.setHeader("x-request-id", requestId)
    }

    const startHr = process.hrtime.bigint()

    // If middleware is not already managing this request, attach completion listener
    if (!(req as any).__museMiddlewareAttached && typeof res.once === "function") {
      let logged = false
      const onComplete = () => {
        if (logged) return
        logged = true

        const diffNs = process.hrtime.bigint() - startHr
        const duration_ms = Math.round(Number(diffNs) / 10_000) / 100
        const status = typeof res.statusCode === "number" ? res.statusCode : 200
        const level: MuseLogLevel =
          status >= 500 ? "error" : status >= 400 ? "warn" : "info"
        const rawUrl = req.originalUrl || req.url || ""
        const path = sanitizeUrlPath(rawUrl.split("?")[0] || "/api/muse/v1")
        const customDetails = (req as any).museLogDetails || {}

        logMuseEvent({
          timestamp: new Date().toISOString(),
          level,
          request_id: requestId,
          method: (req.method || "GET").toUpperCase(),
          path,
          status,
          duration_ms,
          details: { ...customDetails },
        })
      }

      res.once("finish", onComplete)
      res.once("close", onComplete)
    }

    try {
      return await handler(req, res, next)
    } catch (err: any) {
      const diffNs = process.hrtime.bigint() - startHr
      const duration_ms = Math.round(Number(diffNs) / 10_000) / 100
      const status =
        typeof err?.status === "number"
          ? err.status
          : typeof err?.statusCode === "number"
          ? err.statusCode
          : 500

      const rawUrl = req.originalUrl || req.url || ""
      const path = sanitizeUrlPath(rawUrl.split("?")[0] || "/api/muse/v1")

      const errorPayload =
        err instanceof Error
          ? {
              name: err.name,
              message: sanitizeString(err.message),
              stack: sanitizeString(err.stack || ""),
            }
          : sanitizeData(err)

      if (!(req as any).museLogDetails) {
        ;(req as any).museLogDetails = {}
      }
      ;(req as any).museLogDetails.error = errorPayload

      // If middleware is not attached and res.once was not available, log immediately
      if (
        !(req as any).__museMiddlewareAttached &&
        typeof res.once !== "function"
      ) {
        logMuseEvent({
          timestamp: new Date().toISOString(),
          level: "error",
          request_id: requestId,
          method: (req.method || "GET").toUpperCase(),
          path,
          status,
          duration_ms,
          details: {
            ...((req as any).museLogDetails || {}),
          },
        })
      }

      if (!res.headersSent && typeof res.status === "function") {
        return res.status(status).json({
          error: "Internal Server Error",
          code: err?.code || "MUSE_INTERNAL_ERROR",
          request_id: requestId,
        })
      }

      throw err
    }
  }
}
