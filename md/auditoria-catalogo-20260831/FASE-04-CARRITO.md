# Fase 4 — Carrito v2

Fecha: 2026-08-31
Estado: **Implementación completa; gate de build PASS**

## Cambios principales

### Shell cart v2 (`lib/cn-catalog/shell-cart.tsx`)

- Almacenamiento `cn_shell_cart_v2` con `{ variantId, productId, handle, quantity }`
- **No persiste** precio, título ni stock
- Migración automática v1 → v2 al hidratar (resolución batch vía `/api/catalog/products`)
- v1 conservado sin modificar (rollback 7 días según plan)
- Precios resueltos en runtime desde catálogo activo (`CATALOG_SOURCE`)
- `addItem()` acepta payload completo o `{ handle }` (resolución async para legacy)

### `syncCartFromClient` (`lib/data/cart.ts`)

- Recibe `{ variantId, quantity }[]` — **eliminado import de `CN_PRODUCTS`**
- Deduplica variantes, valida cantidad 1–999
- Omite variantes ya presentes en carrito Medusa
- Devuelve `StoreCart` actualizado; lanza error si todas las líneas fallan

### Template carrito (`modules/cart/templates/shell-cart.tsx`)

- Subtotal desde precios resueltos del catálogo (no JSON local)
- Checkout solo para ítems `canAddToCart && !requiresQuote`
- Ítems de cotización excluidos del sync Medusa
- Errores de sync visibles; **no navega al checkout si falla**
- WhatsApp/correo usan `priceLabel` actual

### Helper

- `toShellCartLine(product, qty)` en `catalog-present.ts` — usado en PDP, categorías, búsqueda, home

## Gate Fase 4

```bash
cd b2b-storefront
npx tsc --noEmit -p tsconfig.json   # PASS
npm run build                        # PASS
```

`CN_PRODUCTS` ya no se importa en rutas de carrito/checkout.

## Verificación manual recomendada

- [ ] Agregar producto con precio fijo → subtotal en mini-carrito coincide con PDP
- [ ] Migración v1→v2 desde localStorage antiguo
- [ ] Producto quote_only → visible en carrito pero excluido del checkout
- [ ] Checkout: precio Medusa = precio mostrado en carrito (caso 89/283.20 resuelto con catálogo unificado)

## Próximo paso

**Fase 5** — Webhooks Medusa firmados + revalidación de cache tags (`catalog:*`).
