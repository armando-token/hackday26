import { ExecArgs } from "@medusajs/framework/types"

export default async function inspectPimService({ container }: ExecArgs) {
  const pimService = container.resolve("b2bPim") as any
  console.log("pimService methods:", Object.getOwnPropertyNames(Object.getPrototypeOf(pimService)))
}
