import B2bPimModule from "../modules/b2b-pim"
import ProductModule from "@medusajs/medusa/product"
import { defineLink } from "@medusajs/framework/utils"

/**
 * Enlace inverso de solo lectura entre Product y PimInfo.
 *
 * Plan maestro, seccion 8.1. Aprovecha el product_id que PimInfo ya almacena en
 * lugar de crear una tabla pivote, por lo que no hay que crear ni destruir
 * Remote Links al guardar. La unicidad se impone donde corresponde: en un indice
 * unico parcial sobre pim_info.product_id.
 *
 * El alias que Query genere para esta relacion NO debe darse por supuesto; lo
 * fija el test de contrato y de ahi lo consume el storefront.
 */
export default defineLink(
  {
    linkable: ProductModule.linkable.product,
    field: "id",
  },
  {
    ...B2bPimModule.linkable.pimInfo.id,
    primaryKey: "product_id",
  },
  {
    readOnly: true,
  }
)
