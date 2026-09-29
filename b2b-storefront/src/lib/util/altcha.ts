// @ts-ignore
import { createChallenge, verifySolution } from "altcha-lib/v1"

const ALTCHA_HMAC_KEY =
  process.env.ALTCHA_HMAC_KEY ||
  "controlnautas-altcha-b2b-secret-key-2026-peru-industrial"

export async function generateAltchaChallenge() {
  return await createChallenge({
    hmacKey: ALTCHA_HMAC_KEY,
    maxNumber: 20000,
    expires: new Date(Date.now() + 5 * 60 * 1000),
  })
}

export async function verifyAltcha(payload: string | null | undefined): Promise<boolean> {
  if (!payload || typeof payload !== "string") {
    return false
  }

  try {
    const isValid = await verifySolution(payload, ALTCHA_HMAC_KEY)
    return Boolean(isValid)
  } catch (error) {
    console.error("Altcha verification error:", error)
    return false
  }
}
