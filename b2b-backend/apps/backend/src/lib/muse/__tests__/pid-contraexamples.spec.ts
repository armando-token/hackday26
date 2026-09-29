/**
 * PID Controller Contraexample & Mandatory Claims Test Suite
 * SKU: CN-DEMO-PID-PT100-RS1 (Model: CN-PID-T1)
 *
 * Validaciones obligatorias:
 * 1. Afirmaciones técnicas obligatorias:
 *    - Montaje en panel (1/16 DIN 48x48 mm).
 *    - Entrada sensor Pt100 3 hilos (IEC 60751).
 *    - Control PID avanzado con Auto-Tuning.
 *    - SALIDA analógica 4–20 mA proporcional activa.
 *    - Modbus RTU RS-485 esclavo aislado.
 * 2. Contraejemplos obligatorios:
 *    - Panel ≠ DIN (el PID NO tiene montaje en riel DIN).
 *    - Salida ≠ entrada 4–20 mA (la salida es 4-20 mA, pero la entrada analógica es Pt100 RTD;
 *      NUNCA tratar analog_output como analog_input).
 * 3. Demostración formal requerida:
 *    - Requerir montaje 'din_rail' resulta en satisfied = false.
 *    - Requerir 'analog_input' 4–20 mA resulta en satisfied = false.
 *    - Requerir montaje 'panel' y 'analog_output' 4–20 mA resulta en satisfied = true (y overall_satisfied = true).
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

describe("SKU 2: CN-DEMO-PID-PT100-RS1 (CN-PID-T1) — Contraejemplos y Afirmaciones Obligatorias", () => {
  const SKU = "CN-DEMO-PID-PT100-RS1"
  const MODEL = "CN-PID-T1"
  const VARIANT_ID = "variant_01M3Q80TNZGKAM6EX85BDE7G21"
  const SOURCE_ID = "SRC-CN-PID-T1-DS-V1"

  // Fixtures estáticos canónicos idénticos al seed de producción
  const MOCK_PROFILE: TechnicalProfileRecord = {
    id: "tp_demo_pid",
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
    url: "http://52.20.66.203:8000/demo/datasheets/CN-DEMO-PID-PT100-RS1.pdf",
    kind: "datasheet",
    revision: "rev-2026.1",
    checksum: "b695ef3318e840535601432acb197db1c007ae614673d657df472d9129abdeaf",
    published_at: new Date("2026-09-29T18:00:00Z"),
    created_at: new Date("2026-09-29T18:00:00Z"),
    updated_at: new Date("2026-09-29T18:00:00Z"),
  }

  const MOCK_FACTS: TechnicalFactRecord[] = [
    {
      id: "fact_pid_mounting",
      variant_id: VARIANT_ID,
      property: "mounting",
      normalized_value_json: {
        type: "panel mount",
        standard: "1/16 DIN",
        cutout_mm: "45x45",
        front_bezel_mm: "48x48",
      },
      display_value: "Montaje en panel frontal 1/16 DIN (48×48 mm)",
      source_id: SOURCE_ID,
      page: 1,
      section: "Sección 2: Montaje Físico",
      excerpt:
        "Montaje empotrado en panel o puerta de armario eléctrico formato estándar 1/16 DIN (marco exterior 48 × 48 mm)",
      polarity: true,
      created_at: new Date("2026-09-29T18:00:00Z"),
      updated_at: new Date("2026-09-29T18:00:00Z"),
    },
    {
      id: "fact_pid_voltage",
      variant_id: VARIANT_ID,
      property: "supply_voltage",
      normalized_value_json: {
        type: "AC",
        nominal: "100-240 VAC",
        unit: "VAC",
        frequency_hz: "50/60",
        min: 85,
        max: 264,
      },
      display_value: "100 - 240 VAC universal (85 a 264 VAC)",
      source_id: SOURCE_ID,
      page: 1,
      section: "Sección 3: Alimentación Eléctrica",
      excerpt:
        "Fuente conmutada universal de 100 a 240 VAC (límite operativo: 85 a 264 VAC), 50 / 60 Hz",
      polarity: true,
      created_at: new Date("2026-09-29T18:00:00Z"),
      updated_at: new Date("2026-09-29T18:00:00Z"),
    },
    {
      id: "fact_pid_sensor",
      variant_id: VARIANT_ID,
      property: "sensor_element",
      normalized_value_json: {
        type: "RTD",
        element: "Pt100",
        wires: 3,
        standard: "IEC 60751",
        min_c: -200.0,
        max_c: 600.0,
      },
      display_value: "Entrada termorresistencia Pt100 3 hilos",
      source_id: SOURCE_ID,
      page: 2,
      section: "Sección 4: Entradas / Salidas Analógicas y Sensores",
      excerpt:
        "Entrada directa para sensor resistivo Pt100 con conexionado a 3 hilos para compensación de longitud de línea",
      polarity: true,
      created_at: new Date("2026-09-29T18:00:00Z"),
      updated_at: new Date("2026-09-29T18:00:00Z"),
    },
    {
      id: "fact_pid_analog_input",
      variant_id: VARIANT_ID,
      property: "analog_input",
      normalized_value_json: {
        direction: "input",
        channels: 0,
        available: false,
      },
      display_value: "0 canales (Sin entrada de corriente 4–20 mA)",
      source_id: SOURCE_ID,
      page: 2,
      section: "Sección 4: Entradas / Salidas Analógicas y Sensores",
      excerpt:
        "SIN ENTRADA ANALÓGICA 4–20 mA DIRECTA. La entrada analógica está dedicada exclusivamente a termorresistencia RTD Pt100",
      polarity: false,
      created_at: new Date("2026-09-29T18:00:00Z"),
      updated_at: new Date("2026-09-29T18:00:00Z"),
    },
    {
      id: "fact_pid_analog_output",
      variant_id: VARIANT_ID,
      property: "analog_output",
      normalized_value_json: {
        direction: "output",
        channels: 1,
        signal: "current",
        min: 4,
        max: 20,
        unit: "mA",
        active_loop: true,
        max_load_ohm: 500,
      },
      display_value: "1 salida analógica 4–20 mA activa para control modulante",
      source_id: SOURCE_ID,
      page: 2,
      section: "Sección 4: Entradas / Salidas Analógicas y Sensores",
      excerpt:
        "1 salida analógica proporcional de control en corriente activa 4–20 mA (impedancia de carga máxima 500 Ω)",
      polarity: true,
      created_at: new Date("2026-09-29T18:00:00Z"),
      updated_at: new Date("2026-09-29T18:00:00Z"),
    },
    {
      id: "fact_pid_control",
      variant_id: VARIANT_ID,
      property: "control_function",
      normalized_value_json: {
        type: "PID",
        features: ["auto-tuning", "manual_mode", "on-off"],
        cycle_time_ms: 200,
      },
      display_value: "Regulador PID digital con Auto-Tuning",
      source_id: SOURCE_ID,
      page: 1,
      section: "Sección 1: Identificación y Modelo",
      excerpt:
        "PID avanzado con auto-sintonía adaptativa (Auto-Tuning) y modo manual / ON-OFF seleccionable",
      polarity: true,
      created_at: new Date("2026-09-29T18:00:00Z"),
      updated_at: new Date("2026-09-29T18:00:00Z"),
    },
    {
      id: "fact_pid_protocol",
      variant_id: VARIANT_ID,
      property: "protocol",
      normalized_value_json: {
        name: "Modbus RTU",
        role: "slave",
        baudrates: [4800, 9600, 19200, 38400],
      },
      display_value: "Modbus RTU esclavo",
      source_id: SOURCE_ID,
      page: 2,
      section: "Sección 5: Comunicaciones y Protocolos",
      excerpt:
        "Modbus RTU esclavo con soporte de comandos de lectura de variable de proceso (PV) y escritura de Setpoint (SP)",
      polarity: true,
      created_at: new Date("2026-09-29T18:00:00Z"),
      updated_at: new Date("2026-09-29T18:00:00Z"),
    },
    {
      id: "fact_pid_interface",
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
        "Canal serie RS-485 con aislamiento galvánico de 1000 V RMS y bornas traseras desacoplables",
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
      // Ignorar error al cerrar pool en testing
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
  // BLOQUE 1: VALIDACIÓN DE AFIRMACIONES OBLIGATORIAS (5/5)
  // ==========================================================================
  describe("1. Afirmaciones Técnicas Obligatorias", () => {
    it("Afirmación 1: Montaje en panel frontal (1/16 DIN 48x48 mm) -> satisfied = true", () => {
      const facts = getFacts()
      const sources = getSources()
      const profile = getProfile()

      const req: TechnicalRequirement = {
        id: "req_mounting_panel",
        property: "mounting",
        operator: "equals",
        value: "panel",
      }

      const result = evaluateRequirements(profile.variant_id, [req], facts, sources, profile)
      expect(result.overall_satisfied).toBe(true)
      expect(result.evaluations[0].satisfied).toBe(true)
      expect(result.evaluations[0].fact_display_value).toContain("panel frontal 1/16 DIN")
      expect(result.evaluations[0].source_evidence?.section).toContain("Sección 2")
    })

    it("Afirmación 2: Entrada sensor Pt100 3 hilos -> satisfied = true", () => {
      const facts = getFacts()
      const sources = getSources()
      const profile = getProfile()

      const req: TechnicalRequirement = {
        id: "req_sensor_pt100",
        property: "sensor_element",
        operator: "equals",
        value: "Pt100",
      }

      const result = evaluateRequirements(profile.variant_id, [req], facts, sources, profile)
      expect(result.overall_satisfied).toBe(true)
      expect(result.evaluations[0].satisfied).toBe(true)
      expect(result.evaluations[0].fact_display_value).toContain("Pt100")
      expect(result.evaluations[0].source_evidence?.excerpt).toContain("3 hilos")
    })

    it("Afirmación 3: Control PID avanzado con Auto-Tuning -> satisfied = true", () => {
      const facts = getFacts()
      const sources = getSources()
      const profile = getProfile()

      const req: TechnicalRequirement = {
        id: "req_control_pid",
        property: "control_function",
        operator: "equals",
        value: "PID",
      }

      const result = evaluateRequirements(profile.variant_id, [req], facts, sources, profile)
      expect(result.overall_satisfied).toBe(true)
      expect(result.evaluations[0].satisfied).toBe(true)
      expect(result.evaluations[0].fact_display_value).toContain("PID")
      expect(result.evaluations[0].reason).toContain("PID")
    })

    it("Afirmación 4: SALIDA analógica 4–20 mA activa para control modulante -> satisfied = true", () => {
      const facts = getFacts()
      const sources = getSources()
      const profile = getProfile()

      const req: TechnicalRequirement = {
        id: "req_ao_4_20ma",
        property: "analog_output",
        operator: "range_contains",
        min: 4,
        max: 20,
        unit: "mA",
        direction: "output",
      }

      const result = evaluateRequirements(profile.variant_id, [req], facts, sources, profile)
      expect(result.overall_satisfied).toBe(true)
      expect(result.evaluations[0].satisfied).toBe(true)
      expect(result.evaluations[0].fact_display_value).toContain("4–20 mA activa")
      expect(result.evaluations[0].source_evidence?.page).toBe(2)
    })

    it("Afirmación 5: Modbus RTU RS-485 esclavo aislado -> satisfied = true", () => {
      const facts = getFacts()
      const sources = getSources()
      const profile = getProfile()

      const reqProtocol: TechnicalRequirement = {
        id: "req_protocol_modbus_rtu",
        property: "protocol",
        operator: "equals",
        value: "Modbus RTU",
      }

      const reqInterface: TechnicalRequirement = {
        id: "req_interface_rs485",
        property: "interface",
        operator: "equals",
        value: "RS-485",
      }

      const result = evaluateRequirements(
        profile.variant_id,
        [reqProtocol, reqInterface],
        facts,
        sources,
        profile
      )
      expect(result.overall_satisfied).toBe(true)
      expect(result.evaluations[0].satisfied).toBe(true)
      expect(result.evaluations[1].satisfied).toBe(true)
      expect(result.evaluations[0].fact_display_value).toContain("Modbus RTU esclavo")
      expect(result.evaluations[1].fact_display_value).toContain("RS-485 semidúplex aislado")
    })

    it("Conjunción total de todas las afirmaciones obligatorias -> overall_satisfied = true", () => {
      const facts = getFacts()
      const sources = getSources()
      const profile = getProfile()

      const allMandatoryReqs: TechnicalRequirement[] = [
        { id: "req_1", property: "mounting", operator: "equals", value: "panel" },
        { id: "req_2", property: "sensor_element", operator: "equals", value: "Pt100" },
        { id: "req_3", property: "control_function", operator: "equals", value: "PID" },
        {
          id: "req_4",
          property: "analog_output",
          operator: "range_contains",
          min: 4,
          max: 20,
          unit: "mA",
        },
        { id: "req_5", property: "protocol", operator: "equals", value: "Modbus RTU" },
        { id: "req_6", property: "interface", operator: "equals", value: "RS-485" },
      ]

      const result = evaluateRequirements(
        profile.variant_id,
        allMandatoryReqs,
        facts,
        sources,
        profile
      )

      expect(result.overall_satisfied).toBe(true)
      expect(result.evaluations).toHaveLength(6)
      expect(result.evaluations.every((e) => e.satisfied === true)).toBe(true)
    })
  })

  // ==========================================================================
  // BLOQUE 2: VALIDACIÓN DE CONTRAEJEMPLOS OBLIGATORIOS (2/2)
  // ==========================================================================
  describe("2. Contraejemplos Obligatorios y Restricciones de Diseño", () => {
    describe("Contraejemplo 1: Panel ≠ DIN (el PID NO tiene montaje en riel DIN)", () => {
      it("Requerir 'din_rail' con operator 'equals' -> satisfied = false y overall_satisfied = false", () => {
        const facts = getFacts()
        const sources = getSources()
        const profile = getProfile()

        const req: TechnicalRequirement = {
          id: "req_fail_din_rail",
          property: "mounting",
          operator: "equals",
          value: "din_rail",
        }

        const result = evaluateRequirements(profile.variant_id, [req], facts, sources, profile)

        expect(result.overall_satisfied).toBe(false)
        expect(result.evaluations[0].satisfied).toBe(false)
        expect(result.evaluations[0].reason).toMatch(/mismatch|not DIN rail/i)
        expect(result.evaluations[0].fact_display_value).toContain("panel frontal")
      })

      it("Requerir variantes léxicas 'din rail', 'carril din', 'th35' -> satisfied = false", () => {
        const facts = getFacts()
        const sources = getSources()
        const profile = getProfile()

        const dinSynonyms = ["din rail", "carril din", "riel din", "th35"]

        for (const synonym of dinSynonyms) {
          const req: TechnicalRequirement = {
            id: `req_fail_${synonym.replace(/\s+/g, "_")}`,
            property: "mounting",
            operator: "equals",
            value: synonym,
          }

          const res = evaluateRequirements(profile.variant_id, [req], facts, sources, profile)
          expect(res.overall_satisfied).toBe(false)
          expect(res.evaluations[0].satisfied).toBe(false)
        }
      })

      it("Requerir not_equals 'din_rail' -> satisfied = true (afirmación negativa correcta)", () => {
        const facts = getFacts()
        const sources = getSources()
        const profile = getProfile()

        const req: TechnicalRequirement = {
          id: "req_not_din_rail",
          property: "mounting",
          operator: "not_equals",
          value: "din_rail",
        }

        const result = evaluateRequirements(profile.variant_id, [req], facts, sources, profile)
        expect(result.overall_satisfied).toBe(true)
        expect(result.evaluations[0].satisfied).toBe(true)
      })
    })

    describe("Contraejemplo 2: Salida ≠ Entrada 4–20 mA (NUNCA tratar analog_output como analog_input)", () => {
      it("Requerir 'analog_input' 4–20 mA resulta en satisfied = false y overall_satisfied = false", () => {
        const facts = getFacts()
        const sources = getSources()
        const profile = getProfile()

        const req: TechnicalRequirement = {
          id: "req_fail_analog_input_4_20",
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
        expect(result.evaluations[0].reason).toMatch(/Negative technical fact|polarity: false|0 canales/i)
        expect(result.evaluations[0].fact_display_value).toContain("0 canales")
      })

      it("Requerir 'analog_input' con channels >= 1 -> satisfied = false", () => {
        const facts = getFacts()
        const sources = getSources()
        const profile = getProfile()

        const req: TechnicalRequirement = {
          id: "req_fail_ai_channels",
          property: "analog_input",
          operator: "range_contains",
          channels_at_least: 1,
        }

        const result = evaluateRequirements(profile.variant_id, [req], facts, sources, profile)
        expect(result.overall_satisfied).toBe(false)
        expect(result.evaluations[0].satisfied).toBe(false)
      })

      it("Verifica que la base de datos contiene el hecho prohibitivo con polarity: false y excerpt explícito", () => {
        const facts = getFacts()
        const aiFact = facts.find((f) => f.property === "analog_input")

        expect(aiFact).toBeDefined()
        expect(aiFact?.polarity).toBe(false)
        expect(aiFact?.normalized_value_json?.channels).toBe(0)
        expect(aiFact?.normalized_value_json?.available).toBe(false)
        expect(aiFact?.excerpt).toContain("SIN ENTRADA ANALÓGICA 4–20 mA DIRECTA")
      })

      it("Distingue rigurosamente entre analog_input (false) y analog_output (true)", () => {
        const facts = getFacts()
        const sources = getSources()
        const profile = getProfile()

        // Petición combinada: Requerir AMBAS
        const reqs: TechnicalRequirement[] = [
          {
            id: "req_ai_test",
            property: "analog_input",
            operator: "range_contains",
            min: 4,
            max: 20,
            unit: "mA",
          },
          {
            id: "req_ao_test",
            property: "analog_output",
            operator: "range_contains",
            min: 4,
            max: 20,
            unit: "mA",
          },
        ]

        const result = evaluateRequirements(profile.variant_id, reqs, facts, sources, profile)

        // analog_input DEBE fallar
        const aiEval = result.evaluations.find((e) => e.property === "analog_input")
        expect(aiEval?.satisfied).toBe(false)

        // analog_output DEBE tener éxito
        const aoEval = result.evaluations.find((e) => e.property === "analog_output")
        expect(aoEval?.satisfied).toBe(true)

        // La evaluación general DEBE ser false porque un requisito falló
        expect(result.overall_satisfied).toBe(false)
      })
    })
  })

  // ==========================================================================
  // BLOQUE 3: CONJUNCIÓN POSITIVA EXIGIDA (Montaje Panel + Analog Output 4-20mA)
  // ==========================================================================
  describe("3. Demostración Requerida: Montaje 'panel' y 'analog_output' 4–20 mA -> satisfied = true", () => {
    it("Requerir montaje 'panel' y 'analog_output' 4–20 mA resulta en satisfied = true para ambos y overall_satisfied = true", () => {
      const facts = getFacts()
      const sources = getSources()
      const profile = getProfile()

      const requirements: TechnicalRequirement[] = [
        {
          id: "req_panel_mounting",
          property: "mounting",
          operator: "equals",
          value: "panel",
        },
        {
          id: "req_analog_output_420",
          property: "analog_output",
          operator: "range_contains",
          min: 4,
          max: 20,
          unit: "mA",
        },
      ]

      const result = evaluateRequirements(
        profile.variant_id,
        requirements,
        facts,
        sources,
        profile
      )

      // Verificación estricta de la conjunción
      expect(result.overall_satisfied).toBe(true)
      expect(result.evaluations).toHaveLength(2)

      const mountingEval = result.evaluations.find((e) => e.requirement_id === "req_panel_mounting" || e.property === "mounting")
      expect(mountingEval).toBeDefined()
      expect(mountingEval?.satisfied).toBe(true)
      expect(mountingEval?.fact_display_value).toContain("panel")

      const aoEval = result.evaluations.find((e) => e.requirement_id === "req_analog_output_420" || e.property === "analog_output")
      expect(aoEval).toBeDefined()
      expect(aoEval?.satisfied).toBe(true)
      expect(aoEval?.fact_display_value).toContain("4–20 mA")

      // Ambas evidencias provienen del datasheet oficial de demostración
      expect(mountingEval?.source_evidence?.source_id).toBe(SOURCE_ID)
      expect(aoEval?.source_evidence?.source_id).toBe(SOURCE_ID)
    })

    it("Contaminación con contraejemplo: Panel + Salida 4-20 mA + Riel DIN -> overall_satisfied = false", () => {
      const facts = getFacts()
      const sources = getSources()
      const profile = getProfile()

      const requirements: TechnicalRequirement[] = [
        {
          id: "req_valid_panel",
          property: "mounting",
          operator: "equals",
          value: "panel",
        },
        {
          id: "req_valid_ao",
          property: "analog_output",
          operator: "range_contains",
          min: 4,
          max: 20,
          unit: "mA",
        },
        {
          id: "req_invalid_din",
          property: "mounting",
          operator: "equals",
          value: "din_rail",
        },
      ]

      const result = evaluateRequirements(
        profile.variant_id,
        requirements,
        facts,
        sources,
        profile
      )

      expect(result.overall_satisfied).toBe(false)
      expect(result.evaluations[0].satisfied).toBe(true)
      expect(result.evaluations[1].satisfied).toBe(true)
      expect(result.evaluations[2].satisfied).toBe(false)
    })

    it("Contaminación con contraejemplo: Panel + Salida 4-20 mA + Entrada 4-20 mA -> overall_satisfied = false", () => {
      const facts = getFacts()
      const sources = getSources()
      const profile = getProfile()

      const requirements: TechnicalRequirement[] = [
        {
          id: "req_valid_panel",
          property: "mounting",
          operator: "equals",
          value: "panel",
        },
        {
          id: "req_valid_ao",
          property: "analog_output",
          operator: "range_contains",
          min: 4,
          max: 20,
          unit: "mA",
        },
        {
          id: "req_invalid_ai",
          property: "analog_input",
          operator: "range_contains",
          min: 4,
          max: 20,
          unit: "mA",
        },
      ]

      const result = evaluateRequirements(
        profile.variant_id,
        requirements,
        facts,
        sources,
        profile
      )

      expect(result.overall_satisfied).toBe(false)
      expect(result.evaluations[0].satisfied).toBe(true)
      expect(result.evaluations[1].satisfied).toBe(true)
      expect(result.evaluations[2].satisfied).toBe(false)
    })
  })

  // ==========================================================================
  // BLOQUE 4: INTEGRIDAD DE CITACIÓN DOCUMENTAL (FUENTES AUDITABLES)
  // ==========================================================================
  describe("4. Trazabilidad Criptográfica y Evidencia Citable", () => {
    it("Verifica que las evaluaciones retornan source_id, url y revisión válidos", () => {
      const facts = getFacts()
      const sources = getSources()
      const profile = getProfile()

      const req: TechnicalRequirement = {
        id: "req_evidence_check",
        property: "analog_output",
        operator: "range_contains",
        min: 4,
        max: 20,
        unit: "mA",
      }

      const result = evaluateRequirements(profile.variant_id, [req], facts, sources, profile)
      const ev = result.evaluations[0].source_evidence

      expect(ev).toBeDefined()
      expect(ev?.source_id).toBe(SOURCE_ID)
      expect(ev?.url).toContain("CN-DEMO-PID-PT100-RS1.pdf")
      expect(ev?.page).toBe(2)
      expect(ev?.section).toBe("Sección 4: Entradas / Salidas Analógicas y Sensores")
      expect(ev?.excerpt).toContain("1 salida analógica proporcional de control")
    })
  })
})
