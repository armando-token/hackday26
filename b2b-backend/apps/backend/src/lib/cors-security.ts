/**
 * CORS Security Policy and Origin Validator
 * 
 * Enforces explicit allowed origins for local development and Agent Commerce (Muse)
 * while strictly prohibiting apex domain (controlnautas.com) and production URLs.
 */

export const ALLOWED_CORS_ORIGINS = [
  "https://data.controlnautas.com",
  "https://www.data.controlnautas.com",
  "http://localhost:8000",
  "http://127.0.0.1:8000",
  "http://localhost:9000",
  "http://127.0.0.1:9000",
  "http://52.20.66.203:8000",
  "http://52.20.66.203:9000",
  "http://localhost:5173",
  "http://localhost:3000",
] as const

export const FORBIDDEN_CORS_ORIGINS = [
  "https://controlnautas.com",
  "http://controlnautas.com",
  "https://www.controlnautas.com",
  "http://www.controlnautas.com",
] as const

const ALLOWED_SET = new Set<string>(ALLOWED_CORS_ORIGINS)

export function isForbiddenOrigin(origin?: string): boolean {
  if (!origin) return false
  const trimmed = origin.trim().replace(/\/+$/, "")
  try {
    const url = new URL(trimmed.startsWith("http") ? trimmed : `http://${trimmed}`)
    const host = url.hostname.toLowerCase()
    return host === "controlnautas.com" || host === "www.controlnautas.com"
  } catch {
    const lower = trimmed.toLowerCase()
    return (
      lower === "https://controlnautas.com" ||
      lower === "http://controlnautas.com" ||
      lower === "https://www.controlnautas.com" ||
      lower === "http://www.controlnautas.com" ||
      lower === "controlnautas.com" ||
      lower === "www.controlnautas.com"
    )
  }
}

export function isOriginAllowed(origin?: string): boolean {
  if (!origin) return false
  if (isForbiddenOrigin(origin)) return false
  const trimmed = origin.trim().replace(/\/+$/, "")
  return ALLOWED_SET.has(trimmed)
}
