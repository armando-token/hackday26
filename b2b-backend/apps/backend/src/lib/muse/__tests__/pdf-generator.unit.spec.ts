import * as crypto from "node:crypto"
import * as fs from "node:fs"
import * as path from "node:path"
import { generateQuotePdf, GenerateQuotePdfResult } from "../pdf-generator"

describe("Muse PDF Generator Wrapper", () => {
  const generatedFilesToCleanup: string[] = []

  afterAll(async () => {
    // Cleanup generated test files
    for (const file of generatedFilesToCleanup) {
      try {
        if (fs.existsSync(file)) {
          await fs.promises.unlink(file)
        }
      } catch {
        // Silently ignore cleanup errors
      }
    }
  })

  it("should generate a valid PDF for a priced quote via temp JSON file", async () => {
    const testOpaqueId = `test_priced_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`
    const expectedFilePath = `/home/ubuntu/hackday26/storage/quotes/${testOpaqueId}.pdf`
    generatedFilesToCleanup.push(expectedFilePath)

    const quoteData = {
      quote_id: "QT-TEST-2026-PRICED",
      opaque_public_id: testOpaqueId,
      status: "priced",
      sku: "CN-DEMO-PLC-DIN-420-MR1",
      model: "CN-DIN-PLC-A1",
      title: "Controlador Lógico Programable DIN 4-20mA 8DI/4DO",
      quantity: 2,
      currency: "PEN",
      unit_price: 890.0,
      subtotal: 1780.0,
      availability: "Disponible en Almacén Central Lima (Despacho 24-48h)",
      observed_at: "2026-09-29T19:30:00Z",
      expires_at: "2026-09-30T19:30:00Z",
    }

    const result: GenerateQuotePdfResult = await generateQuotePdf(quoteData)

    // Check return values
    expect(result).toBeDefined()
    expect(result.filePath).toBe(expectedFilePath)
    expect(result.storageKey).toBe(`quotes/${testOpaqueId}.pdf`)
    expect(result.checksum).toMatch(/^[a-f0-9]{64}$/)

    // Verify file existence on disk
    expect(fs.existsSync(result.filePath)).toBe(true)

    // Verify file size is > 1000 bytes
    const stats = await fs.promises.stat(result.filePath)
    expect(stats.size).toBeGreaterThan(1000)

    // Verify SHA-256 checksum matches disk content
    const fileBytes = await fs.promises.readFile(result.filePath)
    const expectedChecksum = crypto
      .createHash("sha256")
      .update(fileBytes)
      .digest("hex")
    expect(result.checksum).toBe(expectedChecksum)
  })

  it("should generate a valid PDF for a manual_review quote without prices", async () => {
    const testOpaqueId = `test_manual_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`
    const expectedFilePath = `/home/ubuntu/hackday26/storage/quotes/${testOpaqueId}.pdf`
    generatedFilesToCleanup.push(expectedFilePath)

    const quoteData = {
      quote_id: "QT-TEST-2026-MANUAL",
      opaque_public_id: testOpaqueId,
      status: "manual_review",
      sku: "CN-DEMO-PID-PT100-RS1",
      model: "CN-PID-T1",
      title: "Controlador PID Temperatura Industrial Doble Display RS-485",
      quantity: 50,
      currency: "PEN",
      reason:
        "Volumen excede el umbral automático; requiere validación técnica y comercial.",
      availability: "Sujeto a confirmación por ingeniería de proyectos",
      observed_at: "2026-09-29T19:30:00Z",
      expires_at: "2026-09-30T19:30:00Z",
    }

    const result = await generateQuotePdf(quoteData)

    expect(result.filePath).toBe(expectedFilePath)
    expect(result.storageKey).toBe(`quotes/${testOpaqueId}.pdf`)
    expect(result.checksum).toHaveLength(64)

    const stats = await fs.promises.stat(result.filePath)
    expect(stats.size).toBeGreaterThan(1000)
  })

  it("should support generating PDF via stdin option", async () => {
    const testOpaqueId = `test_stdin_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`
    const expectedFilePath = `/home/ubuntu/hackday26/storage/quotes/${testOpaqueId}.pdf`
    generatedFilesToCleanup.push(expectedFilePath)

    const quoteData = {
      quote_id: "QT-TEST-2026-STDIN",
      opaque_public_id: testOpaqueId,
      status: "priced",
      sku: "CN-DEMO-PT100-3W-A1",
      model: "CN-RTD-P1",
      title: "Sensor Pt100 Industrial 3 Hilos Clase A Acero Inox",
      quantity: 5,
      currency: "PEN",
      unit_price: 185.0,
      subtotal: 925.0,
      availability: "En stock inmediato (Almacén Callao)",
      observed_at: "2026-09-29T19:30:00Z",
      expires_at: "2026-09-30T19:30:00Z",
    }

    const result = await generateQuotePdf(quoteData, { useStdin: true })

    expect(result.filePath).toBe(expectedFilePath)
    expect(fs.existsSync(result.filePath)).toBe(true)
    const stats = await fs.promises.stat(result.filePath)
    expect(stats.size).toBeGreaterThan(1000)
  })

  it("should reject when quoteData is missing or invalid", async () => {
    await expect(generateQuotePdf(null as any)).rejects.toThrow(
      /Invalid quoteData argument/
    )
    await expect(generateQuotePdf(undefined as any)).rejects.toThrow(
      /Invalid quoteData argument/
    )
    await expect(generateQuotePdf("invalid-string" as any)).rejects.toThrow(
      /Invalid quoteData argument/
    )
  })

  it("should reject when opaque_public_id is missing or empty", async () => {
    await expect(generateQuotePdf({} as any)).rejects.toThrow(
      /opaque_public_id is required/
    )
    await expect(
      generateQuotePdf({ opaque_public_id: "" } as any)
    ).rejects.toThrow(/opaque_public_id is required/)
    await expect(
      generateQuotePdf({ opaque_public_id: "   " } as any)
    ).rejects.toThrow(/opaque_public_id is required/)
  })

  it("should reject path traversal in opaque_public_id", async () => {
    await expect(
      generateQuotePdf({ opaque_public_id: "../../etc/passwd" } as any)
    ).rejects.toThrow(/contains invalid characters/)
    await expect(
      generateQuotePdf({ opaque_public_id: "foo/bar" } as any)
    ).rejects.toThrow(/contains invalid characters/)
  })

  it("should reject gracefully when python script path does not exist", async () => {
    await expect(
      generateQuotePdf(
        { opaque_public_id: "test_missing_script" },
        { scriptPath: "/path/that/does/not/exist/fake.py" }
      )
    ).rejects.toThrow(/Python script not found at expected path/)
  })

  it("should reject gracefully when python execution fails", async () => {
    await expect(
      generateQuotePdf(
        { opaque_public_id: "test_error" },
        { pythonBin: "/bin/sh", scriptPath: "/bin/false" }
      )
    ).rejects.toThrow(/Python PDF generator failed with exit code/)
  })
})
