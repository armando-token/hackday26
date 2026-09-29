import { z } from "zod"

/**
 * Muse API Constants & Limits (Anti-DoS & Input Sanitization)
 */
export const MAX_QUERY_LENGTH = 200
export const MIN_SEARCH_LIMIT = 1
export const MAX_SEARCH_LIMIT = 3
export const DEFAULT_SEARCH_LIMIT = 3

export const MIN_REQUIREMENTS_COUNT = 1
export const MAX_REQUIREMENTS_COUNT = 10

export const MIN_QUOTE_QUANTITY = 1
export const MAX_QUOTE_QUANTITY = 20

export const MAX_PAYLOAD_NESTING_DEPTH = 10

export const PROHIBITED_KEYS = Object.freeze([
  "__proto__",
  "constructor",
  "prototype",
] as const)

export const SUPPORTED_PROPERTIES = [
  "mounting",
  "supply_voltage",
  "analog_input",
  "analog_output",
  "protocol",
  "interface",
  "sensor_element",
  "control_function",
] as const

export const SUPPORTED_OPERATORS = [
  "range_contains",
  "equals",
  "in",
  "greater_than_or_equal",
  "less_than_or_equal",
  "gte",
  "lte",
] as const

import { MuseValidationError } from "./schema-validator"
export { MuseValidationError }

/**
 * Sanitizes search query string `q`:
 * - Recorta a 200 caracteres (`MAX_QUERY_LENGTH`).
 * - Elimina caracteres nulos (`\0`, `\u0000`, `%00`).
 * - Elimina secuencias de escape ANSI (`\x1b[...]`).
 * - Normaliza saltos de línea y tabuladores a espacios sencillos.
 * - Elimina caracteres de control peligrosos C0 y C1 (ASCII 0-31, 127-159) y caracteres bidireccionales de spoofing.
 * - Colapsa espacios redundantes y aplica trim.
 */
export function sanitizeQuery(q: unknown): string {
  if (typeof q !== "string") {
    if (q === null || q === undefined) {
      return ""
    }
    // Handle array or other unexpected types defensively
    if (Array.isArray(q) && q.length > 0 && typeof q[0] === "string") {
      return sanitizeQuery(q[0])
    }
    return ""
  }

  // 1. Elimina caracteres nulos (literales o codificados)
  let cleaned = q.replace(/(\x00|\u0000|%00)/g, "")

  // 2. Elimina secuencias de escape ANSI
  cleaned = cleaned.replace(/\u001b\[[0-9;]*[a-zA-Z]/g, "")

  // 3. Normaliza saltos de línea y tabulaciones a espacios
  cleaned = cleaned.replace(/[\r\n\t\f\v]+/g, " ")

  // 4. Elimina caracteres de control no imprimibles C0 y C1 (DEL incluido) y caracteres Bidi de spoofing
  cleaned = cleaned.replace(/[\u0000-\u001f\u007f-\u009f\u200e\u200f\u202a-\u202e\u2066-\u2069]/g, "")

  // 5. Colapso de espacios múltiples
  cleaned = cleaned.replace(/\s+/g, " ")

  // 6. Trim de bordes
  cleaned = cleaned.trim()

  // 7. Recorta estrictamente a un máximo de 200 caracteres
  return cleaned.slice(0, MAX_QUERY_LENGTH)
}

/**
 * Valida que un límite de búsqueda sea un entero finito entre 1 y 3.
 * Si es indefinido o vacío, retorna el valor por defecto (3).
 */
export function validateSearchLimit(
  limit: unknown,
  defaultLimit = DEFAULT_SEARCH_LIMIT
): number {
  if (limit === undefined || limit === null || limit === "") {
    return defaultLimit
  }

  const num = typeof limit === "number" ? limit : Number(limit)

  if (
    !Number.isFinite(num) ||
    Number.isNaN(num) ||
    !Number.isInteger(num) ||
    num < MIN_SEARCH_LIMIT ||
    num > MAX_SEARCH_LIMIT
  ) {
    throw new MuseValidationError(
      `Search limit must be an integer between ${MIN_SEARCH_LIMIT} and ${MAX_SEARCH_LIMIT}, received: ${String(limit)}`,
      "INVALID_LIMIT"
    )
  }

  return num
}

/**
 * Valida la cantidad para cotizaciones preliminares (entre 1 y 20).
 */
export function validateQuantity(
  quantity: unknown,
  min = MIN_QUOTE_QUANTITY,
  max = MAX_QUOTE_QUANTITY
): number {
  if (quantity === undefined || quantity === null || quantity === "") {
    throw new MuseValidationError("Quantity is required", "MISSING_QUANTITY")
  }

  const num = typeof quantity === "number" ? quantity : Number(quantity)

  if (
    !Number.isFinite(num) ||
    Number.isNaN(num) ||
    !Number.isInteger(num) ||
    num < min ||
    num > max
  ) {
    throw new MuseValidationError(
      `Quantity must be an integer between ${min} and ${max}, received: ${String(quantity)}`,
      "INVALID_QUANTITY"
    )
  }

  return num
}

/**
 * Verifica si una clave es prohibida por riesgo de prototype pollution.
 */
export function isProhibitedKey(key: string): boolean {
  return (PROHIBITED_KEYS as readonly string[]).includes(key)
}

/**
 * Inspecciona recursivamente un objeto o payload en busca de:
 * 1. Intentos de Prototype Pollution (`__proto__`, `constructor`, `prototype`).
 * 2. Referencias circulares maliciosas.
 * 3. Profundidad excesiva de anidamiento (Anti-DoS, límite: 10).
 *
 * Retorna un mensaje descriptivo si detecta alguna anomalía, o null si está limpio.
 */
export function detectPrototypePollution(
  value: unknown,
  depth = 0,
  seen = new WeakSet()
): string | null {
  if (value === null || typeof value !== "object") {
    return null
  }

  if (depth > MAX_PAYLOAD_NESTING_DEPTH) {
    return `Payload exceeds maximum nesting depth of ${MAX_PAYLOAD_NESTING_DEPTH} (Anti-DoS protection)`
  }

  if (seen.has(value)) {
    return "Cyclic reference detected in payload"
  }
  seen.add(value)

  if (Array.isArray(value)) {
    for (let i = 0; i < value.length; i++) {
      const error = detectPrototypePollution(value[i], depth + 1, seen)
      if (error) {
        return `[${i}].${error}`
      }
    }
    return null
  }

  // Verifica propiedades propias directas (incluso no enumerables)
  const ownKeys = Object.getOwnPropertyNames(value)
  for (const key of ownKeys) {
    if (isProhibitedKey(key)) {
      return `Prohibited prototype pollution key "${key}" detected`
    }
    const error = detectPrototypePollution(
      (value as Record<string, unknown>)[key],
      depth + 1,
      seen
    )
    if (error) {
      return `"${key}".${error}`
    }
  }

  // Verifica símbolos propios
  const ownSymbols = Object.getOwnPropertySymbols(value)
  for (const sym of ownSymbols) {
    const error = detectPrototypePollution(
      (value as Record<symbol, unknown>)[sym],
      depth + 1,
      seen
    )
    if (error) {
      return `${sym.toString()}.${error}`
    }
  }

  return null
}

/**
 * Retorna true si el payload contiene un intento de prototype pollution o riesgo DoS de anidamiento.
 */
export function hasPrototypePollution(value: unknown): boolean {
  return detectPrototypePollution(value) !== null
}

/**
 * Lanza un MuseValidationError si el payload contiene prototype pollution o claves prohibidas.
 */
export function assertNoPrototypePollution(value: unknown): void {
  const violation = detectPrototypePollution(value)
  if (violation) {
    throw new MuseValidationError(
      `Prototype pollution or malformed payload detected: ${violation}`,
      "PROTOTYPE_POLLUTION_DETECTED"
    )
  }
}

/**
 * Parsea de forma segura un JSON string asegurando que ninguna clave peligrosa
 * sea procesada durante o después del parseo.
 */
export function safeJsonParse<T = unknown>(jsonText: string): T {
  if (typeof jsonText !== "string") {
    throw new MuseValidationError("JSON payload must be a string", "INVALID_JSON_INPUT")
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(jsonText, (key, val) => {
      if (isProhibitedKey(key)) {
        throw new MuseValidationError(
          `Prohibited prototype pollution key "${key}" detected in JSON`,
          "PROTOTYPE_POLLUTION_DETECTED"
        )
      }
      return val
    })
  } catch (err: any) {
    if (err instanceof MuseValidationError) {
      throw err
    }
    throw new MuseValidationError(
      `Malformed JSON payload: ${err.message}`,
      "MALFORMED_JSON"
    )
  }

  assertNoPrototypePollution(parsed)
  return parsed as T
}

/**
 * Valida tipos y rangos numéricos para el operador `range_contains`:
 * - `min` y `max` deben ser números finitos (no NaN, no Infinity).
 * - `min <= max`. Si `min > max`, se rechaza con error explícito.
 * - `channels_at_least` (opcional): debe ser entero >= 1.
 */
export function validateRangeContains(params: {
  min: unknown
  max: unknown
  unit?: unknown
  channels_at_least?: unknown
  direction?: unknown
}): {
  min: number
  max: number
  unit?: string
  channels_at_least?: number
  direction?: "input" | "output"
} {
  const { min, max, unit, channels_at_least, direction } = params

  if (typeof min !== "number" || !Number.isFinite(min) || Number.isNaN(min)) {
    throw new MuseValidationError(
      `range_contains: 'min' must be a finite number, received: ${String(min)}`,
      "INVALID_RANGE_MIN"
    )
  }

  if (typeof max !== "number" || !Number.isFinite(max) || Number.isNaN(max)) {
    throw new MuseValidationError(
      `range_contains: 'max' must be a finite number, received: ${String(max)}`,
      "INVALID_RANGE_MAX"
    )
  }

  if (min > max) {
    throw new MuseValidationError(
      `range_contains: 'min' (${min}) must be less than or equal to 'max' (${max})`,
      "INVALID_RANGE_BOUNDS"
    )
  }

  const result: {
    min: number
    max: number
    unit?: string
    channels_at_least?: number
    direction?: "input" | "output"
  } = { min, max }

  if (unit !== undefined && unit !== null) {
    if (typeof unit !== "string" || unit.trim().length === 0) {
      throw new MuseValidationError(
        "range_contains: 'unit' must be a non-empty string when provided",
        "INVALID_UNIT"
      )
    }
    result.unit = unit.trim()
  }

  if (channels_at_least !== undefined && channels_at_least !== null) {
    if (
      typeof channels_at_least !== "number" ||
      !Number.isInteger(channels_at_least) ||
      channels_at_least < 1
    ) {
      throw new MuseValidationError(
        "range_contains: 'channels_at_least' must be an integer >= 1",
        "INVALID_CHANNELS"
      )
    }
    result.channels_at_least = channels_at_least
  }

  if (direction !== undefined && direction !== null) {
    if (direction !== "input" && direction !== "output") {
      throw new MuseValidationError(
        "range_contains: 'direction' must be 'input' or 'output'",
        "INVALID_DIRECTION"
      )
    }
    result.direction = direction
  }

  return result
}

/**
 * Valida el tamaño estricto del array `requirements` (Anti-DoS):
 * - Debe ser un Array.
 * - Mínimo 1 item.
 * - Máximo 10 items (`MAX_REQUIREMENTS_COUNT`).
 */
export function validateRequirementsArrayLength(requirements: unknown): void {
  if (!Array.isArray(requirements)) {
    throw new MuseValidationError(
      "Field 'requirements' must be an array",
      "INVALID_REQUIREMENTS_FORMAT"
    )
  }

  if (requirements.length < MIN_REQUIREMENTS_COUNT) {
    throw new MuseValidationError(
      `Requirements array must contain at least ${MIN_REQUIREMENTS_COUNT} requirement`,
      "EMPTY_REQUIREMENTS"
    )
  }

  if (requirements.length > MAX_REQUIREMENTS_COUNT) {
    throw new MuseValidationError(
      `Requirements array exceeds maximum allowed limit of ${MAX_REQUIREMENTS_COUNT} items (received ${requirements.length})`,
      "TOO_MANY_REQUIREMENTS"
    )
  }
}

// ============================================================================
// Esquemas Zod para Validación Integrada
// ============================================================================

/**
 * Esquema para parámetros de búsqueda `GET /api/muse/v1/products/search`
 */
export const MuseSearchQuerySchema = z.object({
  q: z
    .unknown()
    .optional()
    .transform((val) => sanitizeQuery(val)),
  limit: z
    .union([z.number(), z.string()])
    .optional()
    .transform((val, ctx) => {
      try {
        return validateSearchLimit(val)
      } catch (err: any) {
        ctx.addIssue({
          code: "custom",
          message: err.message,
        })
        return z.NEVER
      }
    }),
})

/**
 * Esquema para requisito con operador `range_contains`
 */
export const MuseRangeContainsRequirementSchema = z
  .object({
    id: z.string().trim().max(100).optional(),
    property: z.string().trim().min(1, "Property name is required").max(100),
    operator: z.literal("range_contains"),
    min: z.number().refine((n) => Number.isFinite(n) && !Number.isNaN(n), {
      message: "min must be a finite number",
    }),
    max: z.number().refine((n) => Number.isFinite(n) && !Number.isNaN(n), {
      message: "max must be a finite number",
    }),
    unit: z.string().trim().max(50).optional(),
    direction: z.enum(["input", "output"]).optional(),
    channels_at_least: z
      .number()
      .int()
      .min(1, "channels_at_least must be at least 1")
      .optional(),
  })
  .strict()
  .superRefine((data, ctx) => {
    if (data.min > data.max) {
      ctx.addIssue({
        code: "custom",
        message: `range_contains: min (${data.min}) must be less than or equal to max (${data.max})`,
        path: ["min"],
      })
    }
  })

/**
 * Esquema para requisito con operador `equals`
 */
export const MuseEqualsRequirementSchema = z
  .object({
    id: z.string().trim().max(100).optional(),
    property: z.string().trim().min(1, "Property name is required").max(100),
    operator: z.literal("equals"),
    value: z.union([z.string(), z.number(), z.boolean()]),
    unit: z.string().trim().max(50).optional(),
  })
  .strict()

/**
 * Esquema para requisito con operador `in`
 */
export const MuseInRequirementSchema = z
  .object({
    id: z.string().trim().max(100).optional(),
    property: z.string().trim().min(1, "Property name is required").max(100),
    operator: z.literal("in"),
    values: z
      .array(z.union([z.string(), z.number()]))
      .min(1, "Operator 'in' requires at least one value")
      .max(20, "Operator 'in' allows at most 20 values"),
  })
  .strict()

/**
 * Esquema para requisitos de comparación numérica (`greater_than_or_equal`, `less_than_or_equal`, `gte`, `lte`)
 */
export const MuseComparisonRequirementSchema = z
  .object({
    id: z.string().trim().max(100).optional(),
    property: z.string().trim().min(1, "Property name is required").max(100),
    operator: z.enum([
      "greater_than_or_equal",
      "less_than_or_equal",
      "gte",
      "lte",
    ]),
    value: z.number().refine((n) => Number.isFinite(n) && !Number.isNaN(n), {
      message: "value must be a finite number",
    }),
    unit: z.string().trim().max(50).optional(),
  })
  .strict()

/**
 * Esquema unificado para cualquier requisito de evaluación Muse
 */
export const MuseRequirementSchema = z.discriminatedUnion("operator", [
  MuseRangeContainsRequirementSchema,
  MuseEqualsRequirementSchema,
  MuseInRequirementSchema,
  MuseComparisonRequirementSchema,
])

/**
 * Esquema de payload para evaluación técnica `POST /api/muse/v1/evaluate`
 */
export const MuseEvaluatePayloadSchema = z
  .object({
    variant_id: z
      .string()
      .trim()
      .min(1, "variant_id cannot be empty")
      .max(200, "variant_id exceeds maximum length of 200"),
    requirements: z
      .array(MuseRequirementSchema)
      .min(MIN_REQUIREMENTS_COUNT, `At least ${MIN_REQUIREMENTS_COUNT} requirement is required`)
      .max(
        MAX_REQUIREMENTS_COUNT,
        `Maximum ${MAX_REQUIREMENTS_COUNT} requirements allowed (Anti-DoS)`
      ),
  })
  .strict()

/**
 * Esquema de payload para cotizaciones preliminares `POST /api/muse/v1/preliminary-quotes`
 */
export const MusePreliminaryQuotePayloadSchema = z
  .object({
    variant_id: z
      .string()
      .trim()
      .min(1, "variant_id cannot be empty")
      .max(200),
    quantity: z
      .number()
      .int("quantity must be an integer")
      .min(MIN_QUOTE_QUANTITY, `quantity must be at least ${MIN_QUOTE_QUANTITY}`)
      .max(MAX_QUOTE_QUANTITY, `quantity cannot exceed ${MAX_QUOTE_QUANTITY}`),
    region_id: z.string().trim().max(100).optional(),
    idempotency_key: z.string().trim().max(128).optional(),
  })
  .strict()

// Tipos inferidos
export type MuseSearchQueryInput = z.infer<typeof MuseSearchQuerySchema>
export type MuseRangeContainsRequirement = z.infer<typeof MuseRangeContainsRequirementSchema>
export type MuseEqualsRequirement = z.infer<typeof MuseEqualsRequirementSchema>
export type MuseInRequirement = z.infer<typeof MuseInRequirementSchema>
export type MuseComparisonRequirement = z.infer<typeof MuseComparisonRequirementSchema>
export type MuseRequirement = z.infer<typeof MuseRequirementSchema>
export type MuseEvaluatePayload = z.infer<typeof MuseEvaluatePayloadSchema>
export type MusePreliminaryQuotePayload = z.infer<typeof MusePreliminaryQuotePayloadSchema>

/**
 * Función integral para sanitizar y validar completamente el payload de `POST /api/muse/v1/evaluate`.
 * Aplica:
 * 1. Detección y rechazo de Prototype Pollution (`__proto__`, `constructor`, `prototype`).
 * 2. Control estricto de tamaño del array `requirements` (1 a 10 items).
 * 3. Validación de tipos y operadores (p. ej. `range_contains` con min <= max y números finitos).
 * 4. Parseo estricto con el esquema Zod.
 */
export function sanitizeEvaluatePayload(rawPayload: unknown): MuseEvaluatePayload {
  if (rawPayload === null || typeof rawPayload !== "object") {
    throw new MuseValidationError(
      "Evaluate payload must be a non-null object",
      "INVALID_PAYLOAD_TYPE"
    )
  }

  // 1. Barrera Anti-Prototype Pollution y Anti-DoS
  assertNoPrototypePollution(rawPayload)

  // 2. Control previo de longitud del array de requisitos
  const rawReqs = (rawPayload as Record<string, unknown>).requirements
  validateRequirementsArrayLength(rawReqs)

  // 3. Validación mediante esquema Zod
  const result = MuseEvaluatePayloadSchema.safeParse(rawPayload)
  if (!result.success) {
    const firstIssue = result.error.issues[0]
    const pathStr = firstIssue.path.length > 0 ? ` at path "${firstIssue.path.join(".")}"` : ""
    throw new MuseValidationError(
      `Validation error${pathStr}: ${firstIssue.message}`,
      "SCHEMA_VALIDATION_ERROR",
      result.error.issues,
      400
    )
  }

  return result.data
}

/**
 * Función integral para sanitizar parámetros de búsqueda.
 */
export function sanitizeSearchParams(query: Record<string, unknown>): {
  q: string
  limit: number
} {
  assertNoPrototypePollution(query)

  const result = MuseSearchQuerySchema.safeParse(query)
  if (!result.success) {
    const firstIssue = result.error.issues[0]
    throw new MuseValidationError(
      `Invalid search parameter: ${firstIssue.message}`,
      "INVALID_SEARCH_PARAMS",
      result.error.issues,
      400
    )
  }

  return result.data
}
