# X5 Prime OCS (HE-XP5) — Technical Specification (Markdown for API/Agents)

> **REAL PRODUCT DOCUMENTATION** sourced from manufacturer PDF MAN1363 R21.  
> Prefer this Markdown (and sibling full-doc `.md` files) for AI/API reading. PDF remains available for download.

## Product identification
- **SKU (Controlnautas demo catalog):** `CN-X5PRIME-HE-XP5`
- **Manufacturer part number:** `HE-XP5`
- **Model name:** X5 Prime OCS
- **Brand:** Horner Automation
- **Document:** X5 Prime OCS Datasheet — MAN1363 R21 (24 JUL 2023)
- **source_id:** `SRC-HE-XP5-DS-MAN1363-R21`

## Summary
All-in-one Operator Control Station (OCS) with built-in I/O. Datasheet states built-in I/O as **4 digital DC inputs, 4 digital DC outputs, 4 analog inputs**. Primary power range **10 VDC to 30 VDC**.

## Key facts (closed vocabulary mapping)
| property | normalized / notes | evidence |
|---|---|---|
| `interface` | digital/analog I/O onboard; see datasheet I/O tables | MAN1363 — Digital & Analog I/O Specifications |
| `supply_voltage` | 10–30 VDC primary power | MAN1363 — Power Wiring / Primary Power Range |
| `analog_input` | 4 analog inputs (built-in); see datasheet for ranges/types — **do not assume 4–20 mA unless datasheet row states it** | MAN1363 — Analog Inputs |
| `protocol` | controller/OCS platform connectivity per user manual family docs | MAN1039 user manual / connectivity sections |
| `control_function` | OCS control & logic platform | MAN1363 — Control and Logic |

## Citations
- Datasheet PDF: `/demo/datasheets/CN-X5PRIME-HE-XP5.pdf` (published copy of MAN1363_R21_X5P_DS.pdf)
- Full Markdown: `/demo/specs/CN-X5PRIME-HE-XP5.md` (this file) and `/demo/docs/x5prime/` full conversions
- Excerpt (datasheet cover): “Built-In I/O: 4 Digital DC Inputs, 4 Digital DC Outputs, 4 Analog Inputs” / “Part Number: HE-XP5”

## Agent reading order
1. This SPEC file  
2. `X5_Prime_Datasheet.md`  
3. `X5_Prime_User_Manual.md` / Quick Reference as needed  
4. PDF only if binary download required  
