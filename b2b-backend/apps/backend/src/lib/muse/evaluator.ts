/**
 * Deterministic Technical Evaluation Engine (NO LLM) for Muse Agent Commerce API
 *
 * 100% Deterministic, Reproducible, and Auditable evaluation of technical requirements
 * against verified database facts, sources, and profiles.
 */

import {
  TechnicalFactRecord,
  TechnicalProfileRecord,
  TechnicalSourceRecord,
} from "./db"
import {
  TECHNICAL_PROPERTIES,
  TechnicalProperty,
  ALLOWED_OPERATORS,
  AllowedOperator,
} from "./schema-validator"

export {
  TECHNICAL_PROPERTIES,
  TechnicalProperty,
  ALLOWED_OPERATORS,
  AllowedOperator,
}

/**
 * Input Requirement definition
 */
export interface TechnicalRequirement {
  id?: string
  requirement_id?: string
  property: TechnicalProperty | string
  operator: AllowedOperator | string
  value?: any
  expected_value?: any
  expected?: any
  target?: any
  // Range & analog specific attributes
  min?: number
  max?: number
  unit?: string
  direction?: string
  channels?: number
  channels_at_least?: number
  [key: string]: any
}

/**
 * Source citation evidence structure
 */
export interface SourceEvidence {
  source_id: string | null
  source_revision: string | null
  url: string | null
  page: number | null
  section: string | null
  excerpt: string | null
}

/**
 * Result of evaluating a single requirement
 */
export interface RequirementEvaluationResult {
  requirement_id: string
  property: string
  operator: string
  satisfied: boolean
  reason: string
  fact_display_value: string | null
  source_evidence: SourceEvidence | null
}

/**
 * Overall Evaluation Output
 */
export interface EvaluationResult {
  variant_id: string
  sku?: string | null
  overall_satisfied: boolean
  evaluations: RequirementEvaluationResult[]
  source_revision: string | null
  evaluated_at: string
}

/**
 * Normalizes string values for deterministic comparisons:
 * - Trims whitespace
 * - Converts to lower case
 * - Converts underscores and multiple spaces/hyphens to single spaces
 * - Strips quotes
 */
export function normalizeString(val: any): string {
  if (val === null || val === undefined) return ""
  return String(val)
    .trim()
    .toLowerCase()
    .replace(/[_\s-]+/g, " ")
    .replace(/["'“”]/g, "")
}

/**
 * Normalizes engineering units for strict unit comparisons
 */
export function normalizeUnit(unit?: string | null): string {
  if (!unit || typeof unit !== "string") return ""
  const u = unit.trim().toLowerCase()
  if (u === "°c" || u === "c" || u === "degc" || u === "celsius") return "c"
  if (u === "vdc" || u === "v dc" || u === "v_dc") return "vdc"
  if (u === "vac" || u === "v ac" || u === "v_ac") return "vac"
  if (u === "ma" || u === "miliamperios" || u === "milliamp") return "ma"
  if (u === "v" || u === "volt" || u === "volts") return "v"
  if (u === "ohm" || u === "ohms" || u === "ω") return "ohm"
  return u
}

/**
 * Parses numeric ranges and engineering units from descriptive strings
 * Examples:
 *  "4-20 mA" -> { min: 4, max: 20, unit: "mA" }
 *  "18.0 a 30.0 VDC" -> { min: 18, max: 30, unit: "VDC" }
 *  "24 VDC" -> { min: 24, max: 24, unit: "VDC" }
 */
export function parseRangeString(
  str: string
): { min?: number; max?: number; unit?: string } | null {
  if (typeof str !== "string") return null
  const trimmed = str.trim()

  // Match patterns like "4-20 mA", "4–20 mA", "18.0 a 30.0 VDC", "100 to 240 VAC", "-50 a +350 °C"
  const rangeMatch = trimmed.match(
    /^([+-]?\d+(?:\.\d+)?)\s*(?:-|–|—|to|a|\.\.)\s*([+-]?\d+(?:\.\d+)?)\s*([a-zA-Z°Ω/]+)?$/i
  )
  if (rangeMatch) {
    return {
      min: parseFloat(rangeMatch[1]),
      max: parseFloat(rangeMatch[2]),
      unit: rangeMatch[3] ? rangeMatch[3].trim() : undefined,
    }
  }

  // Match patterns like "24 VDC", "24VDC", "24 V", "1000 V"
  const singleMatch = trimmed.match(/^([+-]?\d+(?:\.\d+)?)\s*([a-zA-Z°Ω/]+)?$/i)
  if (singleMatch) {
    const val = parseFloat(singleMatch[1])
    return {
      min: val,
      max: val,
      unit: singleMatch[2] ? singleMatch[2].trim() : undefined,
    }
  }

  return null
}

/**
 * Extracts a normalized lookup map from sources
 */
function normalizeSources(
  sources:
    | TechnicalSourceRecord[]
    | Map<string, TechnicalSourceRecord>
    | Record<string, TechnicalSourceRecord>
    | undefined
    | null
): Map<string, TechnicalSourceRecord> {
  const map = new Map<string, TechnicalSourceRecord>()
  if (!sources) return map

  if (sources instanceof Map) {
    return sources
  }

  if (Array.isArray(sources)) {
    for (const s of sources) {
      if (s && s.id) {
        map.set(s.id, s)
      }
    }
    return map
  }

  if (typeof sources === "object") {
    for (const [key, val] of Object.entries(sources)) {
      if (val && typeof val === "object") {
        map.set(key, val as TechnicalSourceRecord)
        if ((val as any).id) {
          map.set((val as any).id, val as TechnicalSourceRecord)
        }
      }
    }
  }

  return map
}

/**
 * Builds a deterministic source evidence citation from a fact and source record
 */
function buildSourceEvidence(
  fact: TechnicalFactRecord | null,
  sourcesMap: Map<string, TechnicalSourceRecord>,
  profile?: TechnicalProfileRecord | null
): SourceEvidence | null {
  if (!fact) return null

  const source = fact.source_id ? sourcesMap.get(fact.source_id) : undefined

  return {
    source_id: fact.source_id || null,
    source_revision: source?.revision || profile?.revision || "rev-2026.1",
    url: source?.url || null,
    page: fact.page !== undefined ? fact.page : null,
    section: fact.section || null,
    excerpt: fact.excerpt || null,
  }
}

/**
 * Deep equality / partial match between target and fact normalized JSON
 */
function deepMatches(target: any, actual: any): boolean {
  if (target === actual) return true
  if (target === null || target === undefined || actual === null || actual === undefined) {
    return target === actual
  }

  if (typeof target !== "object" || typeof actual !== "object") {
    return normalizeString(target) === normalizeString(actual)
  }

  if (Array.isArray(target)) {
    if (!Array.isArray(actual)) return false
    return target.every((tItem) =>
      actual.some((aItem) => deepMatches(tItem, aItem))
    )
  }

  for (const [key, val] of Object.entries(target)) {
    if (val === undefined) continue
    const actualVal = actual[key]
    if (actualVal === undefined) return false
    if (!deepMatches(val, actualVal)) return false
  }

  return true
}

/**
 * Checks equality between target and fact for domain-specific automation semantics:
 * - Mounting types (DIN rail vs Panel mount vs Threaded probe)
 * - Protocols (Modbus RTU vs Modbus TCP vs none)
 * - Interfaces (RS-485 vs none)
 * - Sensor elements (Pt100 vs thermocouple)
 */
function evaluateEquals(
  targetValue: any,
  fact: TechnicalFactRecord,
  property: string
): { satisfied: boolean; reason: string } {
  const normTarget = normalizeString(targetValue)
  const normDisplay = normalizeString(fact.display_value)
  const normJson = fact.normalized_value_json || {}

  // 1. Direct object matching
  if (typeof targetValue === "object" && targetValue !== null) {
    const isMatch = deepMatches(targetValue, normJson)
    if (isMatch) {
      return {
        satisfied: true,
        reason: `Technical fact matches required structure: '${fact.display_value}'.`,
      }
    }
  }

  // 2. Direct string display exact match
  if (normTarget && normDisplay === normTarget) {
    return {
      satisfied: true,
      reason: `Fact display value matches: '${fact.display_value}'.`,
    }
  }

  // 3. Domain semantic comparisons based on property
  switch (property) {
    case "mounting": {
      const factType = normalizeString(normJson.type)
      const factStd = normalizeString(normJson.standard)
      const factThread = normalizeString(normJson.thread)

      const isPanelReq =
        normTarget.includes("panel") ||
        normTarget === "1/16 din" ||
        normTarget.includes("48x48")

      const isDinReq =
        !isPanelReq &&
        (normTarget.includes("din rail") ||
          normTarget.includes("din 35") ||
          normTarget.includes("35mm") ||
          normTarget.includes("35 mm") ||
          normTarget.includes("din_35") ||
          normTarget === "din" ||
          normTarget === "carril din" ||
          normTarget.includes("th35") ||
          normTarget.includes("60715") ||
          (normTarget.includes("din") && !normTarget.includes("1/16")))

      const isThreadedReq =
        normTarget.includes("thread") ||
        normTarget.includes("1/2 npt") ||
        normTarget.includes("sonda") ||
        normTarget.includes("inmersion")

      // Crucial: DIN rail mounting CANNOT satisfy panel mounting and vice versa
      if (isDinReq) {
        if (factType.includes("din rail") || normDisplay.includes("carril din")) {
          return {
            satisfied: true,
            reason: `Mounting verified: DIN rail standard IEC/EN 60715 (${fact.display_value}).`,
          }
        }
        return {
          satisfied: false,
          reason: `Mounting mismatch: required '${targetValue}', but fact is '${fact.display_value}' (panel/probe, not DIN rail).`,
        }
      }

      if (isPanelReq) {
        if (factType.includes("panel") || normDisplay.includes("panel")) {
          return {
            satisfied: true,
            reason: `Mounting verified: Panel mount 1/16 DIN (${fact.display_value}).`,
          }
        }
        return {
          satisfied: false,
          reason: `Mounting mismatch: required '${targetValue}', but fact is '${fact.display_value}' (not panel mount).`,
        }
      }

      if (isThreadedReq) {
        if (factType.includes("threaded") || factThread.includes("npt") || normDisplay.includes("roscada")) {
          return {
            satisfied: true,
            reason: `Mounting verified: Threaded process probe (${fact.display_value}).`,
          }
        }
        return {
          satisfied: false,
          reason: `Mounting mismatch: required '${targetValue}', but fact is '${fact.display_value}'.`,
        }
      }

      // Fallback
      if (factType === normTarget || factStd === normTarget || normDisplay.includes(normTarget)) {
        return {
          satisfied: true,
          reason: `Mounting matches: '${fact.display_value}'.`,
        }
      }

      return {
        satisfied: false,
        reason: `Mounting mismatch: required '${targetValue}', actual '${fact.display_value}'.`,
      }
    }

    case "protocol": {
      const factName = normalizeString(normJson.name)
      const isModbusTcpReq = normTarget.includes("tcp")
      const isModbusRtuReq = normTarget.includes("rtu") || normTarget === "modbus"

      if (isModbusTcpReq) {
        // Device is Modbus RTU, NOT Modbus TCP
        if (factName.includes("tcp") || normDisplay.includes("tcp")) {
          return {
            satisfied: true,
            reason: `Protocol matches Modbus TCP: '${fact.display_value}'.`,
          }
        }
        return {
          satisfied: false,
          reason: `Protocol mismatch: required 'Modbus TCP', but device only supports '${fact.display_value}' (Serial RTU slave, no Ethernet/TCP).`,
        }
      }

      if (isModbusRtuReq) {
        if (factName.includes("rtu") || normDisplay.includes("rtu")) {
          return {
            satisfied: true,
            reason: `Protocol matches Modbus RTU: '${fact.display_value}'.`,
          }
        }
        return {
          satisfied: false,
          reason: `Protocol mismatch: required Modbus RTU, device has '${fact.display_value}'.`,
        }
      }

      if (normTarget === "none" || normTarget === "ninguno") {
        if (factName === "none" || !normJson.supported || !fact.polarity) {
          return {
            satisfied: true,
            reason: `Protocol verified absent: '${fact.display_value}'.`,
          }
        }
      }

      if (factName === normTarget || normDisplay.includes(normTarget)) {
        return {
          satisfied: true,
          reason: `Protocol verified: '${fact.display_value}'.`,
        }
      }

      return {
        satisfied: false,
        reason: `Protocol mismatch: required '${targetValue}', actual '${fact.display_value}'.`,
      }
    }

    case "interface": {
      const factPhys = normalizeString(normJson.physical_layer)
      const factType = normalizeString(normJson.type)

      const isRs485Req = normTarget.includes("485") || normTarget === "rs 485"
      if (isRs485Req) {
        if (factPhys.includes("485") || normDisplay.includes("485")) {
          return {
            satisfied: true,
            reason: `Physical interface matches RS-485: '${fact.display_value}'.`,
          }
        }
        return {
          satisfied: false,
          reason: `Interface mismatch: required RS-485, but fact is '${fact.display_value}'.`,
        }
      }

      if (normTarget === "none" || normTarget === "ninguna") {
        if (factType === "none" || !normJson.digital_interface || !fact.polarity) {
          return {
            satisfied: true,
            reason: `Interface verified absent: '${fact.display_value}'.`,
          }
        }
      }

      if (factPhys === normTarget || factType === normTarget || normDisplay.includes(normTarget)) {
        return {
          satisfied: true,
          reason: `Interface verified: '${fact.display_value}'.`,
        }
      }

      return {
        satisfied: false,
        reason: `Interface mismatch: required '${targetValue}', actual '${fact.display_value}'.`,
      }
    }

    case "sensor_element": {
      const factElem = normalizeString(normJson.element)
      const isPt100Req = normTarget.includes("pt100") || normTarget === "rtd"

      if (isPt100Req) {
        if (factElem.includes("pt100") || normDisplay.includes("pt100")) {
          return {
            satisfied: true,
            reason: `Sensor element matches Pt100 RTD: '${fact.display_value}'.`,
          }
        }
        return {
          satisfied: false,
          reason: `Sensor element mismatch: required Pt100, actual '${fact.display_value}'.`,
        }
      }

      if (factElem === normTarget || normDisplay.includes(normTarget)) {
        return {
          satisfied: true,
          reason: `Sensor element verified: '${fact.display_value}'.`,
        }
      }

      return {
        satisfied: false,
        reason: `Sensor element mismatch: required '${targetValue}', actual '${fact.display_value}'.`,
      }
    }

    case "control_function": {
      const factType = normalizeString(normJson.type)
      if (normTarget === "plc") {
        if (factType === "plc" || normDisplay.includes("plc")) {
          return {
            satisfied: true,
            reason: `Control function verified as PLC: '${fact.display_value}'.`,
          }
        }
        return {
          satisfied: false,
          reason: `Control function mismatch: required PLC, actual '${fact.display_value}'.`,
        }
      }

      if (normTarget === "pid") {
        if (factType === "pid" || normDisplay.includes("pid")) {
          return {
            satisfied: true,
            reason: `Control function verified as PID: '${fact.display_value}'.`,
          }
        }
        return {
          satisfied: false,
          reason: `Control function mismatch: required PID, actual '${fact.display_value}'.`,
        }
      }

      if (factType === normTarget || normDisplay.includes(normTarget)) {
        return {
          satisfied: true,
          reason: `Control function verified: '${fact.display_value}'.`,
        }
      }

      return {
        satisfied: false,
        reason: `Control function mismatch: required '${targetValue}', actual '${fact.display_value}'.`,
      }
    }

    case "supply_voltage": {
      const parsed = parseRangeString(String(targetValue))
      const nominal = normJson.nominal !== undefined ? normJson.nominal : normJson.nominal_v
      const unit = normalizeUnit(normJson.unit)
      const factType = normalizeString(normJson.type)

      const isPassiveReq =
        normTarget.includes("passiv") ||
        normTarget.includes("pasiv") ||
        normTarget === "0" ||
        normTarget === "0v" ||
        normTarget === "0 v" ||
        normTarget === "0 vdc" ||
        normTarget === "0vdc"

      if (isPassiveReq) {
        if (
          factType.includes("passiv") ||
          factType.includes("pasiv") ||
          normDisplay.includes("pasiv") ||
          normDisplay.includes("passiv") ||
          Number(nominal) === 0 ||
          normJson.external_power === false
        ) {
          return {
            satisfied: true,
            reason: `Supply voltage verified as passive component: '${fact.display_value}'.`,
          }
        }
      }

      if (typeof targetValue === "number" && nominal !== undefined) {
        if (Number(nominal) === targetValue) {
          return {
            satisfied: true,
            reason: `Supply voltage nominal matches ${targetValue}: '${fact.display_value}'.`,
          }
        }
      }

      if (parsed) {
        const reqUnit = normalizeUnit(parsed.unit)
        if (reqUnit && unit && reqUnit !== unit) {
          return {
            satisfied: false,
            reason: `Supply voltage unit mismatch: required ${parsed.unit}, fact has ${normJson.unit} ('${fact.display_value}').`,
          }
        }
        if (parsed.min !== undefined && nominal !== undefined && parsed.min === Number(nominal)) {
          return {
            satisfied: true,
            reason: `Supply voltage matches ${targetValue}: '${fact.display_value}'.`,
          }
        }
      }

      if (normDisplay.includes(normTarget)) {
        return {
          satisfied: true,
          reason: `Supply voltage verified: '${fact.display_value}'.`,
        }
      }

      return {
        satisfied: false,
        reason: `Supply voltage mismatch: required '${targetValue}', actual '${fact.display_value}'.`,
      }
    }

    default: {
      const factValStr = normalizeString(
        normJson.name || normJson.type || normJson.element || normJson.signal || ""
      )
      if (factValStr === normTarget || normDisplay.includes(normTarget)) {
        return {
          satisfied: true,
          reason: `Property '${property}' matches required value '${targetValue}': '${fact.display_value}'.`,
        }
      }
      return {
        satisfied: false,
        reason: `Property '${property}' value mismatch: required '${targetValue}', actual '${fact.display_value}'.`,
      }
    }
  }
}

/**
 * Evaluates analog range containment (range_contains)
 * Validates:
 * - Direction (input vs output: strictly isolated)
 * - Channels (channels_at_least <= fact.channels)
 * - Unit (unit matching)
 * - Min/Max coverage (fact covers requested range or vice versa)
 */
function evaluateRangeContains(
  req: TechnicalRequirement,
  fact: TechnicalFactRecord,
  property: string
): { satisfied: boolean; reason: string } {
  const normJson = fact.normalized_value_json || {}
  const targetValue = req.value ?? req.expected_value ?? req.expected ?? req.target

  // 1. Strict Direction Check: NEVER confuse analog_output with analog_input
  const reqDirection = (
    req.direction ||
    (typeof targetValue === "object" && targetValue?.direction) ||
    (property === "analog_input" ? "input" : property === "analog_output" ? "output" : undefined)
  )?.toLowerCase()

  const factDirection = (normJson.direction || (property === "analog_input" ? "input" : "output"))?.toLowerCase()

  if (property === "analog_input" && factDirection !== "input") {
    return {
      satisfied: false,
      reason: `Direction mismatch: requirement is for 'analog_input', but technical fact indicates direction '${factDirection}'.`,
    }
  }

  if (property === "analog_output" && factDirection !== "output") {
    return {
      satisfied: false,
      reason: `Direction mismatch: requirement is for 'analog_output', but technical fact indicates direction '${factDirection}'.`,
    }
  }

  if (reqDirection && factDirection && reqDirection !== factDirection) {
    return {
      satisfied: false,
      reason: `Direction mismatch: required direction '${reqDirection}', but fact direction is '${factDirection}'.`,
    }
  }

  // 2. Channels Check (channels_at_least <= fact.channels)
  const requiredChannels =
    req.channels_at_least ??
    req.channels ??
    (typeof targetValue === "object" ? targetValue?.channels_at_least ?? targetValue?.channels : undefined)

  const factChannels = normJson.channels !== undefined ? Number(normJson.channels) : undefined

  if (requiredChannels !== undefined) {
    const reqChNum = Number(requiredChannels)
    const factChNum = factChannels !== undefined ? factChannels : 0

    if (factChNum < reqChNum) {
      return {
        satisfied: false,
        reason: `Insufficient channels: required at least ${reqChNum} channel(s), but fact provides ${factChNum} channel(s) (${fact.display_value}).`,
      }
    }
  }

  // 3. Extract range parameters (min, max, unit)
  let reqMin: number | undefined = req.min ?? (typeof targetValue === "object" ? targetValue?.min : undefined)
  let reqMax: number | undefined = req.max ?? (typeof targetValue === "object" ? targetValue?.max : undefined)
  let reqUnit: string | undefined = req.unit ?? (typeof targetValue === "object" ? targetValue?.unit : undefined)

  // Try parsing string value if min/max not provided as numbers
  if (reqMin === undefined && typeof targetValue === "string") {
    const parsed = parseRangeString(targetValue)
    if (parsed) {
      reqMin = parsed.min
      reqMax = parsed.max
      if (!reqUnit && parsed.unit) {
        reqUnit = parsed.unit
      }
    }
  } else if (reqMin === undefined && typeof targetValue === "number") {
    reqMin = targetValue
    reqMax = targetValue
  }

  // Extract fact range parameters
  const factMin: number | undefined =
    normJson.min !== undefined
      ? Number(normJson.min)
      : normJson.min_c !== undefined
      ? Number(normJson.min_c)
      : normJson.nominal !== undefined && typeof normJson.nominal === "number"
      ? Number(normJson.nominal)
      : normJson.nominal_v !== undefined
      ? Number(normJson.nominal_v)
      : undefined

  const factMax: number | undefined =
    normJson.max !== undefined
      ? Number(normJson.max)
      : normJson.max_c !== undefined
      ? Number(normJson.max_c)
      : normJson.nominal !== undefined && typeof normJson.nominal === "number"
      ? Number(normJson.nominal)
      : normJson.nominal_v !== undefined
      ? Number(normJson.nominal_v)
      : undefined

  const factUnit: string | undefined = normJson.unit

  // 4. Unit Check
  if (reqUnit && factUnit) {
    const normReqU = normalizeUnit(reqUnit)
    const normFactU = normalizeUnit(factUnit)
    if (normReqU !== normFactU) {
      return {
        satisfied: false,
        reason: `Unit mismatch: required unit '${reqUnit}', but fact provides '${factUnit}' (${fact.display_value}).`,
      }
    }
  }

  // 5. Boundary Coverage Check
  if (reqMin !== undefined && reqMax !== undefined && factMin !== undefined && factMax !== undefined) {
    // Condition A: Fact covers requested range (e.g. fact is [4, 20] and req asks [10, 15] or [4, 20])
    const factCoversReq = factMin <= reqMin && factMax >= reqMax
    // Condition B: Requested range covers fact range (e.g. req asks [0, 25] and fact is [4, 20])
    const reqCoversFact = reqMin <= factMin && reqMax >= factMax

    if (factCoversReq || reqCoversFact) {
      return {
        satisfied: true,
        reason: `Range satisfied: requested [${reqMin}, ${reqMax}] ${reqUnit || ""} is covered by fact range [${factMin}, ${factMax}] ${factUnit || ""} (${fact.display_value}).`,
      }
    }

    return {
      satisfied: false,
      reason: `Range out of bounds: requested [${reqMin}, ${reqMax}] ${reqUnit || ""}, but fact range is [${factMin}, ${factMax}] ${factUnit || ""} (${fact.display_value}).`,
    }
  }

  // Single value inside fact range
  if (reqMin !== undefined && factMin !== undefined && factMax !== undefined) {
    if (reqMin >= factMin && reqMin <= factMax) {
      return {
        satisfied: true,
        reason: `Value ${reqMin} ${reqUnit || ""} is within fact range [${factMin}, ${factMax}] ${factUnit || ""} (${fact.display_value}).`,
      }
    }
    return {
      satisfied: false,
      reason: `Value ${reqMin} ${reqUnit || ""} is outside fact range [${factMin}, ${factMax}] ${factUnit || ""}.`,
    }
  }

  // Default fallback if no numeric bounds were provided but units or channels matched
  return {
    satisfied: true,
    reason: `Analog parameters satisfied for '${property}': '${fact.display_value}'.`,
  }
}

/**
 * Evaluates inclusion (in) operator
 * Satisfied if:
 * - fact value is an element in required array
 * - OR fact provides an array and required value is contained in it
 */
function evaluateIn(
  targetValue: any,
  fact: TechnicalFactRecord,
  property: string
): { satisfied: boolean; reason: string } {
  const normJson = fact.normalized_value_json || {}

  // Case 1: Target value is an array of acceptable options
  if (Array.isArray(targetValue)) {
    for (const option of targetValue) {
      const eq = evaluateEquals(option, fact, property)
      if (eq.satisfied) {
        return {
          satisfied: true,
          reason: `Fact '${fact.display_value}' matched acceptable option '${option}' in set [${targetValue.join(", ")}].`,
        }
      }
    }
    return {
      satisfied: false,
      reason: `Fact '${fact.display_value}' is not included in acceptable set [${targetValue.join(", ")}].`,
    }
  }

  // Case 2: Fact has an array property (e.g. baudrates, features)
  const arraysInFact: any[][] = []
  if (Array.isArray(normJson.baudrates)) arraysInFact.push(normJson.baudrates)
  if (Array.isArray(normJson.features)) arraysInFact.push(normJson.features)

  for (const arr of arraysInFact) {
    const hasMatch = arr.some(
      (item) =>
        normalizeString(item) === normalizeString(targetValue) ||
        (typeof targetValue === "number" && item === targetValue)
    )
    if (hasMatch) {
      return {
        satisfied: true,
        reason: `Required value '${targetValue}' is supported by fact array (${fact.display_value}).`,
      }
    }
  }

  return {
    satisfied: false,
    reason: `Required value '${targetValue}' is not contained in fact set (${fact.display_value}).`,
  }
}

/**
 * Evaluates string containment (contains) operator
 */
function evaluateContains(
  targetValue: any,
  fact: TechnicalFactRecord
): { satisfied: boolean; reason: string } {
  const normTarget = normalizeString(targetValue)
  const normDisplay = normalizeString(fact.display_value)

  if (normDisplay.includes(normTarget)) {
    return {
      satisfied: true,
      reason: `Fact display value '${fact.display_value}' contains '${targetValue}'.`,
    }
  }

  const jsonStr = JSON.stringify(fact.normalized_value_json || "").toLowerCase()
  if (jsonStr.includes(normTarget)) {
    return {
      satisfied: true,
      reason: `Fact normalized data contains '${targetValue}': '${fact.display_value}'.`,
    }
  }

  return {
    satisfied: false,
    reason: `Fact '${fact.display_value}' does not contain '${targetValue}'.`,
  }
}

/**
 * Evaluates greater_than_or_equal operator
 */
function evaluateGte(
  targetValue: any,
  fact: TechnicalFactRecord,
  req: TechnicalRequirement
): { satisfied: boolean; reason: string } {
  const normJson = fact.normalized_value_json || {}
  const targetNum =
    typeof targetValue === "number"
      ? targetValue
      : req.min ?? req.channels_at_least ?? parseFloat(String(targetValue))

  const factNum =
    normJson.channels !== undefined
      ? Number(normJson.channels)
      : normJson.nominal !== undefined && typeof normJson.nominal === "number"
      ? Number(normJson.nominal)
      : normJson.min !== undefined
      ? Number(normJson.min)
      : normJson.isolation_v !== undefined
      ? Number(normJson.isolation_v)
      : undefined

  if (factNum !== undefined && !isNaN(targetNum)) {
    if (factNum >= targetNum) {
      return {
        satisfied: true,
        reason: `Fact value ${factNum} is >= required ${targetNum} (${fact.display_value}).`,
      }
    }
    return {
      satisfied: false,
      reason: `Fact value ${factNum} is less than required ${targetNum} (${fact.display_value}).`,
    }
  }

  return {
    satisfied: false,
    reason: `Cannot perform greater_than_or_equal comparison on non-numeric fact: '${fact.display_value}'.`,
  }
}

/**
 * Evaluates less_than_or_equal operator
 */
function evaluateLte(
  targetValue: any,
  fact: TechnicalFactRecord,
  req: TechnicalRequirement
): { satisfied: boolean; reason: string } {
  const normJson = fact.normalized_value_json || {}
  const targetNum =
    typeof targetValue === "number"
      ? targetValue
      : req.max ?? parseFloat(String(targetValue))

  const factNum =
    normJson.channels !== undefined
      ? Number(normJson.channels)
      : normJson.nominal !== undefined && typeof normJson.nominal === "number"
      ? Number(normJson.nominal)
      : normJson.max !== undefined
      ? Number(normJson.max)
      : undefined

  if (factNum !== undefined && !isNaN(targetNum)) {
    if (factNum <= targetNum) {
      return {
        satisfied: true,
        reason: `Fact value ${factNum} is <= required ${targetNum} (${fact.display_value}).`,
      }
    }
    return {
      satisfied: false,
      reason: `Fact value ${factNum} is greater than required ${targetNum} (${fact.display_value}).`,
    }
  }

  return {
    satisfied: false,
    reason: `Cannot perform less_than_or_equal comparison on non-numeric fact: '${fact.display_value}'.`,
  }
}

/**
 * Evaluates a single requirement against the list of available facts for a variant.
 */
export function evaluateSingleRequirement(
  req: TechnicalRequirement,
  variantId: string,
  facts: TechnicalFactRecord[],
  sources?:
    | TechnicalSourceRecord[]
    | Map<string, TechnicalSourceRecord>
    | Record<string, TechnicalSourceRecord>
    | null,
  profile?: TechnicalProfileRecord | null
): RequirementEvaluationResult {
  const sourcesMap = normalizeSources(sources)
  const reqId = String(req.id || req.requirement_id || "req_unknown")
  const property = String(req.property || "").trim().toLowerCase()
  const operator = String(req.operator || "").trim().toLowerCase()
  const targetValue = req.value ?? req.expected_value ?? req.expected ?? req.target

  // 1. Locate facts matching property
  const matchingFacts = facts.filter(
    (f) => String(f.property).trim().toLowerCase() === property
  )

  // 2. Case: No fact registered for this property
  if (matchingFacts.length === 0) {
    if (operator === "not_equals") {
      return {
        requirement_id: reqId,
        property,
        operator,
        satisfied: true,
        reason: `Variant '${variantId}' has no '${property}' registered, which satisfies 'not_equals'.`,
        fact_display_value: null,
        source_evidence: null,
      }
    }

    return {
      requirement_id: reqId,
      property,
      operator,
      satisfied: false,
      reason: `No technical fact found for property '${property}' on variant '${variantId}'. Feature is absent.`,
      fact_display_value: null,
      source_evidence: null,
    }
  }

  // 3. Evaluate matching facts
  // If any positive fact satisfies, return success. If all are negative/contraexamples, return negative proof.
  let bestFailureResult: RequirementEvaluationResult | null = null

  for (const fact of matchingFacts) {
    const evidence = buildSourceEvidence(fact, sourcesMap, profile)
    const displayValue = fact.display_value || null

    // Check Polarity & Negative Counterexamples
    // A fact with polarity === false (e.g. "SIN SALIDAS ANALÓGICAS", "SIN TRANSMISOR INTEGRADO")
    // explicitly verifies that the product DOES NOT have the requested capability.
    if (fact.polarity === false) {
      // If the requirement was specifically testing for absence (e.g. not_equals, or value: false / none / 0 channels)
      const asksForAbsence =
        operator === "not_equals" ||
        targetValue === false ||
        normalizeString(targetValue) === "none" ||
        normalizeString(targetValue) === "ninguno" ||
        (typeof targetValue === "object" && targetValue?.available === false) ||
        (typeof targetValue === "object" && targetValue?.channels === 0)

      if (asksForAbsence) {
        return {
          requirement_id: reqId,
          property,
          operator,
          satisfied: true,
          reason: `Negative technical fact confirms absence as required: '${fact.display_value}'.`,
          fact_display_value: displayValue,
          source_evidence: evidence,
        }
      }

      // Positive requirement against a negative fact MUST FAIL
      bestFailureResult = {
        requirement_id: reqId,
        property,
        operator,
        satisfied: false,
        reason: `Negative technical fact (polarity: false): '${fact.display_value}'. ${
          fact.excerpt ? `Evidence: "${fact.excerpt}".` : ""
        }`,
        fact_display_value: displayValue,
        source_evidence: evidence,
      }
      continue
    }

    // Positive Fact Evaluation by Operator
    let evalOutcome: { satisfied: boolean; reason: string }

    switch (operator) {
      case "equals":
        evalOutcome = evaluateEquals(targetValue, fact, property)
        break

      case "not_equals": {
        const eqOutcome = evaluateEquals(targetValue, fact, property)
        evalOutcome = {
          satisfied: !eqOutcome.satisfied,
          reason: eqOutcome.satisfied
            ? `Fact '${fact.display_value}' matches prohibited value '${targetValue}'.`
            : `Fact '${fact.display_value}' does not equal '${targetValue}'.`,
        }
        break
      }

      case "range_contains":
        evalOutcome = evaluateRangeContains(req, fact, property)
        break

      case "in":
        evalOutcome = evaluateIn(targetValue, fact, property)
        break

      case "contains":
        evalOutcome = evaluateContains(targetValue, fact)
        break

      case "greater_than_or_equal":
        evalOutcome = evaluateGte(targetValue, fact, req)
        break

      case "less_than_or_equal":
        evalOutcome = evaluateLte(targetValue, fact, req)
        break

      default:
        evalOutcome = {
          satisfied: false,
          reason: `Unsupported operator '${operator}'. Supported operators: ${ALLOWED_OPERATORS.join(
            ", "
          )}.`,
        }
    }

    if (evalOutcome.satisfied) {
      return {
        requirement_id: reqId,
        property,
        operator,
        satisfied: true,
        reason: evalOutcome.reason,
        fact_display_value: displayValue,
        source_evidence: evidence,
      }
    } else {
      bestFailureResult = {
        requirement_id: reqId,
        property,
        operator,
        satisfied: false,
        reason: evalOutcome.reason,
        fact_display_value: displayValue,
        source_evidence: evidence,
      }
    }
  }

  return (
    bestFailureResult || {
      requirement_id: reqId,
      property,
      operator,
      satisfied: false,
      reason: `Could not satisfy requirement '${reqId}' for property '${property}'.`,
      fact_display_value: null,
      source_evidence: null,
    }
  )
}

/**
 * Evaluates a list of technical requirements against the facts and sources of a variant.
 *
 * 100% Deterministic:
 * - overall_satisfied is true if and only if EVERY individual requirement evaluates to satisfied: true.
 * - If requirements list is empty, overall_satisfied is false.
 *
 * @param variantId Medusa Product Variant ID (or SKU)
 * @param requirements List of 1 to 10 technical requirements
 * @param facts List of Technical Facts loaded from database
 * @param sources Map or List of Technical Sources loaded from database
 * @param profile Optional Technical Profile for revision and metadata
 */
export function evaluateRequirements(
  variantId: string,
  requirements: TechnicalRequirement[],
  facts: TechnicalFactRecord[],
  sources?:
    | TechnicalSourceRecord[]
    | Map<string, TechnicalSourceRecord>
    | Record<string, TechnicalSourceRecord>
    | null,
  profile?: TechnicalProfileRecord | null
): EvaluationResult {
  const sourcesMap = normalizeSources(sources)
  const evaluations: RequirementEvaluationResult[] = []

  const reqList = Array.isArray(requirements) ? requirements : []

  for (let i = 0; i < reqList.length; i++) {
    const rawReq = reqList[i]
    const reqWithFallbackId = {
      ...rawReq,
      id: rawReq.id || rawReq.requirement_id || `req_${i + 1}`,
    }
    const evalResult = evaluateSingleRequirement(
      reqWithFallbackId,
      variantId,
      facts,
      sourcesMap,
      profile
    )
    evaluations.push(evalResult)
  }

  // overall_satisfied: true if and only if ALL individual requirements are satisfied: true
  const overall_satisfied =
    evaluations.length > 0 && evaluations.every((e) => e.satisfied === true)

  const resolvedRevision =
    profile?.revision ||
    evaluations.find((e) => e.source_evidence?.source_revision)?.source_evidence
      ?.source_revision ||
    "rev-2026.1"

  return {
    variant_id: variantId,
    sku: profile?.sku || null,
    overall_satisfied,
    evaluations,
    source_revision: resolvedRevision,
    evaluated_at: new Date().toISOString(),
  }
}
