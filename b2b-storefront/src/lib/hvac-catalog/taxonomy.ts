/**
 * HVAC group taxonomy.
 * Solo familia HVAC (no Abrasives / Test Instruments / etc.).
 * productCount values mirror public category labels where known.
 */

export type HvacCategoryNode = {
  slug: string
  name: string
  description?: string
  productCount?: number
  children?: HvacCategoryNode[]
}

export const HVAC_ROOT: HvacCategoryNode = {
  slug: "hvac",
  name: "HVAC",
  description:
    "HVAC products for heating, cooling, ventilation, air quality, controls, and refrigeration.",
  productCount: 29946,
  children: [
    {
      slug: "air-filters",
      name: "Air Filters",
      description: "Filters for HVAC systems that remove dust and airborne contaminants.",
      children: [
        {
          slug: "panel-and-pleated-air-filters",
          name: "Panel and Pleated Air Filters",
          children: [
            {
              slug: "pleated-air-filters",
              name: "Pleated Air Filters",
              children: [
                { slug: "merv-7-pleated-air-filters", name: "MERV 7 Pleated Air Filters" },
                { slug: "merv-8-pleated-air-filters", name: "MERV 8 Pleated Air Filters" },
                { slug: "merv-11-pleated-air-filters", name: "MERV 11 Pleated Air Filters" },
                { slug: "merv-13-pleated-air-filters", name: "MERV 13 Pleated Air Filters" },
              ],
            },
            { slug: "panel-air-filters", name: "Non-Pleated Panel Air Filters" },
            { slug: "carbon-air-filters", name: "Odor Removal Panel Air Filters" },
            { slug: "washable-metal-air-filters", name: "Washable Metal Air Filters" },
          ],
        },
        { slug: "bag-air-filters", name: "Bag Air Filters" },
        { slug: "hepa-filters", name: "HEPA Filters" },
        { slug: "filter-media-rolls", name: "Air Filters Pads and Rolls" },
      ],
    },
    {
      slug: "air-treatment",
      name: "Air Treatment",
      children: [
        { slug: "humidifiers", name: "Humidifiers" },
        { slug: "dehumidifiers", name: "Dehumidifiers" },
        { slug: "air-purifiers", name: "Air Purifiers" },
        { slug: "uv-air-treatment", name: "UV Air Treatment" },
      ],
    },
    {
      slug: "cooling-fans",
      name: "Cooling Fans",
      children: [
        {
          slug: "industrial-cooling-fans",
          name: "Industrial Cooling Fans",
          children: [
            {
              slug: "industrial-floor-fans",
              name: "Industrial Floor Fans",
              children: [
                {
                  slug: "standard-industrial-floor-fans",
                  name: "Standard Industrial Floor Fans",
                },
                {
                  slug: "high-velocity-industrial-floor-fans",
                  name: "High-Velocity Industrial Floor Fans",
                },
                {
                  slug: "hazardous-location-industrial-floor-fans",
                  name: "Hazardous-Location Industrial Floor Fans",
                },
              ],
            },
            { slug: "industrial-pedestal-fans", name: "Industrial Pedestal Fans" },
            { slug: "industrial-wall-mount-fans", name: "Industrial Wall-Mount Fans" },
            { slug: "industrial-ceiling-hvls-fans", name: "Industrial Ceiling & HVLS Fans" },
          ],
        },
        {
          slug: "office-desk-fans",
          name: "Office & Desk Fans",
          children: [
            { slug: "personal-fans", name: "Personal & Desk Fans" },
            { slug: "office-floor-box-fans", name: "Office Floor & Box Fans" },
          ],
        },
        { slug: "circulating-fans", name: "Circulating Fans" },
        { slug: "exhaust-fans", name: "Exhaust Fans" },
      ],
    },
    {
      slug: "ventilation-equipment",
      name: "Ventilation Equipment",
      productCount: 2885,
      children: [
        { slug: "louvers-dampers", name: "Louvers & Dampers" },
        { slug: "ductwork", name: "Ductwork" },
        { slug: "roof-ventilators", name: "Roof Ventilators" },
        { slug: "make-up-air", name: "Make-Up Air Units" },
      ],
    },
    {
      slug: "air-conditioners-evaporative-coolers",
      name: "Air Conditioners & Evaporative Coolers",
      children: [
        { slug: "portable-air-conditioners", name: "Portable Air Conditioners" },
        { slug: "window-air-conditioners", name: "Window Air Conditioners" },
        { slug: "evaporative-coolers", name: "Evaporative Coolers" },
        { slug: "spot-coolers", name: "Spot Coolers" },
      ],
    },
    {
      slug: "central-equipment",
      name: "Central Equipment",
      children: [
        { slug: "packaged-units", name: "Packaged Units" },
        { slug: "split-systems", name: "Split Systems" },
        { slug: "chillers", name: "Chillers" },
      ],
    },
    {
      slug: "heaters",
      name: "Heaters",
      productCount: 1421,
      description:
        "Heaters may be used as the primary source of heating, or they can be used for personal or supplemental warmth.",
      children: [
        {
          slug: "electric-heaters",
          name: "Electric Heaters",
          children: [
            {
              slug: "electric-wall-ceiling-heaters",
              name: "Electric Wall & Ceiling Heaters",
            },
            {
              slug: "portable-electric-heaters",
              name: "Portable Electric Heaters",
              children: [
                {
                  slug: "portable-electric-jobsite-heaters",
                  name: "Portable Electric Jobsite Heaters",
                  productCount: 118,
                  children: [
                    {
                      slug: "portable-standard-electric-jobsite-heaters",
                      name: "Portable Standard Electric Jobsite Heaters",
                    },
                    {
                      slug: "hazardous-location-portable-electric-jobsite-heaters",
                      name: "Hazardous-Location Portable Electric Jobsite Heaters",
                    },
                    {
                      slug: "portable-salamander-electric-jobsite-heaters",
                      name: "Portable Salamander Electric Jobsite Heaters",
                    },
                    {
                      slug: "portable-infrared-radiant-electric-jobsite-heaters",
                      name: "Portable Infrared Radiant Electric Jobsite Heaters",
                    },
                    {
                      slug: "portable-electric-ducted-tent-heaters",
                      name: "Portable Electric Ducted & Tent Heaters",
                    },
                    {
                      slug: "panel-emitters-electric-infrared",
                      name: "Panel Emitters for Electric Infrared Heaters",
                    },
                    {
                      slug: "tubular-elements-electric-infrared",
                      name: "Tubular Elements for Electric Infrared Heaters",
                    },
                    {
                      slug: "portable-salamander-parts",
                      name: "Portable Salamander Electric Heater Parts",
                    },
                    {
                      slug: "jobsite-garage-heater-accessories",
                      name: "Accessories for Portable Electric Jobsite & Garage Heaters",
                    },
                  ],
                },
                {
                  slug: "portable-electric-office-heaters",
                  name: "Portable Electric Office Heaters",
                },
              ],
            },
            { slug: "electric-floor-heaters", name: "Electric Floor Heaters" },
            {
              slug: "electric-baseboard-heaters",
              name: "Electric Baseboard Heaters",
            },
            { slug: "electric-plenum-heaters", name: "Electric Plenum Heaters" },
            {
              slug: "electric-heating-cables",
              name: "Electric Heating Cables",
              description:
                "Heat-trace and pipe freeze protection cables for pipes, roofs, and gutters.",
              children: [
                {
                  slug: "cut-to-length-electric-heating-cables",
                  name: "Cut-to-Length Electric Heating Cables (Self-Regulating)",
                },
                {
                  slug: "cut-to-length-electric-heating-cable-kits",
                  name: "Cut-to-Length Electric Heating Cable Kits (Self-Regulating)",
                },
                {
                  slug: "pre-assembled-electric-heating-cables",
                  name: "Pre-Assembled Electric Heating Cables (Non-Regulating)",
                },
              ],
            },
          ],
        },
        { slug: "spa-hot-tub-heaters", name: "Spa & Hot Tub Heaters" },
        {
          slug: "electric-process-heaters",
          name: "Electric Process Heaters",
          productCount: 319,
        },
        {
          slug: "gas-oil-kerosene-heaters",
          name: "Gas, Oil & Kerosene Heaters",
          productCount: 249,
        },
        {
          slug: "hydronic-boilers-heaters",
          name: "Hydronic Boilers & Heaters",
          productCount: 181,
        },
      ],
    },
    {
      slug: "heat-exchangers",
      name: "Heat Exchangers",
      children: [
        { slug: "plate-heat-exchangers", name: "Plate Heat Exchangers" },
        { slug: "shell-tube-heat-exchangers", name: "Shell & Tube Heat Exchangers" },
      ],
    },
    {
      slug: "hvac-controls-and-thermostats",
      name: "HVAC Controls and Thermostats",
      productCount: 1798,
      description:
        "Thermostats and controls help streamline the operation of HVAC systems to improve their efficiency.",
      children: [
        {
          slug: "thermostats",
          name: "Thermostats",
          children: [
            {
              slug: "room-thermostats",
              name: "Room Thermostats",
              children: [
                {
                  slug: "line-voltage-thermostats",
                  name: "Line-Voltage Thermostats",
                  children: [
                    {
                      slug: "nonprogrammable-line-voltage-thermostats",
                      name: "Nonprogrammable Line-Voltage Thermostats",
                    },
                    {
                      slug: "plug-in-line-voltage-thermostats",
                      name: "Plug-In Line-Voltage Thermostats",
                    },
                    {
                      slug: "programmable-line-voltage-thermostats",
                      name: "Programmable Line-Voltage Thermostats",
                    },
                  ],
                },
                {
                  slug: "low-voltage-thermostats",
                  name: "Low-Voltage Thermostats",
                  children: [
                    {
                      slug: "nonprogrammable-low-voltage-thermostats",
                      name: "Nonprogrammable Low-Voltage Thermostats",
                    },
                    {
                      slug: "programmable-low-voltage-thermostats",
                      name: "Programmable Low-Voltage Thermostats",
                    },
                    {
                      slug: "wifi-programmable-low-voltage-thermostats",
                      name: "Wi-Fi Programmable Low-Voltage Thermostats",
                    },
                  ],
                },
                {
                  slug: "thermostat-accessories",
                  name: "Thermostat Accessories",
                },
              ],
            },
            {
              slug: "process-thermostats",
              name: "Process Thermostats",
              children: [
                {
                  slug: "remote-bulb-sensor-process-thermostats",
                  name: "Remote-Bulb Sensor Process Thermostats",
                },
                {
                  slug: "direct-insertion-process-thermostats",
                  name: "Direct-Insertion Process Thermostats",
                },
                {
                  slug: "surface-mount-conduction-process-thermostats",
                  name: "Surface-Mount Conduction Process Thermostats",
                },
              ],
            },
            {
              slug: "pneumatic-thermostats",
              name: "Pneumatic Thermostats & Retrofit Kits",
            },
            {
              slug: "programmable-thermostats",
              name: "Programmable Thermostats",
            },
          ],
        },
        {
          slug: "hvac-sensors-switches",
          name: "HVAC Sensors & Switches",
          children: [
            {
              slug: "temperature-humidity-sensors",
              name: "Temperature & Humidity Sensors",
            },
            {
              slug: "air-quality-sensors",
              name: "Air Quality Sensors",
            },
            {
              slug: "air-pressure-sensors-switches",
              name: "Air Pressure Sensors & Switches",
            },
            { slug: "airflow-switches", name: "Airflow Switches" },
            { slug: "economizers", name: "Economizers" },
          ],
        },
        {
          slug: "hvac-equipment-controls",
          name: "HVAC Equipment Controls & Components",
          children: [
            { slug: "temperature-controls", name: "Temperature Controls" },
            { slug: "heating-controls", name: "Heating Controls" },
            { slug: "furnace-control-boards", name: "Furnace Control Boards" },
            {
              slug: "ignition-controls-components",
              name: "Ignition Controls & Components",
            },
            { slug: "fan-limit-controls", name: "Fan & Limit Controls" },
            {
              slug: "hydronic-heating-controls",
              name: "Hydronic Heating Controls",
            },
            {
              slug: "hvac-relays-sequencers",
              name: "HVAC Relays & Sequencers",
            },
          ],
        },
        {
          slug: "building-automation-controls",
          name: "Building Automation System Controls",
        },
        {
          slug: "temperature-controllers",
          name: "Temperature Controllers & Indicators",
        },
      ],
    },
    {
      slug: "refrigerants-heat-transfer-fluids-lubricants",
      name: "Refrigerants, Heat-Transfer Fluids & Lubricants",
      children: [
        { slug: "refrigerants", name: "Refrigerants" },
        { slug: "heat-transfer-fluids", name: "Heat-Transfer Fluids" },
        { slug: "refrigeration-oils", name: "Refrigeration Oils & Lubricants" },
      ],
    },
    {
      slug: "hvac-diagnostics-recovery-evacuation",
      name: "HVAC Diagnostics, Recovery & Evacuation",
      children: [
        { slug: "manifold-gauges", name: "Manifold Gauges" },
        { slug: "vacuum-pumps", name: "Vacuum Pumps" },
        { slug: "recovery-machines", name: "Recovery Machines" },
        { slug: "leak-detectors", name: "Leak Detectors" },
      ],
    },
    {
      slug: "hvac-cleaning-chemicals-equipment-kits",
      name: "HVAC Cleaning Chemicals, Equipment & Kits",
      children: [
        { slug: "coil-cleaners", name: "Coil Cleaners" },
        { slug: "drain-pan-treatments", name: "Drain Pan Treatments" },
        { slug: "cleaning-kits", name: "HVAC Cleaning Kits" },
      ],
    },
    {
      slug: "hvac-installation-repair-mounting",
      name: "HVAC Installation, Repair, & Mounting Equipment",
      children: [
        { slug: "mounting-brackets", name: "Mounting Brackets" },
        { slug: "vibration-isolators", name: "Vibration Isolators" },
        { slug: "line-sets", name: "Line Sets" },
      ],
    },
    {
      slug: "fan-blades-and-propellers",
      name: "Fan Blades and Propellers",
      children: [
        { slug: "axial-fan-blades", name: "Axial Fan Blades" },
        { slug: "propellers", name: "Propellers" },
      ],
    },
    {
      slug: "hvac-refrigeration-replacement-parts",
      name: "HVAC & Refrigeration Replacement Parts",
      children: [
        { slug: "capacitors", name: "Capacitors" },
        { slug: "contactors-relays", name: "Contactrs & Relays" },
        { slug: "motors-blowers", name: "Motors & Blowers" },
        { slug: "sensors-probes", name: "Sensors & Probes" },
      ],
    },
  ],
}

/** Accepts both /store/hvac and legacy /store/hvac-and-refrigeration */
export const HVAC_SLUG_ALIASES = ["hvac", "hvac-and-refrigeration"] as const

export function normalizeHvacSlugs(slugs: string[]): string[] {
  if (!slugs.length) return slugs
  const [first, ...rest] = slugs
  if (first === "hvac-and-refrigeration") return ["hvac", ...rest]
  return slugs
}

export function findCategoryByPath(slugs: string[]): HvacCategoryNode | null {
  const normalized = normalizeHvacSlugs(slugs)
  if (!normalized.length || normalized[0] !== HVAC_ROOT.slug) return null
  let node: HvacCategoryNode = HVAC_ROOT
  for (const slug of normalized.slice(1)) {
    const next = node.children?.find((c) => c.slug === slug)
    if (!next) return null
    node = next
  }
  return node
}

export function getCategoryPath(slugs: string[]): HvacCategoryNode[] {
  const normalized = normalizeHvacSlugs(slugs)
  const path: HvacCategoryNode[] = []
  if (!normalized.length || normalized[0] !== HVAC_ROOT.slug) return path
  let node: HvacCategoryNode = HVAC_ROOT
  path.push(node)
  for (const slug of normalized.slice(1)) {
    const next = node.children?.find((c) => c.slug === slug)
    if (!next) break
    path.push(next)
    node = next
  }
  return path
}

export function flattenCategories(
  node: HvacCategoryNode = HVAC_ROOT,
  parentPath: string[] = []
): { path: string[]; node: HvacCategoryNode }[] {
  const path = [...parentPath, node.slug]
  const self = [{ path, node }]
  const kids =
    node.children?.flatMap((c) => flattenCategories(c, path)) ?? []
  return [...self, ...kids]
}
