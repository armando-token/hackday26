const { Client } = require("pg")

async function deepAudit() {
  console.log("==========================================================")
  console.log("🔍 INICIANDO AUDITORÍA PROFUNDA Y EXHAUSTIVA DE TODO EL SISTEMA")
  console.log("==========================================================")

  const client = new Client({
    connectionString: "postgresql://postgres:password@localhost:5432/medusa",
  })
  await client.connect()

  const issues = []

  // 1. PRODUCTOS
  const prodRes = await client.query(`
    SELECT p.id, p.title, p.handle, p.thumbnail, p.status, count(pv.id) as variant_count
    FROM product p
    LEFT JOIN product_variant pv ON pv.product_id = p.id
    GROUP BY p.id, p.title, p.handle, p.thumbnail, p.status
  `)
  console.log(`\n[1. PRODUCTOS] Total: ${prodRes.rows.length}`)
  if (prodRes.rows.length !== 523) {
    issues.push(`Esperados 523 productos, encontrados: ${prodRes.rows.length}`)
  }

  let prodsWithoutThumbnail = 0
  let prodsWithoutVariant = 0
  let prodsNotPublished = 0
  for (const p of prodRes.rows) {
    if (!p.thumbnail) prodsWithoutThumbnail++
    if (parseInt(p.variant_count) === 0) prodsWithoutVariant++
    if (p.status !== "published") prodsNotPublished++
  }
  console.log(`  - Sin imagen/thumbnail: ${prodsWithoutThumbnail}`)
  console.log(`  - Sin variante: ${prodsWithoutVariant}`)
  console.log(`  - No publicados: ${prodsNotPublished}`)
  if (prodsWithoutThumbnail > 0) issues.push(`${prodsWithoutThumbnail} productos sin thumbnail`)
  if (prodsWithoutVariant > 0) issues.push(`${prodsWithoutVariant} productos sin variante`)
  if (prodsNotPublished > 0) issues.push(`${prodsNotPublished} productos no publicados`)

  // 2. VARIANTES Y SKUS
  const varRes = await client.query(`SELECT id, title, sku, product_id FROM product_variant`)
  console.log(`\n[2. VARIANTES Y SKUS] Total: ${varRes.rows.length}`)
  const skuSet = new Set()
  let duplicateSkus = 0
  let emptySkus = 0
  for (const v of varRes.rows) {
    if (!v.sku) emptySkus++
    else {
      if (skuSet.has(v.sku)) duplicateSkus++
      skuSet.add(v.sku)
    }
  }
  console.log(`  - SKUs únicos: ${skuSet.size}`)
  console.log(`  - SKUs duplicados: ${duplicateSkus}`)
  console.log(`  - SKUs vacíos: ${emptySkus}`)
  if (duplicateSkus > 0) issues.push(`${duplicateSkus} SKUs duplicados`)
  if (emptySkus > 0) issues.push(`${emptySkus} variantes sin SKU`)

  // 3. CATEGORÍAS
  const catRes = await client.query(`
    SELECT id, name, handle, is_active, is_internal, parent_category_id
    FROM product_category
    ORDER BY handle ASC
  `)
  console.log(`\n[3. CATEGORÍAS] Total: ${catRes.rows.length}`)
  let demoCats = 0
  let inactiveCats = 0
  let l1Count = 0
  let l2Count = 0
  for (const c of catRes.rows) {
    if (["shirts", "sweatshirts", "pants", "merch"].includes(c.handle)) demoCats++
    if (!c.is_active || c.is_internal) inactiveCats++
    if (!c.parent_category_id) l1Count++
    else l2Count++
  }
  console.log(`  - Familias L1 (Raíz): ${l1Count}`)
  console.log(`  - Subcategorías L2 (Hojas): ${l2Count}`)
  console.log(`  - Categorías demo restantes: ${demoCats}`)
  console.log(`  - Categorías inactivas o internas: ${inactiveCats}`)
  if (demoCats > 0) issues.push(`${demoCats} categorías demo de Medusa encontradas`)

  // 4. VINCULACIÓN PRODUCTO <-> CATEGORÍA
  const catLinkRes = await client.query(`
    SELECT p.id as product_id, count(pcp.product_category_id) as cat_count
    FROM product p
    LEFT JOIN product_category_product pcp ON pcp.product_id = p.id
    GROUP BY p.id
  `)
  let prodsWithoutCat = 0
  let prodsWithOnlyL1 = 0
  let prodsWithL1AndL2 = 0
  for (const row of catLinkRes.rows) {
    const count = parseInt(row.cat_count)
    if (count === 0) prodsWithoutCat++
    else if (count === 1) prodsWithOnlyL1++
    else prodsWithL1AndL2++
  }
  console.log(`\n[4. TAXONOMÍA PRODUCTO-CATEGORÍA]`)
  console.log(`  - Productos con Categoría L1 y L2: ${prodsWithL1AndL2}`)
  console.log(`  - Productos con solo 1 categoría: ${prodsWithOnlyL1}`)
  console.log(`  - Productos SIN categoría: ${prodsWithoutCat}`)
  if (prodsWithoutCat > 0) issues.push(`${prodsWithoutCat} productos sin categoría`)

  // 5. PRECIOS MULTIMONEDA (PEN Y USD)
  const priceRes = await client.query(`
    SELECT
      pv.id as variant_id,
      p.title,
      COUNT(DISTINCT pr.currency_code) as currency_count,
      MAX(CASE WHEN pr.currency_code = 'pen' THEN pr.amount END) as price_pen,
      MAX(CASE WHEN pr.currency_code = 'usd' THEN pr.amount END) as price_usd
    FROM product_variant pv
    JOIN product p ON p.id = pv.product_id
    LEFT JOIN product_variant_price_set pvps ON pvps.variant_id = pv.id
    LEFT JOIN price pr ON pr.price_set_id = pvps.price_set_id
    GROUP BY pv.id, p.title
  `)
  let withBothPrices = 0
  let withOnlyOnePrice = 0
  let withoutPrice = 0
  for (const pr of priceRes.rows) {
    const cCount = parseInt(pr.currency_count)
    if (cCount >= 2 && pr.price_pen > 0 && pr.price_usd > 0) withBothPrices++
    else if (cCount === 1) withOnlyOnePrice++
    else withoutPrice++
  }
  console.log(`\n[5. PRECIOS MULTIMONEDA]`)
  console.log(`  - Productos con precios duales PEN y USD: ${withBothPrices}`)
  console.log(`  - Productos con solo una moneda: ${withOnlyOnePrice}`)
  console.log(`  - Productos en modo cotización (sin precio público): ${withoutPrice}`)

  // 6. MÓDULO MARCAS (BRAND)
  const brandRes = await client.query(`
    SELECT id, name, handle, is_authorized_distributor, country_of_origin, website_url
    FROM brand
    ORDER BY sort_order ASC
  `)
  console.log(`\n[6. MÓDULO MARCAS] Total: ${brandRes.rows.length}`)
  let unauthBrands = 0
  for (const b of brandRes.rows) {
    if (!b.is_authorized_distributor) unauthBrands++
  }
  console.log(`  - Marcas autorizadas: ${brandRes.rows.length - unauthBrands}/${brandRes.rows.length}`)
  if (brandRes.rows.length !== 14) issues.push(`Esperadas 14 marcas, encontradas: ${brandRes.rows.length}`)

  // 7. VINCULACIÓN PRODUCTO <-> MARCA
  const prodBrandRes = await client.query(`
    SELECT count(DISTINCT product_id) as linked_count
    FROM product_product_brandmodule_brand
  `)
  console.log(`\n[7. ENLACE PRODUCTO <-> MARCA]`)
  console.log(`  - Productos vinculados a marca en base de datos: ${prodBrandRes.rows[0].linked_count}/523`)

  // 8. MÓDULO PIM (ESPECIFICACIONES Y METADATOS)
  const pimRes = await client.query(`
    SELECT count(*) as total,
           count(CASE WHEN specs IS NOT NULL AND specs::text != '{}' THEN 1 END) as with_specs,
           count(CASE WHEN mfr_model IS NOT NULL THEN 1 END) as with_model,
           count(CASE WHEN item_number IS NOT NULL THEN 1 END) as with_item_no,
           count(CASE WHEN seo_title IS NOT NULL THEN 1 END) as with_seo
    FROM pim_info
  `)
  console.log(`\n[8. PIM B2B & SEO]`)
  console.log(`  - Total registros PIM: ${pimRes.rows[0].total}`)
  console.log(`  - Con Especificaciones Técnicas (JSON): ${pimRes.rows[0].with_specs}`)
  console.log(`  - Con Modelo de Fábrica: ${pimRes.rows[0].with_model}`)
  console.log(`  - Con Número de Ítem/Catálogo: ${pimRes.rows[0].with_item_no}`)
  console.log(`  - Con Metadatos SEO: ${pimRes.rows[0].with_seo}`)

  // 9. CANAL DE VENTAS (SALES CHANNEL LINK)
  const scLinkRes = await client.query(`
    SELECT count(DISTINCT product_id) as sc_linked_count
    FROM product_sales_channel
  `)
  console.log(`\n[9. CANAL DE VENTAS]`)
  console.log(`  - Productos vinculados al canal de ventas activo: ${scLinkRes.rows[0].sc_linked_count}/523`)

  await client.end()

  console.log("\n==========================================================")
  console.log("📊 RESUMEN DE LA AUDITORÍA DE BASE DE DATOS:")
  if (issues.length === 0) {
    console.log("✅ 0 ERRORES ENCONTRADOS. La base de datos está perfectamente íntegra.")
  } else {
    console.log(`⚠️ SE ENCONTRARON ${issues.length} DETALLES A REPARAR:`)
    issues.forEach((iss, idx) => console.log(`   ${idx + 1}. ${iss}`))
  }
  console.log("==========================================================")

  return issues
}

deepAudit().catch(console.error)
