# Fase 5 — Eventos Medusa y revalidación de caché

Fecha: 2026-08-31
Estado: **Implementación completa; tests unitarios PASS**

## Storefront

| Archivo | Rol |
|---------|-----|
| `src/lib/catalog/catalog-revalidate-handler.ts` | Validación HMAC, allowlist tags/eventos, idempotencia 24h |
| `src/app/api/internal/catalog/revalidate/route.ts` | `POST` firmado → `revalidateTag` + `revalidatePath` |

### Seguridad

- `REVALIDATE_SECRET` server-only (mín. 32 bytes)
- HMAC-SHA256: `hex(secret, timestamp + "." + rawBody)`
- Tolerancia timestamp: 300 s
- `eventId` idempotente 24 h → 409 replay
- Allowlist de eventos y tags `catalog:*`

### TTL de seguridad (§15.3)

| Superficie | `revalidate` |
|------------|--------------|
| PDP, categorías, búsqueda, home | 900 s (15 min) |
| Typeahead API | 300 s (5 min) |
| Feed merchant | 900 s |
| Sitemap | 3600 s (ya existía) |

## Backend Medusa

| Archivo | Eventos |
|---------|---------|
| `subscribers/catalog-core-revalidation.ts` | product / variant / category workflow |
| `subscribers/catalog-price-revalidation.ts` | `pricing.price.*`, `pricing.price-set.updated` |
| `subscribers/catalog-inventory-revalidation.ts` | `inventory.inventory-level.*` |
| `subscribers/catalog-pim-revalidation.ts` | `b2b-pim.updated` (+ created/deleted) |
| `lib/catalog-revalidation-client.ts` | POST firmado, 3 reintentos, timeout 3 s |
| `lib/catalog-product-resolution.ts` | price/inventory → productId vía Query |
| `lib/catalog-revalidation-tags.ts` | Construcción de tags |

### Variables de entorno (backend)

```env
STOREFRONT_REVALIDATE_URL=http://localhost:8000/api/internal/catalog/revalidate
REVALIDATE_SECRET=<mismo valor que storefront>
```

## Pruebas

```bash
# Storefront
cd b2b-storefront && npm run test:unit   # incluye catalog-revalidate.unit.spec.ts

# Backend
cd b2b-backend/apps/backend && npm run test:unit
```

## Gate Fase 5 (manual)

1. Configurar `REVALIDATE_SECRET` idéntico en backend y storefront
2. Editar producto en Admin Medusa
3. Verificar log `[catalog-revalidate] ok` en backend
4. Confirmar respuesta 200 del endpoint interno
5. Storefront refleja cambio en ≤30 s sin rebuild (`next start`)

## Próximo paso

**Fase 6** — Reconciliación masiva de datos + canary + `CATALOG_SOURCE=medusa`.
