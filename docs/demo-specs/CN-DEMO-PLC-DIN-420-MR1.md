# FICTITIOUS PRODUCT — DEMONSTRATION DATA

> **FICTITIOUS PRODUCT — DEMONSTRATION DATA**  
> *SIMULATION — NOT A VALID COMMERCIAL OFFER*  
> This specification represents a synthetic benchmark component for the Controlnautas × Meta Muse agent-commerce evaluation.

---

# Technical Specification Sheet

## Product Identification
- **SKU Code:** `CN-DEMO-PLC-DIN-420-MR1`
- **Model:** `CN-DIN-PLC-A1`
- **Technical Designation:** DIN Rail Programmable Logic Controller with 4–20 mA Analog Inputs and Modbus RTU
- **Product Line:** DIN-Logic Compact Series (Demonstration Environment)
- **Category:** Automation and Control / Compact PLCs

---

## Primary Technical Source and Document Control
- **source_id:** `SRC-CN-DIN-PLC-A1-DS-V1`
- **revision:** `rev-2026.1`
- **Primary Datasheet URL:** [https://data.controlnautas.com/demo/datasheets/CN-DEMO-PLC-DIN-420-MR1.pdf](https://data.controlnautas.com/demo/datasheets/CN-DEMO-PLC-DIN-420-MR1.pdf)
- **Alternative / Local URL:** `/demo/datasheets/CN-DEMO-PLC-DIN-420-MR1.pdf`
- **Source Type:** Official Technical Datasheet in PDF (Synthetic with stable section numbering)

---

## Summary Technical Profile (Standardized Vocabulary)

| Property (`property`) | Normalized Value (`normalized_value_json`) | Display Value (`display_value`) |
| :--- | :--- | :--- |
| `mounting` | `{"type": "DIN rail", "standard": "IEC/EN 60715", "size_mm": 35}` | 35 mm DIN rail mounting |
| `supply_voltage` | `{"type": "DC", "nominal": 24, "unit": "VDC", "min": 18.0, "max": 30.0}` | 24 VDC (18.0 to 30.0 VDC) |
| `analog_input` | `{"direction": "input", "channels": 2, "signal": "current", "min": 4, "max": 20, "unit": "mA", "resolution_bits": 12}` | 2 analog inputs 4–20 mA (12-bit) |
| `analog_output` | `{"direction": "output", "channels": 0, "available": false}` | 0 channels (No analog outputs) |
| `protocol` | `{"name": "Modbus RTU", "role": "slave", "baudrates": [9600, 19200, 38400, 57600, 115200]}` | Modbus RTU slave |
| `interface` | `{"type": "serial", "physical_layer": "RS-485", "duplex": "half-duplex", "isolation_v": 1000}` | Isolated half-duplex RS-485 |
| `control_function` | `{"type": "PLC", "digital_inputs": 4, "digital_outputs": 4}` | Compact PLC with 4 DI and 4 DO |

---

## Detailed Specifications with Formal Citation

## Section 1: Identification and Model Overview
- **source_id:** `SRC-CN-DIN-PLC-A1-DS-V1`
- **revision:** `rev-2026.1`
- **URL:** [https://data.controlnautas.com/demo/datasheets/CN-DEMO-PLC-DIN-420-MR1.pdf](https://data.controlnautas.com/demo/datasheets/CN-DEMO-PLC-DIN-420-MR1.pdf)
- **page:** Page 1
- **section:** Section 1: Identification and Model Overview (Datasheet: Section 1: Identificación y Modelo)
- **excerpt:** `"The industrial microcontroller model CN-DIN-PLC-A1 (SKU code: CN-DEMO-PLC-DIN-420-MR1) is a compact acquisition and logic control station for electrical switchboards. It integrates embedded processing for digitizing standard analog current variables and remote supervisory links on serial buses."`
- **supplementary excerpt:** `"Decentralized acquisition logic unit with real-time clock and non-volatile memory"`

## Section 2: Physical Mounting and Mechanical Form Factor
- **source_id:** `SRC-CN-DIN-PLC-A1-DS-V1`
- **revision:** `rev-2026.1`
- **URL:** [https://data.controlnautas.com/demo/datasheets/CN-DEMO-PLC-DIN-420-MR1.pdf](https://data.controlnautas.com/demo/datasheets/CN-DEMO-PLC-DIN-420-MR1.pdf)
- **page:** Page 1
- **section:** Section 2: Physical Mounting and Mechanical Form Factor (Datasheet: Section 2: Montaje Físico)
- **excerpt:** `"Symmetrical 35 mm DIN rail mounting compliant with international standard IEC / EN 60715 (TH35-7.5 and TH35-15 profiles)"`
- **dimensional excerpt:** `"90 mm (H) × 70 mm (W, exact footprint of 4 standard DIN modules) × 58 mm (D)"`
- **mechanical protection excerpt:** `"210 g / Ingress protection rating IP20 according to IEC 60529 (designed exclusively for protected electrical enclosure interiors)"`
- **thermal clearance excerpt:** `"25 mm clear clearance above and below with respect to wire ducts or adjacent components"`

## Section 3: Electrical Power Supply & Operational Tolerances
- **source_id:** `SRC-CN-DIN-PLC-A1-DS-V1`
- **revision:** `rev-2026.1`
- **URL:** [https://data.controlnautas.com/demo/datasheets/CN-DEMO-PLC-DIN-420-MR1.pdf](https://data.controlnautas.com/demo/datasheets/CN-DEMO-PLC-DIN-420-MR1.pdf)
- **page:** Page 1
- **section:** Section 3: Electrical Power Supply & Operational Tolerances (Datasheet Section 3: Electrical Power Supply)
- **excerpt:** `"24 VDC (stabilized direct voltage)"`
- **operating range excerpt:** `"18.0 VDC to 30.0 VDC (allowable residual ripple Vpp < 5%)"`
- **power and protection excerpt:** `"4.5 W maximum (with communication ports active and input terminals energized)"` | `"Reverse polarity protection via series diode, resettable PTC thermal fuse, and 1500 VAC galvanic isolation"`

## Section 4: Analog & Discrete I/O Interfaces and Sensors
- **source_id:** `SRC-CN-DIN-PLC-A1-DS-V1`
- **revision:** `rev-2026.1`
- **URL:** [https://data.controlnautas.com/demo/datasheets/CN-DEMO-PLC-DIN-420-MR1.pdf](https://data.controlnautas.com/demo/datasheets/CN-DEMO-PLC-DIN-420-MR1.pdf)
- **page:** Page 2
- **section:** Section 4: Analog & Discrete I/O Interfaces and Sensors (Datasheet: Section 4: Entradas / Salidas Analógicas y Sensores)
- **analog input excerpt:** `"2 channels (AI1, AI2)"` | `"Passive 4–20 mA current loop; internal shunt input impedance of 250 Ω; 12-bit ADC resolution (4096 counts); overall accuracy ±0.2% of full scale; configurable digital filtering"`
- **analog output excerpt (total absence):** `"0 channels (NONE)"` | `"DOES NOT HAVE ANALOG OUTPUTS. Hardware lacks DAC and any 4–20 mA current or 0–10 V voltage output stages"`
- **digital inputs excerpt:** `"Optocoupled discrete inputs 24 VDC (PNP / sink type), current consumption 5 mA per channel at 24 V"`
- **digital outputs excerpt:** `"Dry contact electromechanical relay outputs SPST-NO (250 VAC / 30 VDC, 2 A max. resistive)"`

## Section 5: Communications, Fieldbus and Protocol Specifications
- **source_id:** `SRC-CN-DIN-PLC-A1-DS-V1`
- **revision:** `rev-2026.1`
- **URL:** [https://data.controlnautas.com/demo/datasheets/CN-DEMO-PLC-DIN-420-MR1.pdf](https://data.controlnautas.com/demo/datasheets/CN-DEMO-PLC-DIN-420-MR1.pdf)
- **page:** Page 2
- **section:** Section 5: Communications, Fieldbus and Protocol Specifications (Datasheet: Section 5: Comunicaciones y Protocolos)
- **serial port excerpt:** `"1 × half-duplex RS-485 (2-wire: terminals A/D+, B/D-, and isolated GND), with switchable 120 Ω terminating resistor"`
- **protocol and mode excerpt:** `"Modbus RTU in SLAVE mode (Slave / Server). Configurable node ID from 1 to 247"`
- **baud rate excerpt:** `"Configurable via software or DIP switches: 9600, 19200, 38400, 57600, and 115200 bps (default: 19200 bps)"`
- **frame format excerpt:** `"8 data bits, selectable parity (Even, Odd, None), 1 or 2 stop bits (default framing: 8-E-1)"`
- **Ethernet / TCP excerpt (unsupported):** `"NOT SUPPORTED. Device lacks Ethernet controller, RJ-45 port, or TCP/IP protocol stack"`

## Section 6: Engineering Constraints and Design Contraindications
- **source_id:** `SRC-CN-DIN-PLC-A1-DS-V1`
- **revision:** `rev-2026.1`
- **URL:** [https://data.controlnautas.com/demo/datasheets/CN-DEMO-PLC-DIN-420-MR1.pdf](https://data.controlnautas.com/demo/datasheets/CN-DEMO-PLC-DIN-420-MR1.pdf)
- **page:** Page 2
- **section:** Section 6: Engineering Constraints and Design Contraindications (Datasheet: Section 6: Restricciones y Contraindicaciones de Diseño)
- **Modbus TCP contraindication excerpt:** `"Model CN-DIN-PLC-A1 does NOT feature an Ethernet interface and does NOT support the Modbus TCP protocol. Under no circumstances should direct IP connectivity to Ethernet-based SCADA networks be assumed. Any integration into TCP/IP packet-based networks strictly requires an external RS-485 to Modbus TCP gateway or converter."`
- **analog output contraindication excerpt:** `"The unit possesses NO analog control output (neither 4–20 mA nor 0–10 V). It is strictly contra-indicated to specify this SKU for direct continuous modulation of variable frequency drives (VFDs), electropneumatic control valve positioners, or analog actuators without incorporating supplementary expansion modules."`
- **master mode contraindication excerpt:** `"The RS-485 transceiver operates solely as a Modbus RTU slave. It lacks capability to initiate master polling requests or act as a network client toward other peripheral devices."`
- **passive loop constraint excerpt:** `"Terminals AI1 and AI2 are passive receivers (internal shunt resistor); they do not supply excitation loop voltage. Connected external 2-wire transmitters must be powered via a closed loop using an external 24 VDC power supply."`
