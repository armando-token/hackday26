/**
 * PLC Controller Contraexample & Mandatory Claims Test Suite
 * SKU: CN-DEMO-PLC-DIN-420-MR1 (Model: CN-DIN-PLC-A1)
 *
 * Verificaciones obligatorias:
 * 1. Afirmaciones obligatorias:
 *    - Montaje en carril DIN 35 mm (IEC/EN 60715).
 *    - 24 VDC alimentación continua (rango operativo 18.0 a 30.0 VDC).
 *    - 2 entradas analógicas 4–20 mA (12 bits ADC).
 *    - Interfaz serie física RS-485 semidúplex aislada.
 *    - Protocolo Modbus RTU slave (modo esclavo).
 * 2. Contraejemplos obligatorios:
 *    - NO afirmar Modbus TCP (carece de controlador Ethernet, RJ-45 y pila TCP/IP).
 *    - NO afirmar salida analógica (analog_output: 0 canales, carece de DAC, polarity: false).
 * 3. Demostración formal requerida:
 *    - Requerir 'Modbus TCP' resulta en satisfied = false.
 *    - Requerir 'analog_output' resulta en satisfied = false.
 *    - Requerir 'Modbus RTU' y 'analog_input' 4–20 mA resulta en satisfied = true (overall_satisfied = true).
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

describe("SKU 1: CN-DEMO-PLC-DIN-420-MR1 (CN-DIN-PLC-A1) — Contraejemplos y Afirmaciones Obligatorias", () => {
  const SKU = "CN-DEMO-PLC-DIN-420-MR1"
  const MODEL = "CN-DIN-PLC-A1"
  const VARIANT_ID = "variant_01M3Q80TB1MN6861FT63TR6BTP"
  const SOURCE_ID = "SRC-CN-DIN-PLC-A1-DS-V1"

  // Fixtures estáticos canónicos idénticos al seed de producción
  const MOCK_PROFILE: TechnicalProfileRecord = {
    id: "tp_demo_plc",
    variant_id: VARIANT_ID,
    model: MODEL,
    revision: "rev-2026.1",
    demo: true,
    sku: SKU,
    created_at: new Date("2026-09-29T18:00:00Z"),
    updated_at: new Date("2026-09-29T18:00:00Z"),
  }

  const MOCK_SOURCE: TechnicalSourceRecord = {
    id: SOURCE_ID,
    url: "http://52.20.66.203:8000/demo/datasheets/CN-DEMO-PLC-DIN-420-MR1.pdf",
    kind: "datasheet",
    revision: "rev-2026.1",
    checksum: "8009da7ddf415884229b8570d75fd59e602aad1013caab851ac61d06c361e385",
    published_at: new Date("2026-09-29T18:00:00Z"),
    created_at: new Date("2026-09-29T18:00:00Z"),
    updated_at: new Date("2026-09-29T18:00:00Z"),
  }

  const MOCK_FACTS: TechnicalFactRecord[] = [
    {
      id: "fact_plc_mounting",
      variant_id: VARIANT_ID,
      property: "mounting",
      normalized_value_json: {
        type: "DIN rail",
        standard: "IEC/EN 60715",
        size_mm: 35,
      },
      display_value: "Montaje en carril DIN 35 mm",
      source_id: SOURCE_ID,
      page: 1,
      section: "Sección 2: Montaje Físico",
      excerpt:
        "Montaje en carril DIN simétrico de 35 mm bajo norma internacional IEC / EN 60715 (perfiles TH35-7.5 y TH35-15)",
      polarity: true,
      created_at: new Date("2026-09-29T18:00:00Z"),
      updated_at: new Date("2026-09-29T18:00:00Z"),
    },
    {
      id: "fact_plc_supply_voltage",
      variant_id: VARIANT_ID,
      property: "supply_voltage",
      normalized_value_json: {
        type: "DC",
        nominal: 24,
        unit: "VDC",
        min: 18.0,
        max: 30.0,
      },
      display_value: "24 VDC (18.0 a 30.0 VDC)",
      source_id: SOURCE_ID,
      page: 1,
      section: "Sección 3: Alimentación Eléctrica",
      excerpt:
        "24 VDC nominales en corriente continua (rango operativo garantizado: 18.0 VDC a 30.0 VDC)",
      polarity: true,
      created_at: new Date("2026-09-29T18:00:00Z"),
      updated_at: new Date("2026-09-29T18:00:00Z"),
    },
    {
      id: "fact_plc_analog_input",
      variant_id: VARIANT_ID,
      property: "analog_input",
      normalized_value_json: {
        direction: "input",
        channels: 2,
        signal: "current",
        min: 4,
        max: 20,
        unit: "mA",
        resolution_bits: 12,
      },
      display_value: "2 entradas analógicas 4–20 mA (12 bits)",
      source_id: SOURCE_ID,
      page: 2,
      section: "Sección 4: Entradas / Salidas Analógicas y Sensores",
      excerpt:
        "2 canales independientes de entrada analógica en lazo de corriente estándar 4–20 mA",
      polarity: true,
      created_at: new Date("2026-09-29T18:00:00Z"),
      updated_at: new Date("2026-09-29T18:00:00Z"),
    },
    {
      id: "fact_plc_analog_output",
      variant_id: VARIANT_ID,
      property: "analog_output",
      normalized_value_json: {
        direction: "output",
        channels: 0,
        available: false,
      },
      display_value: "0 canales (Sin salidas analógicas)",
      source_id: SOURCE_ID,
      page: 2,
      section: "Sección 4: Entradas / Salidas Analógicas y Sensores",
      excerpt:
        "SIN SALIDAS ANALÓGICAS (0 canales de salida analógica). No dispone de DAC ni lazos 4–20 mA de transmisión",
      polarity: false,
      created_at: new Date("2026-09-29T18:00:00Z"),
      updated_at: new Date("2026-09-29T18:00:00Z"),
    },
    {
      id: "fact_plc_protocol",
      variant_id: VARIANT_ID,
      property: "protocol",
      normalized_value_json: {
        name: "Modbus RTU",
        role: "slave",
        baudrates: [9600, 19200, 38400, 57600, 115200],
      },
      display_value: "Modbus RTU esclavo",
      source_id: SOURCE_ID,
      page: 2,
      section: "Sección 5: Comunicaciones y Protocolos",
      excerpt:
        "Modbus RTU en modo esclavo (slave) configurable por software con registros estándar de lectura/escritura",
      polarity: true,
      created_at: new Date("2026-09-29T18:00:00Z"),
      updated_at: new Date("2026-09-29T18:00:00Z"),
    },
    {
      id: "fact_plc_interface",
      variant_id: VARIANT_ID,
      property: "interface",
      normalized_value_json: {
        type: "serial",
        physical_layer: "RS-485",
        duplex: "half-duplex",
        isolation_v: 1000,
      },
      display_value: "RS-485 semidúplex aislado",
      source_id: SOURCE_ID,
      page: 2,
      section: "Sección 5: Comunicaciones y Protocolos",
      excerpt:
        "Puerto serie físico RS-485 semidúplex (2 hilos A/B + común GND) con aislamiento galvánico de 1000 V",
      polarity: true,
      created_at: new Date("2026-09-29T18:00:00Z"),
      updated_at: new Date("2026-09-29T18:00:00Z"),
    },
    {
      id: "fact_plc_control_function",
      variant_id: VARIANT_ID,
      property: "control_function",
      normalized_value_json: {
        type: "PLC",
        digital_inputs: 4,
        digital_outputs: 4,
      },
      display_value: "PLC compacto con 4 DI y 4 DO",
      source_id: SOURCE_ID,
      page: 1,
      section: "Sección 1: Identificación y Modelo",
      excerpt:
        "El microcontrolador industrial modelo CN-DIN-PLC-A1 (código SKU: CN-DEMO-PLC-DIN-420-MR1) es una estación compacta de adquisición y control lógico para cuadros eléctricos.",
      polarity: true,
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
      // Ignorar error al cerrar pool en entorno de test
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
  // BLOQUE 1: VALIDACIÓN DE LAS AFIRMACIONES OBLIGATORIAS (5/5)
  // ==========================================================================
  describe("1. Afirmaciones Técnicas Obligatorias", () => {
    it("Afirmación 1: Montaje DIN 35 mm (carril simétrico IEC/EN 60715) -> satisfied = true", () => {
      const facts = getFacts()
      const sources = getSources()
      const profile = getProfile()

      const req: TechnicalRequirement = {
        id: "req_mounting_din",
        property: "mounting",
        operator: "equals",
        value: "din rail",
      }

      const result = evaluateRequirements(profile.variant_id, [req], facts, sources, profile)
      expect(result.overall_satisfied).toBe(true)
      expect(result.evaluations[0].satisfied).toBe(true)
      expect(result.evaluations[0].fact_display_value).toContain("carril DIN 35 mm")
      expect(result.evaluations[0].source_evidence?.section).toContain("Sección 2")
      expect(result.evaluations[0].source_evidence?.excerpt).toContain("IEC / EN 60715")
    })

    it("Afirmación 2: Alimentación 24 VDC continua (18 a 30 VDC) -> satisfied = true", () => {
      const facts = getFacts()
      const sources = getSources()
      const profile = getProfile()

      const req: TechnicalRequirement = {
        id: "req_supply_voltage_24vdc",
        property: "supply_voltage",
        operator: "range_contains",
        min: 24,
        max: 24,
        unit: "VDC",
      }

      const result = evaluateRequirements(profile.variant_id, [req], facts, sources, profile)
      expect(result.overall_satisfied).toBe(true)
      expect(result.evaluations[0].satisfied).toBe(true)
      expect(result.evaluations[0].fact_display_value).toContain("24 VDC")
      expect(result.evaluations[0].source_evidence?.section).toContain("Sección 3")
      expect(result.evaluations[0].source_evidence?.excerpt).toContain("18.0 VDC a 30.0 VDC")
    })

    it("Afirmación 3: 2 entradas analógicas 4–20 mA (12 bits ADC) -> satisfied = true", () => {
      const facts = getFacts()
      const sources = getSources()
      const profile = getProfile()

      const req: TechnicalRequirement = {
        id: "req_ai_4_20ma_2ch",
        property: "analog_input",
        operator: "range_contains",
        min: 4,
        max: 20,
        unit: "mA",
        direction: "input",
        channels_at_least: 2,
      }

      const result = evaluateRequirements(profile.variant_id, [req], facts, sources, profile)
      expect(result.overall_satisfied).toBe(true)
      expect(result.evaluations[0].satisfied).toBe(true)
      expect(result.evaluations[0].fact_display_value).toContain("2 entradas analógicas 4–20 mA")
      expect(result.evaluations[0].source_evidence?.section).toContain("Sección 4")
      expect(result.evaluations[0].source_evidence?.excerpt).toContain("2 canales independientes")
    })

    it("Afirmación 4: Interfaz física RS-485 semidúplex aislada -> satisfied = true", () => {
      const facts = getFacts()
      const sources = getSources()
      const profile = getProfile()

      const req: TechnicalRequirement = {
        id: "req_interface_rs485",
        property: "interface",
        operator: "equals",
        value: "RS-485",
      }

      const result = evaluateRequirements(profile.variant_id, [req], facts, sources, profile)
      expect(result.overall_satisfied).toBe(true)
      expect(result.evaluations[0].satisfied).toBe(true)
      expect(result.evaluations[0].fact_display_value).toContain("RS-485")
      expect(result.evaluations[0].source_evidence?.section).toContain("Sección 5")
      expect(result.evaluations[0].source_evidence?.excerpt).toContain("aislamiento galvánico de 1000 V")
    })

    it("Afirmación 5: Protocolo Modbus RTU en modo esclavo (slave) -> satisfied = true", () => {
      const facts = getFacts()
      const sources = getSources()
      const profile = getProfile()

      const req: TechnicalRequirement = {
        id: "req_protocol_modbus_rtu",
        property: "protocol",
        operator: "equals",
        value: "Modbus RTU",
      }

      const result = evaluateRequirements(profile.variant_id, [req], facts, sources, profile)
      expect(result.overall_satisfied).toBe(true)
      expect(result.evaluations[0].satisfied).toBe(true)
      expect(result.evaluations[0].fact_display_value).toContain("Modbus RTU esclavo")
      expect(result.evaluations[0].source_evidence?.section).toContain("Sección 5")
      expect(result.evaluations[0].source_evidence?.excerpt).toContain("modo esclavo (slave)")
    })

    it("Conjunto completo: Las 5 afirmaciones obligatorias evaluadas conjuntamente -> overall_satisfied = true", () => {
      const facts = getFacts()
      const sources = getSources()
      const profile = getProfile()

      const allClaims: TechnicalRequirement[] = [
        { id: "req_din", property: "mounting", operator: "equals", value: "DIN rail" },
        { id: "req_24v", property: "supply_voltage", operator: "range_contains", min: 24, max: 24, unit: "VDC" },
        { id: "req_2ai", property: "analog_input", operator: "range_contains", min: 4, max: 20, unit: "mA", channels_at_least: 2 },
        { id: "req_rs485", property: "interface", operator: "equals", value: "RS-485" },
        { id: "req_rtu", property: "protocol", operator: "equals", value: "Modbus RTU" },
      ]

      const result = evaluateRequirements(profile.variant_id, allClaims, facts, sources, profile)
      expect(result.overall_satisfied).toBe(true)
      expect(result.evaluations).toHaveLength(5)
      result.evaluations.forEach((evalItem) => {
        expect(evalItem.satisfied).toBe(true)
      })
    })
  })

  // ==========================================================================
  // BLOQUE 2: VALIDACIÓN DE CONTRAEJEMPLOS OBLIGATORIOS (2/2)
  // ==========================================================================
  describe("2. Contraejemplos Técnicos Obligatorios", () => {
    describe("Contraejemplo 1: NO afirmar Modbus TCP (carece de Ethernet / TCP)", () => {
      it("Requerir 'Modbus TCP' con operator 'equals' resulta en satisfied = false", () => {
        const facts = getFacts()
        const sources = getSources()
        const profile = getProfile()

        const req: TechnicalRequirement = {
          id: "req_modbus_tcp_contraexample",
          property: "protocol",
          operator: "equals",
          value: "Modbus TCP",
        }

        const result = evaluateRequirements(profile.variant_id, [req], facts, sources, profile)
        expect(result.overall_satisfied).toBe(false)
        expect(result.evaluations[0].satisfied).toBe(false)
        expect(result.evaluations[0].reason).toMatch(/Protocol mismatch: required 'Modbus TCP'/i)
        expect(result.evaluations[0].reason).toMatch(/no Ethernet\/TCP/i)
      })

      it("Requerir 'modbus_tcp' o 'tcp' en distintas variantes de texto resulta en satisfied = false", () => {
        const facts = getFacts()
        const sources = getSources()
        const profile = getProfile()

        const variations = ["Modbus-TCP", "modbus_tcp", "MODBUS TCP", "Ethernet TCP"]
        for (const v of variations) {
          const req: TechnicalRequirement = {
            id: `req_tcp_${v}`,
            property: "protocol",
            operator: "equals",
            value: v,
          }
          const result = evaluateRequirements(profile.variant_id, [req], facts, sources, profile)
          expect(result.overall_satisfied).toBe(false)
          expect(result.evaluations[0].satisfied).toBe(false)
        }
      })

      it("Evidencia formal de la contraindicación Modbus TCP en el datasheet/spec", () => {
        // En Sección 6 del documento técnico de SKU 1 se declara explícitamente:
        // 'El modelo CN-DIN-PLC-A1 NO cuenta con interfaz Ethernet ni soporta el protocolo Modbus TCP...'
        const facts = getFacts()
        const protocolFact = facts.find((f) => f.property === "protocol")
        expect(protocolFact).toBeDefined()
        expect(protocolFact?.display_value).toBe("Modbus RTU esclavo")
        // No existe ningún hecho técnico que admita Modbus TCP
        const tcpFacts = facts.filter((f) =>
          JSON.stringify(f.normalized_value_json || {}).toLowerCase().includes("tcp")
        )
        expect(tcpFacts).toHaveLength(0)
      })
    })

    describe("Contraejemplo 2: NO afirmar salida analógica (no tiene analog_output)", () => {
      it("Requerir 'analog_output' con range_contains (4-20 mA) resulta en satisfied = false", () => {
        const facts = getFacts()
        const sources = getSources()
        const profile = getProfile()

        const req: TechnicalRequirement = {
          id: "req_ao_4_20ma_contraexample",
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
        expect(result.evaluations[0].reason).toMatch(/Negative technical fact \(polarity: false\)/i)
        expect(result.evaluations[0].fact_display_value).toBe("0 canales (Sin salidas analógicas)")
        expect(result.evaluations[0].source_evidence?.excerpt).toContain("SIN SALIDAS ANALÓGICAS")
      })

      it("Requerir 'analog_output' con operator 'equals' (1 canal) resulta en satisfied = false", () => {
        const facts = getFacts()
        const sources = getSources()
        const profile = getProfile()

        const req: TechnicalRequirement = {
          id: "req_ao_equals_1ch",
          property: "analog_output",
          operator: "equals",
          value: { channels: 1, available: true },
        }

        const result = evaluateRequirements(profile.variant_id, [req], facts, sources, profile)
        expect(result.overall_satisfied).toBe(false)
        expect(result.evaluations[0].satisfied).toBe(false)
        expect(result.evaluations[0].reason).toContain("polarity: false")
      })

      it("Requerir 'analog_output' con channels_at_least: 1 resulta en satisfied = false", () => {
        const facts = getFacts()
        const sources = getSources()
        const profile = getProfile()

        const req: TechnicalRequirement = {
          id: "req_ao_channels_at_least",
          property: "analog_output",
          operator: "range_contains",
          channels_at_least: 1,
        }

        const result = evaluateRequirements(profile.variant_id, [req], facts, sources, profile)
        expect(result.overall_satisfied).toBe(false)
        expect(result.evaluations[0].satisfied).toBe(false)
      })

      it("Consultar explícitamente ausencia de analog_output (channels: 0 o polarity: false) resulta en satisfied = true", () => {
        const facts = getFacts()
        const sources = getSources()
        const profile = getProfile()

        // Una consulta que verifica la NO existencia o 0 salidas analógicas debe satisfacerse
        const req: TechnicalRequirement = {
          id: "req_verify_no_analog_output",
          property: "analog_output",
          operator: "equals",
          value: { channels: 0, available: false },
        }

        const result = evaluateRequirements(profile.variant_id, [req], facts, sources, profile)
        expect(result.overall_satisfied).toBe(true)
        expect(result.evaluations[0].satisfied).toBe(true)
        expect(result.evaluations[0].reason).toContain("Negative technical fact confirms absence")
      })
    })
  })

  // ==========================================================================
  // BLOQUE 3: DEMOSTRACIONES FORMALES OBLIGATORIAS (PROMPT ESPECÍFICO)
  // ==========================================================================
  describe("3. Demostraciones Formales Requeridas por la Auditoría", () => {
    it("Requerir 'Modbus TCP' resulta en satisfied = false", () => {
      const facts = getFacts()
      const sources = getSources()
      const profile = getProfile()

      const req: TechnicalRequirement = {
        id: "demo_modbus_tcp",
        property: "protocol",
        operator: "equals",
        value: "Modbus TCP",
      }

      const evalResult = evaluateSingleRequirement(
        req,
        profile.variant_id,
        facts,
        new Map(sources.map((s) => [s.id, s])),
        profile
      )

      expect(evalResult.satisfied).toBe(false)
      expect(evalResult.property).toBe("protocol")
      expect(evalResult.operator).toBe("equals")
      expect(evalResult.reason).toContain("Modbus TCP")
    })

    it("Requerir 'analog_output' resulta en satisfied = false", () => {
      const facts = getFacts()
      const sources = getSources()
      const profile = getProfile()

      const req: TechnicalRequirement = {
        id: "demo_analog_output",
        property: "analog_output",
        operator: "range_contains",
        min: 4,
        max: 20,
        unit: "mA",
      }

      const evalResult = evaluateSingleRequirement(
        req,
        profile.variant_id,
        facts,
        new Map(sources.map((s) => [s.id, s])),
        profile
      )

      expect(evalResult.satisfied).toBe(false)
      expect(evalResult.property).toBe("analog_output")
      expect(evalResult.reason).toContain("polarity: false")
    })

    it("Requerir 'Modbus RTU' y 'analog_input' 4–20 mA resulta en satisfied = true (overall_satisfied = true)", () => {
      const facts = getFacts()
      const sources = getSources()
      const profile = getProfile()

      const requirements: TechnicalRequirement[] = [
        {
          id: "demo_modbus_rtu",
          property: "protocol",
          operator: "equals",
          value: "Modbus RTU",
        },
        {
          id: "demo_analog_input_420",
          property: "analog_input",
          operator: "range_contains",
          min: 4,
          max: 20,
          unit: "mA",
          direction: "input",
        },
      ]

      const result = evaluateRequirements(profile.variant_id, requirements, facts, sources, profile)

      expect(result.overall_satisfied).toBe(true)
      expect(result.evaluations).toHaveLength(2)

      const rtuEval = result.evaluations.find((e) => e.requirement_id === "demo_modbus_rtu")
      expect(rtuEval).toBeDefined()
      expect(rtuEval?.satisfied).toBe(true)
      expect(rtuEval?.fact_display_value).toContain("Modbus RTU esclavo")

      const aiEval = result.evaluations.find((e) => e.requirement_id === "demo_analog_input_420")
      expect(aiEval).toBeDefined()
      expect(aiEval?.satisfied).toBe(true)
      expect(aiEval?.fact_display_value).toContain("2 entradas analógicas 4–20 mA")
    })

    it("Combinar requerimientos válidos con 'Modbus TCP' arruina el resultado global (overall_satisfied = false)", () => {
      const facts = getFacts()
      const sources = getSources()
      const profile = getProfile()

      const mixedReqs: TechnicalRequirement[] = [
        {
          id: "req_valid_rtu",
          property: "protocol",
          operator: "equals",
          value: "Modbus RTU",
        },
        {
          id: "req_valid_ai",
          property: "analog_input",
          operator: "range_contains",
          min: 4,
          max: 20,
          unit: "mA",
        },
        {
          id: "req_invalid_tcp",
          property: "protocol",
          operator: "equals",
          value: "Modbus TCP",
        },
      ]

      const result = evaluateRequirements(profile.variant_id, mixedReqs, facts, sources, profile)

      expect(result.overall_satisfied).toBe(false)
      const validRtu = result.evaluations.find((e) => e.requirement_id === "req_valid_rtu")
      const validAi = result.evaluations.find((e) => e.requirement_id === "req_valid_ai")
      const invalidTcp = result.evaluations.find((e) => e.requirement_id === "req_invalid_tcp")

      expect(validRtu?.satisfied).toBe(true)
      expect(validAi?.satisfied).toBe(true)
      expect(invalidTcp?.satisfied).toBe(false)
    })

    it("Combinar requerimientos válidos con 'analog_output' arruina el resultado global (overall_satisfied = false)", () => {
      const facts = getFacts()
      const sources = getSources()
      const profile = getProfile()

      const mixedReqs: TechnicalRequirement[] = [
        {
          id: "req_valid_mounting",
          property: "mounting",
          operator: "equals",
          value: "DIN rail",
        },
        {
          id: "req_valid_voltage",
          property: "supply_voltage",
          operator: "range_contains",
          min: 24,
          max: 24,
          unit: "VDC",
        },
        {
          id: "req_invalid_ao",
          property: "analog_output",
          operator: "range_contains",
          min: 4,
          max: 20,
          unit: "mA",
        },
      ]

      const result = evaluateRequirements(profile.variant_id, mixedReqs, facts, sources, profile)

      expect(result.overall_satisfied).toBe(false)
      const validMounting = result.evaluations.find((e) => e.requirement_id === "req_valid_mounting")
      const validVoltage = result.evaluations.find((e) => e.requirement_id === "req_valid_voltage")
      const invalidAo = result.evaluations.find((e) => e.requirement_id === "req_invalid_ao")

      expect(validMounting?.satisfied).toBe(true)
      expect(validVoltage?.satisfied).toBe(true)
      expect(invalidAo?.satisfied).toBe(false)
    })
  })

  // ==========================================================================
  // BLOQUE 4: AISLAMIENTO ESTRICTO DE DIRECCIÓN (INPUT vs OUTPUT)
  // ==========================================================================
  describe("4. Aislamiento Estricto de Dirección de Señal", () => {
    it("analog_input (4–20 mA, soportado) NUNCA satisface un requirement de analog_output", () => {
      const facts = getFacts()
      const sources = getSources()
      const profile = getProfile()

      // Solicitud de analog_output
      const reqAo: TechnicalRequirement = {
        id: "req_strictly_output",
        property: "analog_output",
        operator: "range_contains",
        min: 4,
        max: 20,
        unit: "mA",
        direction: "output",
      }

      const result = evaluateRequirements(profile.variant_id, [reqAo], facts, sources, profile)
      expect(result.overall_satisfied).toBe(false)
      expect(result.evaluations[0].satisfied).toBe(false)
      // Debe haber evaluado contra el hecho de analog_output (polarity: false) y fallado
      expect(result.evaluations[0].property).toBe("analog_output")
    })

    it("analog_output (0 canales, no disponible) NUNCA contamina la evaluación de analog_input", () => {
      const facts = getFacts()
      const sources = getSources()
      const profile = getProfile()

      const reqAi: TechnicalRequirement = {
        id: "req_strictly_input",
        property: "analog_input",
        operator: "range_contains",
        min: 4,
        max: 20,
        unit: "mA",
        direction: "input",
        channels_at_least: 2,
      }

      const result = evaluateRequirements(profile.variant_id, [reqAi], facts, sources, profile)
      expect(result.overall_satisfied).toBe(true)
      expect(result.evaluations[0].satisfied).toBe(true)
      expect(result.evaluations[0].property).toBe("analog_input")
      expect(result.evaluations[0].fact_display_value).toContain("2 entradas analógicas")
    })
  })

  // ==========================================================================
  // BLOQUE 5: TRAZABILIDAD Y CITAS FORMALES DOCUMENTALES
  // ==========================================================================
  describe("5. Integridad de Citas Documentales y Trazabilidad", () => {
    it("Verifica que las evidencias de fuente contienen URLs válidas y source_id consistente", () => {
      const facts = getFacts()
      const sources = getSources()
      const profile = getProfile()

      const reqs: TechnicalRequirement[] = [
        { id: "req_t1", property: "mounting", operator: "equals", value: "DIN rail" },
        { id: "req_t2", property: "protocol", operator: "equals", value: "Modbus RTU" },
      ]

      const result = evaluateRequirements(profile.variant_id, reqs, facts, sources, profile)

      expect(result.source_revision).toBe("rev-2026.1")
      for (const ev of result.evaluations) {
        expect(ev.source_evidence).not.toBeNull()
        expect(ev.source_evidence?.source_id).toBe(SOURCE_ID)
        expect(ev.source_evidence?.source_revision).toBe("rev-2026.1")
        expect(ev.source_evidence?.url).toContain("CN-DEMO-PLC-DIN-420-MR1.pdf")
        expect(typeof ev.source_evidence?.page).toBe("number")
        expect(ev.source_evidence?.section).toBeTruthy()
        expect(ev.source_evidence?.excerpt).toBeTruthy()
      }
    })

    it("Verifica que el checksum criptográfico del datasheet PDF de SKU 1 coincide", () => {
      const sources = getSources()
      const plcSource = sources.find((s) => s.id === SOURCE_ID)
      expect(plcSource).toBeDefined()
      expect(plcSource?.checksum).toBe(
        "8009da7ddf415884229b8570d75fd59e602aad1013caab851ac61d06c361e385"
      )
    })
  })

  // ==========================================================================
  // BLOQUE 6: VERIFICACIÓN CONTRA BASE DE DATOS REAL (SI ESTÁ CONECTADA)
  // ==========================================================================
  describe("6. Verificación con Base de Datos PostgreSQL Real", () => {
    it("Verifica que la base de datos PostgreSQL contiene los hechos técnicos de SKU 1", async () => {
      if (!dbAvailable) {
        console.warn("Base de datos no disponible durante ejecución de prueba; usando fixtures estáticos.")
        return
      }

      expect(liveProfile).not.toBeNull()
      expect(liveProfile?.sku).toBe(SKU)
      expect(liveProfile?.model).toBe(MODEL)
      expect(liveFacts.length).toBeGreaterThanOrEqual(7)

      // Verificar que el hecho de protocol en DB es Modbus RTU (y NO TCP)
      const dbProtocol = liveFacts.find((f) => f.property === "protocol")
      expect(dbProtocol).toBeDefined()
      expect(dbProtocol?.polarity).toBe(true)
      expect(dbProtocol?.display_value).toBe("Modbus RTU esclavo")

      // Verificar que el hecho de analog_output en DB tiene polarity: false
      const dbAo = liveFacts.find((f) => f.property === "analog_output")
      expect(dbAo).toBeDefined()
      expect(dbAo?.polarity).toBe(false)
      expect(dbAo?.display_value).toBe("0 canales (Sin salidas analógicas)")

      // Verificar que el hecho de analog_input en DB tiene 2 canales 4-20 mA
      const dbAi = liveFacts.find((f) => f.property === "analog_input")
      expect(dbAi).toBeDefined()
      expect(dbAi?.polarity).toBe(true)
      expect(dbAi?.normalized_value_json?.channels).toBe(2)
      expect(dbAi?.normalized_value_json?.min).toBe(4)
      expect(dbAi?.normalized_value_json?.max).toBe(20)
    })
  })
})
