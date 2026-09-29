import { MedusaService } from "@medusajs/framework/utils"
import { PimInfo } from "./models/pim-info"

class B2bPimService extends MedusaService({
  PimInfo,
}) {}

export default B2bPimService
