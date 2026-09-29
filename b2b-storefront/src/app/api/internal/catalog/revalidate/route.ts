import {
  executeCatalogRevalidation,
  parseCatalogRevalidateBody,
  verifyCatalogRevalidateSignature,
} from "@lib/catalog/catalog-revalidate-handler"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/**
 * Invalidación firmada del caché de catálogo (plan maestro, §15).
 * Solo accesible desde Medusa backend con REVALIDATE_SECRET compartido.
 */
export async function POST(req: Request) {
  const secret = process.env.REVALIDATE_SECRET || ""
  const rawBody = await req.text()

  const signatureCheck = verifyCatalogRevalidateSignature(
    secret,
    req.headers.get("x-cn-timestamp"),
    rawBody,
    req.headers.get("x-cn-signature")
  )

  if (!signatureCheck.ok) {
    return Response.json(
      { error: signatureCheck.error },
      { status: signatureCheck.status }
    )
  }

  const parsed = parseCatalogRevalidateBody(rawBody)
  if (!parsed.ok) {
    return Response.json({ error: parsed.error }, { status: parsed.status })
  }

  const result = executeCatalogRevalidation(parsed.body)

  if (result.replay) {
    return Response.json(
      {
        ok: true,
        replay: true,
        invalidatedTags: result.invalidatedTags,
        invalidatedPaths: result.invalidatedPaths,
      },
      { status: 409 }
    )
  }

  return Response.json({
    ok: true,
    invalidatedTags: result.invalidatedTags,
    invalidatedPaths: result.invalidatedPaths,
  })
}
