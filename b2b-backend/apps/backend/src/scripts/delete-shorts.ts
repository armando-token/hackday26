import { ExecArgs } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"
import { assertDestructiveLegacyAllowed } from "./lib/legacy-script-guard"

export default async function removeShorts({ container }: ExecArgs) {
  assertDestructiveLegacyAllowed("delete-shorts.ts")
  const productModule = container.resolve(Modules.PRODUCT)
  const shorts = await productModule.listProducts({ handle: "shorts" })
  if (shorts.length) {
    await productModule.deleteProducts([shorts[0].id])
    console.log("Eliminado producto demo shorts.")
  }
}
