jest.mock("server-only", () => ({}))

import {
  mapMedusaCategoryToNode,
  type MedusaStoreCategoryNode,
} from "../catalog-category-tree"
import {
  familyImage,
  leafImage,
  getCategoryImageUrl,
  CN_FAMILY_IMAGES,
} from "@lib/cn-catalog"

describe("mapMedusaCategoryToNode - Category Images Mapping", () => {
  it("uses raw metadata.image_url when already a relative path (/static/...)", () => {
    const raw: MedusaStoreCategoryNode = {
      id: "pcat_01",
      handle: "control-e-indicacion",
      name: "Control e Indicación",
      metadata: {
        image_url: "/static/categories/control-e-indicacion-v2.webp",
      },
    }

    const node = mapMedusaCategoryToNode(raw)

    expect(node.imageUrl).toBe(
      "/static/categories/control-e-indicacion-v2.webp"
    )
    expect(node.metadata).toEqual({
      image_url: "/static/categories/control-e-indicacion-v2.webp",
    })
  })

  it("normalizes full origin https://controlnautas.com/static/... to /static/...", () => {
    const raw: MedusaStoreCategoryNode = {
      id: "pcat_02",
      handle: "sensores-transmisores",
      name: "Sensores y Transmisores",
      metadata: {
        image_url:
          "https://controlnautas.com/static/categories/sensores-transmisores.webp",
      },
    }

    const node = mapMedusaCategoryToNode(raw)

    expect(node.imageUrl).toBe(
      "/static/categories/sensores-transmisores.webp"
    )
  })

  it("normalizes localhost:9000 and 127.0.0.1:9000 URLs to relative paths", () => {
    const rawLocalhost: MedusaStoreCategoryNode = {
      id: "pcat_03",
      handle: "aislamiento-termico",
      name: "Aislamiento Térmico",
      metadata: {
        image_url: "http://localhost:9000/static/categories/aislamiento.webp",
      },
    }

    const raw127: MedusaStoreCategoryNode = {
      id: "pcat_04",
      handle: "calefaccion-electrica",
      name: "Calefacción Eléctrica",
      metadata: {
        image_url: "http://127.0.0.1:9000/uploads/categories/calefaccion.webp",
      },
    }

    expect(mapMedusaCategoryToNode(rawLocalhost).imageUrl).toBe(
      "/static/categories/aislamiento.webp"
    )
    expect(mapMedusaCategoryToNode(raw127).imageUrl).toBe(
      "/uploads/categories/calefaccion.webp"
    )
  })

  it("falls back to familyImage(raw.handle) when metadata is null or undefined", () => {
    const rawNullMeta: MedusaStoreCategoryNode = {
      id: "pcat_05",
      handle: "control-e-indicacion",
      name: "Control e Indicación",
      metadata: null,
    }

    const rawUndefinedMeta: MedusaStoreCategoryNode = {
      id: "pcat_06",
      handle: "control-e-indicacion",
      name: "Control e Indicación",
    }

    const nodeNull = mapMedusaCategoryToNode(rawNullMeta)
    const nodeUndefined = mapMedusaCategoryToNode(rawUndefinedMeta)

    const expectedFallback = CN_FAMILY_IMAGES["control-e-indicacion"]
    expect(expectedFallback).toBeDefined()
    expect(nodeNull.imageUrl).toBe(expectedFallback)
    expect(nodeNull.metadata).toBeNull()
    expect(nodeUndefined.imageUrl).toBe(expectedFallback)
    expect(nodeUndefined.metadata).toBeNull()
  })

  it("falls back to familyImage when metadata.image_url is empty string or whitespace", () => {
    const rawEmpty: MedusaStoreCategoryNode = {
      id: "pcat_07",
      handle: "control-e-indicacion",
      name: "Control e Indicación",
      metadata: {
        image_url: "   ",
      },
    }

    const node = mapMedusaCategoryToNode(rawEmpty)
    expect(node.imageUrl).toBe(CN_FAMILY_IMAGES["control-e-indicacion"])
  })

  it("falls back to default fallback if handle is unknown and metadata has no image", () => {
    const rawUnknown: MedusaStoreCategoryNode = {
      id: "pcat_unknown",
      handle: "categoria-totalmente-nueva",
      name: "Nueva Categoría",
      metadata: null,
    }

    const node = mapMedusaCategoryToNode(rawUnknown)
    expect(node.imageUrl).toBe("/cn-media/categories/calefaccion-electrica.webp")
  })

  it("maps children categories recursively with their own imageUrl and metadata", () => {
    const raw: MedusaStoreCategoryNode = {
      id: "pcat_parent",
      handle: "sensores-transmisores",
      name: "Sensores y Transmisores",
      metadata: {
        image_url: "/static/categories/parent.webp",
      },
      category_children: [
        {
          id: "pcat_child_1",
          handle: "temperatura-termopar-rtd",
          name: "Sensores de Temperatura",
          rank: 1,
          metadata: {
            image_url:
              "https://controlnautas.com/static/categories/temp-override.webp",
          },
        },
        {
          id: "pcat_child_2",
          handle: "transmisores-temperatura",
          name: "Transmisores de Temperatura",
          rank: 2,
          metadata: null, // should fall back
        },
      ],
    }

    const node = mapMedusaCategoryToNode(raw)

    expect(node.imageUrl).toBe("/static/categories/parent.webp")
    expect(node.children).toHaveLength(2)

    const [child1, child2] = node.children!
    expect(child1.imageUrl).toBe("/static/categories/temp-override.webp")
    expect(child1.metadata).toEqual({
      image_url:
        "https://controlnautas.com/static/categories/temp-override.webp",
    })

    expect(child2.imageUrl).toBe(CN_FAMILY_IMAGES["transmisores-temperatura"])
    expect(child2.metadata).toBeNull()
  })
})

describe("category-images helpers backward compatibility and node support", () => {
  it("familyImage accepts string handle", () => {
    expect(familyImage("control-e-indicacion")).toBe(
      CN_FAMILY_IMAGES["control-e-indicacion"]
    )
  })

  it("familyImage accepts CnCategoryNode with imageUrl override", () => {
    const node = {
      slug: "control-e-indicacion",
      name: "Control e Indicación",
      imageUrl: "/static/custom-category.webp",
    }
    expect(familyImage(node)).toBe("/static/custom-category.webp")
    expect(leafImage(node)).toBe("/static/custom-category.webp")
    expect(getCategoryImageUrl(node)).toBe("/static/custom-category.webp")
  })

  it("familyImage accepts CnCategoryNode without imageUrl override and falls back to json/default", () => {
    const node = {
      slug: "control-e-indicacion",
      name: "Control e Indicación",
    }
    expect(familyImage(node)).toBe(CN_FAMILY_IMAGES["control-e-indicacion"])
    expect(getCategoryImageUrl(node)).toBe(
      CN_FAMILY_IMAGES["control-e-indicacion"]
    )
  })

  it("getCategoryImageUrl accepts string slug", () => {
    expect(getCategoryImageUrl("control-e-indicacion")).toBe(
      CN_FAMILY_IMAGES["control-e-indicacion"]
    )
  })
})
