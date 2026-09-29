import { ExecArgs } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"
import { assertDestructiveLegacyAllowed } from "./lib/legacy-script-guard"

export default async function activateCategories({ container }: ExecArgs) {
  assertDestructiveLegacyAllowed("activate-categories.ts")
  const logger = container.resolve("logger")
  const productModule = container.resolve(Modules.PRODUCT)

  const allCategories = await productModule.listProductCategories({}, { take: 100 })
  logger.info(`Total categories found in DB: ${allCategories.length}`)

  for (const cat of allCategories) {
    if (["shirts", "sweatshirts", "pants", "merch"].includes(cat.handle)) {
      try {
        await productModule.deleteProductCategories([cat.id])
        logger.info(`🧹 Eliminada demo: ${cat.name}`)
      } catch (e) {}
    } else {
      try {
        await productModule.updateProductCategories(cat.id, {
          is_active: true,
          is_internal: false,
        })
        logger.info(`✅ Activada: ${cat.name} (${cat.handle})`)
      } catch (e: any) {
        logger.warn(`Error activando ${cat.name}: ${e.message}`)
      }
    }
  }

  logger.info("Activación de categorías completada.")
}
