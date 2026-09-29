import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import {
  withMuseAuth,
  formatErrorResponse,
  applySecurityHeaders,
  museLogger,
  type MuseRouteContext,
} from "../../../../../lib/muse/auth-guard"
import {
  validateEvaluatePayload,
  MuseValidationError,
} from "../../../../../lib/muse/schema-validator"
import {
  getTechnicalProfile,
  getTechnicalFacts,
  getTechnicalSources,
} from "../../../../../lib/muse/db"
import {
  evaluateRequirements,
  type EvaluationResult,
} from "../../../../../lib/muse/evaluator"

/**
 * Tell Medusa to disable default session/store authentication.
 * Route security is fully enforced via `withMuseAuth` (Bearer token guard).
 */
export const AUTHENTICATE = false

/**
 * POST /api/muse/v1/evaluate
 *
 * Technical evaluation route for Meta Muse Agent Commerce.
 *
 * Requirements:
 * - Requires Bearer authentication with `auth-guard`. If fails -> HTTP 401.
 * - Response headers: `Cache-Control: no-store` and `X-Request-Id: <request_id>`.
 * - Validates body with `schema-validator`:
 *     - `variant_id` string mandatory.
 *     - `requirements` array of 1 to 10 elements.
 *     - closed vocabulary for `property`.
 *     - If validation fails -> responder HTTP 400:
 *       `{ "error": { "code": "INVALID_REQUEST", "message": "..." }, "request_id": "..." }`
 * - Verifies that `variant_id` belongs to the demonstration catalog. If non-existent or non-demo -> HTTP 404.
 * - Loads `technical_profile`, `technical_fact`, and `technical_source` from PostgreSQL for the variant.
 * - Executes evaluation with deterministic engine `evaluator.ts`.
 * - Responds HTTP 200 with:
 *     ```json
 *     {
 *       "variant_id": "...",
 *       "sku": "...",
 *       "overall_satisfied": boolean,
 *       "evaluations": [
 *         {
 *           "requirement_id": "r1",
 *           "property": "mounting",
 *           "operator": "equals",
 *           "satisfied": boolean,
 *           "reason": "...",
 *           "fact_display_value": "...",
 *           "source_evidence": {
 *             "source_id": "...",
 *             "source_revision": "...",
 *             "url": "...",
 *             "page": number,
 *             "section": "...",
 *             "excerpt": "..."
 *           }
 *         }
 *       ],
 *       "source_revision": "rev-2026.1",
 *       "evaluated_at": "<ISO-8601>",
 *       "request_id": "..."
 *     }
 *     ```
 * - Structured logging without Bearer tokens or PII.
 */
export const POST = withMuseAuth(
  async (
    req: MedusaRequest,
    res: MedusaResponse,
    context: MuseRouteContext
  ): Promise<any> => {
    const { requestId } = context

    // 1. Ensure required response headers are set
    applySecurityHeaders(res, requestId)

    // 2. Validate request body with schema-validator
    let validatedPayload: ReturnType<typeof validateEvaluatePayload>
    try {
      let rawBody = req.body
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

      validatedPayload = validateEvaluatePayload(rawBody)
    } catch (err: any) {
      if (
        err instanceof MuseValidationError ||
        err?.name === "MuseValidationError" ||
        err?.statusCode === 400
      ) {
        return formatErrorResponse(
          res,
          400,
          "INVALID_REQUEST",
          err.message || "Invalid request payload",
          requestId,
          err.details
        )
      }
      return formatErrorResponse(
        res,
        400,
        "INVALID_REQUEST",
        err?.message || "Invalid request payload",
        requestId
      )
    }

    const { variant_id, requirements } = validatedPayload

    // 3. Verify variant_id belongs to demo catalog.
    // If not found or not demo -> respond HTTP 404
    let profile
    try {
      profile = await getTechnicalProfile(variant_id)
    } catch (dbErr: any) {
      museLogger.error("Failed to query technical profile from database", dbErr, {
        requestId,
        variant_id,
      })
      return formatErrorResponse(
        res,
        500,
        "INTERNAL_SERVER_ERROR",
        "Failed to query database for technical profile",
        requestId
      )
    }

    if (!profile || !profile.demo) {
      return formatErrorResponse(
        res,
        404,
        "NOT_FOUND",
        `Variant '${variant_id}' not found or outside demo scope`,
        requestId
      )
    }

    // 4. Load technical facts and referenced sources from PostgreSQL
    let facts
    let sources
    try {
      facts = await getTechnicalFacts(profile.variant_id)
      const sourceIds: string[] = Array.from(
        new Set(
          facts
            .map((f) => f.source_id)
            .filter((id): id is string => typeof id === "string" && id.trim().length > 0)
        )
      )
      sources = sourceIds.length > 0 ? await getTechnicalSources(sourceIds as string[]) : []
    } catch (dbErr: any) {
      museLogger.error(
        "Failed to load technical facts or sources from database",
        dbErr,
        {
          requestId,
          variant_id: profile.variant_id,
        }
      )
      return formatErrorResponse(
        res,
        500,
        "INTERNAL_SERVER_ERROR",
        "Failed to query technical facts or sources",
        requestId
      )
    }

    // 5. Execute evaluation with deterministic evaluator engine
    let evaluationResult: EvaluationResult
    try {
      evaluationResult = evaluateRequirements(
        profile.variant_id,
        requirements,
        facts,
        sources,
        profile
      )
    } catch (evalErr: any) {
      museLogger.error("Evaluation engine failure", evalErr, {
        requestId,
        variant_id: profile.variant_id,
      })
      return formatErrorResponse(
        res,
        500,
        "INTERNAL_SERVER_ERROR",
        "Failed to execute requirement evaluation engine",
        requestId
      )
    }

    // 6. Structured log of successful evaluation (NO Bearer tokens, NO PII)
    museLogger.info("Evaluation completed successfully", {
      requestId,
      variantId: profile.variant_id,
      sku: profile.sku,
      overallSatisfied: evaluationResult.overall_satisfied,
      requirementsCount: requirements.length,
    })

    // 7. Respond HTTP 200 with the exact specification JSON format
    return res.status(200).json({
      variant_id: profile.variant_id,
      sku: profile.sku || "",
      overall_satisfied: evaluationResult.overall_satisfied,
      evaluations: evaluationResult.evaluations,
      source_revision: evaluationResult.source_revision || "rev-2026.1",
      evaluated_at: evaluationResult.evaluated_at,
      request_id: requestId,
    })
  }
)
