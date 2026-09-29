/**
 * Canonical attribute name aliases for WC ↔ Technical View / facets.
 * Resolves synonym fragmentation without generic fallbacks.
 */

import type { CnProduct } from "./products"

/** Canonical key → accepted WC / product variants (exact + normalized). */
export const SPEC_ALIASES: Record<string, string[]> = {
  "Núcleo Aislante": [
    "Núcleo Aislante",
    "Material del núcleo",
    "Núcleo",
    "Material Base",
    "Aislamiento",
  ],
  "Espesor": [
    "Espesor",
    "Espesores disponibles",
    "Espesores típicos",
    "Grosor",
    "Espesor Nominal",
  ],
  "Reacción al Fuego": [
    "Reacción al Fuego",
    "Resistencia al fuego",
    "Clasificación de Fuego",
    "Clase de Fuego",
    "Fire Rating",
    "Inflamabilidad",
  ],
  "Revestimiento": [
    "Revestimiento",
    "Caras metálicas",
    "Acabado",
    "Acabados exteriores",
    "Cara metálica",
    "Acabado superficial",
  ],
  "Aplicación": [
    "Aplicación",
    "Aplicaciones",
    "Aplicaciones típicas",
    "Uso",
    "Uso Recomendado",
    "Destino",
  ],
  "Conductividad Térmica": [
    "Conductividad Térmica",
    "Conductividad",
    "Propiedades térmicas",
    "Valor K",
  ],
  "Sistema": ["Sistema", "Tipo de Sistema", "Equipo", "Modelo"],
  "Medio / Proceso": ["Medio / Proceso", "Fluido", "Medio", "Fluido de Proceso"],
  "Temperatura": ["Temperatura", "Rango de Temperatura", "T° Máxima", "Temperatura de Proceso"],
  "Caudal / Capacidad": ["Caudal / Capacidad", "Caudal", "Capacidad", "Flujo de Proceso"],
  "Control": ["Control", "Control / Termostato", "Tablero de Control", "Tipo de Control"],
  "Gabinete": ["Gabinete", "Envolvente", "Protección NEMA", "Carcasa"],
  "Canales": ["Canales", "Número de Canales", "Entradas Analógicas", "Canales de Entrada"],
  "Señales Compatibles": ["Señales Compatibles", "Entradas Compatibles", "Tipos de Entrada", "Entrada de Sensor"],
  "Resolución / Exactitud": ["Resolución / Exactitud", "Exactitud", "Resolución", "Precisión / Exactitud", "Precisión"],
  "Registro": ["Registro", "Memoria", "Capacidad de Memoria", "Capacidad de Registro"],
  "Tipo / Variable": ["Tipo / Variable", "Variable", "Tipo de Instrumento", "Función"],
  "Entradas": ["Entradas", "Entradas Analógicas", "Entrada Universal", "Entrada de Sensor"],
  Alimentación: [
    "Alimentación",
    "Alimentación Eléctrica",
    "Fuente de Alimentación",
    "Alimentacion",
    "Power Supply",
    "Supply Voltage",
    "Tensión",
    "Voltaje",
  ],
  "Rango de Temperatura": [
    "Rango de Temperatura",
    "Rango de Medición",
    "Rango de Operación",
    "Temperature Range",
    "Temperatura Máxima",
    "T° Máx.",
    "Temperatura Máxima de Trabajo",
  ],
  "Flujo de Aire": ["Flujo de Aire", "Flujo de aire", "Caudal de Aire", "Air Flow"],
  Voltaje: ["Voltaje", "Tensión", "Tensión Nominal", "Voltage", "Voltaje Nominal", "Alimentación"],
  Tensión: ["Tensión", "Voltaje", "Tensión Nominal", "Voltage", "Voltaje Nominal", "Alimentación"],
  Potencia: [
    "Potencia",
    "Potencia Nominal",
    "Wattage",
    "Wattage Output",
    "Potencia Calefactor",
    "Vataje",
  ],
  Dimensiones: [
    "Dimensiones",
    "Dimensiones Generales",
    "Overall Dimensions",
    "Medidas",
    "Dimensiones Panel",
    "Ancho útil",
  ],
  Comunicación: [
    "Comunicación",
    "Comunicaciones",
    "Protocolos de Comunicación",
    "Communication",
    "Protocolo",
    "Interfaz",
  ],
  Protección: ["Protección", "Clase de Protección", "Protección Eléctrica", "IP Rating", "Grado de Protección", "Resistencia a humedad"],
  Montaje: ["Montaje", "Tipo de Montaje", "Mounting", "Instalación"],
  Garantía: ["Garantía", "Warranty", "Garantia"],
  Marca: ["Marca", "Brand"],
  Modelo: ["Modelo", "Modelo exacto", "Model", "Model Number"],
  "Tipo de Dispositivo": [
    "Tipo de Dispositivo",
    "Tipo de Producto",
    "Tipo de Sensor",
    "Device Type",
    "Tipo",
    "Tipo de panel",
  ],
  Material: [
    "Material",
    "Material de Construcción",
    "Construcción",
    "Material de Vaina",
    "Envolvente",
    "Material Base",
  ],
  "Material / Construcción": [
    "Material / Construcción",
    "Material",
    "Construcción",
    "Material de Vaina",
    "Envolvente",
    "Material Base",
  ],
  Termostato: [
    "Termostato",
    "Control / Termostato",
    "Control de Temperatura",
    "Termostato Integrado",
  ],
  "Control / Termostato": [
    "Control / Termostato",
    "Termostato",
    "Control",
    "Control de Temperatura",
  ],
  "Elemento Calefactor": [
    "Elemento Calefactor",
    "Elemento de Calor",
    "Tipo de Elemento",
    "Tecnología",
  ],
  "Seguridad Térmica": [
    "Seguridad Térmica",
    "Protección Térmica",
    "Protección",
  ],
  Display: ["Display", "Pantalla", "LCD Display"],
  "Precisión / Muestreo": ["Precisión / Muestreo", "Precisión", "Precisión / Resolución", "Tasa de Muestreo"],
  "Salidas / Alarmas": ["Salidas / Alarmas", "Alarmas", "Salida Analógica", "Salidas Digitales"],
  "Comunicación / Retransmisión": ["Comunicación / Retransmisión", "Comunicación", "Interfaz Serial", "Red / Fieldbus"],
  "Corriente de Carga": ["Corriente de Carga", "Amperaje Nominal", "Corriente Máxima", "Amperaje"],
  "Tensión de Carga": ["Tensión de Carga", "Voltaje de Salida", "Tensión de Alimentación", "Voltaje"],
  "Señal de Control": ["Señal de Control", "Voltaje de Control", "Tensión de Control"],
  Conmutación: ["Conmutación", "Tipo de Conmutación", "Zero Cross"],
  "Montaje / Disipador": ["Montaje / Disipador", "Montaje", "Estilo de Montaje", "Protección de Carcasa"],
  "Puertos de Sensores / E/S": ["Puertos de Sensores / E/S", "Modelos y Capacidad", "Modelos Disponibles", "Canales"],
  "Capacidad / Expansión": ["Capacidad / Expansión", "Capacidad de Sensores", "Expansión"],
  "Red y Protocolos": ["Red y Protocolos", "Protocolos Soportados", "Conectividad de Red"],
  "Alarmas / Notificaciones": ["Alarmas / Notificaciones", "Alarmas", "Alertas"],
  "Variable / Función": ["Variable / Función", "Parámetro / Sensor", "Función Principal", "Tipo de Medición"],
  "Tipo de Medición": ["Tipo de Medición", "Grado de Protección Física", "Tipo"],
  "Cobertura / Longitud": ["Cobertura / Longitud", "Alcance Inalámbrico", "Longitud"],
  Localización: ["Localización", "Ubicación de Fuga", "Precisión"],
  Entorno: ["Entorno", "Protección", "Grado de Protección Física"],
  "Tipo / Alcance": ["Tipo / Alcance", "Aplicación / Función", "Tipo de Dispositivo"],
  "Tensión / Corriente": ["Tensión / Corriente", "Alimentación Eléctrica", "Rango de Alimentación"],
  "Variables Medidas": ["Variables Medidas", "Parámetros Medidos", "Variables"],
  "Circuitos / Capacidad": ["Circuitos / Capacidad", "Capacidad de Sensores", "Canales de Entrada"],
  "Sensor ↔ Gateway": ["Sensor ↔ Gateway", "Conectividad", "Interfaz Inalámbrica"],
  "Analítica / Muestreo": ["Analítica / Muestreo", "Procesamiento FFT", "Tasa de Muestreo"],
  "Autonomía / Montaje": ["Autonomía / Montaje", "Montaje", "Alimentación"],
  "Variable / Precisión": ["Variable / Precisión", "Precisión de Medición", "Variables"],
  "Conectividad / Protocolos": ["Conectividad / Protocolos", "Rol / Modo", "Protocolos"],
  "Memoria / Autonomía": ["Memoria / Autonomía", "Autonomía", "Memoria Interna"],
  Cumplimiento: ["Cumplimiento", "Certificaciones", "Normas"],
  "Variables / Sensor": ["Variables / Sensor", "Variable / Función", "Parámetro / Sensor", "Sensores"],
  Exactitud: ["Exactitud", "Localización", "Precisión / Exactitud", "Margen de Error", "Precisión"],
  "Alimentación / Autonomía": ["Alimentación / Autonomía", "Autonomía / Montaje", "Alimentación", "Batería / Alimentación"],
  "Tipo de Elemento": ["Tipo de Elemento", "Elemento Sensor", "Tipo de Sensor", "Sensor"],
  "Vaina / Material": ["Vaina / Material", "Material de Vaina", "Diámetro de Vaina", "Material de la Funda"],
  "Conexión a Proceso": ["Conexión a Proceso", "Conexión", "Rosca de Montaje", "Montaje"],
  "Salida / Cabeza": ["Salida / Cabeza", "Terminación", "Conector / Cable", "Salida de Señal"],
  "Tipo de Montaje": ["Tipo de Montaje", "Montaje", "Formato", "Estilo"],
  "Entrada de Sensor": ["Entrada de Sensor", "Entrada Analógica", "Entradas Compatibles", "Señales Compatibles"],
  "Salida / Protocolo": ["Salida / Protocolo", "Salida Analógica", "Protocolo de Comunicación", "Salida"],
  "Aislamiento / Precisión": ["Aislamiento / Precisión", "Aislamiento Eléctrico", "Precisión / Resolución", "Precisión"],
  "Rango de Medición": ["Rango de Medición", "Rango Humedad", "Rango Temperatura", "Rango"],
  "Rango de Presión": ["Rango de Presión", "Rango", "Rango de Medición"],
  "Tipo de Presión": ["Tipo de Presión", "Presión Relativa / Absoluta", "Tipo"],
  "T° Máx. Maza": ["T° Máx. Maza", "Temperatura Máxima de Cabeza", "T° Máx. Proceso"],
  "Tecnología de Medición": ["Tecnología de Medición", "Principio de Medición", "Tecnología"],
  "Material Sumergible / Carcasa": ["Material Sumergible / Carcasa", "Material del Cuerpo", "Protección"],
  "Gas Detectado": ["Gas Detectado", "Gas Medido", "Variable"],
  "Sensor / Tecnología": ["Sensor / Tecnología", "Sensor", "Tecnología de Medición"],
  "Tipo de Accesorio": ["Tipo de Accesorio", "Tipo de Producto", "Formato"],
  "Conexión a Proceso / Entrada": ["Conexión a Proceso / Entrada", "Conexión", "Conector"],
  "Rango / Grado": ["Rango / Grado", "Presión Máxima", "Rango"],
  "Etapa / Uso": ["Etapa / Uso", "Etapa de Cultivo", "Uso Recomendado"],
  "Orificio / Plug": ["Orificio / Plug", "Plug Compatible", "Orificio"],
  "Cultivos / Sistema": ["Cultivos / Sistema", "Compatibilidad", "Sistema de Riego"],
  Presentación: ["Presentación", "Cantidad", "Empaque"],
  Diámetro: ["Diámetro", "Diámetro de Aspas", "Tamaño"],
  "Velocidades / Oscilación": ["Velocidades / Oscilación", "Velocidades", "Oscilación"],
  "Entorno / Protección": ["Entorno / Protección", "Protección", "Uso Exterior"],
  "Tamaño / Modelo Compatible": ["Tamaño / Modelo Compatible", "Compatibilidad de Tamaño", "Modelo Compatible"],
  "Característica Principal": ["Característica Principal", "Función", "Característica"],
  "E/S Integradas": ["E/S Integradas", "Entradas / Salidas", "E/S", "I/O Integradas"],
  "Expansión E/S": ["Expansión E/S", "Expansión", "Módulos de Expansión"],
  "Comunicaciones": ["Comunicaciones", "Comunicación", "Puertos de Comunicación", "Protocolos"],
  "Memoria / Clase": ["Memoria / Clase", "Memoria", "Capacidad"],
  Pantalla: ["Pantalla", "Display", "Tamaño de Pantalla"],
  Táctil: ["Táctil", "Touchscreen", "Tipo Táctil"],
  Interfaces: ["Interfaces", "Puertos", "Conectividad"],
  Protocolos: ["Protocolos", "Protocolos Soportados", "Comunicaciones"],
  "Protección Frontal": ["Protección Frontal", "IP Frontal", "Protección"],
  Densidad: ["Densidad", "Densidad Nominal", "Peso Específico"],
  "T° Máxima": ["T° Máxima", "Temperatura Máxima", "Rango de Temperatura", "Temperatura Máxima de Trabajo"],
  Formato: ["Formato", "Presentación", "Tipo"],
  "Entrada / Rango": ["Entrada / Rango", "Entrada de Sensor", "Tipo de Entrada"],
  Salidas: ["Salidas", "Tipo de Salida", "Salidas de Control"],
  "Control / Perfil": ["Control / Perfil", "Tipo de Control", "Modo de Control"],
  "Funciones Especiales": ["Funciones Especiales", "Funciones", "Características"],
  "Capacidad de Carga": ["Capacidad de Carga", "Corriente Máxima", "Amperaje"],
  "Programación / Conectividad": ["Programación / Conectividad", "Programación", "Comunicación"],
  Sensor: ["Sensor", "Tipo de Sensor", "Elemento Sensor"],
  "Potencia Lineal": ["Potencia Lineal", "Potencia por Metro", "Potencia"],
  Longitud: ["Longitud", "Largo", "Dimensión"],
  "Conexión / Enchufe": ["Conexión / Enchufe", "Terminación", "Conector"],
  "Kit / Accesorios": ["Kit / Accesorios", "Accesorios Incluidos", "Incluye"],
  "Área Calefaccionada": ["Área Calefaccionada", "Área Cubierta", "Superficie"],
  "Potencia Específica": ["Potencia Específica", "Densidad de Potencia", "W/m²"],
  "Potencia Total": ["Potencia Total", "Potencia", "Vataje Total"],
  "Piso Compatible": ["Piso Compatible", "Tipo de Piso", "Compatibilidad"],
  Fase: ["Fase", "Número de Fases", "Tipo de Fase"],
  "Tipo de Módulo": ["Tipo de Módulo", "Función", "Módulo"],
  "Tensión / Señal": ["Tensión / Señal", "Señal", "Rango de Señal"],
  "Tipo de Salida": ["Tipo de Salida", "Salida", "Salidas"],
  Compatibilidad: ["Compatibilidad", "Modelos Compatibles", "Equipos Compatibles"],
}

const SKIP_AS_SPEC_COL = new Set(["Marca", "Brand", "Modelo", "Modelo exacto", "Descripción"])

function fold(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim()
}

const VARIANT_TO_CANONICAL = (() => {
  const m = new Map<string, string>()
  for (const [canon, variants] of Object.entries(SPEC_ALIASES)) {
    m.set(fold(canon), canon)
    for (const v of variants) m.set(fold(v), canon)
  }
  return m
})()

export function canonicalSpecKey(key: string): string {
  return VARIANT_TO_CANONICAL.get(fold(key)) || key.trim()
}

export function getSpecValueFromSpecs(
  specs: Record<string, string>,
  key: string,
  fallbacks?: {
    brand?: string
    mfrModel?: string
    itemNumber?: string
  }
): string {
  const canon = canonicalSpecKey(key)

  if (specs[key]?.trim()) return specs[key].trim()
  if (specs[canon]?.trim()) return specs[canon].trim()

  const aliases = SPEC_ALIASES[canon] || [canon, key]
  for (const [k, v] of Object.entries(specs)) {
    if (!v?.trim()) continue
    if (aliases.some((a) => fold(a) === fold(k)) || fold(k) === fold(canon)) {
      return v.trim()
    }
  }

  if (/^(marca|brand)$/i.test(canon) || /^(marca|brand)$/i.test(key)) {
    return (fallbacks?.brand || "").trim()
  }
  if (/^modelo/i.test(canon) || /^modelo/i.test(key)) {
    return (fallbacks?.mfrModel || fallbacks?.itemNumber || "").trim()
  }

  return ""
}

export function getSpecValue(product: CnProduct, key: string): string {
  return getSpecValueFromSpecs(product.specs || {}, key, {
    brand: product.brand,
    mfrModel: product.mfrModel,
    itemNumber: product.itemNumber,
  })
}

export function shouldSkipSpecColumn(key: string): boolean {
  return SKIP_AS_SPEC_COL.has(canonicalSpecKey(key)) || SKIP_AS_SPEC_COL.has(key)
}

/** Normalize warranty strings to canonical year buckets for facets. */
export function normalizeWarrantyValue(raw: string): string {
  const s = raw.trim()
  if (!s) return s
  const m = s.match(/(\d+)\s*(a[nñ]os?|years?|yr)/i)
  if (m) return `${m[1]} años`
  if (/limitad/i.test(s) && /(\d+)/.test(s)) {
    const n = s.match(/(\d+)/)?.[1]
    if (n) return `${n} años`
  }
  return s
}

/** Normalize a facet option value for known keys. */
export function normalizeFacetValue(facetKey: string, value: string): string {
  const label = facetKey.startsWith("spec:") ? facetKey.slice(5) : facetKey
  if (/garant/i.test(label)) return normalizeWarrantyValue(value)
  return value.trim()
}
