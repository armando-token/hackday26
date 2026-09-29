import { ExecArgs } from "@medusajs/framework/types"
import { createProductsWorkflow } from "@medusajs/medusa/core-flows"
import * as crypto from "crypto"
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
  priceUsd: number // 890, 480, 75
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

const DEMO_BASE_URL =
  process.env.DEMO_BASE_URL ||
  process.env.STOREFRONT_BASE_URL ||
  "https://data.controlnautas.com"

function getDatasheetChecksum(pdfPath: string, fallback: string): string {
  try {
    if (fs.existsSync(pdfPath)) {
      const fileBuffer = fs.readFileSync(pdfPath)
      return crypto.createHash("sha256").update(fileBuffer).digest("hex")
    }
  } catch {
    // fallback
  }
  return fallback
}

const DEMO_SOURCES = [
  {
    id: "SRC-HE-XP5-DS-MAN1363-R21",
    url: `${DEMO_BASE_URL}/demo/datasheets/CN-X5PRIME-HE-XP5.pdf`,
    kind: "datasheet",
    revision: "MAN1363-R21",
    checksum: getDatasheetChecksum(
      "/home/ubuntu/hackday26/docs/datasheets/CN-X5PRIME-HE-XP5.pdf",
      "70278736e6b8f3ab170876274a02a3ba7be0942bc2b0995bf7d5742f8bd1d742"
    ),
    published_at: "2023-07-24T00:00:00Z",
  },
  {
    id: "SRC-N1200-UG-V2",
    url: `${DEMO_BASE_URL}/demo/datasheets/CN-N1200.pdf`,
    kind: "datasheet",
    revision: "UG-V2.0xQ-EN",
    checksum: getDatasheetChecksum(
      "/home/ubuntu/hackday26/docs/datasheets/CN-N1200.pdf",
      "53384720600d70cdce641350c30b0b86ad5e44a8b37291dbaef8ee0852f86554"
    ),
    published_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "SRC-THT02-UM-V1.1",
    url: `${DEMO_BASE_URL}/demo/datasheets/CN-THT02.pdf`,
    kind: "datasheet",
    revision: "UM-V1.1",
    checksum: getDatasheetChecksum(
      "/home/ubuntu/hackday26/docs/datasheets/CN-THT02.pdf",
      "48718e71596413492f2a871e520c1567e6fe1e8abe05b89822a0f21e091e6a7c"
    ),
    published_at: "2024-01-01T00:00:00Z",
  },
]

const DEMO_PRODUCTS: DemoProductDef[] = [
  {
    sku: "CN-X5PRIME-HE-XP5",
    model: "HE-XP5",
    handle: "cn-x5prime-he-xp5",
    title: "X5 Prime OCS All-in-One Controller (HE-XP5)",
    subtitle: "Horner Automation OCS, built-in I/O, 10–30 VDC primary power",
    description:
      "All-in-one Operator Control Station (OCS) from Horner Automation, part number HE-XP5. Datasheet MAN1363 R21 lists built-in I/O as 4 digital DC inputs, 4 digital DC outputs, and 4 analog inputs. Primary power range 10–30 VDC. Real manufacturer documentation published for Hack Day Muse Commerce demo.",
    priceUsd: 890,
    stock: 3,
    sourceId: "SRC-HE-XP5-DS-MAN1363-R21",
    pdfDatasheet: "/demo/datasheets/CN-X5PRIME-HE-XP5.pdf",
    markdownSpec: "/demo/specs/CN-X5PRIME-HE-XP5.md",
    facts: [
      {
        property: "control_function",
        normalized_value_json: {
          type: "OCS",
          brand: "Horner Automation",
          part_number: "HE-XP5",
          digital_inputs: 4,
          digital_outputs: 4,
          analog_inputs: 4,
        },
        display_value: "OCS all-in-one controller with built-in I/O (HE-XP5)",
        page: 1,
        section: "X5 Prime OCS Datasheet — Overview / Built-In I/O",
        excerpt:
          "Built-In I/O: 4 Digital DC Inputs, 4 Digital DC Outputs, 4 Analog Inputs — Part Number: HE-XP5",
        polarity: true,
      },
      {
        property: "supply_voltage",
        normalized_value_json: {
          type: "DC",
          unit: "VDC",
          min: 10,
          max: 30,
          primary_power: "10-30 VDC",
        },
        display_value: "Primary power 10–30 VDC",
        page: 1,
        section: "Power Wiring / Primary Power Range",
        excerpt: "Primary Power Range 10 VDC to 30 VDC",
        polarity: true,
      },
      {
        property: "analog_input",
        normalized_value_json: {
          direction: "input",
          channels: 4,
          built_in: true,
          notes: "See datasheet analog input tables for supported ranges/types; do not assume 4-20 mA unless a datasheet row states it",
        },
        display_value: "4 built-in analog inputs (see datasheet ranges)",
        page: 1,
        section: "Analog Inputs",
        excerpt: "Built-In I/O includes 4 Analog Inputs",
        polarity: true,
      },
      {
        property: "analog_output",
        normalized_value_json: {
          direction: "output",
          channels: 0,
          available: false,
          notes: "Built-in I/O summary lists DI/DO/AI; dedicated analog outputs are not claimed in that summary line",
        },
        display_value: "No dedicated built-in analog outputs claimed in I/O summary",
        page: 1,
        section: "Built-In I/O",
        excerpt:
          "Built-In I/O summary: 4 Digital DC Inputs, 4 Digital DC Outputs, 4 Analog Inputs",
        polarity: false,
      },
      {
        property: "interface",
        normalized_value_json: {
          type: "mixed",
          onboard_io: true,
          digital_dc_inputs: 4,
          digital_dc_outputs: 4,
          analog_inputs: 4,
        },
        display_value: "Onboard digital/analog I/O (see datasheet I/O tables)",
        page: 1,
        section: "Digital & Analog I/O Specifications",
        excerpt: "Built-In I/O: 4 Digital DC Inputs, 4 Digital DC Outputs, 4 Analog Inputs",
        polarity: true,
      },
      {
        property: "protocol",
        normalized_value_json: {
          name: "platform_connectivity",
          notes: "Controller/OCS platform connectivity per Horner user-manual family docs; cite specific protocol only when evidenced",
        },
        display_value: "OCS platform connectivity (see Horner manuals)",
        page: 1,
        section: "Control and Logic / Connectivity",
        excerpt: "X5 Prime OCS control and logic platform with family connectivity documentation",
        polarity: true,
      },
      {
        property: "mounting",
        normalized_value_json: {
          type: "operator_control_station",
          form_factor: "all-in-one OCS",
        },
        display_value: "All-in-one Operator Control Station form factor",
        page: 1,
        section: "Product Overview",
        excerpt: "All-in-one Operator Control Station (OCS) with built-in I/O",
        polarity: true,
      },
    ],
  },
  {
    sku: "CN-N1200",
    model: "N1200",
    handle: "cn-n1200",
    title: "NOVUS N1200 Universal Process Controller",
    subtitle: "Universal multi-sensor input (incl. Pt100), PID self-tuning, 4–20 mA outputs",
    description:
      "NOVUS N1200 universal process controller with multi-sensor input including Pt100, PID automatic mode with self-tuning, relay / 4–20 mA / logic pulse outputs on the standard model, PV/SP retransmission in 0–20 mA or 4–20 mA, and USB serial recognized as a Modbus RTU COM port for configuration. Real manufacturer documentation for Hack Day Muse Commerce demo.",
    priceUsd: 480,
    stock: 2,
    sourceId: "SRC-N1200-UG-V2",
    pdfDatasheet: "/demo/datasheets/CN-N1200.pdf",
    markdownSpec: "/demo/specs/CN-N1200.md",
    facts: [
      {
        property: "sensor_element",
        normalized_value_json: {
          type: "universal_input",
          includes: ["Pt100", "thermocouple", "mA", "V"],
          element: "Pt100",
        },
        display_value: "Universal input including Pt100",
        page: 1,
        section: "Input Type Selection",
        excerpt: "Multi-sensor universal input including Pt100",
        polarity: true,
      },
      {
        property: "control_function",
        normalized_value_json: {
          type: "PID",
          features: ["self-tuning", "automatic_mode"],
        },
        display_value: "PID automatic mode with self-tuning",
        page: 1,
        section: "PID Automatic Mode",
        excerpt: "Self-tuning of PID parameters / PID automatic mode",
        polarity: true,
      },
      {
        property: "analog_output",
        normalized_value_json: {
          direction: "output",
          signal: "current",
          min: 4,
          max: 20,
          unit: "mA",
          also: ["relay", "logic_pulse", "retransmission_0_20_or_4_20_mA"],
        },
        display_value: "4–20 mA control and/or PV/SP retransmission",
        page: 1,
        section: "Outputs / Retransmission",
        excerpt:
          "Relay, 4–20 mA and logic pulse outputs; retransmission of PV or SP in 0–20 mA or 4–20 mA",
        polarity: true,
      },
      {
        property: "analog_input",
        normalized_value_json: {
          direction: "input",
          type: "universal_process",
          notes: "Universal process inputs (mA/V/TC/RTD incl. Pt100) — not the same as claiming dedicated dual AI 4–20 channels like a PLC card",
        },
        display_value: "Universal process inputs (mA/V/TC/RTD)",
        page: 1,
        section: "Input Type Selection",
        excerpt: "Multi-sensor universal input",
        polarity: true,
      },
      {
        property: "protocol",
        normalized_value_json: {
          name: "Modbus RTU",
          via: "USB serial configuration interface",
        },
        display_value: "Modbus RTU via USB serial",
        page: 1,
        section: "Introduction — USB / Modbus RTU",
        excerpt: "USB serial recognized as Modbus RTU COM port for configuration",
        polarity: true,
      },
      {
        property: "interface",
        normalized_value_json: {
          type: "USB",
          protocol: "Modbus RTU",
          role: "configuration",
        },
        display_value: "USB configuration interface (Modbus RTU)",
        page: 1,
        section: "Introduction — USB",
        excerpt: "USB configuration; Modbus RTU over USB serial",
        polarity: true,
      },
      {
        property: "mounting",
        normalized_value_json: {
          type: "panel",
          form_factor: "process_controller",
        },
        display_value: "Panel process controller form factor",
        page: 1,
        section: "Installation / Mechanical",
        excerpt: "Panel process controller form factor (see mechanical drawings)",
        polarity: true,
      },
      {
        property: "supply_voltage",
        normalized_value_json: {
          type: "universal",
          notes: "Universal power supply — see guide electrical ratings",
        },
        display_value: "Universal power supply (see user guide ratings)",
        page: 1,
        section: "Power supply connections",
        excerpt: "Universal power supply (see guide electrical ratings)",
        polarity: true,
      },
    ],
  },
  {
    sku: "CN-THT02",
    model: "THT-02",
    handle: "cn-tht02",
    title: "TZ THT-02 Temperature and Humidity Sensor (RS-485 Modbus RTU)",
    subtitle: "SHT30 sensing, RS-485 Modbus RTU, DC 5–24 V supply",
    description:
      "TZ / Tzone THT-02 temperature and humidity sensor/transmitter using SHT30, speaking standard Modbus-RTU over RS-485. Supply DC 5–24 V. Temperature range -40 to 125 °C; humidity 5–95 %RH. Address set by DIP switch. Real manufacturer documentation for Hack Day Muse Commerce demo.",
    priceUsd: 75,
    stock: 8,
    sourceId: "SRC-THT02-UM-V1.1",
    pdfDatasheet: "/demo/datasheets/CN-THT02.pdf",
    markdownSpec: "/demo/specs/CN-THT02.md",
    facts: [
      {
        property: "sensor_element",
        normalized_value_json: {
          type: "combined",
          chip: "SHT30",
          measures: ["temperature", "relative_humidity"],
          notes: "Not a bare Pt100 3-wire RTD",
        },
        display_value: "SHT30 temperature + relative humidity",
        page: 1,
        section: "Overview / Features",
        excerpt: "SHT30-based temperature and relative humidity sensing",
        polarity: true,
      },
      {
        property: "protocol",
        normalized_value_json: {
          name: "Modbus RTU",
          standard: true,
        },
        display_value: "Standard Modbus-RTU",
        page: 1,
        section: "Overview / Features",
        excerpt: "compatible with the standard Modbus-RTU protocol",
        polarity: true,
      },
      {
        property: "interface",
        normalized_value_json: {
          type: "serial",
          physical_layer: "RS-485",
        },
        display_value: "RS-485",
        page: 1,
        section: "Interface / Wiring",
        excerpt: "RS-485 interface, standard Modbus-RTU protocol",
        polarity: true,
      },
      {
        property: "supply_voltage",
        normalized_value_json: {
          type: "DC",
          unit: "VDC",
          min: 5,
          max: 24,
        },
        display_value: "DC 5–24 V",
        page: 1,
        section: "Electrical — Supply",
        excerpt: "Supply voltage DC 5～24V",
        polarity: true,
      },
      {
        property: "analog_output",
        normalized_value_json: {
          direction: "output",
          channels: 0,
          available: false,
          notes: "Digital Modbus registers; 4–20 mA not claimed in this manual",
        },
        display_value: "No 4–20 mA analog output claimed (Modbus registers)",
        page: 1,
        section: "Register map",
        excerpt: "Digital Modbus registers — analog 4–20 mA not claimed in this manual",
        polarity: false,
      },
      {
        property: "analog_input",
        normalized_value_json: {
          direction: "input",
          channels: 0,
          available: false,
          notes: "Not applicable as PLC AI",
        },
        display_value: "Not applicable (sensor, not PLC AI)",
        page: 1,
        section: "Overview",
        excerpt: "Temperature and humidity sensor/transmitter, not a PLC analog input card",
        polarity: false,
      },
      {
        property: "mounting",
        normalized_value_json: {
          type: "probe_sensor",
          address_config: "DIP switch",
        },
        display_value: "Probe/sensor installation; address via DIP switch",
        page: 1,
        section: "Wiring / Address",
        excerpt: "Address set by DIP switch; probe/sensor installation per manual wiring",
        polarity: true,
      },
      {
        property: "control_function",
        normalized_value_json: {
          type: "sensing",
          temperature_c: { min: -40, max: 125 },
          humidity_rh: { min: 5, max: 95 },
        },
        display_value: "Temperature -40…125 °C; humidity 5–95 %RH",
        page: 1,
        section: "Measuring range",
        excerpt: "Measuring range -40～125℃; humidity 5–95 %RH",
        polarity: true,
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
  logger.info("🌱 INICIANDO SEED HACKDAY DEMO IDEMPOTENTE (ENGLISH & USD)")
  logger.info("=========================================================")

  const connectionString =
    process.env.DATABASE_URL || "postgres://postgres:password@localhost:5432/medusa"
  const client = new Client({ connectionString })
  await client.connect()

  try {
    // -----------------------------------------------------------------------
    // 1. CONFIGURACIÓN DE MONEDA 'USD' Y TIENDA
    // -----------------------------------------------------------------------
    logger.info("1. Verificando moneda USD y Store Currency...")
    const storeRes = await client.query("SELECT id FROM store LIMIT 1")
    if (!storeRes.rows.length) {
      throw new Error("No store found in database")
    }
    const storeId = storeRes.rows[0].id

    // Verificar moneda USD en tabla currency
    const usdCur = await client.query("SELECT code FROM currency WHERE code = 'usd'")
    if (!usdCur.rows.length) {
      await client.query(`
        INSERT INTO currency (code, symbol, symbol_native, decimal_digits, rounding, raw_rounding, name, created_at, updated_at)
        VALUES ('usd', '$', '$', 2, 0, '{"value": "0", "precision": 20}'::jsonb, 'US Dollar', NOW(), NOW())
        ON CONFLICT (code) DO NOTHING
      `)
    }

    // Asegurar USD en store_currency
    const storeCurRes = await client.query(
      "SELECT id FROM store_currency WHERE store_id = $1 AND currency_code = 'usd'",
      [storeId]
    )
    if (!storeCurRes.rows.length) {
      const stocurId = generateId("stocur")
      await client.query(
        `INSERT INTO store_currency (id, currency_code, is_default, store_id, created_at, updated_at)
         VALUES ($1, 'usd', false, $2, NOW(), NOW())`,
        [stocurId, storeId]
      )
      logger.info(`✅ Moneda USD agregada a store_currency para tienda ${storeId}`)
    } else {
      logger.info("✅ Moneda USD ya presente en store_currency")
    }

    // -----------------------------------------------------------------------
    // 2. CONFIGURACIÓN DE REGIÓN UNITED STATES (USD)
    // -----------------------------------------------------------------------
    logger.info("2. Verificando Región United States (USD)...")
    let usRegionId = "reg_01JUS00HACKDAY26DEMOUSD0000"
    const regCheck = await client.query(
      "SELECT id, name, currency_code FROM region WHERE currency_code = 'usd' OR id = $1 LIMIT 1",
      [usRegionId]
    )
    if (!regCheck.rows.length) {
      await client.query(
        `INSERT INTO region (id, name, currency_code, created_at, updated_at)
         VALUES ($1, 'United States', 'usd', NOW(), NOW())
         ON CONFLICT (id) DO UPDATE SET currency_code = 'usd', name = 'United States', updated_at = NOW()`,
        [usRegionId]
      )
      logger.info(`✅ Región United States creada: ${usRegionId}`)
    } else {
      usRegionId = regCheck.rows[0].id
      logger.info(`✅ Región United States detectada: ${usRegionId} (${regCheck.rows[0].currency_code})`)
    }

    // Vincular país US a la región
    await client.query(
      `UPDATE region_country SET region_id = $1, updated_at = NOW() WHERE iso_2 = 'us'`,
      [usRegionId]
    )

    // Asegurar proveedor de pago para región United States
    const regppCheck = await client.query(
      "SELECT id FROM region_payment_provider WHERE region_id = $1",
      [usRegionId]
    )
    if (!regppCheck.rows.length) {
      await client.query(
        `INSERT INTO region_payment_provider (id, region_id, payment_provider_id, created_at, updated_at)
         VALUES ($1, $2, 'pp_system_default', NOW(), NOW())`,
        [generateId("regpp"), usRegionId]
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
         VALUES ($1, 'Default Sales Channel', 'Default sales channel', false, NOW(), NOW())`,
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
         VALUES ($1, 'Demo Sales Channel', 'Exclusive sales channel for Hackday demonstrations', false, NOW(), NOW())`,
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
         VALUES ($1, 'Main Demo Warehouse', NOW(), NOW())`,
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
      for (const scId of [defaultSalesChannelId]) {
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
      // Asegurar que no haya canales secundarios vinculados a la publishable key para evitar error de inventario en Medusa v2
      await client.query(
        "DELETE FROM publishable_api_key_sales_channel WHERE publishable_key_id = $1 AND sales_channel_id != $2",
        [pubKeyId, defaultSalesChannelId]
      )
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
         VALUES ($1, 'Automation & Control', 'automatizacion-control', 'Industrial control and automation equipment', $1, true, false, 0, NOW(), NOW())`,
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
         VALUES ($1, 'Hackday Demo Equipment', 'equipos-demo-hackday', 'Synthetic technical demonstration components', $2, $3, true, false, 1, NOW(), NOW())`,
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
                options: [{ title: "Model", values: [pDef.model] }],
                variants: [
                  {
                    title: pDef.model,
                    sku: pDef.sku,
                    manage_inventory: true,
                    prices: [{ amount: pDef.priceUsd, currency_code: "usd" }],
                    options: { Model: pDef.model },
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

      // D. Asegurar precio exacto en USD
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

      // Limpiar precios no-usd obsoletos para esta variante
      await client.query(
        "DELETE FROM price WHERE price_set_id = $1 AND currency_code != 'usd'",
        [priceSetId]
      )

      const priceCheck = await client.query(
        "SELECT id FROM price WHERE price_set_id = $1 AND currency_code = 'usd' LIMIT 1",
        [priceSetId]
      )
      const rawPrice = JSON.stringify({ value: String(pDef.priceUsd), precision: 20 })
      if (!priceCheck.rows.length) {
        await client.query(
          `INSERT INTO price (id, price_set_id, currency_code, amount, raw_amount, rules_count, created_at, updated_at)
           VALUES ($1, $2, 'usd', $3, $4, 0, NOW(), NOW())`,
          [generateId("price"), priceSetId, pDef.priceUsd, rawPrice]
        )
      } else {
        await client.query(
          `UPDATE price SET amount = $1, raw_amount = $2, updated_at = NOW() WHERE id = $3`,
          [pDef.priceUsd, rawPrice, priceCheck.rows[0].id]
        )
      }
      logger.info(`💰 Precio fijado: USD ${pDef.priceUsd} (en price_set ${priceSetId})`)

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
           VALUES ($1, $2, $3, $4, true, 'US', NOW(), NOW())`,
          [inventoryItemId, pDef.sku, pDef.title, pDef.title]
        )
      } else {
        inventoryItemId = invItemRes.rows[0].id
        await client.query(
          `UPDATE inventory_item SET title = $1, description = $2, origin_country = 'US', updated_at = NOW() WHERE id = $3`,
          [pDef.title, pDef.title, inventoryItemId]
        )
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
      const oemBrand =
        pDef.sku === "CN-X5PRIME-HE-XP5"
          ? "Horner Automation"
          : pDef.sku === "CN-N1200"
            ? "NOVUS"
            : pDef.sku === "CN-THT02"
              ? "TZ / Tzone"
              : "Controlnautas"
      const pimFields = [
        productId,
        `${DEMO_BASE_URL}/demo/datasheets/${pDef.sku}.pdf`,
        `/demo/specs/${pDef.sku}.md`,
        pDef.model,
        pDef.sku,
        "buy_now",
        "in_stock",
        oemBrand,
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
          pdf_datasheet: `${DEMO_BASE_URL}/demo/datasheets/${pDef.sku}.pdf`,
          markdown_spec: `${DEMO_BASE_URL}/demo/specs/${pDef.sku}.md`,
          pdf_datasheet_relative: `/demo/datasheets/${pDef.sku}.pdf`,
          markdown_spec_relative: `/demo/specs/${pDef.sku}.md`,
          pdp_human: `${DEMO_BASE_URL}/us/products/${pDef.handle}`,
          pdp_relative: `/us/products/${pDef.handle}`,
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
        id: usRegionId,
        name: "United States",
        currency_code: "usd",
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
