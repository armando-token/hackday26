import {
  deriveAvailability,
  formatPriceLabel,
  mapMedusaImages,
  mapMedusaStoreProductToCatalogProduct,
  normalizeMediaUrl,
  normalizeSpecs,
  selectLeafCategory,
} from "../catalog-mappers"
import type { CatalogCategory, CatalogVariant } from "../catalog-types"

const VARIANT_BASE: CatalogVariant = {
  id: "variant_1",
  sku: "SKU-1",
  title: "Default",
  manageInventory: true,
  allowBackorder: false,
  inventoryQuantity: 10,
  calculatedPrice: { amount: 99, currencyCode: "pen", originalAmount: null },
  options: [],
  isPurchasable: true,
}

describe("normalizeSpecs", () => {
  it("convierte valores primitivos y omite tipos no representables", () => {
    expect(
      normalizeSpecs({
        Marca: "Novus",
        Peso: 12.5,
        Activo: true,
        vacio: null,
        lista: [1],
        obj: { x: 1 },
      })
    ).toEqual({ Marca: "Novus", Peso: "12.5", Activo: "true" })
  })

  it("rechaza claves duplicadas al normalizar", () => {
    expect(normalizeSpecs({ Marca: "a", marca: "b" })).toEqual({ Marca: "a" })
  })
})

describe("normalizeMediaUrl", () => {
  it("retorna null si la url es nula, indefinida o vacia", () => {
    expect(normalizeMediaUrl(null)).toBeNull()
    expect(normalizeMediaUrl(undefined)).toBeNull()
    expect(normalizeMediaUrl("")).toBeNull()
    expect(normalizeMediaUrl("   ")).toBeNull()
  })

  it("remueve el prefijo de controlnautas.com convirtiendolo a path relativo same-origin", () => {
    expect(
      normalizeMediaUrl("https://controlnautas.com/static/products/sensor.webp")
    ).toBe("/static/products/sensor.webp")
    expect(
      normalizeMediaUrl(
        "https://controlnautas.com/cn-media/products/10714/rockwool-sl920.webp"
      )
    ).toBe("/cn-media/products/10714/rockwool-sl920.webp")
  })

  it("remueve el prefijo www.controlnautas.com (mismo origen público)", () => {
    expect(
      normalizeMediaUrl("https://www.controlnautas.com/static/x.webp")
    ).toBe("/static/x.webp")
    expect(
      normalizeMediaUrl("http://www.controlnautas.com/cn-media/products/a.webp")
    ).toBe("/cn-media/products/a.webp")
  })

  it("remueve el prefijo de localhost:9000 convirtiendolo a path relativo", () => {
    expect(
      normalizeMediaUrl("http://localhost:9000/static/uploads/image-123.jpg")
    ).toBe("/static/uploads/image-123.jpg")
    expect(
      normalizeMediaUrl("http://localhost:9000/uploads/file.png")
    ).toBe("/uploads/file.png")
    expect(
      normalizeMediaUrl("http://127.0.0.1:9000/static/canary.png")
    ).toBe("/static/canary.png")
  })

  it("mantiene intactas urls relativas y de otros origenes", () => {
    expect(normalizeMediaUrl("/cn-media/products/sensor.webp")).toBe(
      "/cn-media/products/sensor.webp"
    )
    expect(normalizeMediaUrl("/thumb.webp")).toBe("/thumb.webp")
    expect(normalizeMediaUrl("https://cdn.example.com/photo.jpg")).toBe(
      "https://cdn.example.com/photo.jpg"
    )
  })
})

describe("mapMedusaImages", () => {
  it("normaliza thumbnail y rawImages y previene duplicados", () => {
    const product = {
      id: "prod_1",
      handle: "prod-1",
      title: "Prod 1",
      thumbnail: "https://controlnautas.com/static/sensor.webp",
      images: [
        { id: "img_1", url: "http://localhost:9000/static/sensor.webp", rank: 0 },
        { id: "img_2", url: "https://controlnautas.com/cn-media/detail.webp", rank: 1 },
        { id: "img_3", url: "", rank: 2 },
      ],
    }

    const { thumbnail, images } = mapMedusaImages(product)
    expect(thumbnail).toBe("/static/sensor.webp")
    expect(images).toHaveLength(2)
    expect(images[0]).toEqual({
      id: "img_1",
      url: "/static/sensor.webp",
      rank: 0,
    })
    expect(images[1]).toEqual({
      id: "img_2",
      url: "/cn-media/detail.webp",
      rank: 1,
    })
  })

  it("agrega el thumbnail como primer elemento si no esta presente en images", () => {
    const product = {
      id: "prod_2",
      handle: "prod-2",
      title: "Prod 2",
      thumbnail: "http://localhost:9000/static/thumb.webp",
      images: [
        { id: "img_1", url: "/static/gallery.webp", rank: 0 },
      ],
    }

    const { thumbnail, images } = mapMedusaImages(product)
    expect(thumbnail).toBe("/static/thumb.webp")
    expect(images).toHaveLength(2)
    expect(images[0]).toEqual({
      id: "thumb_prod_2",
      url: "/static/thumb.webp",
      rank: -1,
    })
    expect(images[1]).toEqual({
      id: "img_1",
      url: "/static/gallery.webp",
      rank: 0,
    })
  })
})

describe("selectLeafCategory", () => {
  it("elige la unica categoria con parentId", () => {
    const categories: CatalogCategory[] = [
      {
        id: "1",
        handle: "padre",
        name: "Padre",
        description: "",
        parentId: null,
        rank: 0,
        isActive: true,
        metadata: null,
      },
      {
        id: "2",
        handle: "hoja",
        name: "Hoja",
        description: "",
        parentId: "1",
        rank: 1,
        isActive: true,
        metadata: null,
      },
    ]
    expect(selectLeafCategory(categories).handle).toBe("hoja")
  })
})

describe("deriveAvailability", () => {
  it("marca discontinued cuando el PIM lo indica", () => {
    expect(deriveAvailability("discontinued", VARIANT_BASE)).toBe("discontinued")
  })

  it("usa inventario cuando manageInventory es true", () => {
    expect(
      deriveAvailability("in_stock", {
        ...VARIANT_BASE,
        inventoryQuantity: 0,
        allowBackorder: true,
      })
    ).toBe("backorder")
  })
})

describe("formatPriceLabel", () => {
  it("muestra consultar precio cuando requiere cotizacion", () => {
    expect(formatPriceLabel(null, true)).toBe("Consultar precio")
  })

  it("formatea PEN", () => {
    expect(
      formatPriceLabel(
        { amount: 119, currencyCode: "pen", originalAmount: null },
        false
      )
    ).toBe("S/ 119.00")
  })
})

describe("mapMedusaStoreProductToCatalogProduct", () => {
  const producto = {
    id: "prod_test",
    handle: "sensor-test",
    title: "Sensor de prueba",
    subtitle: null,
    description: "Descripcion",
    status: "published",
    thumbnail: "/thumb.webp",
    updated_at: "2026-08-31T00:00:00.000Z",
    images: [{ id: "img1", url: "/img.webp", rank: 0 }],
    categories: [
      {
        id: "pcat_parent",
        handle: "sensores",
        name: "Sensores",
        parent_category_id: null,
      },
      {
        id: "pcat_leaf",
        handle: "temperatura",
        name: "Temperatura",
        parent_category_id: "pcat_parent",
      },
    ],
    variants: [
      {
        id: "variant_test",
        sku: "CN-TEST",
        title: "Default",
        manage_inventory: true,
        allow_backorder: false,
        inventory_quantity: 5,
        calculated_price: {
          calculated_amount: 150,
          original_amount: 150,
          currency_code: "pen",
        },
        options: [],
      },
    ],
    brand: {
      id: "brand_1",
      name: "Novus",
      handle: "novus",
      logo_url: null,
    },
    pim_info: {
      id: "pim_1",
      product_id: "prod_test",
      mfr_model: "SMT",
      item_number: "CN-TEST",
      purchase_mode: "buy_now",
      availability_mode: "in_stock",
      lead_time_days: null,
      specs: { Marca: "Novus" },
      seo_title: "Sensor test",
      seo_description: "Desc",
    },
  }

  it("mapea un producto Medusa valido", () => {
    const mapped = mapMedusaStoreProductToCatalogProduct(producto)
    expect(mapped.handle).toBe("sensor-test")
    expect(mapped.pim.itemNumber).toBe("CN-TEST")
    expect(mapped.leafCategory.handle).toBe("temperatura")
    expect(mapped.primaryVariant.id).toBe("variant_test")
    expect(mapped.display.price?.amount).toBe(150)
    expect(mapped.display.canAddToCart).toBe(true)
  })

  it("rechaza producto sin pim_info", () => {
    expect(() =>
      mapMedusaStoreProductToCatalogProduct({ ...producto, pim_info: null })
    ).toThrow(/pim_info/)
  })

  it("elige la variante mas barata cuando hay varias (politica v1 sin selector)", () => {
    const mapped = mapMedusaStoreProductToCatalogProduct({
      ...producto,
      variants: [
        {
          id: "variant_cara",
          sku: "CN-A",
          title: "Cara A",
          manage_inventory: true,
          allow_backorder: false,
          inventory_quantity: 5,
          calculated_price: {
            calculated_amount: 200,
            original_amount: 200,
            currency_code: "pen",
          },
          options: [],
        },
        {
          id: "variant_barata",
          sku: "CN-B",
          title: "Cara B",
          manage_inventory: true,
          allow_backorder: false,
          inventory_quantity: 5,
          calculated_price: {
            calculated_amount: 120,
            original_amount: 120,
            currency_code: "pen",
          },
          options: [],
        },
      ],
    })
    expect(mapped.primaryVariant.id).toBe("variant_barata")
    expect(mapped.display.price?.amount).toBe(120)
  })
})
