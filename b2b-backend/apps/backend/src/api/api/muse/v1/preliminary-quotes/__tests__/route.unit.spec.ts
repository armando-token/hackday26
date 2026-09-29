import { POST } from "../route"
import { getPool, closePool, getTechnicalProfile } from "../../../../../../lib/muse/db"
import fs from "fs"
import path from "path"

describe("POST /api/muse/v1/preliminary-quotes", () => {
  const originalToken = process.env.MUSE_API_TOKEN
  const TEST_TOKEN = "mus_test_secret_token_preliminary_quotes_1234"

  const PLC_SKU = "CN-DEMO-PLC-DIN-420-MR1"
  let PLC_VARIANT_ID = PLC_SKU

  beforeAll(async () => {
    process.env.MUSE_API_TOKEN = TEST_TOKEN
    try {
      const profile = await getTechnicalProfile(PLC_SKU)
      if (profile && profile.variant_id) {
        PLC_VARIANT_ID = profile.variant_id
      }
    } catch {}
  })

  afterAll(async () => {
    process.env.MUSE_API_TOKEN = originalToken
    // Clean up test quotes generated during unit testing
    try {
      const pool = getPool()
      await pool.query(
        "DELETE FROM preliminary_quote WHERE idempotency_key LIKE 'unit-test-%' OR id LIKE 'unit-test-%'"
      )
    } catch {}
    await closePool().catch(() => {})
  })

  function createMockContext(options: {
    headers?: Record<string, string>
    body?: any
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
      body: options.body,
      method: "POST",
      url: "/api/muse/v1/preliminary-quotes",
      originalUrl: "/api/muse/v1/preliminary-quotes",
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

  describe("1. Authentication with verifyMuseAuth (HTTP 401)", () => {
    it("returns HTTP 401 when Authorization header is missing", async () => {
      const { req, res, getResponse } = createMockContext({
        headers: {},
        body: { variant_id: PLC_VARIANT_ID, quantity: 1 },
      })

      await POST(req, res)
      const resp = getResponse()

      expect(resp.status).toBe(401)
      expect(resp.body).toHaveProperty("error")
      expect(resp.body.error.code).toBe("UNAUTHORIZED")
      expect(resp.body.error.message).toBe("Missing or invalid bearer token")
      expect(resp.body).toHaveProperty("request_id")
      expect(resp.headers["Cache-Control"]).toBe("no-store")
      expect(resp.headers["X-Request-Id"]).toBeDefined()
    })

    it("returns HTTP 401 when token is invalid", async () => {
      const { req, res, getResponse } = createMockContext({
        headers: { authorization: "Bearer invalid_wrong_token" },
        body: { variant_id: PLC_VARIANT_ID, quantity: 1 },
      })

      await POST(req, res)
      const resp = getResponse()

      expect(resp.status).toBe(401)
      expect(resp.body.error.code).toBe("UNAUTHORIZED")
    })
  })

  describe("2. Request Body Validation (HTTP 400)", () => {
    it("returns HTTP 400 when body is missing or not a JSON object", async () => {
      const { req, res, getResponse } = createMockContext({
        headers: { authorization: `Bearer ${TEST_TOKEN}` },
        body: null,
      })

      await POST(req, res)
      const resp = getResponse()

      expect(resp.status).toBe(400)
      expect(resp.body.error.code).toBe("INVALID_REQUEST")
    })

    it("returns HTTP 400 when variant_id is missing or empty string", async () => {
      const { req, res, getResponse } = createMockContext({
        headers: { authorization: `Bearer ${TEST_TOKEN}` },
        body: { variant_id: "   ", quantity: 2 },
      })

      await POST(req, res)
      const resp = getResponse()

      expect(resp.status).toBe(400)
      expect(resp.body.error.code).toBe("INVALID_REQUEST")
      expect(resp.body.error.message).toContain("variant_id is required")
    })

    it("returns HTTP 400 when quantity is missing or not an integer", async () => {
      const { req, res, getResponse } = createMockContext({
        headers: { authorization: `Bearer ${TEST_TOKEN}` },
        body: { variant_id: PLC_VARIANT_ID, quantity: 2.5 },
      })

      await POST(req, res)
      const resp = getResponse()

      expect(resp.status).toBe(400)
      expect(resp.body.error.code).toBe("INVALID_REQUEST")
      expect(resp.body.error.message).toContain("quantity must be an integer")
    })

    it("returns HTTP 400 when quantity is less than 1", async () => {
      const { req, res, getResponse } = createMockContext({
        headers: { authorization: `Bearer ${TEST_TOKEN}` },
        body: { variant_id: PLC_VARIANT_ID, quantity: 0 },
      })

      await POST(req, res)
      const resp = getResponse()

      expect(resp.status).toBe(400)
      expect(resp.body.error.code).toBe("INVALID_REQUEST")
      expect(resp.body.error.message).toContain("quantity must be an integer between 1 and 20")
    })

    it("returns HTTP 400 when quantity exceeds 20", async () => {
      const { req, res, getResponse } = createMockContext({
        headers: { authorization: `Bearer ${TEST_TOKEN}` },
        body: { variant_id: PLC_VARIANT_ID, quantity: 21 },
      })

      await POST(req, res)
      const resp = getResponse()

      expect(resp.status).toBe(400)
      expect(resp.body.error.code).toBe("INVALID_REQUEST")
      expect(resp.body.error.message).toContain("quantity must be an integer between 1 and 20")
    })
  })

  describe("3. Non-demo / Non-existent Variant Isolation (HTTP 404)", () => {
    it("returns HTTP 404 when variant does not exist or is outside demo catalog", async () => {
      const { req, res, getResponse } = createMockContext({
        headers: { authorization: `Bearer ${TEST_TOKEN}` },
        body: { variant_id: "variant_non_existent_or_foreign_catalog_12345", quantity: 1 },
      })

      await POST(req, res)
      const resp = getResponse()

      expect(resp.status).toBe(404)
      expect(resp.body.error.code).toBe("NOT_FOUND")
      expect(resp.body.error.message).toContain("not found or outside demo")
    })
  })

  describe("4. Security: Price and Stock Tampering Prevention", () => {
    it("completely strips and ignores client-injected price and stock fields", async () => {
      const { req, res, getResponse } = createMockContext({
        headers: { authorization: `Bearer ${TEST_TOKEN}` },
        body: {
          variant_id: PLC_VARIANT_ID,
          quantity: 1,
          price: 0.01,
          unit_price: 1.0,
          unit_price_minor: 100,
          subtotal: 1.0,
          subtotal_minor: 100,
          in_stock: true,
          stock: 999999,
          available_quantity: 999999,
        },
      })

      await POST(req, res)
      const resp = getResponse()

      expect(resp.status).toBe(201)
      expect(resp.body.summary).toBeDefined()
      // Real Medusa price is 890 PEN, NOT the injected 1.00 PEN
      expect(resp.body.summary.unit_price).toBe(890)
      expect(resp.body.summary.subtotal).toBe(890)
      expect(resp.body.summary.currency).toBe("pen")
      // Real available stock is 3, NOT the injected 999999
      expect(resp.body.summary.availability.available_quantity).toBe(3)
    })
  })

  describe("5. Successful Preliminary Quote Creation (HTTP 201 Created)", () => {
    let createdQuoteId = ""
    let createdPublicId = ""
    let downloadToken = ""

    it("creates a preliminary quote, generates PDF, persists to DB, and returns HTTP 201", async () => {
      const testKey = `unit-test-create-${Date.now()}`
      const { req, res, getResponse } = createMockContext({
        headers: {
          authorization: `Bearer ${TEST_TOKEN}`,
          "x-request-id": "req-quote-test-unit-001",
        },
        body: {
          variant_id: PLC_VARIANT_ID,
          quantity: 2,
          idempotency_key: testKey,
        },
      })

      await POST(req, res)
      const resp = getResponse()

      expect(resp.status).toBe(201)
      expect(resp.headers["Cache-Control"]).toBe("no-store")
      expect(resp.headers["X-Request-Id"]).toBe("req-quote-test-unit-001")

      const body = resp.body
      expect(body).toHaveProperty("quote_id")
      expect(body.quote_id).toMatch(/^pquote_/)
      expect(body).toHaveProperty("opaque_public_id")
      expect(body.opaque_public_id).toHaveLength(32)
      expect(body.status).toBe("priced")
      expect(body.observed_at).toBeDefined()
      expect(body.expires_at).toBeDefined()
      expect(body.pdf_url).toContain(`https://data.controlnautas.com/api/muse/v1/quotes/${body.opaque_public_id}/pdf?token=`)
      expect(body.request_id).toBe("req-quote-test-unit-001")

      // Verify summary fields
      expect(body.summary).toBeDefined()
      expect(body.summary.sku).toBe(PLC_SKU)
      expect(body.summary.model).toBe("CN-DIN-PLC-A1")
      expect(body.summary.quantity).toBe(2)
      expect(body.summary.currency).toBe("pen")
      expect(body.summary.unit_price).toBe(890)
      expect(body.summary.subtotal).toBe(1780)
      expect(body.summary.availability.status).toBe("in_stock")
      expect(body.summary.product_url).toContain("https://data.controlnautas.com/pe/products/")

      createdQuoteId = body.quote_id
      createdPublicId = body.opaque_public_id
      downloadToken = body.pdf_url.split("token=")[1]

      // Verify physical PDF generated on disk
      const pdfPath = path.resolve(
        "/home/ubuntu/hackday26/storage/quotes",
        `${createdPublicId}.pdf`
      )
      expect(fs.existsSync(pdfPath)).toBe(true)
      const stat = fs.statSync(pdfPath)
      expect(stat.size).toBeGreaterThan(1000)

      // Verify record persisted in PostgreSQL preliminary_quote table
      const pool = getPool()
      const dbRes = await pool.query(
        "SELECT * FROM preliminary_quote WHERE id = $1",
        [createdQuoteId]
      )
      expect(dbRes.rows).toHaveLength(1)
      const row = dbRes.rows[0]
      expect(row.opaque_public_id).toBe(createdPublicId)
      expect(row.sku).toBe(PLC_SKU)
      expect(row.quantity).toBe(2)
      expect(Number(row.unit_price_minor)).toBe(89000)
      expect(Number(row.subtotal_minor)).toBe(178000)
      expect(row.download_token).toBe(downloadToken)
      expect(row.tax_status).toBe("tax_excluded")
      expect(row.shipping_status).toBe("to_be_confirmed")
      expect(row.product_url).toBe("https://data.controlnautas.com/pe/products/cn-demo-plc-din-420-mr1")
    })
  })

  describe("6. Idempotency Replay and Conflict (HTTP 200 & HTTP 409)", () => {
    const idemKey = `unit-test-idem-${Date.now()}`
    let initialQuoteId = ""
    let initialPdfUrl = ""

    it("creates initial quote with idempotency_key (HTTP 201)", async () => {
      const { req, res, getResponse } = createMockContext({
        headers: { authorization: `Bearer ${TEST_TOKEN}` },
        body: {
          variant_id: PLC_VARIANT_ID,
          quantity: 2,
          idempotency_key: idemKey,
        },
      })

      await POST(req, res)
      const resp = getResponse()

      expect(resp.status).toBe(201)
      initialQuoteId = resp.body.quote_id
      initialPdfUrl = resp.body.pdf_url
      expect(initialQuoteId).toBeDefined()
    })

    it("replays existing snapshot with HTTP 200 OK when same key and same body are sent", async () => {
      const { req, res, getResponse } = createMockContext({
        headers: { authorization: `Bearer ${TEST_TOKEN}` },
        body: {
          variant_id: PLC_VARIANT_ID,
          quantity: 2,
          idempotency_key: idemKey,
        },
      })

      await POST(req, res)
      const resp = getResponse()

      expect(resp.status).toBe(200)
      expect(resp.body.quote_id).toBe(initialQuoteId)
      expect(resp.body.pdf_url).toBe(initialPdfUrl)
      expect(resp.body.summary.quantity).toBe(2)
      expect(resp.body.summary.unit_price).toBe(890)
      expect(resp.body.summary.subtotal).toBe(1780)
    })

    it("rejects with HTTP 409 Conflict with code 'IDEMPOTENCY_CONFLICT' when same key has different body", async () => {
      const { req, res, getResponse } = createMockContext({
        headers: { authorization: `Bearer ${TEST_TOKEN}` },
        body: {
          variant_id: PLC_VARIANT_ID,
          quantity: 3, // Changed quantity from 2 to 3
          idempotency_key: idemKey,
        },
      })

      await POST(req, res)
      const resp = getResponse()

      expect(resp.status).toBe(409)
      expect(resp.body).toHaveProperty("error")
      expect(resp.body.error.code).toBe("IDEMPOTENCY_CONFLICT")
      expect(resp.body.error.message).toContain("different request payload")
      expect(resp.headers["Cache-Control"]).toBe("no-store")
    })
  })

  describe("7. Base URL Configuration and PUBLIC_MUSE_BASE_URL Support", () => {
    const originalBaseUrl = process.env.PUBLIC_MUSE_BASE_URL

    afterEach(() => {
      if (originalBaseUrl !== undefined) {
        process.env.PUBLIC_MUSE_BASE_URL = originalBaseUrl
      } else {
        delete process.env.PUBLIC_MUSE_BASE_URL
      }
    })

    it("uses default https://data.controlnautas.com when PUBLIC_MUSE_BASE_URL is not set", async () => {
      delete process.env.PUBLIC_MUSE_BASE_URL
      const testKey = `unit-test-url-default-${Date.now()}`
      const { req, res, getResponse } = createMockContext({
        headers: { authorization: `Bearer ${TEST_TOKEN}` },
        body: {
          variant_id: PLC_VARIANT_ID,
          quantity: 1,
          idempotency_key: testKey,
        },
      })

      await POST(req, res)
      const resp = getResponse()

      expect(resp.status).toBe(201)
      expect(resp.body.pdf_url).toMatch(
        /^https:\/\/data\.controlnautas\.com\/api\/muse\/v1\/quotes\/[a-f0-9]{32}\/pdf\?token=[a-f0-9]{48}$/
      )
      expect(resp.body.summary.product_url).toBe(
        "https://data.controlnautas.com/pe/products/cn-demo-plc-din-420-mr1"
      )
    })

    it("respects PUBLIC_MUSE_BASE_URL when defined", async () => {
      process.env.PUBLIC_MUSE_BASE_URL = "https://custom-muse.example.com"
      const testKey = `unit-test-url-custom-${Date.now()}`
      const { req, res, getResponse } = createMockContext({
        headers: { authorization: `Bearer ${TEST_TOKEN}` },
        body: {
          variant_id: PLC_VARIANT_ID,
          quantity: 1,
          idempotency_key: testKey,
        },
      })

      await POST(req, res)
      const resp = getResponse()

      expect(resp.status).toBe(201)
      expect(resp.body.pdf_url).toMatch(
        /^https:\/\/custom-muse\.example\.com\/api\/muse\/v1\/quotes\/[a-f0-9]{32}\/pdf\?token=[a-f0-9]{48}$/
      )
      expect(resp.body.summary.product_url).toBe(
        "https://custom-muse.example.com/pe/products/cn-demo-plc-din-420-mr1"
      )
    })
  })
})
