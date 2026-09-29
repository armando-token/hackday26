# Fase 3 — Consumidores sin checkout

Fecha: 2026-08-31
Estado: **Implementación completa; gate de build PASS**

## Alcance

Migración de todas las superficies de catálogo **excepto checkout y carrito Medusa** para leer vía `catalog-source.ts` (`CATALOG_SOURCE=json` por defecto).

## Consumidores migrados

| Superficie | Archivo(s) | Fuente de datos |
|------------|------------|-----------------|
| PDP | `products/[handle]/page.tsx`, `hvac-product.tsx` | `getCatalogProductByHandle` |
| Categorías L1/L2/hoja | `store/[...slug]/page.tsx`, `hvac-category.tsx`, `leaf-category-listing.tsx` | `getCatalogProductsByCategory` / `getCatalogProductsByLeafSlug` |
| Búsqueda | `search/page.tsx`, `search-results.tsx` | `searchCatalogProducts` |
| Typeahead | `search-bar/index.tsx` | `GET /api/catalog/search` |
| Home recientes | `home-recent-products.tsx`, `page.tsx` | `GET /api/catalog/products` + `listAllCatalogProducts` (conteo) |
| Quick order | `quick-order/page.tsx` | `POST /api/catalog/lookup` |
| Feed Google | `api/feed/google-merchant/route.ts` | `listAllCatalogProducts` |
| Sitemap | `sitemap.ts` | `listAllCatalogProducts` |

## APIs nuevas (server-only)

| Ruta | Uso |
|------|-----|
| `GET /api/catalog/search?q=&countryCode=` | Typeahead (mín. 2 chars, máx. 8 hits) |
| `GET /api/catalog/products?handles=&countryCode=` | Resolver handles (recientes, listas) |
| `POST /api/catalog/lookup` | Resolución batch SKU/ítem/handle (quick-order) |

## Funciones añadidas en catalog-source

- `getCatalogProductsByLeafSlug`
- `getCatalogProductsByHandles`
- `lookupCatalogProductsBySkuTokens`

## Excepciones deliberadas (no bloquean Fase 3)

| Archivo | Motivo |
|---------|--------|
| `lib/data/cart.ts` | Fase 4 — mapeo handle→variantId aún usa JSON |
| `lib/cn-catalog/*` (taxonomía, facetas, shell cart) | Infraestructura compartida; taxonomía L1 en home/nav |
| `api/cn/product-detail` | Endpoint legacy; retirar en Fase 7 |

## Gate Fase 3

```bash
cd b2b-storefront
npx tsc --noEmit -p tsconfig.json   # PASS
npm run test:unit                    # 9 PASS
npm run build                        # PASS (498 PDPs SSG)
```

Verificación manual recomendada:

- [ ] PDP: precio, specs PIM, SEO metadata
- [ ] Categoría hoja: facetas y tabla técnica
- [ ] Búsqueda: resultados + filtros móviles
- [ ] Typeahead: ≥2 caracteres, filtro por familia L1
- [ ] Quick order: lookup SKU y agregar al shell cart
- [ ] `/sitemap.xml` y feed merchant con `updatedAt` real

## Próximo paso

**Fase 4** — Carrito v2: eliminar `CN_PRODUCTS` de `cart.ts`; variantId desde `CatalogProduct.primaryVariant.id`.
