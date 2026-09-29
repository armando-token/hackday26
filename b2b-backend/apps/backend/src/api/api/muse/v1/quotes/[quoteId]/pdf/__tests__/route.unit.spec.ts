import fs from "fs"
import path from "path"
import crypto from "crypto"
import {
  GET,
  resolvePdfPath,
  validateDownloadToken,
  type PreliminaryQuoteDownloadRecord,
} from "../route"

// Mock dependencies
jest.mock("../../../../../../../../lib/muse/db", () => ({
  getPool: jest.fn(),
}))

const { getPool } = require("../../../../../../../../lib/muse/db")

describe("GET /api/muse/v1/quotes/[quoteId]/pdf", () => {
  const originalApiToken = process.env.MUSE_API_TOKEN
  const MOCK_API_TOKEN = "mus_test_api_token_secret_value_12345"
  const STORAGE_DIR = "/home/ubuntu/hackday26/storage/quotes"
  const TEST_PDF_FILENAME = "test-sample-quote.pdf"
  const TEST_PDF_PATH = path.join(STORAGE_DIR, TEST_PDF_FILENAME)

  let mockPoolQuery: jest.Mock

  beforeAll(() => {
    process.env.MUSE_API_TOKEN = MOCK_API_TOKEN
    // Create storage dir and a mock sample PDF file if not exists
    if (!fs.existsSync(STORAGE_DIR)) {
      fs.mkdirSync(STORAGE_DIR, { recursive: true })
    }
    fs.writeFileSync(TEST_PDF_PATH, "%PDF-1.4 test quote content")
  })

  afterAll(() => {
    process.env.MUSE_API_TOKEN = originalApiToken
    if (fs.existsSync(TEST_PDF_PATH)) {
      try {
        fs.unlinkSync(TEST_PDF_PATH)
      } catch {}
    }
  })

  beforeEach(() => {
    jest.clearAllMocks()
    mockPoolQuery = jest.fn()
    getPool.mockReturnValue({
      query: mockPoolQuery,
    })
  })

  function createMockContext(options: {
    params?: Record<string, string>
    query?: Record<string, any>
    headers?: Record<string, string>
  } = {}) {
    const headersMap: Record<string, string> = {}
    if (options.headers) {
      for (const [k, v] of Object.entries(options.headers)) {
        headersMap[k.toLowerCase()] = v
      }
    }

    const responseHeaders: Record<string, string> = {}
    let responseStatus = 200
    let responseBody: any = null
    let responseEnded = false

    const req: any = {
      params: options.params || {},
      query: options.query || {},
      headers: headersMap,
      method: "GET",
      url: `/api/muse/v1/quotes/${options.params?.quoteId || ""}/pdf`,
      originalUrl: `/api/muse/v1/quotes/${options.params?.quoteId || ""}/pdf`,
    }

    const res: any = {
      statusCode: 200,
      headersSent: false,
      setHeader: jest.fn((name: string, value: string) => {
        responseHeaders[name] = value
      }),
      getHeader: jest.fn((name: string) => {
        return responseHeaders[name]
      }),
      status: jest.fn((code: number) => {
        responseStatus = code
        res.statusCode = code
        return res
      }),
      json: jest.fn((body: any) => {
        responseBody = body
        responseEnded = true
        res.headersSent = true
        return res
      }),
      send: jest.fn((body: any) => {
        responseBody = body
        responseEnded = true
        res.headersSent = true
        return res
      }),
      sendFile: jest.fn((filePath: string, options?: any) => {
        if (options?.headers) {
          Object.assign(responseHeaders, options.headers)
        }
        responseBody = `file:${filePath}`
        responseEnded = true
        res.headersSent = true
        return res
      }),
      end: jest.fn((chunk?: any) => {
        if (chunk) responseBody = chunk
        responseEnded = true
        res.headersSent = true
        return res
      }),
    }

    return {
      req,
      res,
      getResponse: () => ({
        status: responseStatus,
        body: responseBody,
        headers: responseHeaders,
        ended: responseEnded,
      }),
    }
  }

  const validQuoteRecord: PreliminaryQuoteDownloadRecord = {
    id: "pquote_01HXYZTEST000000000001",
    opaque_public_id: "pq_a4b9c1d2e3f405162738495a6b7c8d9e",
    sku: "CN-DEMO-PID-PT100-RS1",
    pdf_storage_key: TEST_PDF_PATH,
    download_token: "tok_secret_download_token_abc123456",
    expires_at: new Date(Date.now() + 24 * 3600 * 1000), // Expiration in 24 hours
  }

  describe("Requisito 1: Ruta PÚBLICA sin requerir Bearer Token y rechazo de API Bearer Token en query", () => {
    it("NO requiere header Authorization y responde 200 con token válido", async () => {
      mockPoolQuery.mockResolvedValueOnce({ rows: [validQuoteRecord] })

      const { req, res, getResponse } = createMockContext({
        params: { quoteId: validQuoteRecord.opaque_public_id },
        query: { token: validQuoteRecord.download_token },
        headers: {}, // Sin Authorization header
      })

      await GET(req, res)
      const response = getResponse()

      expect(response.status).toBe(200)
      expect(response.headers["Content-Type"]).toBe("application/pdf")
      expect(response.headers["Cache-Control"]).toBe("public, max-age=3600")
    })

    it("rechaza si se pasa el API Bearer Token en el query param 'token' (previene fuga de token)", async () => {
      // Incluso si la BD tuviera accidentalmente el token de API como download_token
      const quoteWithApiToken: PreliminaryQuoteDownloadRecord = {
        ...validQuoteRecord,
        download_token: MOCK_API_TOKEN,
      }
      mockPoolQuery.mockResolvedValueOnce({ rows: [quoteWithApiToken] })

      const { req, res, getResponse } = createMockContext({
        params: { quoteId: validQuoteRecord.opaque_public_id },
        query: { token: MOCK_API_TOKEN },
      })

      await GET(req, res)
      const response = getResponse()

      expect(response.status).toBe(404)
      expect(response.body).toHaveProperty("error")
      expect(response.body.error.code).toBe("NOT_FOUND")
    })
  })

  describe("Requisito 2 y 3: Validación de 'token' y 'quoteId' (404 si falta o no coincide)", () => {
    it("retorna 404 NOT_FOUND si no se envía el parámetro 'token'", async () => {
      const { req, res, getResponse } = createMockContext({
        params: { quoteId: validQuoteRecord.opaque_public_id },
        query: {}, // Sin token
      })

      await GET(req, res)
      const response = getResponse()

      expect(response.status).toBe(404)
      expect(response.body.error.code).toBe("NOT_FOUND")
      expect(response.headers["Cache-Control"]).toBe("no-store")
      expect(response.headers["X-Request-Id"]).toBeDefined()
    })

    it("retorna 404 NOT_FOUND si la cotización no existe en PostgreSQL", async () => {
      mockPoolQuery.mockResolvedValueOnce({ rows: [] })

      const { req, res, getResponse } = createMockContext({
        params: { quoteId: "pq_nonexistent_id" },
        query: { token: "some_token" },
      })

      await GET(req, res)
      const response = getResponse()

      expect(response.status).toBe(404)
      expect(response.body.error.code).toBe("NOT_FOUND")
    })

    it("retorna 404 NOT_FOUND si el token no coincide con download_token", async () => {
      mockPoolQuery.mockResolvedValueOnce({ rows: [validQuoteRecord] })

      const { req, res, getResponse } = createMockContext({
        params: { quoteId: validQuoteRecord.opaque_public_id },
        query: { token: "wrong_invalid_token" },
      })

      await GET(req, res)
      const response = getResponse()

      expect(response.status).toBe(404)
      expect(response.body.error.code).toBe("NOT_FOUND")
    })

    it("permite el acceso si quoteId es el id interno en lugar de opaque_public_id", async () => {
      mockPoolQuery.mockResolvedValueOnce({ rows: [validQuoteRecord] })

      const { req, res, getResponse } = createMockContext({
        params: { quoteId: validQuoteRecord.id },
        query: { token: validQuoteRecord.download_token },
      })

      await GET(req, res)
      const response = getResponse()

      expect(response.status).toBe(200)
      expect(mockPoolQuery).toHaveBeenCalledWith(
        expect.stringContaining("WHERE id = $1 OR opaque_public_id = $1"),
        [validQuoteRecord.id]
      )
    })

    it("permite el acceso si download_token está almacenado como hash SHA-256", async () => {
      const rawToken = "my_plain_download_token_999"
      const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex")

      const quoteWithHashedToken: PreliminaryQuoteDownloadRecord = {
        ...validQuoteRecord,
        download_token: hashedToken,
      }
      mockPoolQuery.mockResolvedValueOnce({ rows: [quoteWithHashedToken] })

      const { req, res, getResponse } = createMockContext({
        params: { quoteId: validQuoteRecord.opaque_public_id },
        query: { token: rawToken },
      })

      await GET(req, res)
      const response = getResponse()

      expect(response.status).toBe(200)
    })
  })

  describe("Requisito 4: Verificación de expiración (HTTP 410 Gone con QUOTE_EXPIRED)", () => {
    it("retorna 410 Gone si now > expires_at", async () => {
      const expiredQuoteRecord: PreliminaryQuoteDownloadRecord = {
        ...validQuoteRecord,
        expires_at: new Date(Date.now() - 3600 * 1000), // Expiró hace 1 hora
      }
      mockPoolQuery.mockResolvedValueOnce({ rows: [expiredQuoteRecord] })

      const { req, res, getResponse } = createMockContext({
        params: { quoteId: validQuoteRecord.opaque_public_id },
        query: { token: validQuoteRecord.download_token },
      })

      await GET(req, res)
      const response = getResponse()

      expect(response.status).toBe(410)
      expect(response.body).toHaveProperty("error")
      expect(response.body.error.code).toBe("QUOTE_EXPIRED")
      expect(response.body.request_id).toBeDefined()
      expect(response.headers["Cache-Control"]).toBe("no-store")
    })
  })

  describe("Requisito 5: Verificación de existencia del archivo PDF en disco (404)", () => {
    it("retorna 404 NOT_FOUND si el archivo PDF no existe físicamente", async () => {
      const quoteWithMissingFile: PreliminaryQuoteDownloadRecord = {
        ...validQuoteRecord,
        pdf_storage_key: "/home/ubuntu/hackday26/storage/quotes/nonexistent_file_abc.pdf",
      }
      mockPoolQuery.mockResolvedValueOnce({ rows: [quoteWithMissingFile] })

      const { req, res, getResponse } = createMockContext({
        params: { quoteId: validQuoteRecord.opaque_public_id },
        query: { token: validQuoteRecord.download_token },
      })

      await GET(req, res)
      const response = getResponse()

      expect(response.status).toBe(404)
      expect(response.body.error.code).toBe("NOT_FOUND")
      expect(response.body.error.message).toContain("not found on disk")
    })
  })

  describe("Requisito 6: Streaming/envío con cabeceras requeridas", () => {
    it("envía archivo con Content-Type, Content-Disposition y Cache-Control exactos", async () => {
      mockPoolQuery.mockResolvedValueOnce({ rows: [validQuoteRecord] })

      const { req, res, getResponse } = createMockContext({
        params: { quoteId: validQuoteRecord.opaque_public_id },
        query: { token: validQuoteRecord.download_token },
      })

      await GET(req, res)
      const response = getResponse()

      expect(response.status).toBe(200)
      expect(response.headers["Content-Type"]).toBe("application/pdf")

      // opaque_public_id es "pq_a4b9c1d2e3f405162738495a6b7c8d9e", slice(0, 8) es "pq_a4b9c"
      const expectedFilename = `cotizacion-preliminar-CN-DEMO-PID-PT100-RS1-pq_a4b9c.pdf`
      expect(response.headers["Content-Disposition"]).toBe(
        `inline; filename="${expectedFilename}"`
      )
      expect(response.headers["Cache-Control"]).toBe("public, max-age=3600")
      expect(response.headers["X-Request-Id"]).toBeDefined()
    })
  })

  describe("Funciones auxiliares: resolvePdfPath y validateDownloadToken", () => {
    it("resolvePdfPath resuelve ruta válida y rechaza rutas inválidas o traversal", () => {
      expect(resolvePdfPath(TEST_PDF_PATH)).toBe(TEST_PDF_PATH)
      expect(resolvePdfPath(TEST_PDF_FILENAME)).toBe(TEST_PDF_PATH)
      expect(resolvePdfPath("")).toBeNull()
      expect(resolvePdfPath("bad\0file.pdf")).toBeNull()
      expect(resolvePdfPath("/tmp/nonexistent_file_xyz_123.pdf")).toBeNull()
    })

    it("validateDownloadToken valida correctamente tokens directos y hasheados", () => {
      const raw = "my_token_value_456"
      const hashed = crypto.createHash("sha256").update(raw).digest("hex")

      expect(validateDownloadToken(raw, raw)).toBe(true)
      expect(validateDownloadToken(raw, hashed)).toBe(true)
      expect(validateDownloadToken("wrong", raw)).toBe(false)
      expect(validateDownloadToken("", raw)).toBe(false)
      expect(validateDownloadToken(undefined, raw)).toBe(false)
      expect(validateDownloadToken(raw, undefined)).toBe(false)
      // Rechazo de Bearer API token
      expect(validateDownloadToken(MOCK_API_TOKEN, MOCK_API_TOKEN)).toBe(false)
    })
  })
})
