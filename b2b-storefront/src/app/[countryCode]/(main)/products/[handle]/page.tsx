import { Metadata } from "next"
import { notFound } from "next/navigation"
import {
  getCatalogProductByHandle,
  listAllCatalogProducts,
} from "@lib/catalog/catalog-source"
import {
  catalogProductTags,
  catalogRevalidateOptions,
} from "@lib/catalog/catalog-cache"
import {
  getCatalogImageUrls,
  getCatalogShortDescription,
  getRelatedCatalogProducts,
} from "@lib/catalog/catalog-present"
import { company } from "@lib/config/company"
import HvacProductTemplate from "@modules/products/templates/hvac-product"

type Props = {
  params: Promise<{ countryCode: string; handle: string }>
}

export async function generateStaticParams() {
  try {
    const countries = ["pe", "us"]
    const params: { countryCode: string; handle: string }[] = []
    for (const countryCode of countries) {
      const products = await listAllCatalogProducts(countryCode)
      for (const p of products) {
        params.push({
          countryCode,
          handle: p.handle,
        })
      }
    }
    return params
  } catch {
    return []
  }
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const product = await getCatalogProductByHandle(
    params.handle,
    params.countryCode
  )

  if (!product) {
    return { title: "Product not found | Control Nautas" }
  }

  const title =
    product.pim.seoTitle?.trim() ||
    `${product.title} | Control Nautas`
  const description =
    product.pim.seoDescription?.trim() ||
    getCatalogShortDescription(product)
  const ogImage =
    product.pim.ogImage ||
    product.thumbnail ||
    product.images[0]?.url ||
    undefined

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: ogImage ? [ogImage] : [],
    },
  }
}

export default async function ProductPage(props: Props) {
  const params = await props.params
  const product = await getCatalogProductByHandle(
    params.handle,
    params.countryCode
  )

  if (!product) {
    notFound()
  }

  let related: any[] = []
  try {
    const all = await listAllCatalogProducts(params.countryCode)
    related = getRelatedCatalogProducts(product, all, 4)
  } catch (e) {
    console.warn("Could not load related products:", e)
  }

  return (
    <HvacProductTemplate
      product={product}
      related={related}
      countryCode={params.countryCode}
    />
  )
}

/** TTL de seguridad (plan maestro §15.3): 15 min sin webhook. */
export const revalidate = 900
