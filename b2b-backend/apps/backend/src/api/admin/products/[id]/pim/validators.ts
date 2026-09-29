import { z } from "zod"

/**
 * Validadores del endpoint Admin de PIM.
 *
 * Plan maestro, seccion 9.1. Sustituyen el spread sin validar del route
 * anterior, que permitia escribir cualquier campo arbitrario.
 */

const PURCHASE_MODES = [
  "buy_now",
  "quote_only",
  "contact_for_price",
  "made_to_order",
] as const

const AVAILABILITY_MODES = [
  "in_stock",
  "lead_time",
  "made_to_order",
  "discontinued",
] as const

export const MAX_SPEC_ENTRIES = 100
export const MAX_SPEC_KEY_LENGTH = 120
export const MAX_SPEC_VALUE_LENGTH = 2000

/**
 * Limites SEO.
 *
 * El plan (seccion 8.3) proponia 70 y 170 caracteres como maximos duros. La
 * auditoria del 2026-08-31 mostro que 494 de los 498 titulos existentes superan
 * los 70 caracteres (maximo real: 303), de modo que aplicarlo como validacion
 * impediria a Marketing guardar practicamente cualquier producto: justo lo
 * contrario del objetivo del proyecto.
 *
 * Se distingue por tanto entre el limite recomendado, que la interfaz muestra
 * como advertencia, y el limite duro, que protege frente a abusos.
 */
export const SEO_TITLE_RECOMMENDED = 70
export const SEO_TITLE_MAX = 320
export const SEO_DESCRIPTION_RECOMMENDED = 170
export const SEO_DESCRIPTION_MAX = 400

/** Trim + string vacio a null (seccion 9.1). */
const trimmedNullable = (max?: number) =>
  z
    .union([z.string(), z.null()])
    .optional()
    .transform((v) => {
      if (v === null || v === undefined) return v ?? null
      const t = v.trim()
      return t === "" ? null : t
    })
    .refine((v) => v === null || v === undefined || max === undefined || v.length <= max, {
      message: max ? `Maximo ${max} caracteres` : undefined,
    })

/**
 * URL admitida: null, https, o ruta local que empiece con "/" (seccion 8.3).
 * Se rechaza http plano y cualquier otro esquema para no degradar la pagina.
 */
const assetUrl = z
  .union([z.string(), z.null()])
  .optional()
  .transform((v) => {
    if (v === null || v === undefined) return v ?? null
    const t = v.trim()
    return t === "" ? null : t
  })
  .refine(
    (v) => v === null || v === undefined || v.startsWith("/") || v.startsWith("https://"),
    { message: "Debe ser una ruta local que empiece con / o una URL https://" }
  )

/**
 * specs: objeto plano Record<string,string>.
 *
 * Reglas de la seccion 6.1: clave con trim, no vacia, maximo 120 caracteres;
 * valor string/number/boolean convertido a string; se omiten null, arrays y
 * objetos anidados; se rechazan claves duplicadas tras normalizar.
 */
const specsSchema = z
  .union([z.record(z.string(), z.unknown()), z.null()])
  .optional()
  .transform((raw, ctx) => {
    if (raw === null || raw === undefined) return raw ?? null

    const out: Record<string, string> = {}
    const vistas = new Set<string>()

    for (const [rawKey, rawValue] of Object.entries(raw)) {
      const key = rawKey.trim()
      if (!key) continue
      if (key.length > MAX_SPEC_KEY_LENGTH) {
        ctx.addIssue({
          code: "custom",
          message: `La clave "${key.slice(0, 30)}..." supera ${MAX_SPEC_KEY_LENGTH} caracteres`,
          path: ["specs"],
        })
        continue
      }

      const normalizada = key.toLowerCase()
      if (vistas.has(normalizada)) {
        ctx.addIssue({
          code: "custom",
          message: `Clave duplicada tras normalizar: "${key}"`,
          path: ["specs"],
        })
        continue
      }

      // Se omiten silenciosamente los tipos no representables, segun 6.1.
      if (rawValue === null || rawValue === undefined) continue
      if (Array.isArray(rawValue) || typeof rawValue === "object") continue

      const value = String(rawValue).trim()
      if (!value) continue
      if (value.length > MAX_SPEC_VALUE_LENGTH) {
        ctx.addIssue({
          code: "custom",
          message: `El valor de "${key}" supera ${MAX_SPEC_VALUE_LENGTH} caracteres`,
          path: ["specs"],
        })
        continue
      }

      vistas.add(normalizada)
      out[key] = value
    }

    if (Object.keys(out).length > MAX_SPEC_ENTRIES) {
      ctx.addIssue({
        code: "custom",
        message: `Maximo ${MAX_SPEC_ENTRIES} especificaciones`,
        path: ["specs"],
      })
    }

    return out
  })

export const AdminUpsertPimSchema = z
  .object({
    mfr_model: trimmedNullable(200),
    item_number: trimmedNullable(100),
    purchase_mode: z.enum(PURCHASE_MODES).optional(),
    availability_mode: z.enum(AVAILABILITY_MODES).optional(),
    lead_time_days: z
      .union([z.number().int().min(1).max(3650), z.null()])
      .optional(),
    technical_pdf: assetUrl,
    manual_pdf: assetUrl,
    og_image: assetUrl,
    ip_certification: trimmedNullable(100),
    voltage: trimmedNullable(100),
    thread_size: trimmedNullable(100),
    material: trimmedNullable(200),
    oem_brand: trimmedNullable(200),
    seo_title: trimmedNullable(SEO_TITLE_MAX),
    seo_description: trimmedNullable(SEO_DESCRIPTION_MAX),
    specs: specsSchema,
  })
  // Rechazo de claves desconocidas (seccion 9.1).
  .strict()
  .superRefine((data, ctx) => {
    /**
     * Decision D5 aprobada el 2026-08-31: lead_time_days es OPCIONAL cuando
     * availability_mode es lead_time. Si falta, la interfaz muestra
     * "Consultar plazo" en lugar de inventar un numero.
     *
     * Lo que si se mantiene prohibido es declarar un plazo en un estado que no
     * lo admite, porque seria un dato contradictorio.
     */
    if (
      data.availability_mode &&
      data.availability_mode !== "lead_time" &&
      data.lead_time_days !== null &&
      data.lead_time_days !== undefined
    ) {
      ctx.addIssue({
        code: "custom",
        message:
          "lead_time_days solo puede definirse cuando availability_mode es lead_time",
        path: ["lead_time_days"],
      })
    }
  })

export type AdminUpsertPimInput = z.infer<typeof AdminUpsertPimSchema>
