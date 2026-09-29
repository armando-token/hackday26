import { Metadata } from "next"
import StoreTemplate from "@modules/store/templates"
import { getCatalogCategoryTree, getL1Families } from "@lib/catalog/catalog-category-tree"

export const metadata: Metadata = {
  title: "Control Nautas Catalog",
  description:
    "Electric heating, heat tracing, industrial control, sensors, monitoring, PLC, and insulation.",
}

type Params = {
  searchParams: Promise<{
    sortBy?: string
    page?: string
  }>
  params: Promise<{
    countryCode: string
  }>
}

export default async function StorePage(props: Params) {
  const params = await props.params
  const searchParams = await props.searchParams
  const tree = await getCatalogCategoryTree(params.countryCode)

  return (
    <StoreTemplate
      sortBy={searchParams.sortBy as any}
      page={searchParams.page}
      countryCode={params.countryCode}
      catalogRoot={tree}
      l1Families={getL1Families(tree)}
    />
  )
}
