# Auditoría independiente — Medusa como fuente única del catálogo

**Proyecto:** Control Nautas B2B — CN_Web  
**Fecha de auditoría:** 2026-09-01 00:50:22 UTC  
**Auditor:** revisión independiente adversarial  
**Alcance:** código, configuración, artefactos compilados, procesos PM2, Store API, storefront en `:8000` y `:8001`, PostgreSQL y gates automatizados  
**Modalidad:** solo lectura sobre código, base de datos y procesos; no se editó código, no se escribió en PostgreSQL y no se reinició PM2  
**Veredicto:** **NO APTO** para declarar el corte global a `CATALOG_SOURCE=medusa`

> Nota de trazabilidad: los comandos oficiales `catalog:audit` y `catalog:verify` generan por diseño archivos JSON. Al reproducirlos se crearon únicamente [audit-cutover-20260901004952..json](/home/ubuntu/CN_Web/md/auditoria-catalogo-20260831/audit-cutover-20260901004952..json) y [verify-cutover-20260901005006..json](/home/ubuntu/CN_Web/md/auditoria-catalogo-20260831/verify-cutover-20260901005006..json). Son evidencia de auditoría, no cambios de implementación.

---

## 1. Resumen ejecutivo

1. El sistema **no cumple** el Definition of Done del plan maestro y no debe cortarse a producción todavía.
2. Los 149 precios PEN comprables fueron escritos en PostgreSQL con factor **×100**, contradiciendo Medusa v2 y el propio plan maestro.
3. El código fuente actual divide esos precios por 100 y muestra el importe esperado, pero Medusa Cart/Checkout usaría el importe autoritativo ×100; esto produciría **PDP S/ 89 frente a checkout S/ 8,900**.
4. La producción PM2 en `:8000` sigue sirviendo un build anterior basado en el catálogo JSON; por eso los cambios de Marketing aún no se reflejan.
5. El build de staging en `:8001` sí usa Medusa, pero muestra S/ 8,900; el smoke lo declaró PASS por una comparación de substring defectuosa.
6. El código fuente del mapper fue modificado después del último build de storefront; código, build y runtime no representan la misma versión.
7. Los subscribers de revalidación fueron creados después del build y arranque del backend, por lo que **no existen en el backend desplegado**.
8. Las variables de revalidación faltan en backend; el secreto del storefront es un placeholder de 11 caracteres y el endpoint exige 32, por lo que responde HTTP 500.
9. La taxonomía visible continúa hardcodeada: nombres, descripciones, estado, jerarquía y conteos editados en Medusa no pueden reflejarse.
10. El feed nuevo cambia IDs Merchant de `gla_*` a `CN-*` sin migración aprobada, con riesgo de perder continuidad de Merchant Center.
11. PIM presenta aspectos sólidos: 498/498 registros, cero huérfanos/duplicados, índice único parcial, autenticación 401 y widget con SDK/guard de sincronización.
12. Los gates verdes actuales no son evidencia suficiente: varios codifican el mismo error de unidad monetaria y falta la suite `integration:modules`.

---

## 2. Conclusión técnica principal

La implementación no tiene un único estado desplegable coherente. Existen tres estados diferentes:

| Estado | Fuente efectiva | Precio CN-10756 | API carrito catálogo | Revalidación |
|---|---|---:|---|---|
| PM2 producción `:8000` | JSON/build anterior | S/ 89.00 | 404 | ruta 404; inexistente |
| Build ejecutado en `:8001` | Medusa | S/ 8,900.00 | 200 | ruta presente, pero HTTP 500 por secreto inválido |
| Código fuente actual | Medusa + mapper `/100` | S/ 89.00 visual | implementada, no compilada | implementada en fuente, no desplegada |
| Medusa Store API / Cart esperado | PostgreSQL | S/ 8,900.00 | variante real | subscribers no desplegados |

Por tanto, **reiniciar PM2 no es una solución segura**:

- reiniciar hoy `:8000` con el build existente publicaría precios ×100;
- recompilar el source actual mostraría el precio dividido, pero el checkout de Medusa seguiría cobrando ×100;
- aun después de un restart, la taxonomía permanecería hardcodeada y los eventos continuarían inoperantes si no se reconstruye/configura también el backend.

---

## 3. Matriz de cumplimiento

| Requisito | Estado | Evidencia independiente | Severidad si falla |
|---|---|---|---|
| Plan §1 — Marketing edita en Medusa y el cambio llega a todas las superficies | **NO CUMPLE** | PM2 `:8000` es anterior a la migración; rutas nuevas 404; taxonomía estática; revalidación inoperante | bloqueante |
| Plan §4 — precio sin multiplicar/dividir por 100 | **NO CUMPLE** | Reconciliador hace `price * 100`; mapper hace `amount / 100`; 149/149 filas comparables muestran factor 100 | bloqueante |
| Plan §5 — Medusa/PostgreSQL como fuente única runtime | **PARCIAL** | Source de producto es Medusa-only, pero producción aún sirve JSON y categorías visibles salen de `taxonomy.ts` | bloqueante |
| Plan §6 — contrato `CatalogProduct` v1 | **PARCIAL** | 498/498 mapean sin error estructural; semántica de precio incorrecta; varias variantes se rechazan en vez de soportarse | alto |
| Plan §7 — Store API paginada, detalle y búsqueda | **CUMPLE** | Cinco páginas de hasta 100; consulta por handle; API search server-only; contract 498/498 | medio |
| Plan §8 — PIM e integridad | **CUMPLE** | 498 PIM activos/distintos, cero huérfanos y duplicados, índice único parcial aplicado | alto |
| Plan §9 — API Admin PIM validada/autenticada | **PARCIAL** | Zod, 401 sin JWT, 404/409 y upsert concurrencia presentes; integración HTTP no reproducida por restricción de no escribir DB de test | alto |
| Plan §10 — widget Admin robusto | **CUMPLE EN CÓDIGO** | Usa `sdk.client.fetch`, React Query, errores visibles y bloqueo `sincronizado`; no se realizó escritura real desde Admin | alto |
| Plan §11 — repositorio/fuente | **CUMPLE EN SOURCE** | `catalog-source.ts` rechaza JSON; no hay imports runtime directos de archivos de producto | alto |
| Plan §12 — todos los consumidores storefront | **PARCIAL** | PDP, búsqueda, home, quick-order, carrito y feed usan contrato en source; categorías/sitemap/nav aún usan taxonomía estática | alto |
| Plan §13 — carrito v2 | **PARCIAL** | Persiste `variantId`; checkout usa Medusa; no existe la migración v1→v2 declarada y el precio visual diverge del checkout | bloqueante |
| Plan §14 — reconciliación | **NO CUMPLE** | Invariantes estructurales pasan, pero la reconciliación corrompió escala de precios; 159 productos usan categoría inactiva | bloqueante |
| Plan §15 — caché y TTL | **PARCIAL** | TTL existe en source; producción JSON impide frescura; el endpoint nuevo no está en `:8000` y falla en `:8001` | bloqueante |
| Plan §16 — eventos/subscribers | **NO CUMPLE** | Source existe, pero fue escrito después de `.medusa` y del arranque PM2; backend desplegado carece de subscribers | bloqueante |
| Plan §20 — pruebas | **NO CUMPLE** | Unit/contract/canary pasan; smoke producción falla; `integration:modules` no contiene tests; smoke de precio es falso positivo | alto |
| Plan §22 — despliegue/canary | **NO CUMPLE** | `:8000` no desplegado; `:8001` sirve build distinto del source y precio ×100 | bloqueante |
| Plan §24 — no mantener doble autoridad | **PARCIAL** | Productos source sin JSON; taxonomía y producción siguen siendo autoridades paralelas | alto |
| Plan §25 — Definition of Done | **NO CUMPLE** | Fallan precio PDP=cart=checkout, SLA, build actual, eventos, scripts/secretos, integración y producción | bloqueante |
| Plan §30 — resultado esperado | **NO CUMPLE** | Marketing no dispone todavía de un flujo Admin→Storefront reproducible y coherente | bloqueante |
| Fase 0 | **CUMPLE** | Evidencia base disponible y contrastable | bajo |
| Fase 1 — PIM | **CUMPLE / PARCIAL RUNTIME** | Modelo, índice, link y API desplegados; escritura UI no probada durante auditoría | alto |
| Fase 2 — contrato | **PARCIAL** | Estructura válida; precio semánticamente inválido | bloqueante |
| Fase 3 — consumidores | **PARCIAL** | Productos migrados en source; taxonomía no migrada | alto |
| Fase 4 — carrito | **NO CUMPLE** | Precio visual/checkout divergente y migración localStorage ausente | bloqueante |
| Fase 5 — eventos/caché | **NO CUMPLE** | Código muerto/no desplegado y entorno incompleto | bloqueante |
| Fase 6 — reconciliación | **NO CUMPLE** | Multiplicación ×100 aplicada a precios | bloqueante |
| Fase 7 — estabilización | **NO CUMPLE** | No hubo corte productivo; build, source y PM2 difieren; smoke de precio defectuoso | bloqueante |

---

## 4. Hallazgos

### AUD-001 — Precios Medusa corrompidos por factor ×100

- **Severidad:** bloqueante
- **Área:** datos / backend / storefront / checkout
- **Estado:** confirmado por cuatro vías independientes

#### Hecho observable

La reconciliación transformó los precios JSON, ya expresados en soles, en importes 100 veces mayores antes de guardarlos en Medusa:

- [reconcile-catalog-cutover.ts:47](/home/ubuntu/CN_Web/b2b-backend/apps/backend/src/scripts/reconcile-catalog-cutover.ts:47) ejecuta `Math.round(price * 100)`;
- [reconcile-catalog-cutover.ts:320](/home/ubuntu/CN_Web/b2b-backend/apps/backend/src/scripts/reconcile-catalog-cutover.ts:320) multiplica igualmente USD;
- [catalog-mappers.ts:49](/home/ubuntu/CN_Web/b2b-storefront/src/lib/catalog/catalog-mappers.ts:49) intenta ocultarlo dividiendo `amount / 100`;
- el plan maestro prohíbe explícitamente ambas operaciones en [§4, línea 193](/home/ubuntu/CN_Web/md/PLAN_MAESTRO_MEDUSA_FUENTE_UNICA_2026-08-31_20-26-12_UTC.md:193).

Medusa v2 almacena precios en **unidad mayor**, no en centavos. La documentación oficial indica que `$20.00` se guarda como `20`, y la guía de migración v1→v2 confirma el cambio de unidad menor a unidad mayor: [Pricing Concepts](https://docs.medusajs.com/resources/commerce-modules/pricing/concepts) y [Medusa v1 to v2 — Prices are Stored in Major Units](https://docs.medusajs.com/learn/introduction/from-v1-to-v2#prices-are-stored-in-major-units).

#### Evidencia de BD y runtime

Consulta independiente, 2026-09-01:

```text
JSON products:                         498
Precios PEN vinculados y comparables: 149
DB amount == JSON price:                 0
DB amount / 100 == JSON price:         149
```

Muestras:

| Handle | JSON esperado | PostgreSQL/Store API | Relación |
|---|---:|---:|---:|
| `sensores-con-punta-de-metal` | 89.00 | 8,900.00 | ×100 |
| `calefactor-serie-e-king` | 3,916.00 | 391,600.00 | ×100 |
| `cable-calefactor-serie-srp-240v` | 433.00 | 43,300.00 | ×100 |
| `unidad-de-aire-de-reposicion-clear-air-mau` | 31,848.00 | 3,184,800.00 | ×100 |

Store API directa:

```json
{
  "handle": "sensores-con-punta-de-metal",
  "calculated_amount": 8900,
  "currency": "pen"
}
```

Evidencia histórica adicional: líneas de carrito creadas antes de la reconciliación guardaron `unit_price=32`, `801.6`, `11515` y `947`; los mismos variants tienen hoy `3200`, `80160`, `1151500` y `94700`, exactamente ×100. Los precios fueron actualizados el `2026-08-31T23:32Z`.

#### Impacto

- El source actual puede mostrar S/ 89, pero [hvac-product.tsx:75](/home/ubuntu/CN_Web/b2b-storefront/src/modules/products/templates/hvac-product.tsx:75) agrega la variante real a Medusa Cart.
- **Inferencia respaldada por la semántica oficial y los carritos históricos:** al crear una línea nueva, Medusa calcularía la línea con su precio autoritativo de S/ 8,900. No se creó un carrito nuevo durante esta auditoría para respetar el modo de solo lectura.
- Feed, JSON-LD, GA4 y subtotal pueden variar según qué build/mapper se use.
- Existe riesgo de cotización, pedido o cobro 100 veces superior.

#### Recomendación

Bloquear el corte, checkout y nuevas modificaciones de precio hasta:

1. respaldar tablas/módulos de pricing;
2. identificar exactamente las filas alteradas por el reconcile mediante variante, timestamp y snapshot;
3. restaurar importes en unidad mayor por API/workflow de Medusa, no mediante SQL directo ni división global indiscriminada;
4. eliminar toda conversión `/100` y `*100` del mapper, reconciliador y verificadores;
5. verificar precio raw Store API = PDP = línea de carrito = checkout para una muestra estratificada y para las 149 variantes comprables.

#### Relación con documentación

**Refuta** Fase 6, Fase 7 y el gate de paridad. Confirma la advertencia original del plan maestro §4/§24.

---

### AUD-002 — Producción PM2 sigue sirviendo el build JSON anterior

- **Severidad:** bloqueante
- **Área:** operaciones / storefront

#### Hecho observable

`cnweb-storefront` fue iniciado el `2026-08-27T06:22:13Z`, cuatro días antes de la implementación. El build `.next` en disco es del `2026-09-01T00:15:08Z` y no es el proceso servido en `:8000`.

Pruebas contra producción PM2:

```text
GET /pe                                             200
GET /pe/products/sensores-con-punta-de-metal       200, S/ 89 vía JSON
GET /api/catalog/products?...                      404
GET /api/catalog/search?q=sensor                   404
POST /api/internal/catalog/revalidate              404
```

El feed de `:8000` conserva `gla_10756` y `89.00 PEN`, comportamiento del build legacy.

#### Impacto

Este hallazgo explica directamente el problema reportado por Marketing: los cambios en Medusa no pueden aparecer en un proceso que todavía consume el snapshot anterior.

#### Recomendación

No hacer un restart aislado. Primero deben corregirse AUD-001, AUD-003, AUD-004 y AUD-006; después generar artefactos reproducibles, probarlos en staging y finalmente hacer un despliegue coordinado backend+storefront con `--update-env`.

#### Relación con documentación

**Confirma** el pendiente documentado en [FASE-07-STAGING-SMOKE.md:27](/home/ubuntu/CN_Web/md/auditoria-catalogo-20260831/FASE-07-STAGING-SMOKE.md:27), pero **refuta** cualquier interpretación de Fase 7 como corte terminado.

---

### AUD-003 — Revalidación no desplegada y entorno inválido

- **Severidad:** bloqueante
- **Área:** backend / storefront / operaciones

#### Hechos observables

1. El backend `.medusa` fue construido el `2026-08-31 22:12 UTC` y PM2 arrancó a las `22:13`.
2. `catalog-revalidation-client.ts` fue creado/modificado a las `23:15` y `catalog-core-revalidation.ts` a las `23:24`.
3. `.medusa/server/src/` no contiene directorio ni archivos de subscribers de catálogo.
4. El entorno efectivo de PM2 backend no contiene `STOREFRONT_REVALIDATE_URL` ni `REVALIDATE_SECRET`.
5. `.env.local` del storefront tiene un placeholder de 11 caracteres; [catalog-revalidate-handler.ts](/home/ubuntu/CN_Web/b2b-storefront/src/lib/catalog/catalog-revalidate-handler.ts) exige al menos 32.
6. `POST :8001/api/internal/catalog/revalidate` devuelve HTTP 500: `REVALIDATE_SECRET no configurado`.
7. `POST :8000/...` devuelve 404 porque el endpoint no existe en producción.

#### Impacto

Ninguna edición de producto, precio, inventario, PIM o categoría puede invalidar hoy el caché del storefront. En producción el TTL tampoco rescata el cambio porque el build efectivo sigue en JSON.

#### Recomendación

- Generar un secreto aleatorio de al menos 32 bytes y no versionarlo ni dejarlo como placeholder operativo.
- Configurar el mismo valor en backend y storefront, y `STOREFRONT_REVALIDATE_URL` en backend.
- Construir de nuevo el backend después de incluir los subscribers.
- Verificar en el artefacto `.medusa/server` que los cuatro subscribers estén presentes.
- Desplegar backend, verificar suscripciones/logs, desplegar storefront y ejecutar una edición canaria real.
- Considerar un Event Bus persistente para producción; el gate ejecutado reportó `Local Event Bus installed`, no recomendado para producción.

#### Relación con documentación

**Refuta** “Implementación completa” de [FASE-05-EVENTOS-CACHE.md:4](/home/ubuntu/CN_Web/md/auditoria-catalogo-20260831/FASE-05-EVENTOS-CACHE.md:4) a nivel de despliegue. El propio documento dejó el gate manual sin evidencia.

---

### AUD-004 — Source, build de staging y tests no corresponden; smoke de precio falso positivo

- **Severidad:** bloqueante
- **Área:** QA / build / operaciones

#### Hechos observables

- `.next/BUILD_ID`: `2026-09-01 00:15:08 UTC`.
- `catalog-mappers.ts`: `2026-09-01 00:30:49 UTC`.
- El source fue modificado 15 minutos después del build.
- El proceso `:8001`, iniciado a las `00:17`, usa el build anterior al cambio del mapper y devuelve:

```json
{
  "catalog_amount": 8900,
  "price_label": "S/ 8900.00"
}
```

- Sin embargo, el smoke busca:

```ts
pdpHtml.includes("S/ 89") || pdpHtml.includes("89.00")
```

`"S/ 8900.00"` contiene `"S/ 89"`, por lo que el test da PASS para el importe incorrecto.

#### Impacto

El “14/14 PASS” de staging no certifica el precio. La documentación afirma S/ 89, mientras el endpoint del mismo build devuelve S/ 8,900. No existe un build probado que corresponda al source actual.

#### Recomendación

- Comparar importes como números parseados y con igualdad/tolerancia exacta, nunca substring.
- Registrar `BUILD_ID`, commit SHA, checksum y timestamp en cada gate.
- Ejecutar tests sobre el artefacto exacto que será promovido.
- Rechazar un despliegue si cualquier source relevante es más nuevo que el build.

#### Relación con documentación

**Refuta** [FASE-07-STAGING-SMOKE.md:11](/home/ubuntu/CN_Web/md/auditoria-catalogo-20260831/FASE-07-STAGING-SMOKE.md:11) y su corrección declarada de precios.

---

### AUD-005 — La taxonomía editable continúa hardcodeada

- **Severidad:** alto
- **Área:** storefront / arquitectura

#### Hecho observable

[taxonomy.ts:14](/home/ubuntu/CN_Web/b2b-storefront/src/lib/cn-catalog/taxonomy.ts:14) contiene en código el árbol completo, nombres, descripciones y `productCount`. Se consume en:

- navegación desktop y mobile;
- selector de categorías de búsqueda;
- home;
- landing `/store`;
- resolución y metadata de `/store/[...slug]`;
- sitemap.

[sitemap.ts:53](/home/ubuntu/CN_Web/b2b-storefront/src/app/sitemap.ts:53) recorre `CN_ROOT`. [store/[...slug]/page.tsx:81](</home/ubuntu/CN_Web/b2b-storefront/src/app/[countryCode]/(main)/store/[...slug]/page.tsx:81>) resuelve la categoría con `findCategoryByPath` estático.

El plan exigía en [§12.3](/home/ubuntu/CN_Web/md/PLAN_MAESTRO_MEDUSA_FUENTE_UNICA_2026-08-31_20-26-12_UTC.md:714) que nombre, descripción, activo, rank, parent y conteos vinieran de `ProductCategory`.

#### Impacto

Marketing puede editar una categoría en Medusa sin que cambien la navegación, título, descripción, orden, activación, conteo ni sitemap. Una categoría nueva en Medusa devuelve 404 hasta ser agregada al código.

#### Recomendación

Crear un repositorio server-only de `ProductCategory`, construir el árbol por `parent_category_id`/rank, calcular conteos desde asignaciones publicadas y conservar en código únicamente aliases URL y configuración puramente visual.

#### Relación con documentación

**Refuta** la finalización de Fase 3 y el objetivo de fuente única. No es una excepción permitida por el plan.

---

### AUD-006 — Cambio no aprobado de IDs de Google Merchant/GA4

- **Severidad:** alto
- **Área:** feed / analítica / SEO comercial

#### Hecho observable

Producción exporta `gla_10756`; staging exporta `CN-10756`. El mapper Medusa no llena `CatalogProduct.legacy.wcId`, `MEDUSA_CATALOG_FIELDS` no solicita metadata útil para ello y 0/498 productos tienen `metadata.wc_id` o `metadata.legacy_wc_id` en PostgreSQL.

[catalog-present.ts:40](/home/ubuntu/CN_Web/b2b-storefront/src/lib/catalog/catalog-present.ts:40) usa `gla_*` solo si existe `legacy.wcId`; de lo contrario cambia a item number/SKU. El smoke acepta indistintamente `gla_` o `CN-`, de modo que no detecta la regresión.

#### Impacto

Los 149 productos elegibles del feed pueden aparecer como artículos nuevos en Merchant Center, perder historial, asociaciones de campañas y continuidad analítica.

#### Recomendación

Definir y aprobar la política de identidad antes del corte. Si debe conservarse, migrar el ID legacy a metadata/PIM y mapearlo explícitamente; agregar un gate de igualdad exacta de IDs feed antiguo↔nuevo.

#### Relación con documentación

**Refuta** el checklist del plan §26 (“No cambia IDs Merchant sin aprobación”) y convierte el PASS de Fase 7 en insuficiente.

---

### AUD-007 — Scripts destructivos no bloqueados y credenciales literales

- **Severidad:** alto
- **Área:** seguridad / operaciones

#### Hechos observables

Varios scripts legacy sí usan `ALLOW_DESTRUCTIVE_LEGACY_SEED`, pero permanecen escrituras sin guard:

- [b2b-seed.ts](/home/ubuntu/CN_Web/b2b-backend/apps/backend/src/scripts/b2b-seed.ts) crea productos y PIM sin confirmación;
- [delete-shorts.ts](/home/ubuntu/CN_Web/b2b-backend/apps/backend/src/scripts/delete-shorts.ts) elimina producto;
- [activate-categories.ts](/home/ubuntu/CN_Web/b2b-backend/apps/backend/src/scripts/activate-categories.ts) elimina demos y activa categorías masivamente, con catches vacíos.

Además:

- `audit-api.js` contiene email y contraseña de Admin literales; la contraseña se omite de este informe y debe considerarse comprometida;
- varios scripts directos contienen una URL PostgreSQL literal de fallback;
- backend y storefront contienen una clave HMAC ALTCHA hardcodeada como fallback;
- `.env.test` tiene modo `664`, aunque contiene credenciales de test;
- el backup Git rastreado no contiene varios archivos centrales de la migración.

#### Impacto

Ejecución accidental, pérdida/modificación de catálogo, exposición de credenciales y falta de recuperación reproducible.

#### Recomendación

Rotar inmediatamente la credencial Admin expuesta y la clave ALTCHA; eliminar literales; aplicar guard común a **todo** script que escriba; mover scripts históricos fuera de rutas ejecutables; cambiar `.env.test` a `600`; incorporar la implementación a control de versiones y etiquetar el artefacto desplegado.

#### Relación con documentación

**Refuta** Fase 7 y DoD §25.15 (“scripts destructivos bloqueados y sin secretos”).

---

### AUD-008 — Gates verdes comparten el mismo error y falta cobertura de integración

- **Severidad:** alto
- **Área:** QA

#### Hechos observables

- `catalog:audit` y `catalog:verify` dividen el precio de Medusa por 100 antes de comparar.
- `catalog:canary` usa el mismo mapper defectuoso, por lo que valida circularmente el dato multiplicado.
- [catalog-mappers.unit.spec.ts:86](/home/ubuntu/CN_Web/b2b-storefront/src/lib/catalog/__tests__/catalog-mappers.unit.spec.ts:86) afirma que 8,900 PEN debe convertirse a 89.
- El smoke de staging usa substring y acepta 8,900 como 89.
- `npm run test:integration:modules` termina con exit 1: `No tests found`.
- Existen pruebas HTTP PIM, pero no se ejecutaron en esta auditoría porque crean/escriben una BD temporal y el alcance ordena no modificar BD.
- No hay e2e que compare una línea real de carrito con el valor visual.

#### Impacto

Múltiples PASS aparentan independencia, pero son distintas expresiones de una misma suposición falsa.

#### Recomendación

Crear oráculos independientes:

1. semántica oficial de Medusa v2;
2. importe esperado aprobado por negocio;
3. Store API raw sin mapper;
4. cart line real en DB/API de test;
5. UI/JSON-LD/feed parseados numéricamente.

El gate debe fallar ante cualquier conversión monetaria no autorizada.

#### Relación con documentación

**Refuta** el cierre de Fases 2, 4, 6 y 7 como evidencia de corrección integral.

---

### AUD-009 — 159 productos publicados enlazados a categorías inactivas

- **Severidad:** medio
- **Área:** datos / catálogo

#### Evidencia

PostgreSQL contiene:

```text
ProductCategory activas + inactivas: 73
Categorías inactivas:                20
Categorías inactivas con productos:  17
Productos publicados afectados:     159/498
```

Las 17 categorías asignadas incluyen `gases-co2` (32 productos), `termostatos-industriales` (33), `accesorios-sensores` (22), `unidades-monitoreo` (21) y otras.

#### Impacto

La taxonomía estática las muestra aunque Medusa diga que están inactivas. Una vez migrada la taxonomía, 159 productos podrían cambiar de visibilidad de forma abrupta si la política no se resuelve.

#### Recomendación

Obtener aprobación de negocio para cada categoría, corregir `is_active` o reasignar productos y añadir un gate: cero producto publicado en categoría inactiva salvo excepción explícita versionada.

#### Relación con documentación

**Confirma** el warning de 17 categorías de Fase 6, pero eleva su impacto porque afecta 159 productos y la UI actual ignora el estado Medusa.

---

### AUD-010 — Migración automática de carrito v1→v2 declarada pero inexistente

- **Severidad:** medio
- **Área:** storefront / UX

#### Hecho observable

[FASE-04-CARRITO.md:12](/home/ubuntu/CN_Web/md/auditoria-catalogo-20260831/FASE-04-CARRITO.md:12) declara migración automática. Sin embargo, [shell-cart.tsx:14](/home/ubuntu/CN_Web/b2b-storefront/src/lib/cn-catalog/shell-cart.tsx:14) solo lee `cn_shell_cart_v2`. El carrito anterior usa `cn_hvac_shell_cart_v1`; el código nuevo no lo lee, transforma ni elimina.

#### Impacto

Al desplegar el nuevo build, usuarios con carrito local previo lo verán vacío; la limpieza/migración tampoco puede auditarse.

#### Recomendación

Implementar migración idempotente de handles v1 a `{variantId, productId, handle, quantity}`, conservar el v1 hasta confirmar éxito y probar con localStorage real/corrupto/duplicado.

#### Relación con documentación

**Refuta** Fase 4, líneas 12–13.

---

### AUD-011 — Rendimiento y escalabilidad: lecturas completas y N+1

- **Severidad:** medio
- **Área:** storefront / rendimiento

#### Hechos observables

- Filtrar por categoría descarga y mapea los 498 productos y después filtra en memoria.
- Una categoría padre ejecuta llamadas por cada hijo y vuelve a descargar el catálogo agregado.
- `getMedusaCatalogProductsByHandles` hace una llamada Store API por cada handle, hasta 20 en `/api/catalog/products`.
- Quick-order descarga el catálogo completo para resolver tokens.

#### Impacto

Con 498 productos puede funcionar por caché, pero una invalidación global genera ráfagas de llamadas y aumenta latencia. Los eventos invalidan tags globales con frecuencia.

#### Recomendación

Usar filtros server-side por category ID/handle, batch de IDs/handles cuando la API lo soporte, memoización de una sola lectura por request y métricas p95 de Store API/Next.

#### Relación con documentación

No contradice el mínimo funcional, pero incumple parcialmente la intención de consultas específicas y representa deuda antes de escalar.

---

### AUD-012 — Variantes múltiples no cumplen la evolución exigida

- **Severidad:** medio
- **Área:** contrato / producto

#### Hecho observable

[catalog-mappers.ts:347](/home/ubuntu/CN_Web/b2b-storefront/src/lib/catalog/catalog-mappers.ts:347) lanza `CatalogContractError` para cualquier producto con más de una variante, aunque `buildDisplay` contiene lógica de precio mínimo.

#### Impacto

Los 498 productos actuales tienen una variante y pasan, pero Marketing no puede añadir una segunda variante sin romper la carga completa del catálogo.

#### Recomendación

Implementar selección explícita en PDP, “Desde” en listados y persistencia del variant elegido antes de permitir variantes múltiples en Admin.

#### Relación con documentación

**Parcial** frente a plan §6.1/§26. No bloquea el conjunto actual, pero sí futuras operaciones normales.

---

## 5. Aspectos verificados como correctos

Para mantener imparcialidad, estos puntos sí están respaldados por evidencia propia:

- 498 productos publicados y 498 variantes activas.
- 498/498 variantes con SKU.
- 498/498 productos con exactamente un PIM activo.
- 0 PIM huérfanos y 0 duplicados.
- Índice único parcial `IDX_pim_info_product_id_unique` aplicado en PostgreSQL.
- 498/498 productos con exactamente una categoría hoja.
- 498/498 productos con imagen/thumbnail utilizable.
- 498/498 productos con enlace de marca; cero enlaces duplicados por producto.
- API PIM devuelve 401 sin autenticación.
- Widget PIM usa SDK autenticado, no `window.fetch`.
- Widget PIM impide guardar antes de sincronizar los datos del servidor, mitigando el incidente de borrado.
- Validadores PIM rechazan claves desconocidas, URLs HTTP, enums inválidos y plazos contradictorios.
- No hay imports runtime directos de `products.json`, `product-details.json` o `taxonomy-counts.json` en el source nuevo de producto.
- `catalog-source.ts` es Medusa-only y rechaza explícitamente `CATALOG_SOURCE=json`.
- `CatalogProduct` mapea estructuralmente 498/498 respuestas Store API sin `CatalogContractError`.
- Páginas PDP, búsqueda, home, quick-order, feed y carrito están conectadas al contrato nuevo en el source.
- El endpoint de revalidación implementa HMAC, tolerancia temporal, allowlist, límites e idempotencia en memoria; el defecto es de configuración/despliegue y persistencia, no ausencia de controles.
- Los dos chequeos TypeScript `--noEmit --incremental false` terminaron con exit 0.

---

## 6. Discrepancias documentación vs realidad

| Claim documental | Verificación | Resultado |
|---|---|---|
| Fase 4: migración automática carrito v1→v2 | Source solo lee `cn_shell_cart_v2` | **Falso** |
| Fase 4: precio carrito = checkout | Source visual divide; Medusa conserva ×100 | **Falso y bloqueante** |
| Fase 5: implementación completa | Subscribers no están en `.medusa`; vars ausentes | **Solo source, no desplegado** |
| Fase 6: `/100` corrige falso positivo | Medusa v2 usa unidad mayor; plan lo prohibía | **Falso** |
| Fase 6: cero sospecha ×100 | 149/149 comparables tienen factor ×100 | **Gate inválido** |
| Fase 7: staging muestra S/ 89 | API/feed del build muestran 8,900 | **Falso positivo del smoke** |
| Fase 7: 14/14 PASS | Comparación substring acepta 8,900 como 89 | **No certifica precio** |
| Fase 7: Merchant IDs `CN-*` aceptables | Plan prohíbe cambio sin aprobación | **Brecha no resuelta** |
| Fase 7: migración completa | Producción `:8000` sigue build JSON | **Falso a nivel producción** |
| Plan §12.3: taxonomía desde ProductCategory | `taxonomy.ts` mantiene todos los datos en código | **No implementado** |
| DoD: scripts destructivos bloqueados/sin secretos | Tres scripts sin guard y credencial Admin literal | **No cumple** |
| DoD: unit/integration/contract/e2e/build pasan | integration modules no existe; build es anterior al source; e2e precio no existe | **No cumple** |
| DoD: cambio ≤30 s / ≤15 min | endpoint 404/500 y subscribers ausentes | **No cumple** |

---

## 7. Gates reproducidos

Fecha/hora de referencia: `2026-09-01 00:49–00:50 UTC`.

| Comando/prueba | Exit / HTTP | Resultado raw relevante | Interpretación auditora |
|---|---:|---|---|
| Backend `npm run test:unit` | 0 | 3 suites, 36 tests PASS | útil para validadores/tags/client; no prueba runtime |
| Storefront `npm run test:unit` | 0 | 2 suites, 14 tests PASS | contiene expectativa monetaria incorrecta |
| `CATALOG_SOURCE=medusa npm run catalog:contract` | 0 | 498/498, 0 ContractError | estructura PASS, semántica precio FAIL |
| `npm run catalog:canary` | 0 | 5/5 PASS | circular: mapper `/100` + JSON |
| `npm run catalog:smoke` contra `:8000` | 1 | 12/14; APIs catálogo/search 404 | producción no migrada |
| Smoke contra `:8001` | 0 | 14/14 PASS | falso positivo de precio; API devuelve 8,900 |
| `npm run catalog:audit` | 0 | 0 blockers, warnings 17/236 | precio PASS inválido por `/100` |
| `npm run catalog:verify` | 0 | 0 blockers | precio PASS inválido por `/100` |
| `npm run test:integration:modules` | 1 | `No tests found` | gate inexistente |
| Backend `npx tsc --noEmit --incremental false` | 0 | sin output | tipos PASS |
| Storefront `npx tsc --noEmit --incremental false` | 0 | sin output | tipos PASS |
| PIM GET sin JWT | HTTP 401 | `Unauthorized` | auth PASS |
| Store API CN-10756 | HTTP 200 | `calculated_amount=8900 PEN` | confirma precio Medusa ×100 |
| `:8001 /api/catalog/products` | HTTP 200 | `catalog_amount=8900` | build staging ×100 |
| `:8000 /api/catalog/products` | HTTP 404 | ruta ausente | build producción antiguo |
| `:8001 /api/internal/catalog/revalidate` sin firma | HTTP 500 | secreto no configurado/válido | endpoint inoperante |
| `:8000 /api/internal/catalog/revalidate` | HTTP 404 | ruta ausente | endpoint no desplegado |
| SQL independiente PIM | lectura | 498, huérfanos 0, duplicados 0 | PASS |
| SQL independiente precio | lectura | 149/149 = JSON×100 | FAIL bloqueante |
| SQL carritos históricos vs precio actual | lectura | ratio 100.00 en 8 líneas comparables | FAIL bloqueante |

### Gates no reproducidos deliberadamente

- `test:integration:http`: crea productos, PIM y una BD efímera; no se ejecutó para respetar la restricción de no escribir en ninguna BD durante esta auditoría.
- Edición real Admin→Storefront: implicaría modificar un producto. Queda como gate obligatorio posterior a las correcciones.
- `npm run build`: habría reemplazado artefactos `.next`/`.medusa`; no se ejecutó en modo auditoría de solo lectura.
- Rollback: no se ejecutó porque modificaría fuente/configuración/runtime.

---

## 8. Riesgos residuales para producción

| Riesgo | Probabilidad | Impacto | Control actual |
|---|---|---|---|
| Checkout 100× superior | alta al desplegar source | crítico | ninguno efectivo |
| Marketing sigue viendo cambios no reflejados | actual | alto | producción JSON |
| Restart publica staging con S/ 8,900 | alta | crítico | solo advertencia documental |
| Build nuevo oculta precio pero checkout cobra ×100 | alta | crítico | tests lo declaran PASS |
| Evento nunca invalida | actual | alto | TTL source, no producción |
| Categoría editada no cambia UI | certeza | alto | taxonomía hardcodeada |
| IDs Merchant cambian | certeza al corte | alto | smoke acepta ambos |
| Carritos v1 desaparecen | alta al corte | medio | migración declarada, no implementada |
| Script accidental modifica/borrar catálogo | media | alto | guard incompleto |
| Credencial Admin expuesta reutilizable | desconocida | alto | literal en script |
| Source no recuperable desde Git | alta | alto | copia parcial sin commits de migración |
| Event Bus local pierde eventos en restart | media | medio/alto | TTL futuro |
| 159 productos afectados por categorías inactivas | alta al dinamizar | medio/alto | UI estática los oculta conceptualmente |

---

## 9. Checklist mínimo y orden seguro antes del corte

### Gate 0 — Contención inmediata

- [ ] No reiniciar `cnweb-storefront` con el build actual.
- [ ] No ejecutar `catalog:reconcile:apply`, seeds, scripts SQL directos ni división masiva.
- [ ] Suspender checkout o productos `buy_now` hasta corregir el pricing, si el nuevo build pudiera exponerse públicamente.
- [ ] Rotar la credencial Admin presente en `audit-api.js` y la clave ALTCHA hardcodeada.
- [ ] Capturar backup consistente de PostgreSQL y artefactos actuales antes de reparar.

### Gate 1 — Corregir semántica y datos de precio

- [ ] Aprobar una tabla autoritativa `variant_id/SKU → PEN esperado` para las 149 variantes.
- [ ] Determinar los price IDs tocados el 2026-08-31 23:32 UTC y excluir reglas/listas no afectadas.
- [ ] Corregir mediante workflows/API Medusa con importe en unidad mayor.
- [ ] Revisar separadamente USD; no aplicar una división ciega a todas las filas históricas.
- [ ] Eliminar `penAmountFromJson(price * 100)`.
- [ ] Convertir `medusaAmountToMajor` en identidad o eliminarlo.
- [ ] Eliminar `/100` de `audit-catalog-cutover.ts` y `verify-catalog-cutover.ts`.
- [ ] Actualizar fixtures: `calculated_amount: 89` debe mapear a `89`.
- [ ] Gate: 149/149 Store API raw = tabla aprobada, sin factor 100.
- [ ] Gate de carrito aislado: PDP = API catálogo = cart line = checkout.

### Gate 2 — Completar fuente única

- [ ] Implementar repositorio de `ProductCategory` y árbol dinámico.
- [ ] Sustituir taxonomía estática en nav, mobile drawer, búsqueda, home, store, metadata y sitemap.
- [ ] Mantener en código solo aliases/hubs visuales aprobados.
- [ ] Resolver las 17 categorías inactivas y sus 159 productos.
- [ ] Añadir gate que edite nombre/estado/rank de una categoría canaria y compruebe todas las superficies.

### Gate 3 — Compatibilidad comercial y carrito

- [ ] Aprobar política de IDs Merchant/GA4.
- [ ] Preservar `gla_*` si se requiere continuidad y testear igualdad exacta en las 149 filas.
- [ ] Implementar migración idempotente `cn_hvac_shell_cart_v1` → `cn_shell_cart_v2`.
- [ ] Probar carritos v1 válidos, corruptos, duplicados y handles retirados.
- [ ] Probar `quote_only`, sin stock, lead-time y precio cero.

### Gate 4 — Eventos y secretos

- [ ] Generar secreto HMAC de 32+ bytes y almacenarlo fuera del repo.
- [ ] Configurar `REVALIDATE_SECRET` en ambos procesos y URL en backend.
- [ ] Incorporar variables a mecanismo de despliegue/PM2 sin exponerlas en logs.
- [ ] Construir backend y comprobar subscribers dentro del artefacto.
- [ ] Evaluar Redis Event Bus/cola persistente para producción.
- [ ] Probar evento product, price, inventory, category y PIM con logs/eventId.
- [ ] Probar replay, firma inválida, timestamp vencido y fallback TTL.

### Gate 5 — QA no circular

- [ ] Arreglar smoke para parsear JSON/HTML y comparar números exactos.
- [ ] Añadir test que falle para `8900` cuando se espera `89`.
- [ ] Crear pruebas `integration:modules` reales o retirar el gate engañoso.
- [ ] Ejecutar PIM HTTP integration en BD efímera aislada.
- [ ] Añadir e2e Admin→Store API→PDP→cart→feed→sitemap.
- [ ] Verificar los 498 productos y no solo cinco canarios.
- [ ] Registrar commit SHA, BUILD_ID y checksums en resultados.

### Gate 6 — Build y despliegue coordinado

- [ ] Incorporar todo el source a Git; el working deployment debe corresponder a un commit.
- [ ] Construir backend y storefront desde ese commit en staging limpio.
- [ ] Confirmar que ningún source sea posterior al build.
- [ ] Ejecutar unit, integration, contract, canary, smoke exacto, e2e y `next start`.
- [ ] Editar un canario en Admin y confirmar propagación ≤30 s sin build/restart.
- [ ] Confirmar fallback ≤15 min deshabilitando controladamente un evento en staging.
- [ ] Desplegar primero backend/eventos, después storefront, con entorno actualizado.
- [ ] Solo entonces reiniciar PM2 y repetir los gates contra `:8000`.
- [ ] Observar 7–14 días antes de retirar snapshots de rollback.

---

## 10. Archivos prioritarios para la corrección futura

### Bloque precio

- [catalog-mappers.ts](/home/ubuntu/CN_Web/b2b-storefront/src/lib/catalog/catalog-mappers.ts)
- [catalog-mappers.unit.spec.ts](/home/ubuntu/CN_Web/b2b-storefront/src/lib/catalog/__tests__/catalog-mappers.unit.spec.ts)
- [reconcile-catalog-cutover.ts](/home/ubuntu/CN_Web/b2b-backend/apps/backend/src/scripts/reconcile-catalog-cutover.ts)
- [audit-catalog-cutover.ts](/home/ubuntu/CN_Web/b2b-backend/apps/backend/src/scripts/audit-catalog-cutover.ts)
- [verify-catalog-cutover.ts](/home/ubuntu/CN_Web/b2b-backend/apps/backend/src/scripts/verify-catalog-cutover.ts)
- [catalog-smoke-canary.ts](/home/ubuntu/CN_Web/b2b-storefront/scripts/catalog-smoke-canary.ts)
- [catalog-smoke-staging.ts](/home/ubuntu/CN_Web/b2b-storefront/scripts/catalog-smoke-staging.ts)

### Bloque taxonomía

- [taxonomy.ts](/home/ubuntu/CN_Web/b2b-storefront/src/lib/cn-catalog/taxonomy.ts)
- [store category page](</home/ubuntu/CN_Web/b2b-storefront/src/app/[countryCode]/(main)/store/[...slug]/page.tsx>)
- [sitemap.ts](/home/ubuntu/CN_Web/b2b-storefront/src/app/sitemap.ts)
- [home template](/home/ubuntu/CN_Web/b2b-storefront/src/modules/home/templates/index.tsx)
- [navigation](/home/ubuntu/CN_Web/b2b-storefront/src/modules/layout/templates/nav/index.tsx)
- [mobile drawer](/home/ubuntu/CN_Web/b2b-storefront/src/modules/layout/components/amazon-side-drawer.tsx)
- [search bar](/home/ubuntu/CN_Web/b2b-storefront/src/modules/layout/components/search-bar/index.tsx)

### Bloque eventos/despliegue

- [catalog-revalidation-client.ts](/home/ubuntu/CN_Web/b2b-backend/apps/backend/src/lib/catalog-revalidation-client.ts)
- [catalog-core-revalidation.ts](/home/ubuntu/CN_Web/b2b-backend/apps/backend/src/subscribers/catalog-core-revalidation.ts)
- [catalog-price-revalidation.ts](/home/ubuntu/CN_Web/b2b-backend/apps/backend/src/subscribers/catalog-price-revalidation.ts)
- [catalog-inventory-revalidation.ts](/home/ubuntu/CN_Web/b2b-backend/apps/backend/src/subscribers/catalog-inventory-revalidation.ts)
- [catalog-pim-revalidation.ts](/home/ubuntu/CN_Web/b2b-backend/apps/backend/src/subscribers/catalog-pim-revalidation.ts)
- [revalidate route](/home/ubuntu/CN_Web/b2b-storefront/src/app/api/internal/catalog/revalidate/route.ts)
- [revalidate handler](/home/ubuntu/CN_Web/b2b-storefront/src/lib/catalog/catalog-revalidate-handler.ts)
- [ecosystem.config.cjs](/home/ubuntu/CN_Web/ecosystem.config.cjs)

### Bloque carrito/identidad

- [shell-cart.tsx](/home/ubuntu/CN_Web/b2b-storefront/src/lib/cn-catalog/shell-cart.tsx)
- [legacy shell cart](/home/ubuntu/CN_Web/b2b-storefront/src/lib/hvac-catalog/shell-cart.tsx)
- [cart data actions](/home/ubuntu/CN_Web/b2b-storefront/src/lib/data/cart.ts)
- [product template](/home/ubuntu/CN_Web/b2b-storefront/src/modules/products/templates/hvac-product.tsx)
- [catalog-present.ts](/home/ubuntu/CN_Web/b2b-storefront/src/lib/catalog/catalog-present.ts)
- [Google Merchant feed](/home/ubuntu/CN_Web/b2b-storefront/src/app/api/feed/google-merchant/route.ts)

### Bloque seguridad/scripts

- [audit-api.js](/home/ubuntu/CN_Web/b2b-backend/apps/backend/src/scripts/audit-api.js)
- [b2b-seed.ts](/home/ubuntu/CN_Web/b2b-backend/apps/backend/src/scripts/b2b-seed.ts)
- [delete-shorts.ts](/home/ubuntu/CN_Web/b2b-backend/apps/backend/src/scripts/delete-shorts.ts)
- [activate-categories.ts](/home/ubuntu/CN_Web/b2b-backend/apps/backend/src/scripts/activate-categories.ts)
- [legacy-script-guard.ts](/home/ubuntu/CN_Web/b2b-backend/apps/backend/src/scripts/lib/legacy-script-guard.ts)
- [backend middlewares](/home/ubuntu/CN_Web/b2b-backend/apps/backend/src/api/middlewares.ts)
- [storefront ALTCHA util](/home/ubuntu/CN_Web/b2b-storefront/src/lib/util/altcha.ts)

---

## 11. Decisión de corte

### Veredicto: **NO APTO**

No se autoriza técnicamente un `pm2 restart cnweb-storefront` como acción de corte en el estado auditado. Los bloqueantes mínimos son:

1. reparar la escala monetaria en datos y código;
2. validar carrito/checkout con igualdad exacta;
3. construir y desplegar subscribers con secretos correctos;
4. sustituir taxonomía hardcodeada;
5. preservar o aprobar IDs Merchant;
6. corregir gates falsos y producir un build trazable;
7. ejecutar un canario real Admin→todas las superficies.

Una vez completados, debe repetirse esta auditoría contra el artefacto exacto de producción, no contra el source suelto ni contra un puerto de staging con build diferente.

---

## 12. Integridad del informe

- No se modificó ningún producto, precio, categoría, PIM, inventario, carrito, proceso PM2 ni configuración.
- No se ejecutó ningún seed ni script de reconciliación en modo `apply`.
- Las únicas escrituras adicionales fueron los dos JSON de reporte que generan obligatoriamente los gates oficiales y este informe Markdown solicitado.
- Los secretos detectados no se reproducen en el informe.
- Los hallazgos combinan inspección de source, artefacto compilado, estado de proceso, HTTP, Store API, PostgreSQL, timestamps y tests; ninguna conclusión bloqueante depende solo de documentos `FASE-*`.
