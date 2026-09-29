import { ExecArgs } from "@medusajs/framework/types"
import { createProductsWorkflow } from "@medusajs/medusa/core-flows"
import { assertDestructiveLegacyAllowed } from "./lib/legacy-script-guard"

export default async function industrialSeed({ container }: ExecArgs) {
  assertDestructiveLegacyAllowed("industrial-seed.ts")
  const logger = container.resolve("logger")
  const apiKeyService = container.resolve("apiKeyModuleService")
  const regionService = container.resolve("regionModuleService")
  const salesChannelService = container.resolve("salesChannelModuleService")
  const customerService = container.resolve("customerModuleService")
  
  logger.info("Starting Industrial Seed...")

  // 1. Create Sales Channel
  let defaultSalesChannel = await salesChannelService.listSalesChannels({ name: "Default Sales Channel" })
  if (!defaultSalesChannel.length) {
    defaultSalesChannel = [await salesChannelService.createSalesChannels({ name: "Default Sales Channel", description: "Default Sales Channel" })]
  }

  // 2. Create Publishable API Key
  const apiKeys = await apiKeyService.listApiKeys({ title: "Industrial Storefront Key" })
  let pubKey = apiKeys[0]
  if (!pubKey) {
    pubKey = await apiKeyService.createApiKeys({
      title: "Industrial Storefront Key",
      type: "publishable",
      token: "pk_industrial_storefront",
      created_by: "seed"
    })
  }

  // Link API Key to Sales Channel
  const remoteLink = container.resolve("remoteLink")
  await remoteLink.create([
    {
      [apiKeyService.joinerConfig.serviceName]: {
        apiKey_id: pubKey.id,
      },
      [salesChannelService.joinerConfig.serviceName]: {
        sales_channel_id: defaultSalesChannel[0].id,
      },
    }
  ])

  // 3. Create Regions (US and Europe / DK)
  let usRegion = await regionService.listRegions({ name: "US" })
  if (!usRegion.length) {
    usRegion = [await regionService.createRegions({
      name: "US",
      currency_code: "usd",
      countries: ["us"],
      payment_providers: ["manual"],
    })]
  }

  let euRegion = await regionService.listRegions({ name: "Europe / DK" })
  if (!euRegion.length) {
    euRegion = [await regionService.createRegions({
      name: "Europe / DK",
      currency_code: "usd",
      countries: ["dk"],
      payment_providers: ["manual"],
    })]
  }

  // 4. Create Customer
  let customer = await customerService.listCustomers({ email: "test@controlnautas.com" })
  if (!customer.length) {
    const newCust = await customerService.createCustomers({
      email: "test@controlnautas.com",
      first_name: "John",
      last_name: "Smith",
      company_name: "Acme Industrial Corp",
    })
    customer = [newCust]
  }

  // 5. Products 
  const industrialProducts = []
  for (let i = 1; i <= 28; i++) {
    industrialProducts.push({
      title: `Industrial Product ${i} - DEWALT/Ansell/Dayton`,
      handle: `ind-prod-${i}`,
      description: `High quality industrial product ${i}`,
      options: [{ title: "Variant", values: ["Standard"] }],
      variants: [
        {
          title: "Standard",
          sku: `SKU-${i}`,
          prices: [{ amount: 1000 + (i * 100), currency_code: "usd" }],
          options: { Variant: "Standard" }
        }
      ]
    })
  }

  for (const prod of industrialProducts) {
    await createProductsWorkflow(container).run({
      input: { products: [prod] }
    })
  }

  logger.info("Industrial Seed completed.")
}
