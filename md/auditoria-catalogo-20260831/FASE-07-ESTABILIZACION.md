# Fase 7 — Estabilización y limpieza

Fecha: 2026-08-31  
Estado: **Completada**

## Objetivo

Cerrar la migración Medusa como fuente única: retirar fallback JSON en runtime, bloquear scripts destructivos legacy y documentar operación.

## Cambios storefront

| Área | Acción |
|------|--------|
| `catalog-source.ts` | Solo Medusa; `CATALOG_SOURCE=json` lanza error |
| `legacy-json-adapter.ts` | Eliminado |
| `products.ts` | Sin import de `products.json`; solo tipos y utilidades |
| `api/cn/product-detail` | Eliminado |
| `shell-cart.tsx` | Retirada migración `localStorage` v1 |
| `.env.template` | `CATALOG_SOURCE=medusa` por defecto |

Los archivos JSON en `src/lib/cn-catalog/data/` permanecen como **snapshot de migración** (auditoría, scripts backend), no en el bundle de catálogo.

## Cambios backend

| Área | Acción |
|------|--------|
| `scripts/lib/legacy-script-guard.*` | Guard `ALLOW_DESTRUCTIVE_LEGACY_SEED=1` |
| Scripts seed/SQL directo | Bloqueados (ver `legacy-readonly/README.md`) |
| `seed-*.js` | `DATABASE_URL` desde entorno (sin credenciales hardcoded como única opción) |

## Runbook

Ver `RUNBOOK_CATALOGO_MEDUSA.md` en este directorio.

## Gates de cierre

```bash
# Storefront
cd b2b-storefront
npm run test:unit                    # 13/13
CATALOG_SOURCE=medusa npm run catalog:contract   # 498/498
npm run catalog:canary               # 5/5

# Backend
cd b2b-backend/apps/backend
npm run test:unit                    # 36/36
npm run catalog:verify               # 0 bloqueantes
```

## Verificación sin JSON en runtime

```bash
rg 'products\.json|product-details\.json|legacy-json' b2b-storefront/src
# Solo comentarios en products.ts
```

## Rollback de emergencia

No hay rollback por variable de entorno. Procedimiento:

1. Revertir despliegue storefront al commit anterior
2. `CATALOG_SOURCE` no aplica si el código F7 ya está desplegado
3. Medusa sigue siendo la fuente de datos; el JSON snapshot en git sirve solo como referencia

## Observación post-corte (recomendado)

Monitorear 7–14 días: PDP, categorías, búsqueda, carrito shell, feed Merchant, revalidación de caché.

Configurar en producción:

```env
# Storefront
CATALOG_SOURCE=medusa
REVALIDATE_SECRET=<32+ bytes>

# Backend
STOREFRONT_REVALIDATE_URL=https://<storefront>/api/internal/catalog/revalidate
REVALIDATE_SECRET=<mismo valor>
```

## Migración completa

Fases 0–7 del plan maestro `PLAN_MAESTRO_MEDUSA_FUENTE_UNICA_2026-08-31_20-26-12_UTC.md` ejecutadas.
