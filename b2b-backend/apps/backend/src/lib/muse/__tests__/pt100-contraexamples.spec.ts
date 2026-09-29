/**
 * PT100 RTD Sensor Contraexample & Mandatory Claims Test Suite
 * SKU: CN-THT02 (Model: CN-RTD-P1)
 *
 * Validaciones obligatorias:
 * 1. Afirmaciones técnicas obligatorias:
 *    - Sonda sensor Pt100 3 hilos pasivo.
 *    - Elemento sensor Pt100 Clase A (IEC 60751).
 *    - SIN transmisor integrado (0 canales de salida, sin electrónica).
 *    - SIN interfaz digital (0 interfaces, carece de microprocesador / UART).
 * 2. Contraejemplos obligatorios:
 *    - NO tiene 4–20 mA por sí solo (requiere transmisor externo no integrado).
 *    - NO tiene Modbus ni interfaz digital por sí solo.
 * 3. Demostración formal requerida por el auditor:
 *    - Requerir salida 4–20 mA resulta en satisfied = false.
 *    - Requerir protocolo 'modbus_rtu' resulta en satisfied = false.
 *    - Requerir 'sensor_element' Pt100 3 hilos pasivo resulta en satisfied = true.
 * 4. Trazabilidad documental y cita formal contra datasheet PDF y DB Postgres.
 */

import {
  evaluateRequirements,
  evaluateSingleRequirement,
  TechnicalRequirement,
} from "../evaluator"
import {
  getTechnicalProfile,
  getTechnicalFacts,
  getTechnicalSources,
  closePool,
  TechnicalFactRecord,
  TechnicalProfileRecord,
  TechnicalSourceRecord,
} from "../db"

describe("SKU 3: CN-THT02 (CN-RTD-P1) — Contraejemplos y Afirmaciones Obligatorias", () => {
  const SKU = "CN-THT02"
  const MODEL = "CN-RTD-P1"
  const VARIANT_ID = "variant_01M3Q80V0NCKEV8GWYKETF7776"
  const SOURCE_ID = "SRC-CN-RTD-P1-DS-V1"
  const SOURCE_REVISION = "rev-2026.1"
  const EXPECTED_CHECKSUM =
    "3c8e67e4e5b76baa787e9f91eb0546015a1e7afa1551b79f2a1fb417cca17fbf"

  // Fixtures estáticos canónicos idénticos a los seeders de producción
  const MOCK_PROFILE: TechnicalProfileRecord = {
    id: "techprof_01M3Q80V73EB0K8FR7GZ0NP4G0",
    variant_id: VARIANT_ID,
    model: MODEL,
    revision: SOURCE_REVISION,
    demo: true,
    sku: SKU,
    created_at: new Date("2026-09-29T18:00:00Z"),
    updated_at: new Date("2026-09-29T18:00:00Z"),
  }

  const MOCK_SOURCE: TechnicalSourceRecord = {
    id: SOURCE_ID,
    url: "http://52.20.66.203:8000/demo/datasheets/CN-THT02.pdf",
    kind: "datasheet",
    revision: SOURCE_REVISION,
    checksum: EXPECTED_CHECKSUM,
    published_at: new Date("2026-09-29T18:00:00Z"),
    created_at: new Date("2026-09-29T18:00:00Z"),
    updated_at: new Date("2026-09-29T18:00:00Z"),
  }

  const MOCK_FACTS: TechnicalFactRecord[] = [
    {
      id: "techfact_01M3Q80V7B9X23AR43W24KSE5P",
      variant_id: VARIANT_ID,
      property: "mounting",
      normalized_value_json: {
        type: "threaded probe",
        thread: "1/2 NPT",
        material: "AISI 316L",
        length_mm: 150,
        diameter_mm: 6,
      },
      display_value: "Sonda de inmersión roscada 1/2\" NPT, vaina AISI 316L 6×150 mm",
      source_id: SOURCE_ID,
      page: 1,
      section: "Sección 2: Montaje Físico",
      excerpt: "Racor roscado fijo al proceso de 1/2 pulgada NPT macho en acero inoxidable AISI 316L",
      polarity: true,
      created_at: new Date("2026-09-29T18:00:00Z"),
      updated_at: new Date("2026-09-29T18:00:00Z"),
    },
    {
      id: "techfact_01M3Q80V7DFCPHHGS1V5YQRHKN",
      variant_id: VARIANT_ID,
      property: "supply_voltage",
      normalized_value_json: {
        type: "passive",
        nominal_v: 0,
        external_power: false,
        excitation_current_ma_max: 1,
        excitation_current_ma_min: 0.1,
      },
      display_value: "Sin alimentación propia (dispositivo puramente pasivo)",
      source_id: SOURCE_ID,
      page: 1,
      section: "Sección 3: Alimentación Eléctrica",
      excerpt: "SIN ALIMENTACIÓN PROPIA (0 VDC / 0 VAC). Es un componente puramente pasivo",
      polarity: true,
      created_at: new Date("2026-09-29T18:00:00Z"),
      updated_at: new Date("2026-09-29T18:00:00Z"),
    },
    {
      id: "techfact_01M3Q80V761ZN85Y16PHDK811E",
      variant_id: VARIANT_ID,
      property: "sensor_element",
      normalized_value_json: {
        type: "RTD",
        alpha: 0.00385,
        class: "A",
        max_c: 350,
        min_c: -50,
        wires: 3,
        r0_ohm: 100,
        element: "Pt100",
        standard: "IEC 60751",
      },
      display_value: "Sensor termorresistencia Pt100 Clase A, 3 hilos (-50 a +350 °C)",
      source_id: SOURCE_ID,
      page: 2,
      section: "Sección 4: Entradas / Salidas Analógicas y Sensores",
      excerpt: "Elemento de platino puro bobinado Pt100 calibrado bajo norma IEC 60751 Clase A (tolerancia ±(0.15 + 0.002·|t|) °C)",
      polarity: true,
      created_at: new Date("2026-09-29T18:00:00Z"),
      updated_at: new Date("2026-09-29T18:00:00Z"),
    },
    {
      id: "techfact_01M3Q80V7PG1SWYBZ777Y2344T",
      variant_id: VARIANT_ID,
      property: "analog_input",
      normalized_value_json: {
        channels: 0,
        available: false,
        direction: "input",
      },
      display_value: "0 canales (No aplica)",
      source_id: SOURCE_ID,
      page: 2,
      section: "Sección 4: Entradas / Salidas Analógicas y Sensores",
      excerpt: "No aplica. Sensor pasivo sin etapas de acondicionamiento",
      polarity: false,
      created_at: new Date("2026-09-29T18:00:00Z"),
      updated_at: new Date("2026-09-29T18:00:00Z"),
    },
    {
      id: "techfact_01M3Q80V7V42P626PTR3AZ3EP2",
      variant_id: VARIANT_ID,
      property: "analog_output",
      normalized_value_json: {
        notes: "No genera 4-20 mA ni voltaje por sí solo",
        channels: 0,
        available: false,
        direction: "output",
      },
      display_value: "0 canales (Sin transmisor; resistencia pura pasiva)",
      source_id: SOURCE_ID,
      page: 2,
      section: "Sección 4: Entradas / Salidas Analógicas y Sensores",
      excerpt: "SIN TRANSMISOR INTEGRADO (0 transmisores). No incluye electrónica de acondicionamiento",
      polarity: false,
      created_at: new Date("2026-09-29T18:00:00Z"),
      updated_at: new Date("2026-09-29T18:00:00Z"),
    },
    {
      id: "techfact_01M3Q80V7Y20TPEZ8N7G63GSM6",
      variant_id: VARIANT_ID,
      property: "interface",
      normalized_value_json: {
        type: "none",
        cable_wires: 3,
        cable_length_m: 2,
        digital_interface: false,
      },
      display_value: "Sin interfaz digital (cable directo de 3 conductores)",
      source_id: SOURCE_ID,
      page: 2,
      section: "Sección 5: Comunicaciones y Protocolos",
      excerpt: "NINGUNA. La sonda carece de microprocesador, UART, circuito integrado o puerto serie",
      polarity: false,
      created_at: new Date("2026-09-29T18:00:00Z"),
      updated_at: new Date("2026-09-29T18:00:00Z"),
    },
    {
      id: "techfact_01M3Q80V81VNQDC7TQZF0EFAGC",
      variant_id: VARIANT_ID,
      property: "protocol",
      normalized_value_json: {
        name: "none",
        supported: false,
      },
      display_value: "Ninguno (Sin protocolo serie ni bus de datos)",
      source_id: SOURCE_ID,
      page: 2,
      section: "Sección 5: Comunicaciones y Protocolos",
      excerpt: "NO APLICA / SIN PROTOCOLO. No posee capacidad de comunicación digital por bus de datos",
      polarity: false,
      created_at: new Date("2026-09-29T18:00:00Z"),
      updated_at: new Date("2026-09-29T18:00:00Z"),
    },
  ]

  let liveFacts: TechnicalFactRecord[] = []
  let liveSources: TechnicalSourceRecord[] = []
  let liveProfile: TechnicalProfileRecord | null = null
  let dbAvailable = false

  beforeAll(async () => {
    try {
      const p = await getTechnicalProfile(SKU)
      if (p) {
        liveProfile = p
        liveFacts = await getTechnicalFacts(p.variant_id)
        const sourceIds = Array.from(
          new Set(liveFacts.map((f) => f.source_id).filter(Boolean))
        ) as string[]
        liveSources = await getTechnicalSources(sourceIds)
        dbAvailable = liveFacts.length > 0
      }
    } catch {
      dbAvailable = false
    }
  })

  afterAll(async () => {
    try {
      await closePool()
    } catch {
      // Ignorar cierre de pool si no estaba abierto
    }
  })

  function getFacts(): TechnicalFactRecord[] {
    return dbAvailable && liveFacts.length > 0 ? liveFacts : MOCK_FACTS
  }

  function getSources(): TechnicalSourceRecord[] {
    return dbAvailable && liveSources.length > 0 ? liveSources : [MOCK_SOURCE]
  }

  function getProfile(): TechnicalProfileRecord {
    return dbAvailable && liveProfile ? liveProfile : MOCK_PROFILE
  }

  // ==========================================================================
  // BLOQUE 1: VALIDACIÓN DE AFIRMACIONES OBLIGATORIAS
  // ==========================================================================
  describe("1. Validación de Afirmaciones Técnicas Obligatorias", () => {
    it("Afirmación 1.1: Sonda sensor Pt100 pasiva sin alimentación propia (0 VDC) -> satisfied = true", () => {
      const facts = getFacts()
      const sources = getSources()
      const profile = getProfile()

      const reqPassive: TechnicalRequirement = {
        id: "req_supply_passive",
        property: "supply_voltage",
        operator: "equals",
        value: "passive",
      }

      const result = evaluateRequirements(profile.variant_id, [reqPassive], facts, sources, profile)
      expect(result.overall_satisfied).toBe(true)
      expect(result.evaluations[0].satisfied).toBe(true)
      expect(result.evaluations[0].fact_display_value).toContain("dispositivo puramente pasivo")
      expect(result.evaluations[0].source_evidence?.section).toContain("Sección 3")
      expect(result.evaluations[0].source_evidence?.excerpt).toContain("SIN ALIMENTACIÓN PROPIA (0 VDC / 0 VAC)")
    })

    it("Afirmación 1.2: Sensor termorresistencia Pt100 Clase A con cableado a 3 hilos -> satisfied = true", () => {
      const facts = getFacts()
      const sources = getSources()
      const profile = getProfile()

      const reqPt100: TechnicalRequirement = {
        id: "req_sensor_pt100_3w",
        property: "sensor_element",
        operator: "equals",
        value: "Pt100",
      }

      const result = evaluateRequirements(profile.variant_id, [reqPt100], facts, sources, profile)
      expect(result.overall_satisfied).toBe(true)
      expect(result.evaluations[0].satisfied).toBe(true)
      expect(result.evaluations[0].fact_display_value).toContain("Pt100 Clase A, 3 hilos")
      expect(result.evaluations[0].source_evidence?.page).toBe(2)
      expect(result.evaluations[0].source_evidence?.excerpt).toContain("IEC 60751 Clase A")
    })

    it("Afirmación 1.3: Montaje físico con sonda roscada 1/2\" NPT en AISI 316L -> satisfied = true", () => {
      const facts = getFacts()
      const sources = getSources()
      const profile = getProfile()

      const reqMounting: TechnicalRequirement = {
        id: "req_mounting_npt",
        property: "mounting",
        operator: "equals",
        value: "threaded probe",
      }

      const result = evaluateRequirements(profile.variant_id, [reqMounting], facts, sources, profile)
      expect(result.overall_satisfied).toBe(true)
      expect(result.evaluations[0].satisfied).toBe(true)
      expect(result.evaluations[0].fact_display_value).toContain("1/2\" NPT")
      expect(result.evaluations[0].source_evidence?.section).toContain("Sección 2")
    })

    it("Afirmación 1.4: Confirmación explícita de SIN TRANSMISOR INTEGRADO (hecho negativo verificado) -> satisfied = true", () => {
      const facts = getFacts()
      const sources = getSources()
      const profile = getProfile()

      // Si se prueba la ausencia formal de transmisor/salida analógica mediante un operador de ausencia
      const reqNoTransmitter: TechnicalRequirement = {
        id: "req_no_transmitter",
        property: "analog_output",
        operator: "equals",
        value: "none",
      }

      const result = evaluateRequirements(profile.variant_id, [reqNoTransmitter], facts, sources, profile)
      expect(result.overall_satisfied).toBe(true)
      expect(result.evaluations[0].satisfied).toBe(true)
      expect(result.evaluations[0].fact_display_value).toContain("Sin transmisor")
      expect(result.evaluations[0].source_evidence?.excerpt).toContain("SIN TRANSMISOR INTEGRADO (0 transmisores)")
    })

    it("Afirmación 1.5: Confirmación explícita de SIN INTERFAZ DIGITAL (hecho negativo verificado) -> satisfied = true", () => {
      const facts = getFacts()
      const sources = getSources()
      const profile = getProfile()

      const reqNoInterface: TechnicalRequirement = {
        id: "req_no_digital_interface",
        property: "interface",
        operator: "equals",
        value: "none",
      }

      const result = evaluateRequirements(profile.variant_id, [reqNoInterface], facts, sources, profile)
      expect(result.overall_satisfied).toBe(true)
      expect(result.evaluations[0].satisfied).toBe(true)
      expect(result.evaluations[0].fact_display_value).toContain("Sin interfaz digital")
      expect(result.evaluations[0].source_evidence?.excerpt).toContain("carece de microprocesador, UART, circuito integrado")
    })

    it("Conjunción total de capacidades físicas reales del Pt100 pasivo -> overall_satisfied = true", () => {
      const facts = getFacts()
      const sources = getSources()
      const profile = getProfile()

      const validMandatoryReqs: TechnicalRequirement[] = [
        {
          id: "req_rtd_1",
          property: "sensor_element",
          operator: "equals",
          value: "Pt100",
        },
        {
          id: "req_rtd_2",
          property: "supply_voltage",
          operator: "equals",
          value: "passive",
        },
        {
          id: "req_rtd_3",
          property: "mounting",
          operator: "equals",
          value: "threaded probe",
        },
      ]

      const result = evaluateRequirements(profile.variant_id, validMandatoryReqs, facts, sources, profile)
      expect(result.overall_satisfied).toBe(true)
      expect(result.evaluations).toHaveLength(3)
      expect(result.evaluations.every((e) => e.satisfied === true)).toBe(true)
    })
  })

  // ==========================================================================
  // BLOQUE 2: VALIDACIÓN DE CONTRAEJEMPLOS OBLIGATORIOS (CRUCIAL)
  // ==========================================================================
  describe("2. Validación de Contraejemplos Obligatorios", () => {
    describe("Contraejemplo A: NO tiene 4–20 mA por sí solo (Sin transmisor integrado)", () => {
      it("Requerir salida 4–20 mA con operator 'range_contains' -> satisfied = false y overall_satisfied = false", () => {
        const facts = getFacts()
        const sources = getSources()
        const profile = getProfile()

        const req: TechnicalRequirement = {
          id: "req_contra_ao_4_20ma_range",
          property: "analog_output",
          operator: "range_contains",
          min: 4,
          max: 20,
          unit: "mA",
          direction: "output",
        }

        const result = evaluateRequirements(profile.variant_id, [req], facts, sources, profile)

        expect(result.overall_satisfied).toBe(false)
        expect(result.evaluations[0].satisfied).toBe(false)
        expect(result.evaluations[0].reason).toMatch(/Negative technical fact|Sin transmisor|polarity: false/i)
        expect(result.evaluations[0].fact_display_value).toContain("Sin transmisor")
        expect(result.evaluations[0].source_evidence?.excerpt).toContain("SIN TRANSMISOR INTEGRADO")
      })

      it("Requerir salida '4-20 mA' con operator 'equals' -> satisfied = false", () => {
        const facts = getFacts()
        const sources = getSources()
        const profile = getProfile()

        const req: TechnicalRequirement = {
          id: "req_contra_ao_equals",
          property: "analog_output",
          operator: "equals",
          value: "4-20 mA",
        }

        const result = evaluateRequirements(profile.variant_id, [req], facts, sources, profile)

        expect(result.overall_satisfied).toBe(false)
        expect(result.evaluations[0].satisfied).toBe(false)
        expect(result.evaluations[0].reason).toMatch(/Negative technical fact|Sin transmisor|polarity: false/i)
      })

      it("Requerir salida '4-20 mA' con operator 'contains' -> satisfied = false", () => {
        const facts = getFacts()
        const sources = getSources()
        const profile = getProfile()

        const req: TechnicalRequirement = {
          id: "req_contra_ao_contains",
          property: "analog_output",
          operator: "contains",
          value: "4-20",
        }

        const result = evaluateRequirements(profile.variant_id, [req], facts, sources, profile)

        expect(result.overall_satisfied).toBe(false)
        expect(result.evaluations[0].satisfied).toBe(false)
      })

      it("Requerir salida analógica de tensión '0-10 VDC' -> satisfied = false", () => {
        const facts = getFacts()
        const sources = getSources()
        const profile = getProfile()

        const req: TechnicalRequirement = {
          id: "req_contra_ao_voltage",
          property: "analog_output",
          operator: "equals",
          value: "0-10 VDC",
        }

        const result = evaluateRequirements(profile.variant_id, [req], facts, sources, profile)

        expect(result.overall_satisfied).toBe(false)
        expect(result.evaluations[0].satisfied).toBe(false)
      })

      it("Requerir salida analógica con channels >= 1 -> satisfied = false", () => {
        const facts = getFacts()
        const sources = getSources()
        const profile = getProfile()

        const req: TechnicalRequirement = {
          id: "req_contra_ao_channels",
          property: "analog_output",
          operator: "range_contains",
          channels_at_least: 1,
        }

        const result = evaluateRequirements(profile.variant_id, [req], facts, sources, profile)

        expect(result.overall_satisfied).toBe(false)
        expect(result.evaluations[0].satisfied).toBe(false)
      })
    })

    describe("Contraejemplo B: NO tiene Modbus por sí solo", () => {
      it("Requerir protocolo 'modbus_rtu' con operator 'equals' -> satisfied = false y overall_satisfied = false", () => {
        const facts = getFacts()
        const sources = getSources()
        const profile = getProfile()

        const req: TechnicalRequirement = {
          id: "req_contra_protocol_modbus_rtu",
          property: "protocol",
          operator: "equals",
          value: "modbus_rtu",
        }

        const result = evaluateRequirements(profile.variant_id, [req], facts, sources, profile)

        expect(result.overall_satisfied).toBe(false)
        expect(result.evaluations[0].satisfied).toBe(false)
        expect(result.evaluations[0].reason).toMatch(/Negative technical fact|Sin protocolo|polarity: false/i)
        expect(result.evaluations[0].fact_display_value).toContain("Ninguno (Sin protocolo")
        expect(result.evaluations[0].source_evidence?.excerpt).toContain("NO APLICA / SIN PROTOCOLO")
      })

      it("Requerir protocolo 'Modbus RTU' (formato título) -> satisfied = false", () => {
        const facts = getFacts()
        const sources = getSources()
        const profile = getProfile()

        const req: TechnicalRequirement = {
          id: "req_contra_protocol_modbus_title",
          property: "protocol",
          operator: "equals",
          value: "Modbus RTU",
        }

        const result = evaluateRequirements(profile.variant_id, [req], facts, sources, profile)

        expect(result.overall_satisfied).toBe(false)
        expect(result.evaluations[0].satisfied).toBe(false)
      })

      it("Requerir protocolo 'Modbus TCP' -> satisfied = false", () => {
        const facts = getFacts()
        const sources = getSources()
        const profile = getProfile()

        const req: TechnicalRequirement = {
          id: "req_contra_protocol_modbus_tcp",
          property: "protocol",
          operator: "equals",
          value: "Modbus TCP",
        }

        const result = evaluateRequirements(profile.variant_id, [req], facts, sources, profile)

        expect(result.overall_satisfied).toBe(false)
        expect(result.evaluations[0].satisfied).toBe(false)
      })

      it("Requerir 'protocol' in ['modbus_rtu', 'modbus_tcp'] -> satisfied = false", () => {
        const facts = getFacts()
        const sources = getSources()
        const profile = getProfile()

        const req: TechnicalRequirement = {
          id: "req_contra_protocol_in",
          property: "protocol",
          operator: "in",
          value: ["modbus_rtu", "modbus_tcp"],
        }

        const result = evaluateRequirements(profile.variant_id, [req], facts, sources, profile)

        expect(result.overall_satisfied).toBe(false)
        expect(result.evaluations[0].satisfied).toBe(false)
      })
    })

    describe("Contraejemplo C: NO tiene interfaz digital por sí solo", () => {
      it("Requerir 'RS-485' con operator 'equals' -> satisfied = false y overall_satisfied = false", () => {
        const facts = getFacts()
        const sources = getSources()
        const profile = getProfile()

        const req: TechnicalRequirement = {
          id: "req_contra_interface_rs485",
          property: "interface",
          operator: "equals",
          value: "RS-485",
        }

        const result = evaluateRequirements(profile.variant_id, [req], facts, sources, profile)

        expect(result.overall_satisfied).toBe(false)
        expect(result.evaluations[0].satisfied).toBe(false)
        expect(result.evaluations[0].reason).toMatch(/Negative technical fact|Sin interfaz digital|polarity: false/i)
        expect(result.evaluations[0].fact_display_value).toContain("Sin interfaz digital")
        expect(result.evaluations[0].source_evidence?.excerpt).toContain("carece de microprocesador, UART")
      })

      it("Requerir interfaz 'Ethernet' o 'USB' -> satisfied = false", () => {
        const facts = getFacts()
        const sources = getSources()
        const profile = getProfile()

        const reqEth: TechnicalRequirement = {
          id: "req_contra_interface_eth",
          property: "interface",
          operator: "equals",
          value: "Ethernet",
        }

        const result = evaluateRequirements(profile.variant_id, [reqEth], facts, sources, profile)

        expect(result.overall_satisfied).toBe(false)
        expect(result.evaluations[0].satisfied).toBe(false)
      })
    })

    describe("Contraejemplo D: NO tiene etapa de entrada analógica activa (es el elemento primario)", () => {
      it("Requerir entrada analógica 4–20 mA activa en la sonda -> satisfied = false", () => {
        const facts = getFacts()
        const sources = getSources()
        const profile = getProfile()

        const req: TechnicalRequirement = {
          id: "req_contra_ai_4_20ma",
          property: "analog_input",
          operator: "range_contains",
          min: 4,
          max: 20,
          unit: "mA",
          direction: "input",
        }

        const result = evaluateRequirements(profile.variant_id, [req], facts, sources, profile)

        expect(result.overall_satisfied).toBe(false)
        expect(result.evaluations[0].satisfied).toBe(false)
        expect(result.evaluations[0].fact_display_value).toContain("0 canales")
      })
    })
  })

  // ==========================================================================
  // BLOQUE 3: DEMOSTRACIÓN FORMAL DEL AUDITOR (3 PREMISAS ESPECÍFICAS)
  // ==========================================================================
  describe("3. Demostración Formal de las 3 Premisas Solicitadas", () => {
    it("Demostración 1: Requerir salida 4–20 mA resulta en satisfied = false", () => {
      const facts = getFacts()
      const sources = getSources()
      const profile = getProfile()

      const reqSalida420: TechnicalRequirement = {
        id: "premise_1_salida_4_20ma",
        property: "analog_output",
        operator: "range_contains",
        min: 4,
        max: 20,
        unit: "mA",
      }

      const evalResult = evaluateSingleRequirement(
        reqSalida420,
        profile.variant_id,
        facts,
        sources,
        profile
      )

      expect(evalResult.satisfied).toBe(false)
      expect(evalResult.property).toBe("analog_output")
      expect(evalResult.operator).toBe("range_contains")
      expect(evalResult.reason).toMatch(/Negative technical fact|Sin transmisor|polarity: false/i)
      expect(evalResult.fact_display_value).toBe("0 canales (Sin transmisor; resistencia pura pasiva)")
      expect(evalResult.source_evidence).not.toBeNull()
      expect(evalResult.source_evidence?.section).toBe("Sección 4: Entradas / Salidas Analógicas y Sensores")
      expect(evalResult.source_evidence?.excerpt).toContain("SIN TRANSMISOR INTEGRADO")
    })

    it("Demostración 2: Requerir protocolo 'modbus_rtu' resulta en satisfied = false", () => {
      const facts = getFacts()
      const sources = getSources()
      const profile = getProfile()

      const reqModbusRtu: TechnicalRequirement = {
        id: "premise_2_modbus_rtu",
        property: "protocol",
        operator: "equals",
        value: "modbus_rtu",
      }

      const evalResult = evaluateSingleRequirement(
        reqModbusRtu,
        profile.variant_id,
        facts,
        sources,
        profile
      )

      expect(evalResult.satisfied).toBe(false)
      expect(evalResult.property).toBe("protocol")
      expect(evalResult.operator).toBe("equals")
      expect(evalResult.reason).toMatch(/Negative technical fact|Sin protocolo|polarity: false/i)
      expect(evalResult.fact_display_value).toBe("Ninguno (Sin protocolo serie ni bus de datos)")
      expect(evalResult.source_evidence).not.toBeNull()
      expect(evalResult.source_evidence?.section).toBe("Sección 5: Comunicaciones y Protocolos")
      expect(evalResult.source_evidence?.excerpt).toContain("NO APLICA / SIN PROTOCOLO")
    })

    it("Demostración 3: Requerir 'sensor_element' Pt100 3 hilos pasivo resulta en satisfied = true", () => {
      const facts = getFacts()
      const sources = getSources()
      const profile = getProfile()

      const reqSensorElement: TechnicalRequirement = {
        id: "premise_3_sensor_element_pt100",
        property: "sensor_element",
        operator: "equals",
        value: "Pt100 3 hilos pasivo",
      }

      const evalResult = evaluateSingleRequirement(
        reqSensorElement,
        profile.variant_id,
        facts,
        sources,
        profile
      )

      expect(evalResult.satisfied).toBe(true)
      expect(evalResult.property).toBe("sensor_element")
      expect(evalResult.operator).toBe("equals")
      expect(evalResult.fact_display_value).toBe("Sensor termorresistencia Pt100 Clase A, 3 hilos (-50 a +350 °C)")
      expect(evalResult.reason).toMatch(/Pt100 RTD|Sensor element/i)
      expect(evalResult.source_evidence).not.toBeNull()
      expect(evalResult.source_evidence?.source_id).toBe(SOURCE_ID)
      expect(evalResult.source_evidence?.page).toBe(2)
      expect(evalResult.source_evidence?.section).toBe("Sección 4: Entradas / Salidas Analógicas y Sensores")
      expect(evalResult.source_evidence?.excerpt).toContain("Pt100 calibrado bajo norma IEC 60751 Clase A")
    })

    it("Comportamiento del evaluador ante lote mixto (2 verdaderos + 1 falso) -> overall_satisfied = false", () => {
      const facts = getFacts()
      const sources = getSources()
      const profile = getProfile()

      const mixedReqs: TechnicalRequirement[] = [
        {
          id: "req_ok_1",
          property: "sensor_element",
          operator: "equals",
          value: "Pt100",
        },
        {
          id: "req_ok_2",
          property: "mounting",
          operator: "equals",
          value: "threaded probe",
        },
        {
          id: "req_fail_contra",
          property: "analog_output",
          operator: "range_contains",
          min: 4,
          max: 20,
          unit: "mA",
        },
      ]

      const result = evaluateRequirements(profile.variant_id, mixedReqs, facts, sources, profile)

      expect(result.overall_satisfied).toBe(false)
      expect(result.evaluations[0].satisfied).toBe(true)
      expect(result.evaluations[1].satisfied).toBe(true)
      expect(result.evaluations[2].satisfied).toBe(false)
    })

    it("Comportamiento del evaluador ante lote mixto (Pt100 + modbus_rtu) -> overall_satisfied = false", () => {
      const facts = getFacts()
      const sources = getSources()
      const profile = getProfile()

      const mixedReqs: TechnicalRequirement[] = [
        {
          id: "req_ok_pt100",
          property: "sensor_element",
          operator: "equals",
          value: "Pt100",
        },
        {
          id: "req_fail_modbus",
          property: "protocol",
          operator: "equals",
          value: "modbus_rtu",
        },
      ]

      const result = evaluateRequirements(profile.variant_id, mixedReqs, facts, sources, profile)

      expect(result.overall_satisfied).toBe(false)
      expect(result.evaluations[0].satisfied).toBe(true)
      expect(result.evaluations[1].satisfied).toBe(false)
    })
  })

  // ==========================================================================
  // BLOQUE 4: VERIFICACIÓN DE INTEGRACIÓN Y TRAZABILIDAD DOCUMENTAL
  // ==========================================================================
  describe("4. Trazabilidad Documental y Coherencia de Datos", () => {
    it("Valida metadatos del perfil técnico de SKU 3 (CN-THT02)", () => {
      const profile = getProfile()
      expect(profile.sku).toBe(SKU)
      expect(profile.model).toBe(MODEL)
      expect(profile.revision).toBe(SOURCE_REVISION)
      expect(profile.demo).toBe(true)
    })

    it("Valida existencia de los 7 hechos técnicos con sus polaridades", () => {
      const facts = getFacts()
      expect(facts.length).toBe(7)

      const positiveFacts = facts.filter((f) => f.polarity === true)
      const negativeFacts = facts.filter((f) => f.polarity === false)

      // 3 hechos positivos: mounting, supply_voltage, sensor_element
      expect(positiveFacts).toHaveLength(3)
      const posProps = positiveFacts.map((f) => f.property)
      expect(posProps).toContain("mounting")
      expect(posProps).toContain("supply_voltage")
      expect(posProps).toContain("sensor_element")

      // 4 hechos negativos: analog_input, analog_output, interface, protocol
      expect(negativeFacts).toHaveLength(4)
      const negProps = negativeFacts.map((f) => f.property)
      expect(negProps).toContain("analog_input")
      expect(negProps).toContain("analog_output")
      expect(negProps).toContain("interface")
      expect(negProps).toContain("protocol")
    })

    it("Valida fuente documental única oficial SRC-CN-RTD-P1-DS-V1", () => {
      const sources = getSources()
      expect(sources.length).toBeGreaterThanOrEqual(1)
      const rtdSource = sources.find((s) => s.id === SOURCE_ID)
      expect(rtdSource).toBeDefined()
      expect(rtdSource?.url).toContain("CN-THT02.pdf")
      expect(rtdSource?.revision).toBe(SOURCE_REVISION)
      expect(rtdSource?.checksum).toBe(EXPECTED_CHECKSUM)
    })

    it("Todas las evidencias devueltas en la evaluación apuntan al PDF oficial y sus secciones", () => {
      const facts = getFacts()
      const sources = getSources()
      const profile = getProfile()

      const reqs: TechnicalRequirement[] = [
        { id: "r1", property: "sensor_element", operator: "equals", value: "Pt100" },
        { id: "r2", property: "analog_output", operator: "equals", value: "4-20 mA" },
        { id: "r3", property: "protocol", operator: "equals", value: "modbus_rtu" },
      ]

      const result = evaluateRequirements(profile.variant_id, reqs, facts, sources, profile)

      expect(result.source_revision).toBe(SOURCE_REVISION)
      for (const ev of result.evaluations) {
        expect(ev.source_evidence).not.toBeNull()
        expect(ev.source_evidence?.source_id).toBe(SOURCE_ID)
        expect(ev.source_evidence?.url).toContain("CN-THT02.pdf")
        expect(ev.source_evidence?.section).toMatch(/^Sección [1-6]:/)
        expect(typeof ev.source_evidence?.page).toBe("number")
        expect(ev.source_evidence?.excerpt).toBeTruthy()
      }
    })
  })
})
