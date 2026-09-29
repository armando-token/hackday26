# Fase 0 — Congelación y evidencias

**Fecha:** 2026-08-31
**Plan:** `PLAN_MAESTRO_MEDUSA_FUENTE_UNICA_2026-08-31_20-26-12_UTC.md`, sección 18, Fase 0.
**Estado:** completada salvo la auditoría dry-run programática y la congelación operativa.

---

## 1. Bloqueante de infraestructura resuelto antes de iniciar

El disco raíz estaba al 99% (642 MB libres de 38 GB), lo que impedía generar el
backup, probar su restauración y ejecutar compilaciones de producción.

**Causa raíz:** el respaldo por `rsync` hacia `git/version_1.1/` no excluía la
propia carpeta `git/`, por lo que se copió a sí mismo de forma recursiva seis
niveles de profundidad, acumulando 17 GB de duplicados exactos.

**Evidencia de que era descartable:**

| Comprobación | Resultado |
|---|---|
| `git ls-files git/` | 0 archivos versionados |
| `git check-ignore -v git/` | `.gitignore:5:git/` |
| `git status --short` | 0 líneas (working tree limpio) |

**Acciones:** `git reflog expire --expire=now --all` y `git gc --prune=now
--aggressive` sobre el repo de respaldo (3,332 objetos sueltos compactados en un
pack; 259 MB a 241 MB), eliminación de `version_1.0` por el usuario y eliminación
de `git/version_1.1/git/`.

**Resultado:** 642 MB a **18 GB libres (53%)**. `version_1.1` pasó de 20 GB a 2.9 GB
conservando historial y working tree limpio.

---

## 2. Respaldo elevado a punto de recuperación real

Se detectó que `version_1.1` **no permitía recuperar el servidor**: cubría código,
media (819/819 archivos) y dumps, pero el `.gitignore` excluía los secretos y la
infraestructura vivía fuera del árbol del proyecto.

Incorporado en el commit `b5a910b`:

| Añadido | Origen |
|---|---|
| `infra/secrets/backend.env` | `b2b-backend/apps/backend/.env` |
| `infra/secrets/backend.env.production` | `b2b-backend/apps/backend/.env.production` |
| `infra/secrets/storefront.env.local` | `b2b-storefront/.env.local` |
| `infra/nginx/cnweb.conf` | `/etc/nginx/sites-available/cnweb` (164 líneas) |
| `infra/nginx/security_shield.conf` | `/etc/nginx/snippets/` |
| `infra/nginx/geoip2.conf` | `/etc/nginx/conf.d/` |
| `infra/system/iptables.rules` | `iptables-save` (57 reglas) |
| `infra/system/crontab.txt`, `ecosystem.config.cjs` | sistema |
| `infra/RECUPERACION.md` | procedimiento de recuperación en 8 pasos |

> Los secretos quedan en texto plano con permisos `600`. El repositorio es local
> y no debe publicarse en ningún remoto sin retirarlos y rotarlos.

---

## 3. Backup verificado — GATE DE FASE 0 CUMPLIDO

- **Archivo:** `backups/medusa_pre_cutover_20260831_210007.dump` (formato custom, 1,021 KB)
- **SHA-256:** `119f71fa0a26e2d11679f6fae4da4e4b1e74a6216868c3267f7589b64cb9c14a`
- **Commit:** `eb4e48d`

Restauración probada en la base de datos aislada `restore_test`, dentro del
contenedor pero **sin tocar la base de producción**. `pg_restore` terminó con
código 0 y sin errores. Paridad exacta:

| Métrica | Producción | Restaurada |
|---|---:|---:|
| Productos publicados | 498 | 498 |
| Variantes | 498 | 498 |
| `pim_info` | 500 | 500 |
| Categorías | 73 | 73 |
| Marcas | 12 | 12 |
| Precios | 960 | 960 |
| `inventory_item` | 498 | 498 |

La base `restore_test` fue eliminada tras la verificación.

---

## 4. Snapshot de los JSON legados

`md/auditoria-catalogo-20260831/json-snapshot-checksums.txt`. No se editaron.

| Archivo | SHA-256 | Tamaño |
|---|---|---|
| `products.json` | `f7e61f21d7f12f1750b9e97bb378c955d4bf25a4703d074f37b402fdb2598c6b` | 2.0 MB |
| `products-slim.json` | `c3b1a866c718d83ce6a93a6e90bc56226961c24294f9157ecf62fa86c34e6989` | 768 KB |
| `product-details.json` | `41ab57cb7009a75fce09439164e7998f3c2be0335868489531fae9821aba168b` | 747 KB |
| `taxonomy-counts.json` | `3da01eec76b5110222bd68751b079db38fbd17febcd17fb272f4b2f017de0482` | 2.0 KB |

`products.json` contiene 498 registros, coincidiendo con el conteo de Medusa.

---

## 5. Caso testigo CN-10756 confirmado

Reproducida la divergencia central que motiva el plan (sección 2.1):

| Fuente | Precio PEN |
|---|---:|
| `products.json` | **89.00** |
| PostgreSQL / Price Module | **283.20** |

El JSON declara además `priceMode: "fixed"`, `availabilityMode: "in_stock"` e
`inStock: true`.

### Desviación no registrada en el plan

La consulta devolvió **tres filas de precio** para la variante `CN-10756`: dos en
PEN a 283.2 y una en USD a 84.17. Auditado el alcance:

| Métrica | Valor |
|---|---:|
| Variantes con precio PEN duplicado | **1** |
| Variantes con precio PEN | 149 |
| Precios activos totales | 960 |

La única variante afectada es precisamente el producto testigo. El total de 149
variantes con precio PEN coincide exactamente con el gate de la sección 14.4
(*"149/149 buy_now tengan precio PEN calculable"*).

**Implicación:** debe resolverse en la Fase 6 antes del corte, porque un precio
duplicado en la misma moneda y región puede hacer no determinista el
`calculated_price`. Queda registrado como hallazgo para el script de
reconciliación; no se corrige en Fase 0.

---

## 6. Estado del sistema congelado

| Componente | Estado |
|---|---|
| `cnweb-backend` (PM2) | `online`, puerto 9000 |
| `cnweb-storefront` (PM2) | `online`, puerto 8000 |
| `medusa-db` (Docker) | `Up 2 weeks (healthy)`, `127.0.0.1:5432` |
| PostgreSQL | 15.19 (Debian) |
| Respaldo `version_1.1` | HEAD `eb4e48d`, working tree limpio |

`/home/ubuntu/CN_Web` no es un repositorio git; el control de versiones vive
exclusivamente en `git/version_1.1`.
