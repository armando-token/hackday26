"use server"

import { sdk } from "@lib/config"
import medusaError from "@lib/util/medusa-error"
import { HttpTypes } from "@medusajs/types"
import { getCacheOptions } from "./cookies"

const PERU_FALLBACK_REGION: HttpTypes.StoreRegion = {
  id: "reg_01M01FK2K4G93M9GKDRTPRP6ZB",
  name: "Perú",
  currency_code: "pen",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  deleted_at: null,
  metadata: null,
  countries: [
    {
      id: "count_pe",
      iso_2: "pe",
      iso_3: "per",
      num_code: "604",
      name: "PERU",
      display_name: "Peru",
      region_id: "reg_01M01FK2K4G93M9GKDRTPRP6ZB",
      metadata: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null,
    } as any,
  ],
} as HttpTypes.StoreRegion

export const listRegions = async () => {
  const next = {
    ...(await getCacheOptions("regions")),
  }

  return sdk.client
    .fetch<{ regions: HttpTypes.StoreRegion[] }>(`/store/regions`, {
      method: "GET",
      next,
      cache: "force-cache",
    })
    .then(({ regions }) => (regions && regions.length > 0 ? regions : [PERU_FALLBACK_REGION]))
    .catch(() => [PERU_FALLBACK_REGION])
}

export const retrieveRegion = async (id: string) => {
  const next = {
    ...(await getCacheOptions(["regions", id].join("-"))),
  }

  return sdk.client
    .fetch<{ region: HttpTypes.StoreRegion }>(`/store/regions/${id}`, {
      method: "GET",
      next,
      cache: "force-cache",
    })
    .then(({ region }) => region)
    .catch(() => PERU_FALLBACK_REGION)
}

const regionMap = new Map<string, HttpTypes.StoreRegion>()

export const getRegion = async (countryCode: string = "pe") => {
  try {
    const code = (countryCode || "pe").toLowerCase()
    if (regionMap.has(code)) {
      return regionMap.get(code)
    }

    const regions = await listRegions()

    if (regions && regions.length > 0) {
      regions.forEach((region) => {
        region.countries?.forEach((c) => {
          regionMap.set(c?.iso_2?.toLowerCase() ?? "", region)
        })
      })
    }

    const region = regionMap.get(code) || regionMap.get("pe") || regions?.[0] || PERU_FALLBACK_REGION
    return region
  } catch (e: any) {
    return PERU_FALLBACK_REGION
  }
}
