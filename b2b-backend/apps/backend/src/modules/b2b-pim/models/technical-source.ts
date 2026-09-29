import { model } from "@medusajs/framework/utils"

export const TechnicalSource = model.define("technical_source", {
  id: model.id().primaryKey(),
  url: model.text().nullable(),
  kind: model.text().nullable(),
  revision: model.text().nullable(),
  checksum: model.text().nullable(),
  published_at: model.dateTime().nullable(),
})
  .indexes([
    {
      name: "IDX_technical_source_url",
      on: ["url"],
      where: "deleted_at IS NULL",
    },
    {
      name: "IDX_technical_source_checksum",
      on: ["checksum"],
      where: "deleted_at IS NULL",
    },
  ])
