import { model } from "@medusajs/framework/utils"

export const TECHNICAL_PROPERTIES = [
  "mounting",
  "supply_voltage",
  "analog_input",
  "analog_output",
  "protocol",
  "interface",
  "sensor_element",
  "control_function",
]

export type TechnicalProperty =
  | "mounting"
  | "supply_voltage"
  | "analog_input"
  | "analog_output"
  | "protocol"
  | "interface"
  | "sensor_element"
  | "control_function"

export const TechnicalFact = model.define("technical_fact", {
  id: model.id().primaryKey(),
  variant_id: model.text(),
  property: model.enum(TECHNICAL_PROPERTIES),
  normalized_value_json: model.json().nullable(),
  display_value: model.text().nullable(),
  source_id: model.text().nullable(),
  page: model.number().nullable(),
  section: model.text().nullable(),
  excerpt: model.text().nullable(),
  polarity: model.boolean().default(true),
})
  .indexes([
    {
      name: "IDX_technical_fact_variant_id",
      on: ["variant_id"],
      where: "deleted_at IS NULL",
    },
    {
      name: "IDX_technical_fact_property",
      on: ["property"],
      where: "deleted_at IS NULL",
    },
    {
      name: "IDX_technical_fact_source_id",
      on: ["source_id"],
      where: "deleted_at IS NULL",
    },
    {
      name: "IDX_technical_fact_variant_property",
      on: ["variant_id", "property"],
      where: "deleted_at IS NULL",
    },
  ])
