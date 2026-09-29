import * as crypto from "crypto"

/**
 * Constantes estándar de seguridad y errores para la API Muse
 */
export const MUSE_HEADER_REQUEST_ID = "x-request-id"
export const MUSE_HEADER_RESPONSE_REQUEST_ID = "X-Request-Id"
export const MUSE_HEADER_CACHE_CONTROL = "Cache-Control"
export const MUSE_VALUE_NO_STORE = "no-store"

export const MUSE_ERROR_CODE_UNAUTHORIZED = "UNAUTHORIZED"
export const MUSE_ERROR_MSG_UNAUTHORIZED = "Missing or invalid bearer token"

export const MUSE_ERROR_CODE_INTERNAL = "INTERNAL_SERVER_ERROR"
export const MUSE_ERROR_MSG_INTERNAL = "An unexpected internal server error occurred"

/**
 * Tipos de resultado de autenticación
 */
export interface MuseAuthSuccess {
  authenticated: true
  requestId: string
  token: string
}

export interface MuseAuthFailure {
  authenticated: false
  requestId: string
  errorResponseSent: true
}

export type MuseAuthResult = MuseAuthSuccess | MuseAuthFailure

/**
 * Estructura estándar de respuesta de error
 */
export interface MuseErrorBody {
  error: {
    code: string
    message: string
    details?: any
  }
  request_id: string
}

/**
 * Estructura de registro para el logger estructurado
 */
export interface MuseAccessLogEntry {
  timestamp: string
  level: "info" | "warn" | "error"
  type: "muse_access"
  method: string
  path: string
  status: number
  request_id: string
  duration_ms: number
}

/**
 * Conjunto de claves sensibles que constituyen PII o secretos de autenticación.
 * NUNCA deben ser persistidas en logs.
 */
const SENSITIVE_KEY_PATTERNS = [
  "authorization",
  "bearer",
  "token",
  "secret",
  "password",
  "key",
  "cookie",
  "email",
  "phone",
  "telefono",
  "dni",
  "ruc",
  "credit_card",
  "card",
  "cvv",
  "ssn",
]

/**
 * Sink de logging por defecto (console.log como JSON)
 */
let logSink: (logJson: string) => void = (json) => console.log(json)

export function setCustomLogSink(sink: (logJson: string) => void): void {
  logSink = sink
}

export function resetLogSink(): void {
  logSink = (json) => console.log(json)
}

/**
 * Extrae o genera un `request_id`:
 * 1. Lee del header `x-request-id` (case-insensitive en Node/Express).
 * 2. Si no viene presente o está vacío, genera un UUID v4 con `crypto.randomUUID()`.
 */
export function getOrGenerateRequestId(req?: any): string {
  if (req) {
    const fromHeaders = req.headers?.[MUSE_HEADER_REQUEST_ID]
    if (typeof fromHeaders === "string" && fromHeaders.trim().length > 0) {
      return fromHeaders.trim()
    }
    if (
      Array.isArray(fromHeaders) &&
      fromHeaders.length > 0 &&
      typeof fromHeaders[0] === "string" &&
      fromHeaders[0].trim().length > 0
    ) {
      return fromHeaders[0].trim()
    }
    if (typeof req.requestId === "string" && req.requestId.trim().length > 0) {
      return req.requestId.trim()
    }
  }
  return crypto.randomUUID()
}

/**
 * Aplica los headers de seguridad obligatorios a la respuesta:
 * - `X-Request-Id: <request_id>`
 * - `Cache-Control: no-store`
 */
export function applySecurityHeaders(res: any, requestId: string): void {
  if (!res) return

  if (typeof res.setHeader === "function") {
    res.setHeader(MUSE_HEADER_RESPONSE_REQUEST_ID, requestId)
    res.setHeader(MUSE_HEADER_CACHE_CONTROL, MUSE_VALUE_NO_STORE)
  } else if (typeof res.set === "function") {
    res.set(MUSE_HEADER_RESPONSE_REQUEST_ID, requestId)
    res.set(MUSE_HEADER_CACHE_CONTROL, MUSE_VALUE_NO_STORE)
  } else if (typeof res.header === "function") {
    res.header(MUSE_HEADER_RESPONSE_REQUEST_ID, requestId)
    res.header(MUSE_HEADER_CACHE_CONTROL, MUSE_VALUE_NO_STORE)
  }
}

/**
 * Formateador uniforme de errores para la API Muse:
 * Establece los headers de seguridad y responde con la estructura estándar:
 * {
 *   "error": { "code": "...", "message": "..." },
 *   "request_id": "<request_id>"
 * }
 */
export function formatErrorResponse(
  res: any,
  status: number,
  code: string,
  message: string,
  requestId?: string,
  details?: any
): any {
  const resolvedId =
    requestId ||
    (res?.getHeader && res.getHeader(MUSE_HEADER_RESPONSE_REQUEST_ID)) ||
    getOrGenerateRequestId(res?.req)

  applySecurityHeaders(res, resolvedId)

  const body: MuseErrorBody = {
    error: {
      code,
      message,
      ...(details !== undefined ? { details } : {}),
    },
    request_id: resolvedId,
  }

  if (typeof res.status === "function") {
    return res.status(status).json(body)
  }
  if (typeof res.json === "function") {
    res.statusCode = status
    return res.json(body)
  }

  res.statusCode = status
  res.end(JSON.stringify(body))
  return res
}

/**
 * Comparación de tokens en tiempo constante resistente a ataques de temporización (timing attacks).
 * Aplica hash SHA-256 a ambas cadenas para normalizar la longitud a 32 bytes antes
 * de llamar a crypto.timingSafeEqual, protegiendo tanto el contenido como la longitud.
 */
export function safeTokenCompare(provided: string, expected: string): boolean {
  if (!provided || !expected) {
    return false
  }
  try {
    const hashProvided = crypto
      .createHash("sha256")
      .update(Buffer.from(provided, "utf-8"))
      .digest()
    const hashExpected = crypto
      .createHash("sha256")
      .update(Buffer.from(expected, "utf-8"))
      .digest()
    return crypto.timingSafeEqual(hashProvided, hashExpected)
  } catch {
    return false
  }
}

/**
 * Extrae el Bearer token del header Authorization.
 * Retorna el token limpio o null si no existe o el formato no es Bearer.
 */
export function extractBearerToken(
  authHeader: string | string[] | undefined | null
): string | null {
  if (!authHeader) return null
  const headerStr = Array.isArray(authHeader) ? authHeader[0] : authHeader
  if (typeof headerStr !== "string") return null

  const trimmed = headerStr.trim()
  const match = /^Bearer\s+(.+)$/i.exec(trimmed)
  if (!match || !match[1] || match[1].trim() === "") {
    return null
  }
  return match[1].trim()
}

/**
 * Sanitiza una URL para logging eliminando parámetros query que contengan
 * tokens, credenciales o PII.
 */
export function sanitizePathForLogging(rawUrl: string): string {
  if (!rawUrl) return ""
  try {
    const [pathPart, queryPart] = rawUrl.split("?")
    if (!queryPart) return pathPart

    const params = new URLSearchParams(queryPart)
    for (const key of Array.from(params.keys())) {
      const lower = key.toLowerCase()
      if (SENSITIVE_KEY_PATTERNS.some((p) => lower.includes(p))) {
        params.set(key, "[REDACTED]")
      }
    }
    return `${pathPart}?${params.toString()}`
  } catch {
    return rawUrl.split("?")[0]
  }
}

/**
 * Sanitiza recursivamente objetos de metadatos para evitar loguear PII o tokens.
 */
export function sanitizeDataForLogging(data: any): any {
  if (data === null || data === undefined) return data
  if (typeof data !== "object") return data

  if (Array.isArray(data)) {
    return data.map((item) => sanitizeDataForLogging(item))
  }

  const sanitized: Record<string, any> = {}
  for (const [key, val] of Object.entries(data)) {
    const lowerKey = key.toLowerCase()
    if (SENSITIVE_KEY_PATTERNS.some((p) => lowerKey.includes(p))) {
      sanitized[key] = "[REDACTED]"
    } else if (typeof val === "object" && val !== null) {
      sanitized[key] = sanitizeDataForLogging(val)
    } else {
      sanitized[key] = val
    }
  }
  return sanitized
}

/**
 * Registra una entrada estructurada segura en formato JSON.
 * NUNCA loguea tokens Bearer ni PII.
 */
export function logMuseAccess(entry: {
  timestamp?: string
  method: string
  path: string
  status: number
  request_id: string
  duration_ms: number
}): void {
  const logEntry: MuseAccessLogEntry = {
    timestamp: entry.timestamp || new Date().toISOString(),
    level: entry.status >= 500 ? "error" : entry.status >= 400 ? "warn" : "info",
    type: "muse_access",
    method: entry.method || "UNKNOWN",
    path: sanitizePathForLogging(entry.path),
    status: entry.status,
    request_id: entry.request_id,
    duration_ms: Math.round(entry.duration_ms * 100) / 100,
  }

  logSink(JSON.stringify(logEntry))
}

const LOGGER_ATTACHED_SYMBOL = Symbol.for("muse_logger_attached")

/**
 * Conecta el hook de finalización de respuesta para registrar de forma automática
 * y segura el método, path, status, request_id y tiempo de respuesta.
 */
export function attachMuseResponseLogger(
  req: any,
  res: any,
  requestId: string
): void {
  if (!res || !req || req[LOGGER_ATTACHED_SYMBOL]) {
    return
  }
  req[LOGGER_ATTACHED_SYMBOL] = true

  const startTime = process.hrtime.bigint()

  const onResponseFinished = () => {
    res.removeListener("finish", onResponseFinished)
    res.removeListener("close", onResponseFinished)

    const endTime = process.hrtime.bigint()
    const durationMs = Number(endTime - startTime) / 1_000_000

    logMuseAccess({
      method: req.method || "UNKNOWN",
      path: req.originalUrl || req.url || "",
      status: res.statusCode || 200,
      request_id: requestId,
      duration_ms: durationMs,
    })
  }

  if (typeof res.once === "function") {
    res.once("finish", onResponseFinished)
    res.once("close", onResponseFinished)
  }
}

/**
 * Utilidad de logger estructurado seguro para eventos específicos de Muse
 */
export const museLogger = {
  info(message: string, context?: Record<string, any>): void {
    const sanitized = sanitizeDataForLogging(context)
    logSink(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        level: "info",
        type: "muse_event",
        message,
        ...(sanitized ? { context: sanitized } : {}),
      })
    )
  },
  warn(message: string, context?: Record<string, any>): void {
    const sanitized = sanitizeDataForLogging(context)
    logSink(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        level: "warn",
        type: "muse_event",
        message,
        ...(sanitized ? { context: sanitized } : {}),
      })
    )
  },
  error(message: string, error?: any, context?: Record<string, any>): void {
    const sanitized = sanitizeDataForLogging(context)
    const errMessage = error instanceof Error ? error.message : String(error || "")
    logSink(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        level: "error",
        type: "muse_event",
        message,
        error: errMessage,
        ...(sanitized ? { context: sanitized } : {}),
      })
    )
  },
}
