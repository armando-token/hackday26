# Plan de reconciliación derivado de la auditoría dry-run

**Fecha:** 2026-08-31
**Fuente:** `audit-cutover-20260831211031..json`
**Precedencia acordada:** el catálogo vigente en Next.js (`products.json`) es la
verdad de negocio. Medusa se corrige para coincidir con él, no al revés.

---

## Resultado global

| | Gates |
|---|---:|
| Pasan | 11 |
| Fallan (bloqueantes) | 3 |
| Advertencias | 2 |
| Errores de ejecución | 0 |

**Paridad estructural perfecta:** 498 productos en ambas fuentes, 0 handles que
existan solo en una. 498/498 con marca, variante, SKU, imagen y exactamente 1
registro PIM. 149/149 `buy_now` con precio PEN. 0 precios con sospecha de
factor x100.

El alcance de la reconciliación es pequeño y está completamente identificado.

---

## Hallazgo 1 — Divergencia de precio en un único producto

En todo el catálogo hay **una sola** discrepancia de precio:

| Handle | JSON | Medusa | Ratio |
|---|---:|---:|---:|
| `sensores-con-punta-de-metal` (CN-10756) | 89.00 | 283.20 | 3.182 |

El ratio no corresponde a un error de unidades (no es 100 ni 0.01), así que es
un cambio deliberado de alguien, no un defecto de migración.

**Requiere decisión comercial.** El plan maestro (sección 13.4) fijaba como
criterio de aceptación que ninguna superficie mostrara 89.00; la precedencia
acordada en esta sesión apunta a lo contrario. Es la única contradicción real
entre ambos criterios y afecta a un solo producto.

## Hallazgo 2 — Precio PEN duplicado

La misma variante `CN-10756` tiene **dos filas de precio PEN** de 283.20 más una
en USD. Es la única variante de las 498 en esa situación.

**Riesgo:** un precio duplicado en la misma moneda y región puede volver no
determinista el `calculated_price`, que tras el corte será el valor del que
depende todo el storefront.

**Acción:** eliminar la fila redundante mediante la API de precios de Medusa,
dejando exactamente una por moneda.

## Hallazgo 3 — Nueve productos sin categoría hoja canónica

El gate exige exactamente 1 categoría hoja por producto. Fallan 9, en dos grupos.

### 3.a — Siete reclasificaciones aplicadas solo al JSON

Corresponden exactamente a los ítems reubicados el 2026-08-21 (sección AAA del
historial). El cambio se aplicó al JSON pero en Medusa **nunca se eliminó la
categoría antigua**, de modo que conservan la vieja y la nueva simultáneamente.

| Ítem | Hoja correcta (JSON) | Hoja obsoleta a retirar |
|---|---|---|
| CN-11405 (TT18 4G) | `loggers-cadena-frio` | `temperatura-termopar-rtd` |
| CN-11451 (TZ-BT06) | `loggers-cadena-frio` | `temperatura-termopar-rtd` |
| CN-11480 (King KBS) | `unit-heaters` | `presion-proceso` |
| CN-11563 (SmartWave) | `radiante-infrarrojo` | `nivel` |
| CN-13251 (cartucho c/ sensor) | `cartuchos` | `temperatura-termopar-rtd` |
| CN-13297 (manguera MPI) | `sistemas-llave-en-mano` | `resistencias-proceso`, `presion-proceso` |
| CN-13370 (NaK MPI) | `presion-proceso` | `transmisores` |

También conservan la categoría raíz antigua (`sensores-transmisores`), que debe
retirarse junto con la hoja.

> CN-13297 es el único caso donde **ninguna** de sus dos hojas actuales en Medusa
> es la correcta: hay que retirar ambas y asignar `sistemas-llave-en-mano`.

### 3.b — Dos productos sin ninguna hoja

Coinciden con los que el plan maestro ya señalaba (sección 2.7.2):

| Ítem | Estado actual | Hoja a asignar (JSON) |
|---|---|---|
| CN-12929 (cubos hidropónicos) | solo raíz `otros` | `sustratos-hidroponicos` |
| CN-13472 (Horner simulador) | solo raíz `otros` | `accesorios-entrenamiento` |

## Hallazgo 4 — Categorías destino inactivas

Cuatro de las hojas de destino existen pero están desactivadas, por lo que
asignarlas sin activarlas dejaría los productos invisibles:

| Categoría | `is_active` |
|---|---|
| `accesorios-entrenamiento` | false |
| `sistemas-llave-en-mano` | false |
| `sustratos-hidroponicos` | false |
| `unit-heaters` | false |

### Categoría duplicada

Existen a la vez `unit-heaters` (inactiva, la que usa el JSON) y
`unit-heaters-industriales` (activa, la que usa Medusa). Es un par duplicado que
requiere decidir cuál es la canónica antes de reconciliar CN-11480.

## Hallazgo 5 — Dos registros PIM huérfanos

| `pim_info.id` | `product_id` (inexistente) |
|---|---|
| `01KW0S70E0XZMGRT5HD2B2AQTS` | `prod_01KW0S70APRCA1JHQ29HC0V2FF` |
| `01KW0S70FRRWPZJGE5966JFXN8` | `prod_01KW0S70E6JR9W6QNZASGPBXVX` |

Explican la diferencia entre 500 registros PIM y 498 productos. Deben eliminarse
antes de crear el índice único parcial de la Fase 1, tras confirmar que los
productos se borraron intencionalmente.

## Hallazgo 6 — `lead_time_days` incoherente

Un registro PIM (`prod_01M01FKQEXS5Z6GES9D94ZEJ48`) declara
`availability_mode = lead_time` pero `lead_time_days = null`, lo que viola la
regla de la sección 8.3. Es además el único producto con `lead_time` en toda la
base, frente a 77 productos que el JSON marca como `backorder`.

Esto anticipa el trabajo de traducción de enums de la sección 14.3
(`JSON backorder -> PIM lead_time`), que sigue pendiente en su totalidad.

## Hallazgo 7 — La galería de imágenes no existe en Medusa (detectado en Fase 1)

Detectado al validar el contrato de la Store API, no por la auditoría inicial:
el gate solo comprobaba que existiera *alguna* imagen principal, y el `thumbnail`
la satisfacía.

| Fuente | Imágenes |
|---|---:|
| Tabla `image` de Medusa | **0** |
| `thumbnail` en `product` | 498 / 498 |
| Imágenes en `products.json` | **708** |
| Productos con más de 1 imagen en el JSON | **80** |

Los 498 productos tienen miniatura, pero la tabla de imágenes está
completamente vacía, de modo que `*images` devuelve un array vacío para todo el
catálogo.

**Impacto:** cortar a Medusa sin corregirlo eliminaría la galería de fotografías
en la ficha de producto de los 80 productos que hoy tienen varias imágenes, y
dejaría a los 418 restantes dependiendo solo del `thumbnail`. Sería una
regresión visible para el cliente.

**Acción:** importar las 708 referencias del JSON a la tabla `image` de Medusa
mediante la API de productos, preservando el orden (`rank`) del JSON. Los
archivos WebP ya existen en disco y se sirven por Nginx, así que solo faltan las
referencias.

---

## Orden de aplicación propuesto

Todo mediante servicios y workflows de Medusa. Sin SQL de escritura.

0. Importar las 708 imágenes del JSON a la tabla `image` (hallazgo 7).
1. Eliminar los 2 registros PIM huérfanos.
2. Eliminar la fila de precio PEN duplicada de CN-10756.
3. Resolver la categoría duplicada `unit-heaters` / `unit-heaters-industriales`.
4. Activar las categorías de destino que correspondan.
5. Corregir las asignaciones de categoría de los 9 productos.
6. Aplicar la decisión de precio sobre CN-10756.
7. Corregir `lead_time_days` y traducir los enums de disponibilidad.
8. Reejecutar la auditoría y exigir 0 gates bloqueantes fallidos.

---

## Decisiones aprobadas (2026-08-31)

Aprobadas explícitamente por el responsable del proyecto. Rigen toda la
reconciliación y sustituyen cualquier criterio contrario del plan maestro.

### D1 — Precio de CN-10756: **S/ 89.00**

Prevalece el JSON por ser el precio que el cliente ve hoy en producción. Se
corrige Medusa de 283.20 a 89.00.

> **Desviación explícita del plan maestro.** La sección 13.4 fijaba como
> criterio de aceptación que ninguna superficie mostrara 89.00 y que todas
> mostraran 283.20. Esa condición queda invertida por esta decisión. El criterio
> real de aceptación pasa a ser: **todas las superficies muestran S/ 89.00 y
> ninguna muestra 283.20**. La verificación de coherencia
> PDP = tarjeta = carrito = checkout = Store API se mantiene intacta; solo cambia
> el valor esperado.

### D2 — Categoría canónica: **`unit-heaters`**

Evidencia decisiva: `/pe/store/calefaccion-electrica/unit-heaters` responde
HTTP 200 y está en el sitemap, mientras `unit-heaters-industriales` responde 404
y no aparece indexada. Medusa tenía los 7 productos bajo una categoría sin
presencia pública.

Acción: activar `unit-heaters`, trasladar los 7 productos y retirar la duplicada
`unit-heaters-industriales`. No se requiere redirección 301 porque la URL viva se
conserva.

### D3 — PIM huérfanos: **soft delete**

Se marcan como eliminados (`deleted_at`) en lugar de borrarse físicamente. Es
reversible y suficiente para el índice único parcial
(`WHERE deleted_at IS NULL`) de la Fase 1.

### D4 — Inventario: **el `inStock` del JSON**

No se inventan cantidades ni se conserva el valor artificial 50. Se aplican los
251 productos con stock y los 247 en cero que declara el catálogo vigente.

### D5 — Disponibilidad: **`lead_time` sin plazo obligatorio**

Se relaja la regla de la sección 8.3: `lead_time_days` puede ser nulo. Cuando lo
sea, la interfaz muestra **"Consultar plazo"**, nunca un número inventado. Los 77
`backorder` del JSON se traducen a `lead_time` sin asignar días.

Esto resuelve además el hallazgo 6, que deja de ser una incoherencia.
