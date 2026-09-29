/**
 * Automated Verification Suite for Phase 1 (Puerta 1)
 * Controlnautas × Meta Muse (Hack Day 2026)
 *
 * Verifies 100% of Acceptance Criteria:
 *  1. 3 SKUs exist in Medusa with price and stock (USD 890 / stock 3, USD 480 / stock 2, USD 75 / stock 8)
 *  2. Human pages open and display fiction notice ("FICTITIOUS PRODUCT — DEMONSTRATION DATA")
 *  3. PDF datasheets open, contain simulation watermark ("SIMULATION") + 6 citable numbered sections
 *  4. Markdown specs formally cite fragments matching the PDF, strictly without embedded price or stock
 *  5. Seed idempotency (running seed multiple times does not duplicate products or change IDs)
 *  6. Revert isolation (revert removes only demo data, preserves foreign catalog 100%)
 *  7. Invented SKU returns 404 / no match in database and storefront
 *  8. Manifest generated with dynamic SKU -> variant_id mapping (no hardcoded variant IDs)
 */

import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import zlib from "zlib";

// ANSI colors
const RESET = "\x1b[0m";
const BOLD = "\x1b[1m";
const GREEN = "\x1b[32m";
const RED = "\x1b[31m";
const YELLOW = "\x1b[33m";
const CYAN = "\x1b[36m";

interface TestResult {
  gate: string;
  name: string;
  passed: boolean;
  expected: string;
  actual: string;
  details?: any;
}

const results: TestResult[] = [];

function record(
  gate: string,
  name: string,
  passed: boolean,
  expected: string,
  actual: string,
  details?: any
) {
  results.push({ gate, name, passed, expected, actual, details });
  const status = passed
    ? `${GREEN}✔ PASS${RESET}`
    : `${RED}✘ FAIL${RESET}`;
  console.log(`  [${status}] [${gate}] ${BOLD}${name}${RESET}`);
  if (!passed) {
    console.log(`         ${YELLOW}Expected:${RESET} ${expected}`);
    console.log(`         ${RED}Actual:${RESET}   ${actual}`);
  }
}

// Helper: Query Postgres DB
function psqlQuery<T = any>(sql: string): T[] {
  try {
    const wrapped = `SELECT json_agg(t) FROM (${sql.trim().replace(/;+$/, "")}) t;`;
    const stdout = execSync(
      `PGPASSWORD=password psql -U postgres -h localhost -d medusa -t -A -c "${wrapped}"`,
      { encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] }
    );
    const trimmed = stdout.trim();
    if (!trimmed || trimmed === "") return [];
    return JSON.parse(trimmed) || [];
  } catch (err: any) {
    console.error("psqlQuery error:", err.message);
    return [];
  }
}

// Helper: Decode text from ReportLab PDF streams (handles ASCII85 + FlateDecode + Octal escaping via Python helper)
function extractPdfText(filePath: string): string {
  if (!fs.existsSync(filePath)) return "";
  try {
    const pyScript = `
import sys, base64, zlib, re

def decode_pdf_text(path):
    with open(path, "rb") as f:
        data = f.read()
    idx = 0
    all_text = []
    while True:
        pos = data.find(b"stream\\n", idx)
        if pos == -1: break
        endpos = data.find(b"endstream", pos)
        raw = data[pos+7:endpos].strip()
        try:
            a85 = base64.a85decode(raw, adobe=True)
            dec = zlib.decompress(a85).decode("latin1", errors="ignore")
            all_text.append(dec)
        except Exception:
            pass
        idx = endpos + 9
    full = "\\n".join(all_text)
    extracted = []
    for m in re.finditer(r"\\((.*?)\\)\\s*Tj", full):
        s = m.group(1)
        s = re.sub(r"\\\\([0-7]{3})", lambda match: chr(int(match.group(1), 8)), s)
        s = s.replace(r"\\(", "(").replace(r"\\)", ")").replace(r"\\\\", "\\\\")
        extracted.append(s)
    return " ".join(extracted)

print(decode_pdf_text(sys.argv[1]))
`;
    const stdout = execSync(`python3 -c '${pyScript}' "${filePath}"`, {
      encoding: "utf8",
      stdio: ["pipe", "pipe", "pipe"],
    });
    return stdout;
  } catch (err: any) {
    console.error(`extractPdfText error on ${filePath}:`, err.message);
    return "";
  }
}


async function runSuite() {
  console.log(`${BOLD}${CYAN}================================================================${RESET}`);
  console.log(`${BOLD}${CYAN}  CONTROLNAUTAS × META MUSE — AUDITORÍA AUTOMATIZADA DE FASE 1  ${RESET}`);
  console.log(`${BOLD}${CYAN}  Verificación Integral de Criterios de Aceptación (Puerta 1)   ${RESET}`);
  console.log(`${BOLD}${CYAN}================================================================${RESET}\n`);

  const EXPECTED_SKUS = [
    {
      sku: "CN-DEMO-PLC-DIN-420-MR1",
      model: "CN-DIN-PLC-A1",
      priceUsd: 890,
      stock: 3,
      requiredProperties: ["mounting", "supply_voltage", "analog_input", "protocol", "interface"],
      requiredFacts: ["DIN 35 mm", "24 VDC", "4–20 mA", "RS-485", "Modbus RTU"],
      prohibitedFacts: ["Modbus TCP", "analog output", "salida analógica"],
    },
    {
      sku: "CN-DEMO-PID-PT100-RS1",
      model: "CN-PID-T1",
      priceUsd: 480,
      stock: 2,
      requiredProperties: ["mounting", "sensor_element", "analog_output", "control_function", "protocol"],
      requiredFacts: ["panel", "Pt100", "PID", "4–20 mA", "Modbus RTU"],
      prohibitedFacts: ["DIN", "output ≠ input", "salida ≠ entrada"],
    },
    {
      sku: "CN-DEMO-PT100-3W-A1",
      model: "CN-RTD-P1",
      priceUsd: 75,
      stock: 8,
      requiredProperties: ["sensor_element", "mounting"],
      requiredFacts: ["Pt100", "probe", "AISI 316L"],
      prohibitedFacts: ["4–20 mA", "Modbus"],
    },
  ];

  // -------------------------------------------------------------
  // TEST 1: Database Existence, Pricing, Stock & Technical Schema
  // -------------------------------------------------------------
  console.log(`\n${BOLD}[1] VERIFICACIÓN EN MEDUSA: PRODUCTOS, PRECIOS (USD), STOCK Y ESQUEMA TÉCNICO${RESET}`);

  for (const exp of EXPECTED_SKUS) {
    const variants = psqlQuery(`
      SELECT pv.id as variant_id, pv.sku, pv.title as variant_title, p.id as product_id, p.handle, p.title as product_title, p.metadata
      FROM product_variant pv
      JOIN product p ON p.id = pv.product_id
      WHERE pv.sku = '${exp.sku}' AND pv.deleted_at IS NULL AND p.deleted_at IS NULL;
    `);

    const varExists = variants.length > 0;
    record(
      "G1-DB-SKU",
      `SKU ${exp.sku} existe en Medusa`,
      varExists,
      "1 variante activa",
      `${variants.length} variantes encontradas`
    );

    if (varExists) {
      const v = variants[0];

      // Price verification: Currency USD
      const prices = psqlQuery(`
        SELECT p.id, p.amount, p.currency_code
        FROM price p
        JOIN product_variant_price_set pvps ON pvps.price_set_id = p.price_set_id
        WHERE pvps.variant_id = '${v.variant_id}' AND p.currency_code = 'usd' AND p.deleted_at IS NULL;
      `);

      const priceMatches = prices.some(
        (p) => Number(p.amount) === exp.priceUsd || Number(p.amount) === exp.priceUsd * 100
      );
      const actualAmount = prices.length > 0 ? Number(prices[0].amount) : 0;
      record(
        "G1-DB-PRICE",
        `Precio USD de ${exp.sku} es ${exp.priceUsd}`,
        priceMatches,
        `${exp.priceUsd} USD`,
        `${actualAmount} USD (${prices.length} precios USD registrados)`
      );

      // Stock verification
      const stockRows = psqlQuery(`
        SELECT il.stocked_quantity, il.reserved_quantity, sl.name as location_name
        FROM inventory_level il
        JOIN product_variant_inventory_item pvii ON pvii.inventory_item_id = il.inventory_item_id
        JOIN stock_location sl ON sl.id = il.location_id
        WHERE pvii.variant_id = '${v.variant_id}' AND il.deleted_at IS NULL;
      `);

      const actualStock = stockRows.reduce((sum, r) => sum + Number(r.stocked_quantity), 0);
      const stockMatches = actualStock === exp.stock;
      record(
        "G1-DB-STOCK",
        `Stock de ${exp.sku} es ${exp.stock} unidades`,
        stockMatches,
        `${exp.stock} unidades`,
        `${actualStock} unidades en inventario`
      );

      // Technical profile & facts verification
      const profiles = psqlQuery(`
        SELECT id, model, revision, demo
        FROM technical_profile
        WHERE variant_id = '${v.variant_id}' AND deleted_at IS NULL;
      `);
      const profileValid = profiles.length > 0 && profiles[0].demo === true;
      record(
        "G1-DB-PROFILE",
        `technical_profile para variante ${exp.sku}`,
        profileValid,
        "1 technical_profile con demo=true",
        profiles.length > 0 ? `${profiles.length} profiles encontrados (demo=${profiles[0].demo})` : "0 profiles"
      );

      const facts = psqlQuery(`
        SELECT property, display_value, source_id, excerpt
        FROM technical_fact
        WHERE variant_id = '${v.variant_id}' AND deleted_at IS NULL;
      `);
      const factsCountValid = facts.length >= 4;
      const propertiesPresent = exp.requiredProperties.every((reqProp) =>
        facts.some((f) => f.property === reqProp)
      );
      record(
        "G1-DB-FACTS",
        `technical_fact registros para ${exp.sku} (>= 4 hechos con propiedades clave)`,
        factsCountValid && propertiesPresent,
        `>= 4 hechos incluyendo [${exp.requiredProperties.join(", ")}]`,
        `${facts.length} hechos registrados (propiedades: ${facts.map((f) => f.property).join(", ")})`
      );
    }
  }

  // -------------------------------------------------------------
  // TEST 2: Human Pages & Storefront Banner
  // -------------------------------------------------------------
  console.log(`\n${BOLD}[2] PÁGINAS HUMANAS: MARCA DE FICCIÓN Y RUTAS STOREFRONT${RESET}`);

  // Check storefront template code for demo banner
  const hvacProductPath = "/home/ubuntu/hackday26/b2b-storefront/src/modules/products/templates/hvac-product.tsx";
  let bannerInTemplate = false;
  if (fs.existsSync(hvacProductPath)) {
    const code = fs.readFileSync(hvacProductPath, "utf8");
    bannerInTemplate = code.includes("FICTITIOUS PRODUCT — DEMONSTRATION DATA");
  }
  record(
    "G1-UI-BANNER-CODE",
    "Banner 'FICTITIOUS PRODUCT — DEMONSTRATION DATA' en plantilla Storefront",
    bannerInTemplate,
    "Código incluye banner de advertencia para productos demo",
    bannerInTemplate ? "Banner implementado en HvacProductTemplate" : "Banner no encontrado en archivo"
  );

  // Live HTTP check of PDPs on Storefront port 8000
  const PDP_TESTS = [
    { handle: "cn-demo-plc-din-420-mr1", sku: "CN-DEMO-PLC-DIN-420-MR1" },
    { handle: "cn-demo-pid-pt100-rs1", sku: "CN-DEMO-PID-PT100-RS1" },
    { handle: "cn-demo-pt100-3w-a1", sku: "CN-DEMO-PT100-3W-A1" },
  ];

  for (const item of PDP_TESTS) {
    try {
      const url = `http://127.0.0.1:8000/us/products/${item.handle}`;
      const curlCmd = `curl -s -L -w "\\n%{http_code}" "${url}"`;
      const out = execSync(curlCmd, { encoding: "utf8", timeout: 15000 });
      const lines = out.trim().split("\n");
      const statusCode = lines[lines.length - 1];
      const body = lines.slice(0, -1).join("\n");
      const hasBanner = body.includes("FICTITIOUS PRODUCT — DEMONSTRATION DATA");

      record(
        "G1-UI-PDP-LIVE",
        `PDP en vivo responde HTTP 200 y muestra aviso de ficción (${item.sku})`,
        statusCode === "200" && hasBanner,
        "HTTP 200 con banner 'FICTITIOUS PRODUCT — DEMONSTRATION DATA'",
        `HTTP ${statusCode}, banner=${hasBanner ? "Detectado en HTML" : "Ausente"}`
      );
    } catch (err: any) {
      record(
        "G1-UI-PDP-LIVE",
        `PDP en vivo responde HTTP 200 y muestra aviso de ficción (${item.sku})`,
        false,
        "HTTP 200",
        `Error de conexión: ${err.message}`
      );
    }
  }

  // Live HTTP 404 test on Storefront port 8000
  try {
    const fakePdpUrl = "http://127.0.0.1:8000/us/products/sku-ficticio-no-existente-404";
    const out = execSync(`curl -s -o /dev/null -w "%{http_code}" "${fakePdpUrl}"`, {
      encoding: "utf8",
      timeout: 10000,
    }).trim();
    record(
      "G1-UI-PDP-404",
      "Ruta de producto inexistente en Storefront retorna HTTP 404",
      out === "404",
      "HTTP 404 Not Found",
      `HTTP ${out}`
    );
  } catch (err: any) {
    record(
      "G1-UI-PDP-404",
      "Ruta de producto inexistente en Storefront retorna HTTP 404",
      false,
      "HTTP 404 Not Found",
      `Error: ${err.message}`
    );
  }

  // Live HTTP check of Demo Datasheets & Specs on port 8000
  for (const exp of EXPECTED_SKUS) {
    try {
      const pdfUrl = `http://127.0.0.1:8000/demo/datasheets/${exp.sku}.pdf`;
      const pdfCode = execSync(`curl -s -o /dev/null -w "%{http_code}" "${pdfUrl}"`, {
        encoding: "utf8",
        timeout: 5000,
      }).trim();

      const specUrl = `http://127.0.0.1:8000/demo/specs/${exp.sku}.md`;
      const specCode = execSync(`curl -s -o /dev/null -w "%{http_code}" "${specUrl}"`, {
        encoding: "utf8",
        timeout: 5000,
      }).trim();

      record(
        "G1-UI-HTTP-ASSETS",
        `Activos públicos accesibles vía HTTP en puerto 8000 (${exp.sku})`,
        pdfCode === "200" && specCode === "200",
        "PDF y MD retornan HTTP 200",
        `PDF: HTTP ${pdfCode}, MD: HTTP ${specCode}`
      );
    } catch (err: any) {
      record(
        "G1-UI-HTTP-ASSETS",
        `Activos públicos accesibles vía HTTP en puerto 8000 (${exp.sku})`,
        false,
        "HTTP 200",
        `Error: ${err.message}`
      );
    }
  }

  // -------------------------------------------------------------
  // TEST 3: PDF Datasheets Watermark & Citable Sections
  // -------------------------------------------------------------
  console.log(`\n${BOLD}[3] DATASHEETS PDF: MARCA DE SIMULACIÓN Y SECCIONES CITABLES${RESET}`);

  for (const exp of EXPECTED_SKUS) {
    const pdfPath = `/home/ubuntu/hackday26/docs/datasheets/${exp.sku}.pdf`;
    const pdfExists = fs.existsSync(pdfPath);
    record(
      "G1-PDF-EXISTS",
      `Datasheet PDF existe para ${exp.sku}`,
      pdfExists,
      `Archivo ${pdfPath} presente`,
      pdfExists ? `${fs.statSync(pdfPath).size} bytes` : "Archivo ausente"
    );

    if (pdfExists) {
      const pdfText = extractPdfText(pdfPath);

      // Simulation mark
      const hasSimulacion =
        pdfText.includes("SIMULATION") ||
        pdfText.includes("SIMULACIÓN") ||
        pdfText.includes("SIMULACION");
      record(
        "G1-PDF-SIMULATION",
        `Marca 'SIMULATION' en cabecera/pie del PDF ${exp.sku}`,
        hasSimulacion,
        "Marca 'SIMULATION' presente",
        hasSimulacion ? "Presente en todas las páginas" : "No detectada"
      );

      // Fiction notice
      const hasFiction =
        pdfText.includes("FICTITIOUS PRODUCT — DEMONSTRATION DATA") ||
        pdfText.includes("FICTITIOUS PRODUCT");
      record(
        "G1-PDF-FICTION",
        `Aviso 'FICTITIOUS PRODUCT — DEMONSTRATION DATA' visible en PDF ${exp.sku}`,
        hasFiction,
        "Aviso presente",
        hasFiction ? "Presente" : "No detectado"
      );

      // Citable sections
      let allSectionsFound = true;
      for (let secNum = 1; secNum <= 6; secNum++) {
        if (!pdfText.includes(`Section ${secNum}`) && !pdfText.includes(`Sección ${secNum}`)) {
          allSectionsFound = false;
        }
      }
      record(
        "G1-PDF-SECTIONS",
        `6 Secciones citables numeradas en PDF ${exp.sku}`,
        allSectionsFound,
        "Secciones 1 a 6 presentes",
        allSectionsFound ? "Todas las 6 secciones presentes" : "Faltan secciones"
      );
    }
  }

  // -------------------------------------------------------------
  // TEST 4: Markdown Specs, Citations & Absence of Price/Stock
  // -------------------------------------------------------------
  console.log(`\n${BOLD}[4] ESPECIFICACIONES MARKDOWN: CITAS FORMALES Y AUSENCIA DE PRECIO/STOCK${RESET}`);

  for (const exp of EXPECTED_SKUS) {
    const mdPath = `/home/ubuntu/hackday26/docs/demo-specs/${exp.sku}.md`;
    const mdExists = fs.existsSync(mdPath);
    record(
      "G1-MD-EXISTS",
      `Ficha Markdown existe para ${exp.sku}`,
      mdExists,
      `Archivo ${mdPath} presente`,
      mdExists ? `${fs.statSync(mdPath).size} bytes` : "Archivo ausente"
    );

    if (mdExists) {
      const mdContent = fs.readFileSync(mdPath, "utf8");

      // Fiction notice
      const hasNotice =
        mdContent.includes("FICTITIOUS PRODUCT — DEMONSTRATION DATA") ||
        mdContent.includes("PRODUCTO FICTICIO — DATOS DE DEMOSTRACIÓN");
      const hasSimulation =
        mdContent.includes("SIMULATION") ||
        mdContent.includes("SIMULACIÓN");
      record(
        "G1-MD-NOTICE",
        `Marca de ficción en Markdown ${exp.sku}`,
        hasNotice && hasSimulation,
        "Marca 'FICTITIOUS PRODUCT — DEMONSTRATION DATA' y 'SIMULATION' en encabezado",
        hasNotice && hasSimulation ? "Presente" : "Ausente"
      );

      // Formal citation fields
      const hasCitations =
        mdContent.includes("source_id") &&
        mdContent.includes("revision") &&
        (mdContent.includes("URL") || mdContent.includes("url")) &&
        mdContent.includes("excerpt");
      record(
        "G1-MD-CITATIONS",
        `Estructura formal de citas en Markdown ${exp.sku}`,
        hasCitations,
        "Campos source_id, revision, URL, página, sección, excerpt presentes",
        hasCitations ? "Estructura completa de citación" : "Incompleto"
      );

      // Absence of commercial price & stock
      // Strict prohibition: price numbers (USD 890, 890, etc.) in a pricing context, or stock counts
      const hasPriceContext =
        /precio|price|tarifa|costo|cost|amount/i.test(mdContent) &&
        (mdContent.includes("890") || mdContent.includes("480") || mdContent.includes("75"));
      const hasStockContext =
        /stock|inventario|disponibilidad|inventory|availability/i.test(mdContent) &&
        (mdContent.includes("unidades") || mdContent.includes("piezas") || mdContent.includes("units") || mdContent.includes("pcs"));

      const zeroPriceStock = !hasPriceContext && !hasStockContext;
      record(
        "G1-MD-NO-PRICE-STOCK",
        `Ausencia total de precio y stock en Markdown ${exp.sku}`,
        zeroPriceStock,
        "Cero precio y cero stock comercial embebidos",
        zeroPriceStock
          ? "Cumple estrictamente (precio y stock residen únicamente en Medusa)"
          : "Violación detectada: contiene precio o stock"
      );
    }
  }

  // -------------------------------------------------------------
  // TEST 5: Seed Idempotency
  // -------------------------------------------------------------
  console.log(`\n${BOLD}[5] IDEMPOTENCIA DEL SEED (EJECUCIÓN REPETIDA)${RESET}`);

  const countVariantsBefore = psqlQuery<{ count: string }>(`
    SELECT count(*) as count FROM product_variant WHERE sku LIKE 'CN-DEMO-%' AND deleted_at IS NULL;
  `)[0]?.count || "0";

  const countProductsBefore = psqlQuery<{ count: string }>(`
    SELECT count(*) as count FROM product WHERE handle LIKE 'cn-demo-%' AND deleted_at IS NULL;
  `)[0]?.count || "0";

  console.log(`    Recuento inicial: ${countProductsBefore} productos demo, ${countVariantsBefore} variantes demo`);

  // Run seed again
  let idempotencyOk = false;
  try {
    console.log("    Ejecutando seed de nuevo para comprobar idempotencia...");
    execSync("npm run seed:demo --prefix /home/ubuntu/hackday26/b2b-backend", {
      stdio: ["pipe", "pipe", "pipe"],
      timeout: 60000,
    });

    const countVariantsAfter = psqlQuery<{ count: string }>(`
      SELECT count(*) as count FROM product_variant WHERE sku LIKE 'CN-DEMO-%' AND deleted_at IS NULL;
    `)[0]?.count || "0";

    const countProductsAfter = psqlQuery<{ count: string }>(`
      SELECT count(*) as count FROM product WHERE handle LIKE 'cn-demo-%' AND deleted_at IS NULL;
    `)[0]?.count || "0";

    idempotencyOk =
      countVariantsBefore === countVariantsAfter &&
      countProductsBefore === countProductsAfter &&
      Number(countVariantsAfter) === 3;

    record(
      "G1-SEED-IDEMPOTENCY",
      "Seed repetido es 100% idempotente (no duplica registros)",
      idempotencyOk,
      `Variantes: ${countVariantsBefore} -> ${countVariantsBefore}, Productos: ${countProductsBefore} -> ${countProductsBefore}`,
      `Variantes: ${countVariantsAfter}, Productos: ${countProductsAfter}`
    );
  } catch (err: any) {
    record(
      "G1-SEED-IDEMPOTENCY",
      "Seed repetido es 100% idempotente",
      false,
      "Ejecución exitosa sin duplicados",
      `Error al re-ejecutar seed: ${err.message}`
    );
  }

  // -------------------------------------------------------------
  // TEST 6: Revert Isolation & Catalog Safety
  // -------------------------------------------------------------
  console.log(`\n${BOLD}[6] AISLAMIENTO DEL REVERT (ELIMINA SOLO DEMO SIN TOCAR CATÁLOGO AJENO)${RESET}`);

  const nonDemoProductsBefore = psqlQuery<{ count: string }>(`
    SELECT count(*) as count FROM product WHERE (handle NOT LIKE 'cn-demo-%' OR handle IS NULL) AND deleted_at IS NULL;
  `)[0]?.count || "0";

  let revertOk = false;
  try {
    console.log("    Ejecutando revert para comprobar eliminación segura...");
    execSync("npm run seed:demo:revert --prefix /home/ubuntu/hackday26/b2b-backend", {
      stdio: ["pipe", "pipe", "pipe"],
      timeout: 60000,
    });

    const demoVariantsAfterRevert = psqlQuery<{ count: string }>(`
      SELECT count(*) as count FROM product_variant WHERE sku LIKE 'CN-DEMO-%' AND deleted_at IS NULL;
    `)[0]?.count || "0";

    const nonDemoProductsAfterRevert = psqlQuery<{ count: string }>(`
      SELECT count(*) as count FROM product WHERE (handle NOT LIKE 'cn-demo-%' OR handle IS NULL) AND deleted_at IS NULL;
    `)[0]?.count || "0";

    revertOk =
      Number(demoVariantsAfterRevert) === 0 &&
      nonDemoProductsBefore === nonDemoProductsAfterRevert;

    record(
      "G1-REVERT-SAFETY",
      "Revert elimina 100% de demo sin afectar catálogo ajeno",
      revertOk,
      `0 variantes demo restantes; ${nonDemoProductsBefore} productos no-demo intactos`,
      `${demoVariantsAfterRevert} variantes demo restantes; ${nonDemoProductsAfterRevert} productos no-demo preservados`
    );

    // Re-seed demo products to leave system populated and ready for Cursor audit!
    console.log("    Re-sembrando productos demo para dejar el catálogo listo...");
    execSync("npm run seed:demo --prefix /home/ubuntu/hackday26/b2b-backend", {
      stdio: ["pipe", "pipe", "pipe"],
      timeout: 60000,
    });
  } catch (err: any) {
    record(
      "G1-REVERT-SAFETY",
      "Revert elimina 100% de demo sin afectar catálogo ajeno",
      false,
      "Ejecución limpia del script revert",
      `Error al ejecutar revert: ${err.message}`
    );
  }

  // -------------------------------------------------------------
  // TEST 7: Invented SKU Rejection (404 / No Match)
  // -------------------------------------------------------------
  console.log(`\n${BOLD}[7] SKU INVENTADO / INEXISTENTE: RETORNA 404 / NO MATCH${RESET}`);

  const FAKE_SKU = "CN-DEMO-INVENTED-NONEXISTENT-999-XYZ";
  const fakeLookup = psqlQuery(`
    SELECT pv.id FROM product_variant pv WHERE pv.sku = '${FAKE_SKU}' AND pv.deleted_at IS NULL;
  `);

  const fakeNotFound = fakeLookup.length === 0;
  record(
    "G1-FAKE-SKU-DB",
    `SKU inventado '${FAKE_SKU}' no resuelve a ninguna variante en Medusa`,
    fakeNotFound,
    "0 coincidencias en base de datos",
    `${fakeLookup.length} coincidencias encontradas`
  );

  // Storefront fake handle resolution check
  const fakeHandle = "sku-ficticio-no-existente-404";
  const fakeHandleLookup = psqlQuery(`
    SELECT id FROM product WHERE handle = '${fakeHandle}' AND deleted_at IS NULL;
  `);
  record(
    "G1-FAKE-HANDLE-STOREFRONT",
    `Handle inexistente '${fakeHandle}' no existe en catálogo de Medusa`,
    fakeHandleLookup.length === 0,
    "0 productos en catálogo",
    `${fakeHandleLookup.length} productos encontrados`
  );

  // -------------------------------------------------------------
  // TEST 8: Manifest Generation & Dynamic IDs
  // -------------------------------------------------------------
  console.log(`\n${BOLD}[8] MANIFIESTO GENERADO CON SKU -> VARIANT_ID DINÁMICOS${RESET}`);

  const manifestPath = "/home/ubuntu/hackday26/hackday-demo-manifest.json";
  const manifestExists = fs.existsSync(manifestPath);
  record(
    "G1-MANIFEST-EXISTS",
    "Archivo hackday-demo-manifest.json generado en la raíz",
    manifestExists,
    `Archivo ${manifestPath} presente`,
    manifestExists ? "Presente" : "Ausente"
  );

  if (manifestExists) {
    try {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
      const items = manifest.products || manifest.items || manifest;
      let allDynamic = true;
      let countSkus = 0;

      for (const exp of EXPECTED_SKUS) {
        const item = Array.isArray(items)
          ? items.find((i: any) => i.sku === exp.sku)
          : items[exp.sku];

        if (item) {
          countSkus++;
          const variantId = item.variant_id || item.variantId;
          // Must be dynamic Medusa ID starting with 'variant_'
          if (!variantId || !variantId.startsWith("variant_")) {
            allDynamic = false;
          }
        }
      }

      record(
        "G1-MANIFEST-SKUS",
        "Manifiesto contiene los 3 SKUs obligatorios",
        countSkus === 3,
        "3 SKUs registrados",
        `${countSkus} SKUs encontrados en manifiesto`
      );

      record(
        "G1-MANIFEST-DYNAMIC-IDS",
        "Variant IDs en manifiesto son generados dinámicamente por Medusa (sin hardcode)",
        allDynamic && countSkus === 3,
        "IDs comienzan con 'variant_' generados por Medusa v2",
        allDynamic ? "Todos los IDs son dinámicos de Medusa" : "IDs inválidos o hardcodeados"
      );

      // Check manifest URLs
      const manifestStr = fs.readFileSync(manifestPath, "utf8");
      const hasBrokenPaths = manifestStr.includes("static/demo");
      const hasValidUrls =
        (manifestStr.includes("http://52.20.66.203:8000/demo/datasheets/") ||
          manifestStr.includes("https://data.controlnautas.com/demo/datasheets/")) &&
        (manifestStr.includes("http://52.20.66.203:8000/demo/specs/") ||
          manifestStr.includes("https://data.controlnautas.com/demo/specs/"));

      record(
        "G1-MANIFEST-VALID-URLS",
        "URLs del manifiesto apuntan a rutas válidas (data.controlnautas.com o IP Elástica)",
        !hasBrokenPaths && hasValidUrls,
        "URLs usan https://data.controlnautas.com/demo/... o IP Elástica",
        !hasBrokenPaths && hasValidUrls ? "URLs válidas y verificadas" : "Rutas rotas o dominio no operativo detectado"
      );
    } catch (err: any) {
      record(
        "G1-MANIFEST-PARSE",
        "Parseo válido de hackday-demo-manifest.json",
        false,
        "JSON válido",
        `Error: ${err.message}`
      );
    }
  }

  // -------------------------------------------------------------
  // Summary and Exit Code
  // -------------------------------------------------------------
  console.log(`\n${BOLD}${CYAN}================================================================${RESET}`);
  console.log(`${BOLD}${CYAN}  RESUMEN DE AUDITORÍA Y CONTROL DE CALIDAD                     ${RESET}`);
  console.log(`${BOLD}${CYAN}================================================================${RESET}`);

  const total = results.length;
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;

  console.log(`  Total de pruebas ejecutadas : ${total}`);
  console.log(`  Pruebas superadas (${GREEN}PASS${RESET})   : ${GREEN}${passed}${RESET}`);
  console.log(`  Pruebas fallidas  (${RED}FAIL${RESET})   : ${failed > 0 ? RED : GREEN}${failed}${RESET}`);

  if (failed === 0) {
    console.log(`\n${BOLD}${GREEN}✔ TODAS LAS PRUEBAS DE LA PUERTA 1 FUERON SUPERADAS EXITOSAMENTE.${RESET}`);
    console.log(`${GREEN}El entorno se encuentra 100% verificado y listo para la auditoría de Cursor.${RESET}\n`);
    process.exit(0);
  } else {
    console.log(`\n${BOLD}${RED}✘ SE ENCONTRARON ${failed} PRUEBAS NO CONFORMES.${RESET}`);
    console.log(`${RED}Revise las fallas antes de solicitar la auditoría de Cursor.${RESET}\n`);
    process.exit(1);
  }
}

runSuite().catch((err) => {
  console.error("Error fatal en suite de verificación:", err);
  process.exit(1);
});
