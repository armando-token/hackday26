const { Client } = require("pg")
const { assertDestructiveLegacyAllowed } = require("./lib/legacy-script-guard")
const rawProducts = require("/home/ubuntu/CN_Web/b2b-storefront/src/lib/cn-catalog/data/products.json")

async function linkBrandsAndSalesChannel() {
  assertDestructiveLegacyAllowed("link-brands-and-sales-channel.js")
  const connectionString =
    process.env.DATABASE_URL ||
    "postgresql://postgres:password@localhost:5432/medusa"
  const client = new Client({ connectionString })
  await client.connect()

  // 1. Fetch Brands
  const brandRes = await client.query(`SELECT id, name, handle FROM brand`)
  const brandByHandle = new Map()
  const brandByName = new Map()
  for (const b of brandRes.rows) {
    brandByHandle.set(b.handle.toLowerCase(), b)
    brandByName.set(b.name.toLowerCase(), b)
    if (b.handle === "novus") brandByName.set("novus", b)
    if (b.handle === "horner") brandByName.set("horner", b)
    if (b.handle === "rockwool") brandByName.set("rockwool", b)
    if (b.handle === "king-electric") brandByName.set("king electric", b)
    if (b.handle === "mpi") brandByName.set("mpi", b)
    if (b.handle === "tzone") brandByName.set("tzone", b)
    if (b.handle === "ems-kontrol") brandByName.set("ems kontrol", b)
    if (b.handle === "chromalox") brandByName.set("chromalox", b)
  }

  // 2. Fetch Sales Channel
  const scRes = await client.query(`SELECT id FROM sales_channel LIMIT 1`)
  const salesChannelId = scRes.rows[0]?.id || "sc_01KW0RTPP3FGEFRSJDBKEH2EDS"

  // 3. Fetch Products
  const prodRes = await client.query(`SELECT id, title, handle FROM product`)
  const prodByHandle = new Map()
  const prodByTitle = new Map()
  for (const p of prodRes.rows) {
    prodByHandle.set(p.handle.toLowerCase(), p)
    prodByTitle.set(p.title.toLowerCase(), p)
  }

  let brandLinksCreated = 0
  let scLinksCreated = 0

  for (const raw of rawProducts) {
    const p = prodByHandle.get((raw.handle || "").toLowerCase()) || prodByTitle.get((raw.title || "").toLowerCase())
    if (!p) continue

    // 1. Link Brand
    if (raw.brand) {
      const bKey = raw.brand.trim().toLowerCase()
      const brandObj = brandByName.get(bKey) || brandByHandle.get(bKey)
      if (brandObj) {
        const exists = await client.query(
          `SELECT id FROM product_product_brandmodule_brand WHERE product_id = $1 AND brand_id = $2`,
          [p.id, brandObj.id]
        )
        if (exists.rows.length === 0) {
          const linkId = "ppbb_" + Math.random().toString(36).substring(2, 10) + Date.now().toString(36)
          await client.query(
            `INSERT INTO product_product_brandmodule_brand (id, product_id, brand_id, created_at, updated_at)
             VALUES ($1, $2, $3, NOW(), NOW())`,
            [linkId, p.id, brandObj.id]
          )
          brandLinksCreated++
        }
      }
    }

    // 2. Link Sales Channel
    const scExists = await client.query(
      `SELECT id FROM product_sales_channel WHERE product_id = $1 AND sales_channel_id = $2`,
      [p.id, salesChannelId]
    )
    if (scExists.rows.length === 0) {
      const scLinkId = "prodsc_" + Math.random().toString(36).substring(2, 10) + Date.now().toString(36)
      await client.query(
        `INSERT INTO product_sales_channel (id, product_id, sales_channel_id, created_at, updated_at)
         VALUES ($1, $2, $3, NOW(), NOW())`,
        [scLinkId, p.id, salesChannelId]
      )
      scLinksCreated++
    }
  }

  const totalBrandLinks = await client.query(`SELECT count(*) FROM product_product_brandmodule_brand`)
  const totalScLinks = await client.query(`SELECT count(*) FROM product_sales_channel`)

  console.log(`✅ Enlaces Creados:`)
  console.log(`   - Producto <> Marca: ${brandLinksCreated} nuevos (Total: ${totalBrandLinks.rows[0].count}/523)`)
  console.log(`   - Producto <> Canal de Ventas: ${scLinksCreated} nuevos (Total: ${totalScLinks.rows[0].count}/523)`)

  await client.end()
}

linkBrandsAndSalesChannel().catch(console.error)
