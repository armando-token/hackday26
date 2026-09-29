# Fase 6 — Reconciliación y canary

Fecha: 2026-08-31  
Estado: **Completada — gates en verde**

## Resumen

Reconciliación masiva del catálogo Medusa contra `products.json` (decisiones D1–D5), verificación post-apply y smoke canario storefront.

| Gate | Resultado |
|------|-----------|
| `catalog:verify` | 0 bloqueantes |
| `catalog:audit` | 0 bloqueantes |
| `catalog:contract` (Medusa) | 498/498 |
| `catalog:canary` | 5/5 handles OK |

## Bugs corregidos en esta fase

### 1. Categorías no detectadas en dry-run

`listProductCategories()` **omite categorías inactivas** (`unit-heaters`, `sustratos-hidroponicos`, etc.).  
`buildExpectedCategoryIds()` devolvía `[]` y el bucle hacía `continue` sin generar acciones.

**Fix:** cargar categorías vía `query.graph({ entity: "product_category" })` y resolver IDs desde `categoryPath` del JSON.

### 2. Inventario fallaba en apply

`updateInventoryLevels({ id })` sin `inventory_item_id` / `location_id` lanzaba  
`Item undefined is not stocked at location undefined`.

**Fix:** actualizar con par `(inventory_item_id, location_id)`; crear nivel si no existe.

### 3. Canary script (`server-only`)

`catalog-smoke-canary.ts` importaba `catalog-repository` (marcado `server-only`).

**Fix:** Store API directa + lectura de `products.json`, misma escala de precios que `verify` (÷100).

### 4. Auditoría precio x100 (falso positivo)

`audit-catalog-cutover.ts` comparaba centavos Medusa vs soles JSON sin dividir.

**Fix:** `medusaMajor = px.pen[0] / 100` (alineado con `verify-catalog-cutover.ts`).

## Scripts backend

| Comando | Rol |
|---------|-----|
| `npm run catalog:reconcile` | Dry-run (plan JSON en `md/auditoria-catalogo-20260831/`) |
| `npm run catalog:reconcile:apply` | Aplica imágenes, categorías, precios, PIM, inventario |
| `npm run catalog:verify` | Gates bloqueantes post-reconciliación |
| `npm run catalog:audit` | Auditoría completa (incluye warnings) |

Archivo principal: `b2b-backend/apps/backend/src/scripts/reconcile-catalog-cutover.ts`

## Acciones aplicadas (resumen)

Primera pasada (parcial por error inventario): imágenes, activación categorías D2, dedupe `unit-heaters-industriales`, 229 asignaciones de categoría, 149 precios PEN, 235 PIM availability.

Segunda pasada: 497 ajustes de inventario (D4).

## Storefront canary

```bash
cd b2b-storefront
npm run catalog:canary pe
```

Handles de prueba: `sensores-con-punta-de-metal`, `sensor-rtd-con-cabezal-y-conexion-a-proceso`, `cintas-aislante-foam-tape`, `termopar-de-bayoneta-ajustable`, `tzone-bt07-data-logger`.

Header canary (sin cambiar `CATALOG_SOURCE` global):

```http
x-cn-catalog-canary: <CATALOG_CANARY_SECRET>
```

## Corte global `CATALOG_SOURCE=medusa`

Los gates están en verde. Para el corte en runtime:

```env
# b2b-storefront (.env / producción)
CATALOG_SOURCE=medusa
```

Rollback: `CATALOG_SOURCE=json` (JSON legacy sigue disponible hasta Fase 7).

Recomendado antes del corte en producción:

1. Configurar `STOREFRONT_REVALIDATE_URL` + `REVALIDATE_SECRET` en backend
2. Smoke manual PDP / categoría / búsqueda / carrito con flag Medusa
3. Monitorear 24–48 h

## Warnings residuales (no bloqueantes)

- **17 categorías inactivas** con productos publicados (hijas activas; revisar en F7)
- **236 PIM** con `lead_time` sin `lead_time_days` (D5: permitido)

## Reportes

- `verify-cutover-20260831233322..json`
- `audit-cutover-20260831233514..json`
- `reconcile-plan-20260831233309..json` (apply inventario)

## Próximo paso

**Fase 7** — Estabilización, runbook, bloqueo scripts legacy, retirar fallback JSON.
