import { Metadata } from "next"
import { searchCatalogProducts } from "@lib/catalog/catalog-source"
import SearchResultsTemplate from "@modules/search/templates/search-results"

export const metadata: Metadata = {
  title: "Resultados de búsqueda | Control Nautas",
  description: "Buscar en el catálogo Control Nautas.",
}

export default async function SearchPage(props: {
  params: Promise<{ countryCode: string }>
  searchParams: Promise<{
    q?: string
    sortBy?: string
    page?: string
  }>
}) {
  const params = await props.params
  const resolvedSearchParams = await props.searchParams
  const { sortBy, page, q } = resolvedSearchParams
  const query = q || ""
  const { products } = await searchCatalogProducts(
    query,
    params.countryCode,
    { limit: 200 }
  )

  return (
    <SearchResultsTemplate
      query={query}
      sortBy={sortBy}
      page={page}
      initialProducts={products}
    />
  )
}

export const revalidate = 900
