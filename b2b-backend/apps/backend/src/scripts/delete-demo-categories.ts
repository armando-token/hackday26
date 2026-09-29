import { ExecArgs } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"
import { assertDestructiveLegacyAllowed } from "./lib/legacy-script-guard"

export default async function removeDemoCategories({ container }: ExecArgs) {
  assertDestructiveLegacyAllowed("delete-demo-categories.ts")
  const productModule = container.resolve(Modules.PRODUCT)
  const allCategories = await productModule.listProductCategories({}, { take: 100 })
  const demoIds = allCategories
    .filter((c: any) => ["shirts", "sweatshirts", "pants", "merch"].includes(c.handle))
    .map((c: any) => c.id)

  if (demoIds.length) {
    await productModule.deleteProductCategories(demoIds)
    console.log(`Eliminadas ${demoIds.length} categorías demo.`)
  }
}
