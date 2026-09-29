import { createHmac, timingSafeEqual } from "crypto"
import { revalidatePath, revalidateTag } from "next/cache"
import { z } from "zod"
import { CATALOG_CACHE_TAGS } from "./catalog-cache"

const MAX_BODY_BYTES = 32 * 1024
const TIMESTAMP_TOLERANCE_SEC = 300
const IDEMPOTENCY_TTL_MS = 24 * 60 * 60 * 1000
const MAX_IDS = 100

const seenEventIds = new Map<string, number>()

export const ALLOWED_CATALOG_EVENTS = new Set([
  "product.created",
  "product.updated",
  "product.deleted",
  "product-variant.created",
  "product-variant.updated",
  "product-variant.deleted",
  "product-category.created",
  "product-category.updated",
  "product-category.deleted",
  "pricing.price.created",
  "pricing.price.updated",
  "pricing.price.deleted",
  "pricing.price-set.updated",
  "inventory.inventory-level.created",
  "inventory.inventory-level.updated",
  "inventory.inventory-level.deleted",
  "b2b-pim.created",
  "b2b-pim.updated",
  "b2b-pim.deleted",
])

const ALLOWED_TAG_PREFIXES = [
  CATALOG_CACHE_TAGS.root,
  CATALOG_CACHE_TAGS.products,
  "catalog:product:",
  "catalog:handle:",
  CATALOG_CACHE_TAGS.categories,
  "catalog:category:",
  "catalog:category-handle:",
  CATALOG_CACHE_TAGS.prices,
  CATALOG_CACHE_TAGS.inventory,
  CATALOG_CACHE_TAGS.search,
  CATALOG_CACHE_TAGS.feed,
  CATALOG_CACHE_TAGS.sitemap,
] as const

const revalidateBodySchema = z.object({
  eventId: z.string().min(1).max(128),
  event: z.string().min(1).max(128),
  occurredAt: z.string().datetime(),
  entityId: z.string().optional(),
  productIds: z.array(z.string()).max(MAX_IDS).optional(),
  categoryIds: z.array(z.string()).max(MAX_IDS).optional(),
  handles: z.array(z.string()).max(MAX_IDS).optional(),
  categoryHandles: z.array(z.string()).max(MAX_IDS).optional(),
  paths: z.array(z.string()).max(50).optional(),
  tags: z.array(z.string()).min(1).max(50),
})

export type CatalogRevalidateBody = z.infer<typeof revalidateBodySchema>

export function isAllowedCatalogTag(tag: string): boolean {
  return ALLOWED_TAG_PREFIXES.some(
    (prefix) => tag === prefix || tag.startsWith(prefix)
  )
}

export function verifyCatalogRevalidateSignature(
  secret: string,
  timestampHeader: string | null,
  rawBody: string,
  signatureHeader: string | null
): { ok: true } | { ok: false; status: number; error: string } {
  if (!secret || secret.length < 32) {
    return { ok: false, status: 500, error: "REVALIDATE_SECRET no configurado" }
  }

  if (!timestampHeader || !signatureHeader) {
    return { ok: false, status: 401, error: "Firma ausente" }
  }

  const timestamp = Number.parseInt(timestampHeader, 10)
  if (!Number.isFinite(timestamp)) {
    return { ok: false, status: 401, error: "Timestamp inválido" }
  }

  const nowSec = Math.floor(Date.now() / 1000)
  if (Math.abs(nowSec - timestamp) > TIMESTAMP_TOLERANCE_SEC) {
    return { ok: false, status: 401, error: "Timestamp fuera de tolerancia" }
  }

  const expected = createHmac("sha256", secret)
    .update(`${timestampHeader}.${rawBody}`)
    .digest("hex")

  const sigBuf = new Uint8Array(Buffer.from(signatureHeader, "utf8"))
  const expBuf = new Uint8Array(Buffer.from(expected, "utf8"))

  if (sigBuf.length !== expBuf.length) {
    return { ok: false, status: 401, error: "Firma inválida" }
  }

  if (!timingSafeEqual(sigBuf, expBuf)) {
    return { ok: false, status: 401, error: "Firma inválida" }
  }

  return { ok: true }
}

function pruneIdempotencyStore(now = Date.now()) {
  for (const [id, ts] of seenEventIds) {
    if (now - ts > IDEMPOTENCY_TTL_MS) {
      seenEventIds.delete(id)
    }
  }
}

export function isReplayEvent(eventId: string): boolean {
  pruneIdempotencyStore()
  if (seenEventIds.has(eventId)) {
    return true
  }
  seenEventIds.set(eventId, Date.now())
  return false
}

export function parseCatalogRevalidateBody(
  rawBody: string
):
  | { ok: true; body: CatalogRevalidateBody }
  | { ok: false; status: number; error: string } {
  if (Buffer.byteLength(rawBody, "utf8") > MAX_BODY_BYTES) {
    return { ok: false, status: 422, error: "Body demasiado grande" }
  }

  let json: unknown
  try {
    json = JSON.parse(rawBody)
  } catch {
    return { ok: false, status: 422, error: "JSON inválido" }
  }

  const parsed = revalidateBodySchema.safeParse(json)
  if (!parsed.success) {
    return { ok: false, status: 422, error: "Schema inválido" }
  }

  const body = parsed.data

  if (!ALLOWED_CATALOG_EVENTS.has(body.event)) {
    return { ok: false, status: 422, error: "Evento no permitido" }
  }

  const totalIds =
    (body.productIds?.length || 0) +
    (body.categoryIds?.length || 0) +
    (body.handles?.length || 0) +
    (body.categoryHandles?.length || 0)

  if (totalIds > MAX_IDS) {
    return { ok: false, status: 422, error: "Demasiados IDs" }
  }

  for (const tag of body.tags) {
    if (!isAllowedCatalogTag(tag)) {
      return { ok: false, status: 422, error: `Tag no permitido: ${tag}` }
    }
  }

  return { ok: true, body }
}

const ALLOWED_PATH_PREFIXES = [
  "/pe/products/",
  "/pe/store/",
  "/pe/search",
  "/pe/",
  "/sitemap.xml",
  "/api/feed/google-merchant",
] as const

export function isAllowedRevalidatePath(path: string): boolean {
  return ALLOWED_PATH_PREFIXES.some(
    (prefix) => path === prefix || path.startsWith(prefix)
  )
}

export function deriveRevalidatePaths(body: CatalogRevalidateBody): string[] {
  const paths = new Set<string>()

  for (const handle of body.handles || []) {
    if (handle) paths.add(`/pe/products/${handle}`)
  }

  for (const slug of body.categoryHandles || []) {
    if (slug) paths.add(`/pe/store/${slug}`)
  }

  if (
    body.tags.some(
      (t) =>
        t === CATALOG_CACHE_TAGS.sitemap ||
        t === CATALOG_CACHE_TAGS.feed ||
        t === CATALOG_CACHE_TAGS.products
    )
  ) {
    paths.add("/sitemap.xml")
    paths.add("/api/feed/google-merchant")
  }

  if (body.tags.includes(CATALOG_CACHE_TAGS.search)) {
    paths.add("/pe/search")
  }

  for (const path of body.paths || []) {
    if (isAllowedRevalidatePath(path)) {
      paths.add(path)
    }
  }

  return [...paths]
}

export function executeCatalogRevalidation(body: CatalogRevalidateBody): {
  invalidatedTags: string[]
  invalidatedPaths: string[]
  replay: boolean
} {
  if (isReplayEvent(body.eventId)) {
    return {
      invalidatedTags: body.tags,
      invalidatedPaths: deriveRevalidatePaths(body),
      replay: true,
    }
  }

  const uniqueTags = [...new Set(body.tags)]
  for (const tag of uniqueTags) {
    revalidateTag(tag)
  }

  const paths = deriveRevalidatePaths(body)
  for (const path of paths) {
    revalidatePath(path)
  }

  return {
    invalidatedTags: uniqueTags,
    invalidatedPaths: paths,
    replay: false,
  }
}

/** Expuesto para pruebas unitarias. */
export function resetRevalidateIdempotencyForTests() {
  seenEventIds.clear()
}
