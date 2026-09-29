import {
  evaluateRequirements,
  evaluateSingleRequirement,
  parseRangeString,
  normalizeString,
  normalizeUnit,
  TechnicalRequirement,
} from "../evaluator"
import { TechnicalFactRecord, TechnicalProfileRecord, TechnicalSourceRecord } from "../db"

describe("Deterministic Technical Evaluation Engine (evaluator.ts)", () => {
  const dummyProfile: TechnicalProfileRecord = {
    id: "techprof_demo_1",
    variant_id: "variant_plc_1",
    model: "CN-DIN-PLC-A1",
    revision: "rev-2026.1",
    demo: true,
    sku: "CN-X5PRIME-HE-XP5",
    created_at: new Date(),
    updated_at: new Date(),
  }

  const dummySources: TechnicalSourceRecord[] = [
    {
      id: "SRC-CN-DIN-PLC-A1-DS-V1",
      url: "http://52.20.66.203:8000/demo/datasheets/CN-X5PRIME-HE-XP5.pdf",
      kind: "datasheet",
      revision: "rev-2026.1",
      checksum: "8009da7ddf415884229b8570d75fd59e602aad1013caab851ac61d06c361e385",
      published_at: new Date("2026-09-29T18:00:00Z"),
      created_at: new Date(),
      updated_at: new Date(),
    },
  ]

  const plcFacts: TechnicalFactRecord[] = [
    {
      id: "fact_1",
      variant_id: "variant_plc_1",
      property: "mounting",
      normalized_value_json: { type: "DIN rail", standard: "IEC/EN 60715", size_mm: 35 },
      display_value: "Montaje en carril DIN 35 mm",
      page: 1,
      section: "Sección 2: Montaje Físico",
      excerpt: "Montaje en carril DIN simétrico de 35 mm bajo norma internacional IEC / EN 60715",
      polarity: true,
      source_id: "SRC-CN-DIN-PLC-A1-DS-V1",
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: "fact_2",
      variant_id: "variant_plc_1",
      property: "supply_voltage",
      normalized_value_json: { type: "DC", nominal: 24, unit: "VDC", min: 18.0, max: 30.0 },
      display_value: "24 VDC (18.0 a 30.0 VDC)",
      page: 1,
      section: "Sección 3: Alimentación Eléctrica",
      excerpt: "24 VDC nominales en corriente continua (rango operativo garantizado: 18.0 VDC a 30.0 VDC)",
      polarity: true,
      source_id: "SRC-CN-DIN-PLC-A1-DS-V1",
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: "fact_3",
      variant_id: "variant_plc_1",
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
      page: 2,
      section: "Sección 4: Entradas / Salidas Analógicas y Sensores",
      excerpt: "2 canales independientes de entrada analógica en lazo de corriente estándar 4–20 mA",
      polarity: true,
      source_id: "SRC-CN-DIN-PLC-A1-DS-V1",
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: "fact_4",
      variant_id: "variant_plc_1",
      property: "analog_output",
      normalized_value_json: { direction: "output", channels: 0, available: false },
      display_value: "0 canales (Sin salidas analógicas)",
      page: 2,
      section: "Sección 4: Entradas / Salidas Analógicas y Sensores",
      excerpt: "SIN SALIDAS ANALÓGICAS (0 canales de salida analógica). No dispone de DAC ni lazos 4–20 mA de transmisión",
      polarity: false,
      source_id: "SRC-CN-DIN-PLC-A1-DS-V1",
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: "fact_5",
      variant_id: "variant_plc_1",
      property: "protocol",
      normalized_value_json: {
        name: "Modbus RTU",
        role: "slave",
        baudrates: [9600, 19200, 38400, 57600, 115200],
      },
      display_value: "Modbus RTU esclavo",
      page: 2,
      section: "Sección 5: Comunicaciones y Protocolos",
      excerpt: "Modbus RTU en modo esclavo (slave) configurable por software",
      polarity: true,
      source_id: "SRC-CN-DIN-PLC-A1-DS-V1",
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: "fact_6",
      variant_id: "variant_plc_1",
      property: "interface",
      normalized_value_json: {
        type: "serial",
        physical_layer: "RS-485",
        duplex: "half-duplex",
        isolation_v: 1000,
      },
      display_value: "RS-485 semidúplex aislado",
      page: 2,
      section: "Sección 5: Comunicaciones y Protocolos",
      excerpt: "Puerto serie físico RS-485 semidúplex con aislamiento galvánico de 1000 V",
      polarity: true,
      source_id: "SRC-CN-DIN-PLC-A1-DS-V1",
      created_at: new Date(),
      updated_at: new Date(),
    },
  ]

  describe("String & Unit Helpers", () => {
    it("normalizeString cleans and handles whitespace, case and hyphens", () => {
      expect(normalizeString("Modbus_RTU")).toBe("modbus rtu")
      expect(normalizeString("  DIN-Rail  ")).toBe("din rail")
      expect(normalizeString("1/16 DIN")).toBe("1/16 din")
    })

    it("normalizeUnit standardizes common engineering units", () => {
      expect(normalizeUnit("mA")).toBe("ma")
      expect(normalizeUnit("VDC")).toBe("vdc")
      expect(normalizeUnit("°C")).toBe("c")
      expect(normalizeUnit("VAC")).toBe("vac")
    })

    it("parseRangeString extracts min, max, and units", () => {
      expect(parseRangeString("4-20 mA")).toEqual({ min: 4, max: 20, unit: "mA" })
      expect(parseRangeString("18.0 a 30.0 VDC")).toEqual({ min: 18, max: 30, unit: "VDC" })
      expect(parseRangeString("24 VDC")).toEqual({ min: 24, max: 24, unit: "VDC" })
    })
  })

  describe("Operator: equals", () => {
    it("satisfies exact or normalized string match", () => {
      const result = evaluateSingleRequirement(
        { id: "r1", property: "mounting", operator: "equals", value: "DIN rail" },
        "variant_plc_1",
        plcFacts,
        new Map([["SRC-CN-DIN-PLC-A1-DS-V1", dummySources[0]]]),
        dummyProfile
      )
      expect(result.satisfied).toBe(true)
      expect(result.fact_display_value).toBe("Montaje en carril DIN 35 mm")
      expect(result.source_evidence?.page).toBe(1)
      expect(result.source_evidence?.source_id).toBe("SRC-CN-DIN-PLC-A1-DS-V1")
    })

    it("satisfies Modbus RTU protocol requirement", () => {
      const result = evaluateSingleRequirement(
        { id: "r2", property: "protocol", operator: "equals", value: "Modbus RTU" },
        "variant_plc_1",
        plcFacts,
        new Map([["SRC-CN-DIN-PLC-A1-DS-V1", dummySources[0]]]),
        dummyProfile
      )
      expect(result.satisfied).toBe(true)
    })

    it("rejects Modbus TCP when only Modbus RTU is present (Contraexample)", () => {
      const result = evaluateSingleRequirement(
        { id: "r3", property: "protocol", operator: "equals", value: "Modbus TCP" },
        "variant_plc_1",
        plcFacts,
        new Map([["SRC-CN-DIN-PLC-A1-DS-V1", dummySources[0]]]),
        dummyProfile
      )
      expect(result.satisfied).toBe(false)
      expect(result.reason).toContain("Modbus TCP")
    })
  })

  describe("Operator: range_contains", () => {
    it("satisfies analog_input 4-20 mA with 2 channels", () => {
      const result = evaluateSingleRequirement(
        {
          id: "r_ai",
          property: "analog_input",
          operator: "range_contains",
          value: { min: 4, max: 20, unit: "mA", channels_at_least: 2 },
        },
        "variant_plc_1",
        plcFacts,
        new Map([["SRC-CN-DIN-PLC-A1-DS-V1", dummySources[0]]]),
        dummyProfile
      )
      expect(result.satisfied).toBe(true)
      expect(result.source_evidence?.section).toContain("Sección 4")
    })

    it("rejects analog_input if channels_at_least exceeds available channels", () => {
      const result = evaluateSingleRequirement(
        {
          id: "r_ai_4ch",
          property: "analog_input",
          operator: "range_contains",
          value: { min: 4, max: 20, unit: "mA", channels_at_least: 4 },
        },
        "variant_plc_1",
        plcFacts,
        new Map([["SRC-CN-DIN-PLC-A1-DS-V1", dummySources[0]]]),
        dummyProfile
      )
      expect(result.satisfied).toBe(false)
      expect(result.reason).toContain("Insufficient channels")
    })

    it("rejects analog_input if unit does not match (e.g. VDC instead of mA)", () => {
      const result = evaluateSingleRequirement(
        {
          id: "r_ai_unit",
          property: "analog_input",
          operator: "range_contains",
          value: { min: 0, max: 10, unit: "VDC" },
        },
        "variant_plc_1",
        plcFacts,
        new Map([["SRC-CN-DIN-PLC-A1-DS-V1", dummySources[0]]]),
        dummyProfile
      )
      expect(result.satisfied).toBe(false)
      expect(result.reason).toContain("Unit mismatch")
    })
  })

  describe("Direction isolation (analog_input vs analog_output)", () => {
    it("strictly separates analog_output from analog_input", () => {
      // PLC has analog_input 4-20 mA, but analog_output is 0 channels (polarity: false)
      const result = evaluateSingleRequirement(
        {
          id: "r_ao",
          property: "analog_output",
          operator: "range_contains",
          value: "4-20 mA",
        },
        "variant_plc_1",
        plcFacts,
        new Map([["SRC-CN-DIN-PLC-A1-DS-V1", dummySources[0]]]),
        dummyProfile
      )
      expect(result.satisfied).toBe(false)
      expect(result.reason).toContain("polarity: false")
      expect(result.source_evidence?.excerpt).toContain("SIN SALIDAS ANALÓGICAS")
    })
  })

  describe("Polarity and Contraexamples (polarity: false)", () => {
    it("fails when positive requirement is made on a negative fact", () => {
      const result = evaluateSingleRequirement(
        {
          id: "r_ao_eq",
          property: "analog_output",
          operator: "equals",
          value: "4-20 mA",
        },
        "variant_plc_1",
        plcFacts,
        new Map([["SRC-CN-DIN-PLC-A1-DS-V1", dummySources[0]]]),
        dummyProfile
      )
      expect(result.satisfied).toBe(false)
      expect(result.fact_display_value).toBe("0 canales (Sin salidas analógicas)")
    })

    it("fails when requirement property is completely missing on variant", () => {
      const result = evaluateSingleRequirement(
        {
          id: "r_sensor",
          property: "sensor_element",
          operator: "equals",
          value: "Pt100",
        },
        "variant_plc_1",
        plcFacts,
        new Map([["SRC-CN-DIN-PLC-A1-DS-V1", dummySources[0]]]),
        dummyProfile
      )
      expect(result.satisfied).toBe(false)
      expect(result.reason).toContain("No technical fact found")
      expect(result.source_evidence).toBeNull()
    })
  })

  describe("evaluateRequirements multi-requirement orchestration", () => {
    it("returns overall_satisfied: true when all requirements pass", () => {
      const requirements: TechnicalRequirement[] = [
        { id: "req_1", property: "mounting", operator: "equals", value: "DIN rail" },
        { id: "req_2", property: "supply_voltage", operator: "range_contains", value: "24 VDC" },
        { id: "req_3", property: "interface", operator: "equals", value: "RS-485" },
        { id: "req_4", property: "protocol", operator: "equals", value: "Modbus RTU" },
      ]

      const result = evaluateRequirements(
        "variant_plc_1",
        requirements,
        plcFacts,
        dummySources,
        dummyProfile
      )

      expect(result.overall_satisfied).toBe(true)
      expect(result.variant_id).toBe("variant_plc_1")
      expect(result.sku).toBe("CN-X5PRIME-HE-XP5")
      expect(result.evaluations).toHaveLength(4)
      expect(result.evaluations.every((e) => e.satisfied)).toBe(true)
      expect(result.source_revision).toBe("rev-2026.1")
    })

    it("returns overall_satisfied: false if ANY requirement fails", () => {
      const requirements: TechnicalRequirement[] = [
        { id: "req_1", property: "mounting", operator: "equals", value: "DIN rail" },
        // Contraexample: asking for Modbus TCP
        { id: "req_2", property: "protocol", operator: "equals", value: "Modbus TCP" },
      ]

      const result = evaluateRequirements(
        "variant_plc_1",
        requirements,
        plcFacts,
        dummySources,
        dummyProfile
      )

      expect(result.overall_satisfied).toBe(false)
      expect(result.evaluations[0].satisfied).toBe(true)
      expect(result.evaluations[1].satisfied).toBe(false)
    })

    it("verifies PID contraexamples (panel mount, analog_output 4-20mA, Pt100 input, NOT din, NOT analog_input 4-20mA)", () => {
      const pidFacts: TechnicalFactRecord[] = [
        {
          id: "pid_1",
          variant_id: "variant_pid_2",
          property: "mounting",
          normalized_value_json: { type: "panel mount", standard: "1/16 DIN", cutout_mm: "45x45" },
          display_value: "Montaje en panel frontal 1/16 DIN (48×48 mm)",
          page: 1,
          section: "Sección 2: Montaje Físico",
          excerpt: "Montaje empotrado en panel o puerta de armario eléctrico formato estándar 1/16 DIN",
          polarity: true,
          source_id: "SRC-PID",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: "pid_2",
          variant_id: "variant_pid_2",
          property: "analog_input",
          normalized_value_json: { direction: "input", channels: 0, available: false },
          display_value: "0 canales (Sin entrada de corriente 4–20 mA)",
          page: 2,
          section: "Sección 4: Entradas / Salidas Analógicas y Sensores",
          excerpt: "SIN ENTRADA ANALÓGICA 4–20 mA DIRECTA. La entrada analógica está dedicada exclusivamente a termorresistencia RTD Pt100",
          polarity: false,
          source_id: "SRC-PID",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: "pid_3",
          variant_id: "variant_pid_2",
          property: "analog_output",
          normalized_value_json: { direction: "output", channels: 1, min: 4, max: 20, unit: "mA" },
          display_value: "1 salida analógica 4–20 mA activa para control modulante",
          page: 2,
          section: "Sección 4: Entradas / Salidas Analógicas y Sensores",
          excerpt: "1 salida analógica proporcional de control en corriente activa 4–20 mA",
          polarity: true,
          source_id: "SRC-PID",
          created_at: new Date(),
          updated_at: new Date(),
        },
      ]

      // 1. Requerir din_rail -> satisfied = false
      const evalDin = evaluateSingleRequirement(
        { id: "pid_r1", property: "mounting", operator: "equals", value: "din_rail" },
        "variant_pid_2",
        pidFacts,
        new Map(),
        null
      )
      expect(evalDin.satisfied).toBe(false)

      // 2. Requerir analog_input 4-20 mA -> satisfied = false
      const evalAi = evaluateSingleRequirement(
        { id: "pid_r2", property: "analog_input", operator: "range_contains", value: "4-20 mA" },
        "variant_pid_2",
        pidFacts,
        new Map(),
        null
      )
      expect(evalAi.satisfied).toBe(false)
      expect(evalAi.reason).toContain("polarity: false")

      // 3. Requerir panel y analog_output 4-20 mA -> overall_satisfied = true
      const evalMulti = evaluateRequirements(
        "variant_pid_2",
        [
          { id: "pid_ok1", property: "mounting", operator: "equals", value: "panel" },
          { id: "pid_ok2", property: "analog_output", operator: "range_contains", value: "4-20 mA" },
        ],
        pidFacts,
        [],
        null
      )
      expect(evalMulti.overall_satisfied).toBe(true)
    })

    it("verifies RTD contraexamples (passive, no analog_output 4-20mA, no Modbus, Pt100 Class A 3-wire)", () => {
      const rtdFacts: TechnicalFactRecord[] = [
        {
          id: "rtd_1",
          variant_id: "variant_rtd_3",
          property: "sensor_element",
          normalized_value_json: { type: "RTD", element: "Pt100", wires: 3, class: "A" },
          display_value: "Sensor termorresistencia Pt100 Clase A, 3 hilos (-50 a +350 °C)",
          page: 2,
          section: "Sección 4: Entradas / Salidas Analógicas y Sensores",
          excerpt: "Elemento de platino puro bobinado Pt100 calibrado bajo norma IEC 60751 Clase A",
          polarity: true,
          source_id: "SRC-RTD",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: "rtd_2",
          variant_id: "variant_rtd_3",
          property: "analog_output",
          normalized_value_json: { direction: "output", channels: 0, available: false },
          display_value: "0 canales (Sin transmisor; resistencia pura pasiva)",
          page: 2,
          section: "Sección 4: Entradas / Salidas Analógicas y Sensores",
          excerpt: "SIN TRANSMISOR INTEGRADO (0 transmisores). No incluye electrónica de acondicionamiento",
          polarity: false,
          source_id: "SRC-RTD",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: "rtd_3",
          variant_id: "variant_rtd_3",
          property: "protocol",
          normalized_value_json: { name: "none", supported: false },
          display_value: "Ninguno (Sin protocolo serie ni bus de datos)",
          page: 2,
          section: "Sección 5: Comunicaciones y Protocolos",
          excerpt: "NINGUNO. La sonda carece de microprocesador o protocolo",
          polarity: false,
          source_id: "SRC-RTD",
          created_at: new Date(),
          updated_at: new Date(),
        },
      ]

      // 1. Requerir salida 4-20 mA -> satisfied = false
      const evalAo = evaluateSingleRequirement(
        { id: "rtd_r1", property: "analog_output", operator: "equals", value: "4-20 mA" },
        "variant_rtd_3",
        rtdFacts,
        new Map(),
        null
      )
      expect(evalAo.satisfied).toBe(false)
      expect(evalAo.reason).toContain("polarity: false")

      // 2. Requerir protocolo modbus_rtu -> satisfied = false
      const evalProto = evaluateSingleRequirement(
        { id: "rtd_r2", property: "protocol", operator: "equals", value: "modbus_rtu" },
        "variant_rtd_3",
        rtdFacts,
        new Map(),
        null
      )
      expect(evalProto.satisfied).toBe(false)

      // 3. Requerir sensor_element Pt100 -> satisfied = true
      const evalSensor = evaluateSingleRequirement(
        { id: "rtd_r3", property: "sensor_element", operator: "equals", value: "Pt100" },
        "variant_rtd_3",
        rtdFacts,
        new Map(),
        null
      )
      expect(evalSensor.satisfied).toBe(true)
    })
  })
})
