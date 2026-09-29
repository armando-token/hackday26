import { sdk } from "@lib/config"
import { getAuthHeaders, getCacheOptions } from "./cookies"
import { HttpTypes } from "@medusajs/types"

export const searchProducts = async (query: string, regionId?: string) => {
  if (!query || !query.trim()) return []
  
  const headers = {
    ...(await getAuthHeaders()),
  }

  const next = {
    ...(await getCacheOptions("products")),
  }

  return sdk.client
    .fetch<HttpTypes.StoreProductListResponse>("/store/products", {
      query: {
        q: query,
        region_id: regionId,
      },
      headers,
      next,
      cache: "force-cache",
    })
    .then(({ products }) => products as HttpTypes.StoreProduct[])
    .catch(() => [] as HttpTypes.StoreProduct[])
}
