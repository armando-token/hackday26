import { searchCatalogProducts } from "@lib/catalog/catalog-source"

export const runtime = "nodejs"
/** TTL typeahead: 5 min (plan maestro §15.3). */
export const revalidate = 300

/**
 * Typeahead server-only (plan maestro, §7.3).
 * Mínimo 2 caracteres; límite 8 resultados.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const q = (searchParams.get("q") || "").trim()
  const countryCode = searchParams.get("countryCode") || "pe"

  if (q.length < 2) {
    return Response.json({ products: [], count: 0 })
  }

  const { products, count } = await searchCatalogProducts(q, countryCode, {
    limit: 8,
    offset: 0,
  })

  const slim = products.map((p) => ({
    handle: p.handle,
    title: p.title,
    brand: p.brand?.name ?? "",
    itemNumber: p.pim.itemNumber,
    image: p.thumbnail || p.images[0]?.url || "",
    priceLabel: p.display.priceLabel,
    categorySlug: p.leafCategory.handle,
  }))

  return Response.json(
    { products: slim, count },
    {
      headers: {
        "Cache-Control": "public, max-age=300",
      },
    }
  )
}
