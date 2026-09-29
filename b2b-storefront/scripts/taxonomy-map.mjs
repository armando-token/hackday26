
function norm(s) {
  return String(s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&amp;/g, "&")
}

export function mapProductToTaxonomy(input) {
  const brand = norm(input.brand)
  const cats = norm((input.categoryNames || []).join(" | "))
  const title = norm(input.title)
  const tags = norm((input.tagNames || []).join(" | "))
  const hay = `${brand} ${cats} ${title} ${tags}`

  const hit = (l1, l2, confidence, reason) => ({
    categoryPath: [l1, l2],
    categorySlug: l2,
    confidence,
    reason,
  })

  // Order: most specific brand/category first
  if (brand.includes("akcp") || /securityprobe|sensorprobe|wireless tunnel/.test(title)) {
    return hit("monitoreo-data-center", "sensores-ambientales", "high", "AKCP")
  }
  if (brand.includes("horner") || /\bocs\b|\brcc\b|xl7|xl4|smartstix/.test(title) || cats.includes("micro ocs")) {
    return hit("automatizacion-plc-hmi", "plc-hmi", "high", "Horner/PLC")
  }
  if (brand.includes("tzone") || /registrador|data.?logger|logbox|tempu|tt20/.test(title) || cats.includes("data loggers")) {
    return hit("registro-de-datos", "loggers-cadena-frio", "high", "logger")
  }
  if (
    brand.includes("rockwool") || brand.includes("termolan") || brand.includes("perfect") || brand.includes("sinopan") ||
    /lana de roca|prorox|durock|pir|poliuretano|armaflex|elastomer|ca[nñ]uela/.test(title) ||
    cats.includes("lana de roca")
  ) {
    return hit("aislamiento-termico", "paneles-lana-roca", "high", "aislamiento")
  }
  if (
    brand.includes("huanrui") || cats.includes("cable calefactor") ||
    /cable.*(autorregul|calefactor)|heat.?trace|snow.?melt|deshielo|pyro|scm|t-?mat|suelo radiante|alfombra calefactora|hrshtv/.test(title)
  ) {
    return hit("trazado-termico", "cable-autorregulable", "high", "trazado")
  }
  if (
    cats.includes("controladores") || cats.includes("indicadores") || cats.includes("control e indicacion") ||
    /controlador|\bpid\b|n1040|n960|n1500|n322|btc-?4100/.test(title)
  ) {
    return hit("control-e-indicacion", "controladores-pid", "high", "control")
  }
  if (
    cats.includes("humedad") || cats.includes("sensores") || cats.includes("transmisores") ||
    /termopar|thermocouple|rtd|pt100|humedad|rht|presi[oó]n|transmisor|nivel|hidrostatic|wl420/.test(title)
  ) {
    return hit("sensores-transmisores", "temperatura-termopar-rtd", "high", "sensor")
  }
  if (
    brand.includes("king") || brand.includes("mpi") ||
    cats.includes("calentadores") ||
    /unit.?heater|calefactor|calentador|baseboard|z[oó]calo|platinum|paw|fx6|kbp|duct|plenum|explosion|cartucho|strip.?heater/.test(title)
  ) {
    return hit("calefaccion-electrica", "unit-heaters-industriales", "medium", "calefaccion")
  }
  if (/ventil|fan|wfo|aire acondicionado/.test(title) || cats.includes("aire")) {
    return hit("otros", "ventilacion", "medium", "ventilacion")
  }
  if (/gateway|airgate|4g|lte|telik/.test(title) || cats.includes("comunicacion") || cats.includes("comunicación")) {
    return hit("registro-de-datos", "gateways", "medium", "gateway")
  }
  return hit("otros", "ventilacion", "low", "fallback")
}

export function refineTaxonomyHit(hit, title) {
  const t = norm(title)
  const L1 = hit.categoryPath[0]
  const set = (l2) => ({ ...hit, categoryPath: [L1, l2], categorySlug: l2 })

  if (L1 === "monitoreo-data-center") {
    if (/sensorprobe|securityprobe|spx|plataforma/.test(t)) return set("plataformas")
    if (/relay|adapter|modbus|dry.?contact|i\/?o/.test(t)) return set("io-relays")
    return set("sensores-ambientales")
  }
  if (L1 === "registro-de-datos") {
    if (/gateway|airgate|router|4g|lte/.test(t)) return set("gateways")
    if (/industrial|logbox|ble/.test(t)) return set("loggers-industriales")
    return set("loggers-cadena-frio")
  }
  if (L1 === "calefaccion-electrica") {
    if (/pared|paw|wall/.test(t)) return set("pared-conveccion")
    if (/z[oó]calo|baseboard/.test(t)) return set("zocalo")
    if (/fx6|explosi|hazard/.test(t)) return set("antiexplosion")
    if (/duct|plenum|serie e|mau/.test(t)) return set("ducto-mau-plenum")
    if (/cartucho|cartridge|banda|strip|immersion|proceso/.test(t)) return set("resistencias-proceso")
    if (/kbp|garage|compact/.test(t)) return set("unit-heaters-compactos")
    if (/port[aá]til|portable/.test(t)) return set("portatiles")
    if (/radiante|infrared|infrarrojo/.test(t)) return set("radiante-infrarrojo")
    if (/llave en mano|sistema.*\d+\s*kw/.test(t)) return set("sistemas-llave-en-mano")
    if (/hoot|wifi/.test(t)) return set("termostatos-linea")
    return set("unit-heaters-industriales")
  }
  if (L1 === "trazado-termico") {
    if (/pyro|control.*deshielo|snow.?melt.?control/.test(t)) return set("controles-deshielo")
    if (/snow|scm|nieve/.test(t)) return set("deshielo-nieve")
    if (/techo|gutter|canalon/.test(t)) return set("techos-canalones")
    if (/suelo|floor|t-?mat|alfombra/.test(t)) return set("suelo-radiante")
    return set("cable-autorregulable")
  }
  if (L1 === "aislamiento-termico") {
    if (/pir|poliuretano|sinopan/.test(t)) return set("pir-poliuretano")
    if (/armaflex|elastom|cinta/.test(t)) return set("espuma-elastomerica")
    if (/manta|ca[nñ]uela/.test(t)) return set("mantas-canuelas")
    return set("paneles-lana-roca")
  }
  if (L1 === "sensores-transmisores") {
    if (/humedad|rht/.test(t)) return set("humedad-temperatura")
    if (/presi[oó]n|pressure/.test(t)) return set("presion-proceso")
    if (/nivel|tank|hidrostatic/.test(t)) return set("nivel")
    if (/transmisor/.test(t) && !/termopar|rtd|humedad/.test(t)) return set("transmisores")
    return set("temperatura-termopar-rtd")
  }
  if (L1 === "control-e-indicacion") {
    if (/indicador|n1500/.test(t)) return set("indicadores-proceso")
    if (/termostato|n322/.test(t)) return set("termostatos-industriales")
    return set("controladores-pid")
  }
  if (L1 === "automatizacion-plc-hmi") {
    if (/rcc|remoto/.test(t)) return set("controladores-remotos")
    if (/smartstix|expansi|m[oó]dulo|dim\d|i\/?o/.test(t)) return set("expansion-io")
    return set("plc-hmi")
  }
  return hit
}
