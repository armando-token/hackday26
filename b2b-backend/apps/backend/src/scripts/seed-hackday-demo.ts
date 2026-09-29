import { ExecArgs } from "@medusajs/framework/types"
import { createProductsWorkflow } from "@medusajs/medusa/core-flows"
import * as fs from "fs"
import * as path from "path"

const { Client } = require("pg")

interface DemoProductDef {
  sku: string
  model: string
  handle: string
  title: string
  subtitle: string
  description: string
  pricePen: number // 890, 480, 75
  stock: number // 3, 2, 8
  sourceId: string
  pdfDatasheet: string
  markdownSpec: string
  facts: Array<{
    property: string
    normalized_value_json: any
    display_value: string
    page: number
    section: string
    excerpt: string
    polarity: boolean
  }>
}

const DEMO_SOURCES = [
  {
    id: "SRC-CN-DIN-PLC-A1-DS-V1",
    url: "https://controlnautas.com/demo/datasheets/CN-DEMO-PLC-DIN-420-MR1.pdf",
    kind: "datasheet",
    revision: "rev-2026.1",
    checksum: "8009da7ddf415884229b8570d75fd59e602aad1013caab851ac61d06c361e385",
    published_at: "2026-09-29T18:00:00Z",
  },
  {
    id: "SRC-CN-PID-T1-DS-V1",
    url: "https://controlnautas.com/demo/datasheets/CN-DEMO-PID-PT100-RS1.pdf",
    kind: "datasheet",
    revision: "rev-2026.1",
    checksum: "b695ef3318e840535601432acb197db1c007ae614673d657df472d9129abdeaf",
    published_at: "2026-09-29T18:00:00Z",
  },
  {
    id: "SRC-CN-RTD-P1-DS-V1",
    url: "https://controlnautas.com/demo/datasheets/CN-DEMO-PT100-3W-A1.pdf",
    kind: "datasheet",
    revision: "rev-2026.1",
    checksum: "3c8e67e4e5b76baa787e9f91eb0546015a1e7afa1551b79f2a1fb417cca17fbf",
    published_at: "2026-09-29T18:00:00Z",
  },
]

const DEMO_PRODUCTS: DemoProductDef[] = [
  {
    sku: "CN-DEMO-PLC-DIN-420-MR1",
    model: "CN-DIN-PLC-A1",
    handle: "cn-demo-plc-din-420-mr1",
    title: "Controlador Lógico Programable DIN 4-20 mA (CN-DIN-PLC-A1)",
    subtitle: "PLC Riel DIN 35mm, 24VDC, 2x AI 4-20mA, RS-485 Modbus RTU Esclavo",
    description:
      "Controlador Lógico Programable para Riel DIN 35 mm con 2 entradas analógicas 4–20 mA, puerto serie RS-485 Modbus RTU esclavo y alimentación continua 24 VDC. Componente sintético para demostración técnica.",
    pricePen: 890,
    stock: 3,
    sourceId: "SRC-CN-DIN-PLC-A1-DS-V1",
    pdfDatasheet: "/demo/datasheets/CN-DEMO-PLC-DIN-420-MR1.pdf",
    markdownSpec: "/demo/specs/CN-DEMO-PLC-DIN-420-MR1.md",
    facts: [
      {
        property: "mounting",
        normalized_value_json: { type: "DIN rail", standard: "IEC/EN 60715", size_mm: 35 },
        display_value: "Montaje en carril DIN 35 mm",
        page: 1,
        section: "Sección 2: Montaje Físico",
        excerpt:
          "Montaje en carril DIN simétrico de 35 mm bajo norma internacional IEC / EN 60715 (perfiles TH35-7.5 y TH35-15)",
        polarity: true,
      },
      {
        property: "supply_voltage",
        normalized_value_json: { type: "DC", nominal: 24, unit: "VDC", min: 18.0, max: 30.0 },
        display_value: "24 VDC (18.0 a 30.0 VDC)",
        page: 1,
        section: "Sección 3: Alimentación Eléctrica",
        excerpt:
          "24 VDC nominales en corriente continua (rango operativo garantizado: 18.0 VDC a 30.0 VDC)",
        polarity: true,
      },
      {
        property: "analog_input",
        normalized_value_json: {
          direction: "input",
          channels: 2,
          signal: "current",
          min: 4,
          max: 20,
          unit: "mA",
          resolution_bits: 12,
        },
        display_value: "2 entradas analógicas 4–20 mA (12 bits)",
        page: 2,
        section: "Sección 4: Entradas / Salidas Analógicas y Sensores",
        excerpt:
          "2 canales independientes de entrada analógica en lazo de corriente estándar 4–20 mA",
        polarity: true,
      },
      {
        property: "analog_output",
        normalized_value_json: { direction: "output", channels: 0, available: false },
        display_value: "0 canales (Sin salidas analógicas)",
        page: 2,
        section: "Sección 4: Entradas / Salidas Analógicas y Sensores",
        excerpt:
          "SIN SALIDAS ANALÓGICAS (0 canales de salida analógica). No dispone de DAC ni lazos 4–20 mA de transmisión",
        polarity: false,
      },
      {
        property: "protocol",
        normalized_value_json: {
          name: "Modbus RTU",
          role: "slave",
          baudrates: [9600, 19200, 38400, 57600, 115200],
        },
        display_value: "Modbus RTU esclavo",
        page: 2,
        section: "Sección 5: Comunicaciones y Protocolos",
        excerpt:
          "Modbus RTU en modo esclavo (slave) configurable por software con registros estándar de lectura/escritura",
        polarity: true,
      },
      {
        property: "interface",
        normalized_value_json: {
          type: "serial",
          physical_layer: "RS-485",
          duplex: "half-duplex",
          isolation_v: 1000,
        },
        display_value: "RS-485 semidúplex aislado",
        page: 2,
        section: "Sección 5: Comunicaciones y Protocolos",
        excerpt:
          "Puerto serie físico RS-485 semidúplex (2 hilos A/B + común GND) con aislamiento galvánico de 1000 V",
        polarity: true,
      },
      {
        property: "control_function",
        normalized_value_json: { type: "PLC", digital_inputs: 4, digital_outputs: 4 },
        display_value: "PLC compacto con 4 DI y 4 DO",
        page: 1,
        section: "Sección 1: Identificación y Modelo",
        excerpt:
          "El microcontrolador industrial modelo CN-DIN-PLC-A1 (código SKU: CN-DEMO-PLC-DIN-420-MR1) es una estación compacta de adquisición y control lógico para cuadros eléctricos.",
        polarity: true,
      },
    ],
  },
  {
    sku: "CN-DEMO-PID-PT100-RS1",
    model: "CN-PID-T1",
    handle: "cn-demo-pid-pt100-rs1",
    title: "Controlador Digital de Temperatura PID para Panel (CN-PID-T1)",
    subtitle: "Controlador PID Panel 48x48, Entrada Pt100 3-Hilos, Salida 4-20mA, Modbus RTU",
    description:
      "Controlador Digital de Temperatura PID formato panel 48×48 mm (1/16 DIN) con entrada directa Pt100 3 hilos, salida analógica de control 4–20 mA activa y comunicación Modbus RTU RS-485. Componente sintético para demostración técnica.",
    pricePen: 480,
    stock: 2,
    sourceId: "SRC-CN-PID-T1-DS-V1",
    pdfDatasheet: "/demo/datasheets/CN-DEMO-PID-PT100-RS1.pdf",
    markdownSpec: "/demo/specs/CN-DEMO-PID-PT100-RS1.md",
    facts: [
      {
        property: "mounting",
        normalized_value_json: {
          type: "panel mount",
          standard: "1/16 DIN",
          cutout_mm: "45x45",
          front_bezel_mm: "48x48",
        },
        display_value: "Montaje en panel frontal 1/16 DIN (48×48 mm)",
        page: 1,
        section: "Sección 2: Montaje Físico",
        excerpt:
          "Montaje empotrado en panel o puerta de armario eléctrico formato estándar 1/16 DIN (marco exterior 48 × 48 mm)",
        polarity: true,
      },
      {
        property: "supply_voltage",
        normalized_value_json: {
          type: "AC",
          nominal: "100-240 VAC",
          unit: "VAC",
          frequency_hz: "50/60",
          min: 85,
          max: 264,
        },
        display_value: "100 - 240 VAC universal (85 a 264 VAC)",
        page: 1,
        section: "Sección 3: Alimentación Eléctrica",
        excerpt:
          "Fuente conmutada universal de 100 a 240 VAC (límite operativo: 85 a 264 VAC), 50 / 60 Hz",
        polarity: true,
      },
      {
        property: "sensor_element",
        normalized_value_json: {
          type: "RTD",
          element: "Pt100",
          wires: 3,
          standard: "IEC 60751",
          min_c: -200.0,
          max_c: 600.0,
        },
        display_value: "Entrada termorresistencia Pt100 3 hilos",
        page: 2,
        section: "Sección 4: Entradas / Salidas Analógicas y Sensores",
        excerpt:
          "Entrada directa para sensor resistivo Pt100 con conexionado a 3 hilos para compensación de longitud de línea",
        polarity: true,
      },
      {
        property: "analog_input",
        normalized_value_json: { direction: "input", channels: 0, available: false },
        display_value: "0 canales (Sin entrada de corriente 4–20 mA)",
        page: 2,
        section: "Sección 4: Entradas / Salidas Analógicas y Sensores",
        excerpt:
          "SIN ENTRADA ANALÓGICA 4–20 mA DIRECTA. La entrada analógica está dedicada exclusivamente a termorresistencia RTD Pt100",
        polarity: false,
      },
      {
        property: "analog_output",
        normalized_value_json: {
          direction: "output",
          channels: 1,
          signal: "current",
          min: 4,
          max: 20,
          unit: "mA",
          active_loop: true,
          max_load_ohm: 500,
        },
        display_value: "1 salida analógica 4–20 mA activa para control modulante",
        page: 2,
        section: "Sección 4: Entradas / Salidas Analógicas y Sensores",
        excerpt:
          "1 salida analógica proporcional de control en corriente activa 4–20 mA (impedancia de carga máxima 500 Ω)",
        polarity: true,
      },
      {
        property: "control_function",
        normalized_value_json: {
          type: "PID",
          features: ["auto-tuning", "manual_mode", "on-off"],
          cycle_time_ms: 200,
        },
        display_value: "Regulador PID digital con Auto-Tuning",
        page: 1,
        section: "Sección 1: Identificación y Modelo",
        excerpt:
          "PID avanzado con auto-sintonía adaptativa (Auto-Tuning) y modo manual / ON-OFF seleccionable",
        polarity: true,
      },
      {
        property: "protocol",
        normalized_value_json: {
          name: "Modbus RTU",
          role: "slave",
          baudrates: [4800, 9600, 19200, 38400],
        },
        display_value: "Modbus RTU esclavo",
        page: 2,
        section: "Sección 5: Comunicaciones y Protocolos",
        excerpt:
          "Modbus RTU esclavo con soporte de comandos de lectura de variable de proceso (PV) y escritura de Setpoint (SP)",
        polarity: true,
      },
      {
        property: "interface",
        normalized_value_json: {
          type: "serial",
          physical_layer: "RS-485",
          duplex: "half-duplex",
          isolation_v: 1000,
        },
        display_value: "RS-485 semidúplex aislado",
        page: 2,
        section: "Sección 5: Comunicaciones y Protocolos",
        excerpt:
          "Canal serie RS-485 con aislamiento galvánico de 1000 V RMS y bornas traseras desacoplables",
        polarity: true,
      },
    ],
  },
  {
    sku: "CN-DEMO-PT100-3W-A1",
    model: "CN-RTD-P1",
    handle: "cn-demo-pt100-3w-a1",
    title: "Sonda Industrial de Temperatura RTD Pt100 3 Hilos (CN-RTD-P1)",
    subtitle: "Sonda Pt100 Pasiva 3-Hilos, AISI 316L, Sin Transmisor, Sin Modbus",
    description:
      "Sonda de temperatura industrial RTD Pt100 pasiva de 3 hilos en acero inoxidable AISI 316L con rosca 1/2\" NPT. Sensor pasivo sin transmisor integrado ni interfaz digital. Componente sintético para demostración técnica.",
    pricePen: 75,
    stock: 8,
    sourceId: "SRC-CN-RTD-P1-DS-V1",
    pdfDatasheet: "/demo/datasheets/CN-DEMO-PT100-3W-A1.pdf",
    markdownSpec: "/demo/specs/CN-DEMO-PT100-3W-A1.md",
    facts: [
      {
        property: "sensor_element",
        normalized_value_json: {
          type: "RTD",
          element: "Pt100",
          wires: 3,
          class: "A",
          standard: "IEC 60751",
          r0_ohm: 100.0,
          alpha: 0.00385,
          min_c: -50.0,
          max_c: 350.0,
        },
        display_value: "Sensor termorresistencia Pt100 Clase A, 3 hilos (-50 a +350 °C)",
        page: 2,
        section: "Sección 4: Entradas / Salidas Analógicas y Sensores",
        excerpt:
          "Elemento de platino puro bobinado Pt100 calibrado bajo norma IEC 60751 Clase A (tolerancia ±(0.15 + 0.002·|t|) °C)",
        polarity: true,
      },
      {
        property: "mounting",
        normalized_value_json: {
          type: "threaded probe",
          thread: "1/2 NPT",
          material: "AISI 316L",
          diameter_mm: 6.0,
          length_mm: 150,
        },
        display_value: "Sonda de inmersión roscada 1/2\" NPT, vaina AISI 316L 6×150 mm",
        page: 1,
        section: "Sección 2: Montaje Físico",
        excerpt:
          "Racor roscado fijo al proceso de 1/2 pulgada NPT macho en acero inoxidable AISI 316L",
        polarity: true,
      },
      {
        property: "supply_voltage",
        normalized_value_json: {
          type: "passive",
          external_power: false,
          nominal_v: 0,
          excitation_current_ma_min: 0.1,
          excitation_current_ma_max: 1.0,
        },
        display_value: "Sin alimentación propia (dispositivo puramente pasivo)",
        page: 1,
        section: "Sección 3: Alimentación Eléctrica",
        excerpt:
          "SIN ALIMENTACIÓN PROPIA (0 VDC / 0 VAC). Es un componente puramente pasivo",
        polarity: true,
      },
      {
        property: "analog_input",
        normalized_value_json: { direction: "input", channels: 0, available: false },
        display_value: "0 canales (No aplica)",
        page: 2,
        section: "Sección 4: Entradas / Salidas Analógicas y Sensores",
        excerpt: "No aplica. Sensor pasivo sin etapas de acondicionamiento",
        polarity: false,
      },
      {
        property: "analog_output",
        normalized_value_json: {
          direction: "output",
          channels: 0,
          available: false,
          notes: "No genera 4-20 mA ni voltaje por sí solo",
        },
        display_value: "0 canales (Sin transmisor; resistencia pura pasiva)",
        page: 2,
        section: "Sección 4: Entradas / Salidas Analógicas y Sensores",
        excerpt:
          "SIN TRANSMISOR INTEGRADO (0 transmisores). No incluye electrónica de acondicionamiento",
        polarity: false,
      },
      {
        property: "interface",
        normalized_value_json: {
          type: "none",
          digital_interface: false,
          cable_length_m: 2.0,
          cable_wires: 3,
        },
        display_value: "Sin interfaz digital (cable directo de 3 conductores)",
        page: 2,
        section: "Sección 5: Comunicaciones y Protocolos",
        excerpt:
          "NINGUNA. La sonda carece de microprocesador, UART, circuito integrado o puerto serie",
        polarity: false,
      },
      {
        property: "protocol",
        normalized_value_json: { name: "none", supported: false },
        display_value: "Ninguno (Sin protocolo serie ni bus de datos)",
        page: 2,
        section: "Sección 5: Comunicaciones y Protocolos",
        excerpt:
          "NO APLICA / SIN PROTOCOLO. No posee capacidad de comunicación digital por bus de datos",
        polarity: false,
      },
    ],
  },
]

function generateId(prefix: string): string {
  try {
    const { ulid } = require("ulid")
    return `${prefix}_${ulid()}`
  } catch {
    const rand = (
      Math.random().toString(36).substring(2, 14) +
      Math.random().toString(36).substring(2, 14)
    ).toUpperCase()
    return `${prefix}_01${rand.padEnd(24, "0").substring(0, 24)}`
  }
}

export default async function seedHackdayDemo({ container }: ExecArgs) {
  const logger = container.resolve("logger")
  logger.info("=========================================================")
  logger.info("🌱 INICIANDO SEED HACKDAY DEMO IDEMPOTENTE (FASE 1)")
  logger.info("=========================================================")

  const connectionString =
    process.env.DATABASE_URL || "postgres://postgres:password@localhost:5432/medusa"
  const client = new Client({ connectionString })
  await client.connect()

  try {
    // -----------------------------------------------------------------------
    // 1. CONFIGURACIÓN DE MONEDA 'PEN' Y TIENDA
    // -----------------------------------------------------------------------
    logger.info("1. Verificando moneda PEN y Store Currency...")
    const storeRes = await client.query("SELECT id FROM store LIMIT 1")
    if (!storeRes.rows.length) {
      throw new Error("No store found in database")
    }
    const storeId = storeRes.rows[0].id

    // Verificar moneda PEN en tabla currency
    const penCur = await client.query("SELECT code FROM currency WHERE code = 'pen'")
    if (!penCur.rows.length) {
      await client.query(`
        INSERT INTO currency (code, symbol, symbol_native, decimal_digits, rounding, raw_rounding, name, created_at, updated_at)
        VALUES ('pen', 'S/.', 'S/.', 2, 0, '{"value": "0", "precision": 20}'::jsonb, 'Peruvian Nuevo Sol', NOW(), NOW())
        ON CONFLICT (code) DO NOTHING
      `)
    }

    // Asegurar PEN en store_currency
    const storeCurRes = await client.query(
      "SELECT id FROM store_currency WHERE store_id = $1 AND currency_code = 'pen'",
      [storeId]
    )
    if (!storeCurRes.rows.length) {
      const stocurId = generateId("stocur")
      await client.query(
        `INSERT INTO store_currency (id, currency_code, is_default, store_id, created_at, updated_at)
         VALUES ($1, 'pen', false, $2, NOW(), NOW())`,
        [stocurId, storeId]
      )
      logger.info(`✅ Moneda PEN agregada a store_currency para tienda ${storeId}`)
    } else {
      logger.info("✅ Moneda PEN ya presente en store_currency")
    }

    // -----------------------------------------------------------------------
    // 2. CONFIGURACIÓN DE REGIÓN PERÚ (PEN)
    // -----------------------------------------------------------------------
    logger.info("2. Verificando Región Perú (PEN)...")
    let peRegionId = "reg_01M01FK2K4G93M9GKDRTPRP6ZB"
    const regCheck = await client.query(
      "SELECT id, name, currency_code FROM region WHERE currency_code = 'pen' OR id = $1 LIMIT 1",
      [peRegionId]
    )
    if (!regCheck.rows.length) {
      await client.query(
        `INSERT INTO region (id, name, currency_code, created_at, updated_at)
         VALUES ($1, 'Perú', 'pen', NOW(), NOW())
         ON CONFLICT (id) DO UPDATE SET currency_code = 'pen', name = 'Perú', updated_at = NOW()`,
        [peRegionId]
      )
      logger.info(`✅ Región Perú creada: ${peRegionId}`)
    } else {
      peRegionId = regCheck.rows[0].id
      logger.info(`✅ Región Perú detectada: ${peRegionId} (${regCheck.rows[0].currency_code})`)
    }

    // Vincular país PE a la región
    await client.query(
      `UPDATE region_country SET region_id = $1, updated_at = NOW() WHERE iso_2 = 'pe'`,
      [peRegionId]
    )

    // Asegurar proveedor de pago para región Perú
    const regppCheck = await client.query(
      "SELECT id FROM region_payment_provider WHERE region_id = $1",
      [peRegionId]
    )
    if (!regppCheck.rows.length) {
      await client.query(
        `INSERT INTO region_payment_provider (id, region_id, payment_provider_id, created_at, updated_at)
         VALUES ($1, $2, 'pp_system_default', NOW(), NOW())`,
        [generateId("regpp"), peRegionId]
      )
    }

    // -----------------------------------------------------------------------
    // 3. CANALES DE VENTA (Default y Demo) Y UBICACIÓN DE STOCK
    // -----------------------------------------------------------------------
    logger.info("3. Verificando canales de venta y ubicación de stock...")
    const defScRes = await client.query(
      "SELECT id, name FROM sales_channel WHERE name = 'Default Sales Channel' LIMIT 1"
    )
    let defaultSalesChannelId = defScRes.rows[0]?.id
    if (!defaultSalesChannelId) {
      defaultSalesChannelId = generateId("sc")
      await client.query(
        `INSERT INTO sales_channel (id, name, description, is_disabled, created_at, updated_at)
         VALUES ($1, 'Default Sales Channel', 'Canal de ventas predeterminado', false, NOW(), NOW())`,
        [defaultSalesChannelId]
      )
    }

    // Canal Demo
    let demoSalesChannelId = ""
    const demoScRes = await client.query(
      "SELECT id, name FROM sales_channel WHERE name = 'Demo Sales Channel' OR name = 'Canal Demo' LIMIT 1"
    )
    if (!demoScRes.rows.length) {
      demoSalesChannelId = generateId("sc")
      await client.query(
        `INSERT INTO sales_channel (id, name, description, is_disabled, created_at, updated_at)
         VALUES ($1, 'Demo Sales Channel', 'Canal de ventas exclusivo para demostraciones Hackday', false, NOW(), NOW())`,
        [demoSalesChannelId]
      )
      logger.info(`✅ Canal Demo creado: ${demoSalesChannelId}`)
    } else {
      demoSalesChannelId = demoScRes.rows[0].id
      logger.info(`✅ Canal Demo detectado: ${demoSalesChannelId}`)
    }

    // Ubicación de Stock
    const slocRes = await client.query("SELECT id, name FROM stock_location LIMIT 1")
    let stockLocationId = slocRes.rows[0]?.id
    if (!stockLocationId) {
      stockLocationId = generateId("sloc")
      await client.query(
        `INSERT INTO stock_location (id, name, created_at, updated_at)
         VALUES ($1, 'Almacén Principal Demostración', NOW(), NOW())`,
        [stockLocationId]
      )
    }
    logger.info(`✅ Ubicación de stock activa: ${stockLocationId}`)

    // Vincular canales a stock_location
    for (const scId of [defaultSalesChannelId, demoSalesChannelId]) {
      const linkCheck = await client.query(
        "SELECT id FROM sales_channel_stock_location WHERE sales_channel_id = $1 AND stock_location_id = $2",
        [scId, stockLocationId]
      )
      if (!linkCheck.rows.length) {
        await client.query(
          `INSERT INTO sales_channel_stock_location (id, sales_channel_id, stock_location_id, created_at, updated_at)
           VALUES ($1, $2, $3, NOW(), NOW())`,
          [generateId("scloc"), scId, stockLocationId]
        )
      }
    }

    // Vincular API Key publishable a los canales
    const pubKeyRes = await client.query(
      "SELECT id FROM api_key WHERE type = 'publishable' AND revoked_at IS NULL LIMIT 1"
    )
    if (pubKeyRes.rows.length) {
      const pubKeyId = pubKeyRes.rows[0].id
      for (const scId of [defaultSalesChannelId, demoSalesChannelId]) {
        const linkCheck = await client.query(
          "SELECT id FROM publishable_api_key_sales_channel WHERE publishable_key_id = $1 AND sales_channel_id = $2",
          [pubKeyId, scId]
        )
        if (!linkCheck.rows.length) {
          await client.query(
            `INSERT INTO publishable_api_key_sales_channel (id, publishable_key_id, sales_channel_id, created_at, updated_at)
             VALUES ($1, $2, $3, NOW(), NOW())`,
            [generateId("pksc"), pubKeyId, scId]
          )
        }
      }
    }

    // -----------------------------------------------------------------------
    // 4. CATEGORÍAS (Padre e Hija Hoja con mpath)
    // -----------------------------------------------------------------------
    logger.info("4. Verificando árbol de categorías de demostración...")
    let parentCatId = ""
    const parentCatRes = await client.query(
      "SELECT id, mpath FROM product_category WHERE handle = 'automatizacion-control' LIMIT 1"
    )
    if (!parentCatRes.rows.length) {
      parentCatId = generateId("pcat")
      await client.query(
        `INSERT INTO product_category (id, name, handle, description, mpath, is_active, is_internal, rank, created_at, updated_at)
         VALUES ($1, 'Automatización y Control', 'automatizacion-control', 'Equipos industriales de control y maniobra', $1, true, false, 0, NOW(), NOW())`,
        [parentCatId]
      )
    } else {
      parentCatId = parentCatRes.rows[0].id
    }

    let leafCatId = ""
    const leafCatRes = await client.query(
      "SELECT id, mpath FROM product_category WHERE handle = 'equipos-demo-hackday' LIMIT 1"
    )
    if (!leafCatRes.rows.length) {
      leafCatId = generateId("pcat")
      const childMpath = `${parentCatId}.${leafCatId}`
      await client.query(
        `INSERT INTO product_category (id, name, handle, description, mpath, parent_category_id, is_active, is_internal, rank, created_at, updated_at)
         VALUES ($1, 'Equipos Demo Hackday', 'equipos-demo-hackday', 'Productos sintéticos de demostración técnica', $2, $3, true, false, 1, NOW(), NOW())`,
        [leafCatId, childMpath, parentCatId]
      )
    } else {
      leafCatId = leafCatRes.rows[0].id
    }

    // -----------------------------------------------------------------------
    // 5. FUENTES TÉCNICAS (technical_source)
    // -----------------------------------------------------------------------
    logger.info("5. Poblando technical_source...")
    for (const src of DEMO_SOURCES) {
      await client.query(
        `INSERT INTO technical_source (id, url, kind, revision, checksum, published_at, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
         ON CONFLICT (id) DO UPDATE SET
           url = EXCLUDED.url,
           kind = EXCLUDED.kind,
           revision = EXCLUDED.revision,
           checksum = EXCLUDED.checksum,
           published_at = EXCLUDED.published_at,
           updated_at = NOW()`,
        [src.id, src.url, src.kind, src.revision, src.checksum, src.published_at]
      )
    }
    logger.info(`✅ 3 fuentes técnicas registradas en technical_source`)

    // -----------------------------------------------------------------------
    // 6. CREACIÓN O ACTUALIZACIÓN DETERMINISTA DE LOS 3 PRODUCTOS DEMO
    // -----------------------------------------------------------------------
    logger.info("6. Procesando los 3 productos demo de forma idempotente...")

    // Tag hackday_demo
    let tagId = ""
    const tagRes = await client.query(
      "SELECT id FROM product_tag WHERE value = 'hackday_demo' LIMIT 1"
    )
    if (!tagRes.rows.length) {
      tagId = generateId("ptag")
      await client.query(
        `INSERT INTO product_tag (id, value, created_at, updated_at)
         VALUES ($1, 'hackday_demo', NOW(), NOW())`,
        [tagId]
      )
    } else {
      tagId = tagRes.rows[0].id
    }

    const manifestEntries: Record<string, any> = {}

    for (const pDef of DEMO_PRODUCTS) {
      logger.info(`\n--- SKU: ${pDef.sku} (${pDef.model}) ---`)

      let productId = ""
      let variantId = ""

      // Buscar si el producto ya existe (por handle o por SKU de variante)
      const existingProduct = await client.query(
        `SELECT DISTINCT p.id, pv.id as variant_id
         FROM product p
         LEFT JOIN product_variant pv ON pv.product_id = p.id AND (pv.sku = $1 OR pv.title = $2)
         WHERE p.handle = $3 OR pv.sku = $1
         LIMIT 1`,
        [pDef.sku, pDef.model, pDef.handle]
      )

      if (existingProduct.rows.length && existingProduct.rows[0].id) {
        productId = existingProduct.rows[0].id
        variantId = existingProduct.rows[0].variant_id || ""
        logger.info(`ℹ️ Producto existente detectado: ${productId}`)

        // Actualizar datos del producto
        await client.query(
          `UPDATE product SET
             title = $1,
             handle = $2,
             subtitle = $3,
             description = $4,
             status = 'published',
             metadata = $5,
             updated_at = NOW()
           WHERE id = $6`,
          [
            pDef.title,
            pDef.handle,
            pDef.subtitle,
            pDef.description,
            JSON.stringify({ hackday_demo: true, demo: true, model: pDef.model, sku: pDef.sku }),
            productId,
          ]
        )

        // Si la variante existe, actualizarla
        if (variantId) {
          await client.query(
            `UPDATE product_variant SET
               title = $1,
               sku = $2,
               manage_inventory = true,
               allow_backorder = false,
               metadata = $3,
               updated_at = NOW()
             WHERE id = $4`,
            [
              pDef.model,
              pDef.sku,
              JSON.stringify({ hackday_demo: true, demo: true, model: pDef.model }),
              variantId,
            ]
          )
        }
      } else {
        // Crear mediante el workflow oficial de Medusa v2
        logger.info(`✨ Creando producto mediante createProductsWorkflow...`)
        const { result: createdProducts } = await createProductsWorkflow(container).run({
          input: {
            products: [
              {
                title: pDef.title,
                handle: pDef.handle,
                subtitle: pDef.subtitle,
                description: pDef.description,
                status: "published" as any,
                category_ids: [leafCatId],
                options: [{ title: "Modelo", values: [pDef.model] }],
                variants: [
                  {
                    title: pDef.model,
                    sku: pDef.sku,
                    manage_inventory: true,
                    prices: [{ amount: pDef.pricePen, currency_code: "pen" }],
                    options: { Modelo: pDef.model },
                  },
                ],
                metadata: { hackday_demo: true, demo: true, model: pDef.model, sku: pDef.sku },
              },
            ],
          },
        })

        if (!createdProducts || !createdProducts.length) {
          throw new Error(`Failed to create product for SKU ${pDef.sku}`)
        }

        const newProd = createdProducts[0]
        productId = newProd.id
        variantId = newProd.variants?.[0]?.id || ""
        logger.info(`✨ Producto creado en Medusa: ${productId}, Variante: ${variantId}`)
      }

      // Si por alguna razón la variante no se resolvió, buscarla en la base de datos
      if (!variantId) {
        const vRes = await client.query(
          "SELECT id FROM product_variant WHERE product_id = $1 AND (sku = $2 OR title = $3) LIMIT 1",
          [productId, pDef.sku, pDef.model]
        )
        if (vRes.rows.length) {
          variantId = vRes.rows[0].id
        } else {
          // Crear variante si faltara
          variantId = generateId("variant")
          await client.query(
            `INSERT INTO product_variant (id, product_id, title, sku, manage_inventory, allow_backorder, metadata, created_at, updated_at)
             VALUES ($1, $2, $3, $4, true, false, $5, NOW(), NOW())`,
            [
              variantId,
              productId,
              pDef.model,
              pDef.sku,
              JSON.stringify({ hackday_demo: true, demo: true, model: pDef.model }),
            ]
          )
        }
      }

      // D. Asegurar precio exacto en PEN
      let priceSetId = ""
      const pvpsRes = await client.query(
        "SELECT price_set_id FROM product_variant_price_set WHERE variant_id = $1 LIMIT 1",
        [variantId]
      )
      if (!pvpsRes.rows.length) {
        priceSetId = generateId("pset")
        await client.query(
          `INSERT INTO price_set (id, created_at, updated_at) VALUES ($1, NOW(), NOW())`,
          [priceSetId]
        )
        await client.query(
          `INSERT INTO product_variant_price_set (id, variant_id, price_set_id, created_at, updated_at)
           VALUES ($1, $2, $3, NOW(), NOW())`,
          [generateId("pvps"), variantId, priceSetId]
        )
      } else {
        priceSetId = pvpsRes.rows[0].price_set_id
      }

      const priceCheck = await client.query(
        "SELECT id FROM price WHERE price_set_id = $1 AND currency_code = 'pen' LIMIT 1",
        [priceSetId]
      )
      const rawPrice = JSON.stringify({ value: String(pDef.pricePen), precision: 20 })
      if (!priceCheck.rows.length) {
        await client.query(
          `INSERT INTO price (id, price_set_id, currency_code, amount, raw_amount, rules_count, created_at, updated_at)
           VALUES ($1, $2, 'pen', $3, $4, 0, NOW(), NOW())`,
          [generateId("price"), priceSetId, pDef.pricePen, rawPrice]
        )
      } else {
        await client.query(
          `UPDATE price SET amount = $1, raw_amount = $2, updated_at = NOW() WHERE id = $3`,
          [pDef.pricePen, rawPrice, priceCheck.rows[0].id]
        )
      }
      logger.info(`💰 Precio fijado: PEN ${pDef.pricePen} (en price_set ${priceSetId})`)

      // E. Inventario en ubicación de Medusa (cantidades exactas: 3, 2, 8)
      let inventoryItemId = ""
      const invItemRes = await client.query(
        "SELECT id FROM inventory_item WHERE sku = $1 LIMIT 1",
        [pDef.sku]
      )
      if (!invItemRes.rows.length) {
        inventoryItemId = generateId("iitem")
        await client.query(
          `INSERT INTO inventory_item (id, sku, title, description, requires_shipping, origin_country, created_at, updated_at)
           VALUES ($1, $2, $3, $4, true, 'PE', NOW(), NOW())`,
          [inventoryItemId, pDef.sku, pDef.title, pDef.title]
        )
      } else {
        inventoryItemId = invItemRes.rows[0].id
      }

      // Vincular variante con inventory_item
      const pviiCheck = await client.query(
        "SELECT id FROM product_variant_inventory_item WHERE variant_id = $1 AND inventory_item_id = $2 LIMIT 1",
        [variantId, inventoryItemId]
      )
      if (!pviiCheck.rows.length) {
        await client.query(
          `INSERT INTO product_variant_inventory_item (id, variant_id, inventory_item_id, required_quantity, created_at, updated_at)
           VALUES ($1, $2, $3, 1, NOW(), NOW())`,
          [generateId("pvitem"), variantId, inventoryItemId]
        )
      }

      // Nivel de stock en la ubicación
      const rawStock = JSON.stringify({ value: String(pDef.stock), precision: 20 })
      const zeroRaw = JSON.stringify({ value: "0", precision: 20 })
      const ilevCheck = await client.query(
        "SELECT id FROM inventory_level WHERE inventory_item_id = $1 AND location_id = $2 LIMIT 1",
        [inventoryItemId, stockLocationId]
      )
      if (!ilevCheck.rows.length) {
        await client.query(
          `INSERT INTO inventory_level (id, inventory_item_id, location_id, stocked_quantity, reserved_quantity, incoming_quantity, raw_stocked_quantity, raw_reserved_quantity, raw_incoming_quantity, created_at, updated_at)
           VALUES ($1, $2, $3, $4, 0, 0, $5, $6, $7, NOW(), NOW())`,
          [generateId("ilev"), inventoryItemId, stockLocationId, pDef.stock, rawStock, zeroRaw, zeroRaw]
        )
      } else {
        await client.query(
          `UPDATE inventory_level SET stocked_quantity = $1, raw_stocked_quantity = $2, updated_at = NOW() WHERE id = $3`,
          [pDef.stock, rawStock, ilevCheck.rows[0].id]
        )
      }
      logger.info(`📦 Stock fijado: ${pDef.stock} unidades en ubicación ${stockLocationId}`)

      // F. Canales de Venta (Default y Demo)
      for (const scId of [defaultSalesChannelId, demoSalesChannelId]) {
        const scLink = await client.query(
          "SELECT id FROM product_sales_channel WHERE product_id = $1 AND sales_channel_id = $2 LIMIT 1",
          [productId, scId]
        )
        if (!scLink.rows.length) {
          await client.query(
            `INSERT INTO product_sales_channel (id, product_id, sales_channel_id, created_at, updated_at)
             VALUES ($1, $2, $3, NOW(), NOW())`,
            [generateId("prodsc"), productId, scId]
          )
        }
      }

      // G. Tags del Producto
      const tagLinkCheck = await client.query(
        "SELECT product_id FROM product_tags WHERE product_id = $1 AND product_tag_id = $2 LIMIT 1",
        [productId, tagId]
      )
      if (!tagLinkCheck.rows.length) {
        await client.query(
          `INSERT INTO product_tags (product_id, product_tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
          [productId, tagId]
        )
      }

      // H. Categorías (Hoja y Padre)
      for (const catId of [parentCatId, leafCatId]) {
        const catLink = await client.query(
          "SELECT product_id FROM product_category_product WHERE product_id = $1 AND product_category_id = $2 LIMIT 1",
          [productId, catId]
        )
        if (!catLink.rows.length) {
          await client.query(
            `INSERT INTO product_category_product (product_id, product_category_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
            [productId, catId]
          )
        }
      }

      // I. PIM Info (Requerido para Storefront)
      const existingPim = await client.query(
        "SELECT id FROM pim_info WHERE product_id = $1 LIMIT 1",
        [productId]
      )
      const pimFields = [
        productId,
        `https://controlnautas.com/demo/datasheets/${pDef.sku}.pdf`,
        `/demo/specs/${pDef.sku}.md`,
        pDef.model,
        pDef.sku,
        "buy_now",
        "in_stock",
        "Control Nautas",
      ]
      if (!existingPim.rows.length) {
        await client.query(
          `INSERT INTO pim_info (id, product_id, technical_pdf, manual_pdf, mfr_model, item_number, purchase_mode, availability_mode, oem_brand, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())`,
          [generateId("pminf"), ...pimFields]
        )
      } else {
        await client.query(
          `UPDATE pim_info SET
             technical_pdf = $1,
             manual_pdf = $2,
             mfr_model = $3,
             item_number = $4,
             purchase_mode = $5,
             availability_mode = $6,
             oem_brand = $7,
             updated_at = NOW()
           WHERE id = $8`,
          [...pimFields.slice(1), existingPim.rows[0].id]
        )
      }

      // J. Technical Profile (usando variant_id nativo)
      const profCheck = await client.query(
        "SELECT id FROM technical_profile WHERE variant_id = $1 LIMIT 1",
        [variantId]
      )
      if (!profCheck.rows.length) {
        await client.query(
          `INSERT INTO technical_profile (id, variant_id, model, revision, demo, created_at, updated_at)
           VALUES ($1, $2, $3, 'rev-2026.1', true, NOW(), NOW())`,
          [generateId("techprof"), variantId, pDef.model]
        )
      } else {
        await client.query(
          `UPDATE technical_profile SET model = $1, revision = 'rev-2026.1', demo = true, updated_at = NOW() WHERE id = $2`,
          [pDef.model, profCheck.rows[0].id]
        )
      }

      // K. Technical Facts (Idempotente: eliminar y reinsertar hechos de la variante)
      await client.query("DELETE FROM technical_fact WHERE variant_id = $1", [variantId])
      for (const fact of pDef.facts) {
        await client.query(
          `INSERT INTO technical_fact (id, variant_id, property, normalized_value_json, display_value, source_id, page, section, excerpt, polarity, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())`,
          [
            generateId("techfact"),
            variantId,
            fact.property,
            JSON.stringify(fact.normalized_value_json),
            fact.display_value,
            pDef.sourceId,
            fact.page,
            fact.section,
            fact.excerpt,
            fact.polarity,
          ]
        )
      }
      logger.info(`🔬 ${pDef.facts.length} facts técnicos guardados para variante ${variantId}`)

      // Entrada para el manifiesto (mapeo SKU -> variant_id -> product_id -> handle -> urls)
      manifestEntries[pDef.sku] = {
        sku: pDef.sku,
        model: pDef.model,
        product_id: productId,
        variant_id: variantId,
        handle: pDef.handle,
        urls: {
          pdf_datasheet: pDef.pdfDatasheet,
          markdown_spec: pDef.markdownSpec,
          pdf_datasheet_url: `http://localhost:9000/static${pDef.pdfDatasheet}`,
          markdown_spec_url: `http://localhost:9000/static${pDef.markdownSpec}`,
          pdf_datasheet_public: `https://controlnautas.com${pDef.pdfDatasheet}`,
          markdown_spec_public: `https://controlnautas.com${pDef.markdownSpec}`,
        },
      }
    }

    // -----------------------------------------------------------------------
    // 7. GENERACIÓN DEL MANIFIESTO JSON
    // -----------------------------------------------------------------------
    const manifestPath = path.resolve("/home/ubuntu/hackday26/hackday-demo-manifest.json")
    const manifestPayload = {
      generated_at: new Date().toISOString(),
      region: {
        id: peRegionId,
        name: "Perú",
        currency_code: "pen",
      },
      sales_channels: [
        { id: defaultSalesChannelId, name: "Default Sales Channel" },
        { id: demoSalesChannelId, name: "Demo Sales Channel" },
      ],
      stock_location: {
        id: stockLocationId,
      },
      products: manifestEntries,
      ...manifestEntries,
    }

    fs.writeFileSync(manifestPath, JSON.stringify(manifestPayload, null, 2), "utf8")
    logger.info(`\n📄 Manifiesto JSON generado exitosamente en: ${manifestPath}`)

    logger.info("=========================================================")
    logger.info("🎉 SEED HACKDAY DEMO COMPLETADO CON ÉXITO")
    logger.info("=========================================================")
  } finally {
    await client.end()
  }
}
