import { model } from "@medusajs/framework/utils"

export const Brand = model.define("brand", {
  id: model.id().primaryKey(),
  name: model.text().searchable(),
  handle: model.text().unique(),
  description: model.text().nullable(),
  logo_url: model.text().nullable(),
  website_url: model.text().nullable(),
  country_of_origin: model.text().nullable(),
  is_authorized_distributor: model.boolean().default(true),
  sort_order: model.number().default(0),
})
