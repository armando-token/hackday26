import { ExecArgs } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"

export default async function testServices({ container }: ExecArgs) {
  const logger = container.resolve("logger")
  const productModule = container.resolve(Modules.PRODUCT)
  const brandService = container.resolve("brandModuleService")
  const pimService = container.resolve("b2bPim")
  
  logger.info(`ProductModule resolved: ${!!productModule}`)
  logger.info(`BrandService resolved: ${!!brandService}`)
  logger.info(`PimService resolved: ${!!pimService}`)
  
  const existingCategories = await productModule.listProductCategories({})
  logger.info(`Existing Categories in DB: ${existingCategories.length}`)
  
  const existingBrands = await brandService.listBrands({})
  logger.info(`Existing Brands in DB: ${existingBrands.length}`)
}
