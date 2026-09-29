# AUDIT-QA — Plan Catálogo B2B (Ago 2026)

## Principio
- **UX = Catálogo Industrial B2B** · **Datos = Control Nautas**
- Sin HTML WordPress en PDP

## Criterios medibles (post plan)
| Check | Estado |
|-------|--------|
| L1 Calefacción = **tiles** (no 14 tablas) | Sí (`kids>4` o `count>40`) |
| L2 leaf = collections img+desc+tabla+expand | Sí |
| Facets por categoría (Garantía normalizada, Brand≥2, price range) | Sí |
| Search sobre `CN_PRODUCTS` | Sí `/dk/search?q=` |
| Tabla trailing Brand + Price (Item# en expand) | Sí |
| `getSpecValue` + aliases + fill-rate columns | Sí |
| Cart → RFQ mailto multi-línea (no checkout Medusa roto) | Sí |
| Compare / List / Recently Viewed localStorage | Sí |
| Blurbs taxonomy L2 ≥80 chars | Sí |
| `technicalDescription` sin triplets · | Regenerado |

## Smoke
| Ruta | Esperado |
|------|----------|
| `/dk/store` | Hub L1 |
| `/dk/store/calefaccion-electrica` | Tiles L2 |
| `/dk/store/calefaccion-electrica/cartuchos` | Leaf Technical + facets |
| `/dk/search?q=king` | Cards CN |
| `/dk/cart` | RFQ CTA |
| PDP | Galería thumbs, List/Compare |

## Ops
- `npm run build && npm run start` en Mini 8GB
- Tunnel Cloudflare tras rebuild

## Pendiente / conocido
- Blank-rate schema crudo ~36%; UI dropea cols &lt;40% fill (meta &lt;20% en cols **mostradas**)
- SDS / UNSPSC / branch stock: sin datos (no inventar)
- 26 SKUs WC sin attributes
- Imágenes categoría duplicadas (bandas etc.) — polish P2
