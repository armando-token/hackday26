# Incidente 01 — Pérdida de datos PIM por widget desincronizado

Fecha: 2026-08-31 ~21:59 UTC
Fase: 1 (API + Widget Admin PIM)
Severidad: **Crítica** (pérdida de datos en producción)
Estado: **Resuelto y verificado**

## Qué pasó

Durante la prueba de aceptación en navegador del widget PIM reescrito, el widget
mostró todos los campos vacíos pese a que la API devolvía los datos correctos.
La prueba incluía un guardado, y al pulsar "Guardar" el widget envió el
formulario vacío, sobrescribiendo el registro real del producto
`prod_01M01FKJJF0JG12ZAK5YMSV9MZ` (CN-10756).

Datos perdidos en esa fila:

- `item_number`: `CN-10756` → vacío
- `oem_brand`: `Novus` → vacío
- `mfr_model`: `Serie SMT (Punta de Metal)` → `PRUEBA-E2E-WIDGET`
- `specs`: 16 especificaciones → 0

## Causa raíz

`useQuery` estaba configurado con `placeholderData: keepPreviousData`. En un
formulario con alcance por producto eso marca la consulta como exitosa con
contenido que no corresponde al producto abierto; el efecto de sincronización
volcaba entonces `FORM_VACIO` al formulario y fijaba la firma base a vacío.

En carga directa de la página el formulario quedaba vacío; en navegación SPA
(donde sí había datos previos en caché) se veía correcto. Esa diferencia de
comportamiento fue la pista que permitió aislar la causa.

El agravante no fue el fallo de carga en sí, sino que **el widget permitía
guardar un formulario que nunca se había poblado desde el servidor**, lo que
convierte cualquier fallo de sincronización en un borrado silencioso.

## Recuperación

Se restauró desde el respaldo verificado previo al corte
`backups/medusa_pre_cutover_20260831_210007.dump`:

1. Restauración de la tabla `pim_info` en una base temporal aislada
   (`pim_restore`), sin tocar producción.
2. Extracción de los 16 campos originales de la fila afectada.
3. Reescritura mediante la API Admin (`PUT`), no con SQL directo, respetando la
   regla del plan maestro.
4. Verificación en base: `CN-10756`, `Novus`, `Serie SMT (Punta de Metal)`,
   16 specs.
5. Eliminación de la base temporal.

## Verificación de alcance

Se comparó el hash de contenido de las 498 filas PIM activas contra el respaldo.
Resultado: **sin diferencias**. Las dos únicas filas ausentes respecto al
respaldo son los huérfanos soft-eliminados de forma deliberada en la Fase 1
(decisión aprobada D3). Ningún otro producto resultó afectado.

## Correcciones aplicadas

En `src/admin/widgets/product-pim-widget.tsx`:

1. Eliminado `placeholderData: keepPreviousData`, con `staleTime: 0`.
2. Añadida la bandera `sincronizado`, que solo pasa a verdadera cuando el
   formulario se puebla desde una respuesta real del servidor. El envío y el
   botón de guardar quedan bloqueados mientras sea falsa.
3. La bandera se reinicia al cambiar de producto, para que el formulario de un
   producto no pueda escribirse sobre otro.

La segunda corrección es la importante: hace estructuralmente imposible que un
fallo de carga se traduzca en un borrado, con independencia de su causa.

## Verificación posterior

Prueba en navegador con caché desactivada: carga directa muestra los datos
correctos, persisten tras dos recargas completas, y la salvaguarda del botón de
guardado funciona. `tsc` y `medusa build` en verde.

## Lecciones para el runbook (Fase 7)

- Las pruebas de aceptación con escritura no deben ejecutarse contra producción.
  Falta un entorno de staging; queda como requisito antes de la Fase 6.
- Todo formulario de edición del Admin debe llevar la salvaguarda de "no
  guardar sin carga confirmada". Aplicar el mismo patrón a futuros widgets.
- El respaldo previo al corte cumplió su función: sin él la pérdida habría sido
  irreversible. Mantener la política de respaldo verificado antes de cada fase.
- Tras cada `medusa build` y reinicio, las pestañas abiertas del Admin quedan con
  chunks obsoletos y fallan con "Failed to fetch dynamically imported module".
  Es esperado y se resuelve recargando; conviene avisar a Marketing en el
  procedimiento de despliegue.
