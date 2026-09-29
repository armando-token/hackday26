import { createHmac } from "crypto"
import {
  buildRevalidatePayload,
  postCatalogRevalidation,
} from "../../lib/catalog-revalidation-client"
import { tagsForProduct } from "../../lib/catalog-revalidation-tags"

describe("catalog-revalidation-client", () => {
  const SECRET =
    "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"

  beforeEach(() => {
    process.env.REVALIDATE_SECRET = SECRET
    process.env.STOREFRONT_REVALIDATE_URL =
      "http://localhost:8000/api/internal/catalog/revalidate"
  })

  it("firma el body con HMAC-SHA256", async () => {
    const payload = buildRevalidatePayload({
      event: "product.updated",
      productIds: ["prod_test"],
      tags: tagsForProduct("prod_test", "sensor-rtd"),
    })

    let capturedTimestamp = ""
    let capturedSignature = ""
    let capturedBody = ""

    global.fetch = jest.fn(async (_url, init) => {
      capturedTimestamp = (init?.headers as Record<string, string>)?.[
        "x-cn-timestamp"
      ]
      capturedSignature = (init?.headers as Record<string, string>)?.[
        "x-cn-signature"
      ]
      capturedBody = String(init?.body)
      return new Response(JSON.stringify({ ok: true }), { status: 200 })
    }) as typeof fetch

    const result = await postCatalogRevalidation(payload)
    expect(result.ok).toBe(true)

    const expected = createHmac("sha256", SECRET)
      .update(`${capturedTimestamp}.${capturedBody}`)
      .digest("hex")
    expect(capturedSignature).toBe(expected)
  })

  it("trata 409 como éxito (replay)", async () => {
    const payload = buildRevalidatePayload({
      event: "b2b-pim.updated",
      productIds: ["prod_x"],
      tags: tagsForProduct("prod_x"),
    })

    global.fetch = jest.fn(async () => {
      return new Response(JSON.stringify({ replay: true }), { status: 409 })
    }) as typeof fetch

    const result = await postCatalogRevalidation(payload)
    expect(result.ok).toBe(true)
    expect(result.replay).toBe(true)
  })
})
