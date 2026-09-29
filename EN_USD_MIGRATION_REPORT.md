# English + USD Migration Report (Hack Day SF)

**SHA:** (see git after commit)  
**Public base:** https://data.controlnautas.com  
**Status:** Complete

## Changes
- Demo catalog titles/summaries/specs/datasheets in English
- Banner: FICTITIOUS PRODUCT — DEMONSTRATION DATA
- Currency/region: United States / USD (`reg_01JUS00HACKDAY26DEMOUSD0000`)
- Prices: PLC $890, PID $480, Pt100 $75; stocks 3/2/8
- Quote PDF generator: English + USD
- Storefront demo paths: `/us/products/...`
- Agent discoverability: `search` and `GET /products/{id}` now embed live USD price/stock (`offer`)
- `llms.txt` published at https://data.controlnautas.com/llms.txt

## Verification samples
- search PLC → English title, currency=usd, unit_price=890, available_quantity=3
- product detail → embedded offer priced USD
- offer endpoint → usd / 890 / stock 3
- preliminary-quotes → currency usd + English PDF
