import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { withMuseAuth, formatErrorResponse } from "../../../../../../lib/muse/auth-guard"
import {
  getTechnicalProfile,
  getTechnicalFacts,
  getTechnicalSources,
} from "../../../../../../lib/muse/db"
import { getLiveOffer } from "../../../../../../lib/muse/offer"

/**
 * Tell Medusa to disable default session/store authentication.
 * Route security is fully enforced via `withMuseAuth` (Bearer token guard).
 */
export const AUTHENTICATE = false

const STOREFRONT_PUBLIC_BASE_URL =
  process.env.STOREFRONT_PUBLIC_BASE_URL ||
  process.env.STOREFRONT_BASE_URL ||
  process.env.STOREFRONT_URL ||
  process.env.NEXT_PUBLIC_STOREFRONT_URL ||
  "https://data.controlnautas.com"

const STOREFRONT_BASE_URL = STOREFRONT_PUBLIC_BASE_URL

/**
 * GET /api/muse/v1/products/[variantId]
 * 
 * Returns technical profile, factual specification claims, and referenced sources
 * strictly for demonstration products.
 * 
 * Requirements:
 * - Bearer authentication with auth-guard (401 on missing or invalid token).
 * - Response header: `X-Request-Id: <request_id>`.
 * - Strict scope: ONLY demo variants.
 * - If variantId does not exist or is outside demo scope -> HTTP 404 NOT_FOUND.
 * - Includes live commercial `offer` snapshot (getLiveOffer) so agents discover price/stock naturally.
 */
export const GET = withMuseAuth(
  async (req: MedusaRequest, res: MedusaResponse, { requestId }) => {
    const rawVariantId = req.params?.variantId || (req as any).params?.id
    const variantId = typeof rawVariantId === "string" ? rawVariantId.trim() : ""

    if (!variantId) {
      return formatErrorResponse(
        res,
        404,
        "NOT_FOUND",
        "Variant not found or outside demo scope",
        requestId
      )
    }

    try {
      // 1. Consultar PostgreSQL para el perfil técnico (filtrado a demo = true)
      const profile = await getTechnicalProfile(variantId)

      // Si no existe o no es variante de demo -> 404 estricto
      if (!profile || !profile.demo) {
        return formatErrorResponse(
          res,
          404,
          "NOT_FOUND",
          "Variant not found or outside demo scope",
          requestId
        )
      }

      // 2. Consultar hechos técnicos de esta variante
      const factsRecords = await getTechnicalFacts(profile.variant_id)

      // 3. Extraer IDs únicos de las fuentes referenciadas en los hechos
      const sourceIds = Array.from(
        new Set(
          factsRecords
            .map((f) => f.source_id)
            .filter((id): id is string => typeof id === "string" && id.trim().length > 0)
        )
      )

      // 4. Consultar fuentes técnicas en PostgreSQL
      const sourcesRecords =
        sourceIds.length > 0 ? await getTechnicalSources(sourceIds) : []

      // 5. Construir objetos de respuesta limpios (SIN precio ni stock)
      const facts = factsRecords.map((f) => ({
        id: f.id,
        variant_id: f.variant_id,
        property: f.property,
        normalized_value_json: f.normalized_value_json,
        display_value: f.display_value || "",
        source_id: f.source_id,
        page: f.page,
        section: f.section,
        excerpt: f.excerpt,
        polarity: f.polarity,
        created_at:
          f.created_at instanceof Date
            ? f.created_at.toISOString()
            : f.created_at,
        updated_at:
          f.updated_at instanceof Date
            ? f.updated_at.toISOString()
            : f.updated_at,
      }))

      const sources = sourcesRecords.map((s) => ({
        id: s.id,
        url: s.url,
        kind: s.kind,
        revision: s.revision,
        checksum: s.checksum,
        published_at:
          s.published_at instanceof Date
            ? s.published_at.toISOString()
            : s.published_at,
        created_at:
          s.created_at instanceof Date
            ? s.created_at.toISOString()
            : s.created_at,
        updated_at:
          s.updated_at instanceof Date
            ? s.updated_at.toISOString()
            : s.updated_at,
      }))

      const profileData = {
        id: profile.id,
        variant_id: profile.variant_id,
        model: profile.model || "",
        revision: profile.revision || "",
        demo: profile.demo,
        created_at:
          profile.created_at instanceof Date
            ? profile.created_at.toISOString()
            : profile.created_at,
        updated_at:
          profile.updated_at instanceof Date
            ? profile.updated_at.toISOString()
            : profile.updated_at,
      }

      const productHandle = profile.product_handle || ""
      const productUrl = `${STOREFRONT_PUBLIC_BASE_URL.replace(/\/+$/, "")}/us/products/${productHandle}`

      // Formato de respuesta exacto y conforme a especificación
      let offer: Record<string, unknown> | null = null
      try {
        const live = await getLiveOffer(profile.variant_id, 1)
        offer = {
          state: live.state,
          currency: live.currency,
          unit_price_minor: live.unit_price_minor,
          unit_price: live.unit_price,
          subtotal_minor: live.subtotal_minor,
          subtotal: live.subtotal,
          scale: live.scale,
          availability: live.availability,
          availability_status: live.availability_status,
          tax_status: live.tax_status,
          shipping_status: live.shipping_status,
          limitations: live.limitations,
          observed_at: live.observed_at,
          review_reason: live.review_reason,
          offer_url: `https://data.controlnautas.com/api/muse/v1/products/${profile.variant_id}/offer?quantity=1`,
        }
      } catch (offerErr: any) {
        offer = {
          state: "manual_review",
          review_reason: offerErr?.message || "Live offer unavailable",
          offer_url: `https://data.controlnautas.com/api/muse/v1/products/${profile.variant_id}/offer?quantity=1`,
        }
      }

      const links = {
        offer: `https://data.controlnautas.com/api/muse/v1/products/${profile.variant_id}/offer?quantity=1`,
        evaluate: "https://data.controlnautas.com/api/muse/v1/evaluate",
        preliminary_quote: "https://data.controlnautas.com/api/muse/v1/preliminary-quotes",
        product_page: productUrl,
      }

      const responsePayload = {
        variant_id: profile.variant_id,
        sku: profile.sku || "",
        model: profile.model || "",
        title: profile.product_title || profile.variant_title || "",
        product_url: productUrl,
        demo: true,
        profile: profileData,
        facts,
        sources,
        offer,
        links,
        request_id: requestId,
      }

      return res.status(200).json(responsePayload)
    } catch (err: any) {
      return formatErrorResponse(
        res,
        500,
        "INTERNAL_SERVER_ERROR",
        err?.message || "An unexpected error occurred retrieving product details",
        requestId
      )
    }
  }
)
