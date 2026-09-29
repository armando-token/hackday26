import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import * as crypto from "crypto"
import fs from "fs"
import path from "path"
import {
  verifyMuseAuth,
  formatErrorResponse,
  applySecurityHeaders,
  museLogger,
} from "../../../../../lib/muse/auth-guard"
import { getPool } from "../../../../../lib/muse/db"
import {
  getLiveOffer,
  isLiveOfferNotFoundError,
  isLiveOfferValidationError,
  type LiveOfferResult,
} from "../../../../../lib/muse/offer"
import {
  handleIdempotencyCheck,
  computeIdempotencyHash,
  computeRequestBodyHash,
} from "../../../../../lib/muse/idempotency"
import { generateQuotePdf } from "../../../../../lib/muse/pdf-generator"

/**
 * Tell Medusa to disable default session/store authentication.
 * Route security is fully enforced via verifyMuseAuth (Bearer token guard).
 */
export const AUTHENTICATE = false

/**
 * Default fallback demo region ID from manifest (Perú / PEN).
 */
const DEFAULT_DEMO_REGION_ID = "reg_01M01FK2K4G93M9GKDRTPRP6ZB"

/**
 * Public backend base URL for PDF download links.
 */
const BACKEND_PUBLIC_BASE_URL =
  process.env.MUSE_BACKEND_PUBLIC_URL ||
  process.env.MEDUSA_BACKEND_URL ||
  "http://52.20.66.203:9000"

/**
 * Public storefront base URL for product links.
 */
const STOREFRONT_PUBLIC_BASE_URL =
  process.env.STOREFRONT_BASE_URL ||
  process.env.STOREFRONT_URL ||
  "http://52.20.66.203:8000"

/**
 * Dynamically resolves the demo region ID from the project manifest if present.
 */
function resolveDemoRegionId(): string {
  try {
    const candidatePaths = [
      path.resolve(process.cwd(), "hackday-demo-manifest.json"),
      path.resolve(process.cwd(), "../..", "hackday-demo-manifest.json"),
      path.resolve(process.cwd(), "../../..", "hackday-demo-manifest.json"),
      "/home/ubuntu/hackday26/hackday-demo-manifest.json",
    ]
    for (const p of candidatePaths) {
      if (fs.existsSync(p)) {
        const manifest = JSON.parse(fs.readFileSync(p, "utf8"))
        if (manifest?.region?.id && typeof manifest.region.id === "string") {
          return manifest.region.id.trim()
        }
      }
    }
  } catch {
    // Fall back to default constant below
  }
  return DEFAULT_DEMO_REGION_ID
}

/**
 * POST /api/muse/v1/preliminary-quotes
 *
 * Preliminary Quote generation endpoint for Meta Muse Agent Commerce.
 *
 * Requirements:
 * 1. Authenticate with verifyMuseAuth(req) - HTTP 401 if unauthorized.
 * 2. Parse JSON body: { variant_id, quantity, region_id?, idempotency_key? }.
 * 3. SECURITY: Strip and completely ignore any client-provided 'price', 'unit_price', 'subtotal', 'in_stock'.
 * 4. Validate variant_id (must be present string) and quantity (integer 1..20). If invalid, return 400.
 * 5. Check idempotency: if idempotency_key provided, check if key exists.
 *    If exists with different body -> HTTP 409 Conflict with code 'IDEMPOTENCY_CONFLICT'.
 *    If exists with same body -> return existing snapshot with 200 OK.
 * 6. Re-read live offer: call getLiveOffer(variant_id, quantity, region_id). If variant not found -> 404.
 * 7. Generate unique IDs: quote_id, opaque_public_id, download_token.
 * 8. Generate PDF via generateQuotePdf.
 * 9. Insert record into PostgreSQL 'preliminary_quote'.
 * 10. Return HTTP 201 Created with JSON:
 *     {
 *       quote_id,
 *       opaque_public_id,
 *       status: offer.state,
 *       observed_at: offer.observed_at,
 *       expires_at,
 *       pdf_url: `http://52.20.66.203:9000/api/muse/v1/quotes/${opaque_public_id}/pdf?token=${download_token}`,
 *       summary: {
 *         sku: offer.sku,
 *         model: offer.model,
 *         title: offer.title,
 *         quantity: offer.quantity,
 *         currency: offer.currency,
 *         unit_price: offer.unit_price,
 *         subtotal: offer.subtotal,
 *         availability: offer.availability
 *       },
 *       request_id
 *     }
 * 11. Add headers X-Request-Id and Cache-Control: no-store.
 */
export const POST = async (
  req: MedusaRequest,
  res: MedusaResponse
): Promise<any> => {
  // 1. Authenticate with verifyMuseAuth(req) - HTTP 401 if unauthorized
  const auth = verifyMuseAuth(req)
  if (!auth.authenticated) {
    return formatErrorResponse(
      res,
      401,
      "UNAUTHORIZED",
      "Missing or invalid bearer token",
      auth.requestId
    )
  }

  const requestId = auth.requestId

  // 11. Add headers X-Request-Id and Cache-Control: no-store
  applySecurityHeaders(res, requestId)

  // 2. Parse JSON body
  let rawBody: any = req.body
  if (typeof rawBody === "string") {
    try {
      rawBody = JSON.parse(rawBody)
    } catch {
      return formatErrorResponse(
        res,
        400,
        "INVALID_REQUEST",
        "Invalid JSON payload in request body",
        requestId
      )
    }
  }

  if (!rawBody || typeof rawBody !== "object" || Array.isArray(rawBody)) {
    return formatErrorResponse(
      res,
      400,
      "INVALID_REQUEST",
      "Request body must be a non-null JSON object",
      requestId
    )
  }

  // 3. SECURITY: Strip and completely ignore any client-provided commercial values
  // (anti price-tampering & fake stock injection)
  const forbiddenClientKeys = [
    "price",
    "unit_price",
    "unit_price_minor",
    "unit_price_decimal",
    "subtotal",
    "subtotal_minor",
    "subtotal_decimal",
    "in_stock",
    "stock",
    "available_quantity",
    "availability",
  ]
  for (const forbiddenKey of forbiddenClientKeys) {
    if (forbiddenKey in rawBody) {
      delete rawBody[forbiddenKey]
    }
  }

  // 4. Validate variant_id (must be present string)
  const rawVariantId = rawBody.variant_id
  if (
    rawVariantId === undefined ||
    rawVariantId === null ||
    typeof rawVariantId !== "string" ||
    rawVariantId.trim().length === 0
  ) {
    return formatErrorResponse(
      res,
      400,
      "INVALID_REQUEST",
      "variant_id is required and must be a non-empty string",
      requestId
    )
  }
  const variant_id = rawVariantId.trim()

  // 4. Validate quantity (integer 1..20)
  const rawQuantity = rawBody.quantity
  if (
    rawQuantity === undefined ||
    rawQuantity === null ||
    typeof rawQuantity !== "number" ||
    !Number.isInteger(rawQuantity) ||
    rawQuantity < 1 ||
    rawQuantity > 20
  ) {
    return formatErrorResponse(
      res,
      400,
      "INVALID_REQUEST",
      "quantity must be an integer between 1 and 20",
      requestId
    )
  }
  const quantity = rawQuantity

  // Optional region_id
  const rawRegionId = rawBody.region_id
  const region_id: string | undefined =
    typeof rawRegionId === "string" && rawRegionId.trim().length > 0
      ? rawRegionId.trim()
      : undefined

  // Optional idempotency_key (from body or standard HTTP headers)
  const rawIdempotencyKey =
    rawBody.idempotency_key ||
    req.headers["idempotency-key"] ||
    req.headers["x-idempotency-key"]

  const idempotency_key: string | undefined =
    typeof rawIdempotencyKey === "string" && rawIdempotencyKey.trim().length > 0
      ? rawIdempotencyKey.trim()
      : undefined

  // Canonical payload for idempotency checking and hashing
  const payloadForHash: Record<string, any> = {
    variant_id,
    quantity,
  }
  if (region_id !== undefined) {
    payloadForHash.region_id = region_id
  }
  if (idempotency_key !== undefined) {
    payloadForHash.idempotency_key = idempotency_key
  }

  const pool = getPool()

  // 5. Check idempotency: if idempotency_key provided
  if (idempotency_key) {
    try {
      const idempResult = await handleIdempotencyCheck(
        pool,
        idempotency_key,
        payloadForHash
      )

      if (idempResult.status === "conflict") {
        return formatErrorResponse(
          res,
          409,
          "IDEMPOTENCY_CONFLICT",
          "Idempotency key has already been used with a different request payload",
          requestId
        )
      }

      if (idempResult.status === "replay" && idempResult.quote) {
        const existing = idempResult.quote

        // Extract or reconstruct stored summary snapshot
        let existingSummary: any = null
        if (existing.metadata) {
          const meta =
            typeof existing.metadata === "string"
              ? JSON.parse(existing.metadata)
              : existing.metadata
          existingSummary = meta?.summary
        }

        if (!existingSummary) {
          existingSummary = {
            sku: existing.sku,
            model: existing.model,
            title: existing.title,
            quantity: existing.quantity,
            currency: existing.currency,
            unit_price:
              existing.unit_price_decimal !== null
                ? Number(existing.unit_price_decimal)
                : null,
            subtotal:
              existing.subtotal_decimal !== null
                ? Number(existing.subtotal_decimal)
                : null,
            availability:
              typeof existing.availability_snapshot_json === "string"
                ? JSON.parse(existing.availability_snapshot_json)
                : existing.availability_snapshot_json,
          }
        }

        const existingPdfUrl = `${BACKEND_PUBLIC_BASE_URL.replace(
          /\/+$/,
          ""
        )}/api/muse/v1/quotes/${existing.opaque_public_id}/pdf?token=${
          existing.download_token
        }`

        return res.status(200).json({
          quote_id: existing.id,
          opaque_public_id: existing.opaque_public_id,
          status: existing.status,
          observed_at:
            existing.observed_at instanceof Date
              ? existing.observed_at.toISOString()
              : String(existing.observed_at),
          expires_at:
            existing.expires_at instanceof Date
              ? existing.expires_at.toISOString()
              : String(existing.expires_at),
          pdf_url: existingPdfUrl,
          summary: existingSummary,
          request_id: requestId,
        })
      }
    } catch (idempErr: any) {
      museLogger.error("Failed executing idempotency check", idempErr, {
        requestId,
        idempotency_key,
      })
      return formatErrorResponse(
        res,
        500,
        "INTERNAL_SERVER_ERROR",
        "Failed to verify request idempotency",
        requestId
      )
    }
  }

  // 6. Re-read live offer: call getLiveOffer(variant_id, quantity, region_id)
  let offer: LiveOfferResult
  try {
    offer = await getLiveOffer(variant_id, quantity, region_id)
  } catch (offerErr: any) {
    if (
      isLiveOfferNotFoundError(offerErr) ||
      offerErr?.statusCode === 404 ||
      offerErr?.status === 404 ||
      offerErr?.code === "NOT_FOUND"
    ) {
      return formatErrorResponse(
        res,
        404,
        "NOT_FOUND",
        offerErr.message ||
          `Variant '${variant_id}' not found or outside demo catalog scope`,
        requestId
      )
    }

    if (
      isLiveOfferValidationError(offerErr) ||
      offerErr?.statusCode === 400 ||
      offerErr?.status === 400
    ) {
      return formatErrorResponse(
        res,
        400,
        "INVALID_REQUEST",
        offerErr.message || "Invalid offer parameters",
        requestId
      )
    }

    museLogger.error("Failed calculating live offer for quote", offerErr, {
      requestId,
      variant_id,
      quantity,
    })
    return formatErrorResponse(
      res,
      500,
      "INTERNAL_SERVER_ERROR",
      "Failed to calculate live commercial offer",
      requestId
    )
  }

  // 7. Generate unique IDs
  const quote_id = `pquote_${Date.now()}_${crypto
    .randomBytes(4)
    .toString("hex")}`
  const opaque_public_id = crypto.randomBytes(16).toString("hex")
  const download_token = crypto.randomBytes(24).toString("hex")

  // Expiration calculation: exactly 24 hours from creation
  const now = new Date()
  const expiresAtDate = new Date(now.getTime() + 24 * 60 * 60 * 1000)
  const expires_at = expiresAtDate.toISOString()

  const productUrl = offer.product_handle
    ? `${STOREFRONT_PUBLIC_BASE_URL.replace(/\/+$/, "")}/pe/products/${
        offer.product_handle
      }`
    : `${STOREFRONT_PUBLIC_BASE_URL.replace(/\/+$/, "")}/pe/products/${offer.sku.toLowerCase()}`

  // 8. Generate PDF via generateQuotePdf
  let pdfStorageKey = `quotes/${opaque_public_id}.pdf`
  let pdfChecksum = ""
  let pdfFilePath = ""

  try {
    const pdfPayload = {
      quote_id,
      opaque_public_id,
      status: offer.state,
      sku: offer.sku,
      model: offer.model || "",
      title: offer.title,
      quantity: offer.quantity,
      currency: offer.currency,
      unit_price: offer.unit_price,
      subtotal: offer.subtotal,
      availability: offer.availability,
      reason: offer.review_reason,
      observed_at: offer.observed_at,
      expires_at,
      product_url: productUrl,
    }

    const pdfResult = await generateQuotePdf(pdfPayload)
    pdfStorageKey = pdfResult.storageKey
    pdfChecksum = pdfResult.checksum
    pdfFilePath = pdfResult.filePath
  } catch (pdfErr: any) {
    museLogger.error("Failed generating quote PDF document", pdfErr, {
      requestId,
      quote_id,
      opaque_public_id,
    })
    return formatErrorResponse(
      res,
      500,
      "INTERNAL_SERVER_ERROR",
      `Failed to generate preliminary quote PDF: ${pdfErr.message}`,
      requestId
    )
  }

  // 9. Insert record into PostgreSQL 'preliminary_quote'
  const pdf_url = `${BACKEND_PUBLIC_BASE_URL.replace(
    /\/+$/,
    ""
  )}/api/muse/v1/quotes/${opaque_public_id}/pdf?token=${download_token}`

  const summary = {
    sku: offer.sku,
    model: offer.model || "",
    title: offer.title,
    quantity: offer.quantity,
    currency: offer.currency,
    unit_price: offer.unit_price,
    subtotal: offer.subtotal,
    availability: offer.availability,
  }

  const metadata = {
    pdf_sha256: pdfChecksum,
    pdf_file_path: pdfFilePath,
    download_token_hash: crypto
      .createHash("sha256")
      .update(download_token)
      .digest("hex"),
    summary,
    pdf_url,
  }

  const effectiveRegionId =
    region_id || offer.region_id || resolveDemoRegionId()

  const insertSql = `
    INSERT INTO preliminary_quote (
      id,
      opaque_public_id,
      status,
      variant_id,
      sku,
      model,
      title,
      quantity,
      region_id,
      currency,
      unit_price_minor,
      unit_price_decimal,
      subtotal_minor,
      subtotal_decimal,
      tax_status,
      tax_amount_minor,
      shipping_status,
      availability_snapshot_json,
      product_url,
      evidence_revision,
      observed_at,
      created_at,
      expires_at,
      demo,
      pdf_storage_key,
      download_token,
      idempotency_key,
      idempotency_key_hash,
      request_body_hash,
      review_reason,
      metadata
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
      $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
      $21, $22, $23, $24, $25, $26, $27, $28, $29, $30,
      $31
    )
  `

  try {
    await pool.query(insertSql, [
      quote_id,
      opaque_public_id,
      offer.state,
      offer.variant_id,
      offer.sku,
      offer.model || "",
      offer.title,
      offer.quantity,
      effectiveRegionId,
      offer.currency,
      offer.unit_price_minor,
      offer.unit_price,
      offer.subtotal_minor,
      offer.subtotal,
      offer.tax_status,
      0,
      offer.shipping_status,
      JSON.stringify(offer.availability),
      productUrl,
      offer.limitations ? JSON.stringify(offer.limitations) : "rev-2026.1",
      offer.observed_at,
      now,
      expires_at,
      true,
      pdfStorageKey,
      download_token,
      idempotency_key || null,
      idempotency_key ? computeIdempotencyHash(idempotency_key) : null,
      idempotency_key ? computeRequestBodyHash(payloadForHash) : null,
      offer.review_reason || null,
      JSON.stringify(metadata),
    ])
  } catch (dbErr: any) {
    museLogger.error("Failed persisting preliminary quote to database", dbErr, {
      requestId,
      quote_id,
      opaque_public_id,
    })
    return formatErrorResponse(
      res,
      500,
      "INTERNAL_SERVER_ERROR",
      "Failed to persist preliminary quote record",
      requestId
    )
  }

  // 10. Return HTTP 201 Created with JSON
  return res.status(201).json({
    quote_id,
    opaque_public_id,
    status: offer.state,
    observed_at: offer.observed_at,
    expires_at,
    pdf_url,
    summary,
    request_id: requestId,
  })
}
