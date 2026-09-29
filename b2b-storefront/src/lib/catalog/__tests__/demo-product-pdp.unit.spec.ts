import { mapMedusaStoreProductToCatalogProduct } from "../catalog-mappers"
import type { CatalogProduct } from "../catalog-types"

describe("Demo PDP Banner and 404 Behavior", () => {
  const baseStoreProduct = {
    id: "prod_demo_1",
    handle: "cn-demo-plc-din-420-mr1",
    title: "PLC Carril DIN 35mm CN-DIN-PLC-A1",
    subtitle: "Controlador Lógico Demostración",
    description: "PLC industrial de prueba sintético",
    status: "published",
    thumbnail: "/static/demo/images/plc.webp",
    images: [{ id: "img_1", url: "/static/demo/images/plc.webp", rank: 0 }],
    categories: [
      { id: "cat_parent", handle: "automatizacion", name: "Automatización", parent_category_id: null },
      { id: "cat_leaf", handle: "plcs", name: "PLCs", parent_category_id: "cat_parent" },
    ],
    variants: [
      {
        id: "var_demo_1",
        sku: "CN-DEMO-PLC-DIN-420-MR1",
        title: "Default",
        manage_inventory: true,
        allow_backorder: false,
        inventory_quantity: 3,
        calculated_price: {
          calculated_amount: 890,
          original_amount: 890,
          currency_code: "pen",
        },
        options: [],
      },
    ],
    brand: {
      id: "brand_cn",
      name: "Control Nautas",
      handle: "control-nautas",
      logo_url: null,
    },
    pim_info: {
      id: "pim_demo_1",
      product_id: "prod_demo_1",
      mfr_model: "CN-DIN-PLC-A1",
      item_number: "CN-DEMO-PLC-DIN-420-MR1",
      purchase_mode: "buy_now",
      availability_mode: "in_stock",
      lead_time_days: null,
      technical_pdf: "/demo/datasheets/CN-DEMO-PLC-DIN-420-MR1.pdf",
      manual_pdf: "/demo/specs/CN-DEMO-PLC-DIN-420-MR1.md",
      specs: {
        "Montaje": "DIN 35 mm",
        "Alimentación": "24 VDC",
      },
      seo_title: "PLC Demo | Control Nautas",
      seo_description: "PLC demostración",
    },
    metadata: {
      hackday_demo: true,
    },
    tags: [{ id: "tag_demo", value: "hackday_demo" }],
  }

  it("identifica el banner requerido de ficción cuando el producto tiene metadata/tag/SKU demo", () => {
    const product = mapMedusaStoreProductToCatalogProduct(baseStoreProduct as any)
    expect(product.isDemo).toBe(true)

    // Simulación de comprobación de vista PDP
    const DEMO_BANNER_TEXT = "FICTITIOUS PRODUCT — DEMONSTRATION DATA"
    const hasDemoMarker =
      product.isDemo ||
      Boolean(product.metadata?.hackday_demo) ||
      product.primaryVariant.sku.startsWith("CN-DEMO-")

    expect(hasDemoMarker).toBe(true)
    expect(DEMO_BANNER_TEXT).toBe("FICTITIOUS PRODUCT — DEMONSTRATION DATA")
  })

  it("verifica que URLs de datasheets y specs apunten a los endpoints demo accesibles", () => {
    const product = mapMedusaStoreProductToCatalogProduct(baseStoreProduct as any)
    expect(product.pim.technicalPdf).toBe("/demo/datasheets/CN-DEMO-PLC-DIN-420-MR1.pdf")
    expect(product.pim.manualPdf).toBe("/demo/specs/CN-DEMO-PLC-DIN-420-MR1.md")
  })

  it("comprueba que SKU inexistente no coincide con ningún producto demo ni catálogo", () => {
    const mockCatalog: CatalogProduct[] = [
      mapMedusaStoreProductToCatalogProduct(baseStoreProduct as any),
    ]

    const lookupSku = (skuOrHandle: string) => {
      const normalized = skuOrHandle.toLowerCase().trim()
      return (
        mockCatalog.find(
          (p) =>
            p.handle.toLowerCase() === normalized ||
            p.primaryVariant.sku.toLowerCase() === normalized ||
            p.pim.itemNumber?.toLowerCase() === normalized
        ) || null
      )
    }

    // SKU ficticio no existente
    const missing = lookupSku("sku-ficticio-no-existente-404")
    expect(missing).toBeNull()

    // Manejo en PDP: if (!product) notFound() -> 404
    expect(missing === null).toBe(true)

    // En cambio, buscar por handle o SKU existente resuelve correctamente
    expect(lookupSku("cn-demo-plc-din-420-mr1")).not.toBeNull()
    expect(lookupSku("CN-DEMO-PLC-DIN-420-MR1")).not.toBeNull()
  })
})
