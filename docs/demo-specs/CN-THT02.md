# TZ THT-02 Temperature & Humidity Sensor — Technical Specification (Markdown for API/Agents)

> **REAL PRODUCT DOCUMENTATION** sourced from THT-02 User's Manual v1.1.  
> Prefer Markdown for AI/API reading; PDF available for download.

## Product identification
- **SKU (Controlnautas demo catalog):** `CN-THT02`
- **Model:** `THT-02`
- **Brand / family:** TZ / Tzone
- **Document:** TZ THT-02 Temperature and humidity Sensor User's Manual V1.1
- **source_id:** `SRC-THT02-UM-V1.1`

## Summary
RS-485 temperature and humidity transmitter/sensor using **SHT30**, speaking **standard Modbus-RTU**. Supply **DC 5–24 V**. Temperature **-40 to 125 °C** (typ. ±0.3 °C at 0–60 °C). Humidity **5–95 %RH** (typ. ±2 % at 10–90 %RH). Address set by DIP switch.

## Key facts (closed vocabulary mapping)
| property | normalized / notes | evidence |
|---|---|---|
| `sensor_element` | Temperature + relative humidity (SHT30), **not** a bare Pt100 3-wire RTD | Manual §1 Overview / §4.4–4.5 |
| `protocol` | Modbus RTU | Manual §1 / §2 Features |
| `interface` | RS-485 | Manual §4.2 |
| `supply_voltage` | DC 5–24 V | Manual §4.1 |
| `analog_output` | **no_consta / not claimed** as 4–20 mA in this manual — digital Modbus registers | Manual register map |
| `analog_input` | not applicable as PLC AI | — |
| `mounting` | probe/sensor installation per manual wiring | Manual wiring section |

## Citations
- PDF: `/demo/datasheets/CN-THT02.pdf`
- Markdown: `/demo/specs/CN-THT02.md` + full `THT02_User_Manual.md`
- Excerpt: “compatible with the standard Modbus-RTU protocol” / “Supply voltage DC 5～24V” / “Measuring range -40～125℃”

## Agent reading order
1. This SPEC  
2. `THT02_User_Manual.md`  
3. PDF if required  
