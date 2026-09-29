import { GET } from "../route"
import { closePool, getTechnicalProfile } from "../../../../../../../lib/muse/db"

describe("GET /api/muse/v1/products/[variantId]", () => {
  const originalToken = process.env.MUSE_API_TOKEN
  const TEST_TOKEN = "mus_test_secret_token_value_for_detail_tests_5678"
  let PLC_VARIANT_ID = "variant_01M3Q974QF1HZECRQV1MK969WX"

  beforeAll(async () => {
    process.env.MUSE_API_TOKEN = TEST_TOKEN
    const profile = await getTechnicalProfile("CN-DEMO-PLC-DIN-420-MR1")
    if (profile) {
      PLC_VARIANT_ID = profile.variant_id
    }
  })

  afterAll(async () => {
    process.env.MUSE_API_TOKEN = originalToken
    await closePool()
  })

  function createMockContext(options: {
    headers?: Record<string, string>
    params?: Record<string, any>
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
      params: options.params || {},
      method: "GET",
      url: `/api/muse/v1/products/${options.params?.variantId || ""}`,
      originalUrl: `/api/muse/v1/products/${options.params?.variantId || ""}`,
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
        params: { variantId: "variant_01M3Q80TB1MN6861FT63TR6BTP" },
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

    it("retorna 401 si el Bearer token es incorrecto", async () => {
      const { req, res, getResponse } = createMockContext({
        headers: {
          authorization: "Bearer invalid_bearer_token_xyz",
        },
        params: { variantId: "variant_01M3Q80TB1MN6861FT63TR6BTP" },
      })

      await GET(req, res)
      const response = getResponse()

      expect(response.status).toBe(401)
      expect(response.body.error.code).toBe("UNAUTHORIZED")
      expect(response.body).toHaveProperty("request_id")
    })

    it("propaga el x-request-id proporcionado por el cliente", async () => {
      const customId = "req_custom_detail_007"
      const { req, res, getResponse } = createMockContext({
        headers: {
          authorization: "Bearer invalid_token",
          "x-request-id": customId,
        },
        params: { variantId: "variant_01M3Q80TB1MN6861FT63TR6BTP" },
      })

      await GET(req, res)
      const response = getResponse()

      expect(response.headers["X-Request-Id"]).toBe(customId)
      expect(response.body.request_id).toBe(customId)
    })
  })

  describe("Alcance Estricto Demo y 404 (Not Found)", () => {
    it("retorna 404 si el variantId no existe en la base de datos", async () => {
      const { req, res, getResponse } = createMockContext({
        headers: {
          authorization: `Bearer ${TEST_TOKEN}`,
        },
        params: { variantId: "variant_inventada_inexistente_999" },
      })

      await GET(req, res)
      const response = getResponse()

      expect(response.status).toBe(404)
      expect(response.body).toHaveProperty("error")
      expect(response.body.error.code).toBe("NOT_FOUND")
      expect(response.body.error.message).toBe("Variant not found or outside demo scope")
      expect(response.body).toHaveProperty("request_id")
      expect(response.headers["Cache-Control"]).toBe("no-store")
      expect(response.headers["X-Request-Id"]).toBeDefined()
    })

    it("retorna 404 si variantId está vacío", async () => {
      const { req, res, getResponse } = createMockContext({
        headers: {
          authorization: `Bearer ${TEST_TOKEN}`,
        },
        params: { variantId: "" },
      })

      await GET(req, res)
      const response = getResponse()

      expect(response.status).toBe(404)
      expect(response.body.error.code).toBe("NOT_FOUND")
      expect(response.body.error.message).toBe("Variant not found or outside demo scope")
    })
  })

  describe("Detalle Técnico Exitoso (200 OK)", () => {
    it("retorna detalle técnico completo para SKU 1 (PLC DIN)", async () => {
      const { req, res, getResponse } = createMockContext({
        headers: {
          authorization: `Bearer ${TEST_TOKEN}`,
        },
        params: { variantId: PLC_VARIANT_ID },
      })

      await GET(req, res)
      const response = getResponse()

      expect(response.status).toBe(200)
      expect(response.headers["Cache-Control"]).toBe("no-store")
      expect(response.headers["X-Request-Id"]).toBeDefined()

      const body = response.body
      expect(body.variant_id).toBe(PLC_VARIANT_ID)
      expect(body.sku).toBe("CN-DEMO-PLC-DIN-420-MR1")
      expect(body.model).toBe("CN-DIN-PLC-A1")
      expect(body.title).toContain("Controlador Lógico Programable")
      expect(body.product_url).toBe("http://52.20.66.203:8000/pe/products/cn-demo-plc-din-420-mr1")
      expect(body.demo).toBe(true)
      expect(body.request_id).toBeDefined()

      // Profile
      expect(body.profile).toBeDefined()
      expect(body.profile.model).toBe("CN-DIN-PLC-A1")
      expect(body.profile.demo).toBe(true)
      expect(body.profile.revision).toBeDefined()
      expect(body.profile.updated_at).toBeDefined()

      // Facts
      expect(Array.isArray(body.facts)).toBe(true)
      expect(body.facts.length).toBeGreaterThan(0)
      for (const fact of body.facts) {
        expect(fact).toHaveProperty("id")
        expect(fact).toHaveProperty("variant_id")
        expect(fact).toHaveProperty("property")
        expect(fact).toHaveProperty("display_value")
        expect(fact).toHaveProperty("excerpt")
        expect(fact).toHaveProperty("polarity")
      }

      // Sources
      expect(Array.isArray(body.sources)).toBe(true)
      expect(body.sources.length).toBeGreaterThan(0)
      for (const source of body.sources) {
        expect(source).toHaveProperty("id")
        expect(source).toHaveProperty("url")
        expect(source).toHaveProperty("checksum")
      }

      // PROHIBICIÓN ESTRICTA: Cero precio y stock embebidos
      expect(body).not.toHaveProperty("price")
      expect(body).not.toHaveProperty("price_pen")
      expect(body).not.toHaveProperty("prices")
      expect(body).not.toHaveProperty("stock")
      expect(body).not.toHaveProperty("inventory")
      expect(body).not.toHaveProperty("stocked_quantity")
      expect(body.profile).not.toHaveProperty("price")
      expect(body.profile).not.toHaveProperty("price_pen")
      expect(body.profile).not.toHaveProperty("stock")
    })

    it("retorna detalle técnico consultando por SKU demo", async () => {
      const { req, res, getResponse } = createMockContext({
        headers: {
          authorization: `Bearer ${TEST_TOKEN}`,
        },
        params: { variantId: "CN-DEMO-PID-PT100-RS1" },
      })

      await GET(req, res)
      const response = getResponse()

      expect(response.status).toBe(200)
      const body = response.body
      expect(body.sku).toBe("CN-DEMO-PID-PT100-RS1")
      expect(body.model).toBe("CN-PID-T1")
      expect(body.product_url).toBe("http://52.20.66.203:8000/pe/products/cn-demo-pid-pt100-rs1")
      expect(body.demo).toBe(true)
      expect(body.facts.length).toBeGreaterThan(0)
    })

    it("retorna detalle técnico para SKU 3 (PT100)", async () => {
      const { req, res, getResponse } = createMockContext({
        headers: {
          authorization: `Bearer ${TEST_TOKEN}`,
        },
        params: { variantId: "CN-DEMO-PT100-3W-A1" },
      })

      await GET(req, res)
      const response = getResponse()

      expect(response.status).toBe(200)
      const body = response.body
      expect(body.sku).toBe("CN-DEMO-PT100-3W-A1")
      expect(body.model).toBe("CN-RTD-P1")
      expect(body.product_url).toBe("http://52.20.66.203:8000/pe/products/cn-demo-pt100-3w-a1")
      expect(body.demo).toBe(true)
      expect(body.facts.length).toBeGreaterThan(0)
    })
  })
})
