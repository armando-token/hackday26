"use server"

import { sdk } from "@lib/config"
import medusaError from "@lib/util/medusa-error"
import { HttpTypes } from "@medusajs/types"
import { getCacheOptions } from "./cookies"

const US_FALLBACK_REGION: HttpTypes.StoreRegion = {
  id: "reg_01JUS00HACKDAY26DEMOUSD0000",
  name: "United States",
  currency_code: "usd",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  deleted_at: null,
  metadata: null,
  countries: [
    {
      id: "count_us",
      iso_2: "us",
      iso_3: "usa",
      num_code: "840",
      name: "UNITED STATES",
      display_name: "United States",
      region_id: "reg_01JUS00HACKDAY26DEMOUSD0000",
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
    .then(({ regions }) => (regions && regions.length > 0 ? regions : [US_FALLBACK_REGION]))
    .catch(() => [US_FALLBACK_REGION])
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
    .catch(() => US_FALLBACK_REGION)
}

const regionMap = new Map<string, HttpTypes.StoreRegion>()

export const getRegion = async (countryCode: string = "us") => {
  try {
    const code = (countryCode || "us").toLowerCase()
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

    const region = regionMap.get(code) || regionMap.get("us") || regions?.[0] || US_FALLBACK_REGION
    return region
  } catch (e: any) {
    return US_FALLBACK_REGION
  }
}
