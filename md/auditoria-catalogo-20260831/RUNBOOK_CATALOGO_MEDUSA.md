# Runbook — Catálogo Medusa (Control Nautas)

Última actualización: 2026-08-31 (post Fase 7)

## Fuente de verdad

- **Catálogo comercial:** Medusa PostgreSQL + módulo PIM (`b2b-pim`)
- **Storefront:** `CATALOG_SOURCE=medusa` (único modo activo)
- **JSON legacy:** archivado en `b2b-storefront/src/lib/cn-catalog/data/` — no usar en runtime

## Comandos diarios

### Salud del catálogo

```bash
cd b2b-backend/apps/backend
npm run catalog:verify    # Gates bloqueantes
npm run catalog:audit     # Auditoría completa + warnings
```

### Certificación storefront

```bash
cd b2b-storefront
CATALOG_SOURCE=medusa npm run catalog:contract
npm run catalog:canary pe
```

### Reconciliación (solo si hay divergencia planificada)

```bash
cd b2b-backend/apps/backend
npm run catalog:reconcile          # dry-run → md/auditoria-catalogo-20260831/
npm run catalog:reconcile:apply    # aplicar tras revisar plan
npm run catalog:verify
```

## Revalidación de caché (Fase 5)

| Variable | Dónde | Valor |
|----------|-------|-------|
| `REVALIDATE_SECRET` | storefront + backend | Mismo secreto (≥32 bytes) |
| `STOREFRONT_REVALIDATE_URL` | backend | `https://<dominio>/api/internal/catalog/revalidate` |

Tras editar producto en Admin Medusa, verificar log `[catalog-revalidate] ok` en backend.

TTL de seguridad si falla la revalidación: PDP/categorías 15 min, typeahead 5 min, sitemap 1 h.

## Scripts bloqueados

No ejecutar en producción sin `ALLOW_DESTRUCTIVE_LEGACY_SEED=1` y ventana de mantenimiento:

- `medusa-cn-seed.ts`
- `seed-prices-direct.js`
- `seed-categories-direct.js`
- `seed-industrial-inventory.js`
- `link-brands-and-sales-channel.js`
- `enrich-catalog-all.ts`, `fix-catalog-data.ts`, `seed-categories.ts`, etc.

Lista completa: `b2b-backend/apps/backend/src/scripts/legacy-readonly/README.md`

## Incidentes conocidos

### Widget PIM borró datos (Incidente 01)

- **Síntoma:** specs/PIM vacíos tras guardar en Admin
- **Prevención:** widget corregido (`keepPreviousData` eliminado); probar en staging antes de editar masivo
- **Restauración:** reconciliación PIM + backup pre-edición

### Precios en centavos

Medusa almacena PEN en centavos (`89.00` → `8900`). Scripts de auditoría y canary dividen por 100 al comparar con JSON.

### Categorías inactivas

`query.graph({ entity: "product_category" })` incluye inactivas; `listProductCategories()` no. Usar grafo en scripts de reconciliación.

## Carrito shell (localStorage v2)

- Clave: `cn_shell_cart_v2`
- Formato: `{ version: 2, lines: [{ variantId, productId, handle, quantity }] }`
- Migración v1 retirada en Fase 7

## Despliegue

1. `npm run catalog:verify` en backend (0 bloqueantes)
2. Desplegar backend Medusa
3. Desplegar storefront con `CATALOG_SOURCE=medusa`
4. Smoke: 1 PDP, 1 categoría, búsqueda, añadir al carrito shell
5. `npm run catalog:canary`

## Contacto / escalación

- Reportes de auditoría: `md/auditoria-catalogo-20260831/`
- Plan maestro: `md/PLAN_MAESTRO_MEDUSA_FUENTE_UNICA_2026-08-31_20-26-12_UTC.md`
