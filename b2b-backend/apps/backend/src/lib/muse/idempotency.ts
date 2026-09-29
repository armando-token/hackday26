import * as crypto from "crypto"

/**
 * Result of an idempotency verification check.
 */
export type IdempotencyCheckResult =
  | { status: "new" }
  | { status: "replay"; quote: any }
  | { status: "conflict" }

/**
 * Interface representing a database pool or client with a query method.
 */
export interface DbPoolLike {
  query: (queryText: string, values?: any[]) => Promise<any>
}

/**
 * Computes a SHA-256 hex digest for an idempotency key string.
 * Normalizes by trimming whitespace.
 *
 * @param key The client-provided idempotency key
 * @returns SHA-256 hex string (64 characters)
 */
export function computeIdempotencyHash(key: string): string {
  if (typeof key !== "string") {
    throw new TypeError("Idempotency key must be a string")
  }
  return crypto.createHash("sha256").update(key.trim()).digest("hex")
}

/**
 * Recursively canonicalizes an arbitrary JSON value:
 * - Object keys are sorted lexicographically.
 * - Array element order is preserved and elements are recursively canonicalized.
 * - Undefined, functions, and symbols in objects are omitted.
 * - Undefined in arrays becomes null.
 * - Dates are converted to ISO string.
 * - No extraneous whitespace.
 *
 * @param value Any JSON-serializable value
 * @returns Canonical JSON string
 */
export function canonicalizeJson(value: any): string {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value)
  }

  if (typeof value.toJSON === "function") {
    return canonicalizeJson(value.toJSON())
  }

  if (value instanceof Date) {
    return JSON.stringify(value.toISOString())
  }

  if (Array.isArray(value)) {
    const items = value.map((item) => {
      if (item === undefined || typeof item === "function" || typeof item === "symbol") {
        return "null"
      }
      return canonicalizeJson(item)
    })
    return `[${items.join(",")}]`
  }

  const keys = Object.keys(value).sort()
  const entries: string[] = []
  for (const key of keys) {
    const val = value[key]
    if (val === undefined || typeof val === "function" || typeof val === "symbol") {
      continue
    }
    entries.push(`${JSON.stringify(key)}:${canonicalizeJson(val)}`)
  }
  return `{${entries.join(",")}}`
}

/**
 * Computes a SHA-256 hex digest of the canonical JSON representation of a request payload.
 *
 * @param payload Request body dictionary / object
 * @returns SHA-256 hex string (64 characters)
 */
export function computeRequestBodyHash(payload: Record<string, any>): string {
  const canonical = canonicalizeJson(payload ?? {})
  return crypto.createHash("sha256").update(canonical, "utf8").digest("hex")
}

/**
 * Evaluates whether an incoming request with an optional idempotency key
 * is new, a valid replay of a previously processed quote, or a conflict (payload mismatch).
 *
 * Flow:
 * 1. If key is missing, empty, or not a string -> return { status: 'new' }
 * 2. Compute SHA-256 of idempotency key and canonical request payload.
 * 3. Query preliminary_quote where idempotency_key_hash = hash.
 * 4. If record found:
 *    - Compare request_body_hash with existing record.
 *    - If matches -> return { status: 'replay', quote: existingRecord }
 *    - If mismatch -> return { status: 'conflict' } (triggers HTTP 409 Conflict)
 * 5. If not found -> return { status: 'new' }
 *
 * @param dbPool PostgreSQL pool or client instance
 * @param key Optional idempotency key from request header
 * @param payload Incoming request payload
 * @returns Promise resolving to { status: 'new' } | { status: 'replay', quote: any } | { status: 'conflict' }
 */
export async function handleIdempotencyCheck(
  dbPool: DbPoolLike | any,
  key: string | null | undefined,
  payload: Record<string, any>
): Promise<IdempotencyCheckResult> {
  // If key is not present or blank, treat as a new un-keyed request
  if (!key || typeof key !== "string" || key.trim() === "") {
    return { status: "new" }
  }

  if (!dbPool || typeof dbPool.query !== "function") {
    throw new Error("A valid database pool or client with a query() method is required")
  }

  const idempotencyHash = computeIdempotencyHash(key)
  const requestBodyHash = computeRequestBodyHash(payload)

  const queryText = `
    SELECT *
    FROM preliminary_quote
    WHERE idempotency_key_hash = $1
    LIMIT 1
  `

  const result = await dbPool.query(queryText, [idempotencyHash])
  const existingRecord = Array.isArray(result?.rows)
    ? result.rows[0]
    : Array.isArray(result)
    ? result[0]
    : null

  if (!existingRecord) {
    return { status: "new" }
  }

  if (existingRecord.request_body_hash === requestBodyHash) {
    return { status: "replay", quote: existingRecord }
  }

  return { status: "conflict" }
}
