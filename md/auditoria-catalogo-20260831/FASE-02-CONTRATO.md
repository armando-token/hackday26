# Fase 2 — Contrato CatalogProduct v1

Fecha: 2026-08-31
Estado: **Implementación completa; gate de datos bloqueado por reconciliación pendiente**

## Entregables

| Archivo | Responsabilidad |
|---------|-----------------|
| `src/lib/catalog/catalog-types.ts` | Contrato interno v1 |
| `src/lib/catalog/medusa-types.ts` | Forma mínima Store API |
| `src/lib/catalog/catalog-schema.ts` | Validación Zod en el límite Medusa → storefront |
| `src/lib/catalog/catalog-mappers.ts` | Transformación pura + reglas §6.1 y §6.2 |
| `src/lib/catalog/catalog-errors.ts` | `CatalogContractError`, `CatalogNetworkError` |
| `src/lib/catalog/catalog-cache.ts` | Tags de caché (sin `_medusa_cache_id`) |
| `src/lib/catalog/catalog-repository.ts` | Lectura paginada Medusa (server-only) |
| `src/lib/catalog/legacy-json-adapter.ts` | Rollback JSON → CatalogProduct |
| `src/lib/catalog/catalog-source.ts` | Conmutador `CATALOG_SOURCE=medusa\|json` |
| `src/lib/catalog/index.ts` | Barrel export |

## Alias pim_info

Confirmado en Store API en vivo:

```
GET /store/products?fields=...,+pim_info.*,+brand.*
→ pim_info.item_number, purchase_mode, availability_mode, specs, ...
```

## Pruebas

```bash
cd b2b-storefront
npm run test:unit          # 9 pruebas mapper — PASS
npm run catalog:contract   # certificación Medusa — ver abajo
```

## Gate de certificación Medusa

```
Productos transformados: 489/498
ContractError: 9 (categorías)
```

Los 9 fallos coinciden con la auditoría dry-run (Fase 0):

- 7 productos con **2 categorías hoja** (duplicados `unit-heaters` / `unit-heaters-industriales`, etc.)
- 2 productos con **0 categorías hoja**

Estos se corrigen en la **Fase 6** (reconciliación de categorías, decisión canónica `unit-heaters`).
El contrato **rechaza correctamente** datos inválidos en lugar de degradar silenciosamente.

## Feature flag

- Variable: `CATALOG_SOURCE=json|medusa` (server-only, sin `NEXT_PUBLIC_`)
- Default: `json` (rollback seguro hasta el corte)
- Documentado en `.env.template`

## Próximo paso

**Fase 3** — Migrar consumidores (PDP, categorías, búsqueda, home, feed, sitemap) a `getCatalogProductByHandle` / `listAllCatalogProducts` desde `catalog-source.ts`, sin tocar componentes hasta que el contrato esté cableado.
