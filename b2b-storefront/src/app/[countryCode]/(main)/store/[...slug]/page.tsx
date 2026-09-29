import { Metadata } from "next"
import { notFound } from "next/navigation"
import HvacCategoryTemplate from "@modules/store/templates/hvac-category"
import {
  familyImage,
  isLeafCategory,
  leafImage,
} from "@lib/cn-catalog"
import {
  findCategoryInTree,
  getCatalogCategoryTree,
  getCategoryPathInTree,
} from "@lib/catalog/catalog-category-tree"
import {
  listAllCatalogProducts,
} from "@lib/catalog/catalog-source"
import { getCatalogImageUrls } from "@lib/catalog/catalog-present"
import type { CatalogProduct } from "@lib/catalog/catalog-types"
import type { ProductCollectionData } from "@modules/store/templates/leaf-category-listing"

type Props = {
  params: Promise<{
    countryCode: string
    slug: string[]
  }>
}

function buildSingleCollection(
  leaf: {
    slug: string
    name: string
    description?: string
    imageUrl?: string
  },
  products: CatalogProduct[]
): ProductCollectionData[] {
  return [
    {
      id: leaf.slug,
      slug: leaf.slug,
      title: leaf.name,
      description: leaf.description || "",
      imageUrl:
        leaf.imageUrl ||
        leafImage(leaf.slug) ||
        products[0]?.thumbnail ||
        getCatalogImageUrls(products[0])[0] ||
        "",
      products,
    },
  ]
}

function buildCollectionsFromChildren(
  children: {
    slug: string
    name: string
    description?: string
    imageUrl?: string
  }[],
  getProducts: (slug: string) => CatalogProduct[]
): ProductCollectionData[] {
  return children
    .map((child, idx) => {
      const products = getProducts(child.slug)
      const img =
        child.imageUrl ||
        leafImage(child.slug, idx) ||
        products[0]?.thumbnail ||
        getCatalogImageUrls(products[0])[0] ||
        ""
      return {
        id: child.slug,
        slug: child.slug,
        title: child.name,
        description: child.description || "",
        imageUrl: img,
        products,
      }
    })
    .filter((c) => c.products.length > 0)
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const { countryCode, slug } = params

  const tree = await getCatalogCategoryTree(countryCode)
  const category = findCategoryInTree(slug, tree)
  if (!category) {
    return {
      title: "Category not found | Control Nautas",
    }
  }

  const title = `${category.name} | Control Nautas Industrial Catalog`
  const description =
    category.description ||
    `View technical specs, models, availability, and quotes for ${category.name} at Control Nautas.`

  const imageUrl = category.imageUrl || familyImage(category.slug)
  const canonicalUrl = `https://controlnautas.com/${countryCode}/store/${slug.join("/")}`

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: "Control Nautas B2B",
      images: imageUrl
        ? [
            {
              url: imageUrl,
              width: 800,
              height: 800,
              alt: category.name,
            },
          ]
        : [],
      locale: "es_PE",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: imageUrl ? [imageUrl] : [],
    },
  }
}

export default async function HvacCategoryPage(props: Props) {
  const params = await props.params
  const { countryCode, slug } = params

  const tree = await getCatalogCategoryTree(countryCode)
  const category = findCategoryInTree(slug, tree)
  if (!category) {
    notFound()
  }

  const kids = category.children || []
  const isLeaf = isLeafCategory(category)

  let collections: ProductCollectionData[]
  let aggregateCount: number

  const allProducts = await listAllCatalogProducts(countryCode)

  if (isLeaf) {
    const products = allProducts.filter(
      (p) => p.leafCategory.handle === category.slug
    )
    collections = buildSingleCollection(category, products)
    aggregateCount = products.length
  } else {
    const productsBySlug = new Map<string, CatalogProduct[]>()
    for (const child of kids) {
      productsBySlug.set(
        child.slug,
        allProducts.filter((p) => p.leafCategory.handle === child.slug)
      )
    }
    collections = buildCollectionsFromChildren(
      kids,
      (childSlug) => productsBySlug.get(childSlug) ?? []
    )
    aggregateCount = allProducts.filter((p) =>
      p.categories.some((c) => c.handle === category.slug)
    ).length
  }

  return (
    <HvacCategoryTemplate
      slugs={slug}
      category={category}
      breadcrumbs={getCategoryPathInTree(slug, tree)}
      collections={collections}
      aggregateCount={aggregateCount}
    />
  )
}

export const revalidate = 900
