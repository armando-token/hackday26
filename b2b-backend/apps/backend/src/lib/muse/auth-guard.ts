import {
  MUSE_ERROR_CODE_UNAUTHORIZED,
  MUSE_ERROR_MSG_UNAUTHORIZED,
  MUSE_ERROR_CODE_INTERNAL,
  MUSE_ERROR_MSG_INTERNAL,
  getOrGenerateRequestId,
  applySecurityHeaders,
  formatErrorResponse,
  safeTokenCompare,
  extractBearerToken,
  attachMuseResponseLogger,
  museLogger,
  type MuseAuthResult,
} from "./common"

// Re-exportar todo desde common para disponibilidad total en auth-guard
export * from "./common"

/**
 * Valida un token extraído contra el valor configurado en process.env.MUSE_API_TOKEN.
 * Si MUSE_API_TOKEN no está definido o está vacío, rechaza inmediatamente por seguridad.
 */
export function validateMuseToken(token: string | null | undefined): boolean {
  const expectedToken = process.env.MUSE_API_TOKEN
  if (!expectedToken || typeof expectedToken !== "string" || expectedToken.trim() === "") {
    return false
  }
  if (!token || typeof token !== "string" || token.trim() === "") {
    return false
  }
  return safeTokenCompare(token.trim(), expectedToken.trim())
}

/**
 * Función central de autenticación y seguridad para requests dirigidos a /api/muse/v1.
 * 
 * Flujo:
 * 1. Resuelve o genera el `request_id` (de header `x-request-id` o UUID v4).
 * 2. Inyecta headers de seguridad obligatorios:
 *    - `X-Request-Id: <request_id>`
 *    - `Cache-Control: no-store`
 * 3. Conecta el logger estructurado seguro en el ciclo de vida de finalización de respuesta.
 * 4. Extrae y valida el token Bearer contra `process.env.MUSE_API_TOKEN`.
 * 5. Si falta el header, el formato no es Bearer o el token no coincide:
 *    Responde inmediatamente HTTP 401 con:
 *    {
 *      "error": { "code": "UNAUTHORIZED", "message": "Missing or invalid bearer token" },
 *      "request_id": "<request_id>"
 *    }
 *    y retorna `{ authenticated: false, requestId, errorResponseSent: true }`.
 * 6. Si es válido:
 *    Retorna `{ authenticated: true, requestId, token }`.
 */
export function authenticateMuseRequest(req: any, res: any): MuseAuthResult {
  const requestId = getOrGenerateRequestId(req)

  if (req) {
    req.requestId = requestId
    req.id = requestId
  }

  applySecurityHeaders(res, requestId)
  attachMuseResponseLogger(req, res, requestId)

  const authHeader = req?.headers?.["authorization"]
  const token = extractBearerToken(authHeader)

  if (!token || !validateMuseToken(token)) {
    formatErrorResponse(
      res,
      401,
      MUSE_ERROR_CODE_UNAUTHORIZED,
      MUSE_ERROR_MSG_UNAUTHORIZED,
      requestId
    )
    return {
      authenticated: false,
      requestId,
      errorResponseSent: true,
    }
  }

  if (req) {
    req.museAuthenticated = true
    req.museToken = token
  }

  return {
    authenticated: true,
    requestId,
    token,
  }
}

/**
 * Middleware estándar Express / Medusa para proteger rutas bajo `/api/muse/v1/*`.
 */
export function museAuthMiddleware(
  req: any,
  res: any,
  next: (err?: any) => void
): void {
  const auth = authenticateMuseRequest(req, res)
  if (!auth.authenticated) {
    return
  }
  if (typeof next === "function") {
    next()
  }
}

/**
 * Contexto de ejecución inyectado a los route handlers envueltos por `withMuseAuth`
 */
export interface MuseRouteContext {
  requestId: string
  token: string
}

export type MuseHandlerFunction<TReq = any, TRes = any> = (
  req: TReq,
  res: TRes,
  context: MuseRouteContext
) => Promise<any> | any

/**
 * Higher-Order Function para envolver route handlers de Medusa v2.
 * Realiza autenticación automática, inyección de headers, logging y manejo de excepciones no capturadas.
 * 
 * Uso en un `route.ts`:
 * export const GET = withMuseAuth(async (req, res, { requestId }) => {
 *   return res.json({ status: "ok", request_id: requestId })
 * })
 */
export function withMuseAuth<TReq = any, TRes = any>(
  handler: MuseHandlerFunction<TReq, TRes>
) {
  return async (req: TReq, res: TRes) => {
    const auth = authenticateMuseRequest(req, res)
    if (!auth.authenticated) {
      return
    }

    try {
      return await handler(req, res, {
        requestId: auth.requestId,
        token: auth.token,
      })
    } catch (error: any) {
      museLogger.error("Unhandled exception in Muse API handler", error, {
        requestId: auth.requestId,
        method: (req as any)?.method,
        path: (req as any)?.originalUrl || (req as any)?.url,
      })

      return formatErrorResponse(
        res,
        500,
        MUSE_ERROR_CODE_INTERNAL,
        MUSE_ERROR_MSG_INTERNAL,
        auth.requestId
      )
    }
  }
}
