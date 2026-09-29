import { ExecArgs } from "@medusajs/framework/types"

export default async function checkPimTable({ container }: ExecArgs) {
  const pimService = container.resolve("b2bPim") as any
  const count = await pimService.listPimInfoes({})
  console.log("Total PimInfo records in DB:", count.length)
  if (count.length > 0) {
    console.log("Sample PimInfo:", JSON.stringify(count[0], null, 2))
  }
}
