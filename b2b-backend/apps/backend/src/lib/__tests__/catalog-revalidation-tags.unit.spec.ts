import { tagsForCategory, tagsForProduct } from "../catalog-revalidation-tags"

describe("catalog-revalidation-tags", () => {
  it("genera tags de producto con handle", () => {
    const tags = tagsForProduct("prod_abc", "sensor-rtd")
    expect(tags).toContain("catalog:products")
    expect(tags).toContain("catalog:product:prod_abc")
    expect(tags).toContain("catalog:handle:sensor-rtd")
    expect(tags).toContain("catalog:feed")
    expect(tags).toContain("catalog:sitemap")
  })

  it("genera tags de categoría", () => {
    const tags = tagsForCategory("pcat_xyz", "unit-heaters")
    expect(tags).toContain("catalog:categories")
    expect(tags).toContain("catalog:category:pcat_xyz")
    expect(tags).toContain("catalog:category-handle:unit-heaters")
  })
})
