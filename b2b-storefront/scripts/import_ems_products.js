const fs = require('fs');
const path = require('path');

const PRODUCTS_PATH = path.join(__dirname, '../src/lib/cn-catalog/data/products.json');
const TAXONOMY_PATH = path.join(__dirname, '../src/lib/cn-catalog/taxonomy.ts');
const SCHEMA_PATH = path.join(__dirname, '../src/lib/cn-catalog/data/leaf-spec-schema.json');

// Read existing files
let products = JSON.parse(fs.readFileSync(PRODUCTS_PATH, 'utf8'));

// Filter out any existing EMS products (handle starting with 'ems-') to prevent duplicate imports
const nonEmsProducts = products.filter(p => !p.handle.startsWith('ems-'));
console.log(`Non-EMS product count: ${nonEmsProducts.length}`);

let maxWcId = nonEmsProducts.reduce((max, p) => Math.max(max, p.wcId || 0), 12000);
let emsCounter = 1;

function getNextId() {
  maxWcId += 1;
  const numStr = String(emsCounter++).padStart(3, '0');
  return { wcId: maxWcId, itemNumber: `CN-EMS-${numStr}` };
}

// EMS products list to add
const emsProducts = [
  // -------------------------------------------------------------
  // 1. Sensores de Temperatura (temperatura-termopar-rtd) - 4 prods
  // -------------------------------------------------------------
  {
    handle: "ems-ts-1xx-temperature-sensor",
    title: "EMS TS-1XX Sensor Pasivo de Temperatura para Interiores y Gabinetes (NTC 10K / NTC 30K / Pt100 / Pt1000)",
    mfrModel: "TS-1XX",
    categoryPath: ["sensores-transmisores", "temperatura-termopar-rtd"],
    categorySlug: "temperatura-termopar-rtd",
    images: ["/cn-media/products/ems/ts-1xx.svg"],
    specs: {
      "Tipo de Elemento": "Sonda Pasiva (NTC 10K / NTC 30K / Pt100 / Pt1000)",
      "Rango de Temperatura": "-30 °C a 70 °C",
      "Vaina / Material": "Plástico ABS Ignífugo UL94-V0",
      "Conexión a Proceso": "Montaje en Pared / Gabinete (Superficie)",
      "Salida / Cabeza": "Terminal a Tornillo (2 Hilos / 3 Hilos)"
    },
    technicalDescription: "SENSOR DE TEMPERATURA PASIVO AMBIENTAL EMS TS-1XX: Diseñado para monitoreo térmico en recintos cerrados, salas limpias y gabinetes de control.",
    shortDescription: "Sensor pasivo de temperatura ambiente de alta precisión EMS TS-1XX. Compatible con elementos NTC10K, NTC30K, Pt100 y Pt1000."
  },
  {
    handle: "ems-ts-3xx-temperature-sensor",
    title: "EMS TS-3XX Sensor de Temperatura IP67 para Intemperie y Entornos Industriales Exigentes",
    mfrModel: "TS-3XX",
    categoryPath: ["sensores-transmisores", "temperatura-termopar-rtd"],
    categorySlug: "temperatura-termopar-rtd",
    images: ["/cn-media/products/ems/ts-3xx.svg"],
    specs: {
      "Tipo de Elemento": "RTD Pt100 / Pt1000 / NTC 10K (Clase A)",
      "Rango de Temperatura": "-50 °C a 120 °C",
      "Vaina / Material": "Carcasa Policarbonato Protección IP67",
      "Conexión a Proceso": "Montaje en Pared Exterior / Ducto",
      "Salida / Cabeza": "Cabezal de Conexión IP67 con Prensacable"
    },
    technicalDescription: "SENSOR DE TEMPERATURA REFORZADO IP67 EMS TS-3XX: Construido para resistir humedad extrema, polvo e intemperie en plantas industriales.",
    shortDescription: "Sensor térmico industrial IP67 EMS TS-3XX con carcasa hermética de policarbonato para instalación exterior o en ambientes agresivos."
  },
  {
    handle: "ems-ts-412-413-portable-temperature-sensor",
    title: "EMS TS-412 / TS-413 Sensor de Temperatura Portátil de Mano con Sonda de Inserción",
    mfrModel: "TS-412 / TS-413",
    categoryPath: ["sensores-transmisores", "temperatura-termopar-rtd"],
    categorySlug: "temperatura-termopar-rtd",
    images: ["/cn-media/products/ems/ts-412.svg"],
    specs: {
      "Tipo de Elemento": "Sonda de Inserción Acero Inoxidable AISI 316L",
      "Rango de Temperatura": "-40 °C a 200 °C",
      "Vaina / Material": "Acero Inoxidable Ø 4 mm x 150 mm",
      "Conexión a Proceso": "Portátil / Sonda de Mano Flex Cable",
      "Salida / Cabeza": "Conector Rápido / Empuñadura Ergonómica"
    },
    technicalDescription: "SENSOR PORTÁTIL DE TEMPERATURA EMS TS-412/413: Ideal para inspecciones de calidad, control en procesos alimentarios, ductos de aire y mantenimiento preventivo.",
    shortDescription: "Sensor portátil de temperatura con sonda de penetración en acero inoxidable. Diseñado para verificaciones rápidas de campo."
  },
  {
    handle: "ems-tt-391-wireless-temperature-sensor",
    title: "EMS TT-391 Sensor de Temperatura Inalámbrico 433 MHz RF con Autonomía de Batería",
    mfrModel: "TT-391",
    categoryPath: ["sensores-transmisores", "temperatura-termopar-rtd"],
    categorySlug: "temperatura-termopar-rtd",
    images: ["/cn-media/products/ems/tt-391.svg"],
    specs: {
      "Tipo de Elemento": "Sensor Digital de Temperatura Integrado (433 MHz RF)",
      "Rango de Temperatura": "-30 °C a 70 °C",
      "Vaina / Material": "ABS de Alto Impacto IP65",
      "Conexión a Proceso": "Inalámbrica RF (Hasta 1.5 km Alcance Libre)",
      "Salida / Cabeza": "Transmisión RF 433 MHz a Master MT-010/MT-016"
    },
    technicalDescription: "SENSOR TÉRMICO INALÁMBRICO EMS TT-391: Transmisión de largo alcance en banda 433 MHz para evitar canalizaciones y cableado costoso.",
    shortDescription: "Sensor inalámbrico de temperatura 433 MHz RF EMS TT-391. Conexión rápida con receptores máster EMS sin necesidad de cables."
  },

  // -------------------------------------------------------------
  // 2. Transmisores de Temperatura (transmisores-temperatura) - 2 prods
  // -------------------------------------------------------------
  {
    handle: "ems-tt-3xx-temperature-transmitter",
    title: "EMS TT-3XX Transmisor de Temperatura Analógico y Modbus RTU de Pared",
    mfrModel: "TT-3XX",
    categoryPath: ["sensores-transmisores", "transmisores-temperatura"],
    categorySlug: "transmisores-temperatura",
    images: ["/cn-media/products/ems/tt-3xx.svg"],
    specs: {
      "Tipo de Montaje": "Superficie / Pared AMB / Ducto",
      "Entrada de Sensor": "Sensor Digital Interno / NTC / Pt1000",
      "Salida / Protocolo": "0-10V / 4-20mA / Modbus RTU RS485",
      "Alimentación": "24 VAC/VDC (15-30 VDC)",
      "Aislamiento / Precisión": "±0.3 °C / Protección contra Inversión de Polaridad"
    },
    technicalDescription: "TRANSMISOR DE TEMPERATURA SERIE EMS TT-3XX: Convierte lecturas térmicas en señales estándar de control industrial para BMS y PLC.",
    shortDescription: "Transmisor industrial de temperatura ambiente EMS TT-3XX con salidas configurables 0-10V, 4-20mA o comunicación RS485 Modbus RTU."
  },
  {
    handle: "ems-tt-4xx-temperature-transmitter-display",
    title: "EMS TT-4XX Transmisor de Temperatura de Pared con Pantalla LCD Retroiluminada",
    mfrModel: "TT-4XX",
    categoryPath: ["sensores-transmisores", "transmisores-temperatura"],
    categorySlug: "transmisores-temperatura",
    images: ["/cn-media/products/ems/tt-4xx.svg"],
    specs: {
      "Tipo de Montaje": "Pared Interior / Sala Limpia con Display",
      "Entrada de Sensor": "Elemento de Calibración de Alta Precisión",
      "Salida / Protocolo": "0-10V / 4-20mA / RS485 Modbus RTU",
      "Alimentación": "24 VAC/VDC",
      "Aislamiento / Precisión": "±0.2 °C / Display Gráfico LCD 2 líneas"
    },
    technicalDescription: "TRANSMISOR DE TEMPERATURA CON PANTALLA EMS TT-4XX: Visualización local instantánea en pantalla LCD y transmisión simultánea a sistemas de automatización.",
    shortDescription: "Transmisor de temperatura con display digital incorporado EMS TT-4XX para monitoreo directo en salas, laboratorios y oficinas."
  },

  // -------------------------------------------------------------
  // 3. Humedad y Temperatura (humedad-temperatura) - 9 prods
  // -------------------------------------------------------------
  {
    handle: "ems-st-3xx-temp-humidity-transmitter",
    title: "EMS ST-3XX Transmisor de Humedad Relativa y Temperatura de Pared (4-20mA / 0-10V / Modbus)",
    mfrModel: "ST-3XX",
    categoryPath: ["sensores-transmisores", "humedad-temperatura"],
    categorySlug: "humedad-temperatura",
    images: ["/cn-media/products/ems/st-3xx.svg"],
    specs: {
      "Tipo de Montaje": "Pared / Superficie",
      "Rango de Medición": "0 a 100% HR / -30 °C a 70 °C",
      "Salida / Protocolo": "0-10V / 4-20mA / Modbus RTU RS485",
      "Precisión": "±2% HR (20-80% HR) / ±0.3 °C",
      "Alimentación": "24 VAC/VDC"
    },
    technicalDescription: "TRANSMISOR DE HUMEDAD Y TEMPERATURA AMBIENTAL EMS ST-3XX: Tecnología de sensor capacitivo CMOSens de alta estabilidad a largo plazo.",
    shortDescription: "Transmisor dual de humedad y temperatura EMS ST-3XX para sistemas HVAC, automatización de edificios y control ambiental."
  },
  {
    handle: "ems-nt-3xx-humidity-transmitter",
    title: "EMS NT-3XX Transmisor de Humedad Relativa Solo HR para Control de Climatización",
    mfrModel: "NT-3XX",
    categoryPath: ["sensores-transmisores", "humedad-temperatura"],
    categorySlug: "humedad-temperatura",
    images: ["/cn-media/products/ems/nt-3xx.svg"],
    specs: {
      "Tipo de Montaje": "Pared / Superficie Interior",
      "Rango de Medición": "0 a 100% HR",
      "Salida / Protocolo": "0-10V / 4-20mA / Modbus RTU",
      "Precisión": "±2.5% HR",
      "Alimentación": "24 VAC/VDC"
    },
    technicalDescription: "TRANSMISOR DE HUMEDAD RELATIVA EMS NT-3XX: Solución dedicada para monitoreo y control preciso de humedad relativa en aire.",
    shortDescription: "Transmisor de humedad relativa de alta estabilidad EMS NT-3XX con salidas analógicas o digitales configurables."
  },
  {
    handle: "ems-st-4xx-temp-humidity-transmitter-display",
    title: "EMS ST-4XX Transmisor de Humedad y Temperatura con Pantalla LCD Retroiluminada",
    mfrModel: "ST-4XX",
    categoryPath: ["sensores-transmisores", "humedad-temperatura"],
    categorySlug: "humedad-temperatura",
    images: ["/cn-media/products/ems/st-4xx.svg"],
    specs: {
      "Tipo de Montaje": "Pared con Display LCD",
      "Rango de Medición": "0-100% HR / -30 °C a 70 °C",
      "Salida / Protocolo": "0-10V / 4-20mA / Modbus RTU RS485",
      "Precisión": "±2% HR / ±0.3 °C",
      "Alimentación": "24 VAC/VDC"
    },
    technicalDescription: "TRANSMISOR T+HR CON PANTALLA EMS ST-4XX: Combina lectura visual en tiempo real en pantalla LCD con integración completa a BMS.",
    shortDescription: "Transmisor dual T/HR con pantalla digital EMS ST-4XX. Ideal para laboratorios, farmacia y salas limpias."
  },
  {
    handle: "ems-st-2xx-duct-temp-humidity-transmitter",
    title: "EMS ST-2XX Transmisor de Humedad y Temperatura para Ductos de Ventilación HVAC",
    mfrModel: "ST-2XX",
    categoryPath: ["sensores-transmisores", "humedad-temperatura"],
    categorySlug: "humedad-temperatura",
    images: ["/cn-media/products/ems/st-2xx.svg"],
    specs: {
      "Tipo de Montaje": "Montaje en Ducto con Brida de Ajuste",
      "Rango de Medición": "0-100% HR / -40 °C a 80 °C",
      "Salida / Protocolo": "0-10V / 4-20mA / Modbus RTU RS485",
      "Precisión": "±2% HR / ±0.3 °C",
      "Alimentación": "24 VAC/VDC"
    },
    technicalDescription: "TRANSMISOR DE DUCTO T+HR EMS ST-2XX: Caña de penetración de 200 mm con filtro poroso para medición precisa en flujos de aire HVAC.",
    shortDescription: "Transmisor de ducto para humedad y temperatura EMS ST-2XX. Diseñado para unidades manejadoras de aire (UMA) y conductos."
  },
  {
    handle: "ems-nt-2xx-duct-humidity-transmitter",
    title: "EMS NT-2XX Transmisor de Humedad Relativa para Ducto de Aire HVAC",
    mfrModel: "NT-2XX",
    categoryPath: ["sensores-transmisores", "humedad-temperatura"],
    categorySlug: "humedad-temperatura",
    images: ["/cn-media/products/ems/nt-2xx.svg"],
    specs: {
      "Tipo de Montaje": "Montaje en Ducto HVAC",
      "Rango de Medición": "0-100% HR",
      "Salida / Protocolo": "0-10V / 4-20mA",
      "Precisión": "±2.5% HR",
      "Alimentación": "24 VAC/VDC"
    },
    technicalDescription: "TRANSMISOR DE HUMEDAD DE DUCTO EMS NT-2XX: Mide exclusivamente humedad en conductos de ventilación e industrias de secado.",
    shortDescription: "Transmisor de humedad para ducto de ventilación EMS NT-2XX con sonda de inmersión y filtro de protección."
  },
  {
    handle: "ems-dt-3xx-outdoor-temp-humidity-transmitter",
    title: "EMS DT-3XX Transmisor de Humedad y Temperatura Exterior IP65 con Protector de Radiación Solar",
    mfrModel: "DT-3XX",
    categoryPath: ["sensores-transmisores", "humedad-temperatura"],
    categorySlug: "humedad-temperatura",
    images: ["/cn-media/products/ems/dt-3xx.svg"],
    specs: {
      "Tipo de Montaje": "Exterior / Intemperie IP65 con Protector Solar",
      "Rango de Medición": "0-100% HR / -40 °C a 70 °C",
      "Salida / Protocolo": "0-10V / 4-20mA / Modbus RTU RS485",
      "Precisión": "±2% HR / ±0.3 °C",
      "Alimentación": "24 VAC/VDC"
    },
    technicalDescription: "TRANSMISOR AMBIENTAL DE EXTERIOR EMS DT-3XX: Equipado con escudo de radiación solar para prevenir distorsiones térmicas por sol directo.",
    shortDescription: "Transmisor exterior de temperatura y humedad IP65 EMS DT-3XX. Incluye protección contra radiación directa del sol y lluvia."
  },
  {
    handle: "ems-ss-412-portable-temp-humidity-sensor",
    title: "EMS SS-412 Sensor Portátil de Humedad y Temperatura de Mano con Registro Local",
    mfrModel: "SS-412",
    categoryPath: ["sensores-transmisores", "humedad-temperatura"],
    categorySlug: "humedad-temperatura",
    images: ["/cn-media/products/ems/ss-412.svg"],
    specs: {
      "Tipo de Montaje": "Portátil de Mano / Inspección",
      "Rango de Medición": "0-100% HR / -20 °C a 60 °C",
      "Salida / Protocolo": "Pantalla LCD + Puerto USB",
      "Precisión": "±2% HR / ±0.4 °C",
      "Alimentación": "Batería Recargable Li-Ion / AAA"
    },
    technicalDescription: "SENSOR PORTÁTIL DE HUMEDAD Y TEMPERATURA EMS SS-412: Herramienta de auditoría rápida para ingenieros de mantenimiento e higienistas.",
    shortDescription: "Instrumento portátil T+HR de mano EMS SS-412 con pantalla LCD para verificación instantánea en campo."
  },
  {
    handle: "ems-nt-391-wireless-humidity-sensor",
    title: "EMS NT-391 Sensor Inalámbrico de Humedad Relativa 433 MHz RF",
    mfrModel: "NT-391",
    categoryPath: ["sensores-transmisores", "humedad-temperatura"],
    categorySlug: "humedad-temperatura",
    images: ["/cn-media/products/ems/nt-391.svg"],
    specs: {
      "Tipo de Montaje": "Inalámbrico de Pared (433 MHz RF)",
      "Rango de Medición": "0-100% HR",
      "Salida / Protocolo": "RF 433 MHz Inalámbrico",
      "Precisión": "±2.5% HR",
      "Alimentación": "Batería de Litio de Larga Duración (3-5 Años)"
    },
    technicalDescription: "SENSOR INALÁMBRICO DE HUMEDAD EMS NT-391: Elimina la instalación de cables en almacenes, invernaderos y edificios históricos.",
    shortDescription: "Sensor inalámbrico de humedad relativa 433 MHz RF EMS NT-391. Alcance de hasta 1.5 km en campo abierto."
  },
  {
    handle: "ems-st-391-wireless-temp-humidity-sensor",
    title: "EMS ST-391 Sensor Inalámbrico Dual de Humedad y Temperatura 433 MHz RF",
    mfrModel: "ST-391",
    categoryPath: ["sensores-transmisores", "humedad-temperatura"],
    categorySlug: "humedad-temperatura",
    images: ["/cn-media/products/ems/st-391.svg"],
    specs: {
      "Tipo de Montaje": "Inalámbrico de Pared (433 MHz RF)",
      "Rango de Medición": "0-100% HR / -30 °C a 70 °C",
      "Salida / Protocolo": "RF 433 MHz Inalámbrico",
      "Precisión": "±2% HR / ±0.3 °C",
      "Alimentación": "Batería de Litio de Larga Autonomía"
    },
    technicalDescription: "SENSOR INALÁMBRICO DUAL T+HR EMS ST-391: Envía lecturas de temperatura y humedad a controladores master sin necesidad de cableado.",
    shortDescription: "Sensor dual T/HR inalámbrico RF 433 MHz EMS ST-391 con largo alcance y batería de ultra baja potencia."
  },

  // -------------------------------------------------------------
  // 4. Gases Industriales y CO₂ (gases-co2) - 25 prods
  // -------------------------------------------------------------
  // CO2 Fijo
  {
    handle: "ems-kt-3x1-co2-transmitter",
    title: "EMS KT-3X1 Transmisor de Dióxido de Carbono (CO₂) NDIR de Pared (0-5000 ppm / 0-10000 ppm)",
    mfrModel: "KT-3X1",
    categoryPath: ["sensores-transmisores", "gases-co2"],
    categorySlug: "gases-co2",
    images: ["/cn-media/products/ems/kt-3x1.svg"],
    specs: {
      "Gas Detectado": "Dióxido de Carbono (CO₂)",
      "Rango de Medición": "0 a 5.000 ppm / 0 a 10.000 ppm (Configurable)",
      "Sensor / Tecnología": "Infrarrojo No Dispersivo (NDIR Auto-Calibrado)",
      "Salida / Protocolo": "0-10V / 4-20mA / Modbus RTU RS485",
      "Alimentación": "24 VAC/VDC"
    },
    technicalDescription: "TRANSMISOR DE CO₂ AMBIENTAL EMS KT-3X1: Sensor NDIR de alta exactitud para control de Calidad de Aire Interior (IAV) y ventilación a demanda.",
    shortDescription: "Transmisor NDIR de CO₂ EMS KT-3X1 para auditoría ambiental, oficinas, aulas y auditorios."
  },
  {
    handle: "ems-kt-3x9-co2-transmitter-high-range",
    title: "EMS KT-3X9 Transmisor de CO₂ NDIR Rango Industrial (Hasta 50,000 ppm / 5% CO₂)",
    mfrModel: "KT-3X9",
    categoryPath: ["sensores-transmisores", "gases-co2"],
    categorySlug: "gases-co2",
    images: ["/cn-media/products/ems/kt-3x9.svg"],
    specs: {
      "Gas Detectado": "Dióxido de Carbono (CO₂ High-Range)",
      "Rango de Medición": "0 a 50.000 ppm (0 a 5% Vol. CO₂)",
      "Sensor / Tecnología": "Dual Beam NDIR Industrial Sensor",
      "Salida / Protocolo": "0-10V / 4-20mA / Modbus RTU",
      "Alimentación": "24 VAC/VDC"
    },
    technicalDescription: "TRANSMISOR DE CO₂ RANGO ALTO EMS KT-3X9: Especialmente diseñado para incubadoras, bodegas de fermentación e industrias alimentarias.",
    shortDescription: "Transmisor NDIR de CO₂ rango elevado EMS KT-3X9 para procesos industriales y salas de fermentación."
  },
  {
    handle: "ems-kt-4x1-co2-transmitter-display",
    title: "EMS KT-4X1 Transmisor de CO₂ NDIR con Pantalla LCD Retroiluminada",
    mfrModel: "KT-4X1",
    categoryPath: ["sensores-transmisores", "gases-co2"],
    categorySlug: "gases-co2",
    images: ["/cn-media/products/ems/kt-4x1.svg"],
    specs: {
      "Gas Detectado": "Dióxido de Carbono (CO₂)",
      "Rango de Medición": "0 a 5.000 ppm / 0 a 10.000 ppm",
      "Sensor / Tecnología": "NDIR con LCD Display Gráfico",
      "Salida / Protocolo": "0-10V / 4-20mA / Modbus RTU RS485",
      "Alimentación": "24 VAC/VDC"
    },
    technicalDescription: "TRANSMISOR DE CO₂ CON DISPLAY EMS KT-4X1: Permite verificar los niveles de CO₂ en vivo en el recinto mientras transmite al sistema BMS.",
    shortDescription: "Transmisor NDIR de CO₂ con pantalla LCD EMS KT-4X1 para escuelas, quirófanos y edificios comerciales."
  },
  {
    handle: "ems-kt-4x9-co2-transmitter-display-high-range",
    title: "EMS KT-4X9 Transmisor de CO₂ NDIR Rango Alto con Display LCD (Hasta 5% Vol.)",
    mfrModel: "KT-4X9",
    categoryPath: ["sensores-transmisores", "gases-co2"],
    categorySlug: "gases-co2",
    images: ["/cn-media/products/ems/kt-4x9.svg"],
    specs: {
      "Gas Detectado": "Dióxido de Carbono (CO₂ Alta Concentración)",
      "Rango de Medición": "0 a 50.000 ppm (0-5% CO₂)",
      "Sensor / Tecnología": "NDIR Dual Beam + Pantalla LCD",
      "Salida / Protocolo": "0-10V / 4-20mA / Modbus RTU RS485",
      "Alimentación": "24 VAC/VDC"
    },
    technicalDescription: "TRANSMISOR DE CO₂ INDUSTRIAL CON DISPLAY EMS KT-4X9: Indicación directa en ppm en entornos industriales con altas cargas de gas.",
    shortDescription: "Transmisor industrial de CO₂ con pantalla LCD EMS KT-4X9 para procesos bioquímicos y almacenamiento de gas."
  },
  {
    handle: "ems-kt-5xx-temp-humidity-co2-transmitter",
    title: "EMS KT-5XX Transmisor Triple de Temperatura, Humedad y CO₂ (3 en 1)",
    mfrModel: "KT-5XX",
    categoryPath: ["sensores-transmisores", "gases-co2"],
    categorySlug: "gases-co2",
    images: ["/cn-media/products/ems/kt-5xx.svg"],
    specs: {
      "Gas Detectado": "CO₂ + Humedad Relativa + Temperatura",
      "Rango de Medición": "0-5000 ppm CO₂ / 0-100% HR / -30 a 70 °C",
      "Sensor / Tecnología": "Combinado NDIR + CMOSens T/HR",
      "Salida / Protocolo": "3x Salidas Analógicas (0-10V / 4-20mA) / Modbus RTU",
      "Alimentación": "24 VAC/VDC"
    },
    technicalDescription: "TRANSMISOR MULTIVARIABLE 3 EN 1 EMS KT-5XX: Mide los tres parámetros clave de confort térmico y calidad de aire en un solo equipo.",
    shortDescription: "Transmisor 3 en 1 (T + HR + CO₂) EMS KT-5XX para optimización de energía y ventilación HVAC."
  },
  {
    handle: "ems-kt-6xx-temp-humidity-co2-transmitter-display",
    title: "EMS KT-6XX Transmisor Triple (T + HR + CO₂) con Pantalla LCD Gráfica",
    mfrModel: "KT-6XX",
    categoryPath: ["sensores-transmisores", "gases-co2"],
    categorySlug: "gases-co2",
    images: ["/cn-media/products/ems/kt-6xx.svg"],
    specs: {
      "Gas Detectado": "CO₂ + Humedad + Temperatura",
      "Rango de Medición": "0-5000 ppm CO₂ / 0-100% HR / -30 a 70 °C",
      "Sensor / Tecnología": "NDIR + Capacitivo + LCD Retroiluminado",
      "Salida / Protocolo": "3x Salidas Analógicas / RS485 Modbus RTU",
      "Alimentación": "24 VAC/VDC"
    },
    technicalDescription: "TRANSMISOR TRIPLE CON DISPLAY EMS KT-6XX: La estación definitiva de monitoreo ambiental para salas de conferencias y hospitales.",
    shortDescription: "Transmisor triple T/HR/CO₂ con pantalla LCD EMS KT-6XX. Control integral de calidad ambiental."
  },

  // Gases Industriales (NH3, C2H4, SO2, CO, O2)
  {
    handle: "ems-at-3xx-ammonia-transmitter",
    title: "EMS AT-3XX Transmisor de Amoniaco (NH₃) para Refrigeración Industrial y Granjas",
    mfrModel: "AT-3XX",
    categoryPath: ["sensores-transmisores", "gases-co2"],
    categorySlug: "gases-co2",
    images: ["/cn-media/products/ems/at-3xx.svg"],
    specs: {
      "Gas Detectado": "Amoniaco (NH₃)",
      "Rango de Medición": "0 a 100 ppm / 0 a 300 ppm NH₃",
      "Sensor / Tecnología": "Electroquímico Industrial de Alta Longevedad",
      "Salida / Protocolo": "0-10V / 4-20mA / Modbus RTU",
      "Alimentación": "24 VAC/VDC"
    },
    technicalDescription: "TRANSMISOR DE AMONIACO EMS AT-3XX: Monitorización segura de fugas de NH₃ en plantas pesqueras, salas de máquinas frigoríficas y avicultura.",
    shortDescription: "Transmisor electroquímico de NH₃ (Amoniaco) EMS AT-3XX para seguridad laboral y control de fugas."
  },
  {
    handle: "ems-at-4xx-ammonia-transmitter-display",
    title: "EMS AT-4XX Transmisor de Amoniaco (NH₃) con Pantalla LCD Retroiluminada",
    mfrModel: "AT-4XX",
    categoryPath: ["sensores-transmisores", "gases-co2"],
    categorySlug: "gases-co2",
    images: ["/cn-media/products/ems/at-4xx.svg"],
    specs: {
      "Gas Detectado": "Amoniaco (NH₃)",
      "Rango de Medición": "0 a 100 ppm / 0 a 300 ppm NH₃",
      "Sensor / Tecnología": "Electroquímico + Pantalla LCD Local",
      "Salida / Protocolo": "0-10V / 4-20mA / Modbus RTU",
      "Alimentación": "24 VAC/VDC"
    },
    technicalDescription: "TRANSMISOR DE NH₃ CON DISPLAY EMS AT-4XX: Muestra la concentración local de gas para seguridad inmediata de los operarios.",
    shortDescription: "Transmisor de NH₃ con display gráfico EMS AT-4XX para plantas de refrigeración y cámaras frigoríficas."
  },
  {
    handle: "ems-et-3xx-ethylene-transmitter",
    title: "EMS ET-3XX Transmisor de Etileno (C₂H₄) para Cámaras de Maduración de Fruta",
    mfrModel: "ET-3XX",
    categoryPath: ["sensores-transmisores", "gases-co2"],
    categorySlug: "gases-co2",
    images: ["/cn-media/products/ems/et-3xx.svg"],
    specs: {
      "Gas Detectado": "Etileno (C₂H₄)",
      "Rango de Medición": "0 a 10 ppm / 0 a 100 ppm C₂H₄",
      "Sensor / Tecnología": "Electroquímico Selectivo de Alta Sensibilidad",
      "Salida / Protocolo": "0-10V / 4-20mA / Modbus RTU",
      "Alimentación": "24 VAC/VDC"
    },
    technicalDescription: "TRANSMISOR DE ETILENO EMS ET-3XX: Esencial para controlar el proceso de maduración de paltas, plátanos y mangos en la industria agroexportadora.",
    shortDescription: "Transmisor de etileno (C₂H₄) EMS ET-3XX para agroindustria y cámaras de maduración de frutas."
  },
  {
    handle: "ems-et-4xx-ethylene-transmitter-display",
    title: "EMS ET-4XX Transmisor de Etileno (C₂H₄) con Display LCD para Agroindustria",
    mfrModel: "ET-4XX",
    categoryPath: ["sensores-transmisores", "gases-co2"],
    categorySlug: "gases-co2",
    images: ["/cn-media/products/ems/et-4xx.svg"],
    specs: {
      "Gas Detectado": "Etileno (C₂H₄)",
      "Rango de Medición": "0 a 10 ppm / 0 a 100 ppm C₂H₄",
      "Sensor / Tecnología": "Electroquímico + Pantalla LCD",
      "Salida / Protocolo": "0-10V / 4-20mA / Modbus RTU",
      "Alimentación": "24 VAC/VDC"
    },
    technicalDescription: "TRANSMISOR DE ETILENO CON DISPLAY EMS ET-4XX: Lectura continua en vivo de C₂H₄ para ingenieros agrónomos y jefes de planta.",
    shortDescription: "Transmisor de C₂H₄ con pantalla LCD EMS ET-4XX para plantas de empaque y postcosecha."
  },
  {
    handle: "ems-ut-3xx-so2-transmitter",
    title: "EMS UT-3XX Transmisor de Dióxido de Azufre (SO₂) para Procesos Agroquímicos y Minería",
    mfrModel: "UT-3XX",
    categoryPath: ["sensores-transmisores", "gases-co2"],
    categorySlug: "gases-co2",
    images: ["/cn-media/products/ems/ut-3xx.svg"],
    specs: {
      "Gas Detectado": "Dióxido de Azufre (SO₂)",
      "Rango de Medición": "0 a 20 ppm / 0 a 100 ppm SO₂",
      "Sensor / Tecnología": "Electroquímico Especializado",
      "Salida / Protocolo": "0-10V / 4-20mA / Modbus RTU",
      "Alimentación": "24 VAC/VDC"
    },
    technicalDescription: "TRANSMISOR DE SO₂ EMS UT-3XX: Control ambiental y seguridad en fundiciones, vitivinicultura y plantas de tratamiento de gases.",
    shortDescription: "Transmisor de dióxido de azufre (SO₂) EMS UT-3XX para minería y procesos químicos."
  },
  {
    handle: "ems-ut-4xx-so2-transmitter-display",
    title: "EMS UT-4XX Transmisor de SO₂ con Pantalla LCD para Áreas Industriales",
    mfrModel: "UT-4XX",
    categoryPath: ["sensores-transmisores", "gases-co2"],
    categorySlug: "gases-co2",
    images: ["/cn-media/products/ems/ut-4xx.svg"],
    specs: {
      "Gas Detectado": "Dióxido de Azufre (SO₂)",
      "Rango de Medición": "0 a 20 ppm / 0 a 100 ppm SO₂",
      "Sensor / Tecnología": "Electroquímico + LCD Local",
      "Salida / Protocolo": "0-10V / 4-20mA / Modbus RTU",
      "Alimentación": "24 VAC/VDC"
    },
    technicalDescription: "TRANSMISOR DE SO₂ CON DISPLAY EMS UT-4XX: Indicación in situ y alarmas para prevención de intoxicación por gases tóxicos.",
    shortDescription: "Transmisor de SO₂ con pantalla LCD EMS UT-4XX para seguridad industrial y monitoreo de emisión."
  },
  {
    handle: "ems-ct-3xx-co-transmitter",
    title: "EMS CT-3XX Transmisor de Monóxido de Carbono (CO) para Estacionamientos Subterráneos y Calderas",
    mfrModel: "CT-3XX",
    categoryPath: ["sensores-transmisores", "gases-co2"],
    categorySlug: "gases-co2",
    images: ["/cn-media/products/ems/ct-3xx.svg"],
    specs: {
      "Gas Detectado": "Monóxido de Carbono (CO)",
      "Rango de Medición": "0 a 300 ppm CO",
      "Sensor / Tecnología": "Electroquímico Long-Life (Garantía 5 Años)",
      "Salida / Protocolo": "0-10V / 4-20mA / Modbus RTU",
      "Alimentación": "24 VAC/VDC"
    },
    technicalDescription: "TRANSMISOR DE CO EMS CT-3XX: Activa los extractores de aire en cocheras subterráneas y monitorea combustión incompleta en calderas.",
    shortDescription: "Transmisor de monóxido de carbono (CO) EMS CT-3XX para estacionamientos y salas de calderas."
  },
  {
    handle: "ems-ct-4xx-co-transmitter-display",
    title: "EMS CT-4XX Transmisor de Monóxido de Carbono (CO) con Pantalla LCD",
    mfrModel: "CT-4XX",
    categoryPath: ["sensores-transmisores", "gases-co2"],
    categorySlug: "gases-co2",
    images: ["/cn-media/products/ems/ct-4xx.svg"],
    specs: {
      "Gas Detectado": "Monóxido de Carbono (CO)",
      "Rango de Medición": "0 a 300 ppm CO",
      "Sensor / Tecnología": "Electroquímico + LCD Display",
      "Salida / Protocolo": "0-10V / 4-20mA / Modbus RTU",
      "Alimentación": "24 VAC/VDC"
    },
    technicalDescription: "TRANSMISOR DE CO CON DISPLAY EMS CT-4XX: Muestra los niveles exactos de monóxido de carbono en ppm para inspecciones operativas.",
    shortDescription: "Transmisor de CO con pantalla LCD EMS CT-4XX para seguridad en sótanos y áreas confinadas."
  },
  {
    handle: "ems-ot-3xx-o2-transmitter",
    title: "EMS OT-3XX Transmisor de Oxígeno (O₂) para Enriquecimiento o Deficiencia de Oxígeno",
    mfrModel: "OT-3XX",
    categoryPath: ["sensores-transmisores", "gases-co2"],
    categorySlug: "gases-co2",
    images: ["/cn-media/products/ems/ot-3xx.svg"],
    specs: {
      "Gas Detectado": "Oxígeno (O₂)",
      "Rango de Medición": "0 a 25% Vol. O₂",
      "Sensor / Tecnología": "Zirconia / Electroquímico Libre de Plomo",
      "Salida / Protocolo": "0-10V / 4-20mA / Modbus RTU",
      "Alimentación": "24 VAC/VDC"
    },
    technicalDescription: "TRANSMISOR DE OXÍGENO EMS OT-3XX: Previene la asfixia por deficiencia de O₂ en salas de nitrógeno y laboratorios.",
    shortDescription: "Transmisor de O₂ (Oxígeno) EMS OT-3XX para monitoreo de seguridad en ambientes de gas inerte."
  },
  {
    handle: "ems-ot-4xx-o2-transmitter-display",
    title: "EMS OT-4XX Transmisor de Oxígeno (O₂) con Display LCD Retroiluminado",
    mfrModel: "OT-4XX",
    categoryPath: ["sensores-transmisores", "gases-co2"],
    categorySlug: "gases-co2",
    images: ["/cn-media/products/ems/ot-4xx.svg"],
    specs: {
      "Gas Detectado": "Oxígeno (O₂)",
      "Rango de Medición": "0 a 25% Vol. O₂",
      "Sensor / Tecnología": "Electroquímico O₂ + Pantalla LCD",
      "Salida / Protocolo": "0-10V / 4-20mA / Modbus RTU",
      "Alimentación": "24 VAC/VDC"
    },
    technicalDescription: "TRANSMISOR DE O₂ CON DISPLAY EMS OT-4XX: Lectura porcentual precisa del contenido de oxígeno con alertas auditivas/visuales.",
    shortDescription: "Transmisor porcentual de O₂ con pantalla LCD EMS OT-4XX para protección de personal en laboratorios y criogenia."
  },

  // Portátiles
  {
    handle: "ems-ks-412-portable-co2-sensor",
    title: "EMS KS-412 Sensor Portátil de CO₂ NDIR de Mano (0-5,000 ppm)",
    mfrModel: "KS-412",
    categoryPath: ["sensores-transmisores", "gases-co2"],
    categorySlug: "gases-co2",
    images: ["/cn-media/products/ems/ks-412.svg"],
    specs: {
      "Gas Detectado": "Dióxido de Carbono (CO₂ Portátil)",
      "Rango de Medición": "0 a 5.000 ppm",
      "Sensor / Tecnología": "NDIR Portátil + Batería Li-Ion",
      "Salida / Protocolo": "Pantalla LCD Gráfica + Datalogger USB",
      "Alimentación": "Batería Recargable vía USB-C"
    },
    technicalDescription: "DETECTOR PORTÁTIL DE CO₂ EMS KS-412: Diseñado para realizar inspecciones exprés de calidad de aire en escuelas, oficinas y transporte público.",
    shortDescription: "Medidor portátil de CO₂ de mano EMS KS-412 con datalogger interno y aviso sonoro de alarma."
  },
  {
    handle: "ems-ks-415-portable-co2-sensor",
    title: "EMS KS-415 Sensor Portátil de CO₂ Rango Ampliado (Hasta 10,000 ppm)",
    mfrModel: "KS-415",
    categoryPath: ["sensores-transmisores", "gases-co2"],
    categorySlug: "gases-co2",
    images: ["/cn-media/products/ems/ks-415.svg"],
    specs: {
      "Gas Detectado": "Dióxido de Carbono (CO₂)",
      "Rango de Medición": "0 a 10.000 ppm",
      "Sensor / Tecnología": "NDIR + Sensor Térmico Incorporado",
      "Salida / Protocolo": "LCD + Alarma Sonora",
      "Alimentación": "Batería de Litio Recargable"
    },
    technicalDescription: "ANALIZADOR PORTÁTIL DE CO₂ EMS KS-415: Permite verificar la tasa de renovación de aire en ambientes cerrados.",
    shortDescription: "Detector portátil de CO₂ EMS KS-415 hasta 10,000 ppm para auditorías de higiene ocupacional."
  },
  {
    handle: "ems-ks-419-portable-co2-sensor",
    title: "EMS KS-419 Medidor Portátil de CO₂ Industrial Alta Concentración (Hasta 5% CO₂)",
    mfrModel: "KS-419",
    categoryPath: ["sensores-transmisores", "gases-co2"],
    categorySlug: "gases-co2",
    images: ["/cn-media/products/ems/ks-419.svg"],
    specs: {
      "Gas Detectado": "Dióxido de Carbono (Alta Concentración)",
      "Rango de Medición": "0 a 50.000 ppm (0-5%)",
      "Sensor / Tecnología": "NDIR Dual Beam Industrial",
      "Salida / Protocolo": "LCD + USB Exportación CSV",
      "Alimentación": "Batería Litio Recargable"
    },
    technicalDescription: "DETECTOR PORTÁTIL DE CO₂ INDUSTRIAL EMS KS-419: Mide altas concentraciones en bodegas de cerveza, embotelladoras y tanques.",
    shortDescription: "Medidor portátil de CO₂ rango industrial EMS KS-419 para auditoría de fugas en embotelladoras y bodegas."
  },
  {
    handle: "ems-ks-612-portable-temp-humidity-co2-sensor",
    title: "EMS KS-612 Analizador Portátil Multivariable (T + HR + CO₂) de Mano",
    mfrModel: "KS-612",
    categoryPath: ["sensores-transmisores", "gases-co2"],
    categorySlug: "gases-co2",
    images: ["/cn-media/products/ems/ks-612.svg"],
    specs: {
      "Gas Detectado": "CO₂ + Humedad Relativa + Temperatura",
      "Rango de Medición": "0-5000 ppm CO₂ / 0-100% HR / -20 a 60 °C",
      "Sensor / Tecnología": "NDIR + Capacitivo + Pantalla Color",
      "Salida / Protocolo": "Display Color + Registro SD / USB",
      "Alimentación": "Batería Li-Ion 3.7V"
    },
    technicalDescription: "ANALIZADOR MULTIFUNCIÓN AMBIENTAL EMS KS-612: Combina temperatura, humedad y CO₂ en un único instrumento portátil de bolsillo.",
    shortDescription: "Medidor multifunción portátil T/HR/CO₂ EMS KS-612 para auditorías HVAC y salud ambiental."
  },
  {
    handle: "ems-as-412-portable-ammonia-sensor",
    title: "EMS AS-412 Detector Portátil de Amoniaco (NH₃) de Mano con Alarma Sonora",
    mfrModel: "AS-412",
    categoryPath: ["sensores-transmisores", "gases-co2"],
    categorySlug: "gases-co2",
    images: ["/cn-media/products/ems/as-412.svg"],
    specs: {
      "Gas Detectado": "Amoniaco (NH₃)",
      "Rango de Medición": "0 a 100 ppm NH₃",
      "Sensor / Tecnología": "Electroquímico de Alta Respuesta",
      "Salida / Protocolo": "Pantalla LCD + Alarma Sonora / Vibración",
      "Alimentación": "Batería Recargable"
    },
    technicalDescription: "DETECTOR PORTÁTIL DE NH₃ EMS AS-412: Protección personal contra fugas de amoniaco durante maniobras de mantenimiento.",
    shortDescription: "Detector personal portátil de amoniaco EMS AS-412 con alertas sonoras y luminosas."
  },
  {
    handle: "ems-es-412-portable-ethylene-sensor",
    title: "EMS ES-412 Medidor Portátil de Etileno (C₂H₄) para Control Agropecuario",
    mfrModel: "ES-412",
    categoryPath: ["sensores-transmisores", "gases-co2"],
    categorySlug: "gases-co2",
    images: ["/cn-media/products/ems/es-412.svg"],
    specs: {
      "Gas Detectado": "Etileno (C₂H₄)",
      "Rango de Medición": "0 a 10 ppm / 0 a 100 ppm C₂H₄",
      "Sensor / Tecnología": "Electroquímico Ultra-Sensible",
      "Salida / Protocolo": "LCD + Datalogging USB",
      "Alimentación": "Batería Litio"
    },
    technicalDescription: "DETECTOR PORTÁTIL DE ETILENO EMS ES-412: Permite evaluar la acumulación de gas etileno en contenedores frigoríficos y pallets.",
    shortDescription: "Medidor portátil de etileno EMS ES-412 para inspección de calidad en embarques de fruta."
  },
  {
    handle: "ems-us-412-portable-so2-sensor",
    title: "EMS US-412 Detector Portátil de Dióxido de Azufre (SO₂)",
    mfrModel: "US-412",
    categoryPath: ["sensores-transmisores", "gases-co2"],
    categorySlug: "gases-co2",
    images: ["/cn-media/products/ems/us-412.svg"],
    specs: {
      "Gas Detectado": "Dióxido de Azufre (SO₂)",
      "Rango de Medición": "0 a 20 ppm SO₂",
      "Sensor / Tecnología": "Electroquímico SO₂ Portátil",
      "Salida / Protocolo": "Display Digital LCD + Alarma",
      "Alimentación": "Batería Recargable"
    },
    technicalDescription: "DETECTOR PORTÁTIL DE SO₂ EMS US-412: Herramienta de seguridad para cuadrillas en industrias químicas y metalúrgicas.",
    shortDescription: "Detector portátil de SO₂ EMS US-412 con pantalla digital y alarmas de seguridad."
  },
  {
    handle: "ems-cs-412-portable-co-sensor",
    title: "EMS CS-412 Medidor Portátil de Monóxido de Carbono (CO)",
    mfrModel: "CS-412",
    categoryPath: ["sensores-transmisores", "gases-co2"],
    categorySlug: "gases-co2",
    images: ["/cn-media/products/ems/cs-412.svg"],
    specs: {
      "Gas Detectado": "Monóxido de Carbono (CO)",
      "Rango de Medición": "0 a 500 ppm CO",
      "Sensor / Tecnología": "Electroquímico Rápido",
      "Salida / Protocolo": "Display LCD + Buzzer Alarma",
      "Alimentación": "Batería Li-Ion"
    },
    technicalDescription: "DETECTOR PORTÁTIL DE CO EMS CS-412: Indispensable para técnicos de calderas, inspección de gases de escape y rescate.",
    shortDescription: "Medidor de CO portátil EMS CS-412 para detección inmediata de fugas de combustión."
  },
  {
    handle: "ems-os-412-portable-o2-sensor",
    title: "EMS OS-412 Monitor Portátil de Deficiencia de Oxígeno (O₂)",
    mfrModel: "OS-412",
    categoryPath: ["sensores-transmisores", "gases-co2"],
    categorySlug: "gases-co2",
    images: ["/cn-media/products/ems/os-412.svg"],
    specs: {
      "Gas Detectado": "Oxígeno (O₂)",
      "Rango de Medición": "0 a 30% Vol. O₂",
      "Sensor / Tecnología": "Sensor Celda de Oxígeno Long-Life",
      "Salida / Protocolo": "Display LCD + Alarma Sonora Multi-Nivel",
      "Alimentación": "Batería Litio"
    },
    technicalDescription: "MONITOR PORTÁTIL DE OXÍGENO EMS OS-412: Equipo de seguridad personal para ingreso a espacios confinados.",
    shortDescription: "Detector de deficiencia/enriquecimiento de O₂ portátil EMS OS-412 con pantalla LCD."
  },

  // Wireless
  {
    handle: "ems-kt-391-wireless-co2-sensor",
    title: "EMS KT-391 Sensor Inalámbrico de CO₂ NDIR 433 MHz RF",
    mfrModel: "KT-391",
    categoryPath: ["sensores-transmisores", "gases-co2"],
    categorySlug: "gases-co2",
    images: ["/cn-media/products/ems/kt-391.svg"],
    specs: {
      "Gas Detectado": "Dióxido de Carbono (CO₂ Inalámbrico)",
      "Rango de Medición": "0 a 5.000 ppm",
      "Sensor / Tecnología": "NDIR Ultra Low Power + Transmisor RF 433 MHz",
      "Salida / Protocolo": "RF 433 MHz Hacia Master MT-010/MT-016",
      "Alimentación": "Batería de Litio Alta Capacidad"
    },
    technicalDescription: "SENSOR INALÁMBRICO DE CO₂ EMS KT-391: Monitoreo remoto de CO₂ en tiempo real sin tirar cables por techos ni paredes.",
    shortDescription: "Sensor inalámbrico NDIR de CO₂ 433 MHz RF EMS KT-391 de largo alcance."
  },
  {
    handle: "ems-at-391-wireless-ammonia-sensor",
    title: "EMS AT-391 Sensor Inalámbrico de Amoniaco (NH₃) 433 MHz RF",
    mfrModel: "AT-391",
    categoryPath: ["sensores-transmisores", "gases-co2"],
    categorySlug: "gases-co2",
    images: ["/cn-media/products/ems/at-391.svg"],
    specs: {
      "Gas Detectado": "Amoniaco (NH₃ Inalámbrico)",
      "Rango de Medición": "0 a 100 ppm NH₃",
      "Sensor / Tecnología": "Electroquímico + RF 433 MHz",
      "Salida / Protocolo": "RF 433 MHz Inalámbrico",
      "Alimentación": "Batería Litio / Fuente Externa 12V"
    },
    technicalDescription: "SENSOR INALÁMBRICO DE NH₃ EMS AT-391: Detección remota de amoniaco en instalaciones avícolas y naves agropecuarias.",
    shortDescription: "Sensor inalámbrico de NH₃ 433 MHz RF EMS AT-391 para monitoreo en galpones e industrias."
  },
  {
    handle: "ems-et-391-wireless-ethylene-sensor",
    title: "EMS ET-391 Sensor Inalámbrico de Etileno (C₂H₄) 433 MHz RF",
    mfrModel: "ET-391",
    categoryPath: ["sensores-transmisores", "gases-co2"],
    categorySlug: "gases-co2",
    images: ["/cn-media/products/ems/et-391.svg"],
    specs: {
      "Gas Detectado": "Etileno (C₂H₄ Inalámbrico)",
      "Rango de Medición": "0 a 50 ppm C₂H₄",
      "Sensor / Tecnología": "Electroquímico + RF 433 MHz",
      "Salida / Protocolo": "RF 433 MHz",
      "Alimentación": "Batería Litio Larga Duración"
    },
    technicalDescription: "SENSOR INALÁMBRICO DE C₂H₄ EMS ET-391: Ideal para monitorear frigoríficos móviles y contenedores de exportación.",
    shortDescription: "Sensor inalámbrico de etileno 433 MHz RF EMS ET-391 para control de maduración."
  },
  {
    handle: "ems-ut-391-wireless-so2-sensor",
    title: "EMS UT-391 Sensor Inalámbrico de Dióxido de Azufre (SO₂) 433 MHz RF",
    mfrModel: "UT-391",
    categoryPath: ["sensores-transmisores", "gases-co2"],
    categorySlug: "gases-co2",
    images: ["/cn-media/products/ems/ut-391.svg"],
    specs: {
      "Gas Detectado": "Dióxido de Azufre (SO₂ Inalámbrico)",
      "Rango de Medición": "0 a 50 ppm SO₂",
      "Sensor / Tecnología": "Electroquímico + Modulo RF",
      "Salida / Protocolo": "RF 433 MHz",
      "Alimentación": "Batería Litio"
    },
    technicalDescription: "SENSOR INALÁMBRICO DE SO₂ EMS UT-391: Monitoreo continuo de emisión de SO₂ en perímetros industriales.",
    shortDescription: "Sensor de SO₂ inalámbrico 433 MHz RF EMS UT-391 para periféricos de minería y química."
  },
  {
    handle: "ems-ct-391-wireless-co-sensor",
    title: "EMS CT-391 Sensor Inalámbrico de Monóxido de Carbono (CO) 433 MHz RF",
    mfrModel: "CT-391",
    categoryPath: ["sensores-transmisores", "gases-co2"],
    categorySlug: "gases-co2",
    images: ["/cn-media/products/ems/ct-391.svg"],
    specs: {
      "Gas Detectado": "Monóxido de Carbono (CO Inalámbrico)",
      "Rango de Medición": "0 a 300 ppm CO",
      "Sensor / Tecnología": "Electroquímico + RF 433 MHz",
      "Salida / Protocolo": "RF 433 MHz Inalámbrico",
      "Alimentación": "Batería de Litio 3.6V"
    },
    technicalDescription: "SENSOR INALÁMBRICO DE CO EMS CT-391: Monitoreo de emisiones de combustión en garajes y talleres sin romper paredes.",
    shortDescription: "Sensor inalámbrico de CO 433 MHz RF EMS CT-391 para alerta temprana de fugas de gas."
  },
  {
    handle: "ems-ot-391-wireless-o2-sensor",
    title: "EMS OT-391 Sensor Inalámbrico de Oxígeno (O₂) 433 MHz RF",
    mfrModel: "OT-391",
    categoryPath: ["sensores-transmisores", "gases-co2"],
    categorySlug: "gases-co2",
    images: ["/cn-media/products/ems/ot-391.svg"],
    specs: {
      "Gas Detectado": "Oxígeno (O₂ Inalámbrico)",
      "Rango de Medición": "0 a 25% Vol. O₂",
      "Sensor / Tecnología": "Celda de O₂ Long Life + RF 433 MHz",
      "Salida / Protocolo": "RF 433 MHz",
      "Alimentación": "Batería de Litio Recargable / Larga Vida"
    },
    technicalDescription: "SENSOR INALÁMBRICO DE OXÍGENO EMS OT-391: Protección remota de espacios con peligro de desplazamiento de aire por nitrógeno u argón.",
    shortDescription: "Sensor inalámbrico de O₂ 433 MHz RF EMS OT-391 para monitoreo de bioseguridad ambiental."
  },

  // -------------------------------------------------------------
  // 5. Presión Diferencial y Melt Pressure (presion-proceso) - 8 prods
  // -------------------------------------------------------------
  {
    handle: "ems-bd-355-differential-pressure-switch",
    title: "EMS BD-355 Switch Electromecánico de Presión Diferencial (50 a 500 Pa) para Filtros HVAC",
    mfrModel: "BD-355",
    categoryPath: ["sensores-transmisores", "presion-proceso"],
    categorySlug: "presion-proceso",
    images: ["/cn-media/products/ems/bd-355.svg"],
    specs: {
      "Rango de Presión": "50 a 500 Pa (Ajustable por Perilla Dial)",
      "Tipo de Presión": "Diferencial de Aire / Gases No Agresivos",
      "Salida / Protocolo": "Contacto Seco SPDT (Relé 250V 5A)",
      "Conexión a Proceso": "Niple Boquilla Flexible Ø 6.2 mm",
      "T° Máx. Maza": "N/A (Baja Presión HVAC / Sala Limpia)"
    },
    technicalDescription: "SWITCH DE PRESIÓN DIFERENCIAL EMS BD-355: Detecta la colmatación y ensuciamiento de filtros en manejadoras de aire y ventilación.",
    shortDescription: "Presostato de presión diferencial de aire EMS BD-355 (50-500 Pa) para estado de filtros HVAC."
  },
  {
    handle: "ems-bt-3x1-3x2-differential-pressure-transmitter",
    title: "EMS BT-3X1 / 3X2 Transmisor de Presión Diferencial de Muy Baja Presión (±50 Pa a ±500 Pa)",
    mfrModel: "BT-3X1 / 3X2",
    categoryPath: ["sensores-transmisores", "presion-proceso"],
    categorySlug: "presion-proceso",
    images: ["/cn-media/products/ems/bt-3x1.svg"],
    specs: {
      "Rango de Presión": "Configurable (±50 Pa, ±100 Pa, ±250 Pa, ±500 Pa)",
      "Tipo de Presión": "Diferencial / Positiva / Negativa (Salas Limpias)",
      "Salida / Protocolo": "0-10V / 4-20mA / Modbus RTU RS485",
      "Conexión a Proceso": "Tomas Racor de Presión Ø 6 mm",
      "T° Máx. Maza": "N/A (Entorno Limpio 70 °C)"
    },
    technicalDescription: "TRANSMISOR DE PRESIÓN DIFERENCIAL RANGO BAJO EMS BT-3X1/3X2: Diseñado para presurización de salas limpias, quirófanos y aisladores.",
    shortDescription: "Transmisor piezoeléctrico de presión diferencial fina EMS BT-3X1/3X2 para laboratorios y salas blancas."
  },
  {
    handle: "ems-bt-3x4-3x5-differential-pressure-transmitter",
    title: "EMS BT-3X4 / 3X5 Transmisor de Presión Diferencial Rango Alto (Hasta ±10,000 Pa / 10 kPa)",
    mfrModel: "BT-3X4 / 3X5",
    categoryPath: ["sensores-transmisores", "presion-proceso"],
    categorySlug: "presion-proceso",
    images: ["/cn-media/products/ems/bt-3x4.svg"],
    specs: {
      "Rango de Presión": "±1.000 Pa a ±10.000 Pa (Configurable)",
      "Tipo de Presión": "Diferencial de Flujo / Presión de Viento",
      "Salida / Protocolo": "0-10V / 4-20mA / Modbus RTU",
      "Conexión a Proceso": "Tomas Tubo Neumático Ø 6 mm",
      "T° Máx. Maza": "N/A (Proceso Aire Industrial)"
    },
    technicalDescription: "TRANSMISOR DE PRESIÓN DIFERENCIAL RANGO ALTO EMS BT-3X4/3X5: Medición en tiro de chimeneas, túneles de viento y ciclones.",
    shortDescription: "Transmisor de presión diferencial industrial EMS BT-3X4/3X5 de hasta 10 kPa para procesos de flujo."
  },
  {
    handle: "ems-bt-4x1-4x2-differential-pressure-display",
    title: "EMS BT-4X1 / 4X2 Transmisor de Presión Diferencial Fina con Display LCD",
    mfrModel: "BT-4X1 / 4X2",
    categoryPath: ["sensores-transmisores", "presion-proceso"],
    categorySlug: "presion-proceso",
    images: ["/cn-media/products/ems/bt-4x1.svg"],
    specs: {
      "Rango de Presión": "±50 Pa / ±100 Pa / ±250 Pa / ±500 Pa",
      "Tipo de Presión": "Diferencial de Sala Limpia",
      "Salida / Protocolo": "0-10V / 4-20mA / RS485 Modbus RTU + Display LCD",
      "Conexión a Proceso": "Espigas Neumáticas de Latón Ø 6 mm",
      "T° Máx. Maza": "N/A (Sala Blanca 60 °C)"
    },
    technicalDescription: "TRANSMISOR DE ΔP CON DISPLAY EMS BT-4X1/4X2: Visualización inmediata de la diferencia de presión entre salas aisladas.",
    shortDescription: "Transmisor de presión diferencial con pantalla LCD EMS BT-4X1/4X2 para hospitales y farmacéutica."
  },
  {
    handle: "ems-bt-4x4-4x5-differential-pressure-display",
    title: "EMS BT-4X4 / 4X5 Transmisor de Presión Diferencial Industrial con Pantalla LCD",
    mfrModel: "BT-4X4 / 4X5",
    categoryPath: ["sensores-transmisores", "presion-proceso"],
    categorySlug: "presion-proceso",
    images: ["/cn-media/products/ems/bt-4x4.svg"],
    specs: {
      "Rango de Presión": "±1.000 Pa a ±10.000 Pa",
      "Tipo de Presión": "Diferencial Ductos y Filtros pesados",
      "Salida / Protocolo": "0-10V / 4-20mA / Modbus RTU RS485 + Display LCD",
      "Conexión a Proceso": "Tomas Neumáticas Reforzadas Ø 6 mm",
      "T° Máx. Maza": "N/A (Ambiente 70 °C)"
    },
    technicalDescription: "TRANSMISOR DE ΔP CON PANTALLA LCD RANGO ALTO EMS BT-4X4/4X5: Monitorización de filtros HEPA y sistemas de captación de polvo.",
    shortDescription: "Transmisor de presión diferencial hasta 10 kPa con LCD EMS BT-4X4/4X5 para filtración industrial."
  },
  {
    handle: "ems-bs-412-413-portable-differential-pressure",
    title: "EMS BS-412 / BS-413 Medidor Portátil de Presión Diferencial de Mano (Rango Bajo)",
    mfrModel: "BS-412 / BS-413",
    categoryPath: ["sensores-transmisores", "presion-proceso"],
    categorySlug: "presion-proceso",
    images: ["/cn-media/products/ems/bs-412.svg"],
    specs: {
      "Rango de Presión": "0 a ±500 Pa",
      "Tipo de Presión": "Diferencial Portátil de Verificación",
      "Salida / Protocolo": "Display LCD con Cero Auto-Ajustable",
      "Conexión a Proceso": "Kit de Tubos Flexibles Neumáticos de Prueba",
      "T° Máx. Maza": "N/A (Instrumento de Mano)"
    },
    technicalDescription: "MANÓMETRO DIGITAL PORTÁTIL DE ΔP EMS BS-412/413: Medición de campo para balanceo de aire y prueba de fugas en conductos.",
    shortDescription: "Medidor portátil de presión diferencial fina EMS BS-412/413 para certificación de salas y balanceo HVAC."
  },
  {
    handle: "ems-bs-414-415-portable-differential-pressure",
    title: "EMS BS-414 / BS-415 Manómetro Digital Portátil de Presión Diferencial (Rango Alto)",
    mfrModel: "BS-414 / BS-415",
    categoryPath: ["sensores-transmisores", "presion-proceso"],
    categorySlug: "presion-proceso",
    images: ["/cn-media/products/ems/bs-414.svg"],
    specs: {
      "Rango de Presión": "0 a ±10.000 Pa (0-100 mbar)",
      "Tipo de Presión": "Diferencial de Presión Portátil",
      "Salida / Protocolo": "Display LCD Retroiluminado",
      "Conexión a Proceso": "Kit de Sondas de Inserción y Tubos Neumáticos",
      "T° Máx. Maza": "N/A (Instrumento de Inspección)"
    },
    technicalDescription: "MANÓMETRO DIGITAL DE MANO EMS BS-414/415: Permite medir caídas de presión en calderas, quemadores y ventiladores.",
    shortDescription: "Manómetro portátil de presión diferencial alta EMS BS-414/415 para servicio técnico HVAC."
  },
  {
    handle: "ems-bt-391-wireless-differential-pressure",
    title: "EMS BT-391 / 392 Sensor Inalámbrico de Presión Diferencial 433 MHz RF",
    mfrModel: "BT-391 / 392",
    categoryPath: ["sensores-transmisores", "presion-proceso"],
    categorySlug: "presion-proceso",
    images: ["/cn-media/products/ems/bt-391.svg"],
    specs: {
      "Rango de Presión": "±100 Pa / ±500 Pa / ±2500 Pa",
      "Tipo de Presión": "Diferencial Inalámbrica",
      "Salida / Protocolo": "RF 433 MHz Transmisión Inalámbrica",
      "Conexión a Proceso": "Tomas Rápidas de Manguera Neumática",
      "T° Máx. Maza": "N/A (Batería Inalámbrica)"
    },
    technicalDescription: "SENSOR INALÁMBRICO DE ΔP EMS BT-391/392: Monitoreo inalámbrico de salas aisladas de pacientes y laboratorios virales.",
    shortDescription: "Sensor inalámbrico de presión diferencial 433 MHz RF EMS BT-391/392 para bio-seguridad."
  },

  // -------------------------------------------------------------
  // 6. Nivel y Proximidad (nivel) - 2 prods
  // -------------------------------------------------------------
  {
    handle: "ems-ys-111-capacitive-sensor-m18",
    title: "EMS YS-111 Sensor Capacitivo de Proximidad y Nivel M18 (2 Hilos AC, Sensibilidad Ajustable)",
    mfrModel: "YS-111",
    categoryPath: ["sensores-transmisores", "nivel"],
    categorySlug: "nivel",
    images: ["/cn-media/products/ems/ys-111.svg"],
    specs: {
      "Tecnología de Medición": "Detección Capacitiva de Proximidad / Nivel",
      "Rango de Medición": "Distancia de Detección 8 mm (Ajustable por Potenciómetro)",
      "Salida / Protocolo": "2 Hilos AC (90-250 VAC) NO/NC Seleccionable",
      "Material Sumergible / Carcasa": "Cuerpo Cilíndrico Roscado M18 en Latón Niquelado / PBT",
      "Alimentación": "90 a 250 VAC (50/60 Hz)"
    },
    technicalDescription: "SENSOR CAPACITIVO M18 EMS YS-111: Detecta presencia de sólidos, plásticos en tolvas, líquidos en tubos de vidrio y objetos metálicos/no metálicos.",
    shortDescription: "Sensor de proximidad capacitivo M18 EMS YS-111 para detección de nivel en tolvas y paso de materiales."
  },
  {
    handle: "ems-ys-112-capacitive-sensor-m30",
    title: "EMS YS-112 Sensor Capacitivo de Proximidad y Nivel M30 (2 Hilos AC, Alta Sensibilidad)",
    mfrModel: "YS-112",
    categoryPath: ["sensores-transmisores", "nivel"],
    categorySlug: "nivel",
    images: ["/cn-media/products/ems/ys-112.svg"],
    specs: {
      "Tecnología de Medición": "Capacitiva de Gran Alcance",
      "Rango de Medición": "Distancia de Detección 15 mm (Ajustable)",
      "Salida / Protocolo": "2 Hilos AC (90-250 VAC) Conmutación Directa de Carga",
      "Material Sumergible / Carcasa": "Cuerpo Roscado M30 Heavy-Duty IP67",
      "Alimentación": "90 a 250 VAC"
    },
    technicalDescription: "SENSOR CAPACITIVO M30 EMS YS-112: Diseñado para detección de nivel de granos, pellets de plástico, polvos e insumos alimentarios.",
    shortDescription: "Sensor capacitivo M30 de alta sensibilidad EMS YS-112 para control de nivel de plásticos, granos y líquidos."
  },

  // -------------------------------------------------------------
  // 7. Accesorios de Sensores (accesorios-sensores) - 15 prods
  // -------------------------------------------------------------
  {
    handle: "ems-ae-321-stainless-sensor-accessory",
    title: "EMS AE-321 Accesorio de Montaje de Sensor en Acero Inoxidable AISI 316",
    mfrModel: "AE-321",
    categoryPath: ["sensores-transmisores", "accesorios-sensores"],
    categorySlug: "accesorios-sensores",
    images: ["/cn-media/products/ems/ae-321.svg"],
    specs: {
      "Tipo de Accesorio": "Soporte de Montaje Reforzado",
      "Material / Construcción": "Acero Inoxidable AISI 316L",
      "Conexión a Proceso / Entrada": "Prensaestopas de Conexión Rosca NPT",
      "Compatibilidad": "Sensores de Temperatura y Humedad EMS",
      "Rango / Grado": "Grado Sanitario / Industrial IP68"
    },
    technicalDescription: "ACCESORIO STAINLESS EMS AE-321: Soporte en acero inoxidable AISI 316L para fijación rígida de sensores industriales.",
    shortDescription: "Soporte de montaje en acero inoxidable AISI 316L EMS AE-321 para sensores de proceso."
  },
  {
    handle: "ems-ae-322-stainless-duct-probe",
    title: "EMS AE-322 Sonda de Ducto en Acero Inoxidable para Sensores de Temperatura y Humedad",
    mfrModel: "AE-322",
    categoryPath: ["sensores-transmisores", "accesorios-sensores"],
    categorySlug: "accesorios-sensores",
    images: ["/cn-media/products/ems/ae-322.svg"],
    specs: {
      "Tipo de Accesorio": "Sonda de Penetración para Ducto",
      "Material / Construcción": "Tubo de Acero Inoxidable AISI 304 (200 mm)",
      "Conexión a Proceso / Entrada": "Brida de Ajuste Rápido Deslizante",
      "Compatibilidad": "Transmisores Serie ST-2XX y NT-2XX",
      "Rango / Grado": "IP65 / Temperatura hasta 150 °C"
    },
    technicalDescription: "SONDA DE DUCTO INOX EMS AE-322: Caña de acero inoxidable para adaptar sensores a ductos de aire caliente.",
    shortDescription: "Sonda de ducto en acero inoxidable 200mm EMS AE-322 para transmisores de humedad y temperatura."
  },
  {
    handle: "ems-ae-323-stainless-screw-probe",
    title: "EMS AE-323 Sonda Roscada de Imersión de Acero Inoxidable G 1/2\" NPT",
    mfrModel: "AE-323",
    categoryPath: ["sensores-transmisores", "accesorios-sensores"],
    categorySlug: "accesorios-sensores",
    images: ["/cn-media/products/ems/ae-323.svg"],
    specs: {
      "Tipo de Accesorio": "Sonda de Inmersión Roscada",
      "Material / Construcción": "Acero Inoxidable AISI 316L con Rosca Macho 1/2\" NPT",
      "Conexión a Proceso / Entrada": "Rosca 1/2\" NPT / BSP",
      "Compatibilidad": "Sensores NTC, Pt100 y Pt1000 EMS",
      "Rango / Grado": "Presión 40 bar / -50 a 200 °C"
    },
    technicalDescription: "SONDA ROSCADA INOX EMS AE-323: Permite instalar sensores en tuberías bajo presión para medición directa de fluidos.",
    shortDescription: "Sonda roscada de acero inoxidable 1/2\" NPT EMS AE-323 para inmersión en tuberías y tanques."
  },
  {
    handle: "ems-ae-331-plastic-sensor-accessory",
    title: "EMS AE-331 Accesorio de Montaje Plástico ABS para Sensores Ambientales",
    mfrModel: "AE-331",
    categoryPath: ["sensores-transmisores", "accesorios-sensores"],
    categorySlug: "accesorios-sensores",
    images: ["/cn-media/products/ems/ae-331.svg"],
    specs: {
      "Tipo de Accesorio": "Caja de Conexión y Base de Superficie",
      "Material / Construcción": "Plástico ABS Blanco Ignífugo UL94-V0",
      "Conexión a Proceso / Entrada": "Entrada de Cable Posterior / Lateral",
      "Compatibilidad": "Transmisores de Pared EMS Serie TS y ST",
      "Rango / Grado": "IP40 Uso Interior"
    },
    technicalDescription: "ACCESORIO PLÁSTICO EMS AE-331: Base de pared ergonómica para estética limpia en oficinas y laboratorios.",
    shortDescription: "Base de montaje plástico ABS blanco EMS AE-331 para sensores de pared."
  },
  {
    handle: "ems-ae-332-wall-mounting-accessory",
    title: "EMS AE-332 Kit de Montaje de Pared Estándar con Tacos y Tornillos Inox",
    mfrModel: "AE-332",
    categoryPath: ["sensores-transmisores", "accesorios-sensores"],
    categorySlug: "accesorios-sensores",
    images: ["/cn-media/products/ems/ae-332.svg"],
    specs: {
      "Tipo de Accesorio": "Kit de Fijación a Pared",
      "Material / Construcción": "Placa Adaptadora Policarbonato + Tornillos Inox",
      "Conexión a Proceso / Entrada": "Plantilla de Perforación Incluida",
      "Compatibilidad": "Todos los Equipos de Pared EMS",
      "Rango / Grado": "Grado Industrial"
    },
    technicalDescription: "KIT DE FIXACIÓN EMS AE-332: Facilita el anclaje seguro de los equipos en paredes de concreto, drywall o melamina.",
    shortDescription: "Kit de montaje mural EMS AE-332 con plantilla y accesorios inoxidables."
  },
  {
    handle: "ems-ae-333-duct-mounting-accessory",
    title: "EMS AE-333 Brida de Montaje Plástica de Fijación Ajustable para Ductos HVAC",
    mfrModel: "AE-333",
    categoryPath: ["sensores-transmisores", "accesorios-sensores"],
    categorySlug: "accesorios-sensores",
    images: ["/cn-media/products/ems/ae-333.svg"],
    specs: {
      "Tipo de Accesorio": "Brida Deslizante de Ajuste de Profundidad",
      "Material / Construcción": "Nylon 66 Reforzado con Fibra de Vidrio",
      "Conexión a Proceso / Entrada": "O-ring de Sellado de Neopreno",
      "Compatibilidad": "Sondas de Ducto Ø 12 mm a Ø 20 mm",
      "Rango / Grado": "Sellado Hermético contra Fugas de Aire"
    },
    technicalDescription: "BRIDA DE DUCTO EMS AE-333: Permite graduar con precisión la profundidad de inmersión de la sonda en el ducto.",
    shortDescription: "Brida plástica deslizable EMS AE-333 para regulación de profundidad de sondas de ducto."
  },
  {
    handle: "ems-ae-341-co2-wall-mounting",
    title: "EMS AE-341 Soporte Especial de Montaje Mural para Transmisores de CO₂",
    mfrModel: "AE-341",
    categoryPath: ["sensores-transmisores", "accesorios-sensores"],
    categorySlug: "accesorios-sensores",
    images: ["/cn-media/products/ems/ae-341.svg"],
    specs: {
      "Tipo de Accesorio": "Base de Espaciamiento Térmico y Flujo de Aire",
      "Material / Construcción": "ABS Antiestático con Ranuras de Convección Natural",
      "Conexión a Proceso / Entrada": "Montaje Snap-On Rápido",
      "Compatibilidad": "Transmisores CO₂ Serie KT-3XX y KT-4XX",
      "Rango / Grado": "Optimizado para Difusión de Gas"
    },
    technicalDescription: "SOPORTE ESPECIAL CO₂ EMS AE-341: Garantiza un flujo constante de aire a través de la cámara NDIR del sensor.",
    shortDescription: "Base especial de difusión para transmisores de CO₂ de pared EMS AE-341."
  },
  {
    handle: "ems-ae-342-co2-duct-mounting",
    title: "EMS AE-342 Kit de Muestreo de CO₂ para Ductos de Aire (Duct Sampling Kit)",
    mfrModel: "AE-342",
    categoryPath: ["sensores-transmisores", "accesorios-sensores"],
    categorySlug: "accesorios-sensores",
    images: ["/cn-media/products/ems/ae-342.svg"],
    specs: {
      "Tipo de Accesorio": "Kit de Muestreo Venturi por Presión Diferencial",
      "Material / Construcción": "Tubos Venturi de Aluminio y Cámara de Muestreo ABS",
      "Conexión a Proceso / Entrada": "Tubos Pitot para Conducto de Aire",
      "Compatibilidad": "Transmisores de CO₂ EMS KT-3X1 / KT-4X1",
      "Rango / Grado": "Apto para Velocidades de Aire 1 a 20 m/s"
    },
    technicalDescription: "KIT DE MUESTREO DE CO₂ DE DUCTO EMS AE-342: Aspira una muestra continua del flujo del ducto sin exponer el sensor a polvo directo.",
    shortDescription: "Kit de muestreo Venturi para medir CO₂ en ductos HVAC EMS AE-342."
  },
  {
    handle: "ems-ae-351-co2-wall-apparatus",
    title: "EMS AE-351 Cubierta Protectora Anti-Vandalismo para Sensores de CO₂ en Edificios Públicos",
    mfrModel: "AE-351",
    categoryPath: ["sensores-transmisores", "accesorios-sensores"],
    categorySlug: "accesorios-sensores",
    images: ["/cn-media/products/ems/ae-351.svg"],
    specs: {
      "Tipo de Accesorio": "Jaula de Protección Anti-Impacto",
      "Material / Construcción": "Policarbonato Transparente de Alto Impacto IK10",
      "Conexión a Proceso / Entrada": "Ranuras de Calibración Lateral",
      "Compatibilidad": "Transmisores de Pared EMS KT-4X1 y ST-4XX",
      "Rango / Grado": "Protección Mecánica IK10"
    },
    technicalDescription: "PROTECTOR ANTI-VANDALISMO EMS AE-351: Protege los sensores instalados en escuelas, gimnasios y pasillos públicos.",
    shortDescription: "Cubierta protectora de alto impacto IK10 EMS AE-351 para transmisores de pared."
  },
  {
    handle: "ems-ae-361-gas-wall-mounting",
    title: "EMS AE-361 Accesorio de Calibración y Montaje Mural para Sensores de Gases Industriales",
    mfrModel: "AE-361",
    categoryPath: ["sensores-transmisores", "accesorios-sensores"],
    categorySlug: "accesorios-sensores",
    images: ["/cn-media/products/ems/ae-361.svg"],
    specs: {
      "Tipo de Accesorio": "Base con Capucha de Calibración de Gas",
      "Material / Construcción": "Polímero Resistente a Químicos Corrosivos",
      "Conexión a Proceso / Entrada": "Puerto Barbed Ø 4 mm para Cilindro de Gas Patrón",
      "Compatibilidad": "Transmisores de Gas AT, ET, UT, CT, OT",
      "Rango / Grado": "Resistente a NH₃, SO₂ y solventes"
    },
    technicalDescription: "ACCESORIO DE CALIBRACIÓN DE GAS EMS AE-361: Permite inyectar gas de prueba para verificar la respuesta del sensor sin desmontarlo.",
    shortDescription: "Base con puerto de inyección de gas patrón EMS AE-361 para mantenimiento de sensores de gas."
  },
  {
    handle: "ems-ae-362-gas-duct-mounting",
    title: "EMS AE-362 Kit de Adaptación de Ducto para Sensores de Gases Tóxicos",
    mfrModel: "AE-362",
    categoryPath: ["sensores-transmisores", "accesorios-sensores"],
    categorySlug: "accesorios-sensores",
    images: ["/cn-media/products/ems/ae-362.svg"],
    specs: {
      "Tipo de Accesorio": "Cámara Estanca de Muestreo para Ducto",
      "Material / Construcción": "Cuerpo en Teflon (PTFE) y Tubos Inox",
      "Conexión a Proceso / Entrada": "Conexiones Rápidas Neumáticas IP66",
      "Compatibilidad": "Sensores de Amoniaco, CO y Etileno EMS",
      "Rango / Grado": "Grado Químico Corrosivo"
    },
    technicalDescription: "ADAPTADOR DE GAS DE DUCTO EMS AE-362: Permite monitorear gases peligrosos directamente en ductos de extracción química.",
    shortDescription: "Kit de adaptación de ducto de teflón EMS AE-362 para medición de gases tóxicos."
  },
  {
    handle: "ems-ae-501-502-ip65-socket-connection",
    title: "EMS AE-501 / AE-502 Set de Conectores Herméticos IP65 con Cable M12 Industrial",
    mfrModel: "AE-501 / AE-502",
    categoryPath: ["sensores-transmisores", "accesorios-sensores"],
    categorySlug: "accesorios-sensores",
    images: ["/cn-media/products/ems/ae-501.svg"],
    specs: {
      "Tipo de Accesorio": "Set de Conexión de Alimentación y Señal",
      "Material / Construcción": "Conector M12 Roscado con Prensaestopas IP67",
      "Conexión a Proceso / Entrada": "Cable Blindado PUR de 3m / 5m Incluido",
      "Compatibilidad": "Transmisores Industriales IP67 EMS",
      "Rango / Grado": "IP67 / Resistencia a Aceites y UV"
    },
    technicalDescription: "SET DE CONEXIÓN INDUSTRIAL EMS AE-501/502: Garantiza la hermeticidad de la instalación eléctrica en ambientes de lavado con manguera.",
    shortDescription: "Set de conectores rápidos M12 IP67 EMS AE-501/502 con cable industrial apantallado."
  },
  {
    handle: "ems-ae-311-threaded-thermowell",
    title: "EMS AE-311 Termopozo Roscado de Acero Inoxidable AISI 316L para Alta Presión",
    mfrModel: "AE-311",
    categoryPath: ["sensores-transmisores", "accesorios-sensores"],
    categorySlug: "accesorios-sensores",
    images: ["/cn-media/products/ems/ae-311.svg"],
    specs: {
      "Tipo de Accesorio": "Termopozo Mecanizado de Barra Maciza",
      "Material / Construcción": "Acero Inoxidable AISI 316L Barstock",
      "Conexión a Proceso / Entrada": "Rosca 1/2\" NPT Exterior / 1/2\" NPT Interior",
      "Compatibilidad": "Sondas Pt100 y Termopares Ø 6 mm EMS",
      "Rango / Grado": "Presión Nominal 250 bar / T° hasta 600 °C"
    },
    technicalDescription: "TERMOPOZO ROSCADO HEAVY-DUTY EMS AE-311: Protege la sonda de temperatura contra fluidos agresivos, altas presiones y velocidad de flujo.",
    shortDescription: "Termopozo inoxidable AISI 316L mecanizado EMS AE-311 para líneas de proceso bajo presión."
  },
  {
    handle: "ems-ae-601-12vdc-adapter",
    title: "EMS AE-601 Adaptador de Alimentación Regula de 220 VAC a 12 VDC / 24 VDC para Riel DIN",
    mfrModel: "AE-601",
    categoryPath: ["sensores-transmisores", "accesorios-sensores"],
    categorySlug: "accesorios-sensores",
    images: ["/cn-media/products/ems/ae-601.svg"],
    specs: {
      "Tipo de Accesorio": "Fuente de Alimentación de Conmutación de Riel DIN",
      "Material / Construcción": "Carcasa Plástica Riel DIN Slim Line",
      "Conexión a Proceso / Entrada": "Entrada 85-264 VAC / Salida 12-24 VDC 1.5A",
      "Compatibilidad": "Todos los Transmisores y Sensores EMS",
      "Rango / Grado": "Protección contra Cortocircuito y Sobrevoltaje"
    },
    technicalDescription: "FUENTE DE ALIMENTACIÓN RIEL DIN EMS AE-601: Suministra energía limpia y estabilizada a la red de transmisores de campo.",
    shortDescription: "Fuente de alimentación para riel DIN 24VDC EMS AE-601 para tableros de control."
  },
  {
    handle: "ems-ae-901-differential-pressure-filter",
    title: "EMS AE-901 / AE-902 / AE-903 Kit Completo de Sondas de Inserción y Filtros de Presión Diferencial",
    mfrModel: "AE-901 / AE-902 / AE-903",
    categoryPath: ["sensores-transmisores", "accesorios-sensores"],
    categorySlug: "accesorios-sensores",
    images: ["/cn-media/products/ems/ae-901.svg"],
    specs: {
      "Tipo de Accesorio": "Kit de Tomas de Presión y Filtros Anti-Polvo",
      "Material / Construcción": "Espigas de Latón Niquelado + Tubo Neumático de Silicona 2m",
      "Conexión a Proceso / Entrada": "Filtros Sintéticos Sinterizados Anti-Partículas",
      "Compatibilidad": "Transmisores y Switches de Presión Diferencial BD/BT EMS",
      "Rango / Grado": "Apto para Salas Limpias y Ductos HVAC"
    },
    technicalDescription: "KIT DE TOMAS Y FILTROS DE PRESIÓN EMS AE-901/902/903: Evita la entrada de polvo e impurezas a las cámaras piezoeléctricas del transmisor.",
    shortDescription: "Kit de tomas de presión con filtro sinterizado y manguera de silicona EMS AE-901/902/903."
  },

  // -------------------------------------------------------------
  // 8. Velocidad de Aire & OR-TAK Sensors (sensores-ambientales) - 7 prods
  // -------------------------------------------------------------
  {
    handle: "ems-ht-2xx-air-velocity-transmitter",
    title: "EMS HT-2XX Transmisor de Velocidad y Caudal de Aire para Ductos HVAC (0 a 10 m/s)",
    mfrModel: "HT-2XX",
    categoryPath: ["monitoreo-data-center", "sensores-ambientales"],
    categorySlug: "sensores-ambientales",
    images: ["/cn-media/products/ems/ht-2xx.svg"],
    specs: {
      "Variable / Función": "Velocidad de Flujo de Aire en Ducto",
      "Rango": "0 a 5 m/s / 0 a 10 m/s / 0 a 20 m/s (Seleccionable)",
      "Precisión / Resolución": "±0.2 m/s + 3% del valor medido",
      "Tipo de Medición": "Anemómetro Térmico de Hilo Caliente",
      "Compatibilidad": "Salida 0-10V / 4-20mA / Modbus RTU RS485",
      "Montaje": "Sonda de Penetración en Ducto con Brida"
    },
    technicalDescription: "TRANSMISOR DE VELOCIDAD DE AIRE EMS HT-2XX: Mide el flujo volumétrico y velocidad en conductos de aire acondicionado y extracción.",
    shortDescription: "Transmisor anemométrico térmico de flujo de aire EMS HT-2XX para control de caudal en HVAC."
  },
  {
    handle: "ems-sm-310-ortak-temp-humidity-rf-sensor",
    title: "EMS OR-TAK SM-310 Módulo Sensor Inalámbrico RF 433 MHz de Temperatura y Humedad",
    mfrModel: "SM-310 / SN-031",
    categoryPath: ["monitoreo-data-center", "sensores-ambientales"],
    categorySlug: "sensores-ambientales",
    images: ["/cn-media/products/ems/sm-310.svg"],
    specs: {
      "Variable / Función": "Temperatura y Humedad Relativa Inalámbrica",
      "Rango": "-40 °C a 85 °C / 0 a 100% HR",
      "Precisión / Resolución": "±0.3 °C / ±2% HR",
      "Tipo de Medición": "Sensor Digital RF 433 MHz para Sistema OR-TAK",
      "Compatibilidad": "Enlace Inalámbrico a Master OR-TAK MM-01X / MM-02X",
      "Montaje": "Superficie de Pared / Rack / Gabinete"
    },
    technicalDescription: "MÓDULO SENSOR OR-TAK SM-310: Sensor de largo alcance RF 433 MHz que integra datos de T y HR a la plataforma de monitoreo en la nube OR-TAK.",
    shortDescription: "Sensor inalámbrico RF 433 MHz T/HR EMS OR-TAK SM-310 para monitoreo continuo de almacenes y salas de servidores."
  },
  {
    handle: "ems-sm-320-ortak-temp-humidity-co2-rf-sensor",
    title: "EMS OR-TAK SM-320 Módulo Sensor Inalámbrico RF (T + HR + CO₂) para Plataforma OR-TAK",
    mfrModel: "SM-320 / SK-031",
    categoryPath: ["monitoreo-data-center", "sensores-ambientales"],
    categorySlug: "sensores-ambientales",
    images: ["/cn-media/products/ems/sm-320.svg"],
    specs: {
      "Variable / Función": "Temperatura + Humedad + Concentración de CO₂",
      "Rango": "-20 a 60 °C / 0-100% HR / 0-5000 ppm CO₂",
      "Precisión / Resolución": "±0.3 °C / ±2% HR / ±30 ppm CO₂",
      "Tipo de Medición": "Sensor NDIR + RF 433 MHz",
      "Compatibilidad": "Plataforma de Monitoreo e Históricos OR-TAK Cloud",
      "Montaje": "Pared con Soporte Magnético / Tornillo"
    },
    technicalDescription: "MÓDULO SENSOR MULTIVARIABLE OR-TAK SM-320: Reporta automáticamente lecturas ambientales a la aplicación móvil y web OR-TAK.",
    shortDescription: "Módulo sensor inalámbrico triple T/HR/CO₂ RF 433 MHz EMS OR-TAK SM-320."
  },
  {
    handle: "ems-wm-310-ortak-temperature-wifi-sensor",
    title: "EMS OR-TAK WM-310 Módulo Sensor Inalámbrico Wi-Fi de Temperatura Industrial",
    mfrModel: "WM-310 / TS-231",
    categoryPath: ["monitoreo-data-center", "sensores-ambientales"],
    categorySlug: "sensores-ambientales",
    images: ["/cn-media/products/ems/wm-310.svg"],
    specs: {
      "Variable / Función": "Temperatura Inalámbrica Wi-Fi Directa",
      "Rango": "-40 °C a 125 °C (Sonda Externa)",
      "Precisión / Resolución": "±0.2 °C",
      "Tipo de Medición": "Transmisión Directa Wi-Fi 802.11 b/g/n (No requiere Máster)",
      "Compatibilidad": "Plataforma Cloud OR-TAK y Alertas vía App Móvil",
      "Montaje": "Riel DIN / Superficie Pared"
    },
    technicalDescription: "SENSOR WI-FI DIRECTO OR-TAK WM-310: Se conecta directamente a la red Wi-Fi de la planta enviando alertas de temperatura por push/email.",
    shortDescription: "Sensor térmico industrial Wi-Fi EMS OR-TAK WM-310 con conexión directa a la nube."
  },
  {
    handle: "ems-wm-320-ortak-temp-humidity-wifi-sensor",
    title: "EMS OR-TAK WM-320 Módulo Sensor Inalámbrico Wi-Fi de Humedad y Temperatura",
    mfrModel: "WM-320",
    categoryPath: ["monitoreo-data-center", "sensores-ambientales"],
    categorySlug: "sensores-ambientales",
    images: ["/cn-media/products/ems/wm-320.svg"],
    specs: {
      "Variable / Función": "Temperatura y Humedad Relativa Wi-Fi",
      "Rango": "-30 a 70 °C / 0 a 100% HR",
      "Precisión / Resolución": "±0.3 °C / ±2% HR",
      "Tipo de Medición": "Conectividad Wi-Fi Estándar 2.4 GHz",
      "Compatibilidad": "Servidor OR-TAK / MQTT / Rest API",
      "Montaje": "Pared Interior / Cámara Frigorífica"
    },
    technicalDescription: "SENSOR WI-FI DUAL T+HR OR-TAK WM-320: Ideal para monitoreo de la cadena de frío en supermercados y laboratorios con red Wi-Fi instalada.",
    shortDescription: "Módulo sensor T/HR Wi-Fi EMS OR-TAK WM-320 para reporte en tiempo real sin gateway intermediario."
  },
  {
    handle: "ems-wm-410-ortak-temp-humidity-co2-wifi-sensor",
    title: "EMS OR-TAK WM-410 Módulo Sensor Triple Wi-Fi (T + HR + CO₂) con Almacenamiento Interno",
    mfrModel: "WM-410",
    categoryPath: ["monitoreo-data-center", "sensores-ambientales"],
    categorySlug: "sensores-ambientales",
    images: ["/cn-media/products/ems/wm-410.svg"],
    specs: {
      "Variable / Función": "Calidad de Aire Completa (T + HR + CO₂) Wi-Fi",
      "Rango": "-20 a 60 °C / 0-100% HR / 0-5000 ppm CO₂",
      "Precisión / Resolución": "±0.3 °C / ±2% HR / ±30 ppm NDIR",
      "Tipo de Medición": "Sensor Wi-Fi con Memoria Interna Offline",
      "Compatibilidad": "App Móvil OR-TAK (iOS / Android)",
      "Montaje": "Mural / Sobremesa"
    },
    technicalDescription: "SENSOR TRIPLE WI-FI OR-TAK WM-410: Guarda datos localmente durante caídas de red Wi-Fi y los sincroniza automáticamente al restablecerse.",
    shortDescription: "Módulo Wi-Fi de calidad de aire (T/HR/CO₂) EMS OR-TAK WM-410 con memoria offline de respaldo."
  },
  {
    handle: "ems-wm-510-ortak-temp-8ntc-wifi-sensor",
    title: "EMS OR-TAK WM-510 Módulo Wi-Fi Multicanal para 8 Sondas de Temperatura NTC",
    mfrModel: "WM-510",
    categoryPath: ["monitoreo-data-center", "sensores-ambientales"],
    categorySlug: "sensores-ambientales",
    images: ["/cn-media/products/ems/wm-510.svg"],
    specs: {
      "Variable / Función": "Monitoreo Térmico Multipunto (8 Canales de Temperatura)",
      "Rango": "-40 °C a 125 °C (En los 8 Canales)",
      "Precisión / Resolución": "±0.3 °C Por Canal",
      "Tipo de Medición": "8 Entradas Analógicas NTC10K + Transmisor Wi-Fi",
      "Compatibilidad": "Plataforma Web OR-TAK para Mapas Térmicos de Rack",
      "Montaje": "Riel DIN en Tablero de Monitoreo"
    },
    technicalDescription: "MÓDULO WI-FI 8 CANALES OR-TAK WM-510: Mide simultáneamente 8 puntos de temperatura en tableros eléctricos, racks o bancos de baterías.",
    shortDescription: "Concentrador Wi-Fi de 8 canales de temperatura NTC EMS OR-TAK WM-510 para monitoreo de racks y tableros."
  },

  // -------------------------------------------------------------
  // 9. Wireless / RF Masters (comunicacion-inalambrica) - 3 prods
  // -------------------------------------------------------------
  {
    handle: "ems-mt-010-wireless-analogue-master",
    title: "EMS MT-010 Módulo Máster Inalámbrico 433 MHz RF con 3 Salidas Analógicas (0-10V / 4-20mA)",
    mfrModel: "MT-010",
    categoryPath: ["comunicacion-industrial", "comunicacion-inalambrica"],
    categorySlug: "comunicacion-inalambrica",
    images: ["/cn-media/products/ems/mt-010.svg"],
    specs: {
      "Tecnología / Frecuencia": "RF 433 MHz Banda ISM Inalámbrica",
      "Interfaz hacia Red": "3x Salidas Analógicas Reconfigurables (0-10V / 4-20mA)",
      "Alcance": "Hasta 750m (Antena Corta) / 1.5 km (Antena de Alta Ganancia en Línea de Vista)",
      "Dispositivos / Topología": "Admite hasta 3 Sensores Inalámbricos EMS (TT-391, ST-391, KT-391)",
      "Alimentación": "24 VAC/VDC",
      "Protección": "Carcasa Riel DIN IP40"
    },
    technicalDescription: "MÓDULO MÁSTER ANALÓGICO EMS MT-010: Recibe señales de sensores inalámbricos 433 MHz y las retransmite como salidas analógicas a cualquier PLC existente.",
    shortDescription: "Módulo máster inalámbrico 433 MHz RF EMS MT-010 con 3 salidas analógicas 4-20mA/0-10V."
  },
  {
    handle: "ems-mt-016-wireless-modbus-master",
    title: "EMS MT-016 Módulo Máster Inalámbrico 433 MHz RF a Modbus RTU RS485 (Hasta 10 Sensores)",
    mfrModel: "MT-016",
    categoryPath: ["comunicacion-industrial", "comunicacion-inalambrica"],
    categorySlug: "comunicacion-inalambrica",
    images: ["/cn-media/products/ems/mt-016.svg"],
    specs: {
      "Tecnología / Frecuencia": "RF 433 MHz Propietario EMS Low-Power",
      "Interfaz hacia Red": "Puerto Serial RS485 Modbus RTU Esclavo",
      "Alcance": "Hasta 1.5 km en Espacio Abierto",
      "Dispositivos / Topología": "Soporta hasta 10 Sensores Inalámbricos de la Serie 391",
      "Alimentación": "24 VAC/VDC",
      "Protección": "Riel DIN Industrial"
    },
    technicalDescription: "MÓDULO MÁSTER MODBUS RF EMS MT-016: Concentra los datos de 10 sensores inalámbricos y los pone a disposición del PLC o SCADA vía RS485.",
    shortDescription: "Gateway/Máster inalámbrico 433 MHz a Modbus RTU RS485 EMS MT-016 para hasta 10 sensores."
  },
  {
    handle: "ems-km-390-sensor-kit",
    title: "EMS KM-390 Kit Inalámbrico Evaluador de Cobertura RF 433 MHz y Calidad de Enlace",
    mfrModel: "KM-390",
    categoryPath: ["comunicacion-industrial", "comunicacion-inalambrica"],
    categorySlug: "comunicacion-inalambrica",
    images: ["/cn-media/products/ems/km-390.svg"],
    specs: {
      "Tecnología / Frecuencia": "RF 433 MHz Analizador RSSI",
      "Interfaz hacia Red": "Display de Indicación de Nivel de Señal (dBm)",
      "Alcance": "Prueba de Cobertura en Planta hasta 1.5 km",
      "Dispositivos / Topología": "Kit Portátil Emisor/Receptor de Prueba",
      "Alimentación": "Baterías Integradas Recargables",
      "Protección": "Maletín de Transporte Rígido IP67"
    },
    technicalDescription: "KIT DE EVALUACIÓN RF EMS KM-390: Permite a los instaladores verificar la intensidad de señal RF en fábrica antes de fijar los sensores.",
    shortDescription: "Kit de pruebas de cobertura inalámbrica 433 MHz RF EMS KM-390 con maletín de campo."
  },

  // -------------------------------------------------------------
  // 10. Modbus Protection Card (interfaces-industriales) - 1 prod
  // -------------------------------------------------------------
  {
    handle: "ems-mk-261-modbus-protection-card",
    title: "EMS MK-261 Tarjeta de Protección y Aislamiento Galvánico para Redes RS485 Modbus RTU",
    mfrModel: "MK-261",
    categoryPath: ["comunicacion-industrial", "interfaces-industriales"],
    categorySlug: "interfaces-industriales",
    images: ["/cn-media/products/ems/mk-261.svg"],
    specs: {
      "Conversión": "Aislamiento Galvánico y Protección de Sobretensión RS485 a RS485",
      "Rol / Modo": "Repetidor / Protector de Bus Modbus RTU",
      "Puertos / Canales": "2x Puertos RS485 Aislados (Entrada / Salida)",
      "Alimentación": "24 VAC/VDC",
      "Aislamiento / Protección": "Aislamiento Optoelectrónico 2.5 kV + Supresor TVS 600W"
    },
    technicalDescription: "TARJETA DE PROTECCIÓN MODBUS EMS MK-261: Protege puertos seriales de PLC y gateways contra loops de tierra, picos de voltaje e interferencia electromagnética.",
    shortDescription: "Isolador galvánico y protector de bus RS485 Modbus RTU EMS MK-261 para montaje en riel DIN."
  },

  // -------------------------------------------------------------
  // 11. Termostatos / Control Devices (termostatos-industriales) - 24 prods
  // -------------------------------------------------------------
  // Pared (13 prods)
  {
    handle: "ems-tr-4xx-temperature-control-device",
    title: "EMS TR-4XX Controlador / Termostato Digital de Temperatura para Montaje en Pared (Relé 5A + Buzzer)",
    mfrModel: "TR-4XX",
    categoryPath: ["control-e-indicacion", "termostatos-industriales"],
    categorySlug: "termostatos-industriales",
    images: ["/cn-media/products/ems/tr-4xx.svg"],
    specs: {
      "Aplicación / Función": "Control de Temperatura ON/OFF con Histéresis Ajustable",
      "Sensor / Rango": "Sensor NTC / Pt1000 Integrado (-30 °C a 70 °C)",
      "Salidas": "1x Relé de Salida 250 VAC 5A (NO/NC)",
      "Funciones Especiales": "Display LCD + Alarma Sonora Buzzer Incorporada",
      "Alimentación": "24 VAC/VDC (Opción 220 VAC)",
      "Comunicación": "Modbus RTU RS485 (Opcional)"
    },
    technicalDescription: "CONTROLADOR DE TEMPERATURA DE PARED EMS TR-4XX: Dispositivo autónomo de control con pantalla LCD y salida de relé para activar calefactores o ventiladores.",
    shortDescription: "Termostato digital industrial de pared EMS TR-4XX con relé de control 5A y alarma auditiva."
  },
  {
    handle: "ems-nr-4xx-humidity-control-device",
    title: "EMS NR-4XX Controlador Digital de Humedad Relativa (Humidostato de Pared)",
    mfrModel: "NR-4XX",
    categoryPath: ["control-e-indicacion", "termostatos-industriales"],
    categorySlug: "termostatos-industriales",
    images: ["/cn-media/products/ems/nr-4xx.svg"],
    specs: {
      "Aplicación / Función": "Control de Humidificación / Deshumidificación ON/OFF",
      "Sensor / Rango": "Capacitivo de Alta Estabilidad (0 a 100% HR)",
      "Salidas": "1x Relé 250V 5A",
      "Funciones Especiales": "Setpoint y Banda Muerta Configurable",
      "Alimentación": "24 VAC/VDC",
      "Comunicación": "RS485 Modbus (Opcional)"
    },
    technicalDescription: "HUMIDOSTATO DIGITAL DE PARED EMS NR-4XX: Control directo de humidificadores o extractores en almacenes de papel, tabaco y alimentos.",
    shortDescription: "Controlador digital de humedad de pared EMS NR-4XX con pantalla LCD y salida de relé."
  },
  {
    handle: "ems-sr-4xx-temp-humidity-control-device",
    title: "EMS SR-4XX Controlador Digital Dual de Temperatura y Humedad de Pared (2 Relés)",
    mfrModel: "SR-4XX",
    categoryPath: ["control-e-indicacion", "termostatos-industriales"],
    categorySlug: "termostatos-industriales",
    images: ["/cn-media/products/ems/sr-4xx.svg"],
    specs: {
      "Aplicación / Función": "Control Combinado T + HR (Calefacción/Enfriamiento + Humidificación)",
      "Sensor / Rango": "-30 a 70 °C / 0 a 100% HR",
      "Salidas": "2x Relés Independientes 250V 5A (Uno por Variable)",
      "Funciones Especiales": "Display LCD 2 Líneas + Alarmas Configurables",
      "Alimentación": "24 VAC/VDC",
      "Comunicación": "Modbus RTU RS485"
    },
    technicalDescription: "CONTROLADOR DUAL T+HR EMS SR-4XX: Control independiente de temperatura y humedad desde un solo dispositivo compacto de pared.",
    shortDescription: "Controlador ambiental dual T/HR de pared EMS SR-4XX con 2 relés de conmutación."
  },
  {
    handle: "ems-kr-4x1-co2-control-device",
    title: "EMS KR-4X1 Controlador / Monitor de CO₂ con Relé de Activación de Ventilación",
    mfrModel: "KR-4X1",
    categoryPath: ["control-e-indicacion", "termostatos-industriales"],
    categorySlug: "termostatos-industriales",
    images: ["/cn-media/products/ems/kr-4x1.svg"],
    specs: {
      "Aplicación / Función": "Control de Ventilación por CO₂ (Ventilación a Demanda VAV)",
      "Sensor / Rango": "NDIR CO₂ (0 a 5.000 ppm)",
      "Salidas": "1x Relé 250V 5A para Encendido de Extractor",
      "Funciones Especiales": "Umbral de Alarma de CO₂ Configurable + Buzzer",
      "Alimentación": "24 VAC/VDC",
      "Comunicación": "Modbus RTU RS485"
    },
    technicalDescription: "CONTROLADOR DE CO₂ DE PARED EMS KR-4X1: Activa automáticamente extractores de aire fresco cuando el dióxido de carbono supera el umbral fijado.",
    shortDescription: "Controlador de CO₂ con relé de salida EMS KR-4X1 para ventilación inteligente a demanda."
  },
  {
    handle: "ems-kr-4x5-co2-control-device-high",
    title: "EMS KR-4X5 Controlador de CO₂ Rango Medio Industrial (Hasta 10,000 ppm)",
    mfrModel: "KR-4X5",
    categoryPath: ["control-e-indicacion", "termostatos-industriales"],
    categorySlug: "termostatos-industriales",
    images: ["/cn-media/products/ems/kr-4x5.svg"],
    specs: {
      "Aplicación / Función": "Control de CO₂ en Invernaderos y Plantas Industriales",
      "Sensor / Rango": "NDIR (0 a 10.000 ppm CO₂)",
      "Salidas": "1x Relé 250V 5A + Salida Analógica 0-10V",
      "Funciones Especiales": "Display LCD con Indicación Visual de Nivel",
      "Alimentación": "24 VAC/VDC",
      "Comunicación": "Modbus RTU"
    },
    technicalDescription: "CONTROLADOR DE CO₂ INDUSTRIAL EMS KR-4X5: Regula la inyección de CO₂ en cultivos protegidos para acelerar la fotosíntesis.",
    shortDescription: "Controlador de CO₂ hasta 10,000 ppm EMS KR-4X5 con relé y salida analógica."
  },
  {
    handle: "ems-kr-4x9-co2-control-device-xhigh",
    title: "EMS KR-4X9 Controlador de CO₂ Rango Elevado (Hasta 5% Vol.) para Procesos",
    mfrModel: "KR-4X9",
    categoryPath: ["control-e-indicacion", "termostatos-industriales"],
    categorySlug: "termostatos-industriales",
    images: ["/cn-media/products/ems/kr-4x9.svg"],
    specs: {
      "Aplicación / Función": "Control de CO₂ en Fermentación y Bio-Procesos",
      "Sensor / Rango": "NDIR Dual Beam (0 a 50.000 ppm / 5% CO₂)",
      "Salidas": "1x Relé 5A + Buzzer Alarma",
      "Funciones Especiales": "Protección de Envasado e Incubadoras",
      "Alimentación": "24 VAC/VDC",
      "Comunicación": "Modbus RTU RS485"
    },
    technicalDescription: "CONTROLADOR DE CO₂ DE PROCESO EMS KR-4X9: Permite automatizar electroválvulas en salas de maduración y tanques de fermentación.",
    shortDescription: "Controlador de CO₂ hasta 5% Vol. EMS KR-4X9 para bio-procesos e industrias alimentarias."
  },
  {
    handle: "ems-br-4x1-4x2-diff-pressure-control",
    title: "EMS BR-4X1 / 4X2 Controlador de Presión Diferencial para Salas Limpias (Relé 5A)",
    mfrModel: "BR-4X1 / 4X2",
    categoryPath: ["control-e-indicacion", "termostatos-industriales"],
    categorySlug: "termostatos-industriales",
    images: ["/cn-media/products/ems/br-4x1.svg"],
    specs: {
      "Aplicación / Función": "Control de Presurización en Aislamientos Médicos y Salas Blancas",
      "Sensor / Rango": "Piezoeléctrico Fino (±50 Pa / ±100 Pa / ±500 Pa)",
      "Salidas": "1x Relé de Conmutación 250V 5A",
      "Funciones Especiales": "Alarma Visual en LCD y Auditiva si se Pierde la Presión Positiva",
      "Alimentación": "24 VAC/VDC",
      "Comunicación": "Modbus RTU RS485"
    },
    technicalDescription: "CONTROLADOR DE PRESIÓN DIFERENCIAL EMS BR-4X1/4X2: Mantiene la presión positiva o negativa de salas aisladas activando damper de aire.",
    shortDescription: "Controlador de presión diferencial con relé de alarma EMS BR-4X1/4X2 para bioseguridad."
  },
  {
    handle: "ems-br-4x4-4x5-diff-pressure-control-high",
    title: "EMS BR-4X4 / 4X5 Controlador de Presión Diferencial Industrial (Hasta 10 kPa)",
    mfrModel: "BR-4X4 / 4X5",
    categoryPath: ["control-e-indicacion", "termostatos-industriales"],
    categorySlug: "termostatos-industriales",
    images: ["/cn-media/products/ems/br-4x4.svg"],
    specs: {
      "Aplicación / Función": "Control de Limpieza por Pulsos en Filtros Mangas y Ciclones",
      "Sensor / Rango": "Diferencial Industrial (±1.000 Pa a ±10.000 Pa)",
      "Salidas": "1x Relé 5A + Salida Modbus",
      "Funciones Especiales": "Temporizador Integrado para Sacudidor de Filtros",
      "Alimentación": "24 VAC/VDC",
      "Comunicación": "Modbus RTU"
    },
    technicalDescription: "CONTROLADOR DE ΔP INDUSTRIAL EMS BR-4X4/4X5: Activa ciclos de limpieza por soplado de aire en colectores de polvo.",
    shortDescription: "Controlador de presión diferencial industrial EMS BR-4X4/4X5 para colectores de mangas."
  },
  {
    handle: "ems-ar-4x1-ammonia-control-device",
    title: "EMS AR-4X1 Controlador de Amoniaco (NH₃) de Pared con Salida de Relé de Alarma",
    mfrModel: "AR-4X1",
    categoryPath: ["control-e-indicacion", "termostatos-industriales"],
    categorySlug: "termostatos-industriales",
    images: ["/cn-media/products/ems/ar-4x1.svg"],
    specs: {
      "Aplicación / Función": "Control de Fugas de Amoniaco y Activación de Extracción de Emergencia",
      "Sensor / Rango": "Electroquímico NH₃ (0 a 100 ppm)",
      "Salidas": "1x Relé 250V 5A + Buzzer 85dB",
      "Funciones Especiales": "Dos Umbrales de Alarma (Pre-Alarma y Alarma Crítica)",
      "Alimentación": "24 VAC/VDC",
      "Comunicación": "Modbus RTU RS485"
    },
    technicalDescription: "CONTROLADOR DE AMONIACO EMS AR-4X1: Dispara sirenas y extractores de emergencia al detectar fuga de gas NH₃.",
    shortDescription: "Controlador de NH₃ con relé y alarma auditiva EMS AR-4X1 para cuartos de compresores."
  },
  {
    handle: "ems-er-4x1-ethylene-control-device",
    title: "EMS ER-4X1 Controlador de Etileno (C₂H₄) para Automatización de Maduración",
    mfrModel: "ER-4X1",
    categoryPath: ["control-e-indicacion", "termostatos-industriales"],
    categorySlug: "termostatos-industriales",
    images: ["/cn-media/products/ems/er-4x1.svg"],
    specs: {
      "Aplicación / Función": "Control de Inyección de Etileno en Cámaras de Maduración",
      "Sensor / Rango": "Electroquímico C₂H₄ (0 a 100 ppm)",
      "Salidas": "1x Relé 5A + Salida Proporcional Modbus",
      "Funciones Especiales": "Display LCD con Lectura Continua",
      "Alimentación": "24 VAC/VDC",
      "Comunicación": "Modbus RTU RS485"
    },
    technicalDescription: "CONTROLADOR DE ETILENO EMS ER-4X1: Controla la apertura de válvulas generadoras de etileno para dosificación exacta.",
    shortDescription: "Controlador digital de etileno EMS ER-4X1 para dosificación automática en maduraderos."
  },
  {
    handle: "ems-ur-4x1-so2-control-device",
    title: "EMS UR-4X1 Controlador de Dióxido de Azufre (SO₂) con Alarma y Relé",
    mfrModel: "UR-4X1",
    categoryPath: ["control-e-indicacion", "termostatos-industriales"],
    categorySlug: "termostatos-industriales",
    images: ["/cn-media/products/ems/ur-4x1.svg"],
    specs: {
      "Aplicación / Función": "Control y Protección contra SO₂ en Fundiciones y Enología",
      "Sensor / Rango": "Electroquímico SO₂ (0 a 50 ppm)",
      "Salidas": "1x Relé 250V 5A + Alarma Auditiva",
      "Funciones Especiales": "Display LCD 2 Líneas",
      "Alimentación": "24 VAC/VDC",
      "Comunicación": "Modbus RTU"
    },
    technicalDescription: "CONTROLADOR DE SO₂ EMS UR-4X1: Monitoreo con relé de seguridad para cortes automáticos de proceso por gas tóxico.",
    shortDescription: "Controlador de SO₂ con relé de corte EMS UR-4X1 para seguridad industrial."
  },
  {
    handle: "ems-cr-4x1-co-control-device",
    title: "EMS CR-4X1 Controlador de Monóxido de Carbono (CO) para Ventilación de Parkings",
    mfrModel: "CR-4X1",
    categoryPath: ["control-e-indicacion", "termostatos-industriales"],
    categorySlug: "termostatos-industriales",
    images: ["/cn-media/products/ems/cr-4x1.svg"],
    specs: {
      "Aplicación / Función": "Control Directo de Jet Fans / Extractores de Cocheras",
      "Sensor / Rango": "Electroquímico CO (0 a 300 ppm)",
      "Salidas": "1x Relé 250V 5A",
      "Funciones Especiales": "Retardo de Desconexión Configurable (Timer)",
      "Alimentación": "24 VAC/VDC",
      "Comunicación": "Modbus RTU RS485"
    },
    technicalDescription: "CONTROLADOR DE CO EMS CR-4X1: Comanda la ventilación forzada en sótanos cumpliendo normativas ambientales urbanas.",
    shortDescription: "Controlador de monóxido de carbono EMS CR-4X1 con salida de relé para ventilación de cocheras."
  },
  {
    handle: "ems-or-4x1-o2-control-device",
    title: "EMS OR-4X1 Controlador de Oxígeno (O₂) para Alertas de Deficiencia de Aire",
    mfrModel: "OR-4X1",
    categoryPath: ["control-e-indicacion", "termostatos-industriales"],
    categorySlug: "termostatos-industriales",
    images: ["/cn-media/products/ems/or-4x1.svg"],
    specs: {
      "Aplicación / Función": "Seguridad por Deficiencia / Enriquecimiento de O₂",
      "Sensor / Rango": "Celda de O₂ (0 a 25% Vol.)",
      "Salidas": "1x Relé 5A + Buzzer 85dB",
      "Funciones Especiales": "Display LCD con Valor Porcentual",
      "Alimentación": "24 VAC/VDC",
      "Comunicación": "Modbus RTU RS485"
    },
    technicalDescription: "CONTROLADOR DE OXÍGENO EMS OR-4X1: Activa la ventilación forzada si el porcentaje de O₂ cae por debajo del 19.5%.",
    shortDescription: "Controlador de O₂ de pared EMS OR-4X1 con relé de alarma para bioseguridad."
  },

  // Panel (11 prods)
  {
    handle: "ems-tr-711-panel-temperature-control",
    title: "EMS TR-711 / TR-713 Controlador de Temperatura Digital de Panel (48x48 mm DIN)",
    mfrModel: "TR-711 / TR-713",
    categoryPath: ["control-e-indicacion", "termostatos-industriales"],
    categorySlug: "termostatos-industriales",
    images: ["/cn-media/products/ems/tr-711.svg"],
    specs: {
      "Aplicación / Función": "Control de Temperatura ON/OFF de Panel 1/16 DIN",
      "Sensor / Rango": "Entrada Pt100 / NTC / Termopar (-50 a 300 °C)",
      "Salidas": "1x Relé 10A + 1x SSR Drive (Seleccionable)",
      "Funciones Especiales": "Montaje en Tablero con Display Rojo de 4 Dígitos",
      "Alimentación": "220 VAC / 24 VDC",
      "Comunicación": "Modbus RTU (Opcional)"
    },
    technicalDescription: "CONTROLADOR DE PANEL EMS TR-711: Formato estándar 48x48 mm para instalación en tableros de control de hornos y estufas.",
    shortDescription: "Controlador digital de temperatura de panel 48x48mm EMS TR-711."
  },
  {
    handle: "ems-nr-711-panel-humidity-control",
    title: "EMS NR-711 Controlador Digital de Humedad Relativa para Montaje en Tablero",
    mfrModel: "NR-711",
    categoryPath: ["control-e-indicacion", "termostatos-industriales"],
    categorySlug: "termostatos-industriales",
    images: ["/cn-media/products/ems/nr-711.svg"],
    specs: {
      "Aplicación / Función": "Control de Humedad de Panel para Tableros HVAC",
      "Sensor / Rango": "Sonda Externa NTC/Capacitiva (0 a 100% HR)",
      "Salidas": "1x Relé 10A (250 VAC)",
      "Funciones Especiales": "Display LED Rojo de Gran Visibilidad",
      "Alimentación": "220 VAC / 24 VDC",
      "Comunicación": "RS485 Modbus RTU"
    },
    technicalDescription: "HUMIDOSTATO DE TABLERO EMS NR-711: Diseñado para integrar el control de humedad dentro de tableros eléctricos principales.",
    shortDescription: "Controlador de humedad para montaje en panel 48x48mm EMS NR-711."
  },
  {
    handle: "ems-sr-711-panel-temp-humidity-control",
    title: "EMS SR-711 Controlador Dual de Temperatura y Humedad para Panel Industrial",
    mfrModel: "SR-711",
    categoryPath: ["control-e-indicacion", "termostatos-industriales"],
    categorySlug: "termostatos-industriales",
    images: ["/cn-media/products/ems/sr-711.svg"],
    specs: {
      "Aplicación / Función": "Control Dual T + HR de Tablero con Doble Pantalla",
      "Sensor / Rango": "-40 a 80 °C / 0 a 100% HR",
      "Salidas": "2x Relés Independientes 10A",
      "Funciones Especiales": "Doble Display LED (Rojo para T / Verde para HR)",
      "Alimentación": "220 VAC / 24 VDC",
      "Comunicación": "Modbus RTU RS485"
    },
    technicalDescription: "CONTROLADOR DUAL DE TABLERO EMS SR-711: Muestra simultáneamente temperatura y humedad en doble pantalla LED.",
    shortDescription: "Controlador dual T/HR de panel 48x48mm EMS SR-711 con doble display."
  },
  {
    handle: "ems-kr-711-panel-co2-control",
    title: "EMS KR-711 Controlador de CO₂ NDIR de Panel para Tableros de Climatización",
    mfrModel: "KR-711",
    categoryPath: ["control-e-indicacion", "termostatos-industriales"],
    categorySlug: "termostatos-industriales",
    images: ["/cn-media/products/ems/kr-711.svg"],
    specs: {
      "Aplicación / Función": "Control de CO₂ en Tablero Principal",
      "Sensor / Rango": "Sonda Externa / Interna NDIR (0-5000 ppm)",
      "Salidas": "1x Relé 10A + Salida Relevo Alarma",
      "Funciones Especiales": "Display Digital 4 Dígitos + Alarma Auditiva",
      "Alimentación": "220 VAC / 24 VDC",
      "Comunicación": "Modbus RTU RS485"
    },
    technicalDescription: "CONTROLADOR DE CO₂ DE TABLERO EMS KR-711: Permite centralizar la automatización de la ventilación en el tablero de control.",
    shortDescription: "Controlador de CO₂ para panel de control EMS KR-711."
  },
  {
    handle: "ems-kr-715-panel-co2-control-mid",
    title: "EMS KR-715 Controlador de CO₂ de Panel Rango 10,000 ppm",
    mfrModel: "KR-715",
    categoryPath: ["control-e-indicacion", "termostatos-industriales"],
    categorySlug: "termostatos-industriales",
    images: ["/cn-media/products/ems/kr-715.svg"],
    specs: {
      "Aplicación / Función": "Control de CO₂ de Tablero para Invernaderos",
      "Sensor / Rango": "NDIR (0-10.000 ppm CO₂)",
      "Salidas": "1x Relé 10A + Salida Analógica 4-20mA",
      "Funciones Especiales": "Display LED 4 Dígitos",
      "Alimentación": "220 VAC / 24 VDC",
      "Comunicación": "Modbus RTU"
    },
    technicalDescription: "CONTROLADOR DE CO₂ DE TABLERO EMS KR-715: Especialmente adaptado para sistemas automáticos de fertilización carbónica.",
    shortDescription: "Controlador de CO₂ de panel hasta 10,000 ppm EMS KR-715."
  },
  {
    handle: "ems-kr-719-panel-co2-control-high",
    title: "EMS KR-719 Controlador de CO₂ de Panel Rango Alto (Hasta 5% Vol. CO₂)",
    mfrModel: "KR-719",
    categoryPath: ["control-e-indicacion", "termostatos-industriales"],
    categorySlug: "termostatos-industriales",
    images: ["/cn-media/products/ems/kr-719.svg"],
    specs: {
      "Aplicación / Función": "Control de CO₂ Industrial en Tableros de Fermentación",
      "Sensor / Rango": "NDIR Industrial (0 a 50.000 ppm / 5%)",
      "Salidas": "1x Relé 10A + 1x SSR Drive",
      "Funciones Especiales": "Display LED Rojo Alta Intensidad",
      "Alimentación": "220 VAC / 24 VDC",
      "Comunicación": "Modbus RTU RS485"
    },
    technicalDescription: "CONTROLADOR DE CO₂ RANGO ALTO DE PANEL EMS KR-719: Para integración en tableros de control de embotelladoras y bodegas.",
    shortDescription: "Controlador de CO₂ de panel hasta 5% CO₂ EMS KR-719."
  },
  {
    handle: "ems-kr-751-panel-temp-humidity-co2-control",
    title: "EMS KR-751 / KR-752 Controlador Triple de Panel (T + HR + CO₂) con 3 Relés",
    mfrModel: "KR-751 / KR-752",
    categoryPath: ["control-e-indicacion", "termostatos-industriales"],
    categorySlug: "termostatos-industriales",
    images: ["/cn-media/products/ems/kr-751.svg"],
    specs: {
      "Aplicación / Función": "Estación de Control Ambiental Completa de Tablero (3 Variables)",
      "Sensor / Rango": "T / HR / CO₂ Combinado",
      "Salidas": "3x Relés Independientes (Uno por cada variable)",
      "Funciones Especiales": "Display LCD Matricial con Secuencia de Lectura",
      "Alimentación": "220 VAC / 24 VDC",
      "Comunicación": "Modbus RTU RS485 completo"
    },
    technicalDescription: "CONTROLADOR TRIPLE DE TABLERO EMS KR-751/752: Controla simultáneamente temperatura, humedad y ventilación por CO₂.",
    shortDescription: "Controlador ambiental triple (T/HR/CO₂) de panel con 3 relés EMS KR-751/752."
  },
  {
    handle: "ems-ar-711-panel-ammonia-control",
    title: "EMS AR-711 Controlador de Amoniaco (NH₃) de Panel para Tableros Frigoríficos",
    mfrModel: "AR-711",
    categoryPath: ["control-e-indicacion", "termostatos-industriales"],
    categorySlug: "termostatos-industriales",
    images: ["/cn-media/products/ems/ar-711.svg"],
    specs: {
      "Aplicación / Función": "Monitoreo y Alarma de NH₃ en Tablero Principal",
      "Sensor / Rango": "Sonda Electroquímica Externa (0-100 ppm)",
      "Salidas": "1x Relé 10A + Salida Buzzer",
      "Funciones Especiales": "Display LED Rojo de 4 Dígitos",
      "Alimentación": "220 VAC / 24 VDC",
      "Comunicación": "Modbus RTU RS485"
    },
    technicalDescription: "CONTROLADOR DE NH₃ DE TABLERO EMS AR-711: Integración directa en tableros de salas de máquinas frigoríficas.",
    shortDescription: "Controlador de amoniaco para montaje en panel 48x48mm EMS AR-711."
  },
  {
    handle: "ems-er-711-panel-ethylene-control",
    title: "EMS ER-711 Controlador de Etileno (C₂H₄) de Panel para Tableros de Maduración",
    mfrModel: "ER-711",
    categoryPath: ["control-e-indicacion", "termostatos-industriales"],
    categorySlug: "termostatos-industriales",
    images: ["/cn-media/products/ems/er-711.svg"],
    specs: {
      "Aplicación / Función": "Automatización de Etileno desde Tablero Central",
      "Sensor / Rango": "Electroquímico C₂H₄ (0-100 ppm)",
      "Salidas": "1x Relé 10A + 4-20mA",
      "Funciones Especiales": "Display LED Digital",
      "Alimentación": "220 VAC / 24 VDC",
      "Comunicación": "Modbus RTU"
    },
    technicalDescription: "CONTROLADOR DE C₂H₄ DE TABLERO EMS ER-711: Centraliza la dosificación de etileno en plantas agroexportadoras.",
    shortDescription: "Controlador de etileno para panel de control EMS ER-711."
  },
  {
    handle: "ems-ur-711-panel-so2-control",
    title: "EMS UR-711 Controlador de SO₂ de Panel para Tableros de Proceso Químico",
    mfrModel: "UR-711",
    categoryPath: ["control-e-indicacion", "termostatos-industriales"],
    categorySlug: "termostatos-industriales",
    images: ["/cn-media/products/ems/ur-711.svg"],
    specs: {
      "Aplicación / Función": "Control de SO₂ de Tablero en Plantas Químicas",
      "Sensor / Rango": "Sonda Electroquímica SO₂ (0-50 ppm)",
      "Salidas": "1x Relé 10A",
      "Funciones Especiales": "Display Digital LED",
      "Alimentación": "220 VAC / 24 VDC",
      "Comunicación": "Modbus RTU RS485"
    },
    technicalDescription: "CONTROLADOR DE SO₂ DE TABLERO EMS UR-711: Para supervisión centralizada en paneles de control industrial.",
    shortDescription: "Controlador de dióxido de azufre para panel EMS UR-711."
  },
  {
    handle: "ems-cr-711-panel-co-control",
    title: "EMS CR-711 Controlador de Monóxido de Carbono (CO) de Panel para Centrales de Extracción",
    mfrModel: "CR-711",
    categoryPath: ["control-e-indicacion", "termostatos-industriales"],
    categorySlug: "termostatos-industriales",
    images: ["/cn-media/products/ems/cr-711.svg"],
    specs: {
      "Aplicación / Función": "Centralización de Alarma de CO en Tablero de Garajes",
      "Sensor / Rango": "Sonda CO Electroquímica (0-300 ppm)",
      "Salidas": "1x Relé 10A Heavy-Duty",
      "Funciones Especiales": "Display LED 4 Dígitos + Alarma",
      "Alimentación": "220 VAC / 24 VDC",
      "Comunicación": "Modbus RTU"
    },
    technicalDescription: "CONTROLADOR DE CO DE TABLERO EMS CR-711: Diseñado para montaje en la puerta de tableros de automatización de estacionamientos.",
    shortDescription: "Controlador de CO para montaje en panel de tablero EMS CR-711."
  },
  {
    handle: "ems-or-711-panel-o2-control",
    title: "EMS OR-711 Controlador de Oxígeno (O₂) de Panel para Tableros de Seguridad",
    mfrModel: "OR-711",
    categoryPath: ["control-e-indicacion", "termostatos-industriales"],
    categorySlug: "termostatos-industriales",
    images: ["/cn-media/products/ems/or-711.svg"],
    specs: {
      "Aplicación / Función": "Monitoreo Porcentual de O₂ de Tablero",
      "Sensor / Rango": "Sonda O₂ (0 a 25% Vol.)",
      "Salidas": "1x Relé 10A",
      "Funciones Especiales": "Display LED 4 Dígitos",
      "Alimentación": "220 VAC / 24 VDC",
      "Comunicación": "Modbus RTU RS485"
    },
    technicalDescription: "CONTROLADOR DE O₂ DE TABLERO EMS OR-711: Monitoreo in situ en tableros de bioseguridad y criogenia.",
    shortDescription: "Controlador de O₂ para panel de control EMS OR-711."
  },

  // -------------------------------------------------------------
  // 12. OR-TAK Masters & Loadcell (unidades-monitoreo) - 5 prods
  // -------------------------------------------------------------
  {
    handle: "ems-mm-010-ortak-large-master-gsm",
    title: "EMS OR-TAK MM-010 Máster Principal GSM / 4G con Enlace Inalámbrico 433 MHz RF",
    mfrModel: "MM-010 / M-010",
    categoryPath: ["monitoreo-data-center", "unidades-monitoreo"],
    categorySlug: "unidades-monitoreo",
    images: ["/cn-media/products/ems/mm-010.svg"],
    specs: {
      "Puertos de Sensores / E/S": "Receptor Inalámbrico RF 433 MHz (Hasta 50 Sensores OR-TAK)",
      "Capacidad / Expansión": "Módem Celular GSM / 4G LTE Integrado con SIM Card",
      "Red y Protocolos": "Transmisión Segura SSL/TLS a la Nube OR-TAK Cloud",
      "Alarmas / Notificaciones": "Notificaciones Push en App Móvil, SMS y Correo Electrónico",
      "Montaje": "Gabinete Industrial NEMA 4X / IP65 con Batería de Respaldo"
    },
    technicalDescription: "MÁSTER PRINCIPAL GSM OR-TAK MM-010: Unidad central autónoma que recolecta datos inalámbricos de plantas y los envía a la nube vía celular.",
    shortDescription: "Gateway Máster GSM 4G OR-TAK MM-010 para monitoreo remoto inalámbrico de plantas industriales."
  },
  {
    handle: "ems-mm-011-ortak-large-master-gsm-phase",
    title: "EMS OR-TAK MM-011 Máster GSM con Analizador de Fase Eléctrica Incorporado",
    mfrModel: "MM-011",
    categoryPath: ["monitoreo-data-center", "unidades-monitoreo"],
    categorySlug: "unidades-monitoreo",
    images: ["/cn-media/products/ems/mm-011.svg"],
    specs: {
      "Puertos de Sensores / E/S": "RF 433 MHz + 3 Entradas de Voltaje / Corriente de Fase",
      "Capacidad / Expansión": "GSM 4G + Monitoreo Trifásico de Red Eléctrica",
      "Red y Protocolos": "Conectividad Cloud OR-TAK + Modbus TCP/IP",
      "Alarmas / Notificaciones": "Alertas por Falla de Fase, Sobretensión y Alarma Ambiental",
      "Montaje": "Montaje en Tablero Eléctrico Riel DIN"
    },
    technicalDescription: "MÁSTER GSM CON ANÁLISIS DE FASE OR-TAK MM-011: Monitorea simultáneamente la salud ambiental y la calidad de la energía eléctrica.",
    shortDescription: "Gateway Máster GSM 4G con análisis de fase eléctrica EMS OR-TAK MM-011."
  },
  {
    handle: "ems-mm-012-ortak-large-master-wifi",
    title: "EMS OR-TAK MM-012 Máster Principal Wi-Fi / Ethernet con Receptor RF 433 MHz",
    mfrModel: "MM-012",
    categoryPath: ["monitoreo-data-center", "unidades-monitoreo"],
    categorySlug: "unidades-monitoreo",
    images: ["/cn-media/products/ems/mm-012.svg"],
    specs: {
      "Puertos de Sensores / E/S": "Receptor RF 433 MHz + Puerto Ethernet RJ45",
      "Capacidad / Expansión": "Wi-Fi 802.11 b/g/n + Ethernet LAN",
      "Red y Protocolos": "MQTT / HTTP / Modbus TCP / OR-TAK Cloud",
      "Alarmas / Notificaciones": "App Móvil, Dashboard Web y Servidor Local",
      "Montaje": "Superficie de Pared / Gabinete IP65"
    },
    technicalDescription: "MÁSTER WI-FI / ETHERNET OR-TAK MM-012: Conecta los sensores inalámbricos a la red corporativa mediante Wi-Fi o cable Ethernet.",
    shortDescription: "Gateway Máster Wi-Fi/Ethernet EMS OR-TAK MM-012 para centrales de monitoreo."
  },
  {
    handle: "ems-mm-02x-ortak-small-master",
    title: "EMS OR-TAK MM-02X Módulo Máster Compacto GSM / Wi-Fi con Sensor T/HR Integrado",
    mfrModel: "MM-02X",
    categoryPath: ["monitoreo-data-center", "unidades-monitoreo"],
    categorySlug: "unidades-monitoreo",
    images: ["/cn-media/products/ems/mm-02x.svg"],
    specs: {
      "Puertos de Sensores / E/S": "RF 433 MHz (Hasta 10 Sensores) + Sensor Interno T/HR",
      "Capacidad / Expansión": "Opción Celular GSM / Wi-Fi Compacto",
      "Red y Protocolos": "OR-TAK Cloud IoT Protocol",
      "Alarmas / Notificaciones": "Alertas SMS y Push en Smartphone",
      "Montaje": "Wall Mount de Tamaño Reducido"
    },
    technicalDescription: "MÁSTER COMPACTO OR-TAK MM-02X: Solución económica para pequeños comercios, farmacias y cámaras frigoríficas individuales.",
    shortDescription: "Máster compacto GSM/Wi-Fi EMS OR-TAK MM-02X para monitoreo de instalaciones medianas."
  },
  {
    handle: "ems-sm-420-loadcell-tracking-module",
    title: "EMS OR-TAK SM-420 Módulo Inalámbrico de Integración de Celdas de Carga y Balanzas (RS-232)",
    mfrModel: "SM-420 / SS-085",
    categoryPath: ["monitoreo-data-center", "unidades-monitoreo"],
    categorySlug: "unidades-monitoreo",
    images: ["/cn-media/products/ems/sm-420.svg"],
    specs: {
      "Puertos de Sensores / E/S": "Puerto Serial RS-232 para Indicadores de Pesaje",
      "Capacidad / Expansión": "Transmisión Inalámbrica RF 433 MHz del Peso a OR-TAK",
      "Red y Protocolos": "Integración de Balanzas en Plataforma Cloud",
      "Alarmas / Notificaciones": "Alertas de Nivel Mínimo de Silos y Tanques de Pesaje",
      "Montaje": "Gabinete ABS Resistente"
    },
    technicalDescription: "MÓDULO DE INTEGRACIÓN DE PESO OR-TAK SM-420: Lee el valor de peso de cualquier indicador serial RS-232 y lo transmite al sistema de inventario.",
    shortDescription: "Módulo inalámbrico para celdas de carga y balanzas EMS OR-TAK SM-420."
  },

  // -------------------------------------------------------------
  // 13. OR-TAK Water Consumption (monitoreo-energia) - 1 prod
  // -------------------------------------------------------------
  {
    handle: "ems-sm-410-water-consumption-module",
    title: "EMS OR-TAK SM-410 Módulo Inalámbrico Emisor de Pulsos para Medidores de Agua",
    mfrModel: "SM-410 / ST-070",
    categoryPath: ["monitoreo-data-center", "monitoreo-energia"],
    categorySlug: "monitoreo-energia",
    images: ["/cn-media/products/ems/sm-410.svg"],
    specs: {
      "Tipo / Alcance": "Módulo Transmisor de Pulsos de Contadores de Agua",
      "Fase": "N/A (Entrada Digital Reed Switch / Pulso Lógica)",
      "Tensión / Corriente": "Alimentación por Batería Interna (Autonomía 5 Años)",
      "Variables Medidas": "Volumen de Consumo de Agua (m³) y Caudal Instantáneo",
      "Circuitos / Capacidad": "2x Entradas de Contadores de Agua por Pulsos",
      "Comunicación": "Transmisión RF 433 MHz a Master OR-TAK / Cloud"
    },
    technicalDescription: "MÓDULO DE CONSUMO DE AGUA OR-TAK SM-410: Digitaliza contadores mecánicos de agua e integra el consumo de agua al tablero energético.",
    shortDescription: "Módulo emisor de pulsos de agua inalámbrico 433 MHz EMS OR-TAK SM-410 para telemetría de agua."
  }
];

console.log(`Prepared ${emsProducts.length} EMS product entries.`);

// Map EMS products to standard schema structure and assign IDs
const enrichedEmsProducts = emsProducts.map(p => {
  const ids = getNextId();
  return {
    handle: p.handle,
    wcId: ids.wcId,
    title: p.title,
    brand: "EMS Kontrol",
    itemNumber: ids.itemNumber,
    mfrModel: p.mfrModel,
    priceMode: "quote",
    price: 0,
    currency: "PEN",
    categoryPath: p.categoryPath,
    categorySlug: p.categorySlug,
    images: p.images,
    inStock: true,
    isPurchasable: true,
    specs: p.specs,
    technicalDescription: p.technicalDescription,
    shortDescription: p.shortDescription
  };
});

// Append new products to nonEMS list
const updatedProducts = [...nonEmsProducts, ...enrichedEmsProducts];
fs.writeFileSync(PRODUCTS_PATH, JSON.stringify(updatedProducts, null, 2), 'utf8');
console.log(`Updated products.json successfully. Total products now: ${updatedProducts.length}`);

// Count products per category slug in updatedProducts
const counts = {};
updatedProducts.forEach(p => {
  counts[p.categorySlug] = (counts[p.categorySlug] || 0) + 1;
});

// Update taxonomy.ts Labels and productCounts
let taxonomyContent = fs.readFileSync(TAXONOMY_PATH, 'utf8');

// Update labels for the 7 specified L2 categories in taxonomy.ts string
const labelReplacements = [
  {
    target: `name: "Presión y Melt Pressure", description: "Transductores y transmisores de presión de fusión (Melt Pressure) para extrusión."`,
    replacement: `name: "Presión, Presión Diferencial y Melt Pressure", description: "Transmisores de presión diferencial de baja presión HVAC, salas limpias y transductores de fusión (Melt Pressure)."`
  },
  {
    target: `name: "Sensores de Nivel", description: "Transmisores de nivel hidrostáticos sumergibles (WL320, WL420) y ultrasónicos (TL400)."`,
    replacement: `name: "Sensores de Nivel y Proximidad", description: "Transmisores de nivel hidrostáticos, ultrasónicos y sensores capacitivos de proximidad M18/M30."`
  },
  {
    target: `name: "Gateways Inalámbricos / LoRa", description: "Gateways inalámbricos IEEE 802.15.4 y sistemas LoRa de largo alcance."`,
    replacement: `name: "Gateways y Enlaces Inalámbricos / LoRa / RF", description: "Gateways inalámbricos IEEE 802.15.4, sistemas LoRa y módulos máster 433 MHz RF."`
  },
  {
    target: `name: "Gateways y Convertidores de Protocolo", description: "Convertidores Modbus a PROFIBUS DP, USB a RS485 e interfaces IO-Link Master."`,
    replacement: `name: "Gateways, Convertidores e Interfaces Industriales", description: "Convertidores Modbus a PROFIBUS DP, aisladores galvánicos RS485 e interfaces IO-Link Master."`
  },
  {
    target: `name: "Monitoreo de Energía y PUE", description: "Medidores en línea ILPM 16A/32A, powerProbeX+ y sensores de energía para racks."`,
    replacement: `name: "Monitoreo de Energía, PUE y Consumos", description: "Medidores en línea ILPM 16A/32A, powerProbeX+, sensores de energía y contadores de agua."`
  },
  {
    target: `name: "Unidades y Plataformas de Monitoreo", description: "Bases sensorProbe1+, SP2+, SPX+ y securityProbe5ESV con conectividad SNMP/Modbus."`,
    replacement: `name: "Unidades, Plataformas y Módulos de Monitoreo", description: "Bases sensorProbe1+, SP2+, gateways máster OR-TAK GSM/Wi-Fi y módulos de pesaje."`
  },
  {
    target: `name: "Gases y CO₂", description: "Transmisores NDIR de dióxido de carbono y calidad de aire."`,
    replacement: `name: "Gases Industriales y CO₂", description: "Transmisores NDIR de CO₂ y detectores electroquímicos de NH₃, C₂H₄, SO₂, CO y O₂ (fijos, portátiles y wireless)."`
  }
];

labelReplacements.forEach(({ target, replacement }) => {
  if (taxonomyContent.includes(target)) {
    taxonomyContent = taxonomyContent.replace(target, replacement);
    console.log(`Replaced label for taxonomy node.`);
  }
});

// Update productCounts in taxonomy.ts for L2 nodes
Object.keys(counts).forEach(slug => {
  const count = counts[slug];
  // Regex to match { slug: "slug", name: "...", ... productCount: \d+ }
  const regex = new RegExp(`(\\{[^\\}]*slug:\\s*"${slug}"[^\\}]*productCount:\\s*)(\\d+)`, 'g');
  if (regex.test(taxonomyContent)) {
    taxonomyContent = taxonomyContent.replace(regex, `$1${count}`);
  }
});

// Write updated taxonomy.ts
fs.writeFileSync(TAXONOMY_PATH, taxonomyContent, 'utf8');

// Ensure image directory exists and create representative placeholder images for EMS products
const emsMediaDir = path.join(__dirname, '../public/cn-media/products/ems');
if (!fs.existsSync(emsMediaDir)) {
  fs.mkdirSync(emsMediaDir, { recursive: true });
}

// Write dummy 1x1 JPG / SVG or sample image files for all EMS product images to avoid 404s
const sampleSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><rect width="100%" height="100%" fill="#f4f6f8"/><rect x="40" y="40" width="320" height="320" rx="16" fill="#ffffff" stroke="#243255" stroke-width="4"/><text x="200" y="180" font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="#243255" text-anchor="middle">EMS KONTROL</text><text x="200" y="220" font-family="Arial, sans-serif" font-size="16" fill="#64748b" text-anchor="middle">Industrial Sensor</text></svg>`;

enrichedEmsProducts.forEach(p => {
  p.images.forEach(imgUrl => {
    const filename = path.basename(imgUrl);
    const filePath = path.join(emsMediaDir, filename);
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, sampleSvg, 'utf8');
    }
  });
});

console.log("EMS Product Import script finished cleanly!");
