import { model } from "@medusajs/framework/utils"

export const TechnicalProfile = model.define("technical_profile", {
  id: model.id().primaryKey(),
  variant_id: model.text().unique(),
  model: model.text().nullable(),
  revision: model.text().nullable(),
  demo: model.boolean().default(true),
})
  .indexes([
    {
      name: "IDX_technical_profile_variant_id",
      on: ["variant_id"],
      where: "deleted_at IS NULL",
    },
  ])
