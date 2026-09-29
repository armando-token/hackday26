import { createHmac, randomUUID } from "crypto"

export type CatalogRevalidatePayload = {
  eventId: string
  event: string
  occurredAt: string
  entityId?: string
  productIds?: string[]
  categoryIds?: string[]
  handles?: string[]
  categoryHandles?: string[]
  paths?: string[]
  tags: string[]
}

type LoggerLike = {
  info: (msg: string) => void
  warn: (msg: string) => void
  error: (msg: string) => void
}

const MAX_RETRIES = 3
const TIMEOUT_MS = 3000

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function signBody(secret: string, rawBody: string): {
  timestamp: string
  signature: string
} {
  const timestamp = String(Math.floor(Date.now() / 1000))
  const signature = createHmac("sha256", secret)
    .update(`${timestamp}.${rawBody}`)
    .digest("hex")
  return { timestamp, signature }
}

export async function postCatalogRevalidation(
  payload: CatalogRevalidatePayload,
  options?: { logger?: LoggerLike }
): Promise<{ ok: boolean; replay?: boolean; status?: number }> {
  const url = process.env.STOREFRONT_REVALIDATE_URL
  const secret = process.env.REVALIDATE_SECRET

  if (!url || !secret) {
    options?.logger?.warn(
      "[catalog-revalidate] STOREFRONT_REVALIDATE_URL o REVALIDATE_SECRET no configurados; omitiendo"
    )
    return { ok: false, status: 0 }
  }

  const rawBody = JSON.stringify(payload)
  let lastError: unknown

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const { timestamp, signature } = signBody(secret, rawBody)
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-cn-timestamp": timestamp,
          "x-cn-signature": signature,
        },
        body: rawBody,
        signal: controller.signal,
      })

      if (res.status === 409) {
        options?.logger?.info(
          `[catalog-revalidate] replay ${payload.eventId} (${payload.event})`
        )
        return { ok: true, replay: true, status: 409 }
      }

      if (res.ok) {
        options?.logger?.info(
          `[catalog-revalidate] ok ${payload.event} tags=${payload.tags.length}`
        )
        return { ok: true, status: res.status }
      }

      const body = await res.text().catch(() => "")
      const errMsg = `HTTP ${res.status}: ${body.slice(0, 200)}`

      if (res.status >= 400 && res.status < 500 && res.status !== 409) {
        options?.logger?.error(
          `[catalog-revalidate] error no reintentable ${payload.event}: ${errMsg}`
        )
        return { ok: false, status: res.status }
      }

      lastError = new Error(errMsg)
    } catch (err) {
      lastError = err
    } finally {
      clearTimeout(timer)
    }

    const jitter = Math.floor(Math.random() * 200)
    const backoff = 2 ** attempt * 300 + jitter
    await sleep(backoff)
  }

  const msg =
    lastError instanceof Error ? lastError.message : String(lastError)
  options?.logger?.error(
    `[catalog-revalidate] fallo tras reintentos ${payload.event}: ${msg}`
  )
  return { ok: false }
}

export function buildRevalidatePayload(
  input: Omit<CatalogRevalidatePayload, "eventId" | "occurredAt"> & {
    eventId?: string
  }
): CatalogRevalidatePayload {
  return {
    ...input,
    eventId: input.eventId || randomUUID(),
    occurredAt: new Date().toISOString(),
  }
}
