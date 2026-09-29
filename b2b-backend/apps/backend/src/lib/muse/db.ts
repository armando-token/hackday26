import { Pool, PoolConfig } from "pg"

/**
 * Muse Database Helper
 * Ultra-fast direct access to PostgreSQL 'medusa' database for technical facts,
 * profiles, and sources, strictly filtered to demonstration variants.
 */

export interface TechnicalProfileRecord {
  id: string
  variant_id: string
  model: string | null
  revision: string | null
  demo: boolean
  created_at: Date
  updated_at: Date
  deleted_at?: Date | null
  // Enriched variant & product metadata for downstream APIs
  sku?: string
  variant_title?: string
  product_id?: string
  product_title?: string
  product_subtitle?: string | null
  product_description?: string | null
  product_handle?: string
  price_pen?: number | null
  stock?: number | null
}

export interface TechnicalFactRecord {
  id: string
  variant_id: string
  property: string
  normalized_value_json: Record<string, any> | null
  display_value: string | null
  source_id: string | null
  page: number | null
  section: string | null
  excerpt: string | null
  polarity: boolean
  created_at: Date
  updated_at: Date
  deleted_at?: Date | null
}

export interface TechnicalSourceRecord {
  id: string
  url: string | null
  kind: string | null
  revision: string | null
  checksum: string | null
  published_at: Date | null
  created_at: Date
  updated_at: Date
  deleted_at?: Date | null
}

export interface DemoVariantSearchResult {
  variant_id: string
  product_id: string
  profile_id: string
  sku: string
  model: string | null
  revision: string | null
  variant_title: string
  product_title: string
  product_subtitle: string | null
  product_description: string | null
  product_handle: string
  price_pen: number | null
  stock: number | null
  technical_pdf: string | null
  manual_pdf: string | null
  demo: boolean
}

/**
 * Postgres Connection Pool Configuration
 * Defaults to localhost medusa database credentials: postgres:password@localhost:5432/medusa
 */
const connectionString =
  process.env.DATABASE_URL || "postgres://postgres:password@localhost:5432/medusa"

const poolConfig: PoolConfig = {
  connectionString,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
}

export const pool = new Pool(poolConfig)

pool.on("error", (err) => {
  console.error("[Muse DB Pool] Unexpected error on idle client:", err)
})

/**
 * Returns the active pg Pool instance.
 */
export function getPool(): Pool {
  return pool
}

/**
 * Closes the pg Pool connection. Useful for test teardowns and graceful shutdowns.
 */
export async function closePool(): Promise<void> {
  await pool.end()
}

/**
 * Retrieve the Technical Profile for a demo variant by variantId (or SKU).
 * Strictly filters to demo variants (tp.demo = true, tp.deleted_at IS NULL).
 * Returns null if not found or if the variant is not a demo variant.
 */
export async function getTechnicalProfile(
  variantId: string
): Promise<TechnicalProfileRecord | null> {
  if (!variantId || typeof variantId !== "string" || !variantId.trim()) {
    return null
  }
  const cleanId = variantId.trim()
  const isMedusaId = cleanId.startsWith("variant_")

  const queryText = isMedusaId
    ? `
      SELECT 
        tp.id,
        tp.variant_id,
        tp.model,
        tp.revision,
        tp.demo,
        tp.created_at,
        tp.updated_at,
        pv.sku,
        pv.title as variant_title,
        p.id as product_id,
        p.title as product_title,
        p.subtitle as product_subtitle,
        p.description as product_description,
        p.handle as product_handle,
        pr.amount::double precision as price_pen,
        il.stocked_quantity::integer as stock
      FROM technical_profile tp
      INNER JOIN product_variant pv ON pv.id = tp.variant_id AND pv.deleted_at IS NULL
      INNER JOIN product p ON p.id = pv.product_id AND p.deleted_at IS NULL
      LEFT JOIN product_variant_price_set pvps ON pvps.variant_id = pv.id
      LEFT JOIN price pr ON pr.price_set_id = pvps.price_set_id AND pr.currency_code = 'pen' AND pr.deleted_at IS NULL
      LEFT JOIN product_variant_inventory_item pvii ON pvii.variant_id = pv.id
      LEFT JOIN inventory_level il ON il.inventory_item_id = pvii.inventory_item_id AND il.deleted_at IS NULL
      WHERE tp.variant_id = $1
        AND tp.demo = true
        AND tp.deleted_at IS NULL
      LIMIT 1
    `
    : `
      SELECT 
        tp.id,
        tp.variant_id,
        tp.model,
        tp.revision,
        tp.demo,
        tp.created_at,
        tp.updated_at,
        pv.sku,
        pv.title as variant_title,
        p.id as product_id,
        p.title as product_title,
        p.subtitle as product_subtitle,
        p.description as product_description,
        p.handle as product_handle,
        pr.amount::double precision as price_pen,
        il.stocked_quantity::integer as stock
      FROM technical_profile tp
      INNER JOIN product_variant pv ON pv.id = tp.variant_id AND pv.deleted_at IS NULL
      INNER JOIN product p ON p.id = pv.product_id AND p.deleted_at IS NULL
      LEFT JOIN product_variant_price_set pvps ON pvps.variant_id = pv.id
      LEFT JOIN price pr ON pr.price_set_id = pvps.price_set_id AND pr.currency_code = 'pen' AND pr.deleted_at IS NULL
      LEFT JOIN product_variant_inventory_item pvii ON pvii.variant_id = pv.id
      LEFT JOIN inventory_level il ON il.inventory_item_id = pvii.inventory_item_id AND il.deleted_at IS NULL
      WHERE (tp.variant_id = $1 OR pv.sku = $1)
        AND tp.demo = true
        AND tp.deleted_at IS NULL
      LIMIT 1
    `

  const result = await pool.query<TechnicalProfileRecord>(queryText, [cleanId])
  return result.rows[0] || null
}

/**
 * Retrieve all Technical Facts for a demo variant by variantId (or SKU).
 * Strictly filters to demo variants (tp.demo = true, tf.deleted_at IS NULL).
 * Results are sorted by page and property for consistency.
 */
export async function getTechnicalFacts(
  variantId: string
): Promise<TechnicalFactRecord[]> {
  if (!variantId || typeof variantId !== "string" || !variantId.trim()) {
    return []
  }
  const cleanId = variantId.trim()
  const isMedusaId = cleanId.startsWith("variant_")

  const queryText = isMedusaId
    ? `
      SELECT 
        tf.id,
        tf.variant_id,
        tf.property,
        tf.normalized_value_json,
        tf.display_value,
        tf.source_id,
        tf.page,
        tf.section,
        tf.excerpt,
        tf.polarity,
        tf.created_at,
        tf.updated_at
      FROM technical_fact tf
      INNER JOIN technical_profile tp ON tp.variant_id = tf.variant_id AND tp.deleted_at IS NULL
      WHERE tf.variant_id = $1
        AND tp.demo = true
        AND tf.deleted_at IS NULL
      ORDER BY tf.page ASC, tf.property ASC
    `
    : `
      SELECT 
        tf.id,
        tf.variant_id,
        tf.property,
        tf.normalized_value_json,
        tf.display_value,
        tf.source_id,
        tf.page,
        tf.section,
        tf.excerpt,
        tf.polarity,
        tf.created_at,
        tf.updated_at
      FROM technical_fact tf
      INNER JOIN technical_profile tp ON tp.variant_id = tf.variant_id AND tp.deleted_at IS NULL
      LEFT JOIN product_variant pv ON pv.id = tf.variant_id AND pv.deleted_at IS NULL
      WHERE (tf.variant_id = $1 OR pv.sku = $1)
        AND tp.demo = true
        AND tf.deleted_at IS NULL
      ORDER BY tf.page ASC, tf.property ASC
    `

  const result = await pool.query<TechnicalFactRecord>(queryText, [cleanId])
  return result.rows
}

/**
 * Retrieve Technical Sources by their IDs (e.g. ['SRC-CN-DIN-PLC-A1-DS-V1']).
 * Strictly excludes soft-deleted records.
 */
export async function getTechnicalSources(
  sourceIds: string[]
): Promise<TechnicalSourceRecord[]> {
  if (!sourceIds || !Array.isArray(sourceIds) || sourceIds.length === 0) {
    return []
  }
  const cleanIds = Array.from(
    new Set(
      sourceIds
        .map((s) => (typeof s === "string" ? s.trim() : ""))
        .filter((s) => s.length > 0)
    )
  )
  if (cleanIds.length === 0) {
    return []
  }

  const queryText = `
    SELECT 
      ts.id,
      ts.url,
      ts.kind,
      ts.revision,
      ts.checksum,
      ts.published_at,
      ts.created_at,
      ts.updated_at
    FROM technical_source ts
    WHERE ts.id = ANY($1::text[])
      AND ts.deleted_at IS NULL
    ORDER BY ts.id ASC
  `

  const result = await pool.query<TechnicalSourceRecord>(queryText, [cleanIds])
  return result.rows
}

/**
 * Searches and lists demonstration variants matching query string q across SKU, model,
 * product title, description, or handle.
 * Strictly filters to demo variants (tp.demo = true, tp.deleted_at IS NULL).
 * If q is omitted or empty, returns all demo variants up to limit.
 */
export async function searchDemoVariants(
  q?: string,
  limit: number = 20
): Promise<DemoVariantSearchResult[]> {
  const safeLimit = Math.max(1, Math.min(limit || 20, 100))
  const rawQ = (q || "").trim()
  const filterPattern = rawQ ? `%${rawQ}%` : ""

  const queryText = `
    SELECT 
      tp.id as profile_id,
      tp.variant_id,
      tp.model,
      tp.revision,
      tp.demo,
      pv.sku,
      pv.title as variant_title,
      p.id as product_id,
      p.title as product_title,
      p.subtitle as product_subtitle,
      p.description as product_description,
      p.handle as product_handle,
      pr.amount::double precision as price_pen,
      il.stocked_quantity::integer as stock,
      pminf.technical_pdf,
      pminf.manual_pdf
    FROM technical_profile tp
    INNER JOIN product_variant pv ON pv.id = tp.variant_id AND pv.deleted_at IS NULL
    INNER JOIN product p ON p.id = pv.product_id AND p.deleted_at IS NULL
    LEFT JOIN pim_info pminf ON pminf.product_id = p.id AND pminf.deleted_at IS NULL
    LEFT JOIN product_variant_price_set pvps ON pvps.variant_id = pv.id
    LEFT JOIN price pr ON pr.price_set_id = pvps.price_set_id AND pr.currency_code = 'pen' AND pr.deleted_at IS NULL
    LEFT JOIN product_variant_inventory_item pvii ON pvii.variant_id = pv.id
    LEFT JOIN inventory_level il ON il.inventory_item_id = pvii.inventory_item_id AND il.deleted_at IS NULL
    WHERE tp.demo = true
      AND tp.deleted_at IS NULL
      AND (
        $1 = '' OR
        pv.sku ILIKE $2 OR
        tp.model ILIKE $2 OR
        p.title ILIKE $2 OR
        p.subtitle ILIKE $2 OR
        p.description ILIKE $2 OR
        p.handle ILIKE $2 OR
        EXISTS (
          SELECT 1 FROM technical_fact tf
          WHERE tf.variant_id = pv.id
            AND tf.display_value ILIKE $2
            AND tf.deleted_at IS NULL
        )
      )
    ORDER BY pv.sku ASC
    LIMIT $3
  `

  const result = await pool.query<DemoVariantSearchResult>(queryText, [
    rawQ,
    filterPattern,
    safeLimit,
  ])
  return result.rows
}

/**
 * Checks whether a given variantId or SKU corresponds to a valid demo variant.
 */
export async function isDemoVariant(variantId: string): Promise<boolean> {
  if (!variantId || typeof variantId !== "string" || !variantId.trim()) {
    return false
  }
  const cleanId = variantId.trim()
  const isMedusaId = cleanId.startsWith("variant_")

  const queryText = isMedusaId
    ? `
      SELECT 1 
      FROM technical_profile tp
      WHERE tp.variant_id = $1 AND tp.demo = true AND tp.deleted_at IS NULL
      LIMIT 1
    `
    : `
      SELECT 1 
      FROM technical_profile tp
      JOIN product_variant pv ON pv.id = tp.variant_id AND pv.deleted_at IS NULL
      WHERE (tp.variant_id = $1 OR pv.sku = $1) AND tp.demo = true AND tp.deleted_at IS NULL
      LIMIT 1
    `

  const result = await pool.query(queryText, [cleanId])
  return (result.rowCount ?? 0) > 0
}
