import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
// @ts-ignore
import { createChallenge } from "altcha-lib/v1"

const ALTCHA_HMAC_KEY =
  process.env.ALTCHA_HMAC_KEY ||
  "controlnautas-altcha-b2b-secret-key-2026-peru-industrial"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const challenge = await createChallenge({
      hmacKey: ALTCHA_HMAC_KEY,
      maxNumber: 20000,
      expires: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
    })
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate")
    return res.json(challenge)
  } catch (error: any) {
    return res.status(500).json({ error: error.message || "Failed to create Altcha challenge" })
  }
}
