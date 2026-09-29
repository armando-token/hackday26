import * as crypto from "crypto"
import {
  computeIdempotencyHash,
  computeRequestBodyHash,
  canonicalizeJson,
  handleIdempotencyCheck,
  type IdempotencyCheckResult,
} from "../idempotency"

describe("Muse Idempotency & Replay Verification", () => {
  // ---------------------------------------------------------------------------
  // 1. computeIdempotencyHash
  // ---------------------------------------------------------------------------
  describe("computeIdempotencyHash", () => {
    it("computes standard SHA-256 hex digest for a key", () => {
      const key = "test-idempotency-key-001"
      const expected = crypto.createHash("sha256").update(key).digest("hex")

      const result = computeIdempotencyHash(key)

      expect(result).toHaveLength(64)
      expect(result).toBe(expected)
    })

    it("normalizes leading and trailing whitespace", () => {
      const keyRaw = "my-unique-order-uuid"
      const keyWithSpaces = "   my-unique-order-uuid   \t\n"

      const hash1 = computeIdempotencyHash(keyRaw)
      const hash2 = computeIdempotencyHash(keyWithSpaces)

      expect(hash1).toBe(hash2)
    })

    it("produces distinct hashes for different keys", () => {
      const hashA = computeIdempotencyHash("key-A")
      const hashB = computeIdempotencyHash("key-B")

      expect(hashA).not.toBe(hashB)
    })

    it("handles empty string without throwing", () => {
      const expected = crypto.createHash("sha256").update("").digest("hex")
      expect(computeIdempotencyHash("")).toBe(expected)
    })

    it("throws a TypeError when key is not a string", () => {
      expect(() => computeIdempotencyHash(12345 as any)).toThrow(TypeError)
      expect(() => computeIdempotencyHash(null as any)).toThrow(TypeError)
      expect(() => computeIdempotencyHash(undefined as any)).toThrow(TypeError)
      expect(() => computeIdempotencyHash({} as any)).toThrow(TypeError)
    })
  })

  // ---------------------------------------------------------------------------
  // 2. canonicalizeJson & computeRequestBodyHash
  // ---------------------------------------------------------------------------
  describe("canonicalizeJson & computeRequestBodyHash", () => {
    it("canonicalizes simple objects by sorting keys alphabetically", () => {
      const obj1 = { b: 2, a: 1, c: 3 }
      const obj2 = { c: 3, a: 1, b: 2 }

      expect(canonicalizeJson(obj1)).toBe('{"a":1,"b":2,"c":3}')
      expect(canonicalizeJson(obj2)).toBe('{"a":1,"b":2,"c":3}')
    })

    it("canonicalizes deeply nested objects regardless of key order", () => {
      const payload1 = {
        region_id: "reg_pe_lim",
        items: [
          { sku: "CN-DEMO-PLC-DIN-420-MR1", quantity: 2, options: { z: 1, a: 2 } },
        ],
        customer: {
          name: "Acme Corp",
          industry: "Industrial Automation",
        },
      }

      const payload2 = {
        customer: {
          industry: "Industrial Automation",
          name: "Acme Corp",
        },
        items: [
          { options: { a: 2, z: 1 }, quantity: 2, sku: "CN-DEMO-PLC-DIN-420-MR1" },
        ],
        region_id: "reg_pe_lim",
      }

      expect(canonicalizeJson(payload1)).toBe(canonicalizeJson(payload2))
      expect(computeRequestBodyHash(payload1)).toBe(computeRequestBodyHash(payload2))
    })

    it("preserves array order while canonicalizing array elements", () => {
      const payload1 = { items: [1, 2, 3] }
      const payload2 = { items: [3, 2, 1] }

      expect(canonicalizeJson(payload1)).toBe('{"items":[1,2,3]}')
      expect(canonicalizeJson(payload2)).toBe('{"items":[3,2,1]}')
      expect(computeRequestBodyHash(payload1)).not.toBe(computeRequestBodyHash(payload2))
    })

    it("produces identical SHA-256 hex hashes for payloads with differing key order", () => {
      const bodyA = {
        variant_id: "variant_01J8Y...PLC",
        quantity: 5,
        currency: "pen",
      }
      const bodyB = {
        currency: "pen",
        variant_id: "variant_01J8Y...PLC",
        quantity: 5,
      }

      const hashA = computeRequestBodyHash(bodyA)
      const hashB = computeRequestBodyHash(bodyB)

      expect(hashA).toHaveLength(64)
      expect(hashA).toBe(hashB)
    })

    it("produces different hashes when payload values change", () => {
      const bodyOriginal = {
        sku: "CN-DEMO-PT100-3W-A1",
        quantity: 1,
      }
      const bodyModifiedQuantity = {
        sku: "CN-DEMO-PT100-3W-A1",
        quantity: 2,
      }
      const bodyModifiedSku = {
        sku: "CN-DEMO-PID-PT100-RS1",
        quantity: 1,
      }

      const hashOrig = computeRequestBodyHash(bodyOriginal)
      const hashModQty = computeRequestBodyHash(bodyModifiedQuantity)
      const hashModSku = computeRequestBodyHash(bodyModifiedSku)

      expect(hashOrig).not.toBe(hashModQty)
      expect(hashOrig).not.toBe(hashModSku)
      expect(hashModQty).not.toBe(hashModSku)
    })

    it("handles primitives, null, and empty payloads cleanly", () => {
      expect(computeRequestBodyHash({})).toBe(
        crypto.createHash("sha256").update("{}").digest("hex")
      )
      expect(canonicalizeJson(null)).toBe("null")
      expect(canonicalizeJson(42)).toBe("42")
      expect(canonicalizeJson("hello")).toBe('"hello"')
      expect(canonicalizeJson(true)).toBe("true")
    })

    it("handles Date instances via toISOString", () => {
      const d = new Date("2026-09-29T19:00:00.000Z")
      expect(canonicalizeJson({ at: d })).toBe('{"at":"2026-09-29T19:00:00.000Z"}')
    })
  })

  // ---------------------------------------------------------------------------
  // 3. handleIdempotencyCheck
  // ---------------------------------------------------------------------------
  describe("handleIdempotencyCheck", () => {
    const samplePayload = {
      variant_id: "variant_01J8Y6Q8M2DINPLC420",
      sku: "CN-DEMO-PLC-DIN-420-MR1",
      quantity: 3,
      region_id: "reg_default_pe",
    }
    const samplePayloadHash = computeRequestBodyHash(samplePayload)

    const existingQuoteRecord = {
      id: "pquote_01J8YTESTQUOTE001",
      opaque_public_id: "pq_pub_98a72b1c",
      status: "preliminary",
      variant_id: "variant_01J8Y6Q8M2DINPLC420",
      sku: "CN-DEMO-PLC-DIN-420-MR1",
      model: "CN-PLC-420-MR1",
      title: "Controlador Lógico Programable DIN 4-20mA",
      quantity: 3,
      region_id: "reg_default_pe",
      currency: "pen",
      unit_price_minor: 125000,
      unit_price_decimal: "1250.00",
      subtotal_minor: 375000,
      subtotal_decimal: "3750.00",
      tax_status: "tax_excluded",
      tax_amount_minor: 0,
      shipping_status: "to_be_confirmed",
      availability_snapshot_json: { lead_time_days: 3, in_stock: true },
      product_url: "https://controlnautas.com/products/cn-demo-plc-din-420-mr1",
      observed_at: new Date("2026-09-29T18:00:00Z"),
      created_at: new Date("2026-09-29T18:00:00Z"),
      expires_at: new Date("2026-10-06T18:00:00Z"),
      demo: true,
      pdf_storage_key: "quotes/pquote_01J8YTESTQUOTE001.pdf",
      download_token: "dld_token_abcdef123456",
      idempotency_key: "idem-key-abc-123",
      idempotency_key_hash: computeIdempotencyHash("idem-key-abc-123"),
      request_body_hash: samplePayloadHash,
      metadata: {},
    }

    // -------------------------------------------------------------------------
    // A. Key not present -> 'new'
    // -------------------------------------------------------------------------
    describe("when idempotency key is not present or blank", () => {
      it("returns status: 'new' when key is null", async () => {
        const mockPool = { query: jest.fn() }

        const result = await handleIdempotencyCheck(mockPool, null, samplePayload)

        expect(result).toEqual({ status: "new" })
        expect(mockPool.query).not.toHaveBeenCalled()
      })

      it("returns status: 'new' when key is undefined", async () => {
        const mockPool = { query: jest.fn() }

        const result = await handleIdempotencyCheck(mockPool, undefined, samplePayload)

        expect(result).toEqual({ status: "new" })
        expect(mockPool.query).not.toHaveBeenCalled()
      })

      it("returns status: 'new' when key is empty string or only whitespace", async () => {
        const mockPool = { query: jest.fn() }

        const result1 = await handleIdempotencyCheck(mockPool, "", samplePayload)
        const result2 = await handleIdempotencyCheck(mockPool, "   \t  ", samplePayload)

        expect(result1).toEqual({ status: "new" })
        expect(result2).toEqual({ status: "new" })
        expect(mockPool.query).not.toHaveBeenCalled()
      })
    })

    // -------------------------------------------------------------------------
    // B. Key present but not found in DB -> 'new'
    // -------------------------------------------------------------------------
    describe("when idempotency key is present but record does not exist in DB", () => {
      it("queries DB with SHA-256 hash and returns status: 'new'", async () => {
        const key = "fresh-idempotency-key-456"
        const expectedHash = computeIdempotencyHash(key)

        const mockPool = {
          query: jest.fn().mockResolvedValue({ rows: [] }),
        }

        const result = await handleIdempotencyCheck(mockPool, key, samplePayload)

        expect(result).toEqual({ status: "new" })
        expect(mockPool.query).toHaveBeenCalledTimes(1)
        expect(mockPool.query).toHaveBeenCalledWith(
          expect.stringContaining("WHERE idempotency_key_hash = $1"),
          [expectedHash]
        )
      })
    })

    // -------------------------------------------------------------------------
    // C. Replay: Key found and request_body_hash matches -> 'replay'
    // -------------------------------------------------------------------------
    describe("when key is found and request_body_hash matches (REPLAY)", () => {
      it("returns status: 'replay' with the existing quote record", async () => {
        const key = "idem-key-abc-123"
        const expectedHash = computeIdempotencyHash(key)

        const mockPool = {
          query: jest.fn().mockResolvedValue({
            rows: [existingQuoteRecord],
          }),
        }

        const result = await handleIdempotencyCheck(mockPool, key, samplePayload)

        expect(result).toEqual({
          status: "replay",
          quote: existingQuoteRecord,
        })
        expect(mockPool.query).toHaveBeenCalledTimes(1)
        expect(mockPool.query).toHaveBeenCalledWith(
          expect.stringContaining("WHERE idempotency_key_hash = $1"),
          [expectedHash]
        )
      })

      it("returns status: 'replay' even if payload fields are reordered in the request", async () => {
        const key = "idem-key-abc-123"

        // Reordered keys in payload
        const reorderedPayload = {
          region_id: "reg_default_pe",
          quantity: 3,
          sku: "CN-DEMO-PLC-DIN-420-MR1",
          variant_id: "variant_01J8Y6Q8M2DINPLC420",
        }

        const mockPool = {
          query: jest.fn().mockResolvedValue({
            rows: [existingQuoteRecord],
          }),
        }

        const result = await handleIdempotencyCheck(mockPool, key, reorderedPayload)

        expect(result).toEqual({
          status: "replay",
          quote: existingQuoteRecord,
        })
      })
    })

    // -------------------------------------------------------------------------
    // D. Conflict: Key found but request_body_hash differs -> 'conflict'
    // -------------------------------------------------------------------------
    describe("when key is found but request_body_hash differs (CONFLICT)", () => {
      it("returns status: 'conflict' when quantity differs", async () => {
        const key = "idem-key-abc-123"

        // Different quantity (5 instead of 3)
        const alteredPayload = {
          ...samplePayload,
          quantity: 5,
        }

        const mockPool = {
          query: jest.fn().mockResolvedValue({
            rows: [existingQuoteRecord],
          }),
        }

        const result = await handleIdempotencyCheck(mockPool, key, alteredPayload)

        expect(result).toEqual({ status: "conflict" })
      })

      it("returns status: 'conflict' when variant_id / sku differs", async () => {
        const key = "idem-key-abc-123"

        const alteredPayload = {
          ...samplePayload,
          variant_id: "variant_DIFFERENT_PT100",
          sku: "CN-DEMO-PT100-3W-A1",
        }

        const mockPool = {
          query: jest.fn().mockResolvedValue({
            rows: [existingQuoteRecord],
          }),
        }

        const result = await handleIdempotencyCheck(mockPool, key, alteredPayload)

        expect(result).toEqual({ status: "conflict" })
      })

      it("returns status: 'conflict' when extra fields are added", async () => {
        const key = "idem-key-abc-123"

        const alteredPayload = {
          ...samplePayload,
          additional_notes: "Please expedite delivery",
        }

        const mockPool = {
          query: jest.fn().mockResolvedValue({
            rows: [existingQuoteRecord],
          }),
        }

        const result = await handleIdempotencyCheck(mockPool, key, alteredPayload)

        expect(result).toEqual({ status: "conflict" })
      })
    })

    // -------------------------------------------------------------------------
    // E. Error cases
    // -------------------------------------------------------------------------
    describe("validation & error handling", () => {
      it("throws when dbPool is null and key is present", async () => {
        await expect(
          handleIdempotencyCheck(null, "some-key", samplePayload)
        ).rejects.toThrow(/database pool/i)
      })

      it("propagates database query errors", async () => {
        const mockPool = {
          query: jest.fn().mockRejectedValue(new Error("Postgres connection timeout")),
        }

        await expect(
          handleIdempotencyCheck(mockPool, "some-key", samplePayload)
        ).rejects.toThrow("Postgres connection timeout")
      })
    })
  })
})
