/**
 * Control Nautas category tree: axis = product TYPE (not brand).
 * Reestructuración Canónica Industrial según Estudio de Fabricantes.
 */

export type CnCategoryNode = {
  slug: string
  name: string
  description?: string
  productCount?: number
  children?: CnCategoryNode[]
  imageUrl?: string
  metadata?: Record<string, unknown> | null
}

export const CN_ROOT: CnCategoryNode = {
  slug: "catalogo",
  name: "Catalog",
  description:
    "Calefacción eléctrica, trazado térmico, control e instrumentación industrial, monitoreo, PLC y aislamiento.",
  productCount: 498,
  children: [
    {
      slug: "aislamiento-termico",
      name: "Thermal Insulation",
      productCount: 15,
      description: "Paneles de lana mineral, cañuelas, mantas, espuma elastomérica y paneles sándwich aislantes.",
      children: [
        { slug: "paneles-lana-roca", name: "Mineral Wool Panels & Boards", description: "Paneles y planchas de lana mineral para aislamiento térmico e ignífugo.", productCount: 3 },
        { slug: "mantas-canuelas", name: "Insulation Blankets & Pipe Sections", description: "Mantas y cañuelas de aislamiento para tuberías y equipos industriales.", productCount: 4 },
        { slug: "espuma-elastomerica", name: "Elastomeric Insulation & Accessories", description: "Espuma elastomérica y cintas autoadhesivas para refrigeración y HVAC.", productCount: 1 },
        { slug: "paneles-sandwich", name: "Insulated Sandwich Panels", description: "Paneles sándwich de lana de roca y PIR para cubiertas, fachadas, salas blancas y cámaras frigoríficas.", productCount: 7 },
      ],
    },
    {
      slug: "automatizacion-plc-hmi",
      name: "PLC & HMI Automation",
      productCount: 36,
      description: "PLC+HMI todo en uno, PLC sin pantalla, E/S de expansión y módulos remotos.",
      children: [
        { slug: "plc-hmi", name: "All-in-One PLC + HMI", description: "Controladores OCS / All-in-One PLC+HMI con pantalla táctil integrada.", productCount: 22 },
        { slug: "controladores-remotos", name: "PLC y Controladores sin Pantalla", description: "PLC modulares y controladores remotos sin pantalla (RCC, DigiRail NXProg).", productCount: 5 },
        { slug: "expansion-io", name: "I/O Expansion & Remote I/O", description: "Módulos de E/S SmartRail, SmartStix, SmartMod y DigiRail.", productCount: 8 },
        { slug: "accesorios-entrenamiento", name: "Accesorios y Entrenamiento", description: "Simuladores universales de E/S y accesorios de desarrollo.", productCount: 1 },
      ],
    },
    {
      slug: "registro-de-datos",
      name: "Registro de Datos",
      productCount: 21,
      description: "Data loggers autónomos e industriales para cadena de frío y procesos.",
      children: [
        { slug: "loggers-cadena-frio", name: "Cold-Chain Data Loggers", description: "Registradores USB, Bluetooth y 4G para transporte de alimentos y farmacia.", productCount: 15 },
        { slug: "loggers-industriales", name: "Data Loggers Industriales", description: "Registradores multicanal de proceso (FieldLogger, LogBox-LTE/BLE/Wi-Fi).", productCount: 6 },
      ],
    },
    {
      slug: "comunicacion-industrial",
      name: "Industrial Communications & IoT",
      productCount: 11,
      description: "Gateways 4G/Wi-Fi, convertidores de protocolo Modbus/Profibus, enlaces LoRa e interfaces IO-Link.",
      children: [
        { slug: "gateways", name: "IoT Gateways & Industrial Routers", description: "Enrutadores celulares 4G VPN, gateways IoT Wi-Fi/Ethernet y módulos de telemetría.", productCount: 2 },
        { slug: "comunicacion-inalambrica", name: "Wireless / LoRa / RF Gateways & Links", description: "Gateways inalámbricos IEEE 802.15.4, sistemas LoRa y módulos máster 433 MHz RF.", productCount: 5 },
        { slug: "interfaces-industriales", name: "Industrial Gateways, Converters & Interfaces", description: "Convertidores Modbus a PROFIBUS DP, aisladores galvánicos RS485 e interfaces IO-Link Master.", productCount: 4 },
      ],
    },
    {
      slug: "sensores-transmisores",
      name: "Sensores y Transmisores Industriales",
      productCount: 131,
      description: "Sensores y transmisores de temperatura, humedad, presión, nivel y gases.",
      children: [
        { slug: "temperatura-termopar-rtd", name: "Sensores de Temperatura", description: "Termopares J/K/T, RTD Pt100/Pt1000 y sondas NTC.", productCount: 32 },
        { slug: "transmisores-temperatura", name: "Transmisores de Temperatura", description: "Transmisores de cabezal y riel DIN TxBlock, TxRail, PTT04R.", productCount: 10 },
        { slug: "humedad-temperatura", name: "Humedad y Temperatura", description: "Transmisores de humedad y temperatura RHT Climate, RHT-WM, THT02.", productCount: 19 },
        { slug: "presion-proceso", name: "Pressure, Differential & Melt Pressure", description: "Transmisores de presión diferencial de baja presión HVAC, salas limpias y transductores de fusión (Melt Pressure).", productCount: 11 },
        { slug: "nivel", name: "Level & Proximity Sensors", description: "Transmisores de nivel hidrostáticos, ultrasónicos y sensores capacitivos de proximidad M18/M30.", productCount: 5 },
        { slug: "gases-co2", name: "Industrial Gases & CO₂", description: "Transmisores NDIR de CO₂ y detectores electroquímicos de NH₃, C₂H₄, SO₂, CO y O₂ (fijos, portátiles y wireless).", productCount: 32 },
        { slug: "accesorios-sensores", name: "Sensor Accessories", description: "Termopozos de alta presión, bridas inoxidables, cables y conectores.", productCount: 22 },
      ],
    },
    {
      slug: "calefaccion-electrica",
      name: "Electric Heating",
      productCount: 103,
      description: "Calefacción de ambiente y calentadores de proceso industrial.",
      children: [
        { slug: "pared-conveccion", name: "Wall, Ceiling & Enclosure Heaters", description: "Calefactores empotrados, de superficie, convección y gabinete marinos o industriales.", productCount: 28 },
        { slug: "portatiles", name: "Portable & Industrial Heaters", description: "Unidades portátiles e industriales con ruedas para secado y obras.", productCount: 7 },
        { slug: "unit-heaters", name: "Unit Heaters Comercial e Industrial", description: "Calefactores unitarios compactos y heavy-duty para talleres y naves industriales.", productCount: 7 },
        { slug: "zocalo", name: "Baseboard Heaters", description: "Calentadores perimetrales de zócalo para calefacción silenciosa.", productCount: 8 },
        { slug: "radiante-infrarrojo", name: "Radiant & Infrared Heaters", description: "Calefacción radiante e infrarroja de fibra de carbono IP55.", productCount: 4 },
        { slug: "ducto-mau-plenum", name: "Calefactores para Ducto, MAU y Plenum", description: "Calentadores de ducto, MAU y plenum para sistemas HVAC.", productCount: 6 },
        { slug: "antiexplosion", name: "Hazardous-Area / Explosion-Proof Heaters", description: "Calefactores certificados cULus Clase I/II Div 1&2 para zonas peligrosas.", productCount: 2 },
        { slug: "cartuchos", name: "Calentadores de Cartucho", description: "Calentadores de cartucho de alta y baja densidad para moldes y matrices.", productCount: 8 },
        { slug: "bandas", name: "Band Heaters", description: "Calentadores de banda de mica, cerámica y aluminio fundido.", productCount: 5 },
        { slug: "strips", name: "Strip Heaters", description: "Calentadores de tira aleteada y placas planas de calefacción.", productCount: 6 },
        { slug: "calentadores-tambor", name: "Drum Heaters", description: "Calentadores de tambor de silicona y bandas metálicas para bidones.", productCount: 1 },
        { slug: "calentadores-flexibles", name: "Calentadores Flexibles y Silicona", description: "Mantas y cintas calefactoras flexibles de goma de silicona.", productCount: 0 },
        { slug: "inmersion", name: "Immersion Heaters", description: "Calentadores de inmersión para fluidos, aceites y tanques.", productCount: 1 },
        { slug: "sistemas-llave-en-mano", name: "Sistemas Llave en Mano", description: "Sistemas skids integrados de calentamiento de proceso con panel PID.", productCount: 5 },
        { slug: "termostatos-linea", name: "Heating Thermostats", description: "Termostatos de ambiente, programables WiFi HOOT y dual voltaje.", productCount: 12 },
        { slug: "controles-anticongelamiento", name: "Controles Anticongelamiento", description: "Termostatos antihielo NEMA 4X TRF115 y TF115 para exteriores.", productCount: 3 },
      ],
    },
    {
      slug: "trazado-termico",
      name: "Heating Cables & Heat Tracing",
      productCount: 44,
      description: "Cables autorregulables, deshielo de techos, suelo radiante y controles.",
      children: [
        { slug: "cable-autorregulable", name: "Pipe & Process Heat Tracing", description: "Cables autorregulables y de potencia constante para protección de tuberías y mantenimiento de temperatura de proceso.", productCount: 13 },
        { slug: "techos-canalones", name: "Roof & Gutter De-icing", description: "Trazado térmico para prevención de hielo en cubiertas y bajantes.", productCount: 10 },
        { slug: "deshielo-nieve", name: "Deshielo de Pavimentos / Snow Melt", description: "Esteras de deshielo de nieve para rampas, accesos y aceras.", productCount: 3 },
        { slug: "suelo-radiante", name: "Electric Floor Heating", description: "Esteras y cable radiante para confort de piso en interiores.", productCount: 10 },
        { slug: "controles-deshielo", name: "Heat Tracing Controls & Sensors", description: "Controles automáticos PYROBOX, PYROCON, UDG-4999 y GF PRO para deshielo.", productCount: 8 },
        { slug: "accesorios-trazado", name: "Connection Kits & Accessories", description: "Kits de conexión de potencia, empalmes, terminales finales, cajas NEMA y cintas de fijación.", productCount: 0 },
      ],
    },
    {
      slug: "control-e-indicacion",
      name: "Control & Indication",
      productCount: 68,
      description: "Controladores PID de proceso, termostatos electrónicos ON/OFF, indicadores y relés SSR.",
      children: [
        { slug: "controladores-pid", name: "Process PID Controllers", description: "Controladores PID de panel 1/32, 1/16, 1/8 y 1/4 DIN con lógica difusa y auto-tune.", productCount: 18 },
        { slug: "termostatos-industriales", name: "Electronic Thermostats & Controllers", description: "Termostatos digitales ON/OFF para calefacción, refrigeración, deshielo y diferencial solar.", productCount: 33 },
        { slug: "indicadores-proceso", name: "Process Indicators", description: "Indicadores digitales universales de panel para señales 4-20mA, V, RTD, TC y celda de carga.", productCount: 7 },
        { slug: "reles-ssr", name: "Relays & SSR / Power Control", description: "Relés de estado sólido (SSR) monofásicos/trifásicos y controladores de potencia 10-200A.", productCount: 10 },
      ],
    },
    {
      slug: "monitoreo-data-center",
      name: "Monitoreo Industrial, Ambiental y Data Center",
      productCount: 63,
      description: "Infraestructura crítica, plataformas AKCP, sensores ambientales RJ-45, fugas, energía y mantenimiento predictivo.",
      children: [
        { slug: "unidades-monitoreo", name: "Monitoring Units, Platforms & Modules", description: "Bases sensorProbe1+, SP2+, gateways máster OR-TAK GSM/Wi-Fi y módulos de pesaje.", productCount: 21 },
        { slug: "sensores-ambientales", name: "Environmental & Thermal Sensors", description: "Sensores AKCP RJ-45 para T/HR, mapas térmicos de rack, flujo de aire y presión diferencial.", productCount: 31 },
        { slug: "deteccion-fugas", name: "Water & Fuel Leak Detection", description: "Sensores puntuales y cables sensores con localización precisa de fugas.", productCount: 4 },
        { slug: "monitoreo-energia", name: "Monitoreo de Energía, PUE y Consumos", description: "Medidores en línea ILPM 16A/32A, powerProbeX+, sensores de energía y contadores de agua.", productCount: 5 },
        { slug: "monitoreo-condicion-telik", name: "Monitoreo de Condición y Mantenimiento Predictivo", description: "Solución Novus Telik Geter con sensores BLE de vibración/T° y análisis FFT.", productCount: 1 },
        { slug: "monitoreo-inalambrico-climate", name: "Monitoreo Inalámbrico de Ambientes (Climate Air+)", description: "Sistema Novus Climate Air+ con transmisión LoRa 3km y cumplimiento FDA 21 CFR Part 11.", productCount: 1 },
      ],
    },
    {
      slug: "otros",
      name: "Otros y Agricultura",
      productCount: 6,
      description: "Sustratos hidropónicos, ventiladores industriales y accesorios.",
      children: [
        { slug: "sustratos-hidroponicos", name: "Sustratos Hidropónicos de Lana de Roca", description: "Sustratos estériles de lana de roca Perfect para germinación y cultivo sin suelo.", productCount: 1 },
        { slug: "ventiladores-alta-velocidad", name: "Ventiladores de Alta Velocidad y Circulación", description: "Ventiladores comerciales e industriales King PFO-24 y PFO-30 de alta velocidad.", productCount: 2 },
        { slug: "accesorios-ventilacion", name: "Accesorios y Kits para Ventiladores", description: "Kits de nebulización MISTKIT y fundas impermeables protectoras King Electric.", productCount: 3 },
      ],
    },
  ],
}

export const LEGACY_HVAC_ALIASES: Record<string, string[]> = {
  hvac: ["calefaccion-electrica"],
  "hvac-and-refrigeration": ["calefaccion-electrica"],
  heaters: ["calefaccion-electrica"],
  "hvac-controls-and-thermostats": ["control-e-indicacion"],
  "air-filters": ["aislamiento-termico"],
  "resistencias-proceso": ["calefaccion-electrica", "cartuchos"],
}

export function normalizeCnSlugs(slugs: string[]): string[] {
  if (!slugs.length) return slugs
  const [first, ...rest] = slugs
  if (first === "catalogo") return rest.length ? rest : ["calefaccion-electrica"]
  const alias = LEGACY_HVAC_ALIASES[first]
  if (alias) return [...alias, ...rest]
  return slugs
}

export function findCategoryByPath(
  slugs: string[],
  root: CnCategoryNode = CN_ROOT
): CnCategoryNode | null {
  const normalized = normalizeCnSlugs(slugs)
  if (!normalized.length) return root
  let node: CnCategoryNode = root
  for (const slug of normalized) {
    const next = node.children?.find((c) => c.slug === slug)
    if (!next) return null
    node = next
  }
  return node
}

export function getCategoryPath(
  slugs: string[],
  root: CnCategoryNode = CN_ROOT
): CnCategoryNode[] {
  const normalized = normalizeCnSlugs(slugs)
  const path: CnCategoryNode[] = []
  let node: CnCategoryNode = root
  for (const slug of normalized) {
    const next = node.children?.find((c) => c.slug === slug)
    if (!next) break
    path.push(next)
    node = next
  }
  return path
}

export function flattenCategories(
  node: CnCategoryNode = CN_ROOT,
  parentPath: string[] = []
): { path: string[]; node: CnCategoryNode }[] {
  const path =
    node.slug === CN_ROOT.slug ? parentPath : [...parentPath, node.slug]
  const self =
    node.slug === CN_ROOT.slug ? [] : [{ path, node }]
  const kids =
    node.children?.flatMap((c) => flattenCategories(c, path)) ?? []
  return [...self, ...kids]
}

export const CN_L1_FAMILIES = CN_ROOT.children ?? []

export function isLeafCategory(node: CnCategoryNode): boolean {
  return !node.children?.length
}
