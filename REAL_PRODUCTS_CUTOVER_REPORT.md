# Real Products Cutover Report

Date: 2026-09-29
Branch: hackday-2026-controlnautas-muse

## Catalog (USD)

| SKU | Model | Brand | Price | Stock |
|-----|-------|-------|------:|------:|
| CN-X5PRIME-HE-XP5 | HE-XP5 | Horner Automation | 890 | 3 |
| CN-N1200 | N1200 | NOVUS | 480 | 2 |
| CN-THT02 | THT-02 | TZ / Tzone | 75 | 8 |

## Assets

- PDF: `/demo/datasheets/{SKU}.pdf`
- Spec MD: `/demo/specs/{SKU}.md`
- Full docs: `/demo/docs/{x5prime|n1200|tht02}/`
- Images: `/demo/images/{SKU}.png`

## API isolation

Muse offer/search filters updated from `CN-DEMO-%` to `CN-%` (still requires `technical_profile.demo = true` where applicable).

## Verification (spot)

- Muse search returns all 3 SKUs with live USD price/stock
- Offer for CN-X5PRIME-HE-XP5: priced $890, stock 3
- Product detail for CN-THT02 returns facts + sources
- Public HTTPS assets 200 for PDF/MD/PNG
- PDP `/us/products/{handle}` 200
