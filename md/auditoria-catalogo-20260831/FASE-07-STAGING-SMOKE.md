# Smoke staging post Fase 7

Fecha: 2026-08-31  
Entorno: build local `next start -p 8001` con `CATALOG_SOURCE=medusa`

## Resultado

```bash
cd b2b-storefront
SMOKE_BASE_URL=http://127.0.0.1:8001 npm run catalog:smoke
# 14/14 PASS
```

| Superficie | Estado | Notas |
|------------|--------|-------|
| Backend `/health` | PASS | HTTP 200 |
| Home `/pe` | PASS | |
| PDP `sensores-con-punta-de-metal` | PASS | S/ 89, CN-10756 |
| Categoría `temperatura-termopar-rtd` | PASS | listado visible |
| Búsqueda `?q=sensor+rtd` | PASS | |
| API `/api/catalog/products` | PASS | `primaryVariant.id` resuelto |
| API `/api/catalog/search` | PASS | |
| Feed Google Merchant | PASS | IDs `CN-*` (sin `gla_` si falta `legacy.wcId`) |
| Sitemap | PASS | handle en XML |
| Medusa Store API | PASS | producto por handle |

## Pendiente producción (PM2)

El proceso `cnweb-storefront` en puerto **8000** lleva build anterior (API carrito 404).

Tras aprobar despliegue:

```bash
cd /home/ubuntu/CN_Web/b2b-storefront
npm run build
pm2 restart cnweb-storefront --update-env
npm run catalog:smoke   # contra :8000
```

`ecosystem.config.cjs` ya incluye `CATALOG_SOURCE=medusa`.  
`.env.local` actualizado con `CATALOG_SOURCE=medusa`.

## Warning observado (no bloqueante)

~~Feed Merchant exporta precios en centavos sin dividir~~ **Corregido 2026-08-31:** `medusaAmountToMajor()` en `catalog-mappers.ts` normaliza centavos → soles en todo el contrato.

## Comando

```bash
npm run catalog:smoke          # default http://127.0.0.1:8000
SMOKE_BASE_URL=http://host:port npm run catalog:smoke
```
