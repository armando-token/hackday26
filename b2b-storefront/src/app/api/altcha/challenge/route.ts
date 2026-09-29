import { generateAltchaChallenge } from "@lib/util/altcha"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const challenge = await generateAltchaChallenge()
    return NextResponse.json(challenge, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create challenge" }, { status: 500 })
  }
}
