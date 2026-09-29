const { Client } = require("pg")
const { assertDestructiveLegacyAllowed } = require("./lib/legacy-script-guard")
const rawProducts = require("/home/ubuntu/CN_Web/b2b-storefront/src/lib/cn-catalog/data/products.json")

async function main() {
  assertDestructiveLegacyAllowed("seed-categories-direct.js")
  const connectionString =
    process.env.DATABASE_URL ||
    "postgresql://postgres:password@localhost:5432/medusa"
  const client = new Client({ connectionString })
  await client.connect()

  // 1. Clean demo categories
  await client.query(`DELETE FROM product_category WHERE handle IN ('shirts', 'sweatshirts', 'pants', 'merch')`)

  // 2. Fetch categories
  const catRes = await client.query(`SELECT id, handle, parent_category_id FROM product_category`)
  const catMap = new Map(catRes.rows.map((r) => [r.handle, r]))

  const SLUG_ALIASES = {
    "accesorios-sensores": "temperatura-termopar-rtd",
    "transmisores-temperatura": "transmisores",
    "sistemas-llave-en-mano": "resistencias-proceso",
    "termostatos-industriales": "termostatos-linea",
    "gases-co2": "sensores-ambientales",
    "controles-anticongelamiento": "controles-deshielo",
    "ventiladores-alta-velocidad": "ventilacion",
    "accesorios-ventilacion": "ventilacion",
    "unidades-monitoreo": "plataformas",
    "monitoreo-energia": "gateways",
    "interfaces-industriales": "gateways",
    "monitoreo-inalambrico-climate": "gateways",
    "comunicacion-inalambrica": "gateways",
    "monitoreo-condicion-telik": "gateways",
    "sustratos-hidroponicos": "otros",
    "unit-heaters": "unit-heaters-industriales",
    "calentadores-tambor": "resistencias-proceso",
    "accesorios-entrenamiento": "otros",
    "deteccion-fugas": "sensores-ambientales",
    "reles-ssr": "io-relays",
  }

  // 3. Fetch products
  const prodRes = await client.query(`SELECT id, title, handle FROM product`)
  const prodByHandle = new Map()
  const prodByTitle = new Map()
  for (const p of prodRes.rows) {
    prodByHandle.set(p.handle.toLowerCase(), p)
    prodByTitle.set(p.title.toLowerCase(), p)
  }

  let linksCreated = 0

  for (const raw of rawProducts) {
    const p = prodByHandle.get((raw.handle || "").toLowerCase()) || prodByTitle.get((raw.title || "").toLowerCase())
    if (!p) continue

    let targetSlug = raw.categorySlug || raw.leafSlug
    if (targetSlug && SLUG_ALIASES[targetSlug]) {
      targetSlug = SLUG_ALIASES[targetSlug]
    }

    const cat = targetSlug ? catMap.get(targetSlug) : null
    if (!cat) continue

    const categoryIds = [cat.id]
    if (cat.parent_category_id) {
      categoryIds.push(cat.parent_category_id)
    }

    for (const catId of categoryIds) {
      const exists = await client.query(
        `SELECT 1 FROM product_category_product WHERE product_id = $1 AND product_category_id = $2`,
        [p.id, catId]
      )
      if (exists.rows.length === 0) {
        await client.query(
          `INSERT INTO product_category_product (product_id, product_category_id)
           VALUES ($1, $2) ON CONFLICT DO NOTHING`,
          [p.id, catId]
        )
        linksCreated++
      }
    }
  }

  const totalLinks = await client.query(`SELECT count(*) FROM product_category_product`)
  console.log(`New Category-Product links created: ${linksCreated}`)
  console.log(`Total Category-Product links in DB: ${totalLinks.rows[0].count}`)

  await client.end()
}

main().catch(console.error)
