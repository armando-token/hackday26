import {
  authenticateMuseRequest,
  museAuthMiddleware,
  withMuseAuth,
  formatErrorResponse,
  getOrGenerateRequestId,
  applySecurityHeaders,
  extractBearerToken,
  safeTokenCompare,
  validateMuseToken,
  sanitizePathForLogging,
  sanitizeDataForLogging,
  setCustomLogSink,
  resetLogSink,
  logMuseAccess,
  museLogger,
  MUSE_ERROR_CODE_UNAUTHORIZED,
  MUSE_ERROR_MSG_UNAUTHORIZED,
} from "../auth-guard"

describe("Muse API Security Middleware & Utilities", () => {
  const ORIGINAL_ENV = process.env
  const TEST_TOKEN = "muse_test_secret_token_12345"

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...ORIGINAL_ENV, MUSE_API_TOKEN: TEST_TOKEN }
  })

  afterAll(() => {
    process.env = ORIGINAL_ENV
    resetLogSink()
  })

  function createMockReq(
    headers: Record<string, any> = {},
    extra: Record<string, any> = {}
  ): Record<string, any> {
    return {
      headers: { ...headers },
      method: "GET",
      url: "/api/muse/v1/test",
      originalUrl: "/api/muse/v1/test",
      ...extra,
    }
  }

  function createMockRes() {
    const headers: Record<string, string> = {}
    const listeners: Record<string, Function[]> = {}

    const res: any = {
      statusCode: 200,
      headersSent: false,
      setHeader: jest.fn((name: string, value: string) => {
        headers[name.toLowerCase()] = value
      }),
      getHeader: jest.fn((name: string) => headers[name.toLowerCase()]),
      getHeaders: jest.fn(() => ({ ...headers })),
      status: jest.fn(function (this: any, code: number) {
        this.statusCode = code
        return this
      }),
      json: jest.fn(function (this: any, body: any) {
        this.body = body
        this.emit("finish")
        return this
      }),
      end: jest.fn(function (this: any, data: any) {
        if (data) this.body = JSON.parse(data)
        this.emit("finish")
        return this
      }),
      once: jest.fn((event: string, handler: Function) => {
        if (!listeners[event]) listeners[event] = []
        listeners[event].push(handler)
      }),
      on: jest.fn((event: string, handler: Function) => {
        if (!listeners[event]) listeners[event] = []
        listeners[event].push(handler)
      }),
      removeListener: jest.fn((event: string, handler: Function) => {
        if (listeners[event]) {
          listeners[event] = listeners[event].filter((h) => h !== handler)
        }
      }),
      emit: jest.fn((event: string, ...args: any[]) => {
        if (listeners[event]) {
          listeners[event].forEach((fn) => fn(...args))
        }
      }),
      _headers: headers,
    }
    return res
  }

  describe("1. Request ID Handling (getOrGenerateRequestId)", () => {
    it("propaga el x-request-id existente en los headers", () => {
      const incomingId = "custom-req-uuid-987"
      const req = createMockReq({ "x-request-id": incomingId })
      const rid = getOrGenerateRequestId(req)
      expect(rid).toBe(incomingId)
    })

    it("recorta espacios en blanco del x-request-id", () => {
      const req = createMockReq({ "x-request-id": "  trimmed-req-id  " })
      const rid = getOrGenerateRequestId(req)
      expect(rid).toBe("trimmed-req-id")
    })

    it("soporta x-request-id como array de strings", () => {
      const req = createMockReq({ "x-request-id": ["first-id-in-array", "second"] })
      const rid = getOrGenerateRequestId(req)
      expect(rid).toBe("first-id-in-array")
    })

    it("genera un UUID v4 válido si no viene x-request-id", () => {
      const req = createMockReq({})
      const rid = getOrGenerateRequestId(req)
      expect(rid).toBeDefined()
      // Formato UUID: 8-4-4-4-12 hex chars
      expect(rid).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      )
    })

    it("genera un UUID v4 si x-request-id viene vacío", () => {
      const req = createMockReq({ "x-request-id": "   " })
      const rid = getOrGenerateRequestId(req)
      expect(rid).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      )
    })
  })

  describe("2. Security Headers (applySecurityHeaders)", () => {
    it("establece X-Request-Id y Cache-Control: no-store", () => {
      const res = createMockRes()
      const reqId = "test-req-id-123"
      applySecurityHeaders(res, reqId)

      expect(res.setHeader).toHaveBeenCalledWith("X-Request-Id", reqId)
      expect(res.setHeader).toHaveBeenCalledWith("Cache-Control", "no-store")
      expect(res._headers["x-request-id"]).toBe(reqId)
      expect(res._headers["cache-control"]).toBe("no-store")
    })
  })

  describe("3. Bearer Token Extraction & Validation", () => {
    it("extrae token válido con prefijo 'Bearer '", () => {
      const token = extractBearerToken("Bearer sample-token")
      expect(token).toBe("sample-token")
    })

    it("es insensible a mayúsculas/minúsculas para el esquema bearer", () => {
      const token = extractBearerToken("bearer sample-token-lower")
      expect(token).toBe("sample-token-lower")
    })

    it("retorna null si el esquema no es Bearer (e.g. Basic)", () => {
      const token = extractBearerToken("Basic dXNlcjpwYXNz")
      expect(token).toBeNull()
    })

    it("retorna null si falta el token después de Bearer", () => {
      expect(extractBearerToken("Bearer ")).toBeNull()
      expect(extractBearerToken("Bearer")).toBeNull()
      expect(extractBearerToken("   ")).toBeNull()
      expect(extractBearerToken(undefined)).toBeNull()
    })

    it("valida token correcto contra MUSE_API_TOKEN", () => {
      expect(validateMuseToken(TEST_TOKEN)).toBe(true)
    })

    it("rechaza token incorrecto", () => {
      expect(validateMuseToken("wrong_token")).toBe(false)
    })

    it("rechaza cualquier token si process.env.MUSE_API_TOKEN no está definido", () => {
      delete process.env.MUSE_API_TOKEN
      expect(validateMuseToken(TEST_TOKEN)).toBe(false)
      expect(validateMuseToken("")).toBe(false)
    })

    it("rechaza cualquier token si process.env.MUSE_API_TOKEN está vacío", () => {
      process.env.MUSE_API_TOKEN = "   "
      expect(validateMuseToken(TEST_TOKEN)).toBe(false)
    })

    it("comparación de tokens constante y segura (safeTokenCompare)", () => {
      expect(safeTokenCompare("exact-match", "exact-match")).toBe(true)
      expect(safeTokenCompare("diff-1", "diff-2")).toBe(false)
      expect(safeTokenCompare("short", "longer-string")).toBe(false)
      expect(safeTokenCompare("", "token")).toBe(false)
    })
  })

  describe("4. Error Formatter (formatErrorResponse)", () => {
    it("responde con el status y estructura exacta especificada", () => {
      const res = createMockRes()
      const requestId = "err-req-id-555"

      formatErrorResponse(
        res,
        401,
        MUSE_ERROR_CODE_UNAUTHORIZED,
        MUSE_ERROR_MSG_UNAUTHORIZED,
        requestId
      )

      expect(res.status).toHaveBeenCalledWith(401)
      expect(res.body).toEqual({
        error: {
          code: "UNAUTHORIZED",
          message: "Missing or invalid bearer token",
        },
        request_id: requestId,
      })
      expect(res._headers["x-request-id"]).toBe(requestId)
      expect(res._headers["cache-control"]).toBe("no-store")
    })

    it("incluye detalles adicionales si se proporcionan", () => {
      const res = createMockRes()
      const requestId = "err-req-id-777"

      formatErrorResponse(
        res,
        400,
        "INVALID_PAYLOAD",
        "Field missing",
        requestId,
        { field: "sku" }
      )

      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.body).toEqual({
        error: {
          code: "INVALID_PAYLOAD",
          message: "Field missing",
          details: { field: "sku" },
        },
        request_id: requestId,
      })
    })
  })

  describe("5. Autenticación de Requests (authenticateMuseRequest)", () => {
    it("retorna HTTP 401 si no hay header Authorization", () => {
      const req = createMockReq()
      const res = createMockRes()

      const result = authenticateMuseRequest(req, res)

      expect(result.authenticated).toBe(false)
      expect(res.status).toHaveBeenCalledWith(401)
      expect(res.body).toEqual({
        error: {
          code: "UNAUTHORIZED",
          message: "Missing or invalid bearer token",
        },
        request_id: expect.any(String),
      })
      expect(res._headers["cache-control"]).toBe("no-store")
      expect(res._headers["x-request-id"]).toBe(result.requestId)
    })

    it("retorna HTTP 401 si el esquema no es Bearer", () => {
      const req = createMockReq({ authorization: "Basic 123456" })
      const res = createMockRes()

      const result = authenticateMuseRequest(req, res)

      expect(result.authenticated).toBe(false)
      expect(res.status).toHaveBeenCalledWith(401)
      expect(res.body.error.code).toBe("UNAUTHORIZED")
    })

    it("retorna HTTP 401 si el token no coincide", () => {
      const req = createMockReq({ authorization: "Bearer invalid-token-xyz" })
      const res = createMockRes()

      const result = authenticateMuseRequest(req, res)

      expect(result.authenticated).toBe(false)
      expect(res.status).toHaveBeenCalledWith(401)
      expect(res.body).toEqual({
        error: {
          code: "UNAUTHORIZED",
          message: "Missing or invalid bearer token",
        },
        request_id: expect.any(String),
      })
    })

    it("retorna authenticated: true si el Bearer token coincide con process.env.MUSE_API_TOKEN", () => {
      const req = createMockReq({
        authorization: `Bearer ${TEST_TOKEN}`,
        "x-request-id": "client-supplied-req-id-1",
      })
      const res = createMockRes()

      const result = authenticateMuseRequest(req, res)

      expect(result.authenticated).toBe(true)
      if (result.authenticated) {
        expect(result.token).toBe(TEST_TOKEN)
        expect(result.requestId).toBe("client-supplied-req-id-1")
      }
      expect(res.status).not.toHaveBeenCalled()
      expect(res._headers["x-request-id"]).toBe("client-supplied-req-id-1")
      expect(res._headers["cache-control"]).toBe("no-store")
      expect((req as any).requestId).toBe("client-supplied-req-id-1")
      expect((req as any).museAuthenticated).toBe(true)
    })
  })

  describe("6. Middleware de Autenticación (museAuthMiddleware)", () => {
    it("ejecuta next() cuando el token es válido", () => {
      const req = createMockReq({ authorization: `Bearer ${TEST_TOKEN}` })
      const res = createMockRes()
      const next = jest.fn()

      museAuthMiddleware(req, res, next)

      expect(next).toHaveBeenCalledTimes(1)
      expect(res.status).not.toHaveBeenCalled()
    })

    it("bloquea el paso y no ejecuta next() cuando el token es inválido", () => {
      const req = createMockReq({ authorization: "Bearer bad-token" })
      const res = createMockRes()
      const next = jest.fn()

      museAuthMiddleware(req, res, next)

      expect(next).not.toHaveBeenCalled()
      expect(res.status).toHaveBeenCalledWith(401)
    })
  })

  describe("7. Higher-Order Route Handler (withMuseAuth)", () => {
    it("ejecuta el handler con el contexto inyectado cuando está autenticado", async () => {
      const req = createMockReq({ authorization: `Bearer ${TEST_TOKEN}` })
      const res = createMockRes()

      const innerHandler = jest.fn(async (q, s, ctx) => {
        return s.json({ ok: true, rid: ctx.requestId })
      })

      const wrapped = withMuseAuth(innerHandler)
      await wrapped(req, res)

      expect(innerHandler).toHaveBeenCalledTimes(1)
      expect(innerHandler).toHaveBeenCalledWith(
        req,
        res,
        expect.objectContaining({
          requestId: expect.any(String),
          token: TEST_TOKEN,
        })
      )
      expect(res.body).toEqual({ ok: true, rid: expect.any(String) })
    })

    it("no ejecuta el handler y retorna 401 si falla la autenticación", async () => {
      const req = createMockReq({})
      const res = createMockRes()

      const innerHandler = jest.fn()
      const wrapped = withMuseAuth(innerHandler)
      await wrapped(req, res)

      expect(innerHandler).not.toHaveBeenCalled()
      expect(res.status).toHaveBeenCalledWith(401)
    })

    it("captura errores inesperados y responde 500 con formato estándar", async () => {
      const req = createMockReq({ authorization: `Bearer ${TEST_TOKEN}` })
      const res = createMockRes()

      const throwingHandler = jest.fn(async () => {
        throw new Error("Simulated database failure")
      })

      const wrapped = withMuseAuth(throwingHandler)
      await wrapped(req, res)

      expect(res.status).toHaveBeenCalledWith(500)
      expect(res.body).toEqual({
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "An unexpected internal server error occurred",
        },
        request_id: expect.any(String),
      })
      expect(res._headers["cache-control"]).toBe("no-store")
    })
  })

  describe("8. Logger Estructurado Seguro (NUNCA loguea tokens ni PII)", () => {
    let loggedMessages: string[] = []

    beforeEach(() => {
      loggedMessages = []
      setCustomLogSink((msg) => loggedMessages.push(msg))
    })

    afterEach(() => {
      resetLogSink()
    })

    it("sanitiza parámetros de consulta sensibles en URLs", () => {
      const rawUrl =
        "/api/muse/v1/products?token=secret123&bearer=supersecret&dni=12345678&page=1"
      const sanitized = sanitizePathForLogging(rawUrl)

      expect(sanitized).toContain("token=%5BREDACTED%5D")
      expect(sanitized).toContain("bearer=%5BREDACTED%5D")
      expect(sanitized).toContain("dni=%5BREDACTED%5D")
      expect(sanitized).toContain("page=1")
      expect(sanitized).not.toContain("secret123")
      expect(sanitized).not.toContain("supersecret")
      expect(sanitized).not.toContain("12345678")
    })

    it("redacta recursivamente claves sensibles en objetos de contexto", () => {
      const sensitiveData = {
        user: {
          email: "customer@example.com",
          dni: "45678901",
          password: "myPlainTextPassword",
          metadata: {
            auth_token: "jwt.secret.token",
            safe_id: 1234,
          },
        },
        status: "active",
      }

      const clean = sanitizeDataForLogging(sensitiveData)

      expect(clean.user.email).toBe("[REDACTED]")
      expect(clean.user.dni).toBe("[REDACTED]")
      expect(clean.user.password).toBe("[REDACTED]")
      expect(clean.user.metadata.auth_token).toBe("[REDACTED]")
      expect(clean.user.metadata.safe_id).toBe(1234)
      expect(clean.status).toBe("active")
    })

    it("registra evento de acceso estructurado con método, path, status, request_id y tiempo", () => {
      logMuseAccess({
        method: "GET",
        path: "/api/muse/v1/products",
        status: 200,
        request_id: "log-req-101",
        duration_ms: 15.678,
      })

      expect(loggedMessages.length).toBe(1)
      const parsed = JSON.parse(loggedMessages[0])

      expect(parsed).toEqual(
        expect.objectContaining({
          type: "muse_access",
          level: "info",
          method: "GET",
          path: "/api/muse/v1/products",
          status: 200,
          request_id: "log-req-101",
          duration_ms: 15.68,
        })
      )
      expect(parsed.timestamp).toBeDefined()
    })

    it("registra automáticamente el acceso cuando la respuesta finaliza (attachMuseResponseLogger)", () => {
      const req = createMockReq({
        authorization: `Bearer ${TEST_TOKEN}`,
        "x-request-id": "lifecycle-test-req-id",
      })
      const res = createMockRes()

      // authenticateMuseRequest conecta attachMuseResponseLogger
      authenticateMuseRequest(req, res)

      // Simular que el endpoint responde y emite finish
      res.status(200).json({ ok: true })

      expect(loggedMessages.length).toBe(1)
      const parsed = JSON.parse(loggedMessages[0])

      expect(parsed.type).toBe("muse_access")
      expect(parsed.request_id).toBe("lifecycle-test-req-id")
      expect(parsed.status).toBe(200)
      expect(parsed.method).toBe("GET")
      expect(typeof parsed.duration_ms).toBe("number")
    })

    it("museLogger redacta datos sensibles en eventos custom", () => {
      museLogger.info("Customer query executed", {
        authorization: "Bearer secret-token",
        email: "leak@test.com",
        count: 5,
      })

      expect(loggedMessages.length).toBe(1)
      const parsed = JSON.parse(loggedMessages[0])

      expect(parsed.message).toBe("Customer query executed")
      expect(parsed.context.authorization).toBe("[REDACTED]")
      expect(parsed.context.email).toBe("[REDACTED]")
      expect(parsed.context.count).toBe(5)
      expect(loggedMessages[0]).not.toContain("secret-token")
      expect(loggedMessages[0]).not.toContain("leak@test.com")
    })
  })
})
