# FICTITIOUS PRODUCT — DEMONSTRATION DATA

> **FICTITIOUS PRODUCT — DEMONSTRATION DATA**  
> *SIMULATION — NOT A VALID COMMERCIAL OFFER*  
> This specification represents a synthetic benchmark component for the Controlnautas × Meta Muse agent-commerce evaluation.

---

# Technical Specification Sheet

## Product Identification
- **SKU Code:** `CN-DEMO-PID-PT100-RS1`
- **Model:** `CN-PID-T1`
- **Technical Designation:** Panel-Mount Digital PID Temperature Controller with Pt100 Input and 4–20 mA Analog Output
- **Product Line:** PID-Thermo Series (Demonstration Environment)
- **Category:** Instrumentation and Control / PID Controllers

---

## Primary Technical Source and Document Control
- **source_id:** `SRC-CN-PID-T1-DS-V1`
- **revision:** `rev-2026.1`
- **Primary Datasheet URL:** [https://data.controlnautas.com/demo/datasheets/CN-DEMO-PID-PT100-RS1.pdf](https://data.controlnautas.com/demo/datasheets/CN-DEMO-PID-PT100-RS1.pdf)
- **Alternative / Local URL:** `/demo/datasheets/CN-DEMO-PID-PT100-RS1.pdf`
- **Source Type:** Official Technical Datasheet in PDF (Synthetic with stable section numbering)

---

## Summary Technical Profile (Standardized Vocabulary)

| Property (`property`) | Normalized Value (`normalized_value_json`) | Display Value (`display_value`) |
| :--- | :--- | :--- |
| `mounting` | `{"type": "panel mount", "standard": "1/16 DIN", "cutout_mm": "45x45", "front_bezel_mm": "48x48"}` | 1/16 DIN front panel mounting (48×48 mm) |
| `supply_voltage` | `{"type": "AC", "nominal": "100-240 VAC", "unit": "VAC", "frequency_hz": "50/60", "min": 85, "max": 264}` | Universal 100–240 VAC (85 to 264 VAC) |
| `sensor_element` | `{"type": "RTD", "element": "Pt100", "wires": 3, "standard": "IEC 60751", "min_c": -200.0, "max_c": 600.0}` | 3-wire Pt100 input |
| `analog_input` | `{"direction": "input", "channels": 0, "available": false}` | 0 channels (No 4–20 mA current input) |
| `analog_output` | `{"direction": "output", "channels": 1, "signal": "current", "min": 4, "max": 20, "unit": "mA", "active_loop": true, "max_load_ohm": 500}` | Active 4–20 mA OUTPUT for proportional modulating control |
| `control_function` | `{"type": "PID", "features": ["auto-tuning", "manual_mode", "on-off"], "cycle_time_ms": 200}` | Advanced PID with adaptive Auto-Tuning |
| `protocol` | `{"name": "Modbus RTU", "role": "slave", "interface": "RS-485", "baudrates": [4800, 9600, 19200, 38400]}` | Modbus RTU RS-485 in SLAVE mode |
| `interface` | `{"type": "serial", "physical_layer": "RS-485", "duplex": "half-duplex", "isolation_v": 1000}` | Isolated half-duplex RS-485 |

---

## Detailed Specifications with Formal Citation

## Section 1: Identification and Model Overview
- **source_id:** `SRC-CN-PID-T1-DS-V1`
- **revision:** `rev-2026.1`
- **URL:** [https://data.controlnautas.com/demo/datasheets/CN-DEMO-PID-PT100-RS1.pdf](https://data.controlnautas.com/demo/datasheets/CN-DEMO-PID-PT100-RS1.pdf)
- **page:** Page 1
- **section:** Section 1: Identification and Model Overview (Datasheet: Section 1: Identificación y Modelo)
- **description excerpt:** `"The microprocessor-based controller model CN-PID-T1 (SKU code: CN-DEMO-PID-PT100-RS1) is a panel-mount instrument specialized in closed-loop thermal regulation featuring an automatic tuning algorithm (Auto-Tuning) and continuous proportional current control output for modulating actuators."`
- **classification excerpt:** `"Microprocessor-Based Digital PID Temperature Controller"`
- **algorithm excerpt:** `"Advanced PID with adaptive auto-tuning (Auto-Tuning) and selectable manual / ON-OFF mode"`
- **application excerpt:** `"Precision temperature control in industrial ovens, extruders, chemical reactors, and autoclaves"`

## Section 2: Physical Mounting and Mechanical Form Factor
- **source_id:** `SRC-CN-PID-T1-DS-V1`
- **revision:** `rev-2026.1`
- **URL:** [https://data.controlnautas.com/demo/datasheets/CN-DEMO-PID-PT100-RS1.pdf](https://data.controlnautas.com/demo/datasheets/CN-DEMO-PID-PT100-RS1.pdf)
- **page:** Page 1
- **section:** Section 2: Physical Mounting and Mechanical Form Factor (Datasheet: Section 2: Montaje Físico)
- **mounting type excerpt:** `"Exclusive front panel mounting (Panel Mount / Control Console)"`
- **modular standard excerpt:** `"1/16 DIN dimensional standard (outer front bezel 48 mm × 48 mm)"`
- **panel cutout excerpt:** `"45.0 mm (+0.5/-0) × 45.0 mm (+0.5/-0); suitable for panel plates from 1 to 8 mm thickness"`
- **clamping excerpt:** `"Removable rear plastic collar bracket with dual front-tightening tension screws"`
- **dimensions and rating excerpt:** `"48 × 48 × 95 mm (depth behind panel: 86 mm) / IP65 front face with rubber gasket seal"`
- **DIN rail restriction excerpt:** `"NOT SUITABLE FOR DIN RAIL. Device has no base or mounting clip for 35 mm DIN rail"`

## Section 3: Electrical Power Supply & Operational Tolerances
- **source_id:** `SRC-CN-PID-T1-DS-V1`
- **revision:** `rev-2026.1`
- **URL:** [https://data.controlnautas.com/demo/datasheets/CN-DEMO-PID-PT100-RS1.pdf](https://data.controlnautas.com/demo/datasheets/CN-DEMO-PID-PT100-RS1.pdf)
- **page:** Page 1
- **section:** Section 3: Electrical Power Supply & Operational Tolerances (Datasheet Section 3: Electrical Power Supply)
- **nominal voltage excerpt:** `"100–240 VAC (50/60 Hz) universal alternating voltage"`
- **operating range excerpt:** `"85 VAC to 264 VAC steady-state without functional degradation"`
- **power consumption excerpt:** `"6.5 VA maximum at 240 VAC with current output loop at 100% load"`
- **isolation excerpt:** `"2000 VAC (50/60 Hz) for 1 minute between power supply terminals and input signal terminals"`
- **rear terminal block excerpt:** `"12-pole rear screw terminal strip with M3 screws and insulating barrier separators"`

## Section 4: Analog & Discrete I/O Interfaces and Sensors
- **source_id:** `SRC-CN-PID-T1-DS-V1`
- **revision:** `rev-2026.1`
- **URL:** [https://data.controlnautas.com/demo/datasheets/CN-DEMO-PID-PT100-RS1.pdf](https://data.controlnautas.com/demo/datasheets/CN-DEMO-PID-PT100-RS1.pdf)
- **page:** Page 2
- **section:** Section 4: Analog & Discrete I/O Interfaces and Sensors (Datasheet: Section 4: Entradas / Salidas Analógicas y Sensores)
- **Pt100 input excerpt (PV sensor):** `"3-wire Pt100 input (IEC 60751); automatic lead resistance compensation up to 20 Ω/wire; range: -200.0 °C to +600.0 °C; resolution 0.1 °C; 16-bit ADC; accuracy ±0.2% full scale"`
- **absence of 4–20 mA input excerpt:** `"DEVICE DOES NOT HAVE A 4–20 mA INPUT. Output ≠ Input. Does not accept analog reading from pressure or flow transmitters"`
- **control analog output excerpt:** `"Active 4–20 mA proportional current OUTPUT for modulating PID control; 14-bit DAC; max loop load 500 Ω; internal active power source; analog cycle time 200 ms"`
- **discrete alarm excerpt:** `"1 electromechanical relay contact output SPST (250 VAC / 3 A) configurable for high/low temperature alarm"`

## Section 5: Communications, Fieldbus and Protocol Specifications
- **source_id:** `SRC-CN-PID-T1-DS-V1`
- **revision:** `rev-2026.1`
- **URL:** [https://data.controlnautas.com/demo/datasheets/CN-DEMO-PID-PT100-RS1.pdf](https://data.controlnautas.com/demo/datasheets/CN-DEMO-PID-PT100-RS1.pdf)
- **page:** Page 2
- **section:** Section 5: Communications, Fieldbus and Protocol Specifications (Datasheet: Section 5: Comunicaciones y Protocolos)
- **serial port excerpt:** `"1 × half-duplex RS-485 on rear terminals (TRX+, TRX-, and isolated SG), 1000 V galvanic isolation"`
- **protocol excerpt:** `"Modbus RTU RS-485 in SLAVE mode. Node addressing configurable via front menu from 1 to 247"`
- **baud rate excerpt:** `"4800, 9600, 19200, and 38400 bps selectable from front panel (default: 9600 bps, 8-N-1)"`
- **monitored registers excerpt:** `"Holding Registers (PV: Current temperature, SP: Setpoint, MV: Analog output percentage, Kp, Ti, Td, Alarms)"`
- **Ethernet network excerpt:** `"No native Ethernet connectivity; requires external serial converter or gateway if connected to TCP bus"`

## Section 6: Engineering Constraints and Design Contraindications
- **source_id:** `SRC-CN-PID-T1-DS-V1`
- **revision:** `rev-2026.1`
- **URL:** [https://data.controlnautas.com/demo/datasheets/CN-DEMO-PID-PT100-RS1.pdf](https://data.controlnautas.com/demo/datasheets/CN-DEMO-PID-PT100-RS1.pdf)
- **page:** Page 2
- **section:** Section 6: Engineering Constraints and Design Contraindications (Datasheet: Section 6: Restricciones y Contraindicaciones de Diseño)
- **mounting contraindication excerpt (Panel != DIN):** `"The CN-PID-T1 is strictly engineered for panel mounting (Panel != DIN / Panel distinct from DIN). It is absolutely contra-indicated to specify or attempt mounting this device directly on a 35 mm DIN rail. It lacks DIN rail clamps and approved brackets for rear cabinet mounting."`
- **4–20 mA contraindication excerpt (Output != Input):** `"The 4–20 mA terminal of this instrument is exclusively a proportional control 4–20 mA OUTPUT (MV). Output != Input (Output != 4–20 input): The device DOES NOT have a 4–20 mA input. Its sole process variable (PV) measurement input is a 3-wire Pt100 input. Connecting pressure or flow transmitter loops to input or output terminals is strictly prohibited."`
- **active loop precaution excerpt:** `"The 4–20 mA analog output supplies its own loop excitation voltage (active internal power source). Do NOT connect external power supplies in series with this loop; external voltage injection will burn the D/A converter stage."`
- **sensor probe requirement excerpt:** `"Mandatory 3-wire Pt100 input requirement. Do not connect thermocouples (Type J or K) or 2-wire resistive probes without compensation if maximum certified accuracy is required."`
