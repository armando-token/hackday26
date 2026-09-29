import { ExecArgs } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"
import { assertDestructiveLegacyAllowed } from "./lib/legacy-script-guard"

export default async function deactivateDemoCategories({ container }: ExecArgs) {
  assertDestructiveLegacyAllowed("deactivate-demo.ts")
  const productModule = container.resolve(Modules.PRODUCT)
  const allCategories = await productModule.listProductCategories({}, { take: 100 })
  for (const cat of allCategories) {
    if (["shirts", "sweatshirts", "pants", "merch"].includes(cat.handle)) {
      await productModule.updateProductCategories(cat.id, {
        is_active: false,
        is_internal: true,
      })
    }
  }
}
