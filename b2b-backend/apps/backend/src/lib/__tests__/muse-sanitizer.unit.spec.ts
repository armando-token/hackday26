import {
  sanitizeQuery,
  validateSearchLimit,
  validateQuantity,
  isProhibitedKey,
  detectPrototypePollution,
  hasPrototypePollution,
  assertNoPrototypePollution,
  safeJsonParse,
  validateRangeContains,
  validateRequirementsArrayLength,
  sanitizeEvaluatePayload,
  sanitizeSearchParams,
  MuseSearchQuerySchema,
  MuseEvaluatePayloadSchema,
  MusePreliminaryQuotePayloadSchema,
  MuseValidationError,
  MAX_QUERY_LENGTH,
  MAX_REQUIREMENTS_COUNT,
  MIN_SEARCH_LIMIT,
  MAX_SEARCH_LIMIT,
} from "../muse/sanitizer"

describe("Muse Sanitizer & Anti-DoS Module", () => {
  describe("sanitizeQuery", () => {
    it("recorta cadenas de texto que superan los 200 caracteres", () => {
      const longInput = "a".repeat(250)
      const sanitized = sanitizeQuery(longInput)
      expect(sanitized).toHaveLength(MAX_QUERY_LENGTH)
      expect(sanitized).toBe("a".repeat(200))
    })

    it("elimina caracteres nulos literales y codificados", () => {
      const input = "PLC\0Modbus\u0000%00DIN"
      expect(sanitizeQuery(input)).toBe("PLCModbusDIN")
    })

    it("elimina secuencias de escape ANSI", () => {
      const input = "\u001b[31mRed Alert\u001b[0m Normal"
      expect(sanitizeQuery(input)).toBe("Red Alert Normal")
    })

    it("normaliza saltos de línea y tabuladores convirtiéndolos a espacios", () => {
      const input = "Sensor\r\n\tTemperatura\nPT100"
      expect(sanitizeQuery(input)).toBe("Sensor Temperatura PT100")
    })

    it("elimina caracteres de control peligrosos (C0, C1, DEL)", () => {
      const input = "Test\x01\x02\x07\x08\x7F\x80\x9FDevice"
      expect(sanitizeQuery(input)).toBe("TestDevice")
    })

    it("elimina caracteres bidireccionales de spoofing", () => {
      const input = "file\u202Ecod.exe"
      expect(sanitizeQuery(input)).toBe("filecod.exe")
    })

    it("colapsa múltiples espacios consecutivos y hace trim", () => {
      const input = "   Transmisor    de   Presión   "
      expect(sanitizeQuery(input)).toBe("Transmisor de Presión")
    })

    it("maneja entradas nulas, indefinidas o no cadenas devolviendo cadena vacía", () => {
      expect(sanitizeQuery(null)).toBe("")
      expect(sanitizeQuery(undefined)).toBe("")
      expect(sanitizeQuery(12345)).toBe("")
      expect(sanitizeQuery({})).toBe("")
      expect(sanitizeQuery(["PLC Novus"])).toBe("PLC Novus")
    })
  })

  describe("validateSearchLimit", () => {
    it("acepta límites válidos (1, 2, 3) como números", () => {
      expect(validateSearchLimit(1)).toBe(1)
      expect(validateSearchLimit(2)).toBe(2)
      expect(validateSearchLimit(3)).toBe(3)
    })

    it("acepta y parsea límites válidos en formato string ('1', '2', '3')", () => {
      expect(validateSearchLimit("1")).toBe(1)
      expect(validateSearchLimit("2")).toBe(2)
      expect(validateSearchLimit("3")).toBe(3)
    })

    it("retorna el límite por defecto (3) si es undefined, null o cadena vacía", () => {
      expect(validateSearchLimit(undefined)).toBe(3)
      expect(validateSearchLimit(null)).toBe(3)
      expect(validateSearchLimit("")).toBe(3)
      expect(validateSearchLimit(undefined, 2)).toBe(2)
    })

    it("rechaza números fuera de rango (< 1 o > 3)", () => {
      expect(() => validateSearchLimit(0)).toThrow(MuseValidationError)
      expect(() => validateSearchLimit(4)).toThrow(MuseValidationError)
      expect(() => validateSearchLimit(-5)).toThrow(MuseValidationError)
      expect(() => validateSearchLimit("10")).toThrow(MuseValidationError)
    })

    it("rechaza números decimales o no enteros", () => {
      expect(() => validateSearchLimit(1.5)).toThrow(MuseValidationError)
      expect(() => validateSearchLimit("2.7")).toThrow(MuseValidationError)
    })

    it("rechaza NaN, Infinity y valores no numéricos", () => {
      expect(() => validateSearchLimit(NaN)).toThrow(MuseValidationError)
      expect(() => validateSearchLimit(Infinity)).toThrow(MuseValidationError)
      expect(() => validateSearchLimit("abc")).toThrow(MuseValidationError)
      expect(() => validateSearchLimit({})).toThrow(MuseValidationError)
    })
  })

  describe("validateQuantity", () => {
    it("acepta cantidades entre 1 y 20", () => {
      expect(validateQuantity(1)).toBe(1)
      expect(validateQuantity(10)).toBe(10)
      expect(validateQuantity(20)).toBe(20)
      expect(validateQuantity("5")).toBe(5)
    })

    it("rechaza cantidades fuera de rango o inválidas", () => {
      expect(() => validateQuantity(0)).toThrow(/Quantity must be an integer between 1 and 20/)
      expect(() => validateQuantity(21)).toThrow(/Quantity must be an integer between 1 and 20/)
      expect(() => validateQuantity(2.5)).toThrow(/Quantity must be an integer between 1 and 20/)
      expect(() => validateQuantity(undefined)).toThrow(/Quantity is required/)
    })
  })

  describe("Protección contra Prototype Pollution & Anti-DoS", () => {
    it("identifica claves prohibidas", () => {
      expect(isProhibitedKey("__proto__")).toBe(true)
      expect(isProhibitedKey("constructor")).toBe(true)
      expect(isProhibitedKey("prototype")).toBe(true)
      expect(isProhibitedKey("variant_id")).toBe(false)
      expect(isProhibitedKey("requirements")).toBe(false)
    })

    it("detecta prototype pollution en propiedades directas", () => {
      const malicious = JSON.parse('{"__proto__": {"polluted": true}, "sku": "CN-PLC"}')
      expect(hasPrototypePollution(malicious)).toBe(true)
      expect(() => assertNoPrototypePollution(malicious)).toThrow(
        /Prohibited prototype pollution key "__proto__"/
      )
    })

    it("detecta prototype pollution con constructor", () => {
      const malicious = JSON.parse('{"constructor": {"prototype": {"admin": true}}}')
      expect(hasPrototypePollution(malicious)).toBe(true)
      expect(() => assertNoPrototypePollution(malicious)).toThrow(
        /Prohibited prototype pollution key "constructor"/
      )
    })

    it("detecta prototype pollution anidada dentro de arrays", () => {
      const malicious = {
        variant_id: "var_123",
        requirements: [
          { property: "mounting", operator: "equals", value: "din_35mm" },
          JSON.parse('{"__proto__": {"admin": true}}'),
        ],
      }
      expect(hasPrototypePollution(malicious)).toBe(true)
      expect(detectPrototypePollution(malicious)).toContain('Prohibited prototype pollution key "__proto__"')
    })

    it("detecta referencias circulares maliciosas", () => {
      const circular: any = { a: 1 }
      circular.self = circular
      expect(hasPrototypePollution(circular)).toBe(true)
      expect(detectPrototypePollution(circular)).toContain("Cyclic reference detected")
    })

    it("bloquea anidamientos excesivos mayores a 10 niveles (Anti-DoS)", () => {
      let deep: any = { leaf: "val" }
      for (let i = 0; i < 12; i++) {
        deep = { next: deep }
      }
      expect(hasPrototypePollution(deep)).toBe(true)
      expect(detectPrototypePollution(deep)).toContain("maximum nesting depth")
    })

    it("safeJsonParse parsea JSON legítimo y rechaza intentos de contaminación", () => {
      const safe = safeJsonParse<{ ok: boolean; count: number }>('{"ok": true, "count": 5}')
      expect(safe.ok).toBe(true)
      expect(safe.count).toBe(5)

      expect(() => safeJsonParse('{"__proto__": {"polluted": true}}')).toThrow(
        /Prohibited prototype pollution key/
      )
      expect(() => safeJsonParse('{"constructor": 123}')).toThrow(
        /Prohibited prototype pollution key/
      )
      expect(() => safeJsonParse("not a json")).toThrow(/Malformed JSON payload/)
    })
  })

  describe("Control estricto de tamaño del array requirements", () => {
    it("permite arrays con entre 1 y 10 items", () => {
      const reqs1 = [{ property: "mounting", operator: "equals", value: "din_35mm" }]
      expect(() => validateRequirementsArrayLength(reqs1)).not.toThrow()

      const reqs10 = Array.from({ length: 10 }, (_, i) => ({
        property: "mounting",
        operator: "equals",
        value: `din_${i}`,
      }))
      expect(() => validateRequirementsArrayLength(reqs10)).not.toThrow()
    })

    it("rechaza si requirements no es un array o es nulo", () => {
      expect(() => validateRequirementsArrayLength(null)).toThrow(/must be an array/)
      expect(() => validateRequirementsArrayLength("not an array")).toThrow(/must be an array/)
      expect(() => validateRequirementsArrayLength({})).toThrow(/must be an array/)
    })

    it("rechaza arrays vacíos de requirements", () => {
      expect(() => validateRequirementsArrayLength([])).toThrow(
        /must contain at least 1 requirement/
      )
    })

    it("rechaza estrictamente arrays con más de 10 items (Anti-DoS)", () => {
      const reqs11 = Array.from({ length: 11 }, (_, i) => ({
        property: "mounting",
        operator: "equals",
        value: `din_${i}`,
      }))
      expect(() => validateRequirementsArrayLength(reqs11)).toThrow(
        /exceeds maximum allowed limit of 10 items/
      )
    })
  })

  describe("Validación de operador range_contains", () => {
    it("acepta rangos numéricos válidos con min <= max", () => {
      const valid = validateRangeContains({
        min: 4,
        max: 20,
        unit: "mA",
        channels_at_least: 2,
        direction: "input",
      })
      expect(valid.min).toBe(4)
      expect(valid.max).toBe(20)
      expect(valid.unit).toBe("mA")
      expect(valid.channels_at_least).toBe(2)
      expect(valid.direction).toBe("input")
    })

    it("acepta min === max (p. ej. valor exacto en rango)", () => {
      const valid = validateRangeContains({ min: 24, max: 24, unit: "V" })
      expect(valid.min).toBe(24)
      expect(valid.max).toBe(24)
    })

    it("rechaza min > max", () => {
      expect(() =>
        validateRangeContains({ min: 25, max: 20, unit: "mA" })
      ).toThrow(/min.*must be less than or equal to.*max/)
    })

    it("rechaza min o max no numéricos, NaN o Infinity", () => {
      expect(() => validateRangeContains({ min: "4", max: 20 })).toThrow(/finite number/)
      expect(() => validateRangeContains({ min: NaN, max: 20 })).toThrow(/finite number/)
      expect(() => validateRangeContains({ min: 4, max: Infinity })).toThrow(/finite number/)
      expect(() => validateRangeContains({ min: null, max: 20 })).toThrow(/finite number/)
    })

    it("valida channels_at_least como entero positivo >= 1", () => {
      expect(() =>
        validateRangeContains({ min: 4, max: 20, channels_at_least: 0 })
      ).toThrow(/integer >= 1/)
      expect(() =>
        validateRangeContains({ min: 4, max: 20, channels_at_least: 1.5 })
      ).toThrow(/integer >= 1/)
    })

    it("valida direction como 'input' o 'output'", () => {
      expect(() =>
        validateRangeContains({ min: 4, max: 20, direction: "bidirectional" as any })
      ).toThrow(/direction/)
    })
  })

  describe("Integración con esquemas Zod", () => {
    describe("MuseSearchQuerySchema & sanitizeSearchParams", () => {
      it("sanitiza y valida parámetros de búsqueda correctamente", () => {
        const result = sanitizeSearchParams({
          q: "  PLC Novus \0\x1b[32mModbus  ",
          limit: "2",
        })
        expect(result.q).toBe("PLC Novus Modbus")
        expect(result.limit).toBe(2)
      })

      it("aplica límite por defecto (3) si no se especifica", () => {
        const result = sanitizeSearchParams({ q: "PT100" })
        expect(result.q).toBe("PT100")
        expect(result.limit).toBe(3)
      })

      it("rechaza límite inválido en sanitizeSearchParams", () => {
        expect(() =>
          sanitizeSearchParams({ q: "PLC", limit: "5" })
        ).toThrow(MuseValidationError)
      })
    })

    describe("MuseEvaluatePayloadSchema & sanitizeEvaluatePayload", () => {
      it("valida un payload de evaluación técnico completo y legítimo", () => {
        const payload = {
          variant_id: "var_plc_din_demo_01",
          requirements: [
            {
              id: "r1",
              property: "mounting",
              operator: "equals",
              value: "din_35mm",
            },
            {
              id: "r2",
              property: "analog_input",
              operator: "range_contains",
              min: 4,
              max: 20,
              unit: "mA",
              channels_at_least: 2,
              direction: "input",
            },
            {
              id: "r3",
              property: "protocol",
              operator: "equals",
              value: "modbus_rtu",
            },
          ],
        }

        const sanitized = sanitizeEvaluatePayload(payload)
        expect(sanitized.variant_id).toBe("var_plc_din_demo_01")
        expect(sanitized.requirements).toHaveLength(3)
        expect(sanitized.requirements[1].operator).toBe("range_contains")
      })

      it("rechaza payload con prototype pollution en sanitizeEvaluatePayload", () => {
        const malicious = {
          variant_id: "var_123",
          requirements: [
            JSON.parse('{"__proto__": {"admin": true}, "property": "mounting", "operator": "equals", "value": "din"}'),
          ],
        }

        expect(() => sanitizeEvaluatePayload(malicious)).toThrow(
          /Prototype pollution or malformed payload detected/
        )
      })

      it("rechaza payload con más de 10 requisitos (Anti-DoS)", () => {
        const payload = {
          variant_id: "var_123",
          requirements: Array.from({ length: 11 }, (_, i) => ({
            property: "mounting",
            operator: "equals" as const,
            value: `din_${i}`,
          })),
        }

        expect(() => sanitizeEvaluatePayload(payload)).toThrow(
          /exceeds maximum allowed limit of 10 items/
        )
      })

      it("rechaza range_contains con min > max en el esquema Zod", () => {
        const payload = {
          variant_id: "var_123",
          requirements: [
            {
              property: "analog_input",
              operator: "range_contains",
              min: 50,
              max: 20,
              unit: "mA",
            },
          ],
        }

        expect(() => sanitizeEvaluatePayload(payload)).toThrow(
          /range_contains: min \(50\) must be less than or equal to max \(20\)/
        )
      })

      it("rechaza range_contains con NaN", () => {
        const payload = {
          variant_id: "var_123",
          requirements: [
            {
              property: "analog_input",
              operator: "range_contains",
              min: NaN,
              max: 20,
            },
          ],
        }

        expect(() => sanitizeEvaluatePayload(payload)).toThrow(/NaN|finite number/)
      })

      it("rechaza campos desconocidos en strict schema", () => {
        const payload = {
          variant_id: "var_123",
          injected_admin_field: true,
          requirements: [
            {
              property: "mounting",
              operator: "equals",
              value: "din_35mm",
            },
          ],
        }

        expect(() => sanitizeEvaluatePayload(payload)).toThrow(/Validation error/)
      })

      it("rechaza variant_id ausente o vacío", () => {
        expect(() =>
          sanitizeEvaluatePayload({
            variant_id: "   ",
            requirements: [
              {
                property: "mounting",
                operator: "equals",
                value: "din_35mm",
              },
            ],
          })
        ).toThrow(/variant_id cannot be empty/)
      })
    })

    describe("MusePreliminaryQuotePayloadSchema", () => {
      it("valida payload de cotización preliminar", () => {
        const valid = {
          variant_id: "var_plc_demo",
          quantity: 2,
          region_id: "reg_pe_demo",
          idempotency_key: "550e8400-e29b-41d4-a716-446655440000",
        }
        const parsed = MusePreliminaryQuotePayloadSchema.parse(valid)
        expect(parsed.quantity).toBe(2)
        expect(parsed.variant_id).toBe("var_plc_demo")
      })

      it("rechaza cantidad fuera del rango permitido (1-20)", () => {
        expect(() =>
          MusePreliminaryQuotePayloadSchema.parse({
            variant_id: "var_plc_demo",
            quantity: 25,
          })
        ).toThrow(/quantity cannot exceed 20/)
      })
    })
  })
})
