import { ExecArgs } from "@medusajs/framework/types"
import { createProductsWorkflow } from "@medusajs/medusa/core-flows"
import { assertDestructiveLegacyAllowed } from "./lib/legacy-script-guard"

export default async function b2bSeed({ container }: ExecArgs) {
  assertDestructiveLegacyAllowed("b2b-seed.ts")
  const logger = container.resolve("logger")
  const pimService = container.resolve("b2bPim")

  logger.info("Iniciando B2B Industrial Seed...")

  // Data industrial mock
  const industrialProducts = [
    {
      title: "Motor Eléctrico Trifásico 5HP",
      handle: "mfr-motor-5hp-3ph",
      description: "Motor industrial de alta eficiencia para uso continuo. Carcasa de hierro fundido.",
      options: [{ title: "Voltaje", values: ["240V", "480V"] }],
      variants: [
        {
          title: "240V",
          sku: "MOT-5HP-240",
          prices: [{ amount: 45000, currency_code: "usd" }], // $450.00
          options: { Voltaje: "240V" }
        },
        {
          title: "480V",
          sku: "MOT-5HP-480",
          prices: [{ amount: 47500, currency_code: "usd" }], // $475.00
          options: { Voltaje: "480V" }
        }
      ],
      pim: {
        technical_pdf: "https://example.com/specs/mot-5hp.pdf",
        ip_certification: "IP65",
        voltage: "240V/480V",
        oem_brand: "IndustrialMotors Inc."
      }
    },
    {
      title: "Tornillo Hexagonal Acero Inox 1/2-13 x 2\"",
      handle: "mfr-hex-1-2-13-2in",
      description: "Tornillería estructural de grado marino.",
      options: [{ title: "Material", values: ["Acero Inox 316"] }],
      variants: [
        {
          title: "Paquete x100",
          sku: "HEX-12-13-2-SS316",
          prices: [{ amount: 12500, currency_code: "usd" }], // $125.00
          options: { Material: "Acero Inox 316" }
        }
      ],
      pim: {
        technical_pdf: "https://example.com/specs/hex-bolt.pdf",
        thread_size: "1/2\"-13",
        material: "Acero Inoxidable 316",
        oem_brand: "Fastenal Alterno"
      }
    }
  ]

  for (const prodDef of industrialProducts) {
    const { pim, ...coreProduct } = prodDef
    
    // Create product
    const { result: createdProducts } = await createProductsWorkflow(container).run({
      input: {
        products: [coreProduct]
      }
    })

    const newProduct = createdProducts[0]

    // Attach PIM data
    if (pimService && newProduct) {
      await pimService.createPimInfos({
        product_id: newProduct.id,
        ...pim
      })
      logger.info(`✅ Producto B2B Creado con PIM: ${newProduct.title}`)
    }
  }

  logger.info("B2B Seed completado.")
}
