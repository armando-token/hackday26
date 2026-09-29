import {
  museLogger,
  logMuseEvent,
  formatMuseLog,
  sanitizeData,
  sanitizeString,
  redactSensitiveHeaders,
  sanitizeUrlPath,
  setMuseLogSink,
  extractRequestId,
  getMuseRequestId,
  setMuseLogDetails,
  addMuseLogDetails,
  museLoggingMiddleware,
  createMuseLoggingMiddleware,
  withMuseLogging,
  MuseLogEntry,
} from "../muse/logger"
import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { EventEmitter } from "events"

describe("muse/logger", () => {
  let capturedLogs: Array<{ entry: MuseLogEntry; rawJson: string }> = []

  beforeEach(() => {
    capturedLogs = []
    setMuseLogSink((entry, rawJson) => {
      capturedLogs.push({ entry, rawJson })
    })
  })

  afterEach(() => {
    setMuseLogSink(null)
  })

  describe("Formato Estructurado de Log (JSON)", () => {
    it("emite JSON con todas las 8 propiedades obligatorias", () => {
      const entry = logMuseEvent({
        timestamp: "2026-09-29T19:00:00.000Z",
        level: "info",
        request_id: "req_test_12345",
        method: "GET",
        path: "/api/muse/v1/products",
        status: 200,
        duration_ms: 15.42,
        details: { category: "sensors", count: 12 },
      })

      expect(capturedLogs.length).toBe(1)
      const { rawJson } = capturedLogs[0]
      const parsed = JSON.parse(rawJson)

      expect(parsed).toEqual({
        timestamp: "2026-09-29T19:00:00.000Z",
        level: "info",
        request_id: "req_test_12345",
        method: "GET",
        path: "/api/muse/v1/products",
        status: 200,
        duration_ms: 15.42,
        details: { category: "sensors", count: 12 },
      })

      // Verifica el orden exacto de las claves
      const keys = Object.keys(parsed)
      expect(keys).toEqual([
        "timestamp",
        "level",
        "request_id",
        "method",
        "path",
        "status",
        "duration_ms",
        "details",
      ])
    })

    it("asegura que details siempre sea un objeto JSON válido incluso si se pasa vacío", () => {
      const entry = logMuseEvent({
        method: "POST",
        path: "/api/muse/v1/quotes",
      })

      const parsed = JSON.parse(capturedLogs[0].rawJson)
      expect(typeof parsed.details).toBe("object")
      expect(parsed.details).not.toBeNull()
      expect(Array.isArray(parsed.details)).toBe(false)
      expect(parsed.status).toBe(200)
      expect(parsed.level).toBe("info")
    })

    it("asigna automáticamente niveles de log según el código HTTP cuando no se especifica", () => {
      logMuseEvent({ method: "GET", path: "/test", status: 200 })
      expect(capturedLogs[0].entry.level).toBe("info")

      logMuseEvent({ method: "GET", path: "/test", status: 401 })
      expect(capturedLogs[1].entry.level).toBe("warn")

      logMuseEvent({ method: "GET", path: "/test", status: 404 })
      expect(capturedLogs[2].entry.level).toBe("warn")

      logMuseEvent({ method: "GET", path: "/test", status: 500 })
      expect(capturedLogs[3].entry.level).toBe("error")

      logMuseEvent({ method: "GET", path: "/test", status: 503 })
      expect(capturedLogs[4].entry.level).toBe("error")
    })

    it("redondea duration_ms a 2 decimales numéricos", () => {
      logMuseEvent({
        method: "GET",
        path: "/api/muse/v1/ping",
        duration_ms: 14.289134,
      })

      const parsed = JSON.parse(capturedLogs[0].rawJson)
      expect(parsed.duration_ms).toBe(14.29)
      expect(typeof parsed.duration_ms).toBe("number")
    })
  })

  describe("Reglas Estrictas de Privacidad y Redacción (Tokens y Headers)", () => {
    it("NUNCA imprime Bearer tokens en headers ni en strings", () => {
      const sensitiveHeader = "Bearer mus_3ff2312374b39fbb29e287e6ede03dfd39c65dfb73743bef5da6e53ede6e0965"
      const headers = {
        authorization: sensitiveHeader,
        "proxy-authorization": "Bearer token_secret_9999",
        "x-custom-auth": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.t-IDcSemACt8x4iTMCda8Yhe3iZaWbvV5XKSTbuAn0M",
      }

      const redacted = redactSensitiveHeaders(headers)
      expect(redacted.authorization).toBe("[REDACTED]")
      expect(redacted["proxy-authorization"]).toBe("[REDACTED]")
      expect(redacted["x-custom-auth"]).toBe("[REDACTED]")

      // Asegura que ninguna parte del Bearer token esté presente
      const stringified = JSON.stringify(redacted)
      expect(stringified).not.toContain("3ff2312374b39fbb29e287e6ede03dfd39c65dfb73743bef5da6e53ede6e0965")
      expect(stringified).not.toContain("token_secret_9999")
      expect(stringified).not.toContain("Bearer ")
    })

    it("redacta tokens de Muse (mus_...) embebidos en texto plano o errores", () => {
      const rawText = "Failed upstream query with token mus_9876543210abcdef9876543210abcdef and Bearer mus_abcdef123456"
      const sanitized = sanitizeString(rawText)

      expect(sanitized).not.toContain("mus_9876543210abcdef9876543210abcdef")
      expect(sanitized).not.toContain("mus_abcdef123456")
      expect(sanitized).toContain("[REDACTED_TOKEN]")
      expect(sanitized).toContain("Bearer [REDACTED]")
    })

    it("redacta parámetros de consulta sensibles en URLs", () => {
      const rawUrl = "/api/muse/v1/search?token=mus_secret12345678&category=sensors&apiKey=cn_api_999"
      const sanitized = sanitizeUrlPath(rawUrl)

      expect(sanitized).not.toContain("mus_secret12345678")
      expect(sanitized).not.toContain("cn_api_999")
      expect(sanitized).toContain("token=[REDACTED]")
      expect(sanitized).toContain("apiKey=[REDACTED]")
      expect(sanitized).toContain("category=sensors")
    })
  })

  describe("Reglas Estrictas de Privacidad y Redacción (PII y Datos de Sesión)", () => {
    it("redacta completamente campos de PII y credenciales de usuario", () => {
      const sensitiveDetails = {
        user: {
          first_name: "Juan",
          last_name: "Perez",
          email: "juan.perez@industrial-peru.pe",
          phone: "+51987654321",
          dni: "45678912",
          ruc: "20123456789",
          address: "Av. Industrial 456, Lima",
          password: "super_secret_password",
        },
        credit_card: "4532 1234 5678 9012",
        cvv: "123",
        safe_param: "temperature_sensor_rtd",
      }

      const sanitized: any = sanitizeData(sensitiveDetails)

      expect(sanitized.user.first_name).toBe("[REDACTED]")
      expect(sanitized.user.last_name).toBe("[REDACTED]")
      expect(sanitized.user.email).toBe("[REDACTED]")
      expect(sanitized.user.phone).toBe("[REDACTED]")
      expect(sanitized.user.dni).toBe("[REDACTED]")
      expect(sanitized.user.ruc).toBe("[REDACTED]")
      expect(sanitized.user.address).toBe("[REDACTED]")
      expect(sanitized.user.password).toBe("[REDACTED]")
      expect(sanitized.credit_card).toBe("[REDACTED]")
      expect(sanitized.cvv).toBe("[REDACTED]")
      expect(sanitized.safe_param).toBe("temperature_sensor_rtd")
    })

    it("redacta datos de sesión reales y cookies", () => {
      const headers = {
        cookie: "connect.sid=s%3A1234567890.abcdef; session_id=sess_live_9988",
        "set-cookie": "token=jwt_xyz",
        host: "api.controlnautas.com",
      }

      const redacted = redactSensitiveHeaders(headers)
      expect(redacted.cookie).toBe("[REDACTED]")
      expect(redacted["set-cookie"]).toBe("[REDACTED]")
      expect(redacted.host).toBe("api.controlnautas.com")
    })

    it("detecta y redacta emails y tarjetas de crédito embebidos en cadenas de texto", () => {
      const message = "Customer at contact@cliente-fabrica.com submitted card 4532-1234-5678-9012 for validation"
      const sanitized = sanitizeString(message)

      expect(sanitized).not.toContain("contact@cliente-fabrica.com")
      expect(sanitized).not.toContain("4532-1234-5678-9012")
      expect(sanitized).toContain("[REDACTED_EMAIL]")
      expect(sanitized).toContain("[REDACTED_CARD]")
    })

    it("maneja referencias circulares sin desbordar la pila", () => {
      const circularObj: any = { name: "test_circuit" }
      circularObj.self = circularObj

      expect(() => sanitizeData(circularObj)).not.toThrow()
      const sanitized: any = sanitizeData(circularObj)
      expect(sanitized.self).toBe("[Circular]")
    })

    it("sanea instancias de Error incluyendo mensajes y trazas de pila", () => {
      const error = new Error("Connection failed with Bearer mus_3ff2312374b39fbb29e287e6ede03dfd39c65dfb73743bef5da6e53ede6e0965")
      const sanitized: any = sanitizeData(error)

      expect(sanitized.name).toBe("Error")
      expect(sanitized.message).toBe("Connection failed with Bearer [REDACTED]")
      expect(sanitized.message).not.toContain("3ff2312374b39fbb29e287e6ede03dfd39c65dfb73743bef5da6e53ede6e0965")
      if (sanitized.stack) {
        expect(sanitized.stack).not.toContain("3ff2312374b39fbb29e287e6ede03dfd39c65dfb73743bef5da6e53ede6e0965")
      }
    })
  })

  describe("API del Objeto museLogger", () => {
    it("provee métodos info, warn y error", () => {
      museLogger.info({
        method: "GET",
        path: "/api/muse/v1/health",
        status: 200,
      })
      expect(capturedLogs[0].entry.level).toBe("info")

      museLogger.warn({
        method: "POST",
        path: "/api/muse/v1/quotes",
        status: 400,
        details: { reason: "missing_product_id" },
      })
      expect(capturedLogs[1].entry.level).toBe("warn")

      museLogger.error({
        method: "POST",
        path: "/api/muse/v1/orders",
        status: 500,
        details: { message: "Internal DB connection failed" },
      })
      expect(capturedLogs[2].entry.level).toBe("error")
    })

    it("formatea correctamente con museLogger.format", () => {
      const entry: MuseLogEntry = {
        timestamp: "2026-09-29T19:15:00.000Z",
        level: "info",
        request_id: "req_format_test",
        method: "GET",
        path: "/api/muse/v1/categories",
        status: 200,
        duration_ms: 10.5,
        details: { total: 5 },
      }

      const jsonStr = museLogger.format(entry)
      const parsed = JSON.parse(jsonStr)
      expect(parsed.request_id).toBe("req_format_test")
      expect(parsed.status).toBe(200)
    })
  })

  describe("Middleware museLoggingMiddleware", () => {
    function createMockReqRes(headers: Record<string, string> = {}, url = "/api/muse/v1/search?q=sensor") {
      const req: any = {
        method: "GET",
        url,
        originalUrl: url,
        headers: { ...headers },
        query: { q: "sensor" },
      }

      const emitter = new EventEmitter()
      const res: any = {
        statusCode: 200,
        headersSent: false,
        _headers: {} as Record<string, string>,
        setHeader: jest.fn((k: string, v: string) => {
          res._headers[k.toLowerCase()] = v
        }),
        status: jest.fn(function (code: number) {
          res.statusCode = code
          return res
        }),
        json: jest.fn(function (data: any) {
          emitter.emit("finish")
          return res
        }),
        once: jest.fn((evt: string, cb: any) => emitter.once(evt, cb)),
        on: jest.fn((evt: string, cb: any) => emitter.on(evt, cb)),
        emit: (evt: string) => emitter.emit(evt),
      }

      return { req, res, emitter }
    }

    it("asigna x-request-id en encabezados de respuesta y en contexto req", () => {
      const { req, res, emitter } = createMockReqRes()
      const next = jest.fn()

      museLoggingMiddleware(req as MedusaRequest, res as MedusaResponse, next)
      expect(next).toHaveBeenCalled()
      expect(res.setHeader).toHaveBeenCalledWith("x-request-id", expect.any(String))
      expect(req.requestId).toBeDefined()

      // Dispara finish
      emitter.emit("finish")
      expect(capturedLogs.length).toBe(1)
      expect(capturedLogs[0].entry.request_id).toBe(req.requestId)
      expect(capturedLogs[0].entry.status).toBe(200)
      expect(capturedLogs[0].entry.method).toBe("GET")
      expect(capturedLogs[0].entry.path).toBe("/api/muse/v1/search")
    })

    it("respeta y reutiliza x-request-id entrante del cliente para trazabilidad", () => {
      const clientTraceId = "client-trace-uuid-12345"
      const { req, res, emitter } = createMockReqRes({ "x-request-id": clientTraceId })
      const next = jest.fn()

      museLoggingMiddleware(req as MedusaRequest, res as MedusaResponse, next)
      expect(res.setHeader).toHaveBeenCalledWith("x-request-id", clientTraceId)
      expect(getMuseRequestId(req as MedusaRequest)).toBe(clientTraceId)

      emitter.emit("finish")
      expect(capturedLogs[0].entry.request_id).toBe(clientTraceId)
    })

    it("permite a los controladores enriquecer los detalles mediante addMuseLogDetails", () => {
      const { req, res, emitter } = createMockReqRes()
      const next = jest.fn(() => {
        addMuseLogDetails(req as MedusaRequest, {
          matched_skus: ["PT100-3W-A1", "PID-PT100-RS1"],
          catalog_engine: "muse_v1",
        })
      })

      museLoggingMiddleware(req as MedusaRequest, res as MedusaResponse, next)
      emitter.emit("finish")

      expect(capturedLogs[0].entry.details.matched_skus).toEqual([
        "PT100-3W-A1",
        "PID-PT100-RS1",
      ])
      expect(capturedLogs[0].entry.details.catalog_engine).toBe("muse_v1")
    })
  })

  describe("Wrapper withMuseLogging", () => {
    it("envuelve un controlador exitoso y registra la ejecución", async () => {
      const emitter = new EventEmitter()
      const req: any = {
        method: "POST",
        url: "/api/muse/v1/products/lookup",
        originalUrl: "/api/muse/v1/products/lookup",
        headers: {},
      }
      const res: any = {
        statusCode: 200,
        headersSent: false,
        setHeader: jest.fn(),
        status: jest.fn(function (code: number) {
          res.statusCode = code
          return res
        }),
        json: jest.fn(function (data: any) {
          emitter.emit("finish")
          return res
        }),
        once: jest.fn((evt: string, cb: any) => emitter.once(evt, cb)),
        emit: (evt: string) => emitter.emit(evt),
      }

      const handler = withMuseLogging(async (req, res) => {
        addMuseLogDetails(req, { operation: "sku_lookup", success: true })
        return res.status(200).json({ status: "success" })
      })

      await handler(req as MedusaRequest, res as MedusaResponse)

      expect(capturedLogs.length).toBe(1)
      expect(capturedLogs[0].entry.status).toBe(200)
      expect(capturedLogs[0].entry.level).toBe("info")
      expect(capturedLogs[0].entry.details.operation).toBe("sku_lookup")
    })

    it("captura excepciones no controladas, responde 500 y registra con level error", async () => {
      const req: any = {
        method: "GET",
        url: "/api/muse/v1/crash",
        headers: {},
      }
      const res: any = {
        statusCode: 200,
        headersSent: false,
        setHeader: jest.fn(),
        status: jest.fn(function (code: number) {
          res.statusCode = code
          return res
        }),
        json: jest.fn(function (data: any) {
          return res
        }),
      }

      const handler = withMuseLogging(async () => {
        throw new Error("Simulated database failure with secret Bearer mus_3ff2312374b39fbb29e287e6ede03dfd39c65dfb73743bef5da6e53ede6e0965")
      })

      await handler(req as MedusaRequest, res as MedusaResponse)

      expect(res.status).toHaveBeenCalledWith(500)
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: "Internal Server Error",
          request_id: expect.any(String),
        })
      )

      expect(capturedLogs.length).toBe(1)
      expect(capturedLogs[0].entry.level).toBe("error")
      expect(capturedLogs[0].entry.status).toBe(500)
      const errorDetail: any = capturedLogs[0].entry.details.error
      expect(errorDetail.message).toContain("Bearer [REDACTED]")
      expect(errorDetail.message).not.toContain("3ff2312374b39fbb29e287e6ede03dfd39c65dfb73743bef5da6e53ede6e0965")
    })
  })
})
