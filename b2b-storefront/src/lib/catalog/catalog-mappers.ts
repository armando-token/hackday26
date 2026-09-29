/**
 * Transformación pura Medusa/JSON → CatalogProduct (plan maestro, §6.1).
 *
 * Sin efectos secundarios ni acceso a red. Los errores de contrato se lanzan
 * como CatalogContractError con productId, handle y campo afectado.
 */

import { CatalogContractError } from "./catalog-errors"
import type {
  AvailabilityMode,
  CatalogCategory,
  CatalogDisplay,
  CatalogProduct,
  CatalogVariant,
  DerivedAvailability,
  Money,
  PurchaseMode,
} from "./catalog-types"
import type {
  MedusaStoreCategory,
  MedusaStoreProduct,
  MedusaStoreVariant,
} from "./medusa-types"

export const MAX_SPEC_ENTRIES = 100
export const MAX_SPEC_KEY_LENGTH = 120
export const MAX_SPEC_VALUE_LENGTH = 2000

const PURCHASE_MODES: PurchaseMode[] = [
  "buy_now",
  "quote_only",
  "contact_for_price",
  "made_to_order",
]

const AVAILABILITY_MODES: AvailabilityMode[] = [
  "in_stock",
  "lead_time",
  "made_to_order",
  "discontinued",
]

/** Normaliza specs según §6.1. */
export function normalizeSpecs(
  raw: Record<string, unknown> | null | undefined,
  meta?: { productId?: string; handle?: string }
): Record<string, string> {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return {}
  }

  const out: Record<string, string> = {}
  const vistas = new Set<string>()

  for (const [rawKey, rawValue] of Object.entries(raw)) {
    const key = rawKey.trim()
    if (!key || key.length > MAX_SPEC_KEY_LENGTH) {
      continue
    }

    const normalizada = key.toLowerCase()
    if (vistas.has(normalizada)) {
      continue
    }

    if (rawValue === null || rawValue === undefined) {
      continue
    }
    if (Array.isArray(rawValue) || typeof rawValue === "object") {
      continue
    }

    const value = String(rawValue).trim()
    if (!value || value.length > MAX_SPEC_VALUE_LENGTH) {
      continue
    }

    vistas.add(normalizada)
    out[key] = value
  }

  if (Object.keys(out).length > MAX_SPEC_ENTRIES) {
    throw new CatalogContractError(
      `Maximo ${MAX_SPEC_ENTRIES} especificaciones`,
      { ...meta, field: "pim.specs" }
    )
  }

  return out
}

function assertEnum<T extends string>(
  value: string | null | undefined,
  allowed: readonly T[],
  field: string,
  meta?: { productId?: string; handle?: string }
): T {
  if (!value || !allowed.includes(value as T)) {
    throw new CatalogContractError(`Valor invalido en ${field}: ${value}`, {
      ...meta,
      field,
    })
  }
  return value as T
}

function mapMoney(
  calculated: MedusaStoreVariant["calculated_price"]
): Money | null {
  if (
    calculated?.calculated_amount === null ||
    calculated?.calculated_amount === undefined ||
    !calculated.currency_code
  ) {
    return null
  }

  return {
    amount: calculated.calculated_amount,
    currencyCode: calculated.currency_code.toLowerCase(),
    originalAmount:
      calculated.original_amount === null ||
      calculated.original_amount === undefined
        ? null
        : calculated.original_amount,
  }
}

function mapMedusaCategory(
  raw: MedusaStoreCategory,
  parentId: string | null = raw.parent_category_id ?? null
): CatalogCategory {
  return {
    id: raw.id,
    handle: raw.handle,
    name: raw.name,
    description: raw.description ?? "",
    parentId,
    rank: raw.rank ?? 0,
    isActive: raw.is_active !== false,
    metadata: raw.metadata ?? null,
  }
}

/** Hoja = categoría con parent_category_id no nulo (§6.1, regla 4). */
export function selectLeafCategory(
  categories: CatalogCategory[],
  meta?: { productId?: string; handle?: string }
): CatalogCategory {
  const leaves = categories.filter((c) => c.parentId !== null)
  if (leaves.length !== 1) {
    throw new CatalogContractError(
      `Se esperaba exactamente 1 categoria hoja, encontradas ${leaves.length}`,
      { ...meta, field: "categories" }
    )
  }
  return leaves[0]
}

const KNOWN_MEDIA_ORIGIN_PREFIXES = [
  "https://controlnautas.com/",
  "https://www.controlnautas.com/",
  "http://controlnautas.com/",
  "http://www.controlnautas.com/",
  "http://localhost:9000/",
  "http://127.0.0.1:9000/",
] as const

/**
 * Normaliza URLs de medios convirtiendo hosts conocidos a rutas relativas (same-origin).
 *
 * - Si url es nulo/vacío, retorna null.
 * - Si url es de controlnautas.com / www / localhost:9000, remueve el origen y deja
 *   path relativo `/static/...` o `/cn-media/...`.
 * - En caso contrario, retorna url intacta.
 */
export function normalizeMediaUrl(
  url: string | null | undefined
): string | null {
  if (!url) {
    return null
  }
  const trimmed = url.trim()
  if (!trimmed) {
    return null
  }

  for (const prefix of KNOWN_MEDIA_ORIGIN_PREFIXES) {
    if (trimmed.startsWith(prefix)) {
      const path = trimmed.slice(prefix.length).replace(/^\/+/, "")
      return path ? `/${path}` : null
    }
  }

  return trimmed
}

export function mapMedusaImages(product: MedusaStoreProduct) {
  const thumbnail = normalizeMediaUrl(product.thumbnail)
  const rawImages = [...(product.images ?? [])]
    .map((img, index) => ({
      id: img.id,
      url: normalizeMediaUrl(img.url),
      rank: img.rank ?? index,
    }))
    .sort((a, b) => a.rank - b.rank)

  const urls = new Set<string>()
  const images: Array<{ id: string; url: string; rank: number }> = []

  for (const img of rawImages) {
    if (!img.url || urls.has(img.url)) {
      continue
    }
    urls.add(img.url)
    images.push({ id: img.id, url: img.url, rank: img.rank })
  }

  if (thumbnail && !urls.has(thumbnail)) {
    images.unshift({ id: `thumb_${product.id}`, url: thumbnail, rank: -1 })
  }

  return { thumbnail, images }
}

function mapMedusaVariant(
  raw: MedusaStoreVariant,
  purchaseMode: PurchaseMode,
  availability: DerivedAvailability
): CatalogVariant {
  const calculatedPrice = mapMoney(raw.calculated_price)
  const manageInventory = raw.manage_inventory ?? true
  const allowBackorder = raw.allow_backorder ?? false

  const requiresQuote =
    purchaseMode !== "buy_now" || calculatedPrice === null
  const canPurchase =
    purchaseMode === "buy_now" &&
    calculatedPrice !== null &&
    availability === "in_stock"

  return {
    id: raw.id,
    sku: raw.sku?.trim() || "",
    title: raw.title?.trim() || raw.sku?.trim() || "Default",
    manageInventory,
    allowBackorder,
    inventoryQuantity:
      raw.inventory_quantity === null || raw.inventory_quantity === undefined
        ? null
        : raw.inventory_quantity,
    calculatedPrice,
    options: (raw.options ?? []).map((opt, index) => ({
      id: opt.id || opt.option_id || `opt_${index}`,
      name: opt.option?.title || "Opción",
      value: opt.value || "",
    })),
    isPurchasable: canPurchase && !requiresQuote,
  }
}

/**
 * Disponibilidad derivada (§6.2). Primera versión conservadora: backorder no
 * habilita compra directa hasta aprobación de Negocio.
 */
export function deriveAvailability(
  pimMode: AvailabilityMode,
  variant: CatalogVariant
): DerivedAvailability {
  if (pimMode === "discontinued") {
    return "discontinued"
  }
  if (pimMode === "made_to_order") {
    return "made_to_order"
  }
  if (pimMode === "lead_time") {
    return "backorder"
  }

  if (variant.manageInventory) {
    const qty = variant.inventoryQuantity ?? 0
    if (qty > 0) {
      return "in_stock"
    }
    if (variant.allowBackorder) {
      return "backorder"
    }
    return "out_of_stock"
  }

  if (pimMode === "in_stock") {
    return "in_stock"
  }

  return "out_of_stock"
}

export function formatPriceLabel(
  price: Money | null,
  requiresQuote: boolean,
  options?: { prefixDesde?: boolean }
): string {
  if (requiresQuote || !price || price.amount <= 0) {
    return "Consultar precio"
  }

  const symbol = price.currencyCode === "pen" ? "S/" : price.currencyCode.toUpperCase()
  const formatted = `${symbol} ${price.amount.toFixed(2)}`
  return options?.prefixDesde ? `Desde ${formatted}` : formatted
}

function buildDisplay(
  variants: CatalogVariant[],
  purchaseMode: PurchaseMode,
  pimMode: AvailabilityMode
): CatalogDisplay {
  const priced = variants
    .map((v) => ({ variant: v, price: v.calculatedPrice }))
    .filter((x) => x.price !== null) as Array<{
    variant: CatalogVariant
    price: Money
  }>

  const cheapest = priced.sort((a, b) => a.price.amount - b.price.amount)[0]
  const referenceVariant = cheapest?.variant ?? variants[0]
  const availability = deriveAvailability(pimMode, referenceVariant)

  const requiresQuote =
    purchaseMode !== "buy_now" || !cheapest

  const canAddToCart =
    purchaseMode === "buy_now" &&
    availability === "in_stock" &&
    Boolean(cheapest) &&
    referenceVariant.isPurchasable

  return {
    availability,
    price: cheapest?.price ?? null,
    priceLabel: formatPriceLabel(cheapest?.price ?? null, requiresQuote, {
      prefixDesde: variants.length > 1 && Boolean(cheapest),
    }),
    canAddToCart,
    requiresQuote,
  }
}

function resolvePrimaryVariant(
  variants: CatalogVariant[],
  meta?: { productId?: string; handle?: string }
): CatalogVariant {
  if (variants.length === 0) {
    throw new CatalogContractError("El producto no tiene variantes", {
      ...meta,
      field: "variants",
    })
  }
  if (variants.length === 1) {
    return variants[0]
  }

  // Política B2B v1: sin selector multi-variante en PDP. Si Admin añade otra
  // variante, elegimos la comprable más barata para no romper listados/carrito.
  const purchasable = variants.filter((v) => v.isPurchasable)
  const pool = purchasable.length ? purchasable : variants

  return pool.reduce((best, variant) => {
    const bestAmount = best.calculatedPrice?.amount ?? Number.POSITIVE_INFINITY
    const variantAmount =
      variant.calculatedPrice?.amount ?? Number.POSITIVE_INFINITY
    return variantAmount < bestAmount ? variant : best
  })
}

/** Transforma un producto Store API validado a CatalogProduct. */
export function mapMedusaStoreProductToCatalogProduct(
  raw: MedusaStoreProduct
): CatalogProduct {
  const meta = { productId: raw.id, handle: raw.handle }

  if (!raw.id || !raw.handle || !raw.title) {
    throw new CatalogContractError("Faltan campos obligatorios del producto", {
      ...meta,
      field: "id|handle|title",
    })
  }

  if (raw.status && raw.status !== "published") {
    throw new CatalogContractError(`Estado no publicado: ${raw.status}`, {
      ...meta,
      field: "status",
    })
  }

  if (!raw.pim_info?.id || !raw.pim_info.product_id) {
    throw new CatalogContractError("Falta pim_info", { ...meta, field: "pim_info" })
  }

  const pimRaw = raw.pim_info
  const purchaseMode = assertEnum(
    pimRaw.purchase_mode,
    PURCHASE_MODES,
    "pim.purchaseMode",
    meta
  )
  const availabilityMode = assertEnum(
    pimRaw.availability_mode,
    AVAILABILITY_MODES,
    "pim.availabilityMode",
    meta
  )

  const categories = (raw.categories ?? []).map((c) =>
    mapMedusaCategory(c, c.parent_category_id ?? c.parent_category?.id ?? null)
  )

  if (!categories.length) {
    throw new CatalogContractError("Sin categorias", { ...meta, field: "categories" })
  }

  const leafCategory = selectLeafCategory(categories, meta)
  const { thumbnail, images } = mapMedusaImages(raw)

  const variants = (raw.variants ?? []).map((v) => {
    const base = mapMedusaVariant(v, purchaseMode, "in_stock")
    const availability = deriveAvailability(availabilityMode, base)
    return {
      ...base,
      isPurchasable:
        purchaseMode === "buy_now" &&
        base.calculatedPrice !== null &&
        availability === "in_stock",
    }
  })

  if (!variants.length) {
    throw new CatalogContractError("Sin variantes", { ...meta, field: "variants" })
  }

  const primaryVariant = resolvePrimaryVariant(variants, meta)
  const display = buildDisplay(variants, purchaseMode, availabilityMode)

  const wcIdRaw = raw.metadata?.wc_id
  const wcId =
    typeof wcIdRaw === "number"
      ? wcIdRaw
      : typeof wcIdRaw === "string" && wcIdRaw.trim()
        ? Number.parseInt(wcIdRaw, 10)
        : undefined
  const legacy =
    wcId && Number.isFinite(wcId) && wcId > 0 ? { wcId } : undefined

  const isDemo = Boolean(
    raw.metadata?.hackday_demo === true ||
    raw.metadata?.hackday_demo === "true" ||
    (raw.metadata && "hackday_demo" in raw.metadata) ||
    (raw as any).tags?.some?.((t: any) => {
      const val = typeof t === "string" ? t : (t?.value || t?.name || "")
      return val === "hackday_demo" || (typeof val === "string" && val.includes("hackday_demo"))
    }) ||
    variants.some((v) => v.sku?.toUpperCase().startsWith("CN-DEMO-")) ||
    pimRaw.item_number?.toUpperCase().startsWith("CN-DEMO-")
  )

  return {
    id: raw.id,
    handle: raw.handle,
    title: raw.title,
    subtitle: raw.subtitle ?? null,
    description: raw.description?.trim() || "",
    status: "published",
    thumbnail,
    images,
    updatedAt: raw.updated_at || raw.created_at || new Date().toISOString(),
    brand: raw.brand
      ? {
          id: raw.brand.id,
          name: raw.brand.name,
          handle: raw.brand.handle,
          logoUrl: raw.brand.logo_url ?? null,
        }
      : null,
    pim: {
      id: pimRaw.id,
      productId: pimRaw.product_id,
      mfrModel: pimRaw.mfr_model ?? null,
      itemNumber: pimRaw.item_number ?? null,
      purchaseMode,
      availabilityMode,
      leadTimeDays: pimRaw.lead_time_days ?? null,
      technicalPdf: pimRaw.technical_pdf ?? null,
      manualPdf: pimRaw.manual_pdf ?? null,
      specs: normalizeSpecs(pimRaw.specs ?? {}, meta),
      seoTitle: pimRaw.seo_title ?? null,
      seoDescription: pimRaw.seo_description ?? null,
      ogImage: pimRaw.og_image ?? null,
    },
    categories,
    leafCategory,
    variants,
    primaryVariant,
    display,
    legacy,
    metadata: raw.metadata ?? null,
    tags: (raw as any).tags ?? null,
    isDemo,
  }
}
