import Medusa, { FetchError } from "@medusajs/js-sdk"

/**
 * Cliente compartido del Admin (plan maestro, seccion 10.1).
 *
 * Sustituye a las llamadas con `window.fetch` crudo de los widgets y rutas
 * personalizadas, que no adjuntaban el JWT y producian 401 silenciosos.
 *
 * `__BACKEND_URL__` y `__AUTH_TYPE__` son constantes que inyecta el bundler del
 * Admin (`@medusajs/admin-bundler`) mediante `define` de Vite. Son exactamente
 * las mismas que consume el dashboard oficial, de modo que este cliente
 * comparte configuracion y almacenamiento de token con el resto del Admin.
 * `medusa-config.ts` fuerza ademas `__AUTH_TYPE__ = "jwt"`.
 */
declare const __BACKEND_URL__: string | undefined
declare const __AUTH_TYPE__: "jwt" | "session" | undefined

const backendUrl =
  typeof __BACKEND_URL__ !== "undefined" ? __BACKEND_URL__ ?? "/" : "/"

const authType: "jwt" | "session" =
  typeof __AUTH_TYPE__ !== "undefined" ? __AUTH_TYPE__ ?? "session" : "session"

/**
 * INTERACCION CON EL MONKEY-PATCH DE ALTCHA (verificado sobre
 * @medusajs/js-sdk 2.17.0, dist/esm/client.js).
 *
 * `medusa-config.ts` inyecta en el `<head>` del index.html un script que
 * reemplaza `window.fetch` para adjuntar la cabecera `x-altcha-payload` en
 * `POST /auth/user/emailpass`. Ese parche NO se evade por usar el SDK:
 *
 *  1. El SDK no captura ninguna referencia a `fetch` en tiempo de carga del
 *     modulo. En `Client.initClient()` la llamada es un identificador global
 *     libre (`return await fetch(normalizedInput, ...)`), que se resuelve
 *     contra `globalThis`/`window` en cada invocacion. Por tanto siempre usa
 *     la version parcheada vigente.
 *  2. El script del parche se ejecuta en un `<script>` en linea dentro del
 *     `<head>`, es decir antes de que se evalue el bundle del Admin, asi que
 *     no hay ventana de carrera aunque el SDK guardase la referencia.
 *  3. Este modulo no interviene en el login: el formulario de acceso lo sigue
 *     sirviendo el dashboard oficial. Aqui solo se emiten peticiones a
 *     `/admin/**`, que el parche deja pasar intactas (solo intercepta POST a
 *     `/auth/user/emailpass`).
 *
 * Conclusion: el parche de ALTCHA sigue activo para el login y este cliente no
 * lo altera ni lo elude.
 */
export const sdk = new Medusa({
  baseUrl: backendUrl,
  auth: {
    // Con "jwt" el SDK lee y refresca el token de `medusa_auth_token` en
    // localStorage por su cuenta y construye la cabecera Authorization. No se
    // debe leer localStorage ni componer la cabecera manualmente.
    type: authType,
  },
})

export default sdk

// --------------------------------------------------------------- errores

/** Forma normalizada de un error de la API de Admin. */
export type ApiErrorInfo = {
  status?: number
  code?: string
  /** Mensaje ya redactado en espanol y apto para mostrar al usuario. */
  message: string
  requestId?: string
  fieldErrors: Record<string, string[]>
}

const MENSAJES_POR_ESTADO: Record<number, string> = {
  400: "Hay datos invalidos en el formulario. Revise los campos marcados.",
  401: "La sesion vencio; vuelva a iniciar sesion.",
  403: "No tiene permiso para realizar esta accion.",
  404: "El producto no existe o fue eliminado.",
  409: "Existe un conflicto de integridad; no reintente hasta revisar.",
  500: "Error interno del servidor al procesar la solicitud.",
}

/** `pim_xxxx` o `request_id: xxxx` incrustado en el mensaje de la API. */
function extraerRequestId(mensaje: string): string | undefined {
  const m =
    mensaje.match(/request[_-]?id["'\s:]+([A-Za-z0-9_-]+)/i) ||
    mensaje.match(/\b(pim_[A-Za-z0-9]+)\b/)
  return m ? m[1] : undefined
}

/**
 * Convierte cualquier fallo en informacion presentable.
 *
 * Limitacion conocida del SDK: `Client.normalizeResponse` consume el cuerpo de
 * las respuestas no-2xx y solo conserva `message` y `status` dentro de
 * `FetchError`; `code`, `request_id` y `fieldErrors` estructurados se pierden.
 * Por eso se recuperan del texto del mensaje cuando la API los incluye, y la
 * validacion por campo se hace ademas en el cliente antes de enviar.
 */
export function describeApiError(err: unknown): ApiErrorInfo {
  const fieldErrors: Record<string, string[]> = {}

  if (err instanceof FetchError) {
    const status = err.status
    const bruto = (err.message || "").trim()

    // Medusa devuelve los fallos de validacion del middleware como
    // "Invalid request: <campo> <detalle>, <campo> <detalle>".
    const invalidRequest = bruto.match(/^Invalid request:\s*(.+)$/i)
    if (invalidRequest) {
      for (const parte of invalidRequest[1].split(/,\s*/)) {
        const campo = parte.trim().split(/\s+/)[0]?.replace(/[:.]$/, "")
        if (campo) {
          fieldErrors[campo] = [...(fieldErrors[campo] || []), parte.trim()]
        }
      }
    }

    const message =
      bruto && !/^\s*$/.test(bruto) && status !== 401 && status !== 403
        ? bruto
        : (status !== undefined && MENSAJES_POR_ESTADO[status]) ||
          "Ocurrio un error inesperado."

    return {
      status,
      message:
        status === 401 || status === 403
          ? MENSAJES_POR_ESTADO[status]
          : message,
      requestId: extraerRequestId(bruto),
      fieldErrors,
    }
  }

  if (err instanceof Error) {
    return { message: err.message || "Ocurrio un error inesperado.", fieldErrors }
  }

  return { message: "Ocurrio un error inesperado.", fieldErrors }
}

/** Texto de una linea listo para el cuerpo de un toast. */
export function formatApiError(info: ApiErrorInfo): string {
  return info.requestId
    ? `${info.message} (referencia: ${info.requestId})`
    : info.message
}
