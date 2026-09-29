/**
 * Maps WooCommerce Store API product fields → CN canonical taxonomy.
 * Used by ETL (scripts/cn-etl.mjs) and storefront helpers.
 */

export type CnTaxonomyMapping = {
  categoryPath: string[]
  categorySlug: string
  /** true when we fell back to otros or a weak heuristic */
  uncertain?: boolean
  reason?: string
}

export type WcMapInput = {
  title: string
  brand?: string
  categorySlugs?: string[]
  categoryNames?: string[]
  sku?: string
}

function norm(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&#\d+;/g, " ")
}

function hasAny(hay: string, needles: string[]): boolean {
  return needles.some((n) => hay.includes(n))
}

function path(l1: string, l2: string, reason: string, uncertain = false): CnTaxonomyMapping {
  return { categoryPath: [l1, l2], categorySlug: l2, reason, uncertain }
}

/**
 * Resolve CN L1/L2 from WC categories, brand, and title keywords.
 */
export function mapWcToCnTaxonomy(input: WcMapInput): CnTaxonomyMapping {
  const title = norm(input.title || "")
  const brand = norm(input.brand || "")
  const slugs = (input.categorySlugs || []).map(norm)
  const names = (input.categoryNames || []).map(norm)
  const blob = [title, brand, ...slugs, ...names].join(" ")

  // —— Brand / category hard rules (highest priority) ——

  // AKCP → monitoreo-data-center
  if (brand.includes("akcp") || hasAny(blob, ["akcp", "sensorprobe", "securityprobe"])) {
    if (hasAny(blob, ["relay", "rele", "adaptador", "adapter", "io ", "i/o", "modbus", "convertidor", "converter", "dry contact", "contacto"])) {
      return path("monitoreo-data-center", "io-relays", "akcp-io")
    }
    if (
      hasAny(blob, [
        "sensorprobe",
        "securityprobe",
        "plataforma",
        "platform",
        "base unit",
        "nodo",
        "wireless tunnel",
        "sp-wt",
      ]) ||
      /sensor\s*probe/i.test(input.title || "")
    ) {
      return path("monitoreo-data-center", "plataformas", "akcp-platform")
    }
    return path("monitoreo-data-center", "sensores-ambientales", "akcp-sensor")
  }

  // Horner / PLC / OCS / RCC → automatizacion-plc-hmi
  if (
    brand.includes("horner") ||
    hasAny(blob, ["horner", "plc", "ocs", "rcc", "smartstix", "xl series", "micro ocs", "plc-scada", "plc-todo-en-uno"])
  ) {
    if (hasAny(blob, ["smartstix", "expansion", "modulo", "módulo", "i/o", "io ", "modulos"])) {
      return path("automatizacion-plc-hmi", "expansion-io", "horner-io")
    }
    if (hasAny(blob, ["rcc", "remoto", "remote", "sin pantalla", "headless"])) {
      return path("automatizacion-plc-hmi", "controladores-remotos", "horner-rcc")
    }
    return path("automatizacion-plc-hmi", "plc-hmi", "horner-plc")
  }

  // Data logger / Tzone / LogBox → registro-de-datos
  if (
    brand.includes("tzone") ||
    hasAny(blob, [
      "tzone",
      "tempu",
      "logbox",
      "data logger",
      "datalogger",
      "registrador",
      "data-loggers",
      "cadena de frio",
      "cadena de frío",
      "cold chain",
    ])
  ) {
    if (hasAny(blob, ["airgate", "gateway", "4g", "lte", "comunicacion", "comunicación", "router", "vpn"])) {
      // Gateways that are also loggers → prefer gateway if AirGate-like
      if (hasAny(blob, ["airgate", "gateway", "router"])) {
        return path("registro-de-datos", "gateways", "logger-gateway")
      }
    }
    if (
      hasAny(blob, ["tempu", "tzone", "un solo uso", "single-use", "desechable", "cadena", "cold", "usb-c", "pdf"]) ||
      slugs.includes("data-loggers")
    ) {
      // Industrial LogBox vs cold-chain Tzone
      if (hasAny(blob, ["logbox", "novus", "industrial", "multicanal", "ble", "lte"])) {
        if (brand.includes("tzone") || hasAny(title, ["tzone", "tempu"])) {
          return path("registro-de-datos", "loggers-cadena-frio", "tzone-cold")
        }
        return path("registro-de-datos", "loggers-industriales", "logbox")
      }
      if (brand.includes("tzone") || hasAny(title, ["tzone", "tempu"])) {
        return path("registro-de-datos", "loggers-cadena-frio", "tzone")
      }
    }
    if (hasAny(blob, ["airgate", "gateway"])) {
      return path("registro-de-datos", "gateways", "gateway")
    }
    if (hasAny(blob, ["logbox", "novus"]) && !brand.includes("tzone")) {
      return path("registro-de-datos", "loggers-industriales", "novus-logger")
    }
    return path("registro-de-datos", "loggers-cadena-frio", "data-logger")
  }

  // Novus gateways / AirGate (without logger keywords caught above)
  if (hasAny(blob, ["airgate", "gateway"]) && (brand.includes("novus") || slugs.includes("comunicacion-y-datos"))) {
    return path("registro-de-datos", "gateways", "novus-gateway")
  }

  // Aislamiento: Rockwool / Perfect / Termolan / lana / PIR / Armaflex
  if (
    brand.includes("rockwool") ||
    brand.includes("termolan") ||
    brand.includes("perfect") ||
    hasAny(blob, [
      "rockwool",
      "termolan",
      "lana de roca",
      "lana-de-roca",
      "prorox",
      "canuela",
      "cañuela",
      "pir",
      "poliuretano",
      "armaflex",
      "elastomeric",
      "elastomerica",
      "elastomérica",
      "espuma elastomerica",
      "aislamiento termico",
      "panel frigorifico",
      "panel frigorífico",
    ])
  ) {
    if (hasAny(blob, ["armaflex", "elastomer", "cinta", "espuma"])) {
      return path("aislamiento-termico", "espuma-elastomerica", "elastomerica")
    }
    if (hasAny(blob, ["pir", "poliuretano", "frigorifico", "frigorífico", "sandwich", "sándwich"])) {
      return path("aislamiento-termico", "pir-poliuretano", "pir")
    }
    if (hasAny(blob, ["canuela", "cañuela", "manta", "pipe section", "tuberia", "tubería", "preformad"])) {
      return path("aislamiento-termico", "mantas-canuelas", "canuela")
    }
    return path("aislamiento-termico", "paneles-lana-roca", "lana-roca")
  }

  // Trazado térmico: heat cable / Huanrui / snow melt / mat / PYRO / roof
  if (
    brand.includes("huanrui") ||
    slugs.includes("cable-calefactor") ||
    hasAny(blob, [
      "cable calefactor",
      "heat trace",
      "heat cable",
      "autorregulable",
      "self-regulat",
      "snow melt",
      "deshielo",
      "pyro",
      "pyrobox",
      "pyrocon",
      "pyrosense",
      "techo",
      "canalón",
      "canalon",
      "gutter",
      "suelo radiante",
      "floor heat",
      "alfombra calefactora",
      "heating mat",
      "t-mat",
      "scm ",
      " huanrui",
    ])
  ) {
    // Exclude mis-categorized small heaters that landed in cable-calefactor
    if (
      hasAny(title, ["whfc", "calentador pequeno", "calentador pequeño", "calentador de techo"]) &&
      !hasAny(title, ["cable", "mat", "alfombra", "pyro", "deshielo"])
    ) {
      // fall through to calefacción
    } else {
      if (hasAny(blob, ["pyro", "gf pro", "gfep", "controlador", "sensor de nieve", "pyrosense", "pyrocon"])) {
        return path("trazado-termico", "controles-deshielo", "pyro-control")
      }
      if (hasAny(blob, ["snow", "nieve", "deshielo de nieve", "scm", "sc cable"])) {
        if (hasAny(blob, ["mat", "alfombra"])) {
          return path("trazado-termico", "deshielo-nieve", "snow-mat")
        }
        return path("trazado-termico", "deshielo-nieve", "snow-cable")
      }
      if (
        hasAny(blob, ["techo", "canalón", "canalon", "gutter", "canalones"]) ||
        /\b(sr|srp)\b/.test(title) ||
        /\bserie sr\b/.test(title)
      ) {
        return path("trazado-termico", "techos-canalones", "roof")
      }
      if (hasAny(blob, ["suelo", "floor", "t-mat", "tcm", "baldosa", "tile", "radiante"])) {
        return path("trazado-termico", "suelo-radiante", "floor-mat")
      }
      return path("trazado-termico", "cable-autorregulable", "heat-cable")
    }
  }

  // Ventilación / fans → otros (strict: avoid heaters that mention "ventilador" as a component)
  {
    const isFanAccessory = hasAny(blob, [
      "wfo-",
      "pfo-",
      "fo-cover",
      "funda resistente",
      "nebulizacion",
      "nebulización",
      "mistkit",
      "ventiladores-de-alta-velocidad",
      "fundas-para-ventiladores",
    ])
    const isFanProduct =
      /\bventilador\b/.test(title) &&
      !hasAny(title, ["calefactor", "calentador", "termostato", "heater", "cable calefactor"])
    if (isFanAccessory || isFanProduct) {
      return path("otros", "ventilacion", "ventilacion")
    }
  }

  // Sensores / transmisores (before generic control — Novus RHT etc.)
  if (
    slugs.includes("sensores-y-transmisores") ||
    slugs.includes("sensores-temperatura") ||
    slugs.includes("humedad-y-temperatura") ||
    slugs.includes("presion") ||
    slugs.includes("transmisores-temperatura") ||
    hasAny(blob, [
      "termopar",
      "termocupla",
      "thermocouple",
      "rtd",
      "pt100",
      "pt1000",
      "humedad",
      "humidity",
      "rht-",
      "presion",
      "presión",
      "pressure",
      "nivel",
      "level",
      "transmisor",
      "transmitter",
      "txblock",
      "transductor",
      "melt pressure",
      "presion de fusion",
      "presión de fusión",
      "wl420",
      "sonda",
    ])
  ) {
    // King line-voltage wall thermostats misfiled under sensores → calefacción termostatos
    if (
      (brand.includes("king") || hasAny(title, ["king", "hoot", "k101", "k102", "k302", "th109", "tf115", "trf115"])) &&
      hasAny(blob, ["termostato"]) &&
      !hasAny(blob, ["novus", "pid", "n1040", "n322", "industrial panel"])
    ) {
      return path("calefaccion-electrica", "termostatos-linea", "king-line-thermostat")
    }

    if (hasAny(blob, ["humedad", "humidity", "rht", "temp/hum", "temperatura y humedad"])) {
      return path("sensores-transmisores", "humedad-temperatura", "humidity")
    }
    if (hasAny(blob, ["nivel", "level", "wl420", "hidrostatic", "hidrostático", "tank depth"])) {
      return path("sensores-transmisores", "nivel", "level")
    }
    if (hasAny(blob, ["presion", "presión", "pressure", "melt", "nak", "transductor", "dynisco"])) {
      return path("sensores-transmisores", "presion-proceso", "pressure")
    }
    if (
      hasAny(blob, ["transmisor", "transmitter", "txblock", "acondicionador", "4-20", "4–20"]) &&
      !hasAny(blob, ["termopar", "rtd", "pt100", "sonda de temperatura"])
    ) {
      return path("sensores-transmisores", "transmisores", "transmitter")
    }
    if (hasAny(blob, ["termopar", "termocupla", "thermocouple", "rtd", "pt100", "temperatura", "sonda", "smt", "sph", "hsc", "fsb"])) {
      return path("sensores-transmisores", "temperatura-termopar-rtd", "temp-sensor")
    }
    return path("sensores-transmisores", "transmisores", "sensor-generic")
  }

  // Calentadores llave-en-mano / ambiente BEFORE PID (titles often mention TEC-4100 PID)
  if (
    hasAny(blob, ["llave en mano", "sistema de calentamiento", "200 kw", "70 kw", "circulacion", "circulación"]) &&
    hasAny(blob, ["calent", "calefac", "heater", "kw"])
  ) {
    return path("calefaccion-electrica", "sistemas-llave-en-mano", "turnkey-early")
  }
  if (
    hasAny(blob, ["calefactor marino", "daw-ss", "mkt-ss", "marine heater"]) ||
    (hasAny(blob, ["calefactor", "calentador"]) &&
      hasAny(blob, ["marino", "marine", "acero inoxidable"]) &&
      !hasAny(blob, ["novus", "n1040", "indicador de proceso"]))
  ) {
    return path("calefaccion-electrica", "pared-conveccion", "marine-heater")
  }

  // Control e indicación: PID / Novus N1040 / indicador / termostato industrial
  if (
    slugs.includes("control-e-indicacion") ||
    slugs.includes("controladores") ||
    slugs.includes("indicadores") ||
    slugs.includes("termostatos") ||
    hasAny(blob, [
      "pid",
      "n1040",
      "n1500",
      "n322",
      "n960",
      "btc-4100",
      "btc4100",
      "indicador",
      "controlador de temperatura",
      "termostato industrial",
    ])
  ) {
    // Don't swallow heaters that happen to mention PID controllers
    if (
      hasAny(blob, ["calefactor", "calentador", "unit heater", "llave en mano", "sistema de calentamiento"]) &&
      !hasAny(blob, ["novus n", "n1040", "n1050", "n1200", "panel din", "1/16 din", "1/8 din"])
    ) {
      // fall through to heating rules below — skip this block
    } else {
    // Wall / line-voltage King thermostats → calefacción
    if (
      (brand.includes("king") || hasAny(title, ["hoot", "king"])) &&
      hasAny(blob, ["termostato", "wifi", "thermalink", "k101", "k102"]) &&
      !hasAny(blob, ["novus", "pid", "n1040", "panel din"])
    ) {
      return path("calefaccion-electrica", "termostatos-linea", "king-thermostat")
    }
    if (hasAny(blob, ["indicador", "n1500", "display universal"])) {
      return path("control-e-indicacion", "indicadores-proceso", "indicator")
    }
    if (
      hasAny(blob, ["pid", "n1040", "n960", "btc", "controlador de temperatura", "tec-4100"]) ||
      (slugs.includes("controladores") && !hasAny(blob, ["termostato de linea", "line voltage"]))
    ) {
      return path("control-e-indicacion", "controladores-pid", "pid")
    }
    if (hasAny(blob, ["termostato", "n322", "n323"])) {
      return path("control-e-indicacion", "termostatos-industriales", "industrial-thermostat")
    }
    return path("control-e-indicacion", "controladores-pid", "control-generic")
    }
  }

  // Calefacción eléctrica: King unit heaters / baseboard / wall / duct / explosion / MPI process
  if (
    brand.includes("king") ||
    brand.includes("mpi") ||
    slugs.includes("calentadores") ||
    slugs.includes("calentadores-electricos") ||
    slugs.includes("calentadores-llave-en-mano") ||
    hasAny(blob, [
      "calefactor",
      "calentador",
      "unit heater",
      "baseboard",
      "zocalo",
      "zócalo",
      "explosion",
      "antiexplosion",
      "ducto",
      "plenum",
      "mau",
      "resistencia",
      "cartucho",
      "banda",
      "process heater",
    ])
  ) {
    if (hasAny(blob, ["explosion", "fx6", "hazardous", "antiexplosion", "ruffneck", "clase i"])) {
      return path("calefaccion-electrica", "antiexplosion", "explosion")
    }
    if (hasAny(blob, ["llave en mano", "sistema de calentamiento", "200 kw", "circulacion", "circulación"])) {
      return path("calefaccion-electrica", "sistemas-llave-en-mano", "turnkey")
    }
    if (
      brand.includes("mpi") ||
      hasAny(blob, [
        "cartucho",
        "cartridge",
        "banda",
        "strip",
        "bobina",
        "tambor",
        "manguera",
        "proceso",
        "extrusion",
        "extrusión",
        "morheat",
        "incoloy",
        "mica",
        "ceramica",
        "cerámica",
      ])
    ) {
      // MPI process heaters vs King
      if (brand.includes("mpi") || hasAny(title, ["mpi", "morheat"])) {
        // Split MPI process heaters by form-factor (not brand axis)
        if (hasAny(blob, ["cartucho", "cartridge", "inserción", "insercion"])) {
          return path("calefaccion-electrica", "cartuchos", "mpi-cartridge")
        }
        if (hasAny(blob, ["banda", "band heater", "mica", "cerámica", "ceramica"])) {
          return path("calefaccion-electrica", "bandas", "mpi-band")
        }
        if (hasAny(blob, ["strip", "tira", "aleta", "fin"])) {
          return path("calefaccion-electrica", "strips", "mpi-strip")
        }
        if (hasAny(blob, ["inmersion", "inmersión", "immersion", "flange", "brida"])) {
          return path("calefaccion-electrica", "inmersion", "mpi-immersion")
        }
        return path("calefaccion-electrica", "cartuchos", "mpi-process")
      }
    }
    if (hasAny(blob, ["ducto", "duct", "serie e", "plenum", "mau", "aire de reposicion", "aire de reposición", "kbu", "horno electrico", "horno eléctrico", "kf/kfs", "serie kf"])) {
      return path("calefaccion-electrica", "ducto-mau-plenum", "duct")
    }
    if (hasAny(blob, ["radiante", "infrarrojo", "infrared", "smartwave", "okb", "rk "])) {
      return path("calefaccion-electrica", "radiante-infrarrojo", "infrared")
    }
    if (hasAny(blob, ["zocalo", "zócalo", "baseboard", " modelo k ", "kt-mw", "ktw", "cb ", "ez-connect"])) {
      return path("calefaccion-electrica", "zocalo", "baseboard")
    }
    if (hasAny(blob, ["portatil", "portátil", "portable", "garage", "garaje", "psh", "pgh", "puh", "pkb", "pckf", "pckw", "yellow jacket"])) {
      return path("calefaccion-electrica", "portatiles", "portable")
    }
    if (
      hasAny(blob, ["kbp", "unit heater", "calentador de unidad", "kb platinum", "kb eco", "kfuh", "kbsh", "kbs ", "pkb"]) ||
      /modelo kb[psu]/i.test(input.title || "") ||
      /\bkb\b/i.test(input.title || "")
    ) {
      if (hasAny(blob, ["compacto", "kbp", "garage", "garaje", "pic-a-watt"]) && !hasAny(blob, ["industrial", "platinumx", "kfuh", "pesada"])) {
        return path("calefaccion-electrica", "unit-heaters-compactos", "uh-compact")
      }
      return path("calefaccion-electrica", "unit-heaters-industriales", "uh-industrial")
    }
    if (hasAny(blob, ["pared", "wall", "paw", "lpw", "whf", "gabinete", "kcf", "conveccion", "convección", "kcc"])) {
      return path("calefaccion-electrica", "pared-conveccion", "wall")
    }
    if (hasAny(blob, ["termostato", "hoot", "thermalink"])) {
      return path("calefaccion-electrica", "termostatos-linea", "heat-thermostat")
    }
    // Generic heater
    if (brand.includes("mpi")) {
      if (hasAny(blob, ["banda", "band"])) {
        return path("calefaccion-electrica", "bandas", "mpi-default-band")
      }
      if (hasAny(blob, ["strip", "tira"])) {
        return path("calefaccion-electrica", "strips", "mpi-default-strip")
      }
      if (hasAny(blob, ["inmersion", "inmersión", "immersion"])) {
        return path("calefaccion-electrica", "inmersion", "mpi-default-immersion")
      }
      return path("calefaccion-electrica", "cartuchos", "mpi-default")
    }
    return path("calefaccion-electrica", "pared-conveccion", "heater-default", true)
  }

  // Loop isolators / signal conditioners without category
  if (hasAny(blob, ["txisoloop", "aislador de lazo", "loop isolat", "usb-i485", "convertidor usb"])) {
    if (hasAny(blob, ["usb-i485", "convertidor usb", "rs485"])) {
      return path("registro-de-datos", "gateways", "novus-comms", true)
    }
    return path("sensores-transmisores", "transmisores", "loop-isolator")
  }

  // WC category fallbacks
  if (slugs.includes("comunicacion-y-datos")) {
    return path("registro-de-datos", "gateways", "comms-fallback", true)
  }
  if (slugs.includes("plc-scada") || slugs.includes("plc-todo-en-uno")) {
    return path("automatizacion-plc-hmi", "plc-hmi", "plc-cat")
  }
  if (slugs.includes("lana-de-roca") || slugs.includes("panel-lana-de-roca")) {
    return path("aislamiento-termico", "paneles-lana-roca", "lana-cat")
  }
  if (slugs.includes("poliuretano")) {
    return path("aislamiento-termico", "pir-poliuretano", "pir-cat")
  }
  if (slugs.includes("espuma-elastomerica") || slugs.includes("cintas-y-royos")) {
    return path("aislamiento-termico", "espuma-elastomerica", "elast-cat")
  }

  // Default → otros / ventilacion
  return path("otros", "ventilacion", "default-otros", true)
}

/** Valid L2 slugs keyed by L1 (mirrors taxonomy.ts). */
export const CN_L2_BY_L1: Record<string, string[]> = {
  "calefaccion-electrica": [
    "pared-conveccion",
    "portatiles",
    "unit-heaters-compactos",
    "unit-heaters-industriales",
    "zocalo",
    "radiante-infrarrojo",
    "ducto-mau-plenum",
    "antiexplosion",
    "cartuchos",
    "bandas",
    "strips",
    "inmersion",
    "sistemas-llave-en-mano",
    "termostatos-linea",
  ],
  "trazado-termico": [
    "cable-autorregulable",
    "techos-canalones",
    "deshielo-nieve",
    "suelo-radiante",
    "controles-deshielo",
  ],
  "control-e-indicacion": [
    "controladores-pid",
    "indicadores-proceso",
    "termostatos-industriales",
  ],
  "sensores-transmisores": [
    "temperatura-termopar-rtd",
    "humedad-temperatura",
    "presion-proceso",
    "nivel",
    "transmisores",
  ],
  "monitoreo-data-center": ["plataformas", "sensores-ambientales", "io-relays"],
  "registro-de-datos": ["loggers-cadena-frio", "loggers-industriales", "gateways"],
  "automatizacion-plc-hmi": ["plc-hmi", "controladores-remotos", "expansion-io"],
  "aislamiento-termico": [
    "paneles-lana-roca",
    "mantas-canuelas",
    "pir-poliuretano",
    "espuma-elastomerica",
  ],
  otros: ["ventilacion"],
}
