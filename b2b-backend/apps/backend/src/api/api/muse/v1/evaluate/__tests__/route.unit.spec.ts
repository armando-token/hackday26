import { POST } from "../route"
import { closePool, getTechnicalProfile } from "../../../../../../lib/muse/db"

describe("POST /api/muse/v1/evaluate", () => {
  const originalToken = process.env.MUSE_API_TOKEN
  const TEST_TOKEN = "mus_test_secret_token_value_for_evaluate_tests_1234"

  // Demo variant ID and SKU from PostgreSQL
  let PLC_VARIANT_ID = "variant_01M3Q974QF1HZECRQV1MK969WX"
  const PLC_SKU = "CN-DEMO-PLC-DIN-420-MR1"

  beforeAll(async () => {
    process.env.MUSE_API_TOKEN = TEST_TOKEN
    const profile = await getTechnicalProfile(PLC_SKU)
    if (profile) {
      PLC_VARIANT_ID = profile.variant_id
    }
  })

  afterAll(async () => {
    process.env.MUSE_API_TOKEN = originalToken
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
      url: "/api/muse/v1/evaluate",
      originalUrl: "/api/muse/v1/evaluate",
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

  describe("1. Autenticación Bearer con auth-guard (401)", () => {
    it("falla con HTTP 401 si no se envía header Authorization", async () => {
      const { req, res, getResponse } = createMockContext({
        headers: {},
        body: { variant_id: PLC_VARIANT_ID, requirements: [{ id: "r1", property: "mounting", operator: "equals", value: "DIN rail" }] },
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

    it("falla con HTTP 401 si el esquema no es Bearer", async () => {
      const { req, res, getResponse } = createMockContext({
        headers: { authorization: `Basic ${TEST_TOKEN}` },
        body: { variant_id: PLC_VARIANT_ID, requirements: [{ id: "r1", property: "mounting", operator: "equals" }] },
      })

      await POST(req, res)
      const resp = getResponse()

      expect(resp.status).toBe(401)
      expect(resp.body.error.code).toBe("UNAUTHORIZED")
    })

    it("falla con HTTP 401 si el token Bearer no coincide", async () => {
      const { req, res, getResponse } = createMockContext({
        headers: { authorization: "Bearer invalid_secret_token" },
        body: { variant_id: PLC_VARIANT_ID, requirements: [{ id: "r1", property: "mounting", operator: "equals" }] },
      })

      await POST(req, res)
      const resp = getResponse()

      expect(resp.status).toBe(401)
      expect(resp.body.error.code).toBe("UNAUTHORIZED")
    })
  })

  describe("2. Validación del Body con schema-validator (400 INVALID_REQUEST)", () => {
    const validAuth = { authorization: `Bearer ${TEST_TOKEN}` }

    it("falla con HTTP 400 si el body es nulo o no es objeto", async () => {
      const { req, res, getResponse } = createMockContext({
        headers: validAuth,
        body: null,
      })

      await POST(req, res)
      const resp = getResponse()

      expect(resp.status).toBe(400)
      expect(resp.body.error.code).toBe("INVALID_REQUEST")
      expect(resp.body).toHaveProperty("request_id")
    })

    it("falla con HTTP 400 si variant_id está ausente o vacío", async () => {
      const { req, res, getResponse } = createMockContext({
        headers: validAuth,
        body: {
          variant_id: "   ",
          requirements: [{ id: "r1", property: "mounting", operator: "equals" }],
        },
      })

      await POST(req, res)
      const resp = getResponse()

      expect(resp.status).toBe(400)
      expect(resp.body.error.code).toBe("INVALID_REQUEST")
    })

    it("falla con HTTP 400 si requirements no es un array", async () => {
      const { req, res, getResponse } = createMockContext({
        headers: validAuth,
        body: {
          variant_id: PLC_VARIANT_ID,
          requirements: "not-an-array",
        },
      })

      await POST(req, res)
      const resp = getResponse()

      expect(resp.status).toBe(400)
      expect(resp.body.error.code).toBe("INVALID_REQUEST")
    })

    it("falla con HTTP 400 si requirements está vacío (0 elementos)", async () => {
      const { req, res, getResponse } = createMockContext({
        headers: validAuth,
        body: {
          variant_id: PLC_VARIANT_ID,
          requirements: [],
        },
      })

      await POST(req, res)
      const resp = getResponse()

      expect(resp.status).toBe(400)
      expect(resp.body.error.code).toBe("INVALID_REQUEST")
    })

    it("falla con HTTP 400 si requirements contiene más de 10 elementos", async () => {
      const excessiveReqs = Array.from({ length: 11 }, (_, i) => ({
        id: `r${i + 1}`,
        property: "mounting",
        operator: "equals",
      }))

      const { req, res, getResponse } = createMockContext({
        headers: validAuth,
        body: {
          variant_id: PLC_VARIANT_ID,
          requirements: excessiveReqs,
        },
      })

      await POST(req, res)
      const resp = getResponse()

      expect(resp.status).toBe(400)
      expect(resp.body.error.code).toBe("INVALID_REQUEST")
    })

    it("falla con HTTP 400 si un requirement tiene una property fuera del vocabulario cerrado", async () => {
      const { req, res, getResponse } = createMockContext({
        headers: validAuth,
        body: {
          variant_id: PLC_VARIANT_ID,
          requirements: [
            { id: "r1", property: "color_inventado", operator: "equals" },
          ],
        },
      })

      await POST(req, res)
      const resp = getResponse()

      expect(resp.status).toBe(400)
      expect(resp.body.error.code).toBe("INVALID_REQUEST")
      expect(resp.body.error.message).toContain("invalid property")
    })

    it("falla con HTTP 400 si un requirement tiene un operator no permitido", async () => {
      const { req, res, getResponse } = createMockContext({
        headers: validAuth,
        body: {
          variant_id: PLC_VARIANT_ID,
          requirements: [
            { id: "r1", property: "mounting", operator: "regex_match" },
          ],
        },
      })

      await POST(req, res)
      const resp = getResponse()

      expect(resp.status).toBe(400)
      expect(resp.body.error.code).toBe("INVALID_REQUEST")
      expect(resp.body.error.message).toContain("invalid operator")
    })
  })

  describe("3. Verificación de Catálogo Demo (404 NOT_FOUND)", () => {
    const validAuth = { authorization: `Bearer ${TEST_TOKEN}` }

    it("retorna HTTP 404 si variant_id no existe en la base de datos", async () => {
      const { req, res, getResponse } = createMockContext({
        headers: validAuth,
        body: {
          variant_id: "variant_non_existent_fake_9999",
          requirements: [{ id: "r1", property: "mounting", operator: "equals" }],
        },
      })

      await POST(req, res)
      const resp = getResponse()

      expect(resp.status).toBe(404)
      expect(resp.body.error.code).toBe("NOT_FOUND")
      expect(resp.headers["Cache-Control"]).toBe("no-store")
      expect(resp.headers["X-Request-Id"]).toBeDefined()
    })
  })

  describe("4. Evaluación Exitosa y Respuesta HTTP 200", () => {
    const validAuth = {
      authorization: `Bearer ${TEST_TOKEN}`,
      "x-request-id": "eval_test_req_uuid_42",
    }

    it("evalúa exitosamente requisitos satisfechos y responde HTTP 200 con formato canónico", async () => {
      const { req, res, getResponse } = createMockContext({
        headers: validAuth,
        body: {
          variant_id: PLC_VARIANT_ID,
          requirements: [
            {
              id: "r1",
              property: "mounting",
              operator: "equals",
              value: "DIN rail",
            },
            {
              id: "r2",
              property: "supply_voltage",
              operator: "range_contains",
              min: 24,
              max: 24,
              unit: "VDC",
            },
            {
              id: "r3",
              property: "analog_input",
              operator: "range_contains",
              min: 4,
              max: 20,
              unit: "mA",
            },
          ],
        },
      })

      await POST(req, res)
      const resp = getResponse()

      expect(resp.status).toBe(200)
      expect(resp.headers["Cache-Control"]).toBe("no-store")
      expect(resp.headers["X-Request-Id"]).toBe("eval_test_req_uuid_42")

      const data = resp.body
      expect(data.variant_id).toBe(PLC_VARIANT_ID)
      expect(data.sku).toBe(PLC_SKU)
      expect(data.overall_satisfied).toBe(true)
      expect(data.request_id).toBe("eval_test_req_uuid_42")
      expect(data.source_revision).toBe("rev-2026.1")
      expect(typeof data.evaluated_at).toBe("string")
      expect(Array.isArray(data.evaluations)).toBe(true)
      expect(data.evaluations.length).toBe(3)

      // Verificar estructura de cada evaluación individual
      const firstEval = data.evaluations[0]
      expect(firstEval).toHaveProperty("requirement_id", "r1")
      expect(firstEval).toHaveProperty("property", "mounting")
      expect(firstEval).toHaveProperty("operator", "equals")
      expect(firstEval).toHaveProperty("satisfied", true)
      expect(typeof firstEval.reason).toBe("string")
      expect(firstEval.fact_display_value).toContain("DIN")

      // Verificar evidencia de fuente
      expect(firstEval.source_evidence).toBeDefined()
      expect(firstEval.source_evidence.source_id).toBe("SRC-CN-DIN-PLC-A1-DS-V1")
      expect(firstEval.source_evidence.source_revision).toBe("rev-2026.1")
      expect(firstEval.source_evidence.url).toContain("CN-DEMO-PLC-DIN-420-MR1.pdf")
      expect(firstEval.source_evidence.page).toBe(1)
      expect(typeof firstEval.source_evidence.section).toBe("string")
      expect(typeof firstEval.source_evidence.excerpt).toBe("string")
    })

    it("evalúa también por SKU si el cliente proporciona SKU como variant_id", async () => {
      const { req, res, getResponse } = createMockContext({
        headers: validAuth,
        body: {
          variant_id: PLC_SKU,
          requirements: [
            { id: "r1", property: "mounting", operator: "equals", value: "DIN rail" },
          ],
        },
      })

      await POST(req, res)
      const resp = getResponse()

      expect(resp.status).toBe(200)
      expect(resp.body.variant_id).toBe(PLC_VARIANT_ID)
      expect(resp.body.sku).toBe(PLC_SKU)
      expect(resp.body.overall_satisfied).toBe(true)
    })
  })

  describe("5. Contraejemplos y overall_satisfied = false", () => {
    const validAuth = { authorization: `Bearer ${TEST_TOKEN}` }

    it("falla la evaluación si se requiere Modbus TCP en PLC DIN (contraejemplo)", async () => {
      const { req, res, getResponse } = createMockContext({
        headers: validAuth,
        body: {
          variant_id: PLC_VARIANT_ID,
          requirements: [
            {
              id: "r1",
              property: "protocol",
              operator: "equals",
              value: "Modbus TCP",
            },
          ],
        },
      })

      await POST(req, res)
      const resp = getResponse()

      expect(resp.status).toBe(200)
      expect(resp.body.overall_satisfied).toBe(false)
      expect(resp.body.evaluations[0].satisfied).toBe(false)
      expect(resp.body.evaluations[0].reason).toContain("Modbus RTU")
    })

    it("falla la evaluación si se requiere analog_output en PLC DIN (hecho negativo / contraejemplo)", async () => {
      const { req, res, getResponse } = createMockContext({
        headers: validAuth,
        body: {
          variant_id: PLC_VARIANT_ID,
          requirements: [
            {
              id: "r1",
              property: "analog_output",
              operator: "equals",
              value: "4-20 mA",
            },
          ],
        },
      })

      await POST(req, res)
      const resp = getResponse()

      expect(resp.status).toBe(200)
      expect(resp.body.overall_satisfied).toBe(false)
      expect(resp.body.evaluations[0].satisfied).toBe(false)
      // Debe contener cita de evidencia de ausencia
      expect(resp.body.evaluations[0].source_evidence).toBeDefined()
      expect(resp.body.evaluations[0].source_evidence.excerpt).toBeDefined()
    })
  })
})
