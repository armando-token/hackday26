import {
  TECHNICAL_PROPERTIES,
  ALLOWED_OPERATORS,
  MUSE_ERROR_CODES,
  MuseValidationError,
  isTechnicalProperty,
  isAllowedOperator,
  isVocabularyError,
  validateProperty,
  validateOperator,
  validateSearchQuery,
  validateEvaluatePayload,
  SearchQuerySchema,
  EvaluateRequirementSchema,
  EvaluatePayloadSchema,
  type TechnicalProperty,
  type AllowedOperator,
} from "../schema-validator"

describe("Muse Technical Schema & Closed Vocabulary Validator", () => {
  // --------------------------------------------------------------------------
  // 1. Vocabulario Técnico Cerrado (Closed Vocabulary)
  // --------------------------------------------------------------------------
  describe("Vocabulario Técnico Cerrado (TECHNICAL_PROPERTIES)", () => {
    const expectedProperties = [
      "mounting",
      "supply_voltage",
      "analog_input",
      "analog_output",
      "protocol",
      "interface",
      "sensor_element",
      "control_function",
    ]

    it("contiene exactamente las 8 propiedades técnicas requeridas", () => {
      expect(TECHNICAL_PROPERTIES).toHaveLength(8)
      expect(Array.from(TECHNICAL_PROPERTIES)).toEqual(expectedProperties)
    })

    it("isTechnicalProperty reconoce todas las propiedades válidas", () => {
      for (const prop of expectedProperties) {
        expect(isTechnicalProperty(prop)).toBe(true)
      }
    })

    it("isTechnicalProperty rechaza propiedades ajenas al vocabulario cerrado", () => {
      expect(isTechnicalProperty("pressure")).toBe(false)
      expect(isTechnicalProperty("humidity")).toBe(false)
      expect(isTechnicalProperty("temperature_range")).toBe(false)
      expect(isTechnicalProperty("")).toBe(false)
      expect(isTechnicalProperty(null)).toBe(false)
      expect(isTechnicalProperty(undefined)).toBe(false)
      expect(isTechnicalProperty(123)).toBe(false)
    })

    it("validateProperty retorna la propiedad si es válida", () => {
      const prop = validateProperty("mounting")
      expect(prop).toBe("mounting")
    })

    it("validateProperty lanza MuseValidationError con HTTP 400 si es inválida", () => {
      expect.assertions(4)
      try {
        validateProperty("invented_property")
      } catch (err: any) {
        expect(err).toBeInstanceOf(MuseValidationError)
        expect(err.statusCode).toBe(400)
        expect(err.code).toBe("INVALID_PROPERTY")
        expect(err.message).toContain("invented_property")
      }
    })

    it("validateProperty admite el código INVALID_VOCABULARY", () => {
      expect.assertions(2)
      try {
        validateProperty("invented_property", "INVALID_VOCABULARY")
      } catch (err: any) {
        expect(err.statusCode).toBe(400)
        expect(err.code).toBe("INVALID_VOCABULARY")
      }
    })
  })

  // --------------------------------------------------------------------------
  // 2. Operadores Permitidos (Allowed Operators)
  // --------------------------------------------------------------------------
  describe("Operadores Permitidos (ALLOWED_OPERATORS)", () => {
    const expectedOperators = [
      "equals",
      "not_equals",
      "range_contains",
      "in",
      "greater_than_or_equal",
      "less_than_or_equal",
      "contains",
    ]

    it("contiene exactamente los 7 operadores permitidos", () => {
      expect(ALLOWED_OPERATORS).toHaveLength(7)
      expect(Array.from(ALLOWED_OPERATORS)).toEqual(expectedOperators)
    })

    it("isAllowedOperator reconoce todos los operadores válidos", () => {
      for (const op of expectedOperators) {
        expect(isAllowedOperator(op)).toBe(true)
      }
    })

    it("isAllowedOperator rechaza operadores no permitidos", () => {
      expect(isAllowedOperator("matches")).toBe(false)
      expect(isAllowedOperator("like")).toBe(false)
      expect(isAllowedOperator("==")).toBe(false)
      expect(isAllowedOperator("regex")).toBe(false)
      expect(isAllowedOperator("")).toBe(false)
      expect(isAllowedOperator(null)).toBe(false)
    })

    it("validateOperator retorna el operador si es válido", () => {
      expect(validateOperator("range_contains")).toBe("range_contains")
    })

    it("validateOperator lanza MuseValidationError con HTTP 400 si es inválido", () => {
      expect.assertions(3)
      try {
        validateOperator("illegal_op")
      } catch (err: any) {
        expect(err).toBeInstanceOf(MuseValidationError)
        expect(err.statusCode).toBe(400)
        expect(err.code).toBe("INVALID_REQUEST")
      }
    })
  })

  // --------------------------------------------------------------------------
  // 3. Validador de Búsqueda: validateSearchQuery
  // --------------------------------------------------------------------------
  describe("validateSearchQuery", () => {
    it("admite consulta vacía y aplica valores por defecto (q: '', limit: 3)", () => {
      expect(validateSearchQuery()).toEqual({ q: "", limit: 3 })
      expect(validateSearchQuery({})).toEqual({ q: "", limit: 3 })
      expect(validateSearchQuery(undefined)).toEqual({ q: "", limit: 3 })
      expect(validateSearchQuery(null)).toEqual({ q: "", limit: 3 })
    })

    it("acepta un string directo como 'q' con limit por defecto de 3", () => {
      expect(validateSearchQuery("plc novus")).toEqual({ q: "plc novus", limit: 3 })
    })

    it("procesa parámetros válidos con límite numérico dentro del rango [1, 3]", () => {
      expect(validateSearchQuery({ q: "sensor pt100", limit: 1 })).toEqual({
        q: "sensor pt100",
        limit: 1,
      })
      expect(validateSearchQuery({ q: "plc", limit: 2 })).toEqual({
        q: "plc",
        limit: 2,
      })
      expect(validateSearchQuery({ q: "pid", limit: 3 })).toEqual({
        q: "pid",
        limit: 3,
      })
    })

    it("convierte cadenas numéricas para limit ('1', '2', '3')", () => {
      expect(validateSearchQuery({ q: "plc", limit: "1" })).toEqual({
        q: "plc",
        limit: 1,
      })
      expect(validateSearchQuery({ q: "plc", limit: "2" })).toEqual({
        q: "plc",
        limit: 2,
      })
      expect(validateSearchQuery({ q: "plc", limit: "3" })).toEqual({
        q: "plc",
        limit: 3,
      })
    })

    it("permite exactamente 200 caracteres en q (límite superior exacto)", () => {
      const q200 = "x".repeat(200)
      const res = validateSearchQuery({ q: q200, limit: 3 })
      expect(res.q).toBe(q200)
      expect(res.limit).toBe(3)
    })

    it("rechaza q si supera los 200 caracteres con HTTP 400 (INVALID_REQUEST)", () => {
      const q201 = "x".repeat(201)
      expect.assertions(4)
      try {
        validateSearchQuery({ q: q201, limit: 3 })
      } catch (err: any) {
        expect(err).toBeInstanceOf(MuseValidationError)
        expect(err.statusCode).toBe(400)
        expect(err.code).toBe("INVALID_REQUEST")
        expect(err.message).toContain("200")
      }
    })

    it("rechaza limit menor que 1 con HTTP 400 (INVALID_REQUEST)", () => {
      expect.assertions(3)
      try {
        validateSearchQuery({ q: "plc", limit: 0 })
      } catch (err: any) {
        expect(err).toBeInstanceOf(MuseValidationError)
        expect(err.statusCode).toBe(400)
        expect(err.code).toBe("INVALID_REQUEST")
      }
    })

    it("rechaza limit negativo con HTTP 400 (INVALID_REQUEST)", () => {
      expect.assertions(2)
      try {
        validateSearchQuery({ q: "plc", limit: -1 })
      } catch (err: any) {
        expect(err.statusCode).toBe(400)
        expect(err.code).toBe("INVALID_REQUEST")
      }
    })

    it("rechaza limit mayor que 3 con HTTP 400 (INVALID_REQUEST)", () => {
      expect.assertions(3)
      try {
        validateSearchQuery({ q: "plc", limit: 4 })
      } catch (err: any) {
        expect(err).toBeInstanceOf(MuseValidationError)
        expect(err.statusCode).toBe(400)
        expect(err.code).toBe("INVALID_REQUEST")
      }
    })

    it("rechaza limit no entero (ej. 1.5) con HTTP 400 (INVALID_REQUEST)", () => {
      expect.assertions(2)
      try {
        validateSearchQuery({ q: "plc", limit: 1.5 })
      } catch (err: any) {
        expect(err.statusCode).toBe(400)
        expect(err.code).toBe("INVALID_REQUEST")
      }
    })

    it("rechaza limit con texto no numérico con HTTP 400 (INVALID_REQUEST)", () => {
      expect.assertions(2)
      try {
        validateSearchQuery({ q: "plc", limit: "cinco" })
      } catch (err: any) {
        expect(err.statusCode).toBe(400)
        expect(err.code).toBe("INVALID_REQUEST")
      }
    })

    it("rechaza parámetro q si no es string con HTTP 400 (INVALID_REQUEST)", () => {
      expect.assertions(2)
      try {
        validateSearchQuery({ q: 12345, limit: 2 })
      } catch (err: any) {
        expect(err.statusCode).toBe(400)
        expect(err.code).toBe("INVALID_REQUEST")
      }
    })

    it("rechaza entrada que no sea objeto ni string con HTTP 400 (INVALID_REQUEST)", () => {
      expect.assertions(2)
      try {
        validateSearchQuery(12345)
      } catch (err: any) {
        expect(err.statusCode).toBe(400)
        expect(err.code).toBe("INVALID_REQUEST")
      }
    })
  })

  // --------------------------------------------------------------------------
  // 4. Validador de Evaluación: validateEvaluatePayload
  // --------------------------------------------------------------------------
  describe("validateEvaluatePayload", () => {
    const validRequirement = {
      id: "req-1",
      property: "mounting" as TechnicalProperty,
      operator: "equals" as AllowedOperator,
      value: "DIN Rail",
    }

    const validPayload = {
      variant_id: "variant_01M3Q6R73RP3EBC5GJJFXR7EM3",
      requirements: [validRequirement],
    }

    it("acepta un payload válido y retorna la estructura tipada", () => {
      const res = validateEvaluatePayload(validPayload)
      expect(res.variant_id).toBe("variant_01M3Q6R73RP3EBC5GJJFXR7EM3")
      expect(res.requirements).toHaveLength(1)
      expect(res.requirements[0].id).toBe("req-1")
      expect(res.requirements[0].property).toBe("mounting")
      expect(res.requirements[0].operator).toBe("equals")
      expect(res.requirements[0].value).toBe("DIN Rail")
    })

    it("acepta hasta 10 requirements válidos", () => {
      const reqs = Array.from({ length: 10 }, (_, i) => ({
        id: `req-${i + 1}`,
        property: "supply_voltage" as TechnicalProperty,
        operator: "equals" as AllowedOperator,
        value: 24,
      }))

      const res = validateEvaluatePayload({
        variant_id: "var_123",
        requirements: reqs,
      })
      expect(res.requirements).toHaveLength(10)
    })

    it("rechaza payload nulo o no-objeto con HTTP 400 (INVALID_REQUEST)", () => {
      expect(() => validateEvaluatePayload(null)).toThrow(MuseValidationError)
      expect(() => validateEvaluatePayload("string")).toThrow(MuseValidationError)
      expect(() => validateEvaluatePayload([])).toThrow(MuseValidationError)
    })

    it("rechaza variant_id ausente, vacío o de solo espacios con HTTP 400 (INVALID_REQUEST)", () => {
      expect.assertions(6)

      try {
        validateEvaluatePayload({ requirements: [validRequirement] })
      } catch (err: any) {
        expect(err.statusCode).toBe(400)
        expect(err.code).toBe("INVALID_REQUEST")
      }

      try {
        validateEvaluatePayload({ variant_id: "", requirements: [validRequirement] })
      } catch (err: any) {
        expect(err.statusCode).toBe(400)
        expect(err.code).toBe("INVALID_REQUEST")
      }

      try {
        validateEvaluatePayload({ variant_id: "   ", requirements: [validRequirement] })
      } catch (err: any) {
        expect(err.statusCode).toBe(400)
        expect(err.code).toBe("INVALID_REQUEST")
      }
    })

    it("rechaza variant_id que no sea string con HTTP 400 (INVALID_REQUEST)", () => {
      expect.assertions(2)
      try {
        validateEvaluatePayload({ variant_id: 12345, requirements: [validRequirement] })
      } catch (err: any) {
        expect(err.statusCode).toBe(400)
        expect(err.code).toBe("INVALID_REQUEST")
      }
    })

    it("rechaza requirements ausente o no-array con HTTP 400 (INVALID_REQUEST)", () => {
      expect.assertions(2)
      try {
        validateEvaluatePayload({ variant_id: "var_1" })
      } catch (err: any) {
        expect(err.statusCode).toBe(400)
        expect(err.code).toBe("INVALID_REQUEST")
      }
    })

    it("rechaza array de requirements vacío (longitud 0) con HTTP 400 (INVALID_REQUEST)", () => {
      expect.assertions(3)
      try {
        validateEvaluatePayload({ variant_id: "var_1", requirements: [] })
      } catch (err: any) {
        expect(err.statusCode).toBe(400)
        expect(err.code).toBe("INVALID_REQUEST")
        expect(err.message).toMatch(/between 1 and 10/i)
      }
    })

    it("rechaza más de 10 requirements con HTTP 400 (INVALID_REQUEST)", () => {
      const elevenReqs = Array.from({ length: 11 }, (_, i) => ({
        id: `req-${i}`,
        property: "protocol" as TechnicalProperty,
        operator: "equals" as AllowedOperator,
      }))

      expect.assertions(3)
      try {
        validateEvaluatePayload({ variant_id: "var_1", requirements: elevenReqs })
      } catch (err: any) {
        expect(err.statusCode).toBe(400)
        expect(err.code).toBe("INVALID_REQUEST")
        expect(err.message).toMatch(/between 1 and 10/i)
      }
    })

    it("rechaza requirement que no sea objeto con HTTP 400 (INVALID_REQUEST)", () => {
      expect.assertions(2)
      try {
        validateEvaluatePayload({
          variant_id: "var_1",
          requirements: ["not_an_object"],
        })
      } catch (err: any) {
        expect(err.statusCode).toBe(400)
        expect(err.code).toBe("INVALID_REQUEST")
      }
    })

    it("rechaza requirement sin id o con id vacío con HTTP 400 (INVALID_REQUEST)", () => {
      expect.assertions(2)
      try {
        validateEvaluatePayload({
          variant_id: "var_1",
          requirements: [
            {
              id: "",
              property: "mounting",
              operator: "equals",
            },
          ],
        })
      } catch (err: any) {
        expect(err.statusCode).toBe(400)
        expect(err.code).toBe("INVALID_REQUEST")
      }
    })

    it("rechaza requirement con property fuera del vocabulario cerrado con HTTP 400 (INVALID_PROPERTY)", () => {
      expect.assertions(4)
      try {
        validateEvaluatePayload({
          variant_id: "var_1",
          requirements: [
            {
              id: "req-invalid-prop",
              property: "color", // No pertenece al vocabulario de 8 propiedades
              operator: "equals",
            },
          ],
        })
      } catch (err: any) {
        expect(err).toBeInstanceOf(MuseValidationError)
        expect(err.statusCode).toBe(400)
        expect(err.code).toBe("INVALID_PROPERTY")
        expect(err.isVocabularyError).toBe(true)
      }
    })

    it("rechaza con INVALID_VOCABULARY si se configura la opción propertyErrorCode", () => {
      expect.assertions(3)
      try {
        validateEvaluatePayload(
          {
            variant_id: "var_1",
            requirements: [
              {
                id: "req-invalid-prop",
                property: "pressure_bar",
                operator: "equals",
              },
            ],
          },
          { propertyErrorCode: "INVALID_VOCABULARY" }
        )
      } catch (err: any) {
        expect(err.statusCode).toBe(400)
        expect(err.code).toBe("INVALID_VOCABULARY")
        expect(err.isVocabularyError).toBe(true)
      }
    })

    it("rechaza requirement con operador inválido con HTTP 400 (INVALID_REQUEST)", () => {
      expect.assertions(3)
      try {
        validateEvaluatePayload({
          variant_id: "var_1",
          requirements: [
            {
              id: "req-1",
              property: "analog_input",
              operator: "fuzzy_match", // Operador no permitido
            },
          ],
        })
      } catch (err: any) {
        expect(err.statusCode).toBe(400)
        expect(err.code).toBe("INVALID_REQUEST")
        expect(err.message).toContain("fuzzy_match")
      }
    })

    it("preserva campos adicionales en los requirements (como value, channel, metadata)", () => {
      const res = validateEvaluatePayload({
        variant_id: "var_1",
        requirements: [
          {
            id: "req-complex",
            property: "analog_input",
            operator: "range_contains",
            value: { min: 4, max: 20, unit: "mA" },
            channel: 1,
          },
        ],
      })

      expect(res.requirements[0].value).toEqual({ min: 4, max: 20, unit: "mA" })
      expect((res.requirements[0] as any).channel).toBe(1)
    })
  })

  // --------------------------------------------------------------------------
  // 5. Utilidades y Helpers
  // --------------------------------------------------------------------------
  describe("MuseValidationError y Helpers", () => {
    it("serializa correctamente en toJSON con error y code", () => {
      const err = new MuseValidationError("Bad request payload", "INVALID_REQUEST", {
        detail: "foo",
      })
      const json = err.toJSON()
      expect(json.code).toBe("INVALID_REQUEST")
      expect(json.message).toBe("Bad request payload")
      expect(json.error.code).toBe("INVALID_REQUEST")
      expect(json.error.message).toBe("Bad request payload")
      expect((json as any).details).toEqual({ detail: "foo" })
    })

    it("isVocabularyError detecta errores de vocabulario por código o flag", () => {
      const vocabErr1 = new MuseValidationError("Bad prop", "INVALID_PROPERTY")
      const vocabErr2 = new MuseValidationError("Bad prop", "INVALID_VOCABULARY")
      const reqErr = new MuseValidationError("Bad req", "INVALID_REQUEST")

      expect(isVocabularyError(vocabErr1)).toBe(true)
      expect(isVocabularyError(vocabErr2)).toBe(true)
      expect(isVocabularyError(reqErr)).toBe(false)
      expect(isVocabularyError(null)).toBe(false)
    })
  })

  // --------------------------------------------------------------------------
  // 6. Esquemas Zod
  // --------------------------------------------------------------------------
  describe("Esquemas Zod Exportados", () => {
    it("SearchQuerySchema valida correctamente", () => {
      const parsed = SearchQuerySchema.parse({ q: "test", limit: "2" })
      expect(parsed.q).toBe("test")
      expect(parsed.limit).toBe(2)
    })

    it("EvaluatePayloadSchema valida variant_id y requirements", () => {
      const parsed = EvaluatePayloadSchema.parse({
        variant_id: "var_test",
        requirements: [
          {
            id: "r1",
            property: "mounting",
            operator: "equals",
          },
        ],
      })
      expect(parsed.variant_id).toBe("var_test")
      expect(parsed.requirements).toHaveLength(1)
    })
  })
})
