import { model } from "@medusajs/framework/utils"

export const PimInfo = model.define("pim_info", {
  id: model.id().primaryKey(),
  product_id: model.text().searchable(),
  mfr_model: model.text().nullable(),
  item_number: model.text().nullable(),
  purchase_mode: model.enum(["buy_now", "quote_only", "contact_for_price", "made_to_order"]).default("buy_now"),
  availability_mode: model.enum(["in_stock", "lead_time", "made_to_order", "discontinued"]).default("in_stock"),
  lead_time_days: model.number().nullable(),
  technical_pdf: model.text().nullable(),
  manual_pdf: model.text().nullable(),
  ip_certification: model.text().nullable(),
  voltage: model.text().nullable(),
  thread_size: model.text().nullable(),
  material: model.text().nullable(),
  oem_brand: model.text().nullable(),
  specs: model.json().nullable(),
  seo_title: model.text().nullable(),
  seo_description: model.text().nullable(),
  og_image: model.text().nullable(),
})
  .indexes([
    {
      // Invariante 2 del plan: product_id unico entre filas no eliminadas.
      // Es la ultima defensa contra la creacion concurrente de dos PIM para el
      // mismo producto (seccion 9.3). Parcial, para que el soft delete no
      // bloquee un alta posterior del mismo producto.
      name: "IDX_pim_info_product_id_unique",
      on: ["product_id"],
      unique: true,
      where: "deleted_at IS NULL",
    },
    {
      // Busqueda por product_id, que es el acceso principal del endpoint Admin.
      name: "IDX_pim_info_product_id",
      on: ["product_id"],
      where: "deleted_at IS NULL",
    },
  ])
