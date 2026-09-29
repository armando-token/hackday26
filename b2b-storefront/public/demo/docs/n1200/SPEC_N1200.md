# NOVUS N1200 Universal Process Controller — Technical Specification (Markdown for API/Agents)

> **REAL PRODUCT DOCUMENTATION** sourced from NOVUS N1200 User Guide (EN).  
> Prefer Markdown for AI/API reading; PDF available for download.

## Product identification
- **SKU (Controlnautas demo catalog):** `CN-N1200`
- **Model:** `N1200`
- **Brand:** NOVUS
- **Document:** N1200 Controller User Guide V2.0x Q (EN)
- **source_id:** `SRC-N1200-UG-V2`

## Summary
Versatile process controller with multi-sensor universal input (including **Pt100**), **PID** automatic mode with self-tuning, relay / **4–20 mA** / logic pulse outputs in the standard model, PV/SP retransmission in 0–20 mA or **4–20 mA**, and USB serial recognized as Modbus RTU COM port for configuration.

## Key facts (closed vocabulary mapping)
| property | normalized / notes | evidence |
|---|---|---|
| `sensor_element` | Pt100 among supported universal input types | User Guide — Input Type Selection (Pt100 row) |
| `control_function` | PID automatic mode, self-tuning | User Guide — PID Automatic Mode / features list |
| `analog_output` | 4–20 mA control output and/or PV/SP retransmission 4–20 mA | User Guide — features: relay, 4–20 mA and logic pulse; retransmission |
| `analog_input` | Universal process inputs (mA/V/TC/RTD incl. Pt100) — **not the same as claiming dedicated dual AI 4–20 channels like a PLC card** | Input type table |
| `protocol` | Modbus RTU via USB serial configuration interface | Introduction — USB / Modbus RTU |
| `mounting` | Panel process controller form factor (see mechanical drawings in guide/selection guide) | Selection guide / installation chapters |
| `supply_voltage` | Universal power supply (see guide electrical ratings) | Power supply connections |

## Citations
- Primary PDF: `/demo/datasheets/CN-N1200.pdf` (Manual_N1200_EN.pdf)
- Markdown: `/demo/specs/CN-N1200.md` + full `N1200_User_Guide.md`
- Excerpt: “Multi-sensor universal input” / “Self-tuning of PID parameters” / “Retransmission of PV or SP in 0-20 mA or 4-20 mA” / “Modbus RTU”

## Agent reading order
1. This SPEC  
2. `N1200_User_Guide.md`  
3. Selection guide Markdown  
4. PDF if required  
