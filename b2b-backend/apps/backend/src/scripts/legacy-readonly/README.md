# Scripts legacy — solo lectura / bloqueados

Estos scripts pertenecen a la migración inicial JSON → Medusa. **No deben ejecutarse en producción** después de la Fase 7.

## Guard

Todos los scripts destructivos llaman a `assertDestructiveLegacyAllowed()` y abortan salvo:

```bash
ALLOW_DESTRUCTIVE_LEGACY_SEED=1 npx medusa exec ./src/scripts/<script>.ts
```

## Scripts bloqueados

| Script | Riesgo |
|--------|--------|
| `medusa-cn-seed.ts` | Re-seed masivo desde JSON |
| `seed-prices-direct.js` | SQL directo sobre precios |
| `seed-industrial-inventory.js` | SQL directo sobre inventario |
| `seed-categories-direct.js` | DELETE categorías demo + reasignación SQL |
| `link-brands-and-sales-channel.js` | Enlaces masivos |
| `enrich-catalog-all.ts` | Sobrescribe categorías/precios |
| `fix-catalog-data.ts` | Reparación masiva |
| `seed-categories.ts` | Seed categorías demo |
| `delete-demo-categories.ts` | Borra categorías |
| `deactivate-demo.ts` | Desactiva categorías |
| `industrial-seed.ts` | Seed industrial legacy |

## Scripts permitidos (operación)

| Script | Uso |
|--------|-----|
| `catalog:audit` | Auditoría dry-run |
| `catalog:reconcile` | Plan reconciliación |
| `catalog:reconcile:apply` | Aplicar reconciliación |
| `catalog:verify` | Gates post-corte |

## Credenciales

Usar `DATABASE_URL` del entorno. **No** embeber `postgresql://` en los scripts.
