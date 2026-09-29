import {
  getTechnicalProfile,
  getTechnicalFacts,
  getTechnicalSources,
  searchDemoVariants,
  isDemoVariant,
  closePool,
} from "../db"

describe("Muse Database Helper (db.ts)", () => {
  afterAll(async () => {
    await closePool()
  })

  describe("searchDemoVariants", () => {
    it("should list all 3 demonstration variants when no query is specified", async () => {
      const results = await searchDemoVariants()
      expect(results).toHaveLength(3)
      for (const item of results) {
        expect(item.demo).toBe(true)
        expect(item.sku).toMatch(/^CN-DEMO-/)
        expect(item.variant_id).toBeTruthy()
        expect(item.product_title).toBeTruthy()
        expect(typeof item.price_pen).toBe("number")
        expect(typeof item.stock).toBe("number")
      }
    })

    it("should filter variants by search query q", async () => {
      const plc = await searchDemoVariants("PLC")
      expect(plc).toHaveLength(1)
      expect(plc[0].sku).toBe("CN-X5PRIME-HE-XP5")

      const pid = await searchDemoVariants("PID")
      expect(pid).toHaveLength(1)
      expect(pid[0].sku).toBe("CN-N1200")

      const rtd = await searchDemoVariants("Pt100")
      expect(rtd.length).toBeGreaterThanOrEqual(1)
    })

    it("should respect limit parameter", async () => {
      const limited = await searchDemoVariants("", 1)
      expect(limited).toHaveLength(1)
    })
  })

  describe("getTechnicalProfile", () => {
    it("should retrieve profile by native variant_id", async () => {
      const all = await searchDemoVariants()
      const target = all[0]

      const profile = await getTechnicalProfile(target.variant_id)
      expect(profile).not.toBeNull()
      expect(profile?.variant_id).toBe(target.variant_id)
      expect(profile?.demo).toBe(true)
      expect(profile?.sku).toBe(target.sku)
      expect(profile?.model).toBe(target.model)
    })

    it("should retrieve profile by SKU", async () => {
      const profile = await getTechnicalProfile("CN-X5PRIME-HE-XP5")
      expect(profile).not.toBeNull()
      expect(profile?.sku).toBe("CN-X5PRIME-HE-XP5")
      expect(profile?.model).toBe("CN-DIN-PLC-A1")
    })

    it("should return null for non-existent or empty IDs", async () => {
      expect(await getTechnicalProfile("variant_non_existent")).toBeNull()
      expect(await getTechnicalProfile("")).toBeNull()
    })
  })

  describe("getTechnicalFacts", () => {
    it("should retrieve technical facts by variant_id ordered by page and property", async () => {
      const all = await searchDemoVariants("CN-X5PRIME-HE-XP5")
      const target = all[0]

      const facts = await getTechnicalFacts(target.variant_id)
      expect(facts.length).toBeGreaterThan(0)

      for (const fact of facts) {
        expect(fact.variant_id).toBe(target.variant_id)
        expect(fact.property).toBeTruthy()
        expect(fact.display_value).toBeTruthy()
        expect(fact.source_id).toBeTruthy()
        expect(typeof fact.polarity).toBe("boolean")
      }

      // Check sorting: pages should be non-decreasing
      for (let i = 1; i < facts.length; i++) {
        const prevPage = facts[i - 1].page || 0
        const currPage = facts[i].page || 0
        expect(currPage).toBeGreaterThanOrEqual(prevPage)
      }
    })

    it("should retrieve technical facts by SKU", async () => {
      const facts = await getTechnicalFacts("CN-N1200")
      expect(facts.length).toBe(8)
      const properties = facts.map((f) => f.property)
      expect(properties).toContain("mounting")
      expect(properties).toContain("supply_voltage")
      expect(properties).toContain("analog_output")
    })

    it("should return empty array for non-existent variants", async () => {
      expect(await getTechnicalFacts("variant_does_not_exist")).toEqual([])
      expect(await getTechnicalFacts("")).toEqual([])
    })
  })

  describe("getTechnicalSources", () => {
    it("should retrieve sources by IDs", async () => {
      const sources = await getTechnicalSources([
        "SRC-CN-DIN-PLC-A1-DS-V1",
        "SRC-CN-PID-T1-DS-V1",
      ])
      expect(sources).toHaveLength(2)
      expect(sources[0].id).toBe("SRC-CN-DIN-PLC-A1-DS-V1")
      expect(sources[0].url).toContain(".pdf")
      expect(sources[0].kind).toBe("datasheet")
      expect(sources[0].checksum).toBeTruthy()
    })

    it("should return empty array when sourceIds is empty or invalid", async () => {
      expect(await getTechnicalSources([])).toEqual([])
      expect(await getTechnicalSources(["non-existent-source-id"])).toEqual([])
    })
  })

  describe("isDemoVariant", () => {
    it("should return true for valid demo variants and false otherwise", async () => {
      expect(await isDemoVariant("CN-X5PRIME-HE-XP5")).toBe(true)
      expect(await isDemoVariant("non-existent-variant")).toBe(false)
    })
  })
})
