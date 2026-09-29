# FICTITIOUS PRODUCT — DEMONSTRATION DATA

> **FICTITIOUS PRODUCT — DEMONSTRATION DATA**  
> *SIMULATION — NOT A VALID COMMERCIAL OFFER*  
> This specification represents a synthetic benchmark component for the Controlnautas × Meta Muse agent-commerce evaluation.

---

# Technical Specification Sheet

## Product Identification
- **SKU Code:** `CN-DEMO-PT100-3W-A1`
- **Model:** `CN-RTD-P1`
- **Technical Designation:** Stainless Steel 3-Wire Passive Pt100 RTD Industrial Temperature Sensor Probe
- **Product Line:** Sensor-Pro Inox Series (Demonstration Environment)
- **Category:** Primary Temperature Sensors / Resistance Temperature Detectors (RTD)

---

## Primary Technical Source and Document Control
- **source_id:** `SRC-CN-RTD-P1-DS-V1`
- **revision:** `rev-2026.1`
- **Primary Datasheet URL:** [https://data.controlnautas.com/demo/datasheets/CN-DEMO-PT100-3W-A1.pdf](https://data.controlnautas.com/demo/datasheets/CN-DEMO-PT100-3W-A1.pdf)
- **Alternative / Local URL:** `/demo/datasheets/CN-DEMO-PT100-3W-A1.pdf`
- **Source Type:** Official Technical Datasheet in PDF (Synthetic with stable section numbering)

---

## Summary Technical Profile (Standardized Vocabulary)

| Property (`property`) | Normalized Value (`normalized_value_json`) | Display Value (`display_value`) |
| :--- | :--- | :--- |
| `sensor_element` | `{"type": "RTD", "element": "Pt100", "wires": 3, "class": "A", "standard": "IEC 60751", "r0_ohm": 100.0, "alpha": 0.00385, "min_c": -50.0, "max_c": 350.0}` | Class A Pt100 RTD sensor, 3-wire (-50 to +350 °C) |
| `mounting` | `{"type": "threaded probe", "thread": "1/2 NPT", "material": "AISI 316L", "diameter_mm": 6.0, "length_mm": 150}` | 1/2" NPT threaded immersion probe, AISI 316L sheath 6×150 mm |
| `supply_voltage` | `{"type": "passive", "external_power": false, "nominal_v": 0, "excitation_current_ma_min": 0.1, "excitation_current_ma_max": 1.0}` | NO SELF-POWER (passive 3-wire Pt100 component) |
| `analog_input` | `{"direction": "input", "channels": 0, "available": false}` | 0 channels (Not applicable) |
| `analog_output` | `{"direction": "output", "channels": 0, "available": false, "notes": "No 4-20 mA on its own nor voltage"}` | 0 channels (No integrated transmitter; No 4–20 mA on its own) |
| `interface` | `{"type": "none", "digital_interface": false, "cable_length_m": 2.0, "cable_wires": 3}` | NO DIGITAL INTERFACE (0 interfaces; flexible 3-wire cable) |
| `protocol` | `{"name": "none", "supported": false, "notes": "NO MODBUS ON ITS OWN"}` | None (NO MODBUS ON ITS OWN) |

---

## Detailed Specifications with Formal Citation

## Section 1: Identification and Model Overview
- **source_id:** `SRC-CN-RTD-P1-DS-V1`
- **revision:** `rev-2026.1`
- **URL:** [https://data.controlnautas.com/demo/datasheets/CN-DEMO-PT100-3W-A1.pdf](https://data.controlnautas.com/demo/datasheets/CN-DEMO-PT100-3W-A1.pdf)
- **page:** Page 1
- **section:** Section 1: Identification and Model Overview (Datasheet: Section 1: Identificación y Modelo)
- **description excerpt:** `"The primary temperature sensor model CN-RTD-P1 (SKU code: CN-DEMO-PT100-3W-A1) is a passive 3-wire Pt100 probe featuring a wire-wound platinum resistance element designed for immersion in thermal fluids and industrial processes. It rigorously conforms to the international resistance-temperature relationship defined by IEC 60751."`
- **classification excerpt:** `"Immersion probe / Passive 3-wire Pt100 (WITHOUT integrated transmitter, WITHOUT digital interface)"`
- **physical principle excerpt:** `"Pure platinum resistance thermometry with temperature-dependent electrical resistance variation"`
- **application excerpt:** `"Direct measurement in pipeline conduits, heat exchangers, storage tanks, and thermowells"`

## Section 2: Physical Mounting and Mechanical Form Factor
- **source_id:** `SRC-CN-RTD-P1-DS-V1`
- **revision:** `rev-2026.1`
- **URL:** [https://data.controlnautas.com/demo/datasheets/CN-DEMO-PT100-3W-A1.pdf](https://data.controlnautas.com/demo/datasheets/CN-DEMO-PT100-3W-A1.pdf)
- **page:** Page 1
- **section:** Section 2: Physical Mounting and Mechanical Form Factor (Datasheet: Section 2: Montaje Físico)
- **mounting fitting excerpt:** `"Direct process threaded mounting via fixed 1/2-inch NPT male connector"`
- **sheath material excerpt:** `"Probe sheath fabricated from high-purity austenitic stainless steel grade AISI 316L (1.4404)"`
- **dimensions excerpt:** `"Outer diameter: 6.0 mm | Process insertion length: 150 mm"`
- **pressure rating excerpt:** `"Allowable hydrostatic working pressure up to 40 bar at 20 °C (25 bar at 200 °C)"`
- **cable excerpt:** `"2.0-meter flexible shielded multicore cable with heat- and oil-resistant silicone/PTFE outer jacket"`
- **terminations excerpt:** `"3 flexible stranded conductors with tinned copper ferrules: 2 red (common return) and 1 white"`

## Section 3: Electrical Power Supply & Operational Tolerances
- **source_id:** `SRC-CN-RTD-P1-DS-V1`
- **revision:** `rev-2026.1`
- **URL:** [https://data.controlnautas.com/demo/datasheets/CN-DEMO-PT100-3W-A1.pdf](https://data.controlnautas.com/demo/datasheets/CN-DEMO-PT100-3W-A1.pdf)
- **page:** Page 1
- **section:** Section 3: Electrical Power Supply & Operational Tolerances (Datasheet Section 3: Electrical Power Supply)
- **electrical passivity excerpt:** `"NO SELF-POWER (0 VDC / 0 VAC). Operates as a passive 3-wire Pt100 component"`
- **nominal excitation excerpt:** `"0.1 mA to 1.0 mA DC constant current (supplied externally by measurement bridge or PLC/PID input circuit)"`
- **maximum current excerpt:** `"2.0 mA DC (strict thermal ceiling to prevent self-heating Joule error)"`
- **isolation excerpt:** `"Insulation resistance > 100 MΩ at 500 VDC between internal conductors and metallic sheath"`
- **voltage prohibition excerpt:** `"DIRECT VOLTAGE APPLICATION PROHIBITED. Applying fixed voltage burns the platinum element"`

## Section 4: Analog & Discrete I/O Interfaces and Sensors
- **source_id:** `SRC-CN-RTD-P1-DS-V1`
- **revision:** `rev-2026.1`
- **URL:** [https://data.controlnautas.com/demo/datasheets/CN-DEMO-PT100-3W-A1.pdf](https://data.controlnautas.com/demo/datasheets/CN-DEMO-PT100-3W-A1.pdf)
- **page:** Page 2
- **section:** Section 4: Analog & Discrete I/O Interfaces and Sensors (Datasheet: Section 4: Entradas / Salidas Analógicas y Sensores)
- **sensor element excerpt:** `"Pure platinum wire-wound / thin-film Pt100 conforming to European standard DIN EN 60751"`
- **base resistance excerpt:** `"R0 = 100.00 Ω nominal at 0.00 °C (temperature coefficient alpha α = 0.003850 Ω/Ω/°C)"`
- **metrological accuracy excerpt:** `"Class A per IEC 60751: Tolerance ±(0.15 + 0.002·|t|) °C (e.g., ±0.15 °C at 0 °C, ±0.35 °C at 100 °C)"`
- **continuous thermal range excerpt:** `"-50.0 °C to +350.0 °C continuous operating temperature on AISI 316L stainless steel sheath"`
- **3-wire cabling excerpt:** `"Passive 3-wire Pt100 with dual common conductors for line resistance cancellation"`
- **absence of transmitter excerpt:** `"WITHOUT INTEGRATED TRANSMITTER (0 transmitters). Contains no active signal conditioning electronics"`
- **electrical output excerpt:** `"Pure passive temperature-dependent ohmic resistance. No 4–20 mA on its own"`

## Section 5: Communications, Fieldbus and Protocol Specifications
- **source_id:** `SRC-CN-RTD-P1-DS-V1`
- **revision:** `rev-2026.1`
- **URL:** [https://data.controlnautas.com/demo/datasheets/CN-DEMO-PT100-3W-A1.pdf](https://data.controlnautas.com/demo/datasheets/CN-DEMO-PT100-3W-A1.pdf)
- **page:** Page 2
- **section:** Section 5: Communications, Fieldbus and Protocol Specifications (Datasheet: Section 5: Comunicaciones y Protocolos)
- **digital interface excerpt:** `"NO DIGITAL INTERFACE (0 interfaces). Probe lacks microprocessor, UART, integrated circuit, or serial port"`
- **bus protocol excerpt:** `"NOT APPLICABLE / NO MODBUS ON ITS OWN. Has no digital communication or fieldbus capability"`
- **bus modulation excerpt:** `"Not natively supported (passive device without digital signal modulation)"`
- **PLC/PID integration excerpt:** `"To acquire this probe on a Modbus network or PLC, wire directly into the RTD input of a dedicated controller (such as model CN-PID-T1) or pair with an external head/DIN rail transmitter converting RTD to Modbus or 4–20 mA"`

## Section 6: Engineering Constraints and Design Contraindications
- **source_id:** `SRC-CN-RTD-P1-DS-V1`
- **revision:** `rev-2026.1`
- **URL:** [https://data.controlnautas.com/demo/datasheets/CN-DEMO-PT100-3W-A1.pdf](https://data.controlnautas.com/demo/datasheets/CN-DEMO-PT100-3W-A1.pdf)
- **page:** Page 2
- **section:** Section 6: Engineering Constraints and Design Contraindications (Datasheet: Section 6: Restricciones y Contraindicaciones de Diseño)
- **4–20 mA contraindication excerpt:** `"Model CN-RTD-P1 is a passive resistive probe WITHOUT INTEGRATED TRANSMITTER. Under no circumstances does it generate an active signal: No 4–20 mA on its own and no standard voltage output. It is strictly prohibited to connect this probe directly to 4–20 mA analog inputs of a PLC (such as CN-DIN-PLC-A1) without prior interposition of a dedicated RTD Pt100 transmitter or signal conditioner."`
- **Modbus / digital contraindication excerpt:** `"The sensor features NO DIGITAL INTERFACE and NO MODBUS ON ITS OWN. It cannot be polled, addressed, or wired directly to RS-485 twisted pairs. Attempting to connect it directly to a Modbus network on its own will result in total operational failure."`
- **direct voltage hazard excerpt:** `"Never apply AC line voltage (220 VAC, 110 VAC) or DC power sources (24 VDC, 12 VDC) to probe wire terminals. Currents exceeding a few milliamperes will instantaneously fuse the delicate 100 Ω platinum filament, permanently and irreversibly destroying the sensor."`
- **3-wire wiring excerpt:** `"Always terminate the two identically colored wires (red) to the compensation terminals of the measurement instrument to ensure effective cancellation of lead wire resistance errors."`
