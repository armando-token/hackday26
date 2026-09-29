import { timingSafeEqual } from "crypto"

/**
 * Muse Authentication Configuration
 */
export interface MuseAuthConfig {
  /** High-entropy secret token for authenticating Agent Commerce requests */
  readonly apiToken: string
  /** Masked token representation (e.g. mus_...a1b2) for safe logging */
  readonly maskedToken: string
}

/**
 * Mask an API token to prevent leakage in logs or diagnostic reports.
 * Retains only the first 4 and last 4 characters (e.g., mus_...a1b2).
 */
export function maskToken(token: string): string {
  if (!token || typeof token !== "string") {
    return "****"
  }
  const trimmed = token.trim()
  if (trimmed.length <= 8) {
    return "****"
  }
  return `${trimmed.slice(0, 4)}...${trimmed.slice(-4)}`
}

/**
 * Validates that the provided token is non-empty and well-formed.
 * Throws an explicit error if missing or invalid.
 */
export function validateMuseToken(token?: string | null): asserts token is string {
  if (!token || typeof token !== "string" || token.trim().length === 0) {
    throw new Error(
      "[Muse Auth] MUSE_API_TOKEN is missing or empty. Please define it in your environment / .env file."
    )
  }
}

/**
 * Loads and validates Muse authentication configuration from process.env.
 * Throws if MUSE_API_TOKEN is not configured.
 */
export function getMuseAuthConfig(): MuseAuthConfig {
  const token = process.env.MUSE_API_TOKEN
  validateMuseToken(token)

  return {
    apiToken: token.trim(),
    maskedToken: maskToken(token),
  }
}

/**
 * Constant-time token verification to mitigate timing attacks.
 * Returns true if providedToken matches the configured MUSE_API_TOKEN.
 */
export function verifyMuseToken(providedToken?: string | null): boolean {
  if (!providedToken || typeof providedToken !== "string") {
    return false
  }

  let expectedToken: string
  try {
    expectedToken = getMuseAuthConfig().apiToken
  } catch {
    return false
  }

  const trimmedProvided = providedToken.trim()
  const providedBuffer = Buffer.from(trimmedProvided, "utf8")
  const expectedBuffer = Buffer.from(expectedToken, "utf8")

  if (providedBuffer.length !== expectedBuffer.length) {
    return false
  }

  return timingSafeEqual(providedBuffer, expectedBuffer)
}

/**
 * Extracts a token from an Authorization header ('Bearer <token>')
 * or returns raw token string if already stripped.
 */
export function extractBearerToken(headerValue?: string | null): string | null {
  if (!headerValue || typeof headerValue !== "string") {
    return null
  }
  const trimmed = headerValue.trim()
  const match = trimmed.match(/^Bearer\s+(.+)$/i)
  if (match && match[1]) {
    return match[1].trim()
  }
  return trimmed
}

/**
 * Convenience export providing lazy access to Muse authentication config.
 * Properties evaluate on access to ensure runtime environment variables are loaded.
 */
export const museConfig = {
  get apiToken(): string {
    return getMuseAuthConfig().apiToken
  },
  get maskedToken(): string {
    return getMuseAuthConfig().maskedToken
  },
} as const
