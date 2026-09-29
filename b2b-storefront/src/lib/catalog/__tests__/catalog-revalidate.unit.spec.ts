import { createHmac } from "crypto"
import {
  executeCatalogRevalidation,
  isAllowedCatalogTag,
  isReplayEvent,
  parseCatalogRevalidateBody,
  resetRevalidateIdempotencyForTests,
  verifyCatalogRevalidateSignature,
} from "../catalog-revalidate-handler"

jest.mock("next/cache", () => ({
  revalidateTag: jest.fn(),
  revalidatePath: jest.fn(),
}))

const SECRET =
  "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"

describe("catalog-revalidate-handler", () => {
  beforeEach(() => {
    resetRevalidateIdempotencyForTests()
  })

  it("verifica firma HMAC válida", () => {
    const body = JSON.stringify({
      eventId: "evt-1",
      event: "product.updated",
      occurredAt: new Date().toISOString(),
      productIds: ["prod_01"],
      tags: ["catalog:products", "catalog:product:prod_01"],
    })
    const timestamp = String(Math.floor(Date.now() / 1000))
    const signature = createHmac("sha256", SECRET)
      .update(`${timestamp}.${body}`)
      .digest("hex")

    const result = verifyCatalogRevalidateSignature(
      SECRET,
      timestamp,
      body,
      signature
    )
    expect(result.ok).toBe(true)
  })

  it("rechaza firma inválida", () => {
    const result = verifyCatalogRevalidateSignature(
      SECRET,
      String(Math.floor(Date.now() / 1000)),
      "{}",
      "deadbeef"
    )
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.status).toBe(401)
  })

  it("valida tags permitidos y rechaza arbitrarios", () => {
    expect(isAllowedCatalogTag("catalog:product:prod_01")).toBe(true)
    expect(isAllowedCatalogTag("evil:tag")).toBe(false)

    const body = JSON.stringify({
      eventId: "evt-2",
      event: "product.updated",
      occurredAt: new Date().toISOString(),
      tags: ["evil:tag"],
    })

    const parsed = parseCatalogRevalidateBody(body)
    expect(parsed.ok).toBe(false)
  })

  it("detecta replay por eventId", () => {
    const payload = {
      eventId: "evt-replay",
      event: "product.updated",
      occurredAt: new Date().toISOString(),
      tags: ["catalog:products"],
    }

    const first = executeCatalogRevalidation(payload)
    expect(first.replay).toBe(false)

    const second = executeCatalogRevalidation(payload)
    expect(second.replay).toBe(true)
    expect(isReplayEvent("evt-replay")).toBe(true)
  })
})
