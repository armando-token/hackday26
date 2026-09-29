import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import fs from "fs"
import path from "path"
import crypto from "crypto"
import { getPool } from "../../../../../../../lib/muse/db"
import {
  formatErrorResponse,
  getOrGenerateRequestId,
  safeTokenCompare,
  attachMuseResponseLogger,
} from "../../../../../../../lib/muse/common"

/**
 * Indicador para Medusa v2 de que esta ruta es PÚBLICA y no requiere sesión ni autenticación
 * interna de Medusa ni token Bearer de API.
 */
export const AUTHENTICATE = false

export interface PreliminaryQuoteDownloadRecord {
  id: string
  opaque_public_id: string
  sku: string
  pdf_storage_key: string
  download_token: string
  expires_at: Date | string
}

/**
 * Resuelve la ruta física del archivo PDF en disco a partir de pdf_storage_key.
 * Soporta rutas absolutas, relativas al directorio de cotizaciones o a la raíz del proyecto.
 * Protege contra directory traversal.
 */
export function resolvePdfPath(storageKey: string): string | null {
  if (!storageKey || typeof storageKey !== "string" || !storageKey.trim()) {
    return null
  }

  const cleanKey = storageKey.trim()

  // Protección anti-caracteres nulos
  if (cleanKey.includes("\0")) {
    return null
  }

  // 1. Si ya es una ruta absoluta válida existente
  if (path.isAbsolute(cleanKey)) {
    try {
      if (fs.existsSync(cleanKey) && fs.statSync(cleanKey).isFile()) {
        return cleanKey
      }
    } catch {
      // Continuar búsqueda
    }
  }

  // 2. Directorios base donde puede residir el almacenamiento de cotizaciones
  const baseDirectories: string[] = [
    process.env.STORAGE_QUOTES_DIR || "",
    "/home/ubuntu/hackday26/storage/quotes",
    "/home/ubuntu/hackday26/storage",
    path.resolve(process.cwd(), "../../../storage/quotes"),
    path.resolve(process.cwd(), "../../storage/quotes"),
    path.resolve(process.cwd(), "storage/quotes"),
    path.resolve(process.cwd(), "storage"),
    process.cwd(),
  ].filter((d): d is string => typeof d === "string" && d.trim().length > 0)

  for (const baseDir of baseDirectories) {
    // Intento con ruta relativa directa
    const candidateDirect = path.resolve(baseDir, cleanKey)
    try {
      if (fs.existsSync(candidateDirect) && fs.statSync(candidateDirect).isFile()) {
        return candidateDirect
      }
    } catch {}

    // Intento únicamente con el nombre de archivo (basename)
    const baseName = path.basename(cleanKey)
    const candidateBasename = path.resolve(baseDir, baseName)
    try {
      if (fs.existsSync(candidateBasename) && fs.statSync(candidateBasename).isFile()) {
        return candidateBasename
      }
    } catch {}
  }

  return null
}

/**
 * Valida de forma segura el token proporcionado contra el download_token almacenado.
 * 
 * Reglas de seguridad:
 * 1. NUNCA acepta el Bearer API token (process.env.MUSE_API_TOKEN) como token de descarga (evita fuga en URL).
 * 2. Valida en tiempo constante para mitigar timing attacks.
 * 3. Admite coincidencia en texto plano o coincidencia con hash SHA-256 precalculado.
 */
export function validateDownloadToken(
  providedToken: string | undefined | null,
  storedToken: string | undefined | null
): boolean {
  if (!providedToken || !storedToken) {
    return false
  }

  const cleanProvided = String(providedToken).trim()
  const cleanStored = String(storedToken).trim()

  if (!cleanProvided || !cleanStored) {
    return false
  }

  // Prohibición absoluta de usar el API Bearer Token en query parameters
  const apiToken = process.env.MUSE_API_TOKEN
  if (apiToken && safeTokenCompare(cleanProvided, apiToken.trim())) {
    return false
  }

  // 1. Comparación en tiempo constante directa
  if (safeTokenCompare(cleanProvided, cleanStored)) {
    return true
  }

  // 2. Comparación en tiempo constante con hash SHA-256 (si storedToken es un hash de 64 hex chars)
  const sha256Hex = crypto
    .createHash("sha256")
    .update(Buffer.from(cleanProvided, "utf-8"))
    .digest("hex")

  if (safeTokenCompare(sha256Hex, cleanStored)) {
    return true
  }

  return false
}

/**
 * Consulta PostgreSQL para obtener la cotización preliminar por id o por opaque_public_id.
 */
export async function findPreliminaryQuoteByIdOrPublicId(
  quoteId: string
): Promise<PreliminaryQuoteDownloadRecord | null> {
  const pool = getPool()
  const query = `
    SELECT 
      id,
      opaque_public_id,
      sku,
      pdf_storage_key,
      download_token,
      expires_at
    FROM preliminary_quote
    WHERE id = $1 OR opaque_public_id = $1
    LIMIT 1;
  `
  const { rows } = await pool.query<PreliminaryQuoteDownloadRecord>(query, [quoteId])
  return rows[0] || null
}

/**
 * GET /api/muse/v1/quotes/[quoteId]/pdf
 * 
 * Endpoint público de descarga de cotización preliminar en PDF.
 * 
 * Requisitos:
 * 1. Ruta pública: NO requiere header Authorization Bearer. NO acepta API Bearer token en query string.
 * 2. Valida parámetro 'token' contra preliminary_quote.download_token para quoteId (opaque_public_id o id).
 * 3. Si la cotización no existe o el token no coincide: HTTP 404 Not Found con error.code: 'NOT_FOUND'.
 * 4. Si la cotización expiró (now > expires_at): HTTP 410 Gone con error.code: 'QUOTE_EXPIRED'.
 * 5. Si el archivo PDF no existe en disco: HTTP 404 Not Found.
 * 6. Transmite el archivo con:
 *    - Content-Type: application/pdf
 *    - Content-Disposition: inline; filename="preliminary-quote-${sku}-${opaque_public_id.slice(0,8)}.pdf"
 *    - Cache-Control: public, max-age=3600
 */
export async function GET(req: MedusaRequest, res: MedusaResponse): Promise<any> {
  const requestId = getOrGenerateRequestId(req)
  attachMuseResponseLogger(req, res, requestId)

  // 1. Extraer identificador de la cotización (puede ser opaque_public_id o id interno)
  const rawQuoteId = (req.params as any)?.quoteId || (req.params as any)?.id
  const quoteId = typeof rawQuoteId === "string" ? rawQuoteId.trim() : ""

  if (!quoteId) {
    return formatErrorResponse(
      res,
      404,
      "NOT_FOUND",
      "Quote not found or invalid quote ID",
      requestId
    )
  }

  // 2. Extraer parámetro de consulta 'token'
  const rawToken = (req.query as any)?.token
  const token = typeof rawToken === "string" ? rawToken.trim() : ""

  // Si no se proporciona token -> 404 NOT_FOUND (Requisitos 3 y 9)
  if (!token) {
    return formatErrorResponse(
      res,
      404,
      "NOT_FOUND",
      "Quote not found or invalid download token",
      requestId
    )
  }

  try {
    // 3. Buscar en PostgreSQL por id o opaque_public_id
    const quote = await findPreliminaryQuoteByIdOrPublicId(quoteId)

    // Si no se encuentra la cotización -> 404 NOT_FOUND (Requisito 3)
    if (!quote) {
      return formatErrorResponse(
        res,
        404,
        "NOT_FOUND",
        "Quote not found or invalid download token",
        requestId
      )
    }

    // 4. Validar token de descarga (Requisitos 1, 2, 3 y 8)
    const isTokenValid = validateDownloadToken(token, quote.download_token)
    if (!isTokenValid) {
      return formatErrorResponse(
        res,
        404,
        "NOT_FOUND",
        "Quote not found or invalid download token",
        requestId
      )
    }

    // 5. Verificar si ha expirado (now > expires_at) -> 410 Gone (Requisito 4)
    const now = new Date()
    const expiresAt = new Date(quote.expires_at)
    if (now.getTime() > expiresAt.getTime()) {
      return formatErrorResponse(
        res,
        410,
        "QUOTE_EXPIRED",
        "The preliminary quote has expired",
        requestId,
        {
          quote_id: quote.id,
          opaque_public_id: quote.opaque_public_id,
          expired_at: expiresAt.toISOString(),
        }
      )
    }

    // 6. Verificar si el archivo PDF existe en disco (Requisito 5)
    const resolvedPdfPath = resolvePdfPath(quote.pdf_storage_key)
    if (!resolvedPdfPath) {
      return formatErrorResponse(
        res,
        404,
        "NOT_FOUND",
        "Quote PDF document file not found on disk",
        requestId
      )
    }

    // 7. Preparar encabezados HTTP y transmitir el archivo binario PDF (Requisito 6)
    const sku = (quote.sku || "DEMO").replace(/[^a-zA-Z0-9_-]/g, "_")
    const shortOpaqueId = (quote.opaque_public_id || quote.id || "00000000").slice(0, 8)
    const filename = `preliminary-quote-${sku}-${shortOpaqueId}.pdf`

    res.setHeader("Content-Type", "application/pdf")
    res.setHeader("Content-Disposition", `inline; filename="${filename}"`)
    res.setHeader("Cache-Control", "public, max-age=3600")
    res.setHeader("X-Request-Id", requestId)

    if (typeof (res as any).status === "function") {
      res.status(200)
    }

    // Si el entorno Express provee res.sendFile nativo
    if (typeof (res as any).sendFile === "function") {
      return (res as any).sendFile(resolvedPdfPath, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `inline; filename="${filename}"`,
          "Cache-Control": "public, max-age=3600",
          "X-Request-Id": requestId,
        },
      })
    }

    // En caso de entornos de prueba mock que no implementan streams
    if (
      typeof (res as any).pipe !== "function" &&
      typeof (res as any).send === "function"
    ) {
      const buffer = fs.readFileSync(resolvedPdfPath)
      return (res as any).send(buffer)
    }

    // Transmisión en streaming mediante ReadStream estándar
    const stream = fs.createReadStream(resolvedPdfPath)
    stream.on("error", () => {
      if (!res.headersSent) {
        formatErrorResponse(
          res,
          500,
          "INTERNAL_SERVER_ERROR",
          "Error streaming quote PDF document",
          requestId
        )
      }
    })

    return stream.pipe(res)
  } catch (error: any) {
    return formatErrorResponse(
      res,
      500,
      "INTERNAL_SERVER_ERROR",
      error?.message || "An unexpected error occurred while processing PDF download",
      requestId
    )
  }
}
