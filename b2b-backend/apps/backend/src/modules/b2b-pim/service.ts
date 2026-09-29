import { MedusaService } from "@medusajs/framework/utils"
import { PimInfo } from "./models/pim-info"
import { TechnicalProfile } from "./models/technical-profile"
import { TechnicalFact } from "./models/technical-fact"
import { TechnicalSource } from "./models/technical-source"

class B2bPimService extends MedusaService({
  PimInfo,
  TechnicalProfile,
  TechnicalFact,
  TechnicalSource,
}) {}

export default B2bPimService
