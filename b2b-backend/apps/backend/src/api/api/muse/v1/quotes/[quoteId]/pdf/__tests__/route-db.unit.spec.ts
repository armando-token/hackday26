import fs from "fs"
import path from "path"
import { getPool } from "../../../../../../../../lib/muse/db"
import { GET } from "../route"

describe("Database Integration: GET /api/muse/v1/quotes/[quoteId]/pdf", () => {
  const pool = getPool()
  const STORAGE_DIR = "/home/ubuntu/hackday26/storage/quotes"
  const TEST_PDF_KEY = "test-integration-quote-sample.pdf"
  const TEST_PDF_PATH = path.join(STORAGE_DIR, TEST_PDF_KEY)

  const TEST_QUOTE_ID = "pquote_integration_test_id_001"
  const TEST_OPAQUE_ID = "pq_testintegration001"
  const TEST_TOKEN = "tok_integration_valid_download_token_123"
  const TEST_SKU = "CN-DEMO-PID-PT100-RS1"

  beforeAll(async () => {
    // 1. Create test PDF file on disk
    if (!fs.existsSync(STORAGE_DIR)) {
      fs.mkdirSync(STORAGE_DIR, { recursive: true })
    }
    fs.writeFileSync(
      TEST_PDF_PATH,
      "%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n"
    )

    // 2. Insert test quote into preliminary_quote table
    await pool.query(
      `
      INSERT INTO preliminary_quote (
        id,
        opaque_public_id,
        status,
        variant_id,
        sku,
        model,
        title,
        quantity,
        region_id,
        currency,
        unit_price_minor,
        unit_price_decimal,
        subtotal_minor,
        subtotal_decimal,
        tax_status,
        tax_amount_minor,
        shipping_status,
        availability_snapshot_json,
        product_url,
        observed_at,
        created_at,
        expires_at,
        demo,
        pdf_storage_key,
        download_token
      ) VALUES (
        $1, $2, 'active', 'var_dummy_001', $3, 'MOD-001', 'Test Quote Item',
        1, 'reg_dummy_001', 'pen', 10000, 100.00, 10000, 100.00,
        'tax_excluded', 0, 'to_be_confirmed', '{}'::jsonb,
        'http://example.com/p', now(), now(), now() + interval '24 hours',
        true, $4, $5
      )
      ON CONFLICT (id) DO UPDATE SET
        pdf_storage_key = EXCLUDED.pdf_storage_key,
        download_token = EXCLUDED.download_token,
        expires_at = EXCLUDED.expires_at;
      `,
      [TEST_QUOTE_ID, TEST_OPAQUE_ID, TEST_SKU, TEST_PDF_KEY, TEST_TOKEN]
    )
  })

  afterAll(async () => {
    // Clean up DB row
    try {
      await pool.query(
        "DELETE FROM preliminary_quote WHERE id = $1 OR opaque_public_id = $2",
        [TEST_QUOTE_ID, TEST_OPAQUE_ID]
      )
    } catch {}

    // Clean up test file
    if (fs.existsSync(TEST_PDF_PATH)) {
      try {
        fs.unlinkSync(TEST_PDF_PATH)
      } catch {}
    }
  })

  function createMockResponse() {
    const headers: Record<string, string> = {}
    let status = 200
    let body: any = null

    const res: any = {
      statusCode: 200,
      headersSent: false,
      setHeader: jest.fn((name: string, val: string) => {
        headers[name] = val
      }),
      getHeader: jest.fn((name: string) => headers[name]),
      status: jest.fn((code: number) => {
        status = code
        res.statusCode = code
        return res
      }),
      json: jest.fn((data: any) => {
        body = data
        res.headersSent = true
        return res
      }),
      send: jest.fn((data: any) => {
        body = data
        res.headersSent = true
        return res
      }),
      sendFile: jest.fn((filePath: string, options?: any) => {
        if (options?.headers) {
          Object.assign(headers, options.headers)
        }
        body = fs.readFileSync(filePath)
        res.headersSent = true
        return res
      }),
      end: jest.fn((data?: any) => {
        if (data) body = data
        res.headersSent = true
        return res
      }),
    }

    return {
      res,
      getResult: () => ({ status, body, headers }),
    }
  }

  it("7. Test accessing with valid token -> 200 application/pdf", async () => {
    const { res, getResult } = createMockResponse()
    const req: any = {
      params: { quoteId: TEST_OPAQUE_ID },
      query: { token: TEST_TOKEN },
      headers: {},
      method: "GET",
      url: `/api/muse/v1/quotes/${TEST_OPAQUE_ID}/pdf?token=${TEST_TOKEN}`,
    }

    await GET(req, res)
    const result = getResult()

    expect(result.status).toBe(200)
    expect(result.headers["Content-Type"]).toBe("application/pdf")
    expect(result.headers["Cache-Control"]).toBe("public, max-age=3600")
    expect(result.headers["Content-Disposition"]).toBe(
      `inline; filename="preliminary-quote-${TEST_SKU}-${TEST_OPAQUE_ID.slice(0, 8)}.pdf"`
    )
    expect(result.headers["X-Request-Id"]).toBeDefined()
    expect(result.body).toBeDefined()
  })

  it("7b. Test accessing with valid token using internal id -> 200 application/pdf", async () => {
    const { res, getResult } = createMockResponse()
    const req: any = {
      params: { quoteId: TEST_QUOTE_ID },
      query: { token: TEST_TOKEN },
      headers: {},
      method: "GET",
      url: `/api/muse/v1/quotes/${TEST_QUOTE_ID}/pdf?token=${TEST_TOKEN}`,
    }

    await GET(req, res)
    const result = getResult()

    expect(result.status).toBe(200)
    expect(result.headers["Content-Type"]).toBe("application/pdf")
    expect(result.headers["Cache-Control"]).toBe("public, max-age=3600")
  })

  it("8. Test accessing with invalid token -> 404", async () => {
    const { res, getResult } = createMockResponse()
    const req: any = {
      params: { quoteId: TEST_OPAQUE_ID },
      query: { token: "invalid_wrong_token_xyz" },
      headers: {},
      method: "GET",
      url: `/api/muse/v1/quotes/${TEST_OPAQUE_ID}/pdf?token=invalid_wrong_token_xyz`,
    }

    await GET(req, res)
    const result = getResult()

    expect(result.status).toBe(404)
    expect(result.body).toHaveProperty("error")
    expect(result.body.error.code).toBe("NOT_FOUND")
  })

  it("9. Test accessing without token -> 404", async () => {
    const { res, getResult } = createMockResponse()
    const req: any = {
      params: { quoteId: TEST_OPAQUE_ID },
      query: {},
      headers: {},
      method: "GET",
      url: `/api/muse/v1/quotes/${TEST_OPAQUE_ID}/pdf`,
    }

    await GET(req, res)
    const result = getResult()

    expect(result.status).toBe(404)
    expect(result.body).toHaveProperty("error")
    expect(result.body.error.code).toBe("NOT_FOUND")
  })

  it("Test accessing expired quote -> 410 QUOTE_EXPIRED", async () => {
    // Temporarily mark quote as expired
    await pool.query(
      "UPDATE preliminary_quote SET expires_at = now() - interval '1 hour' WHERE id = $1",
      [TEST_QUOTE_ID]
    )

    const { res, getResult } = createMockResponse()
    const req: any = {
      params: { quoteId: TEST_OPAQUE_ID },
      query: { token: TEST_TOKEN },
      headers: {},
      method: "GET",
    }

    await GET(req, res)
    const result = getResult()

    expect(result.status).toBe(410)
    expect(result.body).toHaveProperty("error")
    expect(result.body.error.code).toBe("QUOTE_EXPIRED")

    // Restore expires_at
    await pool.query(
      "UPDATE preliminary_quote SET expires_at = now() + interval '24 hours' WHERE id = $1",
      [TEST_QUOTE_ID]
    )
  })

  it("Test accessing when PDF file missing on disk -> 404", async () => {
    // Point to non-existent file
    await pool.query(
      "UPDATE preliminary_quote SET pdf_storage_key = 'quotes/nonexistent-xyz.pdf' WHERE id = $1",
      [TEST_QUOTE_ID]
    )

    const { res, getResult } = createMockResponse()
    const req: any = {
      params: { quoteId: TEST_OPAQUE_ID },
      query: { token: TEST_TOKEN },
      headers: {},
      method: "GET",
    }

    await GET(req, res)
    const result = getResult()

    expect(result.status).toBe(404)
    expect(result.body).toHaveProperty("error")
    expect(result.body.error.code).toBe("NOT_FOUND")

    // Restore storage key
    await pool.query(
      "UPDATE preliminary_quote SET pdf_storage_key = $1 WHERE id = $2",
      [TEST_PDF_KEY, TEST_QUOTE_ID]
    )
  })
})
