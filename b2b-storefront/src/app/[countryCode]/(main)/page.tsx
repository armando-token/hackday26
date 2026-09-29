import { Metadata } from "next"

import HomeTemplate from "@modules/home/templates"
import { listAllCatalogProducts } from "@lib/catalog/catalog-source"
import { getCatalogCategoryTree, getL1Families } from "@lib/catalog/catalog-category-tree"
import { familyImage } from "@lib/cn-catalog"

export const metadata: Metadata = {
  title: "Control Nautas | Instrumentación, Automatización y Calefacción Industrial B2B",
  description:
    "Catálogo técnico y suministros industriales: sensores, transmisores, data loggers, PLC, HMI, calefacción eléctrica, trazado térmico y aislamiento.",
}

export default async function Home(props: {
  params: Promise<{ countryCode: string }>
}) {
  const params = await props.params
  const products = await listAllCatalogProducts(params.countryCode)
  const tree = await getCatalogCategoryTree(params.countryCode)
  const categories = getL1Families(tree)
    .sort((a, b) => a.name.localeCompare(b.name, "es"))
    .map((c) => ({
      name: c.name,
      slug: c.slug,
      count: c.productCount ?? 0,
      img: c.imageUrl || familyImage(c.slug),
    }))

  return (
    <HomeTemplate
      productCount={products.length}
      countryCode={params.countryCode}
      categories={categories}
      catalogDescription={tree.description}
    />
  )
}

export const revalidate = 900
