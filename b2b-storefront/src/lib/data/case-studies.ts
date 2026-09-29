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
    title: "Electric heaters to prevent condensation and short circuits in generators",
    subtitle: "Thermal protection at a hydroelectric plant",
    industry: "Power generation / Hydropower",
    location: "Hydro plant site",
    date: "2025-08-05",
    summary:
      "Stator space heaters keep winding temperature above the dew point during outages, preventing dielectric insulation drop and moisture-related failures.",
    problem: [
      "Low outdoor temperatures and high humidity during generator outages",
      "Condensation on stator windings",
      "Sharp drop in dielectric insulation and short-circuit risk at restart",
      "Accelerated electromechanical wear from recurring moisture",
    ],
    solution: [
      "Thermal sizing to keep stator temperature above 19 °C",
      "Supply and installation of distributed stator space heaters",
      "Thermostats and relays for automatic on/off during outages",
      "Megohmmeter insulation checks before and after energization",
    ],
    technologies: [
      "Stator space heaters",
      "Control thermostats and relays",
      "High-dielectric terminal insulation",
    ],
    results: [
      { metric: "> 19 °C", label: "Internal temperature held above dew point" },
      { metric: "100%", label: "Condensation eliminated on windings" },
    ],
    relatedCategorySlug: "calefaccion-electrica",
    relatedCategory: "Electric heating",
    ctaText: "Talk to an applications engineer",
    whatsappPreFill:
      "Hello Control Nautas, I want to discuss stator heaters and condensation control for generators.",
  },
  {
    slug: "heat-tracing-evitar-congelamiento",
    title: "Heat tracing system for freeze protection of process piping",
    subtitle: "Self-regulating electric heat tracing for cold-climate operations",
    industry: "Mining / Process plants",
    location: "High-altitude industrial site",
    date: "2025-06-12",
    summary:
      "Self-regulating heat-trace cable prevents freezing of water and process lines exposed to -10 °C to -15 °C, replacing harsh steam thaw methods.",
    problem: [
      "Severe pipe freezing on winter nights (-10 °C to -15 °C)",
      "Operations stalled until midday natural thaw",
      "Ice expansion causing leaks and ruptures",
      "Prior steam methods caused thermal shock and flange failures",
    ],
    solution: [
      "Design with self-regulating heat-trace cable (≈25 W/m at 10 °C)",
      "Longitudinal installation with aluminum tape for heat transfer",
      "Mineral-wool insulation with weather jacket",
      "Ambient and line thermostat automation",
    ],
    technologies: [
      "Self-regulating heat-trace cable",
      "Thermally conductive aluminum fixing tape",
      "Outdoor pipe insulation",
      "Termination, splice kits, and NEMA 4X junction boxes",
    ],
    results: [
      { metric: "-15 °C", label: "Freeze protection maintained at design ambient" },
      { metric: "24/7", label: "Continuous process continuity in winter" },
    ],
    relatedCategorySlug: "trazado-termico",
    relatedCategory: "Heat tracing",
    ctaText: "Request a heat-tracing design review",
    whatsappPreFill:
      "Hello Control Nautas, I need heat tracing for freeze protection on process piping.",
  },
  {
    slug: "monitoreo-akcp-datacenter",
    title: "Environmental monitoring for data center risk control",
    subtitle: "Early leak and thermal detection for critical IT facilities",
    industry: "Data centers / Critical facilities",
    location: "Urban data center",
    date: "2025-03-20",
    summary:
      "Sensor network for temperature, humidity, and leak detection provides early warning to protect IT assets and reduce downtime risk.",
    problem: [
      "Limited visibility of thermal and humidity hotspots",
      "Water leak risk near cooling infrastructure",
      "Slow reaction time without centralized alarms",
    ],
    solution: [
      "Deploy temperature/humidity sensors and leak detection rope",
      "Centralize alarms for operations teams",
      "Document alarm thresholds and response playbooks",
    ],
    technologies: [
      "Temperature and humidity sensors",
      "Leak detection cable/rope",
      "Monitoring gateway / alarm panel",
    ],
    results: [
      { metric: "< 1 min", label: "Faster alarm visibility for ops teams" },
      { metric: "24/7", label: "Continuous environmental supervision" },
    ],
    relatedCategorySlug: "sensores-monitoreo",
    relatedCategory: "Sensors & monitoring",
    ctaText: "Ask about monitoring packages",
    whatsappPreFill:
      "Hello Control Nautas, I want environmental monitoring for a data center (temp/humidity/leaks).",
  },
  {
    slug: "control-termico-hidroelectrica",
    title: "Thermal control package for hydropower reliability",
    subtitle: "Integrated heating and sensing for plant uptime",
    industry: "Power generation",
    location: "Hydropower facility",
    date: "2024-11-10",
    summary:
      "Combined heating, sensing, and control components improve plant readiness during seasonal humidity and cold swings.",
    problem: [
      "Seasonal moisture impacting electrical rooms and rotating equipment",
      "Inconsistent manual heating practices during outages",
    ],
    solution: [
      "Specify heaters, sensors, and controllers as a coordinated package",
      "Define operating setpoints and maintenance checks",
    ],
    technologies: [
      "Space / process heaters",
      "Temperature controllers",
      "Industrial sensors",
    ],
    results: [
      { metric: "↑", label: "Improved readiness after planned outages" },
      { metric: "↓", label: "Fewer moisture-related interventions" },
    ],
    relatedCategorySlug: "automatizacion-control",
    relatedCategory: "Automation & control",
    ctaText: "Discuss a plant thermal package",
    whatsappPreFill:
      "Hello Control Nautas, I want a thermal control package for hydropower reliability.",
  },
]

export function getCaseStudy(slug: string): CaseStudy | undefined {
  return CASE_STUDIES.find((c) => c.slug === slug)
}

export default CASE_STUDIES
