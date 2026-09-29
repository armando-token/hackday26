import { lookupCatalogProductsBySkuTokens } from "@lib/catalog/catalog-source"

/** Resolución batch SKU / ítem / handle para quick-order (server-only). */
export async function POST(req: Request) {
  let body: { skus?: string[]; countryCode?: string }
  try {
    body = await req.json()
  } catch {
    return Response.json({ matches: {} }, { status: 400 })
  }

  const skus = Array.isArray(body.skus) ? body.skus.slice(0, 50) : []
  const countryCode = body.countryCode || "pe"

  if (!skus.length) {
    return Response.json({ matches: {} })
  }

  const matches = await lookupCatalogProductsBySkuTokens(skus, countryCode)

  const slim: Record<
    string,
    {
      handle: string
      productId: string
      title: string
      brand: string
      itemNumber: string | null
      priceLabel: string
      canAddToCart: boolean
      availability: string
      variantId: string
    }
  > = {}

  for (const [token, p] of Object.entries(matches)) {
    slim[token] = {
      handle: p.handle,
      productId: p.id,
      title: p.title,
      brand: p.brand?.name ?? "",
      itemNumber: p.pim.itemNumber,
      priceLabel: p.display.priceLabel,
      canAddToCart: p.display.canAddToCart,
      availability: p.display.availability,
      variantId: p.primaryVariant.id,
    }
  }

  return Response.json({ matches: slim })
}