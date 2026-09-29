# Auditoría técnica de migración del catálogo Control Nautas

Fecha de corte: 16 de agosto de 2026  
Documento base: /home/ubuntu/CN_Web/extra/wc-product-export-15-8-2026-1786846848839.csv  
Catálogo visible auditado: /home/ubuntu/CN_Web/b2b-storefront/src/lib/cn-catalog/data/products.json  
Storefront probado: instancia local en puerto 8000  
Exclusión solicitada: EMS Kontrol

## 1. Dictamen ejecutivo

La migración consiguió trasladar los 400 productos que estaban publicados en el CSV antiguo: no falta ningún producto publicado y las 610 imágenes heredadas de esos productos responden correctamente. Los precios visibles también coinciden con el CSV si se usa el precio rebajado cuando existe.

El catálogo no puede certificarse como técnicamente correcto en su estado actual. La causa principal es un proceso posterior de enriquecimiento que añadió valores genéricos por categoría, inferidos desde el título o copiados de otros tipos de producto. Ese proceso afectó 387 de los 400 productos heredados y añadió 2.177 campos que no existían en el CSV. Además modificó 168 valores que sí existían; 84 modificaciones redujeron opciones o información del dato original y 113 tienen baja similitud con él.

La revisión dirigida contra documentación oficial confirmó errores materiales en potencia, tensión, salidas, precisión, compatibilidad, rango de medición, montaje y presentación comercial. Por seguridad comercial y técnica, los campos añadidos sin fuente deben considerarse no verificados hasta que un responsable los valide contra hoja de datos del fabricante.

También existe un incidente operativo crítico: PostgreSQL está detenido, Medusa no escucha en el puerto 9000 y PM2 mantiene el backend en un ciclo de reintentos aunque lo muestra temporalmente como “online”. El storefront sigue mostrando las fichas porque usa el JSON local, no el catálogo administrado en Medusa. Esto demuestra una divergencia real entre la fuente visible y el PIM/backend.

Estado recomendado: NO aprobar publicación abierta ni uso del catálogo como referencia de ingeniería hasta completar las correcciones P0 y P1 de este reporte.

## 2. Alcance y método

Se compararon los siguientes elementos:

- Las 401 filas del CSV de WooCommerce.
- Las 523 fichas del JSON que consume el storefront.
- Cobertura por ID de WooCommerce, título, marca, SKU, modelo, precio, disponibilidad, descripción, atributos, categoría e imágenes.
- Existencia física, respuesta HTTP y tipo MIME de las imágenes.
- Respuesta HTTP de las 523 páginas de producto y de las 53 rutas de subcategoría que contienen productos.
- Código de ETL, scripts de enriquecimiento y plantilla visible de ficha.
- Una muestra de afirmaciones de alto riesgo contra fuentes oficiales de ROCKWOOL, NOVUS, Tzone, King Electric y AKCP.
- Estado operativo de PM2, PostgreSQL, Medusa y puertos locales.

EMS Kontrol fue excluido de las conclusiones de migración. El CSV antiguo no contiene EMS. El catálogo actual contiene 113 productos EMS, pero no se evaluó su equivalencia con la web antigua. Los 10 recursos EMS que devuelven 404 se registraron durante la prueba global, pero no cuentan como defecto dentro del alcance solicitado.

## 3. Inventario y cobertura

| Métrica | Resultado | Evaluación |
|---|---:|---|
| Filas totales del CSV | 401 | Una fila no estaba publicada |
| Productos antiguos publicados | 400 | Universo esperado |
| Productos EMS en el CSV | 0 | Coherente con la explicación recibida |
| Productos actuales totales | 523 | Incluye 113 EMS y 10 NOVUS añadidos |
| EMS actuales excluidos | 113 | Fuera de alcance |
| Productos actuales no EMS | 410 | 400 heredados + 10 adicionales |
| Productos publicados antiguos encontrados por ID | 400/400 | Correcto |
| Productos publicados antiguos faltantes | 0 | Correcto |
| Fila antigua no migrada | ID 13276 | Publicado = -1; no es un faltante |
| Productos no EMS añadidos sin ID WooCommerce | 10 | Requieren decisión y corrección |

Conclusión de cobertura: la migración tuvo éxito para el inventario publicado. El único producto antiguo ausente, ID 13276 “Calentador de Banda Tubular MPI Morheat”, estaba marcado como no publicado y no debe contarse como pérdida.

## 4. Hallazgos por severidad

### P0-01 — Backend Medusa fuera de servicio

Evidencia observada:

- El puerto 9000 rechaza conexiones.
- PostgreSQL no escucha en 5432.
- El contenedor medusa-db está en estado Exited (0) desde hace aproximadamente 22 horas al momento de la prueba.
- El log repite ECONNREFUSED 127.0.0.1:5432 y termina con “Failed to connect to the database”.
- PM2 había acumulado 11 reinicios y mostraba el proceso “online” mientras Medusa todavía estaba intentando arrancar.

Impacto:

- El panel administrativo, API Store y PIM no están disponibles.
- Inventario, precios, clientes, pedidos y edición administrativa quedan desconectados.
- La indicación “online” de PM2 no representa disponibilidad real.

Solución:

1. Investigar por qué se detuvo medusa-db antes de iniciarlo: revisar política de reinicio, almacenamiento, apagado del host y logs del contenedor.
2. Configurar restart: unless-stopped para PostgreSQL y healthcheck con pg_isready.
3. Hacer que Medusa dependa de la condición healthy de la base de datos.
4. Añadir healthcheck HTTP real para Medusa y hacer que PM2 solo marque listo después de responder.
5. Alertar por puerto/API, no únicamente por estado del proceso.
6. Después de recuperar PostgreSQL, ejecutar una auditoría de solo lectura de conteos, handles, PIM, precios, categorías y vínculos contra el JSON visible.

Criterio de cierre: PostgreSQL healthy, API 9000 estable durante al menos 24 horas, cero reinicios inesperados y consulta pública de productos exitosa.

### P0-02 — Dos fuentes maestras divergentes

La ficha primero busca el producto en products.json. Si lo encuentra, renderiza HvacProductTemplate y no consulta Medusa. Los 523 handles están en ese JSON; por eso todas las fichas continuaron respondiendo 200 aun con el backend caído.

Impacto:

- Un cambio realizado en Medusa Admin puede no aparecer en la web.
- Un cambio directo en products.json puede no existir en Medusa.
- No hay garantía de sincronización de precio, stock, textos, imágenes o PIM.
- El endpoint estático product-details.json tampoco se consume desde la ficha visible.
- Las hojas técnicas/PDF registradas en el PIM no aparecen en la plantilla local.

Solución recomendada:

- Elegir Medusa/PIM como única fuente maestra y consultar sus datos desde el storefront; o
- Generar products.json exclusivamente como artefacto versionado de Medusa/PIM, con build fallido si existen diferencias.
- Prohibir la edición manual paralela.
- Añadir hash/version de catálogo y prueba de paridad en CI.

Criterio de cierre: un cambio de prueba en PIM se refleja en la ficha visible mediante un único flujo documentado y la comparación automática arroja cero diferencias no autorizadas.

### P1-01 — Especificaciones añadidas sin trazabilidad

Resultados cuantitativos sobre los 400 productos heredados:

| Métrica | Resultado |
|---|---:|
| Productos con al menos un campo añadido | 387 |
| Campos añadidos que no existían en el CSV | 2.177 |
| Productos con valores existentes modificados | 76 |
| Valores existentes modificados | 168 |
| Modificaciones con baja similitud al original | 113 |
| Modificaciones que reducen opciones/información original | 84 |
| Productos con al menos un atributo antiguo ausente | 53 |
| Atributos antiguos ausentes | 84 |
| Productos con señales de campos semánticos duplicados | 243 |
| Grupos potencialmente contradictorios | 416 |

Estos números no significan que los 2.177 campos añadidos sean necesariamente falsos. Significan que no poseen evidencia en la fuente de migración y el código no registra fabricante, documento, página, versión ni fecha de verificación. No son certificables.

Causa raíz:

- Hay al menos 334 asignaciones/reglas con valores literales en los scripts enrich_*_products.js.
- Varias reglas usan un valor por defecto de categoría cuando falta el valor real.
- Algunas infieren el tipo por una letra contenida en el título. Por ejemplo, la clasificación de termopares busca K, J o T con includes, lo cual puede coincidir con una letra de marca o de otra palabra.
- Las reglas de humedad y temperatura escriben el mismo rango, precisión, alimentación y salida para fabricantes/modelos distintos.
- Las reglas de accesorios escriben material, conexión, compatibilidad y presión máximos genéricos.

Solución inmediata:

1. Marcar todos los campos añadidos como unverified.
2. Ocultarlos del storefront si no tienen fuente.
3. Restaurar provisionalmente el valor heredado cuando el enriquecimiento lo reemplazó, salvo que exista una fuente oficial que pruebe la corrección.
4. Eliminar los fallbacks técnicos por categoría. Un dato desconocido debe quedar vacío o mostrar “Consultar ficha técnica”, nunca un valor plausible inventado.
5. Conservar normalización de unidades únicamente cuando sea reversible y tenga prueba automatizada.

### P1-02 — Errores técnicos confirmados con fuentes oficiales

#### Caso A: NOVUS N2000, ID 10839

La ficha actual contiene simultáneamente:

- “Salidas de Relé: 2x SPDT + 2x SPST”.
- “Salidas: 1 Relé SPST + 1 Pulso SSR”.
- “Control / Perfil: ... 20 perfiles”.
- “Comunicación: Puerto Micro-USB de Configuración Local”.

NOVUS publica cuatro relés de alarma en la versión base, USB 2.0, RS485/Modbus opcional y siete programas de siete segmentos. El campo añadido de un relé y 20 perfiles corresponde a otro equipo o a un perfil genérico.

Fuente oficial: [NOVUS N2000](https://www.novusautomation.com/site/default.asp?Idioma=1&ProdutoID=715305&SecaoID=818294&SubsecaoID=926360&Template=..%2Fcatalogos%2Flayout_produto.asp&TroncoID=608027)

Corrección: conservar campos por variante/modelo, retirar “1 Relé” y “20 perfiles”, y separar USB de RS485 opcional.

#### Caso B: transmisores Tzone, IDs 11417, 11432 y 11441

La web asigna a estos productos “±1.8% RH / ±0.2°C (Calibración Traceable NIST)”, alimentación 12–30 VCC y salidas analógicas/digitales genéricas.

La documentación oficial indica:

- THT02: 5–24 VDC, RS485 Modbus, aproximadamente ±0.2°C y ±2% RH.
- THT03R: 5–36 VDC, RS485, rango típico -40 a +85°C, humedad 5–95% RH y precisión publicada de ±0.3°C / ±2% RH en el rango principal.
- THT03C: salida 4–20 mA; no debe heredar una salida RS485/analógica combinada genérica.
- El título de THT03R afirma +120°C, que contradice el catálogo oficial de +85°C.
- No se encontró soporte oficial para la afirmación NIST mostrada.

Fuentes oficiales: [catálogo Tzone 2024](https://www.tzonedigital.com/Uploads/Download/97a734642ca5413b8e842985f1c9f836.pdf), [THT02 en Tzone](https://www.tzonedigital.com/en/product/details/31.aspx)

Corrección: reemplazar rango, precisión, alimentación y salida modelo por modelo; eliminar la afirmación NIST mientras no exista certificado trazable aplicable al SKU vendido.

#### Caso C: brida NOVUS RHT-P10, ID 12717

El CSV decía que la brida es exclusiva para RHT-P10. El enriquecimiento la convirtió en compatible con RTD Pt100, termopares J/K y lazos 4–20 mA.

NOVUS documenta que el módulo remoto del RHT-P10 se instala en una brida roscada específica, código 8803900210.

Fuente oficial: [manual NOVUS RHT-P10](https://cdn.novusautomation.com/downloads/manual_rht_p10_v30x_e_en.pdf)

Corrección: restaurar compatibilidad exclusiva con RHT-P10 y código de pedido; eliminar compatibilidad genérica.

#### Caso D: King Electric SR, ID 13040

La ficha tiene datos correctos de la serie y, a la vez, campos añadidos que dicen “preensamblado”, longitudes de 15/30 m, enchufe NEMA incluido y clips incluidos.

King Electric publica que SR se vende en bobinas/rollos de 100, 250, 500 o 1.000 ft. Los kits de conexión y clips son accesorios separados. La serie preensamblada es SRP, no SR.

Fuente oficial: [King Electric Model SR](https://king-electric.com/product/model-sr/)

Corrección: retirar datos de SRP/kit de la ficha SR; crear relaciones de accesorios sin afirmar que vienen incluidos.

#### Caso E: NOVUS Power Controller adicionales

Los registros añadidos de 60, 100 y 200 A indican tensiones de 100–480 o 200–600 VAC, además de Modbus en algunos casos.

NOVUS publica para la familia Power Controller 60–200 A una tensión de carga de 180–440 VAC y señales analógicas/potenciómetro. Los modelos oficiales se estructuran como PCW/PCWE.

Fuente oficial: [NOVUS Power Controller 60–200 A](https://www.novusautomation.com/en/product/relays-and-ssr/60-to-200-ampere)

Corrección: usar nombre/modelo PCW o PCWE y especificación por código de pedido; retirar tensión y comunicación no demostradas.

#### Caso F: NOVUS SSR trifásico adicional

La web usa “SSR-3PH-40A”, 48–480 VAC. El modelo oficial es SSR3-4840 y NOVUS publica 40–530 VAC.

Fuente oficial: [manual NOVUS SSR3-4840](https://cdn.novusautomation.com/downloads/manual_ssr_3f_40-90a_v10x_g_en.pdf)

Corrección: cambiar modelo y rango, y asociar el disipador/condiciones de corriente que correspondan.

#### Caso G: termostato King TRF115-005, ID 11504

El título visible dice “0120°F (-1748°C)”. El texto perdió los guiones. Además, la descripción técnica termina en “48.”.

King publica 0–120°F (-17 a 48°C), 25 A a 24/120/208/240 V y 22 A a 277 V.

Fuente oficial: [King Electric TRF115-005](https://king-electric.com/product/trf115-005/)

Corrección: mostrar “0–120°F (-17.8–48.8°C)” y rehacer la oración completa.

#### Caso H: ROCKWOOL ProRox SL 920 NA, ID 10714 — verificación positiva y corrección parcial

La temperatura máxima de 650°C, densidad real de 40 kg/m³, densidad nominal de 3.0 lb/ft³ y reacción al fuego sí coinciden con la ficha norteamericana oficial. No deben revertirse.

La aplicación añadida “Calderas, hornos y alta temperatura” es más amplia que la aplicación oficial descrita para planos verticales/horizontales y aplicaciones industriales intermedias. El título visible también se trunca antes de completar la aplicación.

Fuente oficial: [ROCKWOOL ProRox SL 920 NA](https://rti.rockwool.com/siteassets/tools--documentation/products-industrial/product-data-sheets/english/rti-prorox-sl-920_na_en.pdf)

Corrección: conservar los valores ASTM verificados y cambiar la aplicación a superficies/planos verticales y horizontales, tanques, recipientes o equipos conforme a la documentación aplicable.

### P1-03 — 10 productos NOVUS añadidos con esquema incompleto

Los 10 registros no vienen del CSV, no son EMS y fueron creados por enrich_ctrl_products.js. Las familias son reales, pero las fichas actuales carecen de:

- wcId.
- itemNumber.
- mfrModel.
- priceMode.
- currency.
- imágenes.
- inStock.
- isPurchasable.
- technicalDescription y shortDescription.

Manifestación visible verificada en SSR-4810:

- HTTP 200.
- “Ítem #” vacío.
- “Modelo fab. #” vacío.
- Precio S/ 145.00.
- Estado “Sin stock”.
- Botón “Solicitar cotización”.
- Sin imagen.

Esto mezcla precio fijo con flujo de cotización y stock indefinido.

Productos afectados:

1. novus-ssr-4810
2. novus-ssr-4825
3. novus-ssr-4840
4. novus-ssr-4880
5. novus-ssr-3ph-40a
6. novus-power-controller-60a
7. novus-power-controller-100a
8. novus-power-controller-200a
9. novus-interface-relay-nio-24v
10. novus-interface-relay-nio-220v

Solución:

- Ocultarlos temporalmente o marcarlos draft.
- Decidir si son altas nuevas autorizadas. Si sí, cargarlos mediante el flujo PIM normal con ID interno, SKU, modelo oficial, variante, precio/moneda, disponibilidad, imagen oficial, descripción y fuente.
- No usar un script de enriquecimiento para crear productos.
- Normalizar SSR-3PH-40A al código oficial SSR3-4840.
- Validar precios comerciales con el área de ventas; no provienen del CSV.

### P1-04 — Disponibilidad backorder convertida en “En stock”

El CSV contiene:

- 144 productos con stock = 1.
- 180 con stock = 0.
- 77 con estado backorder.

El JSON convierte los 77 backorder a inStock = true. La plantilla solo distingue booleano y muestra “En stock · Precio vía cotización”.

Impacto: un producto fabricado o suministrado bajo pedido se presenta como físicamente disponible.

Solución:

- Sustituir el booleano por availabilityMode: in_stock, backorder, lead_time, made_to_order, unavailable.
- Migrar los 77 a backorder o made_to_order según validación comercial.
- Mostrar “Disponible bajo pedido” y plazo si existe.
- Reservar “En stock” para inventario confirmado.

### P1-05 — Descripción larga eliminada y texto técnico recortado

Los 400 productos heredados tenían descripción larga. Ninguna de esas descripciones está presente en el objeto que usa la ficha visible. El ETL genera technicalDescription a partir de la descripción corta y la limita a 280 caracteres. Después, la plantilla vuelve a escoger ese resumen.

Resultados:

- Descripciones largas antiguas existentes: 400.
- Descripciones largas visibles actuales: 0.
- Resúmenes con corte evidente: 72.
- Terminan con elipsis: 49.
- Terminan en decimal incompleto: 19.
- Tienen paréntesis sin cerrar: 10.

Ejemplos:

- ID 10714 termina “DENSIDAD LIGERA (3.”
- ID 10864 termina “±1.”
- ID 11023 termina “...de 10.”
- ID 11504 termina “...-17.78°C a 48.”
- ID 11603 termina “...3.8 kW a 34.”

Solución:

- Crear dos campos: technicalSummary y technicalDescription.
- El resumen debe tener 2–3 oraciones completas, sin corte por caracteres.
- La descripción completa debe redactarse como contenido técnico limpio, no como HTML de WordPress.
- Usar un truncador por oración solo en tarjetas, nunca en el H1 ni en la descripción almacenada.
- Incorporar aplicación, selección, limitaciones, instalación y advertencias cuando la fuente oficial las proporcione.
- Añadir enlace a hoja técnica y fecha/versión de fuente.

### P1-06 — Título H1 recortado

La plantilla corta cualquier título mayor de 90 caracteres. Esto afecta 305 de los 400 productos heredados. El H1 visible pierde con frecuencia modelo, rango, potencia, aplicación o certificación.

El título completo sí permanece en metadatos y JSON, pero no en la ficha que lee el usuario.

Solución:

- Mostrar el título completo en H1.
- Crear un displayName breve y revisado para tarjetas/listados.
- No generar displayName mediante slice.
- Mantener modelo, fabricante y variable técnica principal en campos separados.

### P2-01 — Duplicados de producto heredados

Existen tres pares con título idéntico:

- 12959 y 12983: Serie RSR.
- 12965 y 12986: Serie LSR.
- 12977 y 13026: HRSHTV.

Los pares RSR/LSR tienen especificaciones y títulos prácticamente idénticos con handles terminados en -2. El par HRSHTV también comparte una imagen binariamente idéntica.

Solución:

- Confirmar si representan variantes comerciales reales.
- Si no hay diferencia de modelo/SKU, consolidar y redirigir el handle duplicado.
- Si son variantes, convertirlas en variantes de un producto y documentar la diferencia.

### P2-02 — Modelo de fabricante genérico en ID 13099

“W King Electric Calentador de Pared” muestra mfrModel = CN-13099, aunque el título identifica el modelo W.

Solución: mfrModel = W o el código de pedido exacto; mantener CN-13099 solo como número interno.

### P2-03 — Rutas de categoría antiguas en seis productos

Seis registros conservan categoryPath con nodos intermedios que ya no existen en taxonomy.ts:

- 11542 y 11547: otros/ventilacion.
- 11633, 11636 y 11639: otros/ventilacion.
- 12929: otros/cultivo-hidroponico.

Sus categorySlug finales sí existen y las páginas responden, pero la ruta de breadcrumb se detiene antes de la hoja correcta.

Solución: guardar el path canónico completo que usa la taxonomía actual, por ejemplo otros/ventiladores-alta-velocidad, y añadir una prueba que garantice que el último elemento coincida con categorySlug.

### P2-04 — Identificadores internos presentados como números de ítem

Solo 15 de los 400 productos tenían SKU antiguo. En 385 fichas se generó CN-ID y se muestra como “Ítem #”.

Esto es aceptable si Control Nautas adopta formalmente ese número interno. No debe confundirse con SKU de fabricante.

Solución: separar itemNumber interno, sku comercial y mfrModel; etiquetar cada uno con claridad.

## 5. Precios y marcas

### Precios

- 144 productos tienen precio fijo.
- 256 productos heredados son de cotización.
- 109 de los 144 precios fijos usan el precio rebajado del CSV.
- Los 109 coinciden exactamente con ese precio rebajado.
- No se encontró diferencia inexplicada de precio en los 400 productos heredados.

Mejora recomendada: conservar regularPrice y salePrice por separado para mostrar el descuento y sus fechas. El JSON actual solo conserva el precio efectivo.

### Marcas

- 398 marcas coinciden.
- Dos filas antiguas no tenían marca y la migración la derivó: ID 10729 como Control Nautas e ID 12818 como Novus.
- No se encontró una sustitución de marca claramente errónea en la comparación estructural.

## 6. Imágenes

### Resultado de integridad

- Referencias heredadas: 610.
- Archivos faltantes dentro del alcance: 0.
- Respuestas HTTP correctas: 610/610.
- Firmas MIME válidas: 610/610.
- Formatos: 302 JPEG, 158 PNG, 150 WebP.
- Productos sin imagen: 0/400.
- Se conservaron todos los nombres de archivo de las imágenes antiguas.

### Suficiencia y calidad

- 320 productos, el 80%, tienen una sola imagen.
- Solo 80 productos tienen dos o más.
- Entre 552 imágenes cuya dimensión pudo medirse con la utilidad del servidor, 27 imágenes de 23 productos tienen al menos un eje menor de 300 px.
- Hay 12 grupos de archivos binariamente duplicados.
- Se detectó reutilización cruzada de varias imágenes entre Horner XLEe y XLTe. Puede haber imágenes comunes de familia, pero deben revisarse porque son equipos con pantalla/controles distintos.
- El producto 11405 incluye imágenes de 151×123 y 201×135 px.
- El producto 10771 usa una imagen panorámica de 1000×122 px.
- Algunos PNG de termopares tienen altura cercana a 212–287 px y perderán detalle al ampliarse.

Evaluación: la migración de archivos fue exitosa, pero la cobertura visual no es suficiente para un catálogo técnico B2B.

Estándar recomendado:

1. Imagen principal oficial con fondo limpio.
2. Vista posterior/lateral o conexiones.
3. Plano dimensional o diagrama de cableado.
4. Accesorios/variantes cuando aplique.
5. Fotografía de aplicación solo si es del producto correcto.
6. Mínimo recomendado de 1.000 px en el eje principal; evitar menos de 600 px salvo diagramas vectoriales.
7. Registrar fuente/licencia y código de modelo de cada imagen.
8. Comparar perceptualmente imágenes entre productos para evitar asociaciones incorrectas.

## 7. Pruebas de funcionamiento

### Storefront

- Fichas probadas: 523.
- HTTP 200: 523.
- Fallos de ficha: 0.
- Rutas de subcategoría con productos probadas: 53.
- HTTP 200: 53.
- Fallos de subcategoría: 0.

Interpretación: el enrutamiento funciona, pero HTTP 200 no equivale a contenido correcto. Las 10 fichas NOVUS incompletas también devuelven 200.

### Imágenes globales

- Referencias únicas actuales probadas: 723.
- Correctas: 713.
- Fallidas: 10.
- Las 10 fallidas pertenecen a EMS y quedaron fuera de la evaluación de migración.
- Dentro del alcance no EMS heredado: 610/610 correctas.

### Backend

- API Medusa: no disponible.
- Causa raíz inmediata: PostgreSQL detenido.
- Storefront: operativo gracias al catálogo JSON local.

## 8. Plan de remediación detallado

### Fase 0 — Contención y respaldo

1. Congelar scripts enrich_* y evitar nuevas ejecuciones sobre producción.
2. Crear copia versionada de products.json, CSV, imágenes y base Medusa.
3. Marcar los 2.177 atributos añadidos como no verificados.
4. Poner en draft los 10 productos NOVUS añadidos hasta completar su ficha.
5. Mantener oculto el sitio al público/robots durante la corrección.

Entregable: snapshot reproducible y lista de campos visibles que serán temporalmente ocultados.

### Fase 1 — Recuperar plataforma y definir fuente maestra

1. Recuperar PostgreSQL y Medusa.
2. Verificar integridad de tablas y vínculos.
3. Seleccionar Medusa/PIM como fuente maestra.
4. Implementar exportación determinista al storefront o lectura directa.
5. Eliminar archivos duplicados no usados o declararlos artefactos generados.
6. Añadir healthchecks y alertas.

Entregable: diagrama de flujo de datos, procedimiento de publicación y prueba de paridad.

### Fase 2 — Esquema PIM con procedencia

Cada valor técnico debe almacenar:

- Valor normalizado.
- Unidad.
- Alcance: producto, serie o variante.
- Fabricante.
- URL/documento.
- Número de documento.
- Página/sección.
- Versión/fecha del documento.
- Fecha de verificación.
- Revisor.
- Estado: imported, verified, rejected, obsolete.
- Confianza y observación.

Regla: verified es requisito para mostrar certificaciones, protección IP/NEMA, rangos eléctricos, presión, temperatura, materiales, compatibilidad, precisión y seguridad.

### Fase 3 — Restauración segura automatizada

1. Partir de los 400 registros publicados del CSV.
2. Conservar título, marca, precio efectivo, imágenes y atributos heredados como baseline.
3. Revertir los 168 valores modificados salvo los que una fuente oficial confirme.
4. No mostrar los 2.177 campos añadidos hasta validación.
5. Restaurar los 84 atributos antiguos ausentes o documentar por qué se retiraron.
6. Corregir backorder.
7. Corregir 305 H1 truncados y 72 descripciones cortadas.
8. Corregir duplicados, modelo W y seis rutas de categoría.

Entregable: diff de antes/después por producto con aprobación humana.

### Fase 4 — Verificación por fabricante y riesgo

Orden recomendado:

1. Seguridad/energía: calefactores, trazado térmico, controladores de potencia, SSR, presión de fusión y áreas peligrosas.
2. Medición: sensores, transmisores, precisión, rangos, alimentación y protocolos.
3. Automatización: PLC/HMI, entradas, salidas, expansiones y comunicaciones.
4. Monitoreo/Data Center: puertos, compatibilidad, sensores y montaje.
5. Aislamiento y paneles: densidad, temperatura, fuego, agua y norma.
6. Accesorios: compatibilidad exacta y código de pedido.

Para cada producto:

1. Identificar código exacto.
2. Obtener ficha oficial vigente.
3. Verificar título y resumen.
4. Verificar cada atributo visible.
5. Verificar fotografía contra modelo.
6. Adjuntar PDF/enlace.
7. Aprobar por segundo revisor en campos de seguridad.
8. Publicar.

### Fase 5 — Calidad visual y contenido

1. Añadir technicalSummary completo.
2. Añadir descripción técnica extensa verificada.
3. Añadir hoja técnica/manual.
4. Sustituir imágenes de baja resolución.
5. Completar galería mínima según tipo de producto.
6. Revisar imágenes duplicadas XLEe/XLTe y cable HRSHTV.
7. Añadir alt text específico en miniaturas.

### Fase 6 — Puertas de calidad automatizadas

El build/publicación debe fallar si:

- Falta ID, itemNumber, mfrModel, priceMode, moneda o disponibilidad.
- Un producto visible no tiene imagen.
- categoryPath no resuelve en la taxonomía.
- Hay handles o SKU duplicados.
- Un campo crítico visible no tiene fuente verified.
- Existen dos campos equivalentes con valores incompatibles.
- Una descripción termina con elipsis de almacenamiento, decimal incompleto o paréntesis abierto.
- Un producto backorder muestra “En stock”.
- El JSON visible difiere del PIM.
- Una URL de producto o imagen devuelve error.

## 9. Criterios de aceptación final

La corrección puede aprobarse cuando se cumpla todo lo siguiente:

- 400/400 productos antiguos publicados presentes.
- 0 productos publicados faltantes.
- 0 altas no autorizadas.
- 0 campos de identidad vacíos.
- 0 especificaciones críticas visibles sin fuente.
- 0 contradicciones internas.
- 0 títulos H1 cortados.
- 0 descripciones almacenadas truncadas.
- 0 backorders rotulados como stock físico.
- 0 imágenes faltantes.
- 100% de imágenes principales verificadas contra modelo.
- 100% de fichas con fuente oficial para datos de riesgo.
- Backend y base de datos con healthcheck estable.
- Paridad PIM/storefront = 100%.
- Revisión comercial de precios y disponibilidad.
- Revisión técnica/fabricante de especificaciones.

## 10. Anexos generados

Carpeta: /home/ubuntu/CN_Web/md/auditoria-catalogo-2026-08-16

- comparacion-producto-a-producto.csv: comparación estructural de 400 IDs.
- cambios-especificaciones.csv: 2.429 registros de atributos añadidos, modificados o ausentes.
- problemas-imagenes.csv: comparación de referencias antiguas/actuales.
- problemas-integridad-actual.csv: problemas de campos/presentación.
- productos-faltantes.csv: única fila antigua no publicada.
- productos-no-heredados-sin-identidad.csv: diez altas NOVUS no presentes en el CSV.
- resumen.json: salida bruta del primer analizador.
- REPORTE-TECNICO.md: este documento.

Nota sobre resumen.json y comparacion-producto-a-producto.csv: el campo inicial price_mismatch compara precio actual contra precio normal. Los 109 casos señalados no son errores; todos coinciden exactamente con Precio rebajado. La conclusión corregida y canónica es cero diferencias inexplicadas de precio.

## 11. Conclusión

La migración no perdió productos publicados ni imágenes heredadas y preservó correctamente precios efectivos, títulos y la mayoría de marcas. El problema central apareció después: el enriquecimiento automático convirtió un catálogo incompleto pero trazable en uno aparentemente detallado, aunque con datos mezclados y sin procedencia.

La solución no es copiar de nuevo todo WordPress ni borrar todo enriquecimiento. Es recuperar una línea base segura, conservar lo que ya fue confirmado —como varios datos de ProRox SL 920 NA—, ocultar lo no verificado y reconstruir la capa técnica modelo por modelo usando documentación oficial y un PIM único.
