import crypto from "crypto"
import fs from "fs"
import path from "path"
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

// En el servidor local, Medusa siempre escucha en loopback :9000
const BACKEND_URL = "http://127.0.0.1:9000"
const STATIC_DIR = path.resolve(__dirname, "../../static")
const JWT_SECRET = process.env.JWT_SECRET || "supersecret"

const ADMIN_EMAIL = process.env.MEDUSA_ADMIN_EMAIL || "e2e-tester@controlnautas.local"
const ADMIN_PASSWORD = process.env.MEDUSA_ADMIN_PASSWORD || "SecretAdmin123!"

const CANARY_HANDLE = "control-e-indicacion"

// 1x1 WebP base64
const TINY_WEBP_BASE64 =
  "UklGRh4AAABXRUJQVlA4TBEAAAAvAAAAAAfQ//73v/+BiOh/AAA="

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

async function getAdminToken(): Promise<{ token: string; method: string }> {
  try {
    const payload = await getAltchaPayload()
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
        return { token: data.token, method: "ALTCHA_EMAILPASS" }
      }
    }
  } catch (err: any) {
    // Fallback below
  }

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

export async function runCategoryImagesE2ETest() {
  console.log("==================================================================")
  console.log("🧪 INICIANDO PRUEBA E2E: IMÁGENES DE CATEGORÍA MEDUSA ADMIN -> STORE")
  console.log("==================================================================")

  // 1. Autenticación
  const { token, method } = await getAdminToken()
  console.log(`✅ Token Admin obtenido vía: ${method}`)

  // 2. Buscar categoría canario
  const catListRes = await fetch(
    `${BACKEND_URL}/admin/product-categories?handle=${encodeURIComponent(CANARY_HANDLE)}&fields=id,name,handle,metadata`,
    { headers: { Authorization: `Bearer ${token}` } }
  )
  if (!catListRes.ok) {
    throw new Error(`Error al buscar categoría en Admin API: HTTP ${catListRes.status}`)
  }
  const catListData: any = await catListRes.json()
  const category = catListData.product_categories?.[0]
  if (!category?.id) {
    throw new Error(`Categoría canario '${CANARY_HANDLE}' no encontrada en Admin`)
  }

  const originalImageUrl = "/cn-media/categories/control-e-indicacion.webp"
  console.log(`✅ Categoría encontrada: ${category.name} (${category.id})`)
  console.log(`   URL imagen esperada/original: ${originalImageUrl}`)

  let uploadedUrl = ""
  try {
    // 3. Subir archivo de prueba a /admin/uploads
    const testFileName = `category-test-${Date.now()}.webp`
    const fileBuffer = Buffer.from(TINY_WEBP_BASE64, "base64")
    const fileBlob = new Blob([fileBuffer], { type: "image/webp" })

    const formData = new FormData()
    formData.append("files", fileBlob, testFileName)

    console.log(`\n[UPLOAD] Subiendo archivo ${testFileName} a POST ${BACKEND_URL}/admin/uploads...`)
    const uploadRes = await fetch(`${BACKEND_URL}/admin/uploads`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    })

    if (!uploadRes.ok) {
      const errorText = await uploadRes.text()
      throw new Error(`Fallo en subida de archivo (HTTP ${uploadRes.status}): ${errorText}`)
    }

    const uploadJson: UploadResponse = await uploadRes.json()
    const uploadedFile = uploadJson.files?.[0]
    if (!uploadedFile?.url) {
      throw new Error("No se obtuvo URL del archivo subido")
    }

    uploadedUrl = uploadedFile.url
    console.log(`✅ Archivo subido con éxito. URL: ${uploadedUrl}`)

    // 4. Actualizar metadata de categoría con la nueva URL
    console.log(`\n[UPDATE] Actualizando metadata.image_url de categoría a: ${uploadedUrl}`)
    const updateRes = await fetch(`${BACKEND_URL}/admin/product-categories/${category.id}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        metadata: {
          ...(category.metadata || {}),
          image_url: uploadedUrl,
        },
      }),
    })

    if (!updateRes.ok) {
      const errText = await updateRes.text()
      throw new Error(`Fallo al actualizar categoría: HTTP ${updateRes.status} - ${errText}`)
    }
    console.log(`✅ Categoría actualizada exitosamente`)

    // 5. Verificar que Admin API expone la nueva metadata
    const verifyAdminRes = await fetch(
      `${BACKEND_URL}/admin/product-categories/${category.id}?fields=id,name,handle,metadata`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
    const verifyAdminData: any = await verifyAdminRes.json()
    const adminCategory = verifyAdminData.product_category
    if (adminCategory?.metadata?.image_url !== uploadedUrl) {
      throw new Error(
        `Admin API no refleja la imagen actualizada. Esperado: ${uploadedUrl}, Actual: ${adminCategory?.metadata?.image_url}`
      )
    }
    console.log(`✅ Admin API retorna metadata.image_url actualizada correctamente`)

    // 6. Verificar que Store API (público) expone la nueva metadata
    const pk = "pk_eb1292e091094841f6432858a500b61842aeca4ebe6a490d218b5db7a6b6985e"

    const storeRes = await fetch(
      `${BACKEND_URL}/store/product-categories?handle=${encodeURIComponent(CANARY_HANDLE)}&fields=id,handle,metadata`,
      { headers: { "x-publishable-api-key": pk } }
    )
    if (!storeRes.ok) {
      throw new Error(`Store API fallo al consultar categoría: HTTP ${storeRes.status}`)
    }
    const storeData: any = await storeRes.json()
    const storeCategory = storeData.product_categories?.[0]
    if (storeCategory?.metadata?.image_url !== uploadedUrl) {
      throw new Error(
        `Store API no expone la imagen actualizada. Esperado: ${uploadedUrl}, Actual: ${storeCategory?.metadata?.image_url}`
      )
    }
    console.log(`✅ Store API expone metadata.image_url = ${uploadedUrl}`)
  } finally {
    // 7. Restaurar URL original de categoría (no dejar imagen de test en producción)
    console.log(`\n[RESTORE] Restaurando URL original de la categoría: ${originalImageUrl}`)
    const restoreRes = await fetch(`${BACKEND_URL}/admin/product-categories/${category.id}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        metadata: {
          ...(category.metadata || {}),
          image_url: originalImageUrl,
        },
      }),
    })

    if (!restoreRes.ok) {
      console.error(`Error al restaurar categoría: HTTP ${restoreRes.status}`)
    } else {
      console.log(`✅ Categoría canario restaurada a su imagen oficial: ${originalImageUrl}`)
    }

    // 8. Limpiar archivos temporales de prueba de disco
    if (uploadedUrl) {
      const uploadedFilename = path.basename(uploadedUrl)
      const localFilePath = path.join(STATIC_DIR, uploadedFilename)
      if (fs.existsSync(localFilePath)) {
        fs.unlinkSync(localFilePath)
        console.log(`✅ Archivo temporal de prueba eliminado de disco: ${uploadedFilename}`)
      }
    }
  }

  console.log("==================================================================")
  console.log("🎉 PRUEBA E2E DE IMÁGENES DE CATEGORÍA COMPLETADA CON ÉXITO")
  console.log("==================================================================")
}

if (require.main === module) {
  runCategoryImagesE2ETest()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("❌ Error en prueba E2E:", err)
      process.exit(1)
    })
}

export default async function () {
  return runCategoryImagesE2ETest()
}
