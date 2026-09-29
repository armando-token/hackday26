import { GET } from "../route"
import { closePool, getTechnicalProfile } from "../../../../../../../../lib/muse/db"

describe("GET /api/muse/v1/products/[variantId]/offer", () => {
  const originalToken = process.env.MUSE_API_TOKEN
  const TEST_TOKEN = "mus_test_secret_token_value_for_offer_tests_9999"
  let PLC_VARIANT_ID = "variant_01M3QAJ590Z5C5GH7VD3TKS4T3"

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
      params: options.params || {},
      query: options.query || {},
      method: "GET",
      url: `/api/muse/v1/products/${options.params?.variantId || ""}/offer`,
      originalUrl: `/api/muse/v1/products/${options.params?.variantId || ""}/offer`,
    }

    const res: any = {
      statusCode: 200,
      setHeader: jest.fn((name: string, value: string) => {
        responseHeaders[name] = value
        responseHeaders[name.toLowerCase()] = value
      }),
      getHeader: jest.fn((name: string) => {
        return responseHeaders[name] || responseHeaders[name.toLowerCase()]
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

  describe("1. Autenticación con verifyMuseAuth (HTTP 401)", () => {
    it("retorna HTTP 401 si no se envía header Authorization", async () => {
      const { req, res, getResponse } = createMockContext({
        headers: {},
        params: { variantId: PLC_VARIANT_ID },
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

    it("retorna HTTP 401 si el Bearer token es inválido", async () => {
      const { req, res, getResponse } = createMockContext({
        headers: {
          authorization: "Bearer invalid_wrong_token_12345",
        },
        params: { variantId: PLC_VARIANT_ID },
      })

      await GET(req, res)
      const response = getResponse()

      expect(response.status).toBe(401)
      expect(response.body).toHaveProperty("error")
      expect(response.body.error.code).toBe("UNAUTHORIZED")
      expect(response.body).toHaveProperty("request_id")
      expect(response.headers["Cache-Control"]).toBe("no-store")
    })

    it("propaga el x-request-id enviado por el cliente en error 401", async () => {
      const customId = "req_custom_auth_offer_001"
      const { req, res, getResponse } = createMockContext({
        headers: {
          "x-request-id": customId,
        },
        params: { variantId: PLC_VARIANT_ID },
      })

      await GET(req, res)
      const response = getResponse()

      expect(response.headers["X-Request-Id"]).toBe(customId)
      expect(response.body.request_id).toBe(customId)
    })
  })

  describe("2. Validación de parámetro 'quantity' (HTTP 400 INVALID_PARAM)", () => {
    it("retorna HTTP 400 con INVALID_PARAM si quantity=0", async () => {
      const { req, res, getResponse } = createMockContext({
        headers: { authorization: `Bearer ${TEST_TOKEN}` },
        params: { variantId: PLC_VARIANT_ID },
        query: { quantity: "0" },
      })

      await GET(req, res)
      const response = getResponse()

      expect(response.status).toBe(400)
      expect(response.body.error.code).toBe("INVALID_PARAM")
      expect(response.body.error.message).toContain("integer between 1 and 20")
      expect(response.body.request_id).toBeDefined()
      expect(response.headers["Cache-Control"]).toBe("no-store")
    })

    it("retorna HTTP 400 con INVALID_PARAM si quantity=99", async () => {
      const { req, res, getResponse } = createMockContext({
        headers: { authorization: `Bearer ${TEST_TOKEN}` },
        params: { variantId: PLC_VARIANT_ID },
        query: { quantity: "99" },
      })

      await GET(req, res)
      const response = getResponse()

      expect(response.status).toBe(400)
      expect(response.body.error.code).toBe("INVALID_PARAM")
      expect(response.body.request_id).toBeDefined()
    })

    it("retorna HTTP 400 con INVALID_PARAM si quantity=abc", async () => {
      const { req, res, getResponse } = createMockContext({
        headers: { authorization: `Bearer ${TEST_TOKEN}` },
        params: { variantId: PLC_VARIANT_ID },
        query: { quantity: "abc" },
      })

      await GET(req, res)
      const response = getResponse()

      expect(response.status).toBe(400)
      expect(response.body.error.code).toBe("INVALID_PARAM")
      expect(response.body.request_id).toBeDefined()
    })

    it("retorna HTTP 400 con INVALID_PARAM si quantity es decimal (1.5)", async () => {
      const { req, res, getResponse } = createMockContext({
        headers: { authorization: `Bearer ${TEST_TOKEN}` },
        params: { variantId: PLC_VARIANT_ID },
        query: { quantity: "1.5" },
      })

      await GET(req, res)
      const response = getResponse()

      expect(response.status).toBe(400)
      expect(response.body.error.code).toBe("INVALID_PARAM")
    })

    it("retorna HTTP 400 con INVALID_PARAM si quantity es negativo (-3)", async () => {
      const { req, res, getResponse } = createMockContext({
        headers: { authorization: `Bearer ${TEST_TOKEN}` },
        params: { variantId: PLC_VARIANT_ID },
        query: { quantity: "-3" },
      })

      await GET(req, res)
      const response = getResponse()

      expect(response.status).toBe(400)
      expect(response.body.error.code).toBe("INVALID_PARAM")
    })
  })

  describe("3. Aislamiento y 404 (NOT_FOUND)", () => {
    it("retorna HTTP 404 con code NOT_FOUND si la variante no existe", async () => {
      const { req, res, getResponse } = createMockContext({
        headers: { authorization: `Bearer ${TEST_TOKEN}` },
        params: { variantId: "variant_inventada_inexistente_999" },
      })

      await GET(req, res)
      const response = getResponse()

      expect(response.status).toBe(404)
      expect(response.body.error.code).toBe("NOT_FOUND")
      expect(response.body.request_id).toBeDefined()
      expect(response.headers["Cache-Control"]).toBe("no-store")
      expect(response.headers["X-Request-Id"]).toBeDefined()
    })

    it("retorna HTTP 404 con code NOT_FOUND si variantId está vacío", async () => {
      const { req, res, getResponse } = createMockContext({
        headers: { authorization: `Bearer ${TEST_TOKEN}` },
        params: { variantId: "" },
      })

      await GET(req, res)
      const response = getResponse()

      expect(response.status).toBe(404)
      expect(response.body.error.code).toBe("NOT_FOUND")
    })
  })

  describe("4. Oferta Viva Exitosa (HTTP 200 OK)", () => {
    it("retorna oferta viva por defecto con quantity=1 para SKU 1 (PLC DIN)", async () => {
      const { req, res, getResponse } = createMockContext({
        headers: { authorization: `Bearer ${TEST_TOKEN}` },
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
      expect(body.quantity).toBe(1)
      expect(body.state).toBe("priced")
      expect(body.currency).toBe("usd")
      expect(body.unit_price).toBe(890)
      expect(body.unit_price_minor).toBe(89000)
      expect(body.subtotal).toBe(890)
      expect(body.subtotal_minor).toBe(89000)
      expect(body.scale).toBe(2)

      // Availability
      expect(body.availability).toBeDefined()
      expect(body.availability.status).toBe("in_stock")
      expect(body.availability.stocked_quantity).toBe(3)
      expect(body.availability.available_quantity).toBe(3)
      expect(body.availability.reserved_quantity).toBe(0)

      // Commercial metadata
      expect(body.tax_status).toBe("tax_excluded")
      expect(body.shipping_status).toBe("to_be_confirmed")
      expect(Array.isArray(body.limitations)).toBe(true)
      expect(body.observed_at).toBeDefined()
      expect(body.request_id).toBeDefined()
    })

    it("calcula subtotal correctamente para quantity=2 (subtotal = 2 * unit_price)", async () => {
      const { req, res, getResponse } = createMockContext({
        headers: { authorization: `Bearer ${TEST_TOKEN}` },
        params: { variantId: PLC_VARIANT_ID },
        query: { quantity: "2" },
      })

      await GET(req, res)
      const response = getResponse()

      expect(response.status).toBe(200)
      const body = response.body
      expect(body.quantity).toBe(2)
      expect(body.unit_price).toBe(890)
      expect(body.unit_price_minor).toBe(89000)
      expect(body.subtotal).toBe(1780)
      expect(body.subtotal_minor).toBe(178000)
    })

    it("retorna oferta consultando por SKU demo (CN-DEMO-PID-PT100-RS1)", async () => {
      const { req, res, getResponse } = createMockContext({
        headers: { authorization: `Bearer ${TEST_TOKEN}` },
        params: { variantId: "CN-DEMO-PID-PT100-RS1" },
        query: { quantity: "1" },
      })

      await GET(req, res)
      const response = getResponse()

      expect(response.status).toBe(200)
      const body = response.body
      expect(body.sku).toBe("CN-DEMO-PID-PT100-RS1")
      expect(body.state).toBe("priced")
      expect(body.unit_price).toBe(480)
      expect(body.unit_price_minor).toBe(48000)
      expect(body.subtotal).toBe(480)
      expect(body.availability.stocked_quantity).toBe(2)
    })

    it("retorna oferta viva para SKU 3 (CN-DEMO-PT100-3W-A1)", async () => {
      const { req, res, getResponse } = createMockContext({
        headers: { authorization: `Bearer ${TEST_TOKEN}` },
        params: { variantId: "CN-DEMO-PT100-3W-A1" },
        query: { quantity: "3" },
      })

      await GET(req, res)
      const response = getResponse()

      expect(response.status).toBe(200)
      const body = response.body
      expect(body.sku).toBe("CN-DEMO-PT100-3W-A1")
      expect(body.quantity).toBe(3)
      expect(body.unit_price).toBe(75)
      expect(body.unit_price_minor).toBe(7500)
      expect(body.subtotal).toBe(225)
      expect(body.subtotal_minor).toBe(22500)
      expect(body.availability.stocked_quantity).toBe(8)
    })

    it("soporta parámetro opcional region_id", async () => {
      const customRegion = "reg_custom_pe_001"
      const { req, res, getResponse } = createMockContext({
        headers: { authorization: `Bearer ${TEST_TOKEN}` },
        params: { variantId: "CN-DEMO-PLC-DIN-420-MR1" },
        query: { region_id: customRegion },
      })

      await GET(req, res)
      const response = getResponse()

      expect(response.status).toBe(200)
      expect(response.body.region_id).toBe(customRegion)
    })

    it("utiliza la región demo por defecto cuando no se pasa region_id", async () => {
      const { req, res, getResponse } = createMockContext({
        headers: { authorization: `Bearer ${TEST_TOKEN}` },
        params: { variantId: "CN-DEMO-PLC-DIN-420-MR1" },
      })

      await GET(req, res)
      const response = getResponse()

      expect(response.status).toBe(200)
      expect(response.body.region_id).toBe("reg_01JUS00HACKDAY26DEMOUSD0000")
    })
  })
})
