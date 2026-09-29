import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import fs from "fs"
import path from "path"

/**
 * Sincroniza metadata.wc_id desde products.json (AUD-006).
 *
 *   npx medusa exec ./src/scripts/sync-wc-id-metadata.ts
 *   npx medusa exec ./src/scripts/sync-wc-id-metadata.ts apply
 */

const JSON_PRODUCTS = path.resolve(
  process.cwd(),
  "../../../b2b-storefront/src/lib/cn-catalog/data/products.json"
)

function loadJsonCatalog(): any[] {
  const raw = JSON.parse(fs.readFileSync(JSON_PRODUCTS, "utf8"))
  return Array.isArray(raw) ? raw : raw.products || []
}

export default async function syncWcIdMetadata({ container }: ExecArgs) {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const productModule = container.resolve(Modules.PRODUCT)
  const apply = process.argv.includes("apply")

  const jsonProducts = loadJsonCatalog()
  const wcByHandle = new Map(
    jsonProducts
      .filter((p) => typeof p.wcId === "number" && p.wcId > 0)
      .map((p) => [p.handle, p.wcId])
  )

  const { data: products } = await query.graph({
    entity: "product",
    fields: ["id", "handle", "metadata"],
    pagination: { take: 5000, skip: 0 },
  })

  let updates = 0

  for (const product of products || []) {
    const handle = (product as any).handle
    const expected = wcByHandle.get(handle)
    if (!expected) continue

    const current = Number((product as any).metadata?.wc_id)
    if (current === expected) continue

    updates++
    console.log(
      `${apply ? "[apply]" : "[dry]"} ${handle}: wc_id ${current || "—"} -> ${expected}`
    )

    if (apply) {
      await productModule.updateProducts((product as any).id, {
        metadata: {
          ...((product as any).metadata || {}),
          wc_id: expected,
        },
      })
    }
  }

  console.log(`\nTotal actualizaciones wc_id: ${updates}`)
}
