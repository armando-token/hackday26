import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import fs from "fs"
import path from "path"
import {
  verifyMuseAuth,
  formatErrorResponse,
  applySecurityHeaders,
} from "../../../../../../../lib/muse/auth-guard"
import {
  getLiveOffer,
  isLiveOfferNotFoundError,
  isLiveOfferValidationError,
  type LiveOfferResult,
} from "../../../../../../../lib/muse/offer"

/**
 * Tell Medusa to disable default session/store authentication.
 * Route security is fully enforced via verifyMuseAuth (Bearer token guard).
 */
export const AUTHENTICATE = false

/**
 * Default fallback demo region ID for US / USD demonstration catalog.
 */
const DEFAULT_DEMO_REGION_ID =
  process.env.DEFAULT_DEMO_REGION_ID ||
  process.env.DEMO_REGION_ID ||
  "reg_01JUS00HACKDAY26DEMOUSD0000"

/**
 * Public storefront base URL for product links.
 */
function getProductBaseUrl(): string {
  const envUrl =
    process.env.PUBLIC_MUSE_BASE_URL?.trim() ||
    process.env.STOREFRONT_BASE_URL?.trim() ||
    process.env.STOREFRONT_URL?.trim()
  if (envUrl) {
    return envUrl.replace(/\/+$/, "")
  }
  return "https://data.controlnautas.com"
}

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
 * GET /api/muse/v1/products/[variantId]/offer
 *
 * Live commercial offer calculation endpoint for Meta Muse Agent Commerce.
 *
 * Requirements:
 * 1. Authenticate with verifyMuseAuth(req) - HTTP 401 if missing/invalid Bearer token.
 * 2. Parse 'quantity' query parameter: default 1, must be integer between 1 and 20.
 *    If invalid (e.g. quantity=0, quantity=99, quantity=abc), return HTTP 400 Bad Request with error.code: 'INVALID_PARAM'.
 * 3. Parse 'region_id' query parameter: optional, defaults to demo region from manifest.
 * 4. Call getLiveOffer(variantId, quantity, region_id).
 * 5. If variant not found: return HTTP 404 with error.code: 'NOT_FOUND'.
 * 6. Add mandatory headers: 'X-Request-Id' and 'Cache-Control: no-store'.
 * 7. Return JSON response with status 200.
 * 8. Handle errors uniformly: { error: { code, message }, request_id }.
 */
export const GET = async (
  req: MedusaRequest,
  res: MedusaResponse
): Promise<any> => {
  // 1. Authenticate with verifyMuseAuth(req) - HTTP 401 if missing/invalid Bearer token
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

  // 6. Ensure mandatory response headers (X-Request-Id, Cache-Control: no-store)
  applySecurityHeaders(res, requestId)

  // Extract and validate variantId parameter
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

  // 2. Parse 'quantity' query parameter: default 1, must be integer between 1 and 20.
  // If invalid (e.g. quantity=0, quantity=99, quantity=abc), return HTTP 400 Bad Request with error.code: 'INVALID_PARAM'.
  const rawQuantity = req.query?.quantity
  let quantity = 1

  if (rawQuantity !== undefined && rawQuantity !== null && rawQuantity !== "") {
    const qtyStr = String(rawQuantity).trim()
    const parsed = Number(qtyStr)

    if (
      !/^-?\d+$/.test(qtyStr) ||
      !Number.isInteger(parsed) ||
      parsed < 1 ||
      parsed > 20
    ) {
      return formatErrorResponse(
        res,
        400,
        "INVALID_PARAM",
        `Query parameter 'quantity' must be an integer between 1 and 20 (received: ${qtyStr})`,
        requestId,
        { parameter: "quantity", received: rawQuantity, min: 1, max: 20 }
      )
    }

    quantity = parsed
  }

  // 3. Parse 'region_id' query parameter: optional, defaults to demo region from manifest.
  const rawRegionId = req.query?.region_id || (req.query as any)?.regionId
  let regionId = resolveDemoRegionId()

  if (rawRegionId !== undefined && rawRegionId !== null && String(rawRegionId).trim() !== "") {
    regionId = String(rawRegionId).trim()
  }

  // 4. Call getLiveOffer(variantId, quantity, region_id)
  try {
    const offer: LiveOfferResult = await getLiveOffer(variantId, quantity, regionId)

    if (!offer) {
      return formatErrorResponse(
        res,
        404,
        "NOT_FOUND",
        `Variant '${variantId}' not found or outside demo scope`,
        requestId
      )
    }

    // Ensure security headers are present on successful response
    applySecurityHeaders(res, requestId)

    const productBaseUrl = getProductBaseUrl()
    const productHandle = offer.product_handle || offer.sku?.toLowerCase() || ""
    const productUrl = offer.product_url || `${productBaseUrl}/us/products/${productHandle}`

    // 7. Return JSON response with status 200
    return res.status(200).json({
      ...offer,
      product_url: productUrl,
      request_id: requestId,
    })
  } catch (err: any) {
    // 5. If variant not found: return HTTP 404 with error.code: 'NOT_FOUND'.
    if (
      err?.code === "NOT_FOUND" ||
      err?.statusCode === 404 ||
      err?.status === 404 ||
      err?.name === "LiveOfferNotFoundError" ||
      isLiveOfferNotFoundError(err) ||
      /not found/i.test(err?.message || "")
    ) {
      return formatErrorResponse(
        res,
        404,
        "NOT_FOUND",
        err?.message || `Variant '${variantId}' not found or outside demo scope`,
        requestId
      )
    }

    // Handle any validation errors thrown downstream
    if (
      err?.code === "INVALID_PARAM" ||
      err?.code === "INVALID_QUANTITY" ||
      err?.statusCode === 400 ||
      err?.status === 400 ||
      err?.name === "LiveOfferValidationError" ||
      isLiveOfferValidationError(err)
    ) {
      return formatErrorResponse(
        res,
        400,
        "INVALID_PARAM",
        err?.message || "Invalid parameter provided",
        requestId
      )
    }

    // 8. Handle errors uniformly: { error: { code, message }, request_id }.
    return formatErrorResponse(
      res,
      500,
      "INTERNAL_SERVER_ERROR",
      err?.message || "An unexpected error occurred while calculating product offer",
      requestId
    )
  }
}
