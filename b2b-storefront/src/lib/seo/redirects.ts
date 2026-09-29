/**
 * Mapa Maestro de Redirecciones SEO (301 Permanentes)
 * Migración Legacy WordPress/WooCommerce -> Next.js / Medusa B2B
 * Preservación completa de URLs de Search Console (categorías, artículos fechados, productos y PDFs).
 */

export const LEGACY_EXACT_REDIRECTS: Record<string, string> = {
  // 1. Alias de Products Prioritarios de GSC
  "/panel-de-lana-de-roca-rockwool-prorox-sl-920": "/pe/store/aislamiento-termico/paneles-lana-roca",
  "/panel-de-lana-de-roca-rockwool-prorox-sl-920/": "/pe/store/aislamiento-termico/paneles-lana-roca",
  "/producto/panel-de-lana-de-roca-rockwool-prorox-sl-920": "/pe/store/aislamiento-termico/paneles-lana-roca",
  "/producto/panel-de-lana-de-roca-rockwool-prorox-sl-920/": "/pe/store/aislamiento-termico/paneles-lana-roca",
  
  "/controlador-de-temperatura-de-3-salidas-independientes-n323": "/pe/products/controlador-novus-n323-pt100-rs485",
  "/controlador-de-temperatura-de-3-salidas-independientes-n323/": "/pe/products/controlador-novus-n323-pt100-rs485",
  "/producto/controlador-de-temperatura-de-3-salidas-independientes-n323": "/pe/products/controlador-novus-n323-pt100-rs485",

  "/controlador-digital-de-humedad-relativa-y-temperatura-n323rht": "/pe/products/novus-n323-rht",
  "/controlador-digital-de-humedad-relativa-y-temperatura-n323rht/": "/pe/products/novus-n323-rht",
  "/producto/controlador-digital-de-humedad-relativa-y-temperatura-n323rht": "/pe/products/novus-n323-rht",
  "/producto/controlador-digital-de-humedad-relativa-y-temperatura-n323rht/": "/pe/products/novus-n323-rht",
  "/pe/products/controlador-digital-de-humedad-relativa-y-temperatura-n323rht": "/pe/products/novus-n323-rht",
  "/pe/products/controlador-digital-de-humedad-relativa-y-temperatura-n323rht/": "/pe/products/novus-n323-rht",

  "/sensorprobex-akcp": "/pe/products/akcp-sensorprobex",
  "/sensorprobex-akcp/": "/pe/products/akcp-sensorprobex",
  "/producto/sensorprobex-akcp": "/pe/products/akcp-sensorprobex",

  "/cubierta-resistente-al-agua-fo-cover-24": "/pe/products/funda-resistente-al-agua-fo-cover-24",
  "/cubierta-resistente-al-agua-fo-cover-24/": "/pe/products/funda-resistente-al-agua-fo-cover-24",
  "/producto/cubierta-resistente-al-agua-fo-cover-24": "/pe/products/funda-resistente-al-agua-fo-cover-24",

  "/producto/contenedor-modular-prefabricado": "/pe/store/aislamiento-termico",
  "/producto/contenedor-modular-prefabricado/": "/pe/store/aislamiento-termico",
  "/producto/horner-x4-micro-ocs-series-plc-todo-en-uno": "/pe/store/automatizacion-plc-hmi",
  "/producto/horner-x4-micro-ocs-series-plc-todo-en-uno/": "/pe/store/automatizacion-plc-hmi",

  // 2. Case Studies Históricos con Fechas de WordPress
  "/2025/08/05/control-industrial-resistencias-electricas-peru": "/pe/casos-de-exito/resistencias-electricas-prevenir-cortocircuitos",
  "/2025/08/05/control-industrial-resistencias-electricas-peru/": "/pe/casos-de-exito/resistencias-electricas-prevenir-cortocircuitos",
  "/control-industrial-resistencias-electricas-peru": "/pe/casos-de-exito/resistencias-electricas-prevenir-cortocircuitos",
  "/control-industrial-resistencias-electricas-peru/": "/pe/casos-de-exito/resistencias-electricas-prevenir-cortocircuitos",

  "/2025/08/13/eliminacion-congelamiento-heat-tracing-peru": "/pe/casos-de-exito/heat-tracing-evitar-congelamiento",
  "/2025/08/13/eliminacion-congelamiento-heat-tracing-peru/": "/pe/casos-de-exito/heat-tracing-evitar-congelamiento",
  "/eliminacion-congelamiento-heat-tracing-peru": "/pe/casos-de-exito/heat-tracing-evitar-congelamiento",
  "/eliminacion-congelamiento-heat-tracing-peru/": "/pe/casos-de-exito/heat-tracing-evitar-congelamiento",

  "/2025/08/20/control-temperatura-datacenters-akcp": "/pe/casos-de-exito/control-temperatura-datacenters-akcp",
  "/2025/08/20/control-temperatura-datacenters-akcp/": "/pe/casos-de-exito/control-temperatura-datacenters-akcp",
  "/control-temperatura-datacenters-akcp": "/pe/casos-de-exito/control-temperatura-datacenters-akcp",
  "/control-temperatura-datacenters-akcp/": "/pe/casos-de-exito/control-temperatura-datacenters-akcp",

  "/2025/08/28/solucion-lana-de-roca-en-calderas-peru": "/pe/casos-de-exito/solucion-lana-de-roca-en-calderas-peru",
  "/2025/08/28/solucion-lana-de-roca-en-calderas-peru/": "/pe/casos-de-exito/solucion-lana-de-roca-en-calderas-peru",
  "/solucion-lana-de-roca-en-calderas-peru": "/pe/casos-de-exito/solucion-lana-de-roca-en-calderas-peru",
  "/solucion-lana-de-roca-en-calderas-peru/": "/pe/casos-de-exito/solucion-lana-de-roca-en-calderas-peru",

  "/2025/09/01/prevencion-congelamiento-heat-tracing-peru": "/pe/casos-de-exito/prevencion-avanzada-congelamiento-heat-tracing",
  "/2025/09/01/prevencion-congelamiento-heat-tracing-peru/": "/pe/casos-de-exito/prevencion-avanzada-congelamiento-heat-tracing",
  "/prevencion-congelamiento-heat-tracing-peru": "/pe/casos-de-exito/prevencion-avanzada-congelamiento-heat-tracing",
  "/prevencion-congelamiento-heat-tracing-peru/": "/pe/casos-de-exito/prevencion-avanzada-congelamiento-heat-tracing",

  // 3. Artículos Históricos Adicionales de GSC
  "/2025/02/22/x5-ocs-controlador-horner": "/pe/store/automatizacion-plc-hmi",
  "/2025/02/22/x5-ocs-controlador-horner/": "/pe/store/automatizacion-plc-hmi",
  "/2025/02/22/ocs-x4-horner": "/pe/store/automatizacion-plc-hmi",
  "/2025/02/22/ocs-x4-horner/": "/pe/store/automatizacion-plc-hmi",
  "/2025/05/31/8-diferentes-centros-de-datos-peru": "/pe/casos-de-exito/control-temperatura-datacenters-akcp",
  "/2025/05/31/8-diferentes-centros-de-datos-peru/": "/pe/casos-de-exito/control-temperatura-datacenters-akcp",
  "/2025/06/02/22-variables-medicion-sensor-data-center-peru": "/pe/casos-de-exito/control-temperatura-datacenters-akcp",
  "/2025/06/02/22-variables-medicion-sensor-data-center-peru/": "/pe/casos-de-exito/control-temperatura-datacenters-akcp",
  "/2025/06/03/21-motivos-mantenimiento-ia-data-centers-peru": "/pe/casos-de-exito/control-temperatura-datacenters-akcp",
  "/2025/06/03/21-motivos-mantenimiento-ia-data-centers-peru/": "/pe/casos-de-exito/control-temperatura-datacenters-akcp",
  "/2025/06/04/20-ventajas-monitoreo-data-center-peru": "/pe/casos-de-exito/control-temperatura-datacenters-akcp",
  "/2025/06/04/20-ventajas-monitoreo-data-center-peru/": "/pe/casos-de-exito/control-temperatura-datacenters-akcp",
  "/2025/06/05/14-sensores-akcp-data-centers-ia-peru": "/pe/casos-de-exito/control-temperatura-datacenters-akcp",
  "/2025/06/05/14-sensores-akcp-data-centers-ia-peru/": "/pe/casos-de-exito/control-temperatura-datacenters-akcp",
  "/2025/06/09/33-mejoras-operativas-sensores-akcp-peru": "/pe/casos-de-exito/control-temperatura-datacenters-akcp",
  "/2025/06/09/33-mejoras-operativas-sensores-akcp-peru/": "/pe/casos-de-exito/control-temperatura-datacenters-akcp",
  "/2025/06/26/8-razones-paneles-sandwich-construccion-moderna": "/pe/store/aislamiento-termico",
  "/2025/06/26/8-razones-paneles-sandwich-construccion-moderna/": "/pe/store/aislamiento-termico",
  "/2025/08/12/aislamiento-lana-de-roca-eficiencia-acustica": "/pe/store/aislamiento-termico",
  "/2025/08/12/aislamiento-lana-de-roca-eficiencia-acustica/": "/pe/store/aislamiento-termico",

  // 4. Mapeo Explícito de 30 Categorías de WooCommerce a Taxonomía Nueva
  "/categoria-producto/lana-de-roca": "/pe/store/aislamiento-termico",
  "/categoria-producto/lana-de-roca/": "/pe/store/aislamiento-termico",
  "/categoria-producto/lana-de-roca/panel-lana-de-roca": "/pe/store/aislamiento-termico",
  "/categoria-producto/lana-de-roca/panel-lana-de-roca/": "/pe/store/aislamiento-termico",
  "/categoria-producto/espuma-elastomerica": "/pe/store/aislamiento-termico",
  "/categoria-producto/espuma-elastomerica/": "/pe/store/aislamiento-termico",
  "/categoria-producto/espuma-elastomerica/cintas-y-royos": "/pe/store/aislamiento-termico",
  "/categoria-producto/espuma-elastomerica/cintas-y-royos/": "/pe/store/aislamiento-termico",
  "/categoria-producto/poliuretano": "/pe/store/aislamiento-termico",
  "/categoria-producto/poliuretano/": "/pe/store/aislamiento-termico",

  "/categoria-producto/calentadores": "/pe/store/calefaccion-electrica",
  "/categoria-producto/calentadores/": "/pe/store/calefaccion-electrica",
  "/categoria-producto/calentadores-electricos/cable-calefactor": "/pe/store/trazado-termico",
  "/categoria-producto/calentadores-electricos/cable-calefactor/": "/pe/store/trazado-termico",
  "/categoria-producto/calefactores-para-invernadero": "/pe/store/calefaccion-electrica",
  "/categoria-producto/calefactores-para-invernadero/": "/pe/store/calefaccion-electrica",

  "/categoria-producto/plc-scada/plc-todo-en-uno": "/pe/store/automatizacion-plc-hmi",
  "/categoria-producto/plc-scada/plc-todo-en-uno/": "/pe/store/automatizacion-plc-hmi",
  "/categoria-producto/plc-scada/plc-todo-en-uno/xl-series": "/pe/store/automatizacion-plc-hmi",
  "/categoria-producto/plc-scada/plc-todo-en-uno/xl-series/": "/pe/store/automatizacion-plc-hmi",
  "/categoria-producto/control-e-indicacion": "/pe/store/automatizacion-plc-hmi",
  "/categoria-producto/control-e-indicacion/": "/pe/store/automatizacion-plc-hmi",
  "/categoria-producto/control-e-indicacion/controladores": "/pe/store/automatizacion-plc-hmi",
  "/categoria-producto/control-e-indicacion/controladores/": "/pe/store/automatizacion-plc-hmi",
  "/categoria-producto/control-e-indicacion/indicadores": "/pe/store/automatizacion-plc-hmi",
  "/categoria-producto/control-e-indicacion/indicadores/": "/pe/store/automatizacion-plc-hmi",

  "/categoria-producto/sensores-y-transmisores": "/pe/store/monitoreo-ambiental",
  "/categoria-producto/sensores-y-transmisores/": "/pe/store/monitoreo-ambiental",
  "/categoria-producto/sensores-y-transmisores/sensores-temperatura": "/pe/store/monitoreo-ambiental",
  "/categoria-producto/sensores-y-transmisores/sensores-temperatura/": "/pe/store/monitoreo-ambiental",
  "/categoria-producto/sensores-y-transmisores/transmisores-temperatura": "/pe/store/monitoreo-ambiental",
  "/categoria-producto/sensores-y-transmisores/transmisores-temperatura/": "/pe/store/monitoreo-ambiental",
  "/categoria-producto/sensores-y-transmisores/humedad-y-temperatura": "/pe/store/monitoreo-ambiental",
  "/categoria-producto/sensores-y-transmisores/humedad-y-temperatura/": "/pe/store/monitoreo-ambiental",
  "/categoria-producto/sensores-y-transmisores/humedad-y-temperatur": "/pe/store/monitoreo-ambiental",
  "/categoria-producto/sensores-y-transmisores/humedad-y-temperatur/": "/pe/store/monitoreo-ambiental",

  "/categoria-producto/comunicacion-y-datos": "/pe/store/monitoreo-ambiental",
  "/categoria-producto/comunicacion-y-datos/": "/pe/store/monitoreo-ambiental",
  "/categoria-producto/comunicacion-y-datos/data-loggers": "/pe/store/monitoreo-ambiental",
  "/categoria-producto/comunicacion-y-datos/data-loggers/": "/pe/store/monitoreo-ambiental",
  "/categoria-producto/comunicacion-y-datos/registrador": "/pe/store/monitoreo-ambiental",
  "/categoria-producto/comunicacion-y-datos/registrador/": "/pe/store/monitoreo-ambiental",

  "/categoria-producto/aire-acondicionado": "/pe/store/ventilacion-extraccion",
  "/categoria-producto/aire-acondicionado/": "/pe/store/ventilacion-extraccion",
  "/categoria-producto/ventiladores-de-alta-velocidad": "/pe/store/ventilacion-extraccion",
  "/categoria-producto/ventiladores-de-alta-velocidad/": "/pe/store/ventilacion-extraccion",
  "/categoria-producto/ventiladores-de-alta-velocidad/fundas-para-ventiladores": "/pe/store/ventilacion-extraccion",
  "/categoria-producto/ventiladores-de-alta-velocidad/fundas-para-ventiladores/": "/pe/store/ventilacion-extraccion",
  "/categoria-producto/presion": "/pe/store/instrumentacion-valvulas",
  "/categoria-producto/presion/": "/pe/store/instrumentacion-valvulas",

  // 5. Páginas Institucionales y Comerciales
  "/sobre-nosotros": "/pe/nosotros",
  "/sobre-nosotros/": "/pe/nosotros",
  "/contactanos": "/pe/contacto",
  "/contactanos/": "/pe/contacto",
  "/contact": "/pe/contacto",
  "/contact/": "/pe/contacto",
  "/tienda": "/pe/store",
  "/tienda/": "/pe/store",
  "/catalogo": "/pe/store",
  "/catalogo/": "/pe/store",
  "/envios": "/pe/entregas-y-devoluciones",
  "/envios/": "/pe/entregas-y-devoluciones",
  "/devoluciones": "/pe/entregas-y-devoluciones",
  "/devoluciones/": "/pe/entregas-y-devoluciones",
  "/reembolso_devoluciones": "/pe/entregas-y-devoluciones",
  "/reembolso_devoluciones/": "/pe/entregas-y-devoluciones",
  "/reembolso-devoluciones": "/pe/entregas-y-devoluciones",
  "/reembolso-devoluciones/": "/pe/entregas-y-devoluciones",
  "/politica-de-privacidad": "/pe/politica-de-privacidad",
  "/politica-de-privacidad/": "/pe/politica-de-privacidad",
  "/politicas-de-privacidad": "/pe/politica-de-privacidad",
  "/politicas-de-privacidad/": "/pe/politica-de-privacidad",
  "/terminos-de-servicio": "/pe/terminos-y-condiciones",
  "/terminos-de-servicio/": "/pe/terminos-y-condiciones",
  "/terminos-y-condiciones": "/pe/terminos-y-condiciones",
  "/terminos-y-condiciones/": "/pe/terminos-y-condiciones",
}

/**
 * Obtiene la ruta de redirección para una URL solicitada si existe un mapeo legado.
 */
export function getLegacyRedirect(pathname: string): string | null {
  const cleanPath = pathname.toLowerCase().replace(/\/+$/, "") || "/"
  
  // 1. Coincidencia exacta
  if (LEGACY_EXACT_REDIRECTS[cleanPath]) {
    return LEGACY_EXACT_REDIRECTS[cleanPath]
  }
  if (LEGACY_EXACT_REDIRECTS[`${cleanPath}/`]) {
    return LEGACY_EXACT_REDIRECTS[`${cleanPath}/`]
  }

  // 2. Prefijos de WooCommerce para productos
  if (cleanPath.startsWith("/producto/")) {
    const slug = cleanPath.replace("/producto/", "").replace(/\/$/, "")
    return `/pe/products/${slug}`
  }

  // 3. Prefijos de WooCommerce para categorías
  if (cleanPath.startsWith("/categoria-producto/")) {
    const catSlug = cleanPath.replace("/categoria-producto/", "").replace(/\/$/, "").split("/")[0]
    return `/pe/store`
  }

  if (cleanPath.startsWith("/tag-producto/")) {
    return `/pe/store`
  }

  // 4. PDFs históricos en uploads -> redirigir al catálogo o contacto
  if (cleanPath.startsWith("/wp-content/uploads/") && cleanPath.endsWith(".pdf")) {
    return `/pe/store`
  }

  return null
}
