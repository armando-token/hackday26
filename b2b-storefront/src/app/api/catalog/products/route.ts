import { getCatalogProductsByHandles } from "@lib/catalog/catalog-source"

/** Resuelve handles a CatalogProduct para listas locales (vistos, comparar). */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const countryCode = searchParams.get("countryCode") || "pe"
  const handles = (searchParams.get("handles") || "")
    .split(",")
    .map((h) => h.trim())
    .filter(Boolean)
    .slice(0, 20)

  if (!handles.length) {
    return Response.json({ products: [] })
  }

  const products = await getCatalogProductsByHandles(handles, countryCode)

  return Response.json({ products })
}
