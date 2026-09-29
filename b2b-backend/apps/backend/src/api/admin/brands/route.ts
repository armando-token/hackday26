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

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const brandService = req.scope.resolve("brandModuleService")
  const body = req.body as any

  if (body.id) {
    const updated = await brandService.updateBrands(body)
    return res.json({ brand: updated })
  }

  const created = await brandService.createBrands(body)
  return res.status(201).json({ brand: created })
}
