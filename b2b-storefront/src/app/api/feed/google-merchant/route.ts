import { listAllCatalogProducts } from "@lib/catalog/catalog-source"
import {
  catalogRevalidateOptions,
  CATALOG_CACHE_TAGS,
} from "@lib/catalog/catalog-cache"
import { getCatalogGa4ItemId, getCatalogImageUrls } from "@lib/catalog/catalog-present"
import { company } from "@lib/config/company"

function cleanText(text?: string | null): string {
  if (!text) return ""
  return text
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/[\t\n\r]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

function feedAvailability(
  availability: string
): "in_stock" | "out_of_stock" | "preorder" {
  if (availability === "in_stock") return "in_stock"
  if (availability === "backorder" || availability === "made_to_order") {
    return "preorder"
  }
  return "out_of_stock"
}

export async function GET() {
  const baseUrl = company.siteUrl
  const products = await listAllCatalogProducts("pe")

  const eligible = products.filter((p) => {
    const price = p.display.price?.amount ?? 0
    return (
      p.pim.purchaseMode === "buy_now" &&
      price > 0 &&
      p.display.availability !== "discontinued"
    )
  })

  const headers = [
    "id",
    "title",
    "description",
    "link",
    "image_link",
    "availability",
    "price",
    "condition",
    "brand",
    "mpn",
    "identifier_exists",
    "google_product_category",
    "shipping",
  ]

  const rows = eligible.map((p) => {
    const id = getCatalogGa4ItemId(p)
    const title = cleanText(p.title).substring(0, 150)
    const description = cleanText(
      p.pim.seoDescription || p.description || p.title
    ).substring(0, 5000)
    const link = `${baseUrl}/pe/products/${p.handle}`
    const imageRaw = getCatalogImageUrls(p)[0] || ""
    const imageLink = imageRaw.startsWith("http")
      ? imageRaw
      : `${baseUrl}${imageRaw || "/cn-media/categories/calefaccion-electrica.webp"}`
    const availability = feedAvailability(p.display.availability)
    const price = `${(p.display.price?.amount || 0).toFixed(2)} PEN`
    const brand = cleanText(p.brand?.name || "Control Nautas")
    const mpn = cleanText(p.pim.mfrModel || p.pim.itemNumber || "CN-STD")
    const identifierExists =
      p.brand?.name && p.pim.mfrModel ? "yes" : "no"

    return [
      id,
      title,
      description,
      link,
      imageLink,
      availability,
      price,
      "new",
      brand,
      mpn,
      identifierExists,
      "Hardware > Industrial Tools & Machinery",
      "PE::Envio Regular:0.00 PEN",
    ].join("\t")
  })

  const tsvContent = [headers.join("\t"), ...rows].join("\n")

  return new Response(tsvContent, {
    status: 200,
    headers: {
      "Content-Type": "text/tab-separated-values; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
    ...catalogRevalidateOptions([CATALOG_CACHE_TAGS.feed]),
  })
}

/** TTL feed: 15 min (plan maestro §15.3). */
export const revalidate = 900
