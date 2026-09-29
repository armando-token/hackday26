import { z } from "zod"

/**
 * ============================================================================
 * Meta Muse Technical Schema & Closed Vocabulary Validator
 * ============================================================================
 * 
 * Este módulo define el esquema formal, el vocabulario técnico cerrado y los
 * validadores estrictos para las peticiones de los agentes de comercio de Muse:
 * 
 * 1. Vocabulario técnico cerrado de 8 propiedades normalizadas.
 * 2. Conjunto cerrado de 7 operadores lógicos y relacionales admitidos.
 * 3. Validador estricto para búsqueda (/search): q <= 200 car., limit 1..3 (def: 3).
 * 4. Validador estricto para evaluación (/evaluate): variant_id no vacío, 1..10 reqs,
 *    con id, property y operator válidos. Rechazo con HTTP 400 (INVALID_PROPERTY
 *    o INVALID_VOCABULARY / INVALID_REQUEST).
 */

// ----------------------------------------------------------------------------
// 1. Vocabulario Técnico Cerrado (Closed Technical Vocabulary)
// ----------------------------------------------------------------------------

export const TECHNICAL_PROPERTIES = [
  "mounting",
  "supply_voltage",
  "analog_input",
  "analog_output",
  "protocol",
  "interface",
  "sensor_element",
  "control_function",
] as const

export type TechnicalProperty = (typeof TECHNICAL_PROPERTIES)[number]

// Aliases para compatibilidad con distintos consumidores
export const MUSE_TECHNICAL_PROPERTIES = TECHNICAL_PROPERTIES
export type MuseTechnicalProperty = TechnicalProperty
export type MuseProperty = TechnicalProperty

// ----------------------------------------------------------------------------
// 2. Operadores Permitidos (Allowed Operators)
// ----------------------------------------------------------------------------

export const ALLOWED_OPERATORS = [
  "equals",
  "not_equals",
  "range_contains",
  "in",
  "greater_than_or_equal",
  "less_than_or_equal",
  "contains",
] as const

export type AllowedOperator = (typeof ALLOWED_OPERATORS)[number]

// Aliases para compatibilidad con distintos consumidores
export const MUSE_OPERATORS = ALLOWED_OPERATORS
export type MuseOperator = AllowedOperator

// ----------------------------------------------------------------------------
// 3. Códigos de Error y Clase de Error Muse
// ----------------------------------------------------------------------------

export const MUSE_ERROR_CODES = {
  INVALID_REQUEST: "INVALID_REQUEST",
  INVALID_PROPERTY: "INVALID_PROPERTY",
  INVALID_VOCABULARY: "INVALID_VOCABULARY",
  INVALID_OPERATOR: "INVALID_OPERATOR",
} as const

export type MuseErrorCode =
  | "INVALID_REQUEST"
  | "INVALID_PROPERTY"
  | "INVALID_VOCABULARY"
  | "INVALID_OPERATOR"

/**
 * Error de validación específico para el protocolo de la API Muse.
 * Cumple con HTTP status 400 y expone el código canónico requerido.
 */
export class MuseValidationError extends Error {
  public readonly statusCode: number = 400
  public readonly status: number = 400
  public readonly code: string
  public readonly details?: unknown
  public readonly isVocabularyError?: boolean

  constructor(
    message: string,
    code: string = MUSE_ERROR_CODES.INVALID_REQUEST,
    details?: unknown,
    statusCode: number = 400
  ) {
    super(message)
    this.name = "MuseValidationError"
    this.code = code
    this.statusCode = statusCode
    this.status = statusCode
    this.details = details
    if (
      code === MUSE_ERROR_CODES.INVALID_PROPERTY ||
      code === MUSE_ERROR_CODES.INVALID_VOCABULARY
    ) {
      this.isVocabularyError = true
    }
    Object.setPrototypeOf(this, MuseValidationError.prototype)
  }

  toJSON() {
    return {
      error: {
        code: this.code,
        message: this.message,
        ...(this.details !== undefined ? { details: this.details } : {}),
      },
      code: this.code,
      message: this.message,
      ...(this.details !== undefined ? { details: this.details } : {}),
    }
  }
}

// ----------------------------------------------------------------------------
// 4. Predicados de Tipo (Type Guards)
// ----------------------------------------------------------------------------

/**
 * Comprueba en tiempo de ejecución si un valor pertenece al vocabulario técnico cerrado.
 */
export function isTechnicalProperty(property: unknown): property is TechnicalProperty {
  return (
    typeof property === "string" &&
    (TECHNICAL_PROPERTIES as readonly string[]).includes(property)
  )
}

/**
 * Comprueba en tiempo de ejecución si un valor es un operador válido.
 */
export function isAllowedOperator(operator: unknown): operator is AllowedOperator {
  return (
    typeof operator === "string" &&
    (ALLOWED_OPERATORS as readonly string[]).includes(operator)
  )
}

/**
 * Comprueba si un error es un error de vocabulario técnico inválido.
 */
export function isVocabularyError(err: unknown): boolean {
  if (!err || typeof err !== "object") return false
  const anyErr = err as Record<string, unknown>
  return (
    anyErr.code === MUSE_ERROR_CODES.INVALID_PROPERTY ||
    anyErr.code === MUSE_ERROR_CODES.INVALID_VOCABULARY ||
    anyErr.isVocabularyError === true ||
    (typeof anyErr.message === "string" &&
      anyErr.message.toLowerCase().includes("vocabulary"))
  )
}

/**
 * Validador unitario para una propiedad individual.
 */
export function validateProperty(
  property: unknown,
  errorCode: "INVALID_PROPERTY" | "INVALID_VOCABULARY" = "INVALID_PROPERTY"
): TechnicalProperty {
  if (!isTechnicalProperty(property)) {
    throw new MuseValidationError(
      `Property '${String(property)}' does not belong to closed technical vocabulary. Allowed properties: ${TECHNICAL_PROPERTIES.join(", ")}`,
      errorCode,
      { property, allowed: TECHNICAL_PROPERTIES }
    )
  }
  return property
}

/**
 * Validador unitario para un operador individual.
 */
export function validateOperator(operator: unknown): AllowedOperator {
  if (!isAllowedOperator(operator)) {
    throw new MuseValidationError(
      `Operator '${String(operator)}' is not permitted. Allowed operators: ${ALLOWED_OPERATORS.join(", ")}`,
      MUSE_ERROR_CODES.INVALID_REQUEST,
      { operator, allowed: ALLOWED_OPERATORS }
    )
  }
  return operator
}

// ----------------------------------------------------------------------------
// 5. Validador de Búsqueda: validateSearchQuery
// ----------------------------------------------------------------------------

export interface SearchQueryInput {
  q?: string | null
  limit?: number | string | null
  [key: string]: unknown
}

export interface ValidatedSearchQuery {
  q: string
  limit: number
}

/**
 * Validador estricto para los parámetros de búsqueda de la API Muse.
 *
 * Criterios:
 * - q: <= 200 caracteres (default "").
 * - limit: número entero entre 1 y 3 inclusive (default 3).
 * - Rechaza con HTTP 400 (`INVALID_REQUEST`) si q > 200 o limit < 1 o limit > 3.
 */
export function validateSearchQuery(query?: unknown): ValidatedSearchQuery {
  let rawQ: unknown
  let rawLimit: unknown

  if (typeof query === "string") {
    rawQ = query
    rawLimit = undefined
  } else if (query && typeof query === "object" && !Array.isArray(query)) {
    const obj = query as Record<string, unknown>
    rawQ = obj.q
    rawLimit = obj.limit
  } else if (query === undefined || query === null) {
    rawQ = ""
    rawLimit = undefined
  } else {
    throw new MuseValidationError(
      "Search query must be an object or query string",
      MUSE_ERROR_CODES.INVALID_REQUEST
    )
  }

  // Validación del parámetro 'q'
  let q = ""
  if (rawQ !== undefined && rawQ !== null) {
    if (typeof rawQ !== "string") {
      throw new MuseValidationError(
        "Search query parameter 'q' must be a string",
        MUSE_ERROR_CODES.INVALID_REQUEST
      )
    }
    if (rawQ.length > 200) {
      throw new MuseValidationError(
        `Search query 'q' exceeds maximum length of 200 characters (received ${rawQ.length})`,
        MUSE_ERROR_CODES.INVALID_REQUEST,
        { length: rawQ.length, max: 200 }
      )
    }
    q = rawQ
  }

  // Validación del parámetro 'limit'
  let limit = 3
  if (rawLimit !== undefined && rawLimit !== null && rawLimit !== "") {
    let parsed: number
    if (typeof rawLimit === "number") {
      parsed = rawLimit
    } else if (typeof rawLimit === "string") {
      const trimmed = rawLimit.trim()
      if (!/^-?\d+$/.test(trimmed)) {
        throw new MuseValidationError(
          `Query parameter 'limit' must be an integer between 1 and 3 (received '${rawLimit}')`,
          MUSE_ERROR_CODES.INVALID_REQUEST,
          { limit: rawLimit }
        )
      }
      parsed = parseInt(trimmed, 10)
    } else {
      throw new MuseValidationError(
        "Query parameter 'limit' must be an integer between 1 and 3",
        MUSE_ERROR_CODES.INVALID_REQUEST,
        { limit: rawLimit }
      )
    }

    if (!Number.isInteger(parsed) || parsed < 1 || parsed > 3) {
      throw new MuseValidationError(
        `Query parameter 'limit' must be an integer between 1 and 3 (received ${parsed})`,
        MUSE_ERROR_CODES.INVALID_REQUEST,
        { limit: parsed, min: 1, max: 3 }
      )
    }
    limit = parsed
  }

  return { q, limit }
}

// ----------------------------------------------------------------------------
// 6. Validador de Evaluación: validateEvaluatePayload
// ----------------------------------------------------------------------------

export interface EvaluateRequirement {
  id: string
  property: TechnicalProperty
  operator: AllowedOperator
  value?: unknown
  [key: string]: unknown
}

export interface ValidatedEvaluatePayload {
  variant_id: string
  requirements: EvaluateRequirement[]
}

export interface ValidateEvaluateOptions {
  /**
   * Código de error emitido si la propiedad no pertenece al vocabulario cerrado.
   * Por defecto 'INVALID_PROPERTY' (admite también 'INVALID_VOCABULARY').
   */
  propertyErrorCode?: "INVALID_PROPERTY" | "INVALID_VOCABULARY"
}

/**
 * Validador estricto para el cuerpo de evaluación técnica (/api/muse/v1/evaluate).
 *
 * Criterios:
 * - variant_id: string no vacío.
 * - requirements: array de 1 a 10 elementos inclusive.
 * - Cada requirement:
 *   - id: string no vacío.
 *   - property: valor perteneciente al vocabulario técnico cerrado (8 propiedades).
 *   - operator: operador relacional permitido (7 operadores).
 * - Rechaza con HTTP 400 (`INVALID_PROPERTY` o `INVALID_VOCABULARY`) si la propiedad no es válida.
 * - Rechaza con HTTP 400 (`INVALID_REQUEST`) si variant_id, requirements u operador no son válidos.
 */
export function validateEvaluatePayload(
  body: unknown,
  options?: ValidateEvaluateOptions
): ValidatedEvaluatePayload {
  const propertyErrorCode =
    options?.propertyErrorCode ||
    (process.env.MUSE_PROPERTY_ERROR_CODE as
      | "INVALID_PROPERTY"
      | "INVALID_VOCABULARY") ||
    "INVALID_PROPERTY"

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new MuseValidationError(
      "Request body must be a valid JSON object",
      MUSE_ERROR_CODES.INVALID_REQUEST
    )
  }

  const raw = body as Record<string, unknown>

  // 1. Validar variant_id
  if (typeof raw.variant_id !== "string" || raw.variant_id.trim().length === 0) {
    throw new MuseValidationError(
      "Field 'variant_id' is required and must be a non-empty string",
      MUSE_ERROR_CODES.INVALID_REQUEST,
      { field: "variant_id" }
    )
  }

  const variantId = raw.variant_id.trim()

  // 2. Validar requirements (array de 1 a 10 elementos)
  if (!Array.isArray(raw.requirements)) {
    throw new MuseValidationError(
      "Field 'requirements' must be an array of 1 to 10 items",
      MUSE_ERROR_CODES.INVALID_REQUEST,
      { field: "requirements" }
    )
  }

  if (raw.requirements.length < 1 || raw.requirements.length > 10) {
    throw new MuseValidationError(
      `Field 'requirements' must contain between 1 and 10 items (received ${raw.requirements.length})`,
      MUSE_ERROR_CODES.INVALID_REQUEST,
      { count: raw.requirements.length, min: 1, max: 10 }
    )
  }

  // 3. Validar cada requirement de forma individual y exhaustiva
  const validatedRequirements: EvaluateRequirement[] = []

  for (let i = 0; i < raw.requirements.length; i++) {
    const item = raw.requirements[i]

    if (!item || typeof item !== "object" || Array.isArray(item)) {
      throw new MuseValidationError(
        `Requirement at index ${i} must be an object`,
        MUSE_ERROR_CODES.INVALID_REQUEST,
        { index: i }
      )
    }

    const reqObj = item as Record<string, unknown>

    // Validar 'id'
    if (typeof reqObj.id !== "string" || reqObj.id.trim().length === 0) {
      throw new MuseValidationError(
        `Requirement at index ${i} must have a non-empty string 'id'`,
        MUSE_ERROR_CODES.INVALID_REQUEST,
        { index: i, field: "id" }
      )
    }

    // Validar 'property' contra el vocabulario cerrado
    const prop = reqObj.property
    if (typeof prop !== "string" || !isTechnicalProperty(prop)) {
      throw new MuseValidationError(
        `Requirement at index ${i} has invalid property '${String(prop)}'. Allowed properties are: ${TECHNICAL_PROPERTIES.join(", ")}`,
        propertyErrorCode,
        {
          index: i,
          requirement_id: reqObj.id,
          property: prop,
          allowed: TECHNICAL_PROPERTIES,
        }
      )
    }

    // Validar 'operator' contra los operadores permitidos
    const op = reqObj.operator
    if (typeof op !== "string" || !isAllowedOperator(op)) {
      throw new MuseValidationError(
        `Requirement at index ${i} has invalid operator '${String(op)}'. Allowed operators are: ${ALLOWED_OPERATORS.join(", ")}`,
        MUSE_ERROR_CODES.INVALID_REQUEST,
        {
          index: i,
          requirement_id: reqObj.id,
          operator: op,
          allowed: ALLOWED_OPERATORS,
        }
      )
    }

    validatedRequirements.push({
      ...reqObj,
      id: reqObj.id.trim(),
      property: prop,
      operator: op,
    })
  }

  return {
    variant_id: variantId,
    requirements: validatedRequirements,
  }
}

// ----------------------------------------------------------------------------
// 7. Esquemas Zod para interoperabilidad con Framework de Medusa
// ----------------------------------------------------------------------------

export const TechnicalPropertySchema = z.enum(TECHNICAL_PROPERTIES)
export const AllowedOperatorSchema = z.enum(ALLOWED_OPERATORS)

export const SearchQuerySchema = z.object({
  q: z.string().max(200, "q exceeds maximum length of 200 characters").optional().default(""),
  limit: z.preprocess((val) => {
    if (val === undefined || val === null || val === "") return 3
    if (typeof val === "string") {
      const n = Number(val)
      return isNaN(n) ? val : n
    }
    return val
  }, z.number().int().min(1, "limit must be >= 1").max(3, "limit must be <= 3").default(3)),
})

export const EvaluateRequirementSchema = z
  .object({
    id: z.string().min(1, "id must be non-empty"),
    property: TechnicalPropertySchema,
    operator: AllowedOperatorSchema,
    value: z.unknown().optional(),
  })
  .passthrough()

export const EvaluatePayloadSchema = z.object({
  variant_id: z.string().min(1, "variant_id must be non-empty"),
  requirements: z
    .array(EvaluateRequirementSchema)
    .min(1, "requirements must contain at least 1 item")
    .max(10, "requirements cannot exceed 10 items"),
})
