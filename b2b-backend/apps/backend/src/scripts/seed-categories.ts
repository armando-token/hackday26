import { ExecArgs } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"
import { assertDestructiveLegacyAllowed } from "./lib/legacy-script-guard"

export default async function seedCategoriesAndProducts({ container }: ExecArgs) {
  assertDestructiveLegacyAllowed("seed-categories.ts")
  const logger = container.resolve("logger")
  const productModule = container.resolve(Modules.PRODUCT)

  logger.info("Eliminando categorías de prueba demo...")
  const currentCategories = await productModule.listProductCategories({}, { take: 100 })
  for (const cat of currentCategories) {
    if (["shirts", "sweatshirts", "pants", "merch"].includes(cat.handle)) {
      try {
        await productModule.deleteProductCategories([cat.id])
        logger.info(`🧹 Eliminada: ${cat.name}`)
      } catch (e) {}
    }
  }

  const TAXONOMY_L1 = [
    {
      name: "Calefacción Eléctrica Industrial",
      handle: "calefaccion-electrica",
      description: "Calentadores de inmersión, unit heaters, bandas, cartuchos, convectores y ductos industriales.",
      children: [
        { name: "Calentadores de Inmersión", handle: "inmersion" },
        { name: "Unit Heaters Industriales", handle: "unit-heaters-industriales" },
        { name: "Unit Heaters Compactos", handle: "unit-heaters-compactos" },
        { name: "Calefactores de Cartucho", handle: "cartuchos" },
        { name: "Resistencias de Banda y Abrazadera", handle: "bandas" },
        { name: "Calefactores de Tira (Strips)", handle: "strips" },
        { name: "Calefactores de Pared y Convección", handle: "pared-conveccion" },
        { name: "Calefactores Portátiles e Industriales", handle: "portatiles" },
        { name: "Calefactores de Ducto, MAU y Plenum", handle: "ducto-mau-plenum" },
        { name: "Calefacción Antiexplosión (Hazardous)", handle: "antiexplosion" },
        { name: "Calefactores de Zócalo (Baseboard)", handle: "zocalo" },
        { name: "Radiante e Infrarrojo Industrial", handle: "radiante-infrarrojo" },
      ],
    },
    {
      name: "Aislamiento Térmico",
      handle: "aislamiento-termico",
      description: "Lana de roca mineral, cañuelas, mantas, espuma elastomérica y paneles sándwich aislantes.",
      children: [
        { name: "Paneles y Placas de Lana Mineral", handle: "paneles-lana-roca" },
        { name: "Mantas y Cañuelas Aislantes", handle: "mantas-canuelas" },
        { name: "Aislamiento Elastomérico y Accesorios", handle: "espuma-elastomerica" },
        { name: "Paneles Sándwich Aislantes", handle: "paneles-sandwich" },
      ],
    },
    {
      name: "Automatización PLC y HMI",
      handle: "automatizacion-plc-hmi",
      description: "PLC+HMI todo en uno, PLC sin pantalla, E/S de expansión y módulos de control remoto.",
      children: [
        { name: "PLC + HMI Todo en Uno", handle: "plc-hmi" },
        { name: "PLC y Controladores sin Pantalla", handle: "controladores-remotos" },
        { name: "Módulos de Expansión E/S (I/O)", handle: "expansion-io" },
      ],
    },
    {
      name: "Control e Indicación",
      handle: "control-e-indicacion",
      description: "Controladores PID de procesos, indicadores digitales y termostatos de línea.",
      children: [
        { name: "Controladores PID de Proceso", handle: "controladores-pid" },
        { name: "Indicadores Digitales de Proceso", handle: "indicadores-proceso" },
        { name: "Termostatos de Línea y Ambiente", handle: "termostatos-linea" },
        { name: "Controles de Deshielo y Nieve", handle: "controles-deshielo" },
      ],
    },
    {
      name: "Sensores y Transmisores",
      handle: "sensores-transmisores",
      description: "Termopares, RTD Pt100, presión de proceso, melt pressure, nivel y humedad.",
      children: [
        { name: "Temperatura: Termopares y RTD", handle: "temperatura-termopar-rtd" },
        { name: "Transmisores de Temperatura de Cabezal y Riel", handle: "transmisores" },
        { name: "Presión de Proceso y Melt Pressure", handle: "presion-proceso" },
        { name: "Humedad y Temperatura Ambiental", handle: "humedad-temperatura" },
        { name: "Sensores de Nivel y Flotador", handle: "nivel" },
        { name: "Sensores Ambientales de Sala y Data Center", handle: "sensores-ambientales" },
      ],
    },
    {
      name: "Registro de Datos (Data Loggers)",
      handle: "registro-de-datos",
      description: "Data loggers para cadena de frío, farmacéutica y monitoreo industrial multicanal.",
      children: [
        { name: "Data Loggers para Cadena de Frío (USB/BLE/Cloud)", handle: "loggers-cadena-frio" },
        { name: "Data Loggers Industriales Multicanal (Wi-Fi/Ethernet/4G)", handle: "loggers-industriales" },
      ],
    },
    {
      name: "Trazado Térmico (Heat Tracing)",
      handle: "trazado-termico",
      description: "Cables autorregulables, deshielo de techos y suelo radiante industrial.",
      children: [
        { name: "Cables Calefactores Autorregulables", handle: "cable-autorregulable" },
        { name: "Deshielo de Techos y Canalones", handle: "techos-canalones" },
        { name: "Deshielo de Nieve en Rampas y Pisos", handle: "deshielo-nieve" },
        { name: "Suelo Radiante Eléctrico", handle: "suelo-radiante" },
      ],
    },
    {
      name: "Monitoreo Data Center e IoT",
      handle: "monitoreo-data-center",
      description: "Plataformas de monitoreo ambiental para salas de servidores y centros de datos.",
      children: [
        { name: "Plataformas de Monitoreo Centralizado", handle: "plataformas" },
        { name: "Gateways y Enlaces de Comunicación IoT", handle: "gateways" },
        { name: "Módulos de Relés y Control E/S Remoto", handle: "io-relays" },
      ],
    },
    {
      name: "Otros Equipos y Accesorios",
      handle: "otros",
      description: "Ventilación industrial, aislamiento PIR y accesorios complementarios.",
      children: [
        { name: "Ventilación Industrial", handle: "ventilacion" },
        { name: "Poliuretano y PIR Rígido", handle: "pir-poliuretano" },
        { name: "Resistencias Especiales de Proceso", handle: "resistencias-proceso" },
      ],
    },
  ]

  let countCreated = 0
  for (const l1 of TAXONOMY_L1) {
    let l1Cat = (await productModule.listProductCategories({ handle: l1.handle }))[0]
    if (!l1Cat) {
      l1Cat = await productModule.createProductCategories({
        name: l1.name,
        handle: l1.handle,
        description: l1.description,
      })
      countCreated++
    }

    if (l1.children) {
      for (const l2 of l1.children) {
        let l2Cat = (await productModule.listProductCategories({ handle: l2.handle }))[0]
        if (!l2Cat) {
          l2Cat = await productModule.createProductCategories({
            name: l2.name,
            handle: l2.handle,
            parent_category_id: l1Cat.id,
          })
          countCreated++
        }
      }
    }
  }

  logger.info(`✅ ${countCreated} Categorías creadas en Medusa`)
  const total = await productModule.listProductCategories({}, { take: 100 })
  logger.info(`✅ Total categorías ahora en Medusa: ${total.length}`)
}
