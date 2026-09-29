import B2bPimService from "./service"
import { Module } from "@medusajs/framework/utils"

export const B2B_PIM_MODULE = "b2bPim"

export default Module(B2B_PIM_MODULE, {
  service: B2bPimService,
})
