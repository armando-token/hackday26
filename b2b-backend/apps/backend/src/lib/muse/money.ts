/**
 * Agent-Commerce Meta Muse — Monetary Representation & Arithmetic Utility
 * 
 * Strict compliance for Phase 3:
 * 1. Moneda única y oficial: PEN (Peruvian Nuevo Sol, S/.)
 * 2. Escala fija: 2 decimales (centavos, factor 100)
 * 3. Precios unitarios menores (unit_price_minor) representados en centavos enteros exactos (ej. 890 PEN -> 89000 centavos)
 * 4. Subtotal menor exacto: subtotal_minor = unit_price_minor * quantity (aritmética entera sin redondeo)
 * 5. Representaciones decimales canónicas: cadenas exactas con 2 dígitos decimales ('890.00', '1780.00')
 * 6. Eliminación total de errores de punto flotante de IEEE 754 (ej. 0.1 + 0.2 !== 0.30000000000000004, 1.15 * 100 !== 114)
 *    mediante operaciones de BigInt y manipulación determinista de cadenas.
 */

/**
 * Código de moneda canónico y admitido para el catálogo y cotizaciones
 */
export const CURRENCY_PEN = "PEN" as const
export const CURRENCY_PEN_LOWER = "pen" as const
export const CURRENCY_SCALE = 2 as const
export const MINOR_UNIT_FACTOR = 100n
export const CURRENCY_SYMBOL = "S/." as const
export const CURRENCY_SYMBOL_SHORT = "S/" as const
export const CURRENCY_NAME = "Peruvian Nuevo Sol" as const

export type SupportedCurrency = "PEN" | "pen"

/**
 * Representación canónica completa de un valor monetario
 */
export interface MoneyRepresentation {
  currency: "PEN"
  scale: 2
  minor: bigint
  minor_number: number
  decimal: string
  formatted: string
}

/**
 * Cálculo monetario para una línea de cotización o ítem de oferta
 */
export interface LineItemMoneyCalculation {
  currency: "PEN"
  scale: 2
  quantity: number
  unit_price_minor: bigint
  unit_price_minor_number: number
  unit_price_decimal: string
  subtotal_minor: bigint
  subtotal_minor_number: number
  subtotal_decimal: string
  formatted_unit_price: string
  formatted_subtotal: string
}

/**
 * Resultado de auditoría de integridad monetaria
 */
export interface MonetaryIntegrityResult {
  valid: boolean
  errors: string[]
}

/**
 * Valida si un código de moneda corresponde a la moneda oficial PEN (insensible a mayúsculas).
 */
export function isPenCurrency(currency: unknown): boolean {
  if (typeof currency !== "string") {
    return false
  }
  const clean = currency.trim().toUpperCase()
  return clean === CURRENCY_PEN
}

/**
 * Exige que la moneda sea estrictamente PEN. Lanza TypeError si no lo es.
 */
export function assertPenCurrency(currency: unknown, context: string = "Monetary validation"): void {
  if (!isPenCurrency(currency)) {
    throw new TypeError(
      `[${context}] Invalid currency: expected '${CURRENCY_PEN}', got '${String(currency)}'`
    )
  }
}

/**
 * Normaliza un código de moneda a su forma canónica mayúscula "PEN".
 */
export function normalizeCurrency(currency: unknown): "PEN" {
  assertPenCurrency(currency)
  return CURRENCY_PEN
}

/**
 * Convierte un importe en unidades mayores (PEN) a centavos menores enteros (bigint),
 * garantizando cero errores de punto flotante de IEEE 754.
 * 
 * Admite:
 * - string: "890", "890.00", "890.5", "0.1", "0.2", "19.99", "1.15", "  S/. 480.00 "
 * - number: 890, 890.00, 480, 75, etc.
 * - bigint: 890n -> 89000n
 * 
 * @param major Importe en Soles (unidades mayores)
 * @returns Centavos enteros en BigInt (ej. 890 PEN -> 89000n)
 */
export function majorToMinor(major: number | string | bigint): bigint {
  if (typeof major === "bigint") {
    return major * MINOR_UNIT_FACTOR
  }

  if (typeof major === "number") {
    if (!Number.isFinite(major)) {
      throw new TypeError(`majorToMinor: Amount must be a finite number, received ${major}`)
    }

    if (Number.isInteger(major)) {
      return BigInt(major) * MINOR_UNIT_FACTOR
    }

    // Para números con decimales, usamos toFixed(2) o representación de cadena con alta precisión
    // para evitar que 1.15 * 100 dé 114.99999999999999 en JS.
    const fixedStr = major.toFixed(8)
    return parseDecimalStringToMinor(fixedStr)
  }

  if (typeof major === "string") {
    return parseDecimalStringToMinor(major)
  }

  throw new TypeError(`majorToMinor: Unsupported type '${typeof major}' for amount`)
}

/**
 * Versión de majorToMinor que retorna un número entero seguro (number)
 * para payloads JSON donde BigInt no es serializable directamente.
 */
export function majorToMinorNumber(major: number | string | bigint): number {
  const minorBig = majorToMinor(major)
  if (minorBig > BigInt(Number.MAX_SAFE_INTEGER) || minorBig < BigInt(Number.MIN_SAFE_INTEGER)) {
    throw new RangeError(
      `majorToMinorNumber: Value ${minorBig.toString()} exceeds Number.MAX_SAFE_INTEGER`
    )
  }
  return Number(minorBig)
}

/**
 * Parsea una cadena decimal a centavos enteros (BigInt) con redondeo estándar half-up
 * si hay más de 2 cifras decimales.
 */
export function parseDecimalStringToMinor(rawStr: string): bigint {
  let clean = rawStr.trim()

  // Eliminar prefijos de moneda si vienen presentes
  clean = clean.replace(/^(S\/\.?|PEN)\s*/i, "").trim()

  if (clean === "") {
    throw new TypeError("parseDecimalStringToMinor: Empty amount string")
  }

  // Comprobar signo
  let isNegative = false
  if (clean.startsWith("-")) {
    isNegative = true
    clean = clean.substring(1).trim()
  } else if (clean.startsWith("+")) {
    clean = clean.substring(1).trim()
  }

  // Normalizar coma decimal a punto si no hay ambigüedad
  if (clean.includes(",") && !clean.includes(".")) {
    clean = clean.replace(",", ".")
  } else if (clean.includes(",") && clean.includes(".")) {
    // Si viene en formato "1,234.56", eliminar comas de miles
    clean = clean.replace(/,/g, "")
  }

  const parts = clean.split(".")
  if (parts.length > 2) {
    throw new TypeError(`parseDecimalStringToMinor: Invalid decimal string '${rawStr}'`)
  }

  const intPartStr = parts[0]
  if (!/^\d+$/.test(intPartStr)) {
    throw new TypeError(`parseDecimalStringToMinor: Invalid integer digits in '${rawStr}'`)
  }

  const whole = BigInt(intPartStr)
  let centavos = 0n

  if (parts.length === 2) {
    const fracPartStr = parts[1]
    if (!/^\d*$/.test(fracPartStr)) {
      throw new TypeError(`parseDecimalStringToMinor: Invalid fractional digits in '${rawStr}'`)
    }

    if (fracPartStr.length === 0) {
      centavos = 0n
    } else if (fracPartStr.length === 1) {
      centavos = BigInt(fracPartStr) * 10n
    } else if (fracPartStr.length === 2) {
      centavos = BigInt(fracPartStr)
    } else {
      // Más de 2 decimales: redondeo half-up
      const firstTwo = BigInt(fracPartStr.substring(0, 2))
      const thirdDigit = parseInt(fracPartStr.charAt(2), 10)
      centavos = thirdDigit >= 5 ? firstTwo + 1n : firstTwo
    }
  }

  const total = whole * MINOR_UNIT_FACTOR + centavos
  return isNegative ? -total : total
}

/**
 * Convierte un importe en centavos enteros (BigInt, number o string)
 * a una representación decimal canónica con exactamente 2 decimales ('890.00').
 * Cero operaciones de punto flotante: usa división entera y módulo.
 * 
 * @param minor Centavos enteros (ej. 89000n)
 * @returns Cadena formateada con 2 decimales (ej. '890.00')
 */
export function minorToDecimal(minor: bigint | number | string): string {
  let b: bigint
  if (typeof minor === "bigint") {
    b = minor
  } else if (typeof minor === "number") {
    if (!Number.isFinite(minor) || !Number.isInteger(minor)) {
      throw new TypeError(`minorToDecimal: Expected integer centavos, got ${minor}`)
    }
    b = BigInt(minor)
  } else if (typeof minor === "string") {
    const trimmed = minor.trim()
    if (!/^-?\d+$/.test(trimmed)) {
      throw new TypeError(`minorToDecimal: Invalid integer centavos string '${minor}'`)
    }
    b = BigInt(trimmed)
  } else {
    throw new TypeError(`minorToDecimal: Unsupported type '${typeof minor}'`)
  }

  const isNegative = b < 0n
  const abs = isNegative ? -b : b
  const whole = abs / MINOR_UNIT_FACTOR
  const fraction = abs % MINOR_UNIT_FACTOR
  const fracStr = fraction.toString().padStart(2, "0")

  return `${isNegative ? "-" : ""}${whole.toString()}.${fracStr}`
}

/**
 * Convierte un importe en unidades mayores (PEN) a una representación decimal canónica con 2 decimales ('890.00').
 */
export function majorToDecimal(major: number | string | bigint): string {
  const minor = majorToMinor(major)
  return minorToDecimal(minor)
}

/**
 * Convierte una cadena decimal canónica ('890.00') a centavos enteros (BigInt).
 */
export function decimalToMinor(decimalStr: string): bigint {
  return parseDecimalStringToMinor(decimalStr)
}

/**
 * Calcula el subtotal en centavos enteros multiplicando precio unitario por cantidad:
 * subtotal_minor = unit_price_minor * quantity
 * 
 * Utiliza aritmética de BigInt exacta sin pérdida de precisión ni redondeos.
 * 
 * @param unitPriceMinor Precio unitario en centavos (bigint o number)
 * @param quantity Cantidad solicitada (entero >= 0)
 * @returns Subtotal en centavos enteros (BigInt)
 */
export function calculateSubtotalMinor(
  unitPriceMinor: bigint | number | string,
  quantity: number
): bigint {
  if (typeof quantity !== "number" || !Number.isInteger(quantity) || quantity < 0) {
    throw new TypeError(`calculateSubtotalMinor: quantity must be a non-negative integer, got ${quantity}`)
  }

  let unitBig: bigint
  if (typeof unitPriceMinor === "bigint") {
    unitBig = unitPriceMinor
  } else if (typeof unitPriceMinor === "number") {
    if (!Number.isInteger(unitPriceMinor)) {
      throw new TypeError(`calculateSubtotalMinor: unitPriceMinor must be an integer, got ${unitPriceMinor}`)
    }
    unitBig = BigInt(unitPriceMinor)
  } else {
    unitBig = BigInt(unitPriceMinor.trim())
  }

  return unitBig * BigInt(quantity)
}

/**
 * Formatea un importe en Soles para visualización humana o documentos PDF (ej. 'S/. 890.00' o 'S/ 1,780.00').
 * 
 * @param amount Centavos menores o cadena decimal
 * @param options Configuración de formato
 */
export function formatPen(
  amount: bigint | number | string,
  options?: {
    isMinor?: boolean
    symbol?: string
    thousandsSeparator?: boolean
  }
): string {
  const isMinor = options?.isMinor ?? (typeof amount === "bigint" || (typeof amount === "number" && Number.isInteger(amount) && Math.abs(amount) >= 100))
  const symbol = options?.symbol ?? CURRENCY_SYMBOL
  const useThousands = options?.thousandsSeparator ?? true

  const decimalStr = isMinor ? minorToDecimal(amount as any) : minorToDecimal(majorToMinor(amount as any))

  if (!useThousands) {
    return `${symbol} ${decimalStr}`
  }

  const [whole, frac] = decimalStr.split(".")
  const formattedWhole = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  return `${symbol} ${formattedWhole}.${frac}`
}

/**
 * Calcula de manera integral los importes unitarios y subtotales para una línea de cotización,
 * garantizando coherencia absoluta entre minor units, decimales y cadenas formateadas.
 */
export function calculateLineItem(
  unitPrice: number | string | bigint,
  quantity: number,
  options?: { isMinor?: boolean }
): LineItemMoneyCalculation {
  if (typeof quantity !== "number" || !Number.isInteger(quantity) || quantity <= 0) {
    throw new TypeError(`calculateLineItem: quantity must be a positive integer, got ${quantity}`)
  }

  const unitMinor = options?.isMinor ? BigInt(unitPrice) : majorToMinor(unitPrice)
  const subtotalMinor = unitMinor * BigInt(quantity)

  const unitPriceDecimal = minorToDecimal(unitMinor)
  const subtotalDecimal = minorToDecimal(subtotalMinor)

  return {
    currency: CURRENCY_PEN,
    scale: CURRENCY_SCALE,
    quantity,
    unit_price_minor: unitMinor,
    unit_price_minor_number: Number(unitMinor),
    unit_price_decimal: unitPriceDecimal,
    subtotal_minor: subtotalMinor,
    subtotal_minor_number: Number(subtotalMinor),
    subtotal_decimal: subtotalDecimal,
    formatted_unit_price: formatPen(unitMinor, { isMinor: true }),
    formatted_subtotal: formatPen(subtotalMinor, { isMinor: true }),
  }
}

/**
 * Crea una representación completa MoneyRepresentation a partir de una unidad mayor o menor.
 */
export function createMoneyRepresentation(
  amount: number | string | bigint,
  options?: { isMinor?: boolean }
): MoneyRepresentation {
  const minor = options?.isMinor ? BigInt(amount) : majorToMinor(amount)
  const decimal = minorToDecimal(minor)
  return {
    currency: CURRENCY_PEN,
    scale: CURRENCY_SCALE,
    minor,
    minor_number: Number(minor),
    decimal,
    formatted: formatPen(minor, { isMinor: true }),
  }
}

/**
 * Parser seguro de precios provenientes de la base de datos PostgreSQL (tabla 'price').
 * En Medusa v2, el campo 'amount' de la tabla price está configurado como NUMERIC en unidades mayores (ej. 890, 480, 75).
 * 
 * Si el precio es nulo, indefinido, no numérico o <= 0, retorna null (indicando revisión manual requerida).
 */
export function parseDbPrice(
  rawAmount: number | string | null | undefined
): { unit_price_minor: bigint; unit_price_minor_number: number; unit_price_decimal: string } | null {
  if (rawAmount === null || rawAmount === undefined) {
    return null
  }

  const num = typeof rawAmount === "number" ? rawAmount : parseFloat(String(rawAmount))
  if (!Number.isFinite(num) || num <= 0) {
    return null
  }

  const minor = majorToMinor(rawAmount)
  return {
    unit_price_minor: minor,
    unit_price_minor_number: Number(minor),
    unit_price_decimal: minorToDecimal(minor),
  }
}

/**
 * Suma múltiples importes en centavos menores con precisión entera estricta.
 */
export function safeAddMinor(...amounts: (bigint | number | string)[]): bigint {
  let sum = 0n
  for (const amt of amounts) {
    if (typeof amt === "bigint") {
      sum += amt
    } else if (typeof amt === "number") {
      if (!Number.isInteger(amt)) {
        throw new TypeError(`safeAddMinor: amount must be an integer, got ${amt}`)
      }
      sum += BigInt(amt)
    } else {
      sum += BigInt(amt.trim())
    }
  }
  return sum
}

/**
 * Suma dos importes en unidades mayores sin errores de punto flotante.
 * Demuestra matemáticamente que 0.1 + 0.2 da 0.30 y no 0.30000000000000004.
 */
export function safeAddMajor(a: number | string, b: number | string): string {
  const minorA = majorToMinor(a)
  const minorB = majorToMinor(b)
  const totalMinor = minorA + minorB
  return minorToDecimal(totalMinor)
}

/**
 * Auditoría formal de integridad monetaria:
 * Verifica las 6 invariantes críticas de la Fase 3:
 * 1. Moneda es estrictamente 'PEN'
 * 2. Escala es 2 (centavos)
 * 3. unit_price_minor es un entero positivo en centavos
 * 4. subtotal_minor === unit_price_minor * quantity
 * 5. Representaciones decimales terminan con 2 decimales y concuerdan con los valores minor
 * 6. Sin errores de redondeo de coma flotante
 */
export function verifyMonetaryIntegrity(params: {
  currency: string
  unitPriceMinor: bigint | number
  quantity: number
  subtotalMinor: bigint | number
  unitPriceDecimal?: string
  subtotalDecimal?: string
}): MonetaryIntegrityResult {
  const errors: string[] = []

  // 1. Verificar moneda PEN
  if (!isPenCurrency(params.currency)) {
    errors.push(`Currency '${params.currency}' is not supported. Must be 'PEN'.`)
  }

  // 2. Verificar cantidad
  if (
    typeof params.quantity !== "number" ||
    !Number.isInteger(params.quantity) ||
    params.quantity <= 0
  ) {
    errors.push(`Quantity must be a positive integer, received: ${params.quantity}`)
  }

  // 3. Verificar unit_price_minor entero
  const unitMinor = BigInt(params.unitPriceMinor)
  if (unitMinor <= 0n) {
    errors.push(`unit_price_minor must be greater than zero, received: ${unitMinor.toString()}`)
  }

  // 4. Verificar subtotal_minor = unit_price_minor * quantity
  const expectedSubtotal = unitMinor * BigInt(params.quantity)
  const actualSubtotal = BigInt(params.subtotalMinor)
  if (actualSubtotal !== expectedSubtotal) {
    errors.push(
      `subtotal_minor mismatch: expected ${expectedSubtotal.toString()} (unit ${unitMinor.toString()} * qty ${params.quantity}), got ${actualSubtotal.toString()}`
    )
  }

  // 5. Verificar unit_price_decimal si se proporciona
  if (params.unitPriceDecimal !== undefined) {
    if (!/^-?\d+\.\d{2}$/.test(params.unitPriceDecimal)) {
      errors.push(
        `unit_price_decimal '${params.unitPriceDecimal}' does not have exactly 2 decimal places.`
      )
    }
    const derivedUnitDecimal = minorToDecimal(unitMinor)
    if (params.unitPriceDecimal !== derivedUnitDecimal) {
      errors.push(
        `unit_price_decimal '${params.unitPriceDecimal}' does not match unit_price_minor '${derivedUnitDecimal}'.`
      )
    }
  }

  // 6. Verificar subtotal_decimal si se proporciona
  if (params.subtotalDecimal !== undefined) {
    if (!/^-?\d+\.\d{2}$/.test(params.subtotalDecimal)) {
      errors.push(
        `subtotal_decimal '${params.subtotalDecimal}' does not have exactly 2 decimal places.`
      )
    }
    const derivedSubtotalDecimal = minorToDecimal(actualSubtotal)
    if (params.subtotalDecimal !== derivedSubtotalDecimal) {
      errors.push(
        `subtotal_decimal '${params.subtotalDecimal}' does not match subtotal_minor '${derivedSubtotalDecimal}'.`
      )
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}
