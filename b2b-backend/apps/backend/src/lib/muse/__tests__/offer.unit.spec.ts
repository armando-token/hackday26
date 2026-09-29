import {
  getLiveOffer,
  validateOfferQuantity,
  calculateLiveOfferAvailabilityStatus,
  calculateLiveOfferPricing,
  buildLiveOfferLimitations,
  LiveOfferNotFoundError,
  LiveOfferValidationError,
  isLiveOfferNotFoundError,
  isLiveOfferValidationError,
  MIN_OFFER_QUANTITY,
  MAX_OFFER_QUANTITY,
  CANONICAL_CURRENCY,
  DECIMAL_SCALE,
} from "../offer"
import { closePool, searchDemoVariants } from "../db"

describe("Live Offer Calculation Engine (offer.ts)", () => {
  afterAll(async () => {
    await closePool()
  })

  // --------------------------------------------------------------------------
  // 1. Quantity Validation Tests
  // --------------------------------------------------------------------------
  describe("validateOfferQuantity", () => {
    it("should default to 1 when undefined, null, or empty string", () => {
      expect(validateOfferQuantity(undefined)).toBe(1)
      expect(validateOfferQuantity(null)).toBe(1)
      expect(validateOfferQuantity("")).toBe(1)
    })

    it("should accept valid integers between 1 and 20", () => {
      expect(validateOfferQuantity(1)).toBe(1)
      expect(validateOfferQuantity(5)).toBe(5)
      expect(validateOfferQuantity(10)).toBe(10)
      expect(validateOfferQuantity(20)).toBe(20)
      expect(validateOfferQuantity("7")).toBe(7)
    })

    it("should throw LiveOfferValidationError on quantity < 1", () => {
      expect(() => validateOfferQuantity(0)).toThrow(LiveOfferValidationError)
      expect(() => validateOfferQuantity(-5)).toThrow(LiveOfferValidationError)
      try {
        validateOfferQuantity(0)
      } catch (err: any) {
        expect(err.statusCode).toBe(400)
        expect(err.code).toBe("INVALID_QUANTITY")
      }
    })

    it("should throw LiveOfferValidationError on quantity > 20", () => {
      expect(() => validateOfferQuantity(21)).toThrow(LiveOfferValidationError)
      expect(() => validateOfferQuantity(100)).toThrow(LiveOfferValidationError)
    })

    it("should throw LiveOfferValidationError on non-integer numbers", () => {
      expect(() => validateOfferQuantity(1.5)).toThrow(LiveOfferValidationError)
      expect(() => validateOfferQuantity(3.14)).toThrow(LiveOfferValidationError)
    })

    it("should throw LiveOfferValidationError on non-numeric strings or NaN", () => {
      expect(() => validateOfferQuantity("abc")).toThrow(LiveOfferValidationError)
      expect(() => validateOfferQuantity(NaN)).toThrow(LiveOfferValidationError)
      expect(() => validateOfferQuantity(Infinity)).toThrow(LiveOfferValidationError)
    })
  })

  // --------------------------------------------------------------------------
  // 2. Availability Calculation Tests
  // --------------------------------------------------------------------------
  describe("calculateLiveOfferAvailabilityStatus", () => {
    it("should return 'in_stock' when available >= quantity", () => {
      expect(calculateLiveOfferAvailabilityStatus(10, 5, true, false)).toBe("in_stock")
      expect(calculateLiveOfferAvailabilityStatus(5, 5, true, false)).toBe("in_stock")
      expect(calculateLiveOfferAvailabilityStatus(1, 1, true, false)).toBe("in_stock")
    })

    it("should return 'limited_stock' when 0 < available < quantity", () => {
      expect(calculateLiveOfferAvailabilityStatus(3, 5, true, false)).toBe("limited_stock")
      expect(calculateLiveOfferAvailabilityStatus(1, 10, true, false)).toBe("limited_stock")
      expect(calculateLiveOfferAvailabilityStatus(2, 3, true, true)).toBe("limited_stock")
    })

    it("should return 'out_of_stock' when available <= 0 and backorder is not allowed", () => {
      expect(calculateLiveOfferAvailabilityStatus(0, 1, true, false)).toBe("out_of_stock")
      expect(calculateLiveOfferAvailabilityStatus(-2, 1, true, false)).toBe("out_of_stock")
    })

    it("should return 'backorder' when available <= 0 and backorder is allowed", () => {
      expect(calculateLiveOfferAvailabilityStatus(0, 1, true, true)).toBe("backorder")
      expect(calculateLiveOfferAvailabilityStatus(-3, 5, true, true)).toBe("backorder")
    })

    it("should return 'in_stock' when inventory is not managed (manageInventory = false)", () => {
      expect(calculateLiveOfferAvailabilityStatus(0, 10, false, false)).toBe("in_stock")
      expect(calculateLiveOfferAvailabilityStatus(-5, 10, false, false)).toBe("in_stock")
    })
  })

  // --------------------------------------------------------------------------
  // 3. Pricing Calculation Tests (NEVER price 0, manual_review fallback)
  // --------------------------------------------------------------------------
  describe("calculateLiveOfferPricing", () => {
    it("should accurately calculate integer minor units and subtotal for valid prices", () => {
      const p1 = calculateLiveOfferPricing(890, "usd", 1)
      expect(p1.state).toBe("priced")
      expect(p1.review_reason).toBeNull()
      expect(p1.currency).toBe(CANONICAL_CURRENCY)
      expect(p1.unit_price).toBe(890)
      expect(p1.unit_price_minor).toBe(89000)
      expect(p1.subtotal).toBe(890)
      expect(p1.subtotal_minor).toBe(89000)
      expect(p1.scale).toBe(DECIMAL_SCALE)

      // Multiple quantity
      const p2 = calculateLiveOfferPricing("480", "usd", 3)
      expect(p2.state).toBe("priced")
      expect(p2.unit_price).toBe(480)
      expect(p2.unit_price_minor).toBe(48000)
      expect(p2.subtotal).toBe(1440)
      expect(p2.subtotal_minor).toBe(144000)

      // Decimal amount (cents precision)
      const p3 = calculateLiveOfferPricing("75.50", "usd", 2)
      expect(p3.state).toBe("priced")
      expect(p3.unit_price).toBe(75.5)
      expect(p3.unit_price_minor).toBe(7550)
      expect(p3.subtotal).toBe(151)
      expect(p3.subtotal_minor).toBe(15100)
    })

    it("should return manual_review and NEVER invent price 0 when price is missing", () => {
      const pNull = calculateLiveOfferPricing(null, "usd", 1)
      expect(pNull.state).toBe("manual_review")
      expect(pNull.review_reason).toContain("not configured")
      expect(pNull.unit_price).toBeNull()
      expect(pNull.unit_price_minor).toBeNull()
      expect(pNull.subtotal).toBeNull()
      expect(pNull.subtotal_minor).toBeNull()

      const pUndef = calculateLiveOfferPricing(undefined, "usd", 1)
      expect(pUndef.state).toBe("manual_review")
      expect(pUndef.unit_price).toBeNull()

      const pEmpty = calculateLiveOfferPricing("", "usd", 1)
      expect(pEmpty.state).toBe("manual_review")
      expect(pEmpty.unit_price).toBeNull()
    })

    it("should return manual_review when price is 0 or negative (NEVER price 0)", () => {
      const pZero = calculateLiveOfferPricing(0, "usd", 1)
      expect(pZero.state).toBe("manual_review")
      expect(pZero.review_reason).toContain("Non-positive")
      expect(pZero.unit_price).toBeNull()
      expect(pZero.unit_price_minor).toBeNull()

      const pNeg = calculateLiveOfferPricing("-10.50", "usd", 2)
      expect(pNeg.state).toBe("manual_review")
      expect(pNeg.unit_price).toBeNull()
    })

    it("should return manual_review when currency is invalid or not USD", () => {
      const pPen = calculateLiveOfferPricing(100, "pen", 1)
      expect(pPen.state).toBe("manual_review")
      expect(pPen.review_reason).toBe(
        "Currency 'pen' does not match canonical demonstration currency (usd)"
      )
      expect(pPen.unit_price).toBeNull()

      const pEur = calculateLiveOfferPricing(100, "eur", 1)
      expect(pEur.state).toBe("manual_review")
      expect(pEur.review_reason).toBe(
        "Currency 'eur' does not match canonical demonstration currency (usd)"
      )
      expect(pEur.unit_price).toBeNull()
    })

    it("should return manual_review when price amount is not a valid number", () => {
      const pNaN = calculateLiveOfferPricing("invalid_amount", "usd", 1)
      expect(pNaN.state).toBe("manual_review")
      expect(pNaN.unit_price).toBeNull()
    })
  })

  // --------------------------------------------------------------------------
  // 4. Limitations Array Generation Tests
  // --------------------------------------------------------------------------
  describe("buildLiveOfferLimitations", () => {
    it("should generate comprehensive limitations including taxes, shipping and stock caveats", () => {
      const lim = buildLiveOfferLimitations("priced", null, "limited_stock", 2, 5, false)
      expect(lim.some((l) => l.includes("exceeds currently available stock"))).toBe(true)
      expect(lim.some((l) => l.includes("tax-excluded"))).toBe(true)
      expect(lim.some((l) => l.includes("Freight terms"))).toBe(true)
    })

    it("should include manual review reason when state is manual_review", () => {
      const lim = buildLiveOfferLimitations(
        "manual_review",
        "Price review required",
        "in_stock",
        10,
        1,
        false
      )
      expect(lim.some((l) => l.includes("Price review required"))).toBe(true)
    })

    it("should include backorder note when backorder status is active", () => {
      const lim = buildLiveOfferLimitations("priced", null, "backorder", 0, 2, true)
      expect(lim.some((l) => l.includes("backorder"))).toBe(true)
    })
  })

  // --------------------------------------------------------------------------
  // 5. getLiveOffer with Real Database Tests (PostgreSQL Integration)
  // --------------------------------------------------------------------------
  describe("getLiveOffer (PostgreSQL Integration)", () => {
    it("should calculate valid live offer for SKU CN-X5PRIME-HE-XP5 (quantity 1)", async () => {
      const offer = await getLiveOffer("CN-X5PRIME-HE-XP5", 1)

      expect(offer).toBeDefined()
      expect(offer.sku).toBe("CN-X5PRIME-HE-XP5")
      expect(offer.model).toBe("CN-DIN-PLC-A1")
      expect(offer.variant_id).toMatch(/^variant_/)
      expect(offer.quantity).toBe(1)
      expect(offer.state).toBe("priced")
      expect(offer.review_reason).toBeNull()
      expect(offer.currency).toBe("usd")
      expect(offer.unit_price).toBe(890)
      expect(offer.unit_price_minor).toBe(89000)
      expect(offer.subtotal).toBe(890)
      expect(offer.subtotal_minor).toBe(89000)
      expect(offer.scale).toBe(2)
      expect(offer.tax_status).toBe("tax_excluded")
      expect(offer.shipping_status).toBe("to_be_confirmed")
      expect(offer.availability.status).toBe("in_stock")
      expect(offer.availability_status).toBe("in_stock")
      expect(offer.availability.stocked_quantity).toBe(3)
      expect(offer.availability.available_quantity).toBe(3)
      expect(Array.isArray(offer.limitations)).toBe(true)
      expect(offer.limitations.length).toBeGreaterThanOrEqual(2)
      expect(new Date(offer.observed_at).getTime()).toBeGreaterThan(0)
    })

    it("should calculate live offer with limited_stock when quantity exceeds stock", async () => {
      // Stock is 3 for PLC, request quantity 5
      const offer = await getLiveOffer("CN-X5PRIME-HE-XP5", 5)

      expect(offer.quantity).toBe(5)
      expect(offer.availability.status).toBe("limited_stock")
      expect(offer.availability_status).toBe("limited_stock")
      expect(offer.availability.available_quantity).toBe(3)
      expect(offer.unit_price).toBe(890)
      expect(offer.unit_price_minor).toBe(89000)
      expect(offer.subtotal).toBe(4450)
      expect(offer.subtotal_minor).toBe(445000)
      expect(offer.limitations.some((l) => l.includes("exceeds currently available stock"))).toBe(
        true
      )
    })

    it("should calculate live offer for PID SKU CN-N1200", async () => {
      const offer = await getLiveOffer("CN-N1200", 2)

      expect(offer.sku).toBe("CN-N1200")
      expect(offer.model).toBe("CN-PID-T1")
      expect(offer.unit_price).toBe(480)
      expect(offer.unit_price_minor).toBe(48000)
      expect(offer.subtotal).toBe(960)
      expect(offer.subtotal_minor).toBe(96000)
      expect(offer.availability.status).toBe("in_stock")
    })

    it("should calculate live offer for RTD SKU CN-THT02", async () => {
      const offer = await getLiveOffer("CN-THT02", 4)

      expect(offer.sku).toBe("CN-THT02")
      expect(offer.model).toBe("CN-RTD-P1")
      expect(offer.unit_price).toBe(75)
      expect(offer.unit_price_minor).toBe(7500)
      expect(offer.subtotal).toBe(300)
      expect(offer.subtotal_minor).toBe(30000)
      expect(offer.availability.status).toBe("in_stock")
    })

    it("should query seamlessly using native Medusa variant_id", async () => {
      const demoList = await searchDemoVariants()
      expect(demoList.length).toBeGreaterThan(0)
      const target = demoList[0]

      const offer = await getLiveOffer(target.variant_id, 1)
      expect(offer.variant_id).toBe(target.variant_id)
      expect(offer.sku).toBe(target.sku)
      expect(offer.state).toBe("priced")
    })

    it("should accept optional regionId parameter", async () => {
      const regionId = "reg_01JUS00HACKDAY26DEMOUSD0000"
      const offer = await getLiveOffer("CN-X5PRIME-HE-XP5", 1, regionId)
      expect(offer.region_id).toBe(regionId)
      expect(offer.state).toBe("priced")
    })

    it("should throw LiveOfferNotFoundError when variant is not in demo catalog", async () => {
      await expect(getLiveOffer("non-existent-sku-12345")).rejects.toThrow(
        LiveOfferNotFoundError
      )
    })

    it("should throw LiveOfferNotFoundError when variant ID is blank or empty", async () => {
      await expect(getLiveOffer("")).rejects.toThrow(LiveOfferNotFoundError)
      await expect(getLiveOffer("   ")).rejects.toThrow(LiveOfferNotFoundError)
    })

    it("should throw LiveOfferValidationError on invalid quantity", async () => {
      await expect(getLiveOffer("CN-X5PRIME-HE-XP5", 0)).rejects.toThrow(
        LiveOfferValidationError
      )
      await expect(getLiveOffer("CN-X5PRIME-HE-XP5", 25)).rejects.toThrow(
        LiveOfferValidationError
      )
      await expect(getLiveOffer("CN-X5PRIME-HE-XP5", 1.5)).rejects.toThrow(
        LiveOfferValidationError
      )
    })
  })

  // --------------------------------------------------------------------------
  // 6. Mock Client Edge Case Tests (manual_review, zero price, backorder)
  // --------------------------------------------------------------------------
  describe("getLiveOffer Edge Cases (Mock Client)", () => {
    it("should return manual_review when price is missing from database", async () => {
      const mockClient = {
        query: jest.fn().mockResolvedValue({
          rows: [
            {
              profile_id: "tp_1",
              variant_id: "variant_demo_1",
              model: "CN-DEMO-M1",
              revision: "rev-1",
              demo: true,
              medusa_variant_id: "variant_demo_1",
              sku: "CN-DEMO-TEST-1",
              variant_title: "Test Variant",
              manage_inventory: true,
              allow_backorder: false,
              product_id: "prod_1",
              product_title: "Test Product",
              product_handle: "test-product",
              price_id: null,
              price_amount: null,
              currency_code: null,
              stocked_quantity: 5,
              reserved_quantity: 0,
            },
          ],
        }),
      } as any

      const offer = await getLiveOffer("CN-DEMO-TEST-1", 1, undefined, mockClient)
      expect(offer.state).toBe("manual_review")
      expect(offer.review_reason).toContain("not configured")
      expect(offer.unit_price).toBeNull()
      expect(offer.unit_price_minor).toBeNull()
      expect(offer.subtotal).toBeNull()
      expect(offer.subtotal_minor).toBeNull()
    })

    it("should return manual_review and NEVER invent price 0 when price_amount is 0", async () => {
      const mockClient = {
        query: jest.fn().mockResolvedValue({
          rows: [
            {
              profile_id: "tp_2",
              variant_id: "variant_demo_2",
              model: "CN-DEMO-M2",
              revision: "rev-1",
              demo: true,
              medusa_variant_id: "variant_demo_2",
              sku: "CN-DEMO-TEST-2",
              variant_title: "Test Variant 2",
              manage_inventory: true,
              allow_backorder: false,
              product_id: "prod_2",
              product_title: "Test Product 2",
              product_handle: "test-product-2",
              price_id: "pr_2",
              price_amount: "0",
              currency_code: "usd",
              stocked_quantity: 5,
              reserved_quantity: 0,
            },
          ],
        }),
      } as any

      const offer = await getLiveOffer("CN-DEMO-TEST-2", 1, undefined, mockClient)
      expect(offer.state).toBe("manual_review")
      expect(offer.review_reason).toContain("Non-positive")
      expect(offer.unit_price).toBeNull()
      expect(offer.unit_price_minor).toBeNull()
    })

    it("should return backorder when stock is 0 and allow_backorder is true", async () => {
      const mockClient = {
        query: jest.fn().mockResolvedValue({
          rows: [
            {
              profile_id: "tp_3",
              variant_id: "variant_demo_3",
              model: "CN-DEMO-M3",
              revision: "rev-1",
              demo: true,
              medusa_variant_id: "variant_demo_3",
              sku: "CN-DEMO-TEST-3",
              variant_title: "Test Variant 3",
              manage_inventory: true,
              allow_backorder: true,
              product_id: "prod_3",
              product_title: "Test Product 3",
              product_handle: "test-product-3",
              price_id: "pr_3",
              price_amount: "500",
              currency_code: "usd",
              stocked_quantity: 0,
              reserved_quantity: 0,
            },
          ],
        }),
      } as any

      const offer = await getLiveOffer("CN-DEMO-TEST-3", 2, undefined, mockClient)
      expect(offer.state).toBe("priced")
      expect(offer.availability.status).toBe("backorder")
      expect(offer.availability_status).toBe("backorder")
      expect(offer.availability.allow_backorder).toBe(true)
      expect(offer.subtotal).toBe(1000)
    })
  })

  // --------------------------------------------------------------------------
  // 7. Error Type Guards Tests
  // --------------------------------------------------------------------------
  describe("Error Type Guards", () => {
    it("isLiveOfferNotFoundError should identify LiveOfferNotFoundError correctly", () => {
      const notFound = new LiveOfferNotFoundError("Demo error")
      expect(isLiveOfferNotFoundError(notFound)).toBe(true)
      expect(isLiveOfferNotFoundError(new Error("regular error"))).toBe(false)
      expect(isLiveOfferNotFoundError({ name: "LiveOfferNotFoundError", statusCode: 404 })).toBe(
        true
      )
    })

    it("isLiveOfferValidationError should identify LiveOfferValidationError correctly", () => {
      const valError = new LiveOfferValidationError("Bad qty")
      expect(isLiveOfferValidationError(valError)).toBe(true)
      expect(isLiveOfferValidationError(new Error("generic"))).toBe(false)
      expect(isLiveOfferValidationError({ name: "LiveOfferValidationError", statusCode: 400 })).toBe(
        true
      )
    })
  })
})
