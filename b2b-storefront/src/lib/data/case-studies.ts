export interface CaseStudy {
  slug: string
  title: string
  subtitle: string
  industry: string
  location: string
  date: string
  summary: string
  featuredImage?: string
  problem: string[]
  solution: string[]
  technologies: string[]
  results: Array<{ metric: string; label: string }>
  relatedCategorySlug: string
  relatedCategory: string
  ctaText: string
  whatsappPreFill: string
}

export const CASE_STUDIES: CaseStudy[] = [
  {
    slug: "resistencias-electricas-prevenir-cortocircuitos",
    title: "Resistencias Eléctricas para Prevenir Condensación y Cortocircuitos en Generadores",
    subtitle: "Protección térmica en central hidroeléctrica en la cuenca Matucana - Chosica (Lima)",
    industry: "Generación de Energía / Hidroeléctricas",
    location: "Matucana - Chosica, Lima",
    date: "2025-08-05",
    summary:
      "Implementación de calefactores eléctricos de estator para mantener la temperatura interna de los bobinados por encima del punto de rocío (19 °C) durante paradas operativas, evitando caídas en el aislamiento dieléctrico y fallas por humedad.",
    problem: [
      "Temperaturas exteriores de hasta 4 °C y alta humedad ambiental durante paradas técnicas del generador.",
      "Condensación de vapor de agua en los estatores y bobinados de la central hidroeléctrica.",
      "Reducción drástica del aislamiento dieléctrico y riesgo inminente de cortocircuitos durante el arranque.",
      "Deterioro acelerado de componentes electromecánicos por presencia recurrente de humedad.",
    ],
    solution: [
      "Cálculo de dimensionamiento térmico para mantener la temperatura del estator por encima de 19 °C.",
      "Suministro e instalación de resistencias eléctricas calefactoras de espacio distribuidas en los bobinados.",
      "Integración de termostatos de control y relés para encendido y apagado automático durante paradas del generador.",
      "Verificación de aislamiento con megóhmetro antes y después de la energización del sistema.",
    ],
    technologies: [
      "Resistencias calefactoras de espacio para generadores",
      "Controladores de temperatura y termostatos industriales",
      "Sensores de temperatura PT100",
      "Aislamiento de terminales de alta rigidez dieléctrica",
    ],
    results: [
      { metric: "> 19 °C", label: "Temperatura interna mantenida sobre el punto de rocío" },
      { metric: "100%", label: "Eliminación de condensación en bobinados" },
      { metric: "0 Fallas", label: "Continuidad y seguridad en el arranque de la central" },
    ],
    relatedCategorySlug: "calefaccion-electrica",
    relatedCategory: "Calefacción Eléctrica Industrial",
    ctaText: "Consultar Calefactores para Generadores por WhatsApp",
    whatsappPreFill: "Hola Control Nautas, deseo consultar sobre resistencias calefactoras para generadores y control de condensación.",
  },
  {
    slug: "heat-tracing-evitar-congelamiento",
    title: "Sistema de Heat Tracing para Protección contra Congelamiento de Tuberías en Minería",
    subtitle: "Trazado térmico eléctrico autorregulable en operaciones industriales de alta montaña",
    industry: "Minería y Metalurgia",
    location: "Sierra Central del Perú",
    date: "2025-08-13",
    summary:
      "Instalación de cables calefactores autorregulables Huanrui 25MSR-PF para evitar la congelación de tuberías de agua y procesos expuestas a temperaturas de entre -10 °C y -15 °C, eliminando choques térmicos causados por métodos convencionales con vapor.",
    problem: [
      "Congelamiento severo de tuberías durante noches de invierno con temperaturas entre -10 °C y -15 °C.",
      "Parálisis de operaciones hasta el mediodía esperando el descongelamiento natural de las líneas.",
      "Roturas y fugas recurrentes por la expansión del hielo dentro de las tuberías metálicas.",
      "El uso previo de vapor excedente de calderas generaba choques térmicos violentos y fallas en bridas.",
    ],
    solution: [
      "Diseño técnico con cable calefactor autorregulable Huanrui modelo 25MSR-PF (25 W/m a 10 °C).",
      "Instalación longitudinal fijada con cinta de aluminio de alta conductividad para maximizar la transferencia térmica.",
      "Colocación de aislamiento térmico exterior de lana mineral con chaqueta de protección contra intemperie.",
      "Automatización con termostatos de control de temperatura ambiente y de línea.",
    ],
    technologies: [
      "Cable calefactor autorregulable Huanrui 25MSR-PF",
      "Cinta de fijación de aluminio termoconductora",
      "Aislamiento térmico para tuberías en intemperie",
      "Kits de terminación, empalme y cajas de conexión NEMA 4X",
    ],
    results: [
      { metric: "-15 °C", label: "Protección efectiva garantizada bajo cero" },
      { metric: "24/7", label: "Continuidad operativa sin retrasos en invierno" },
      { metric: "0 Roturas", label: "Eliminación total de daños por congelación" },
    ],
    relatedCategorySlug: "trazado-termico",
    relatedCategory: "Trazado Térmico Eléctrico (Heat Tracing)",
    ctaText: "Cotizar Cable Huanrui 25MSR-PF por WhatsApp",
    whatsappPreFill: "Hola Control Nautas, deseo cotizar cable calefactor Huanrui para protección contra congelamiento de tuberías.",
  },
  {
    slug: "control-temperatura-datacenters-akcp",
    title: "Monitoreo Ambiental Certificado para Datacenters de Alta Criticidad con AKCP",
    subtitle: "Control térmico y detección temprana de fugas para compañía aseguradora en Lima",
    industry: "Data Centers y Banca",
    location: "Lima, Perú",
    date: "2025-08-20",
    summary:
      "Diseño e implementación de un sistema integral de monitoreo ambiental con controladores y sensores AKCP SensorProbe+, cumpliendo con las certificaciones internacionales exigidas por las pólizas de seguros de infraestructura TI.",
    problem: [
      "Inestabilidad térmica y acumulación desigual de calor entre diferentes pisos del centro de cómputo.",
      "Filtraciones menores de condensado en drenajes y ductos que ponían en riesgo racks de servidores.",
      "El sistema anterior con sensores industriales genéricos fue rechazado por la póliza de seguros por no contar con certificación específica para datacenters.",
      "Riesgo de suspensión de cobertura y exposición de equipamiento informático de alto valor.",
    ],
    solution: [
      "Instalación de unidades maestras AKCP SensorProbe+ distribuidas en los diferentes pisos del datacenter.",
      "Despliegue de sensores inteligentes dobles de temperatura y humedad a la entrada y salida de aire de los racks.",
      "Integración de sensores de detección de líquidos por cable spot en zonas perimetrales y bajo piso técnico.",
      "Configuración de alertas tempranas automáticas vía SNMP traps y correo electrónico para el personal de operaciones.",
    ],
    technologies: [
      "Controladores maestros AKCP SensorProbe+ (SP1+ / SP2+)",
      "Sensores dobles de temperatura y humedad calibrados",
      "Sensores de detección de inundación y fugas de agua",
      "Software de gestión centralizada y monitoreo SNMP",
    ],
    results: [
      { metric: "100%", label: "Cumplimiento de estándares de certificación para seguros" },
      { metric: "24/7", label: "Monitoreo continuo de temperatura, humedad y fugas" },
      { metric: "Inmediata", label: "Notificación de alertas tempranas ante anomalías" },
    ],
    relatedCategorySlug: "monitoreo-ambiental",
    relatedCategory: "Monitoreo Ambiental de Datacenters",
    ctaText: "Consultar Soluciones AKCP para Datacenter por WhatsApp",
    whatsappPreFill: "Hola Control Nautas, requiero información y cotización de sensores y unidades AKCP para monitoreo de centros de datos.",
  },
  {
    slug: "solucion-lana-de-roca-en-calderas-peru",
    title: "Aislamiento Térmico y Calefacción para Petróleo A50 en Calderas Pesqueras",
    subtitle: "Continuidad en el arranque de calderas de vapor tras paradas por veda en el litoral peruano",
    industry: "Pesca y Harina de Pescado",
    location: "Litoral Peruano",
    date: "2025-08-28",
    summary:
      "Aislamiento térmico con lana de roca de alta densidad en tanque de 30 m³ y tuberías, complementado con calentador eléctrico de paso de 30 kW para mantener el combustible pesado Petróleo A50 a temperatura ideal de inyección.",
    problem: [
      "Enfriamiento y solidificación del petróleo A50 en el tanque de 30 m³ y líneas durante periodos de veda y mantenimiento.",
      "Imposibilidad de encendido inmediato de las calderas de vapor al reanudar la producción.",
      "Pérdidas de horas hombre y costos elevados al recurrir a métodos externos lentos de calentamiento.",
      "Pérdidas térmicas constantes hacia el ambiente por aislamiento degradado.",
    ],
    solution: [
      "Aislamiento térmico del tanque de 30 m³ y líneas de combustible con paneles de lana de roca de alta densidad.",
      "Protección mecánica del aislamiento mediante chaquetas metálicas resistentes a la brisa marina.",
      "Instalación de un calentador eléctrico de paso de 30 kW para elevar el combustible a temperatura de atomización.",
      "Sistema de control automático simple con termostato para mantener el petróleo en rango óptimo de fluidez.",
    ],
    technologies: [
      "Lana de roca mineral de alta densidad en paneles y mantas",
      "Calentador eléctrico de paso de 30 kW",
      "Chaquetas de aluminio de protección anticorrosiva",
      "Termostatos y sensores de control de temperatura",
    ],
    results: [
      { metric: "30 m³", label: "Tanque y líneas mantenidos a temperatura de fluidez" },
      { metric: "Inmediato", label: "Arranque de calderas de vapor sin demoras tras veda" },
      { metric: "> 7 Años", label: "Operación continua y confiable de la solución instalada" },
    ],
    relatedCategorySlug: "aislamiento-termico",
    relatedCategory: "Aislamiento Térmico con Lana de Roca",
    ctaText: "Cotizar Lana de Roca para Calderas por WhatsApp",
    whatsappPreFill: "Hola Control Nautas, solicito cotización de aislamiento térmico con lana de roca para calderas y tanques.",
  },
  {
    slug: "prevencion-avanzada-congelamiento-heat-tracing",
    title: "Trazado Térmico Eléctrico para Prevención de Congelamiento de Fluidos Químicos",
    subtitle: "Mantenimiento de fluidez en líneas de metabisulfito, sulfato de cobre y duchas de emergencia",
    industry: "Química y Procesos Industriales",
    location: "Planta Industrial en Perú",
    date: "2025-09-01",
    summary:
      "Trazado térmico eléctrico autorregulable serie SRM/E para evitar la cristalización y solidificación de productos químicos sensibles en tuberías, válvulas, bombas y duchas de seguridad en condiciones de frío.",
    problem: [
      "Fluidos químicos sensibles (metabisulfito, sulfato de cobre, anticrustantes) con alto riesgo de solidificación nocturna.",
      "Bloqueos frecuentes por obstrucción en válvulas y bombas que requerían purgas manuales y pausas operativas.",
      "Riesgo de inoperatividad en duchas de seguridad y líneas de lavado de emergencia por congelamiento.",
      "Pérdida de propiedades y cristalización de reactivos durante el transporte por tuberías.",
    ],
    solution: [
      "Instalación de cables calefactores autorregulables serie SRM/E diseñados para fluidos de proceso.",
      "Trazado térmico en puntos críticos: cuerpos de válvulas, bombas dosificadoras y tuberías de alimentación.",
      "Montaje de aislamiento térmico con chaqueta exterior protectora contra agentes químicos.",
      "Control termostático automático que activa el sistema cuando la temperatura desciende por debajo del límite seguro.",
    ],
    technologies: [
      "Cables calefactores autorregulables serie SRM/E",
      "Kits de conexión eléctrica y empalmes estancos",
      "Termostatos mecánicos de bulbo y capilar",
      "Aislamiento térmico industrial resistente a corrosión",
    ],
    results: [
      { metric: "100%", label: "Fluidez constante de reactivos químicos sin cristalización" },
      { metric: "Operativas", label: "Disponibilidad permanente de duchas de seguridad" },
      { metric: "0 Purgas", label: "Eliminación de paradas no programadas por obstrucción" },
    ],
    relatedCategorySlug: "trazado-termico",
    relatedCategory: "Trazado Térmico Industrial",
    ctaText: "Consultar Trazado Térmico para Químicos por WhatsApp",
    whatsappPreFill: "Hola Control Nautas, deseo asesoría técnica sobre trazado térmico eléctrico para fluidos químicos y tuberías.",
  },
]
