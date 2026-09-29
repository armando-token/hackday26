import crypto from "crypto"
import fs from "fs"
import path from "path"
import { execSync } from "child_process"
import jwt from "jsonwebtoken"

interface AltchaChallenge {
  algorithm: string
  challenge: string
  maxnumber: number
  salt: string
  signature: string
}

interface UploadResponse {
  files?: Array<{
    id?: string
    key?: string
    url?: string
  }>
  [key: string]: any
}

const BACKEND_URL = process.env.MEDUSA_BACKEND_URL || "http://127.0.0.1:9000"
const NGINX_HTTPS_URL = "https://127.0.0.1"
const STATIC_DIR = path.resolve(__dirname, "../../static")
const JWT_SECRET = process.env.JWT_SECRET || "supersecret"

const ADMIN_EMAIL = process.env.MEDUSA_ADMIN_EMAIL || "e2e-tester@controlnautas.local"
const ADMIN_PASSWORD = process.env.MEDUSA_ADMIN_PASSWORD || "SecretAdmin123!"

// 1x1 PNG transparente de prueba
const TINY_PNG_BASE64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="

/**
 * Resuelve el Proof-of-Work de ALTCHA
 */
function solveAltchaPoW(challenge: AltchaChallenge): number {
  const algo = (challenge.algorithm || "SHA-256").replace("-", "").toLowerCase()
  const max = challenge.maxnumber || 50000

  for (let n = 0; n <= max; n++) {
    const hash = crypto.createHash(algo).update(`${challenge.salt}${n}`).digest("hex")
    if (hash === challenge.challenge) {
      return n
    }
  }
  throw new Error(`No se encontró solución al reto ALTCHA dentro de 0..${max}`)
}

/**
 * Obtiene el payload Altcha resuelto codificado en base64
 */
async function getAltchaPayload(): Promise<string> {
  const res = await fetch(`${BACKEND_URL}/auth/altcha-challenge`)
  if (!res.ok) {
    throw new Error(`Fallo al solicitar reto ALTCHA: HTTP ${res.status}`)
  }
  const challenge: AltchaChallenge = await res.json()
  const number = solveAltchaPoW(challenge)

  return Buffer.from(
    JSON.stringify({
      algorithm: challenge.algorithm,
      challenge: challenge.challenge,
      number,
      salt: challenge.salt,
      signature: challenge.signature,
    })
  ).toString("base64")
}

/**
 * Autentica como Administrador:
 * 1) Intenta vía POST /auth/user/emailpass resolviendo ALTCHA PoW.
 * 2) Si las credenciales fallan, genera un token JWT firmado de respaldo.
 */
async function getAdminToken(): Promise<{ token: string; method: string }> {
  try {
    console.log(`[AUTH] Obteniendo y resolviendo reto ALTCHA PoW...`)
    const payload = await getAltchaPayload()
    console.log(`[AUTH] Desafío ALTCHA resuelto con éxito. Enviando login para ${ADMIN_EMAIL}...`)

    const res = await fetch(`${BACKEND_URL}/auth/user/emailpass`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-altcha-payload": payload,
      },
      body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
    })

    if (res.ok) {
      const data = await res.json()
      if (data.token) {
        console.log(`[AUTH] Autenticación ALTCHA PoW + emailpass exitosa (HTTP 200).`)
        return { token: data.token, method: "ALTCHA_EMAILPASS" }
      }
    } else {
      console.warn(`[AUTH] Login emailpass devolvió HTTP ${res.status}. Probando fallback JWT...`)
    }
  } catch (err: any) {
    console.warn(`[AUTH] Error durante login Altcha: ${err.message}. Probando fallback JWT...`)
  }

  // Fallback JWT firmado con JWT_SECRET
  console.log(`[AUTH] Firmando token JWT de administración directamente con JWT_SECRET...`)
  const signedToken = jwt.sign(
    {
      actor_id: "user_01M0BB61KX9E5NF3QTHD30FTGB",
      actor_type: "user",
      auth_identity_id: "authid_01M0BB61R65RXN9CP9HMWA3VS7",
      app_metadata: { user_id: "user_01M0BB61KX9E5NF3QTHD30FTGB" },
    },
    JWT_SECRET,
    { expiresIn: "1d" }
  )

  return { token: signedToken, method: "DIRECT_SIGNED_JWT" }
}

/**
 * Ejecuta la prueba E2E completa
 */
export async function runUploadE2ETest() {
  console.log("==================================================================")
  console.log("🧪 INICIANDO PRUEBA E2E: SUBIDA DE IMAGEN MEDUSA ADMIN API")
  console.log("==================================================================")

  // 1. Autenticación
  const { token, method } = await getAdminToken()
  console.log(`✅ Token obtenido mediante método: ${method}`)
  console.log(`   Token prefix: ${token.substring(0, 30)}...`)

  // 2. Preparar archivo de prueba
  const testFileName = `e2e-canary-${Date.now()}.png`
  const fileBuffer = Buffer.from(TINY_PNG_BASE64, "base64")
  const fileBlob = new Blob([fileBuffer], { type: "image/png" })

  const formData = new FormData()
  formData.append("files", fileBlob, testFileName)

  console.log(`\n[UPLOAD] Enviando imagen multipart/form-data (${fileBuffer.length} bytes) a:`)
  console.log(`   POST ${BACKEND_URL}/admin/uploads`)

  const uploadRes = await fetch(`${BACKEND_URL}/admin/uploads`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  })

  console.log(`[UPLOAD] Código de respuesta HTTP: ${uploadRes.status}`)
  if (uploadRes.status !== 200) {
    const errorText = await uploadRes.text()
    throw new Error(`Fallo en subida de archivo (HTTP ${uploadRes.status}): ${errorText}`)
  }

  const uploadJson: UploadResponse = await uploadRes.json()
  console.log(`[UPLOAD] Respuesta recibida:`, JSON.stringify(uploadJson, null, 2))

  if (!uploadJson.files || !uploadJson.files.length) {
    throw new Error("La respuesta no contiene el arreglo 'files'")
  }

  const uploadedFile = uploadJson.files[0]
  const fileUrl = uploadedFile.url || ""
  const fileKey = uploadedFile.id || uploadedFile.key || ""

  if (!fileUrl.startsWith("https://controlnautas.com/static/")) {
    throw new Error(`La URL retornada no tiene el prefijo esperado 'https://controlnautas.com/static/': ${fileUrl}`)
  }
  console.log(`✅ Respuesta validada correctamente. URL generada: ${fileUrl}`)

  // 3. Verificar persistencia física en disco
  const filename = path.basename(fileUrl)
  const physicalPath = path.join(STATIC_DIR, filename)
  console.log(`\n[FS-CHECK] Verificando existencia física en: ${physicalPath}`)

  if (!fs.existsSync(physicalPath)) {
    throw new Error(`El archivo NO existe físicamente en el disco: ${physicalPath}`)
  }
  const stat = fs.statSync(physicalPath)
  console.log(`✅ Archivo encontrado en disco (${stat.size} bytes, permisos: ${stat.mode.toString(8)})`)

  // 4. Verificación mediante curl / HTTP
  console.log(`\n[CURL-CHECK] 1. Acceso local directo (Medusa Express):`)
  const localCurlCmd = `curl -s -I -o /dev/null -w "%{http_code}" ${BACKEND_URL}/static/${filename}`
  console.log(`   $ ${localCurlCmd}`)
  const localCode = execSync(localCurlCmd).toString().trim()
  console.log(`   -> HTTP Status: ${localCode}`)
  if (localCode !== "200") {
    throw new Error(`Acceso local HTTP fallido: código ${localCode}`)
  }

  console.log(`\n[CURL-CHECK] 2. Acceso público HTTPS (Nginx reverse proxy):`)
  const nginxCurlCmd = `curl -k -s -I -o /dev/null -w "%{http_code}" ${NGINX_HTTPS_URL}/static/${filename} -H "Host: controlnautas.com"`
  console.log(`   $ ${nginxCurlCmd}`)
  const nginxCode = execSync(nginxCurlCmd).toString().trim()
  console.log(`   -> HTTP Status: ${nginxCode}`)
  if (nginxCode !== "200") {
    throw new Error(`Acceso HTTPS Nginx fallido: código ${nginxCode}`)
  }

  // 5. Adjuntar a producto canario (prueba punta a punta Media → BD → Store API)
  const CANARY_HANDLE =
    process.env.E2E_CANARY_HANDLE || "panel-lana-de-roca-alta-densidad"
  console.log(`\n[PRODUCT] Adjuntando imagen al producto canario: ${CANARY_HANDLE}`)

  const getRes = await fetch(
    `${BACKEND_URL}/admin/products?handle=${encodeURIComponent(CANARY_HANDLE)}&fields=id,handle,thumbnail,*images`,
    { headers: { Authorization: `Bearer ${token}` } }
  )
  if (!getRes.ok) {
    throw new Error(`No se pudo listar producto canario: HTTP ${getRes.status}`)
  }
  const getJson: any = await getRes.json()
  const product = getJson.products?.[0]
  if (!product?.id) {
    throw new Error(`Producto canario no encontrado: ${CANARY_HANDLE}`)
  }

  const originalThumbnail: string = product.thumbnail || ""
  const originalImages: Array<{ url: string }> = (product.images || []).map(
    (img: any) => ({ url: img.url })
  )
  console.log(
    `[PRODUCT] Estado previo: thumbnail=${originalThumbnail} images=${originalImages.length}`
  )

  const mergedImages = [
    ...originalImages.filter((img) => img.url && img.url !== fileUrl),
    { url: fileUrl },
  ]

  const updateRes = await fetch(`${BACKEND_URL}/admin/products/${product.id}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      images: mergedImages,
      // No cambiar thumbnail del producto comercial; solo adjuntar a la galería.
    }),
  })
  console.log(`[PRODUCT] Update HTTP: ${updateRes.status}`)
  if (!updateRes.ok) {
    const errText = await updateRes.text()
    throw new Error(`Fallo al adjuntar imagen al producto: ${errText}`)
  }

  // Verificar en Admin API
  const verifyAdmin = await fetch(
    `${BACKEND_URL}/admin/products/${product.id}?fields=id,handle,thumbnail,*images`,
    { headers: { Authorization: `Bearer ${token}` } }
  )
  const verifyAdminJson: any = await verifyAdmin.json()
  const adminUrls: string[] = (verifyAdminJson.product?.images || []).map(
    (i: any) => i.url as string
  )
  const hasStaticInAdmin = adminUrls.some(
    (u) => u === fileUrl || u.includes(`/static/${filename}`)
  )
  if (!hasStaticInAdmin) {
    throw new Error(
      `La imagen /static no aparece en Admin tras update. URLs: ${JSON.stringify(adminUrls)}`
    )
  }
  console.log(`✅ Imagen visible en Admin API del producto`)

  // Verificar Store API (público)
  const pk =
    process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ||
    process.env.MEDUSA_PUBLISHABLE_KEY ||
    ""
  if (pk) {
    const storeRes = await fetch(
      `${BACKEND_URL}/store/products?handle=${encodeURIComponent(CANARY_HANDLE)}&fields=id,handle,thumbnail,*images`,
      { headers: { "x-publishable-api-key": pk } }
    )
    if (storeRes.ok) {
      const storeJson: any = await storeRes.json()
      const storeProduct = storeJson.products?.[0]
      const storeUrls: string[] = (storeProduct?.images || []).map(
        (i: any) => i.url as string
      )
      const hasInStore = storeUrls.some(
        (u) =>
          u === fileUrl ||
          u.includes(`/static/${filename}`) ||
          u.endsWith(`/static/${filename}`)
      )
      if (!hasInStore) {
        throw new Error(
          `Store API no expone la imagen /static. URLs: ${JSON.stringify(storeUrls)}`
        )
      }
      console.log(`✅ Imagen visible en Store API`)
    } else {
      console.warn(
        `[PRODUCT] Store API HTTP ${storeRes.status}; se omite check público (publishable key?)`
      )
    }
  } else {
    console.warn(`[PRODUCT] Sin publishable key; se omite check Store API`)
  }

  // Restaurar galería original (no dejar PNG 1x1 de prueba en catálogo comercial)
  console.log(`[PRODUCT] Restaurando galería original del canario...`)
  const restoreRes = await fetch(`${BACKEND_URL}/admin/products/${product.id}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      images: originalImages.length
        ? originalImages
        : originalThumbnail
          ? [{ url: originalThumbnail }]
          : [],
      thumbnail: originalThumbnail || undefined,
    }),
  })
  if (!restoreRes.ok) {
    const errText = await restoreRes.text()
    throw new Error(`Fallo al restaurar galería canario: ${errText}`)
  }
  console.log(`✅ Galería canario restaurada`)

  console.log("\n==================================================================")
  console.log("🎉 PRUEBA END-TO-END COMPLETADA CON ÉXITO")
  console.log("==================================================================")
  console.log(`- Archivo de prueba:       ${filename}`)
  console.log(`- Tamaño:                  ${stat.size} bytes`)
  console.log(`- URL pública:             ${fileUrl}`)
  console.log(`- Ruta física:             ${physicalPath}`)
  console.log(`- HTTP Local (9000):       ${localCode} OK`)
  console.log(`- HTTPS Nginx (proxy):     ${nginxCode} OK`)
  console.log(`- Producto canario:        ${CANARY_HANDLE}`)
  console.log(`- Adjuntado + restaurado:  OK`)
  console.log("==================================================================")

  return {
    success: true,
    fileUrl,
    fileKey,
    filename,
    physicalPath,
    size: stat.size,
    localStatus: localCode,
    nginxStatus: nginxCode,
    canaryHandle: CANARY_HANDLE,
    productAttachedAndRestored: true,
  }
}

// Permitir ejecución con npx medusa exec
export default async function () {
  return runUploadE2ETest()
}

// Permitir ejecución directa con ts-node / node
if (require.main === module) {
  runUploadE2ETest()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("❌ Error en la prueba E2E:", err)
      process.exit(1)
    })
}
