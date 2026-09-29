/**
 * Auditoría de endpoints Store/Admin (solo lectura).
 * Credenciales vía variables de entorno; no hardcodear secretos.
 */

async function auditApis() {
  const backendUrl = process.env.MEDUSA_BACKEND_URL || "http://127.0.0.1:9000"
  const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""
  const adminEmail = process.env.MEDUSA_ADMIN_EMAIL
  const adminPassword = process.env.MEDUSA_ADMIN_PASSWORD

  if (!publishableKey) {
    console.error("Falta NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY")
    process.exit(1)
  }

  console.log("==========================================================")
  console.log("🔍 AUDITANDO ENDPOINTS DE LA API DE MEDUSA V2 (STORE & ADMIN)")
  console.log("==========================================================")

  const headers = {
    "x-publishable-api-key": publishableKey,
  }

  const pRes = await fetch(
    `${backendUrl}/store/products?limit=10&fields=*categories,*variants`,
    { headers }
  ).then((r) => r.json())
  console.log(
    `[1. STORE PRODUCTS] Status OK: ${!!pRes.products}, Total en catálogo: ${pRes.count}`
  )
  const sampleP = pRes.products?.[0]
  console.log(`  - Muestra: "${sampleP?.title?.substring(0, 60)}..."`)
  console.log(`  - Handle: ${sampleP?.handle}`)
  console.log(
    `  - Categorías: ${sampleP?.categories?.map((c) => c.name).join(" > ")}`
  )

  const cRes = await fetch(
    `${backendUrl}/store/product-categories?parent_category_id=null&fields=*category_children`,
    { headers }
  ).then((r) => r.json())
  console.log(
    `\n[2. STORE CATEGORIES] Familias L1 Raíz: ${cRes.product_categories?.length}`
  )
  let totalSubcats = 0
  cRes.product_categories?.forEach((c, idx) => {
    const subCount = c.category_children?.length || 0
    totalSubcats += subCount
    console.log(
      `  ${idx + 1}. 📁 ${c.name} (${c.handle}) ➔ ${subCount} subcategorías L2`
    )
  })
  console.log(`  - Total Subcategorías L2 activas: ${totalSubcats}`)

  const bRes = await fetch(`${backendUrl}/store/brands`, { headers }).then((r) =>
    r.json()
  )
  console.log(`\n[3. STORE BRANDS] Total Marcas Oficiales: ${bRes.count}`)
  console.log(
    `  - Fabricantes: ${bRes.brands?.map((b) => b.name).join(", ")}`
  )

  if (!adminEmail || !adminPassword) {
    console.log(
      "\n[4. ADMIN AUTHENTICATION] Omitido — configure MEDUSA_ADMIN_EMAIL y MEDUSA_ADMIN_PASSWORD"
    )
    return
  }

  const loginRes = await fetch(`${backendUrl}/auth/user/emailpass`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: adminEmail, password: adminPassword }),
  }).then((r) => r.json())

  console.log(`\n[4. ADMIN AUTHENTICATION] Token obtenido: ${!!loginRes.token}`)

  if (loginRes.token && sampleP?.id) {
    const pimRes = await fetch(`${backendUrl}/admin/products/${sampleP.id}/pim`, {
      headers: { Authorization: `Bearer ${loginRes.token}` },
    }).then((r) => r.json())

    console.log(`[5. ADMIN PIM DATA] Producto: ${sampleP.title.substring(0, 50)}...`)
    console.log(`  - Modelo de Fábrica: ${pimRes.pim_info?.mfr_model}`)
    console.log(`  - Número de Ítem: ${pimRes.pim_info?.item_number}`)
  }
}

auditApis().catch((err) => {
  console.error(err)
  process.exit(1)
})
