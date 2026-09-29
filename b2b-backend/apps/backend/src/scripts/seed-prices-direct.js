const { Client } = require("pg")
const { assertDestructiveLegacyAllowed } = require("./lib/legacy-script-guard")
const rawProducts = require("/home/ubuntu/CN_Web/b2b-storefront/src/lib/cn-catalog/data/products.json")

async function main() {
  assertDestructiveLegacyAllowed("seed-prices-direct.js")
  const connectionString =
    process.env.DATABASE_URL ||
    "postgresql://postgres:password@localhost:5432/medusa"
  const client = new Client({ connectionString })
  await client.connect()

  const variantRes = await client.query(`
    SELECT pv.id as variant_id, pv.sku, p.id as product_id, p.title, p.handle
    FROM product_variant pv
    JOIN product p ON p.id = pv.product_id
  `)

  console.log("Total variants in DB:", variantRes.rows.length)

  const rawByHandle = new Map()
  const rawByTitle = new Map()
  for (const r of rawProducts) {
    if (r.handle) rawByHandle.set(r.handle.toLowerCase(), r)
    if (r.title) rawByTitle.set(r.title.toLowerCase(), r)
  }

  let matched = 0
  let pricesInserted = 0

  for (const row of variantRes.rows) {
    const raw = rawByHandle.get(row.handle.toLowerCase()) || rawByTitle.get(row.title.toLowerCase())
    if (!raw) continue
    matched++

    const pricePen = raw.price && typeof raw.price === "number" && raw.price > 0 ? raw.price : 0
    const priceUsd = pricePen > 0 ? parseFloat((raw.price / 3.75).toFixed(2)) : 0

    if (pricePen <= 0) continue

    // Check or create PriceSet
    const existingPset = await client.query(
      `SELECT price_set_id FROM product_variant_price_set WHERE variant_id = $1`,
      [row.variant_id]
    )

    let priceSetId = ""
    if (existingPset.rows.length > 0) {
      priceSetId = existingPset.rows[0].price_set_id
    } else {
      const psetId = "pset_" + Math.random().toString(36).substring(2, 12) + Date.now().toString(36)
      await client.query(
        `INSERT INTO price_set (id, created_at, updated_at) VALUES ($1, NOW(), NOW())`,
        [psetId]
      )

      const linkId = "pvps_" + Math.random().toString(36).substring(2, 12) + Date.now().toString(36)
      await client.query(
        `INSERT INTO product_variant_price_set (id, variant_id, price_set_id, created_at, updated_at) VALUES ($1, $2, $3, NOW(), NOW())`,
        [linkId, row.variant_id, psetId]
      )
      priceSetId = psetId
    }

    // Clean old prices for this set
    await client.query(`DELETE FROM price WHERE price_set_id = $1`, [priceSetId])

    // Insert PEN
    const penId = "price_pen_" + Math.random().toString(36).substring(2, 10) + Date.now().toString(36)
    await client.query(
      `INSERT INTO price (id, price_set_id, currency_code, amount, raw_amount, rules_count, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, 0, NOW(), NOW())`,
      [penId, priceSetId, "pen", pricePen, JSON.stringify({ value: String(pricePen), precision: 20 })]
    )

    // Insert USD
    const usdId = "price_usd_" + Math.random().toString(36).substring(2, 10) + Date.now().toString(36)
    await client.query(
      `INSERT INTO price (id, price_set_id, currency_code, amount, raw_amount, rules_count, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, 0, NOW(), NOW())`,
      [usdId, priceSetId, "usd", priceUsd, JSON.stringify({ value: String(priceUsd), precision: 20 })]
    )

    pricesInserted++
  }

  console.log(`Matched products: ${matched}/${variantRes.rows.length}`)
  console.log(`Products with Prices (PEN + USD): ${pricesInserted}`)

  await client.end()
}

main().catch(console.error)
