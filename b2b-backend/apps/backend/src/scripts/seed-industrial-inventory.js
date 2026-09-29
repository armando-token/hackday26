const { Client } = require("pg")
const { ulid } = require("ulid")
const { assertDestructiveLegacyAllowed } = require("./lib/legacy-script-guard")

async function seedIndustrialInventory() {
  assertDestructiveLegacyAllowed("seed-industrial-inventory.js")
  console.log("==========================================================")
  console.log("📦 POBLANDO INVENTARIO INDUSTRIAL COMPLETO EN MEDUSA V2")
  console.log("==========================================================")

  const connectionString =
    process.env.DATABASE_URL ||
    "postgresql://postgres:password@localhost:5432/medusa"
  const client = new Client({ connectionString })
  await client.connect()

  const locationId = "sloc_01KW0RTPRKK7ZC4Y5SR3XX6EHM"
  const addressId = "laddr_01KW0RTPRJXCMZQFJHRJZ1NYB6"

  // 1. Actualizar Ubicación de Stock a Lima, Perú
  await client.query(`
    UPDATE stock_location 
    SET name = 'Almacén Central Lima (Control Nautas)', updated_at = NOW()
    WHERE id = $1
  `, [locationId])

  await client.query(`
    UPDATE stock_location_address
    SET city = 'Lima', country_code = 'PE', address_1 = 'Av. República de Panamá 3535', province = 'Lima', updated_at = NOW()
    WHERE id = $1
  `, [addressId])
  console.log("✅ Ubicación de Stock actualizada: 'Almacén Central Lima (Control Nautas)' [PE]")

  // 2. Limpiar inventario demo residual
  await client.query("DELETE FROM inventory_level")
  await client.query("DELETE FROM product_variant_inventory_item")
  await client.query("DELETE FROM inventory_item")
  console.log("🧹 Inventario demo residual eliminado.")

  // 3. Obtener los 523 productos y sus variantes
  const prodRes = await client.query(`
    SELECT p.id as product_id, p.title, p.thumbnail, pv.id as variant_id, pv.sku, pv.title as variant_title
    FROM product p
    JOIN product_variant pv ON pv.product_id = p.id
    WHERE p.deleted_at IS NULL
    ORDER BY p.created_at ASC
  `)

  console.log(`📦 Procesando ${prodRes.rows.length} variantes industriales...`)

  let count = 0
  for (const row of prodRes.rows) {
    const invItemId = `iitem_${ulid()}`
    const pviiId = `pvii_${ulid()}`
    const invLevelId = `ilev_${ulid()}`
    const sku = row.sku || `CN-${row.product_id.substring(row.product_id.length - 6)}`
    const title = row.title.substring(0, 200)

    // Determinar stock inicial representativo según tipo
    const stockQty = 50

    // A. Insertar Inventory Item
    await client.query(`
      INSERT INTO inventory_item (
        id, sku, title, description, thumbnail, requires_shipping, origin_country, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, true, 'PE', NOW(), NOW())
    `, [invItemId, sku, title, title, row.thumbnail])

    // B. Vincular Variante con Inventory Item
    await client.query(`
      INSERT INTO product_variant_inventory_item (
        id, variant_id, inventory_item_id, required_quantity, created_at, updated_at
      ) VALUES ($1, $2, $3, 1, NOW(), NOW())
    `, [pviiId, row.variant_id, invItemId])

    // C. Insertar Nivel de Stock en Almacén Lima
    await client.query(`
      INSERT INTO inventory_level (
        id, inventory_item_id, location_id, stocked_quantity, reserved_quantity, incoming_quantity,
        raw_stocked_quantity, raw_reserved_quantity, raw_incoming_quantity, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, 0, 0, $5, $6, $7, NOW(), NOW())
    `, [
      invLevelId,
      invItemId,
      locationId,
      stockQty,
      JSON.stringify({ value: String(stockQty), precision: 20 }),
      JSON.stringify({ value: "0", precision: 20 }),
      JSON.stringify({ value: "0", precision: 20 }),
    ])

    // D. Activar gestión de inventario en la variante
    await client.query(`
      UPDATE product_variant 
      SET manage_inventory = true, allow_backorder = true, updated_at = NOW()
      WHERE id = $1
    `, [row.variant_id])

    count++
  }

  console.log(`\n==========================================================`)
  console.log(`✅ ${count} ITEMS DE INVENTARIO INDUSTRIAL CREADOS CON ÉXITO`)
  console.log(`✅ 100% VINCULADOS A SUS PRODUCTOS Y ALMACÉN CENTRAL LIMA`)
  console.log(`==========================================================`)

  await client.end()
}

seedIndustrialInventory().catch(console.error)
