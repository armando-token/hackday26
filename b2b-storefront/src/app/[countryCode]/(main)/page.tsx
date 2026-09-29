import { Metadata } from "next"

import HomeTemplate from "@modules/home/templates"
import { listAllCatalogProducts } from "@lib/catalog/catalog-source"
import { getCatalogCategoryTree, getL1Families } from "@lib/catalog/catalog-category-tree"
import { familyImage } from "@lib/cn-catalog"

export const metadata: Metadata = {
  title: "Control Nautas | Industrial Instrumentation, Automation & Heating B2B",
  description:
    "Technical catalog and industrial supplies: sensors, transmitters, data loggers, PLC, HMI, electric heating, heat tracing, and insulation.",
}

export default async function Home(props: {
  params: Promise<{ countryCode: string }>
}) {
  const params = await props.params
  const products = await listAllCatalogProducts(params.countryCode)
  const tree = await getCatalogCategoryTree(params.countryCode)
  const categories = getL1Families(tree)
    .sort((a, b) => a.name.localeCompare(b.name, "en"))
    .map((c) => ({
      name: c.name,
      slug: c.slug,
      count: c.productCount ?? 0,
      img: c.imageUrl || familyImage(c.slug),
    }))

  const featured = products
    .filter((p) =>
      ["cn-x5prime-he-xp5", "cn-n1200", "cn-tht02"].includes(p.handle)
    )
    .sort((a, b) => a.title.localeCompare(b.title))

  return (
    <HomeTemplate
      productCount={products.length}
      countryCode={params.countryCode}
      categories={categories}
      catalogDescription={tree.description}
      featuredProducts={featured}
    />
  )
}

export const revalidate = 60
