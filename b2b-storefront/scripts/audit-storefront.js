async function auditStorefront() {
  console.log("==========================================================")
  console.log("🔍 AUDITORÍA EXHAUSTIVA DE PÁGINAS Y ASSETS DEL STOREFRONT")
  console.log("==========================================================")

  const auth = "Basic " + Buffer.from("admin:controlnautas2026").toString("base64")
  const headers = { Authorization: auth }

  const pagesToTest = [
    // Core
    "/dk",
    "/dk/store",
    "/dk/quick-order",
    "/dk/cart",
    "/dk/contact",
    "/dk/customer-service",
    "/dk/content/privacy-policy",
    "/dk/content/terms-of-use",
    // Categories L1
    "/dk/store/calefaccion-electrica",
    "/dk/store/aislamiento-termico",
    "/dk/store/automatizacion-plc-hmi",
    "/dk/store/control-e-indicacion",
    "/dk/store/sensores-transmisores",
    "/dk/store/registro-de-datos",
    "/dk/store/trazado-termico",
    "/dk/store/monitoreo-data-center",
    "/dk/store/otros",
    // Subcategories L2
    "/dk/store/aislamiento-termico/paneles-lana-roca",
    "/dk/store/automatizacion-plc-hmi/plc-hmi",
    "/dk/store/control-e-indicacion/controladores-pid",
    "/dk/store/sensores-transmisores/temperatura-termopar-rtd",
    "/dk/store/registro-de-datos/loggers-cadena-frio",
    // Search
    "/dk/search?q=rockwool",
    "/dk/search?q=novus",
    "/dk/search?q=txblock",
    // Sample PDPs
    "/dk/products/lana-de-roca-rockwool-prorox-sl-920",
    "/dk/products/panel-de-lana-de-roca-rockwool-prorox-sl-940",
    "/dk/products/novus-ssr-4810",
    "/dk/products/x2-ocs-micro-plc-todo-en-uno",
    "/dk/products/registrador-de-datos-en-tiempo-real-tt18-con-sensor-de-temperatura-y-humedad",
  ]

  let failedPages = 0
  for (const p of pagesToTest) {
    const url = `http://localhost:8000${p}`
    try {
      const res = await fetch(url, { headers })
      if (res.status === 200) {
        console.log(`  ✅ [200 OK] ${p}`)
      } else {
        console.log(`  ❌ [HTTP ${res.status}] ${p}`)
        failedPages++
      }
    } catch (e) {
      console.log(`  ❌ [ERROR] ${p} -> ${e.message}`)
      failedPages++
    }
  }

  // Test Image Assets
  console.log("\n--- VERIFICACIÓN DE ASSETS DE IMÁGENES ---")
  const assetsToTest = [
    "/images/logo/control_nautas_logo_white.png",
    "/images/logo/control_nautas_logo_fondo_blanco.png",
    "/cn-media/categories/calefaccion-electrica.png",
    "/cn-media/categories/aislamiento-termico.png",
    "/cn-media/categories/automatizacion-plc-hmi.png",
    "/cn-media/categories/sensores-transmisores.png",
    "/cn-media/categories/trazado-termico.png",
  ]

  let failedAssets = 0
  for (const a of assetsToTest) {
    const url = `http://localhost:8000${a}`
    try {
      const res = await fetch(url, { headers })
      if (res.status === 200) {
        console.log(`  ✅ [200 OK] Asset: ${a}`)
      } else {
        console.log(`  ❌ [HTTP ${res.status}] Asset: ${a}`)
        failedAssets++
      }
    } catch (e) {
      console.log(`  ❌ [ERROR] Asset: ${a} -> ${e.message}`)
      failedAssets++
    }
  }

  console.log("\n==========================================================")
  console.log(`📊 RESUMEN STOREFRONT:`)
  console.log(`  - Páginas evaluadas: ${pagesToTest.length} (Fallidas: ${failedPages})`)
  console.log(`  - Assets evaluados: ${assetsToTest.length} (Fallidos: ${failedAssets})`)
  if (failedPages === 0 && failedAssets === 0) {
    console.log("✅ 100% DE LAS RUTAS Y ASSETS OPERAN SIN ERRORES (200 OK)")
  }
  console.log("==========================================================")
}

auditStorefront().catch(console.error)
