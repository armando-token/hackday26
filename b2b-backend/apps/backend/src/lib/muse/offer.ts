import { Pool, PoolClient } from "pg"
import { getPool } from "./db"

/**
 * ============================================================================
 * Live Offer Calculation Engine for Meta Muse Agent Commerce API (Fase 3)
 * ============================================================================
 * 
 * Provides deterministic, atomic calculation of live commercial offers:
 * 1. Strict demonstration catalog isolation (demo = true, SKU LIKE 'CN-%').
 * 2. Strict quantity validation (integer between 1 and 20).
 * 3. Direct Medusa pricing resolution (currency: 'pen', scale: 2, minor units).
 * 4. Real-time physical inventory calculation (stocked - reserved).
 * 5. Deterministic fallback to manual_review when price is invalid or unlisted (NEVER price 0).
 * 6. Four-state availability resolution: in_stock, limited_stock, out_of_stock, backorder.
 * 7. Comprehensive commercial metadata (tax_status: 'tax_excluded', shipping_status: 'to_be_confirmed').
 */

export const MIN_OFFER_QUANTITY = 1
export const MAX_OFFER_QUANTITY = 20
export const CANONICAL_CURRENCY = "usd"
export const DECIMAL_SCALE = 2

export type LiveOfferState = "priced" | "manual_review"

export type LiveOfferAvailabilityStatus =
  | "in_stock"
  | "limited_stock"
  | "out_of_stock"
  | "backorder"

export interface LiveOfferAvailability {
  status: LiveOfferAvailabilityStatus
  available_quantity: number
  stocked_quantity: number
  reserved_quantity: number
  manage_inventory: boolean
  allow_backorder: boolean
}

export interface LiveOfferPricing {
  state: LiveOfferState
  review_reason: string | null
  currency: string
  unit_price_minor: number | null
  unit_price: number | null
  subtotal_minor: number | null
  subtotal: number | null
  scale: number
}

export interface LiveOfferResult {
  variant_id: string
  sku: string
  model: string | null
  title: string
  quantity: number
  state: LiveOfferState
  review_reason: string | null
  currency: string
  unit_price_minor: number | null
  unit_price: number | null
  subtotal_minor: number | null
  subtotal: number | null
  scale: number
  availability: LiveOfferAvailability
  availability_status: LiveOfferAvailabilityStatus
  tax_status: "tax_excluded"
  shipping_status: "to_be_confirmed"
  limitations: string[]
  observed_at: string
  region_id?: string | null
  product_id?: string
  product_handle?: string
  product_url?: string
}

/**
 * Custom error thrown when a variant does not exist or is outside the demo catalog scope.
 */
export class LiveOfferNotFoundError extends Error {
  public readonly statusCode: number = 404
  public readonly status: number = 404
  public readonly code: string = "NOT_FOUND"

  constructor(
    message: string = "Variant not found or outside demo catalog scope",
    code: string = "NOT_FOUND"
  ) {
    super(message)
    this.name = "LiveOfferNotFoundError"
    this.code = code
  }
}

/**
 * Custom error thrown when offer input parameters (e.g. quantity) fail validation.
 */
export class LiveOfferValidationError extends Error {
  public readonly statusCode: number = 400
  public readonly status: number = 400
  public readonly code: string = "INVALID_QUANTITY"

  constructor(message: string, code: string = "INVALID_QUANTITY") {
    super(message)
    this.name = "LiveOfferValidationError"
    this.code = code
  }
}

/**
 * Type guard for LiveOfferNotFoundError
 */
export function isLiveOfferNotFoundError(err: unknown): err is LiveOfferNotFoundError {
  return (
    err instanceof LiveOfferNotFoundError ||
    (typeof err === "object" &&
      err !== null &&
      ((err as any).name === "LiveOfferNotFoundError" ||
        (err as any).code === "NOT_FOUND" ||
        (err as any).statusCode === 404))
  )
}

/**
 * Type guard for LiveOfferValidationError
 */
export function isLiveOfferValidationError(err: unknown): err is LiveOfferValidationError {
  return (
    err instanceof LiveOfferValidationError ||
    (typeof err === "object" &&
      err !== null &&
      ((err as any).name === "LiveOfferValidationError" ||
        (err as any).code === "INVALID_QUANTITY" ||
        (err as any).statusCode === 400))
  )
}

/**
 * Validates requested quantity is an integer within [MIN_OFFER_QUANTITY, MAX_OFFER_QUANTITY].
 */
export function validateOfferQuantity(quantity: unknown): number {
  if (quantity === undefined || quantity === null || quantity === "") {
    return MIN_OFFER_QUANTITY
  }

  const num = typeof quantity === "number" ? quantity : Number(quantity)

  if (
    !Number.isFinite(num) ||
    Number.isNaN(num) ||
    !Number.isInteger(num) ||
    num < MIN_OFFER_QUANTITY ||
    num > MAX_OFFER_QUANTITY
  ) {
    throw new LiveOfferValidationError(
      `Quantity must be an integer between ${MIN_OFFER_QUANTITY} and ${MAX_OFFER_QUANTITY}, received: ${String(quantity)}`,
      "INVALID_QUANTITY"
    )
  }

  return num
}

/**
 * Deterministically resolves 4-state availability:
 * - in_stock: available >= quantity (or inventory not managed)
 * - limited_stock: 0 < available < quantity
 * - out_of_stock: available <= 0 (when backorder not allowed)
 * - backorder: backorder is allowed when stock is depleted (available <= 0)
 */
export function calculateLiveOfferAvailabilityStatus(
  availableQuantity: number,
  quantity: number,
  manageInventory: boolean = true,
  allowBackorder: boolean = false
): LiveOfferAvailabilityStatus {
  if (!manageInventory) {
    return "in_stock"
  }

  if (availableQuantity >= quantity) {
    return "in_stock"
  }

  if (availableQuantity > 0 && availableQuantity < quantity) {
    return "limited_stock"
  }

  // availableQuantity <= 0
  if (allowBackorder) {
    return "backorder"
  }

  return "out_of_stock"
}

/**
 * Calculates financial amounts in integer minor units (centavos) and decimal representation.
 * If price is missing, non-positive (<= 0), or currency is invalid:
 * returns state: 'manual_review' with reason. NEVER invents price 0.
 */
export function calculateLiveOfferPricing(
  rawAmount: string | number | null | undefined,
  currencyCode: string | null | undefined,
  quantity: number
): LiveOfferPricing {
  const normCurrency = (currencyCode || "").trim().toLowerCase()

  // Case 1: Missing price
  if (rawAmount === null || rawAmount === undefined || rawAmount === "") {
    return {
      state: "manual_review",
      review_reason: "Price not configured for variant in sales channel",
      currency: CANONICAL_CURRENCY,
      unit_price_minor: null,
      unit_price: null,
      subtotal_minor: null,
      subtotal: null,
      scale: DECIMAL_SCALE,
    }
  }

  const numericAmount = typeof rawAmount === "number" ? rawAmount : parseFloat(String(rawAmount))

  // Case 2: Invalid number or non-positive price (<= 0)
  if (Number.isNaN(numericAmount) || !Number.isFinite(numericAmount) || numericAmount <= 0) {
    return {
      state: "manual_review",
      review_reason: `Non-positive or invalid price amount (${String(rawAmount)}), commercial representative review required`,
      currency: CANONICAL_CURRENCY,
      unit_price_minor: null,
      unit_price: null,
      subtotal_minor: null,
      subtotal: null,
      scale: DECIMAL_SCALE,
    }
  }

  // Case 3: Invalid currency (must be 'usd')
  if (normCurrency !== CANONICAL_CURRENCY) {
    return {
      state: "manual_review",
      review_reason: `Currency '${normCurrency}' does not match canonical demonstration currency (usd)`,
      currency: normCurrency || CANONICAL_CURRENCY,
      unit_price_minor: null,
      unit_price: null,
      subtotal_minor: null,
      subtotal: null,
      scale: DECIMAL_SCALE,
    }
  }

  // Case 4: Valid price
  // Calculate unit_price_minor (amount * 100), unit_price (amount),
  // subtotal_minor (unit_price_minor * quantity), subtotal (unit_price * quantity), scale: 2
  const unitPriceMinor = Math.round(numericAmount * 100)
  const unitPrice = unitPriceMinor / 100
  const subtotalMinor = unitPriceMinor * quantity
  const subtotal = subtotalMinor / 100

  return {
    state: "priced",
    review_reason: null,
    currency: CANONICAL_CURRENCY,
    unit_price_minor: unitPriceMinor,
    unit_price: unitPrice,
    subtotal_minor: subtotalMinor,
    subtotal: subtotal,
    scale: DECIMAL_SCALE,
  }
}

/**
 * Builds the limitations array detailing stock, pricing, tax, and freight conditions.
 */
export function buildLiveOfferLimitations(
  state: LiveOfferState,
  reviewReason: string | null,
  availabilityStatus: LiveOfferAvailabilityStatus,
  availableQuantity: number,
  quantity: number,
  allowBackorder: boolean
): string[] {
  const limitations: string[] = []

  if (state === "manual_review" && reviewReason) {
    limitations.push(`Pricing: ${reviewReason}`)
  }

  if (availabilityStatus === "limited_stock") {
    limitations.push(
      `Stock: Requested quantity (${quantity}) exceeds currently available stock (${availableQuantity} available)`
    )
    if (allowBackorder) {
      limitations.push("Backorder: Backorder enabled for units exceeding current stock")
    }
  } else if (availabilityStatus === "out_of_stock") {
    limitations.push("Stock: Item is currently out of stock")
  } else if (availabilityStatus === "backorder") {
    limitations.push("Stock: Item available on backorder; delivery lead time subject to factory scheduling")
  }

  limitations.push("Taxes: Prices are tax-excluded (sales tax calculated upon formal billing)")
  limitations.push("Shipping: Freight terms to be confirmed upon delivery location specification")

  return limitations
}

/**
 * Core Live Offer Calculation Engine
 * 
 * @param variantId Medusa variant ID (e.g. 'variant_...') or demonstration SKU (e.g. 'CN-X5PRIME-HE-XP5')
 * @param quantity Desired quantity (integer between 1 and 20, default 1)
 * @param regionId Optional region ID filter for localized price rules
 * @param dbClient Optional pg Pool or PoolClient for dependency injection / test isolation
 * @returns Promise<LiveOfferResult>
 * @throws LiveOfferNotFoundError if variant does not exist or is outside the demo catalog
 * @throws LiveOfferValidationError if quantity is invalid
 */
export async function getLiveOffer(
  variantId: string,
  quantity: number = 1,
  regionId?: string,
  dbClient?: Pool | PoolClient
): Promise<LiveOfferResult> {
  // 1. Validate variantId presence
  if (!variantId || typeof variantId !== "string" || !variantId.trim()) {
    throw new LiveOfferNotFoundError(
      "variant_id is required and must be a non-empty string",
      "NOT_FOUND"
    )
  }

  const cleanId = variantId.trim()

  // 2. Validate quantity (integer 1..20)
  const validQuantity = validateOfferQuantity(quantity)

  // 3. Database connection
  const client = dbClient || getPool()

  // 4. Query PostgreSQL with demo catalog strict filter:
  //    - technical_profile.demo = true
  //    - product_variant.sku LIKE 'CN-%'
  //    - technical_profile.deleted_at IS NULL
  //    - product_variant.deleted_at IS NULL
  //    - product.deleted_at IS NULL
  const queryText = `
    SELECT 
      tp.id AS profile_id,
      tp.variant_id,
      tp.model,
      tp.revision,
      tp.demo,
      pv.id AS medusa_variant_id,
      pv.sku,
      pv.title AS variant_title,
      pv.manage_inventory,
      pv.allow_backorder,
      p.id AS product_id,
      p.title AS product_title,
      p.handle AS product_handle,
      pr.id AS price_id,
      pr.amount::numeric AS price_amount,
      pr.currency_code,
      COALESCE(inv.stocked_quantity, 0)::integer AS stocked_quantity,
      COALESCE(inv.reserved_quantity, 0)::integer AS reserved_quantity
    FROM technical_profile tp
    INNER JOIN product_variant pv ON pv.id = tp.variant_id AND pv.deleted_at IS NULL
    INNER JOIN product p ON p.id = pv.product_id AND p.deleted_at IS NULL
    LEFT JOIN LATERAL (
      SELECT 
        pr.id, 
        pr.amount, 
        pr.currency_code
      FROM product_variant_price_set pvps
      JOIN price pr ON pr.price_set_id = pvps.price_set_id 
        AND pr.deleted_at IS NULL
      LEFT JOIN price_rule prule ON prule.price_id = pr.id 
        AND prule.deleted_at IS NULL 
        AND prule.attribute = 'region_id'
      WHERE pvps.variant_id = pv.id 
        AND pvps.deleted_at IS NULL
        AND (
          $2::text IS NULL 
          OR prule.value = $2 
          OR prule.value IS NULL
        )
      ORDER BY 
        CASE WHEN $2::text IS NOT NULL AND prule.value = $2 THEN 0 ELSE 1 END,
        CASE WHEN pr.currency_code = '${CANONICAL_CURRENCY}' THEN 0 ELSE 1 END,
        pr.price_list_id NULLS FIRST, 
        pr.created_at ASC
      LIMIT 1
    ) pr ON true
    LEFT JOIN LATERAL (
      SELECT 
        COALESCE(SUM(il.stocked_quantity), 0)::integer AS stocked_quantity,
        COALESCE(SUM(il.reserved_quantity), 0)::integer AS reserved_quantity
      FROM product_variant_inventory_item pvii
      JOIN inventory_level il ON il.inventory_item_id = pvii.inventory_item_id 
        AND il.deleted_at IS NULL
      WHERE pvii.variant_id = pv.id 
        AND pvii.deleted_at IS NULL
    ) inv ON true
    WHERE (tp.variant_id = $1 OR pv.sku = $1)
      AND tp.demo = true
      AND tp.deleted_at IS NULL
      AND pv.sku LIKE 'CN-%'
    LIMIT 1
  `

  const result = await client.query(queryText, [cleanId, regionId || null])

  if (result.rows.length === 0) {
    throw new LiveOfferNotFoundError(
      `Variant not found or outside demo catalog: ${cleanId}`,
      "NOT_FOUND"
    )
  }

  const row = result.rows[0]

  // 5. Calculate inventory & availability
  const stockedQuantity = Number(row.stocked_quantity) || 0
  const reservedQuantity = Number(row.reserved_quantity) || 0
  const availableQuantity = stockedQuantity - reservedQuantity
  const manageInventory = Boolean(row.manage_inventory)
  const allowBackorder = Boolean(row.allow_backorder)

  const availabilityStatus = calculateLiveOfferAvailabilityStatus(
    availableQuantity,
    validQuantity,
    manageInventory,
    allowBackorder
  )

  const availability: LiveOfferAvailability = {
    status: availabilityStatus,
    available_quantity: availableQuantity,
    stocked_quantity: stockedQuantity,
    reserved_quantity: reservedQuantity,
    manage_inventory: manageInventory,
    allow_backorder: allowBackorder,
  }

  // 6. Calculate pricing (minor units, decimal scale 2, manual_review fallback)
  const pricing = calculateLiveOfferPricing(row.price_amount, row.currency_code, validQuantity)

  // 7. Limitations array
  const limitations = buildLiveOfferLimitations(
    pricing.state,
    pricing.review_reason,
    availabilityStatus,
    availableQuantity,
    validQuantity,
    allowBackorder
  )

  // 8. Construct canonical LiveOfferResult
  const observedAt = new Date().toISOString()

  return {
    variant_id: row.variant_id,
    sku: row.sku,
    model: row.model || null,
    title: row.product_title || row.variant_title || row.sku,
    quantity: validQuantity,
    state: pricing.state,
    review_reason: pricing.review_reason,
    currency: pricing.currency,
    unit_price_minor: pricing.unit_price_minor,
    unit_price: pricing.unit_price,
    subtotal_minor: pricing.subtotal_minor,
    subtotal: pricing.subtotal,
    scale: pricing.scale,
    availability,
    availability_status: availabilityStatus,
    tax_status: "tax_excluded",
    shipping_status: "to_be_confirmed",
    limitations,
    observed_at: observedAt,
    region_id: regionId || null,
    product_id: row.product_id,
    product_handle: row.product_handle,
    product_url: `${(
      process.env.PUBLIC_MUSE_BASE_URL?.trim() ||
      process.env.STOREFRONT_BASE_URL?.trim() ||
      "https://data.controlnautas.com"
    ).replace(/\/+$/, "")}/us/products/${row.product_handle || row.sku?.toLowerCase() || ""}`,
  }
}
