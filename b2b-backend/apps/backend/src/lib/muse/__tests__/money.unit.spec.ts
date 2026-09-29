import {
  CURRENCY_PEN,
  CURRENCY_SCALE,
  MINOR_UNIT_FACTOR,
  CURRENCY_SYMBOL,
  isPenCurrency,
  assertPenCurrency,
  normalizeCurrency,
  majorToMinor,
  majorToMinorNumber,
  parseDecimalStringToMinor,
  minorToDecimal,
  majorToDecimal,
  decimalToMinor,
  calculateSubtotalMinor,
  calculateLineItem,
  createMoneyRepresentation,
  formatPen,
  parseDbPrice,
  safeAddMinor,
  safeAddMajor,
  verifyMonetaryIntegrity,
} from "../money"

describe("Monetary Representation Audit & Arithmetic (Phase 3)", () => {
  describe("1. Currency is strictly PEN", () => {
    it("recognizes 'PEN' and 'pen' as valid Peruvian currency", () => {
      expect(isPenCurrency("PEN")).toBe(true)
      expect(isPenCurrency("pen")).toBe(true)
      expect(isPenCurrency("  PEN  ")).toBe(true)
      expect(isPenCurrency("  pen  ")).toBe(true)
      expect(normalizeCurrency("pen")).toBe("PEN")
      expect(normalizeCurrency("PEN")).toBe("PEN")
    })

    it("rejects non-PEN currencies (USD, EUR, GBP, null, undefined, empty)", () => {
      expect(isPenCurrency("USD")).toBe(false)
      expect(isPenCurrency("EUR")).toBe(false)
      expect(isPenCurrency("GBP")).toBe(false)
      expect(isPenCurrency("")).toBe(false)
      expect(isPenCurrency(null)).toBe(false)
      expect(isPenCurrency(undefined)).toBe(false)

      expect(() => assertPenCurrency("USD")).toThrow(TypeError)
      expect(() => assertPenCurrency("EUR")).toThrow(TypeError)
      expect(() => assertPenCurrency("")).toThrow(TypeError)
    })
  })

  describe("2. Scale = 2 (centavos) and Minor Unit Factor = 100", () => {
    it("defines standard scale = 2 and factor = 100", () => {
      expect(CURRENCY_SCALE).toBe(2)
      expect(MINOR_UNIT_FACTOR).toBe(100n)
      expect(CURRENCY_SYMBOL).toBe("S/.")
    })
  })

  describe("3. unit_price_minor is integer centavos (e.g. 890 PEN -> 89000)", () => {
    it("converts integer PEN amounts to exact integer centavos", () => {
      expect(majorToMinor(890)).toBe(89000n)
      expect(majorToMinor(480)).toBe(48000n)
      expect(majorToMinor(75)).toBe(7500n)
      expect(majorToMinor(0)).toBe(0n)
      expect(majorToMinor(1)).toBe(100n)

      expect(majorToMinorNumber(890)).toBe(89000)
      expect(majorToMinorNumber(480)).toBe(48000)
      expect(majorToMinorNumber(75)).toBe(7500)
    })

    it("converts string PEN amounts to exact integer centavos", () => {
      expect(majorToMinor("890")).toBe(89000n)
      expect(majorToMinor("890.00")).toBe(89000n)
      expect(majorToMinor("480.00")).toBe(48000n)
      expect(majorToMinor("75.00")).toBe(7500n)
      expect(majorToMinor("S/. 890.00")).toBe(89000n)
      expect(majorToMinor("PEN 480.00")).toBe(48000n)
    })

    it("parses database numeric amounts accurately via parseDbPrice", () => {
      const plcPrice = parseDbPrice(890)
      expect(plcPrice).not.toBeNull()
      expect(plcPrice?.unit_price_minor).toBe(89000n)
      expect(plcPrice?.unit_price_minor_number).toBe(89000)
      expect(plcPrice?.unit_price_decimal).toBe("890.00")

      const pidPrice = parseDbPrice("480.00")
      expect(pidPrice).not.toBeNull()
      expect(pidPrice?.unit_price_minor).toBe(48000n)
      expect(pidPrice?.unit_price_decimal).toBe("480.00")

      const pt100Price = parseDbPrice(75)
      expect(pt100Price).not.toBeNull()
      expect(pt100Price?.unit_price_minor).toBe(7500n)
      expect(pt100Price?.unit_price_decimal).toBe("75.00")

      // Null, zero or invalid prices return null (requiring manual_review)
      expect(parseDbPrice(null)).toBeNull()
      expect(parseDbPrice(undefined)).toBeNull()
      expect(parseDbPrice(0)).toBeNull()
      expect(parseDbPrice(-100)).toBeNull()
      expect(parseDbPrice("abc")).toBeNull()
    })
  })

  describe("4. subtotal_minor = unit_price_minor * quantity", () => {
    it("computes exact integer multiplication for all demo SKUs and quantities", () => {
      // CN-X5PRIME-HE-XP5: 89000 centavos
      expect(calculateSubtotalMinor(89000n, 1)).toBe(89000n)
      expect(calculateSubtotalMinor(89000n, 2)).toBe(178000n)
      expect(calculateSubtotalMinor(89000n, 5)).toBe(445000n)
      expect(calculateSubtotalMinor(89000n, 20)).toBe(1780000n)

      // CN-N1200: 48000 centavos
      expect(calculateSubtotalMinor(48000n, 1)).toBe(48000n)
      expect(calculateSubtotalMinor(48000n, 3)).toBe(144000n)

      // CN-THT02: 7500 centavos
      expect(calculateSubtotalMinor(7500n, 10)).toBe(75000n)
    })

    it("rejects non-integer, negative, or invalid quantities", () => {
      expect(() => calculateSubtotalMinor(89000n, -1)).toThrow(TypeError)
      expect(() => calculateSubtotalMinor(89000n, 1.5 as any)).toThrow(TypeError)
      expect(() => calculateSubtotalMinor(89000n, "2" as any)).toThrow(TypeError)
    })

    it("computes full line item calculation consistently", () => {
      const item = calculateLineItem(890, 2)
      expect(item.currency).toBe("PEN")
      expect(item.scale).toBe(2)
      expect(item.quantity).toBe(2)
      expect(item.unit_price_minor).toBe(89000n)
      expect(item.unit_price_minor_number).toBe(89000)
      expect(item.unit_price_decimal).toBe("890.00")
      expect(item.subtotal_minor).toBe(178000n)
      expect(item.subtotal_minor_number).toBe(178000)
      expect(item.subtotal_decimal).toBe("1780.00")
      expect(item.formatted_unit_price).toContain("890.00")
      expect(item.formatted_subtotal).toContain("1,780.00")
    })
  })

  describe("5. Decimal representations formatted with exactly 2 decimal places ('890.00')", () => {
    it("formats centavos into exact 2-decimal string representation", () => {
      expect(minorToDecimal(89000n)).toBe("890.00")
      expect(minorToDecimal(48000n)).toBe("480.00")
      expect(minorToDecimal(7500n)).toBe("75.00")
      expect(minorToDecimal(178000n)).toBe("1780.00")
      expect(minorToDecimal(100n)).toBe("1.00")
      expect(minorToDecimal(50n)).toBe("0.50")
      expect(minorToDecimal(5n)).toBe("0.05")
      expect(minorToDecimal(0n)).toBe("0.00")
    })

    it("formats major units into exact 2-decimal string representation via majorToDecimal", () => {
      expect(majorToDecimal(890)).toBe("890.00")
      expect(majorToDecimal("480")).toBe("480.00")
      expect(majorToDecimal(75)).toBe("75.00")
      expect(majorToDecimal("1780")).toBe("1780.00")
      expect(majorToDecimal(0.5)).toBe("0.50")
      expect(majorToDecimal(0.05)).toBe("0.05")
      expect(majorToDecimal(0)).toBe("0.00")
    })

    it("formats negative amounts correctly without losing precision", () => {
      expect(minorToDecimal(-89000n)).toBe("-890.00")
      expect(minorToDecimal(-50n)).toBe("-0.50")
      expect(minorToDecimal(-5n)).toBe("-0.05")
    })

    it("parses decimal string back to exact minor centavos via decimalToMinor", () => {
      expect(decimalToMinor("890.00")).toBe(89000n)
      expect(decimalToMinor("1780.00")).toBe(178000n)
      expect(decimalToMinor("0.05")).toBe(5n)
      expect(decimalToMinor("0.50")).toBe(50n)
      expect(decimalToMinor("0.00")).toBe(0n)
    })

    it("formats PEN display strings with proper symbol and thousands separator", () => {
      expect(formatPen(89000n, { isMinor: true })).toBe("S/. 890.00")
      expect(formatPen(178000n, { isMinor: true })).toBe("S/. 1,780.00")
      expect(formatPen(7500n, { isMinor: true })).toBe("S/. 75.00")
      expect(formatPen(178000n, { isMinor: true, thousandsSeparator: false })).toBe("S/. 1780.00")
    })
  })

  describe("6. Total elimination of floating-point rounding errors", () => {
    it("eliminates the classic IEEE 754 0.1 + 0.2 = 0.30000000000000004 error", () => {
      // Raw JS float produces:
      const rawJsSum = 0.1 + 0.2
      expect(rawJsSum).not.toBe(0.3)
      expect(rawJsSum).toBe(0.30000000000000004)

      // safeAddMajor operates in integer centavos:
      const safeSum = safeAddMajor(0.1, 0.2)
      expect(safeSum).toBe("0.30")

      // Direct centavo addition: 10 + 20 = 30 centavos
      const minorA = majorToMinor("0.1")
      const minorB = majorToMinor("0.2")
      expect(minorA).toBe(10n)
      expect(minorB).toBe(20n)
      expect(minorA + minorB).toBe(30n)
      expect(minorToDecimal(minorA + minorB)).toBe("0.30")
    })

    it("eliminates 1.15 * 100 = 114.99999999999999 precision truncation", () => {
      // In JS:
      const rawFloat = 1.15 * 100
      expect(rawFloat).toBe(114.99999999999999)

      // majorToMinor handles 1.15 deterministically:
      expect(majorToMinor(1.15)).toBe(115n)
      expect(majorToMinor("1.15")).toBe(115n)
      expect(minorToDecimal(115n)).toBe("1.15")
    })

    it("eliminates 19.99 * 100 = 1998.9999999999998 precision loss", () => {
      const rawFloat = 19.99 * 100
      expect(rawFloat).toBe(1998.9999999999998)

      expect(majorToMinor(19.99)).toBe(1999n)
      expect(majorToMinor("19.99")).toBe(1999n)
      expect(minorToDecimal(1999n)).toBe("19.99")
    })

    it("sums multiple line items safely with safeAddMinor", () => {
      // 3 items: 890 PEN (89000), 480 PEN (48000), 75 PEN (7500)
      const total = safeAddMinor(89000n, 48000n, 7500n)
      expect(total).toBe(144500n)
      expect(minorToDecimal(total)).toBe("1445.00")
      expect(formatPen(total, { isMinor: true })).toBe("S/. 1,445.00")
    })
  })

  describe("7. Formal Monetary Integrity Audit function", () => {
    it("validates compliant monetary calculations successfully", () => {
      const result = verifyMonetaryIntegrity({
        currency: "PEN",
        unitPriceMinor: 89000n,
        quantity: 2,
        subtotalMinor: 178000n,
        unitPriceDecimal: "890.00",
        subtotalDecimal: "1780.00",
      })

      expect(result.valid).toBe(true)
      expect(result.errors).toEqual([])
    })

    it("catches currency violations", () => {
      const result = verifyMonetaryIntegrity({
        currency: "USD",
        unitPriceMinor: 89000n,
        quantity: 2,
        subtotalMinor: 178000n,
      })

      expect(result.valid).toBe(false)
      expect(result.errors[0]).toContain("Currency 'USD' is not supported. Must be 'PEN'.")
    })

    it("catches subtotal mismatch (e.g. rounding or multiplication bug)", () => {
      const result = verifyMonetaryIntegrity({
        currency: "PEN",
        unitPriceMinor: 89000n,
        quantity: 2,
        subtotalMinor: 177999n, // off by 1 centavo!
      })

      expect(result.valid).toBe(false)
      expect(result.errors[0]).toContain("subtotal_minor mismatch")
    })

    it("catches decimal place discrepancies", () => {
      const result = verifyMonetaryIntegrity({
        currency: "PEN",
        unitPriceMinor: 89000n,
        quantity: 2,
        subtotalMinor: 178000n,
        unitPriceDecimal: "890.0", // Only 1 decimal place!
        subtotalDecimal: "1780.00",
      })

      expect(result.valid).toBe(false)
      expect(result.errors[0]).toContain("does not have exactly 2 decimal places")
    })
  })
})
