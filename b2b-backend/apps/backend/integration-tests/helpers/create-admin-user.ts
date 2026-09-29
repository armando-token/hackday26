import { Modules } from "@medusajs/framework/utils"
import jwt from "jsonwebtoken"

/**
 * Crea un usuario Admin y devuelve la cabecera Authorization ya firmada.
 *
 * Se firma el JWT directamente en lugar de pasar por
 * `POST /auth/user/emailpass`, porque ese endpoint exige el proof-of-work de
 * ALTCHA (ver `src/api/middlewares.ts`). Resolverlo en cada prueba solo
 * añadiria coste de CPU sin cubrir nada del contrato de PIM, que es lo que
 * estas pruebas verifican.
 */
export async function createAdminUser(container: any) {
  const userModule = container.resolve(Modules.USER)
  const authModule = container.resolve(Modules.AUTH)

  const email = `admin-${Date.now()}@medusa-test.local`

  const user = await userModule.createUsers({ email })

  const authIdentity = await authModule.createAuthIdentities({
    provider_identities: [
      {
        provider: "emailpass",
        entity_id: email,
        provider_metadata: { password: "supersecret" },
      },
    ],
    app_metadata: { user_id: user.id },
  })

  const token = jwt.sign(
    {
      actor_id: user.id,
      actor_type: "user",
      auth_identity_id: authIdentity.id,
      app_metadata: { user_id: user.id },
    },
    process.env.JWT_SECRET || "test-jwt-secret",
    { expiresIn: "1d" }
  )

  return {
    user,
    headers: { authorization: `Bearer ${token}` },
  }
}
