import {
  defineMiddlewares,
  validateAndTransformBody,
  MedusaRequest,
  MedusaResponse,
  MedusaNextFunction,
} from "@medusajs/framework/http"
import fs from "fs"
import path from "path"
// @ts-ignore
import { verifySolution } from "altcha-lib/v1"
import { AdminUpsertPimSchema } from "./admin/products/[id]/pim/validators"

const storefrontPublic = path.resolve(process.cwd(), "../../b2b-storefront/public")
const staticRoot = path.resolve(process.cwd(), "static")

const ALTCHA_HMAC_KEY =
  process.env.ALTCHA_HMAC_KEY ||
  "controlnautas-altcha-b2b-secret-key-2026-peru-industrial"

/** True solo si resolvedPath está estrictamente dentro de rootDir (anti path-traversal). */
function isPathInsideRoot(rootDir: string, resolvedPath: string): boolean {
  const root = path.resolve(rootDir)
  const target = path.resolve(resolvedPath)
  return target === root || target.startsWith(root + path.sep)
}

function safeDecodePath(urlPath: string): string | null {
  try {
    const decoded = decodeURIComponent(urlPath.split("?")[0])
    if (decoded.includes("\0")) return null
    return decoded
  } catch {
    return null
  }
}

const staticMediaMiddleware = (req: MedusaRequest, res: MedusaResponse, next: MedusaNextFunction) => {
  const rawUrl = req.originalUrl || req.url || ""
  const urlPath = safeDecodePath(rawUrl)
  if (!urlPath) {
    return next()
  }

  if (urlPath.startsWith("/static/")) {
    const relativePath = urlPath.slice("/static/".length)
    if (!relativePath || relativePath.includes("..")) {
      return next()
    }
    const filePath = path.resolve(staticRoot, relativePath)
    if (
      isPathInsideRoot(staticRoot, filePath) &&
      fs.existsSync(filePath) &&
      fs.statSync(filePath).isFile()
    ) {
      return (res as any).sendFile(filePath, {
        maxAge: 2_592_000_000, // 30 días en ms
        immutable: false,
      })
    }
    return next()
  }

  if (urlPath.startsWith("/cn-media/") || urlPath.startsWith("/images/")) {
    // No usar path.join(root, "/cn-media/...") — un segmento absoluto descarta el root.
    const relativePath = urlPath.replace(/^\/+/, "")
    if (!relativePath || relativePath.includes("..")) {
      return next()
    }
    const filePath = path.resolve(storefrontPublic, relativePath)
    if (
      isPathInsideRoot(storefrontPublic, filePath) &&
      fs.existsSync(filePath) &&
      fs.statSync(filePath).isFile()
    ) {
      return (res as any).sendFile(filePath, {
        maxAge: 604_800_000, // 7 días
        immutable: true,
      })
    }
    return next()
  }

  return next()
}

const altchaAuthMiddleware = async (req: MedusaRequest, res: MedusaResponse, next: MedusaNextFunction) => {
  const rawUrl = req.originalUrl || req.url || ""
  
  // Intercept Admin auth login endpoint (POST /auth/user/emailpass)
  if (req.method === "POST" && rawUrl.includes("/auth/user/emailpass")) {
    const payload =
      (req.headers["x-altcha-payload"] as string) ||
      (req.body as any)?.altcha ||
      (req.body as any)?.altcha_payload

    if (!payload) {
      return res.status(400).json({
        message: "Acceso denegado: Verificación de seguridad anti-bot (ALTCHA PoW) ausente.",
        code: "ALTCHA_REQUIRED",
      })
    }

    try {
      const isValid = await verifySolution(payload, ALTCHA_HMAC_KEY)
      if (!isValid) {
        return res.status(400).json({
          message: "Acceso denegado: Verificación anti-bot inválida o expirada.",
          code: "ALTCHA_INVALID",
        })
      }
    } catch (err) {
      return res.status(400).json({
        message: "Error procesando verificación de seguridad.",
        code: "ALTCHA_ERROR",
      })
    }
  }

  return next()
}

const ALLOWED_CORS_ORIGINS = new Set([
  "http://localhost:8000",
  "http://127.0.0.1:8000",
  "http://52.20.66.203:8000",
  "http://localhost:9000",
  "http://127.0.0.1:9000",
  "http://52.20.66.203:9000",
  "http://localhost:5173",
  "http://localhost:3000",
])

function isOriginAllowed(origin?: string): boolean {
  if (!origin) return false
  const trimmed = origin.trim().replace(/\/+$/, "")
  if (trimmed.toLowerCase().includes("controlnautas.com")) {
    return false
  }
  return ALLOWED_CORS_ORIGINS.has(trimmed)
}

const corsSecurityMiddleware = (
  req: MedusaRequest,
  res: MedusaResponse,
  next: MedusaNextFunction
) => {
  const origin = req.headers.origin as string | undefined

  if (origin && isOriginAllowed(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin)
    res.setHeader("Access-Control-Allow-Credentials", "true")
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, HEAD, POST, PUT, PATCH, DELETE, OPTIONS"
    )
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Authorization, Content-Type, X-Request-Id, x-request-id, x-altcha-payload, x-publishable-api-key"
    )
    res.setHeader(
      "Access-Control-Expose-Headers",
      "X-Request-Id, x-request-id, Content-Length, Content-Type"
    )
  }

  // Ensure request ID is attached to response if present
  const reqId = (req as any).requestId || req.headers["x-request-id"]
  if (reqId && typeof reqId === "string") {
    res.setHeader("X-Request-Id", reqId)
  }

  // Preflight handling for custom routes matching /* that aren't consumed by internal cors
  if (req.method === "OPTIONS") {
    if (origin && !isOriginAllowed(origin)) {
      return res.status(403).end()
    }
    return res.status(204).end()
  }

  return next()
}

export default defineMiddlewares({
  routes: [
    {
      matcher: "/*",
      middlewares: [corsSecurityMiddleware, staticMediaMiddleware, altchaAuthMiddleware],
    },
    // Validacion del upsert de PIM (plan, seccion 9.1). El resultado queda en
    // req.validatedBody, ya saneado y sin claves desconocidas.
    {
      matcher: "/admin/products/:id/pim",
      method: ["POST", "PUT"],
      middlewares: [validateAndTransformBody(AdminUpsertPimSchema)],
    },
  ],
})
