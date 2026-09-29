const crypto = require("crypto")

/**
 * Obtiene un JWT de Medusa Admin resolviendo el proof-of-work de ALTCHA.
 *
 * El middleware de src/api/middlewares.ts intercepta POST /auth/user/emailpass y
 * exige la cabecera x-altcha-payload, de modo que no es posible autenticarse en
 * las pruebas sin resolver el reto.
 */

const BACKEND = process.env.MEDUSA_BACKEND_URL || "http://127.0.0.1:9000"

/** Fuerza bruta sobre el rango del reto, que es exactamente como funciona ALTCHA. */
function resolverPoW({ algorithm, challenge, salt, maxnumber }) {
  const algo = (algorithm || "SHA-256").replace("-", "").toLowerCase()
  const techo = maxnumber ?? 1_000_000
  for (let n = 0; n <= techo; n++) {
    const hash = crypto.createHash(algo).update(`${salt}${n}`).digest("hex")
    if (hash === challenge) return n
  }
  throw new Error("No se encontro solucion al reto ALTCHA dentro del rango")
}

async function obtenerPayloadAltcha() {
  const res = await fetch(`${BACKEND}/auth/altcha-challenge`)
  if (!res.ok) {
    throw new Error(`No se pudo obtener el reto ALTCHA: HTTP ${res.status}`)
  }
  const reto = await res.json()
  const number = resolverPoW(reto)

  return Buffer.from(
    JSON.stringify({
      algorithm: reto.algorithm,
      challenge: reto.challenge,
      number,
      salt: reto.salt,
      signature: reto.signature,
    })
  ).toString("base64")
}

/** Devuelve el JWT de administrador listo para la cabecera Authorization. */
async function obtenerTokenAdmin(email, password) {
  const payload = await obtenerPayloadAltcha()

  const res = await fetch(`${BACKEND}/auth/user/emailpass`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-altcha-payload": payload,
    },
    body: JSON.stringify({ email, password }),
  })

  const cuerpo = await res.json().catch(() => ({}))
  if (!res.ok || !cuerpo.token) {
    throw new Error(
      `Login fallido (HTTP ${res.status}): ${cuerpo.message || JSON.stringify(cuerpo)}`
    )
  }
  return cuerpo.token
}

module.exports = { obtenerTokenAdmin, obtenerPayloadAltcha, resolverPoW, BACKEND }
