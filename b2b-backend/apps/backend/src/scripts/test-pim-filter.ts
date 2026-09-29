import { ExecArgs } from "@medusajs/framework/types"

export default async function testPimFilter({ container }: ExecArgs) {
  const pimService = container.resolve("b2bPim") as any
  const res = await pimService.listPimInfos({ product_id: "prod_01M01FKGPJJSJNPY726GJZSBKC" })
  console.log("PIM Result for prod_01M01FKGPJJSJNPY726GJZSBKC:", res)
}
