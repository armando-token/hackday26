import { ExecArgs } from "@medusajs/framework/types"

export default async function inspectPimInstance({ container }: ExecArgs) {
  const pimService = container.resolve("b2bPim") as any
  console.log("pimService instance keys:", Object.keys(pimService))
  console.log("typeof listPimInfos:", typeof pimService.listPimInfos)
  console.log("typeof listPimInfoes:", typeof pimService.listPimInfoes)
}
