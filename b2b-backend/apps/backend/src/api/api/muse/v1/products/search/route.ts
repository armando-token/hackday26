import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import {
  withMuseAuth,
  formatErrorResponse,
  applySecurityHeaders,
  type MuseRouteContext,
} from "../../../../../../lib/muse/auth-guard"
import { getPool } from "../../../../../../lib/muse/db"

/**
 * Indicador para Medusa v2 de que esta ruta maneja su propia autenticación (Bearer token Muse)
 * y no debe ser interceptada por los guards de autenticación internos de Medusa.
 */
export const AUTHENTICATE = false

const STOREFRONT_PUBLIC_BASE_URL =
  process.env.STOREFRONT_BASE_URL ||
  process.env.STOREFRONT_URL ||
  process.env.PUBLIC_MUSE_BASE_URL ||
  "https://data.controlnautas.com"

export interface SearchProductItem {
  variant_id: string
  sku: string
  model: string
  title: string
  product_url: string
  technical_summary: string
  demo: boolean
}

export interface SearchProductsResponse {
  products: SearchProductItem[]
  count: number
  request_id: string
}

/**
 * GET /api/muse/v1/products/search
 * 
 * Búsqueda técnica de productos para agentes de comercio (Meta Muse).
 * 
 * Requisitos:
 * - Autenticación Bearer obligatoria via auth-guard (401 si falta o es inválido).
 * - Headers: Cache-Control: no-store, X-Request-Id: <request_id>.
 * - Query params:
 *     - q: string (opcional, <= 200 caracteres).
 *     - limit: integer (opcional, entre 1 y 3, default: 3).
 * - Validación: si q > 200 o limit < 1 o limit > 3 -> 400 { error: { code: "INVALID_PARAM", message: "..." }, request_id }.
 * - Alcance: ÚNICAMENTE variantes de demostración técnica (CN-DEMO-* / demo=true).
 * - Matching: q contra sku, model, title y display_value de technical_fact.
 * - Sin q: retorna todas las variantes demo (hasta el límite).
 * - PROHIBICIÓN: NUNCA incluye precio cacheado ni stock en la respuesta.
 * - URLs: Usan la IP Elástica https://data.controlnautas.com/pe/products/<handle>.
 */
export const GET = withMuseAuth(
  async (
    req: MedusaRequest,
    res: MedusaResponse,
    context: MuseRouteContext
  ): Promise<any> => {
    const { requestId } = context

    // 1. Asegurar headers obligatorios de respuesta
    applySecurityHeaders(res, requestId)

    // 2. Extraer y validar parámetro 'q'
    const rawQ = req.query?.q
    let q = ""
    if (rawQ !== undefined && rawQ !== null) {
      if (typeof rawQ !== "string") {
        return formatErrorResponse(
          res,
          400,
          "INVALID_PARAM",
          "Query parameter 'q' must be a string",
          requestId
        )
      }
      if (rawQ.length > 200) {
        return formatErrorResponse(
          res,
          400,
          "INVALID_PARAM",
          `Query parameter 'q' must not exceed 200 characters (received ${rawQ.length})`,
          requestId,
          { length: rawQ.length, max: 200 }
        )
      }
      q = rawQ.trim()
    }

    // 3. Extraer y validar parámetro 'limit'
    let limit = 3
    const rawLimit = req.query?.limit
    if (rawLimit !== undefined && rawLimit !== null && rawLimit !== "") {
      const limitStr = String(rawLimit).trim()
      const parsed = Number(limitStr)

      // Debe ser una representación entera estricta (sin decimales ni caracteres extraños)
      if (
        !/^-?\d+$/.test(limitStr) ||
        !Number.isInteger(parsed) ||
        parsed < 1 ||
        parsed > 3
      ) {
        return formatErrorResponse(
          res,
          400,
          "INVALID_PARAM",
          `Query parameter 'limit' must be an integer between 1 and 3 (received '${rawLimit}')`,
          requestId,
          { limit: rawLimit, min: 1, max: 3 }
        )
      }
      limit = parsed
    }

    // 4. Consulta a la base de datos PostgreSQL
    try {
      const pool = getPool()
      const filterPattern = q ? `%${q}%` : ""

      const queryText = `
        SELECT
          pv.id AS variant_id,
          pv.sku,
          COALESCE(tp.model, '') AS model,
          p.title,
          p.subtitle,
          p.description,
          p.handle,
          COALESCE(tp.demo, true) AS demo
        FROM product_variant pv
        JOIN product p ON p.id = pv.product_id
        LEFT JOIN technical_profile tp ON tp.variant_id = pv.id
        WHERE (pv.sku LIKE $1 OR tp.demo = true)
          AND pv.deleted_at IS NULL
          AND p.deleted_at IS NULL
          AND (
            $2 = ''
            OR pv.sku ILIKE $3
            OR tp.model ILIKE $3
            OR p.title ILIKE $3
            OR pv.title ILIKE $3
            OR EXISTS (
              SELECT 1 FROM technical_fact tf
              WHERE tf.variant_id = pv.id
                AND tf.display_value ILIKE $3
                AND tf.deleted_at IS NULL
            )
          )
        ORDER BY pv.sku ASC
        LIMIT $4
      `

      const { rows } = await pool.query(queryText, [
        "CN-DEMO-%",
        q,
        filterPattern,
        limit,
      ])

      // 5. Construcción estricta de la respuesta técnica (SIN precio ni stock)
      const products: SearchProductItem[] = rows.map((row) => ({
        variant_id: row.variant_id,
        sku: row.sku,
        model: row.model,
        title: row.title,
        product_url: `${STOREFRONT_PUBLIC_BASE_URL.replace(/\/+$/, "")}/pe/products/${row.handle}`,
        technical_summary: row.subtitle || row.description || "",
        demo: true,
      }))

      const responsePayload: SearchProductsResponse = {
        products,
        count: products.length,
        request_id: requestId,
      }

      return res.status(200).json(responsePayload)
    } catch (err: any) {
      return formatErrorResponse(
        res,
        500,
        "INTERNAL_ERROR",
        err?.message || "An unexpected error occurred while executing technical search",
        requestId
      )
    }
  }
)
