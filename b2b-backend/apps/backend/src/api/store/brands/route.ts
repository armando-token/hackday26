import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const brandService = req.scope.resolve("brandModuleService")
  const [brands, count] = await brandService.listAndCountBrands(
    {},
    {
      order: { sort_order: "ASC", name: "ASC" },
    }
  )

  res.json({
    brands,
    count,
  })
}
