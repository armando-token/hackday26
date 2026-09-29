import { GET } from "../route"

describe("GET /api/muse/v1/products/search", () => {
  const originalToken = process.env.MUSE_API_TOKEN
  const TEST_TOKEN = "mus_test_secret_token_value_for_search_tests_1234"

  beforeAll(() => {
    process.env.MUSE_API_TOKEN = TEST_TOKEN
  })

  afterAll(() => {
    process.env.MUSE_API_TOKEN = originalToken
  })

  function createMockContext(options: {
    headers?: Record<string, string>
    query?: Record<string, any>
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

    const req: any = {
      headers: headersMap,
      query: options.query || {},
      method: "GET",
      url: "/api/muse/v1/products/search",
      originalUrl: "/api/muse/v1/products/search",
    }

    const res: any = {
      statusCode: 200,
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
      }),
    }
  }

  describe("Autenticación y Seguridad (401)", () => {
    it("retorna 401 si no se envía header Authorization", async () => {
      const { req, res, getResponse } = createMockContext({
        headers: {},
      })

      await GET(req, res)
      const response = getResponse()

      expect(response.status).toBe(401)
      expect(response.body).toHaveProperty("error")
      expect(response.body.error.code).toBe("UNAUTHORIZED")
      expect(response.body.error.message).toBe("Missing or invalid bearer token")
      expect(response.body).toHaveProperty("request_id")
      expect(response.headers["Cache-Control"]).toBe("no-store")
      expect(response.headers["X-Request-Id"]).toBeDefined()
    })

    it("retorna 401 si el Bearer token es inválido", async () => {
      const { req, res, getResponse } = createMockContext({
        headers: {
          authorization: "Bearer mus_invalid_token",
        },
      })

      await GET(req, res)
      const response = getResponse()

      expect(response.status).toBe(401)
      expect(response.body.error.code).toBe("UNAUTHORIZED")
      expect(response.body).toHaveProperty("request_id")
    })

    it("propaga el x-request-id proporcionado por el cliente", async () => {
      const customId = "req_custom_search_client_001"
      const { req, res, getResponse } = createMockContext({
        headers: {
          authorization: "Bearer mus_invalid_token",
          "x-request-id": customId,
        },
      })

      await GET(req, res)
      const response = getResponse()

      expect(response.headers["X-Request-Id"]).toBe(customId)
      expect(response.body.request_id).toBe(customId)
    })
  })

  describe("Validación de Parámetros (400)", () => {
    it("retorna 400 con INVALID_PARAM si q supera los 200 caracteres", async () => {
      const longQ = "a".repeat(201)
      const { req, res, getResponse } = createMockContext({
        headers: {
          authorization: `Bearer ${TEST_TOKEN}`,
        },
        query: { q: longQ },
      })

      await GET(req, res)
      const response = getResponse()

      expect(response.status).toBe(400)
      expect(response.body.error.code).toBe("INVALID_PARAM")
      expect(response.body.error.message).toContain("200")
      expect(response.body.request_id).toBeDefined()
      expect(response.headers["Cache-Control"]).toBe("no-store")
    })

    it("retorna 400 con INVALID_PARAM si limit es menor a 1 (ej. limit=0)", async () => {
      const { req, res, getResponse } = createMockContext({
        headers: {
          authorization: `Bearer ${TEST_TOKEN}`,
        },
        query: { limit: "0" },
      })

      await GET(req, res)
      const response = getResponse()

      expect(response.status).toBe(400)
      expect(response.body.error.code).toBe("INVALID_PARAM")
      expect(response.body.error.message).toContain("between 1 and 3")
    })

    it("retorna 400 con INVALID_PARAM si limit es mayor a 3 (ej. limit=10)", async () => {
      const { req, res, getResponse } = createMockContext({
        headers: {
          authorization: `Bearer ${TEST_TOKEN}`,
        },
        query: { limit: "10" },
      })

      await GET(req, res)
      const response = getResponse()

      expect(response.status).toBe(400)
      expect(response.body.error.code).toBe("INVALID_PARAM")
      expect(response.body.error.message).toContain("between 1 and 3")
    })

    it("retorna 400 con INVALID_PARAM si limit no es numérico (ej. limit=abc)", async () => {
      const { req, res, getResponse } = createMockContext({
        headers: {
          authorization: `Bearer ${TEST_TOKEN}`,
        },
        query: { limit: "abc" },
      })

      await GET(req, res)
      const response = getResponse()

      expect(response.status).toBe(400)
      expect(response.body.error.code).toBe("INVALID_PARAM")
    })
  })

  describe("Búsqueda Técnica Exitosa (200)", () => {
    it("retorna variantes demo cuando no se pasa q (default limit 3)", async () => {
      const { req, res, getResponse } = createMockContext({
        headers: {
          authorization: `Bearer ${TEST_TOKEN}`,
        },
        query: {},
      })

      await GET(req, res)
      const response = getResponse()

      expect(response.status).toBe(200)
      expect(response.headers["Cache-Control"]).toBe("no-store")
      expect(response.headers["X-Request-Id"]).toBeDefined()
      expect(response.body).toHaveProperty("products")
      expect(response.body).toHaveProperty("count")
      expect(response.body).toHaveProperty("request_id")
      expect(Array.isArray(response.body.products)).toBe(true)
      expect(response.body.products.length).toBeGreaterThan(0)
      expect(response.body.products.length).toBeLessThanOrEqual(3)
      expect(response.body.count).toBe(response.body.products.length)

      // Verificar cada producto retornado
      for (const prod of response.body.products) {
        expect(prod).toHaveProperty("variant_id")
        expect(prod.variant_id).toMatch(/^variant_/)
        expect(prod).toHaveProperty("sku")
        expect(prod.sku).toMatch(/^CN-DEMO-/)
        expect(prod).toHaveProperty("model")
        expect(prod.model).toMatch(/^CN-/)
        expect(prod).toHaveProperty("title")
        expect(prod).toHaveProperty("product_url")
        expect(prod.product_url).toMatch(/^(https:\/\/data\.controlnautas\.com|http:\/\/52\.20\.66\.203:8000)\/pe\/products\//)
        expect(prod).toHaveProperty("technical_summary")
        expect(typeof prod.technical_summary).toBe("string")
        expect(prod.demo).toBe(true)

        // PROHIBICIÓN ESTRICTA: Sin precio ni stock
        expect(prod).not.toHaveProperty("price")
        expect(prod).not.toHaveProperty("prices")
        expect(prod).not.toHaveProperty("price_pen")
        expect(prod).not.toHaveProperty("stock")
        expect(prod).not.toHaveProperty("inventory")
        expect(prod).not.toHaveProperty("stocked_quantity")
      }
    })

    it("filtra por texto 'Modbus' y retorna variantes con dicho protocolo", async () => {
      const { req, res, getResponse } = createMockContext({
        headers: {
          authorization: `Bearer ${TEST_TOKEN}`,
        },
        query: { q: "Modbus" },
      })

      await GET(req, res)
      const response = getResponse()

      expect(response.status).toBe(200)
      expect(response.body.products.length).toBeGreaterThan(0)
      for (const prod of response.body.products) {
        expect(prod.sku).toMatch(/^CN-DEMO-/)
      }
    })

    it("filtra por hecho técnico como 'carril DIN'", async () => {
      const { req, res, getResponse } = createMockContext({
        headers: {
          authorization: `Bearer ${TEST_TOKEN}`,
        },
        query: { q: "carril DIN" },
      })

      await GET(req, res)
      const response = getResponse()

      expect(response.status).toBe(200)
      expect(response.body.products.length).toBe(1)
      expect(response.body.products[0].sku).toBe("CN-DEMO-PLC-DIN-420-MR1")
    })

    it("respeta el parámetro limit=1", async () => {
      const { req, res, getResponse } = createMockContext({
        headers: {
          authorization: `Bearer ${TEST_TOKEN}`,
        },
        query: { limit: "1" },
      })

      await GET(req, res)
      const response = getResponse()

      expect(response.status).toBe(200)
      expect(response.body.products.length).toBe(1)
      expect(response.body.count).toBe(1)
    })
  })
})
