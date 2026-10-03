# Controlnautas × Meta Muse: especificación ejecutable para Cursor

**Fecha:** Hack Day, 29 de septiembre de 2026 (Pacífico). **Uso:** copiar íntegramente este documento a Cursor, con el repositorio real abierto. No presupone acceso a conversaciones, adjuntos o documentos de ChatGPT. Cursor dirige la implementación; Antigravity CLI, que vive en el servidor, ejecuta infraestructura y despliegue. El código nuevo que se presente al concurso debe quedar creado y trazable durante el evento.

## 0. Contexto y objetivo que debes conservar

Controlnautas es una tienda industrial existente, con backend Medusa 2.x y storefront Next.js. El usuario quiere que un ingeniero pregunte a **Meta Muse, el asistente de consumo**, por un PLC para riel DIN, entradas 4–20 mA y Modbus; que obtenga un veredicto por requisito respaldado por una fuente de la variante exacta; que vea precio y disponibilidad **recién consultados en Medusa**; y que reciba un enlace HTTPS a una cotización preliminar PDF calculada por Controlnautas, sujeta a confirmación de un representante. El recorrido completo es: consulta → búsqueda → evaluación técnica → lectura comercial → creación de cotización → PDF → confirmación humana. La tienda existente no se reconstruye.

Hay **tres productos de demostración totalmente ficticios**: un PLC, un controlador de lazo cerrado PID y un sensor Pt100. Sus SKU y documentación se crearán durante el evento y después serán sustituidos por productos reales. Todo dato sintético, página, documento y cotización debe decir claramente `PRODUCTO FICTICIO — DATOS DE DEMOSTRACIÓN`; el PDF además `SIMULACIÓN — NO VÁLIDA COMO OFERTA COMERCIAL`. Nunca enlaces un manual real de un fabricante para respaldar especificaciones ficticias. El objetivo de concurso es un producto desplegado, no diapositivas. Si el tiempo es limitado, completa PLC + cotización antes de enriquecer los otros dos.

El ZIP de referencia inspeccionado se llama `codigo_fuente_solo_codigo.zip`. Contiene `b2b-backend/apps/backend/medusa-config.ts`, `b2b-backend/apps/backend/src/modules/b2b-pim/models/pim-info.ts`, `b2b-storefront`, rutas de catálogo y `b2b-storefront/src/modules/checkout/components/export-quote-button/index.tsx`. La versión del ZIP menciona Medusa 2.17.0; **comprueba la versión y rutas del repositorio Git vivo**. Ese botón de exportación imprime la página y no genera la cotización PDF exigida. Hay una ruta de búsqueda en storefront con caché de unos 300 s: no reutilizarla para precio y stock de una cotización. Los campos PIM observados son `mfrModel`, `itemNumber`, `technicalPdf`, `manualPdf`, `specs`, `purchaseMode` y `availabilityMode`; comprueba tipos, vínculo y semántica antes de modificar.

## 1. Reglas de ejecución y comprobación inicial

1. En el repositorio real: registrar hora local Pacífico, `git status --short`, `git rev-parse HEAD`, rama y remotos sin revelar secretos. Leer `AGENTS.md`, scripts, gestores de paquetes, tests, configuración Medusa, modelos, migraciones, rutas y despliegue. Identificar cuál checkout es autoritativo; no sobrescribir cambios sin commit. Crear rama `hackday-2026-controlnautas-muse` a partir del HEAD aprobado y commits pequeños después de cada función. Guardar tabla de archivos preexistentes frente a cambios del Hack Day y hashes de commits en README.
2. Auditar la topología: Medusa, Next.js, Postgres, Redis si aplica, almacenamiento de archivos, proxy, TLS, host, canales de venta, regiones, monedas, stock locations, niveles de inventario, impuestos, `manage_inventory`, backorders y estados de publicación. No imprimir `.env` ni tokens. Delimitar instancia/canal de demostración; nunca contaminar clientes u órdenes reales.
3. **Verificar Meta Muse**, sin inferir capacidad por el nombre de una web. Acceder en la cuenta del usuario a la interfaz real y documentación oficial del producto; determinar si permite conector privado hoy, cómo se declara una herramienta (OpenAPI, MCP, otra), autenticación (Bearer, OAuth u otra), esquema de respuesta, límites, revisión y prueba privada. Conservar evidencia (URL oficial/captura y resultado concreto). `muse.ai/platform` no es prueba verificada de conectores de Meta Muse: descartar esa referencia del roadmap anterior. No confundir Meta Muse con Muse Spark Model API, Muse Code o servicios de video de nombre parecido. Si la integración privada no está habilitada, implementar el mismo contrato en la API y un cliente de prueba externo **etiquetado como tal**. No afirmar que Muse llamó la API salvo ver un request real correlacionado.
4. Antes de crear rutas de precios o inventario, consultar documentación oficial Medusa que corresponda a la versión instalada, revisar usos internos del repositorio y validar con datos reales de la instancia. En particular, la disponibilidad de variante puede depender de canal, ubicación, reservas, inventario gestionado y backorders; el precio calculado depende de región, moneda, reglas y cantidad. Escribir en `docs/DECISIONS.md` el método exacto encontrado, con ruta del código y comportamiento probado. No inventar llamadas SDK.

**Puerta 0:** entregar un informe corto con árbol relevante, HEAD, estado Git, región/moneda/canal demo, fuente real de precio/stock, topología, disponibilidad de Muse y decisiones de rutas. Avanzar aun si Muse está bloqueado, dejando ese bloqueo explícito.

## 2. Arquitectura y propiedad de datos

Preferir rutas personalizadas en backend Medusa, donde están los servicios comerciales y la persistencia. Next.js presenta tres páginas humanas y Markdown público; si el repo exige un proxy, justificarlo y mantener una única fuente comercial. El contrato de Controlnautas debe poder ser consumido por Muse o un cliente alternativo sin cambiar la lógica de negocio.

| Dato | Autoridad | Lectura y regla |
| --- | --- | --- |
| ID producto/variante, SKU, título, estado, canal | Medusa | Resolver SKU a **una variante**; si hay colisión, fallar. Nunca confiar en un nombre aportado por la IA. |
| Precio, moneda, reglas por cantidad y región | Cálculo comercial Medusa | Consultar al solicitar oferta y **reconsultar** al crear PDF; `no-store`. No copiarlo en fichas Markdown. |
| Disponibilidad | Inventario Medusa en canal/ubicación aplicables | Distinguir cantidad vendible, backorder y desconocido. No prometer reserva. |
| Especificación | PIM o extensión técnica por variante | Atributos normalizados + evidencia versionada + URL/página; no inferir desde descripciones libres. |
| Evaluación | Servicio determinista Controlnautas | Estados `cumple`, `no_cumple`, `no_consta`; modelos de lenguaje formulan preguntas, no alteran veredictos. |
| Cotización | Snapshot persistido Controlnautas | Identificador opaco, inmutable, PDF reproducible desde snapshot, vigencia y estado de revisión. |

Alcance de variantes permitido por lista explícita o bandera `hackday_demo`; toda ruta pública filtra por ese alcance. No exponer rutas admin de Medusa, datos de otros productos, credenciales ni PII. Secreto de conector independiente, limitado a leer catálogo demo y solicitar preliminares, gestionado fuera del código y nunca en chat o URL. Si Muse requiere un modelo de auth diferente, crear adaptador que valide credenciales conforme a su documentación, sin elevar permisos.

## 3. Datos ficticios y evidencia verificable

Seed idempotente y reversible para exactamente estas tres variantes, con IDs generados por Medusa (no suponer IDs fijos):

| SKU demo | Producto y atributos comprobables en ficha sintética | Contraejemplos |
| --- | --- | --- |
| `CN-DEMO-PLC-DIN-420-MR1` | PLC `CN-DIN-PLC-A1`: montaje riel DIN 35 mm; alimentación 24 VDC; 2 entradas analógicas **4–20 mA**; puerto RS-485; protocolo **Modbus RTU slave**. | `Modbus TCP` no consta, salvo que la ficha diga explícitamente que no es compatible. No afirmar que tiene salida analógica. |
| `CN-DEMO-PID-PT100-RS1` | Controlador `CN-PID-T1`: montaje panel; entrada Pt100 3 hilos; control PID; **salida** 4–20 mA; Modbus RTU RS-485. | Su salida no equivale a entrada 4–20 mA; panel contradice riel DIN. |
| `CN-DEMO-PT100-3W-A1` | Sensor `CN-RTD-P1`: elemento Pt100 de 3 hilos, pasivo, montaje por sonda; ficha indica sin transmisor integrado y sin interfaz digital. | No proporciona salida 4–20 mA ni Modbus por sí solo. |

Valores **solo de muestra si Medusa admite la región**: PEN 890 / 480 / 75 y stock 3 / 2 / 8; de lo contrario elegir moneda y región realmente configuradas y anotarlas. Precio/stock deben residir únicamente en el catálogo activo demo de Medusa. Un atributo no escrito en la ficha queda desconocido. Los documentos sintéticos deben contener marca de simulación en cada página y sección numerada estable. Publicar `datasheet.pdf` demo y un Markdown breve por SKU, generado o escrito desde el mismo manifiesto de especificaciones; citar `source_id`, revisión, URL HTTPS, página/sección exacta y fragmento breve. `manualPdf` puede quedar vacío, identificado como `no consta`, si no se crea un manual sintético separado. No fabricar enlaces a manuales oficiales. A futuro, sustituir fuente por PDF oficial con fabricante, número de documento, revisión y página verificada manualmente; no basta la coincidencia semántica de un embedding.

Esquema sugerido por **variante** (adapta a ORM/Medusa observado): `technical_profile(variant_id UNIQUE, model, revision, demo, updated_at)`, `technical_fact(id, variant_id, property, normalized_value_json, display_value, source_id, page, section, excerpt, polarity)`, `technical_source(id, url, kind, revision, checksum, published_at)`. Si el PIM actual ofrece una unión equivalente, reutilizarla. `property` debe ser enum o vocabulario cerrado: `mounting`, `supply_voltage`, `analog_input`, `analog_output`, `protocol`, `interface`, `sensor_element`, `control_function`. `normalized_value_json` conserva dirección de señal, rango y unidades: `{direction:"input",min:4,max:20,unit:"mA",channels:2}`. No tratar `analog_output` como entrada. Sembrar datos mediante la API/servicios reales de Medusa y conservar IDs de variantes en manifiesto generado o consulta por SKU, no en código duro.

**Puerta 1:** los tres productos aparecen en páginas humanas, documentos y JSON; cada afirmación técnica tiene una fuente demo pública, legible y marcada. Un SKU inexistente devuelve 404. El seed se puede repetir y revertir sin borrar productos ajenos.

## 4. Evaluador técnico, algoritmo y casos límite

Representar el pedido como lista cerrada de predicados estructurados, por ejemplo `[{property:"mounting",operator:"equals",value:"din_35mm"},{property:"analog_input",operator:"range_contains",min:4,max:20,unit:"mA",channels_at_least:2},{property:"protocol",operator:"equals",value:"modbus_rtu"}]`. Aceptar texto libre solo para búsqueda y propuesta de requisitos; la API evalúa únicamente predicados admitidos. Rechazar propiedades, operadores y unidades desconocidas con 400, no evaluarlos como verdaderos. Normalizar `4-20mA` y `4–20 mA`; no equiparar RTU/TCP, sensor/transmisor o entrada/salida. Para el MVP, conversiones solo si están especificadas y probadas; sino `no_consta`.

Por cada predicado: `cumple` si un hecho de la **variante exacta**, con fuente válida, satisface completamente valor, dirección, cantidad y unidad; `no_cumple` si un hecho explícito contradice el requisito (panel frente a DIN, salida frente a petición de entrada cuando la ficha declara configuración de I/O completa, sensor pasivo sin interfaz frente a Modbus); `no_consta` si falta una afirmación suficiente o la fuente es ambigua. La mera ausencia de `Modbus TCP` no demuestra incompatibilidad: `no_consta`. Fuentes contradictorias, variante sin evidencia o revisión obsoleta: `no_consta` y registrar la anomalía. No realizar selección automática definitiva con requisitos críticos `no_cumple`/`no_consta`; ordenar candidatos por número de cumplimientos, advertir límites y ofrecer cotización solo para variante seleccionada explícitamente. Nunca pasar un resumen del LLM como evidencia.

Respuesta de evaluación por requisito: `{requirement_id,status,reason,observed:{property,value,unit,direction,channels},evidence:[{source_id,url,page,section,revision,excerpt}],evaluated_at}`. `no_consta` puede tener `evidence:[]` y explicación precisa. Enlaces HTTPS a PDFs y secciones verificables; no atribuir el estatus a una página que no dice eso.

**Puerta 2 / pruebas obligatorias:** PLC satisface DIN + dos entradas 4–20 + RTU; pedir TCP produce `no_consta` si no hay negación expresa; PID panel da `no_cumple` para DIN y su salida no cumple entrada; Pt100 pasivo no cumple petición de transmisor integrado cuando consta su pasividad; una propiedad eliminada temporalmente produce `no_consta`. Cada estado positivo o negativo con evidencia apunta a una página existente.

## 5. Contrato HTTP independiente del adaptador Muse

Usar prefijo `/api/muse/v1` **si el repositorio no tiene choque de rutas**; internamente nombrarlo API `agent-commerce`. Mantener JSON estable, `request_id` en header y cuerpo, `Cache-Control: no-store` en operaciones comerciales, `Content-Type` correcto y URLs absolutas HTTPS. La búsqueda técnica puede tener ETag por revisión. Validar esquema y tamaño máximo de entradas con utilidades existentes. Los identificadores internos de variante son opacos; el SKU se expone como referencia humana.

| Ruta | Entrada | Salida mínima / errores |
| --- | --- | --- |
| `GET /healthz` | sin token, sin datos internos | `{status:"ok",version,commit}`. No revelar secretos. |
| `GET /api/muse/v1/products/search?q=...&limit=3` | token; `q` ≤ 200 caracteres, `limit` 1–3 | Lista `{variant_id,sku,model,title,product_url,technical_summary,demo}`. Sin precio cacheado. |
| `GET /api/muse/v1/products/{variantId}` | token | Perfil y hechos/evidencias versionados de esa variante; 404 si fuera de alcance. |
| `POST /api/muse/v1/evaluate` | token; `{variant_id,requirements:[...]}` 1–10 | `evaluations[]`, `source_revision`, `evaluated_at`, `request_id`; 400 para vocabulario inválido. |
| `GET /api/muse/v1/products/{variantId}/offer?quantity=N` | token; entero 1–20 | `{state:"priced"|"manual_review",variant_id,sku,quantity,region_id,currency,unit_price_minor,subtotal_minor,availability:{status,available_quantity,backorder},observed_at,limitations}`. `*_minor` solo si escala de moneda comprobada; de lo contrario usar decimal string + scale explícita. |
| `POST /api/muse/v1/preliminary-quotes` | token; `{variant_id,quantity,region_id?,idempotency_key?}`; ignorar/rechazar precio suministrado por cliente | Relectura comercial; `{quote_id,status,observed_at,expires_at,pdf_url,summary,request_id}`. Identidad de región restringida a demo, no aceptar arbitrarias. |
| `GET /api/muse/v1/preliminary-quotes/{opaqueId}/pdf` | URL pública opaca firmada/corta y con expiración, o endpoint privado de descarga de la app | PDF persistido de snapshot, `application/pdf`, sin token de API en query; 404/410 según política. |

Ejemplo de `POST /evaluate` (los valores de respuesta son ilustrativos y deben venir de seed y fuentes reales de demo):

```json
{"variant_id":"<ID_RESUELTO_POR_SKU>","requirements":[{"id":"r1","property":"mounting","operator":"equals","value":"din_35mm"},{"id":"r2","property":"analog_input","operator":"range_contains","min":4,"max":20,"unit":"mA","channels_at_least":2},{"id":"r3","property":"protocol","operator":"equals","value":"modbus_rtu"}]}
```

Ejemplo de `POST /preliminary-quotes`: `{"variant_id":"<ID_RESUELTO_POR_SKU>","quantity":1,"idempotency_key":"<UUID_DE_LA_SOLICITUD>"}`. La API **no** toma precio, `in_stock` ni conclusiones técnicas del request. Respuestas de error uniformes: `{error:{code,message},request_id}`; 400 esquema, 401 auth, 403 alcance, 404 variante, 409 conflicto de idempotencia, 429 cuota, 503 dependencia Medusa. El precio no disponible o artículo `quote_only` es un **estado de negocio** `manual_review`, no un total cero.

Generar OpenAPI 3.x con `operationId` claros, schemas exactos, Bearer si la integración verificada lo permite, ejemplos y dominios reales. Una capa adaptadora transforma este contrato al mecanismo que **Meta Muse efectivamente admita**, sin inventar rutas MCP ni afirmar que acepta OpenAPI. Si Muse usa navegación web en vez de herramienta API, registrar esa modalidad como distinta y probar que lee datos actualizados; no entregar la clave en texto visible.

## 6. Comercio, snapshot y PDF

Implementar `getLiveOffer(variantId, quantity, region)` en el servidor Medusa. Resolver variante publicada en canal demo; calcular precio con la configuración comercial real y reglas por cantidad; determinar moneda y unidad menor; consultar disponibilidad aplicable al canal y ubicaciones conectadas, reservas y backorder. Capturar `observed_at` al finalizar ambas lecturas. No usar resultado de caché del storefront. Si precio no existe, es manual, moneda no coincide, no se puede interpretar impuesto o inventario es indeterminado según política, devolver `manual_review` con causa. Precio sin stock conocido puede cotizarse solo si se describe explícitamente disponibilidad desconocida y la política lo permite; nunca escribir `in_stock` por defecto.

`POST /preliminary-quotes` vuelve a invocar `getLiveOffer`; usa transacción o estrategia consistente para persistir snapshot y documento. Persistir `quote(id, opaque_public_id, status, variant_id, sku, model, quantity, region, currency, unit_price_minor, subtotal_minor, tax_status, tax_amount_minor?, shipping_status, availability_snapshot_json, product_url, evidence_revision, observed_at, created_at, expires_at, demo, pdf_storage_key, idempotency_key_hash)` con las adaptaciones de esquema necesarias. Snapshot no cambia aunque cambie Medusa; no se crea carrito ni orden ni se descuenta stock. La idempotencia repite el mismo resultado para el mismo cuerpo y clave; si el cuerpo difiere, 409. Si falla el PDF, no anunciar `pdf_url` roto: reintentar o dejar estado recuperable. No guardar documento definitivo con datos personales innecesarios.

PDF mínimo: logo/nombre Controlnautas; título **Cotización preliminar — simulación**; número, fecha/hora con zona, vigencia elegida (por ejemplo 24 h, sin promesa de stock), modelo + SKU + variante, cantidad, moneda, unitario, subtotal; tratamiento de impuestos (`incluidos`, `excluidos` o `por confirmar`, conforme a Medusa), envío `por confirmar`, disponibilidad y momento exacto de lectura; URL de producto y fuentes técnicas de demostración; leyendas destacadas de ficción y confirmación del representante. `manual_review` genera documento de solicitud preliminar **sin importe**, si se conserva la experiencia PDF, con estado inequívoco. Enlace de descarga con ID no enumerable, token de acceso distinto al token API y expiración documentada. Probar que abre por red celular y no requiere sesión admin.

**Puerta 3:** cambiar precio de PLC en Medusa demo → nueva oferta y nueva cotización con nuevo precio; PDF previo conserva precio anterior. Repetir con inventario. Fijar cantidad 2 para validar subtotal y redondeo. Precio eliminado → `manual_review` sin número inventado. PDF pasa lectura automatizada de contenido y comprobación visual básica.

## 7. Seguridad y operación

Crear secreto largo aleatorio para el conector y almacenarlo en gestor del servidor, no en `NEXT_PUBLIC_*`; validar tiempo constante o hash según patrón existente; separar lectura de creación de cotizaciones si Muse lo soporta; rotación sencilla. Limitar a variantes demo; 1–20 unidades; cuota por token/IP con consideración del proxy real; 10 requisitos; cuerpo máximo pequeño; timeout en Medusa; respuesta 503 sin precio anterior si falla. CORS restringido solo si un navegador externo lo necesita, puesto que un conector servidor a servidor no requiere CORS. Escapar HTML y contenido PDF; jamás incrustar texto no validado del prompt en el PDF. Logs estructurados `{time,request_id,operation,sku,status,latency_ms,caller_type}` sin Bearer, datos de cliente ni texto íntegro de pregunta. Proteger PDF contra enumeración, inyección y traversal. Documentar retención/limpieza de snapshots demo.

Antigravity debe comprobar respaldo de DB demo, migración, servicio/proxy, certificado TLS, DNS, env seguras, health check y reversión. Cursor no enviará secretos a Antigravity por texto de chat: indicará nombres de variables y el usuario/gestor los introducirá por canal apropiado. Desplegar commit conocido; registrar hash en `/healthz`; prueba desde red externa. No publicar rama a jueces hasta que esté documentada la diferencia entre infraestructura anterior y código nuevo del concurso.

## 8. Distribución de trabajo y fases con puertas

| Orden | Cursor (código, coordinación y diagnóstico) | Antigravity CLI (servidor) | Aceptación |
| --- | --- | --- | --- |
| 0, 20–30 min | Auditar repo vivo, Muse y métodos Medusa; registrar decisiones y rama | Inspeccionar host, respaldo, dominio y TLS | Informe inicial + ruta Muse confirmada o bloqueo explícito. |
| 1, 45–60 min | Seed 3 SKU, fuentes demo, páginas/Markdown; migración técnica mínima | Respaldar DB demo y preparar almacenamiento accesible | PLC con evidencia pública y datos Medusa verificables. |
| 2, 60–80 min | Resolver variantes, normalizar predicados, endpoints técnicos, auth y pruebas negativas | Exponer API staging tras revisión | Evaluación de PLC correcta con citas; contraejemplos pasan. |
| 3, 75–100 min | Lector de oferta, snapshot, idempotencia, PDF, manual_review | Persistencia, almacenamiento PDF, reinicio/migración controlados | Cambio Medusa se refleja, PDF viejo permanece, móvil abre PDF. |
| 4, 40–70 min | Adaptador Muse verificado o cliente externo declarado, OpenAPI/README, prueba E2E | Deploy SHA, HTTPS, logs, rollback probado | Solicitud externa y `request_id` correlacionados. |
| 5, 30–45 min | Rehearsal, reporte de estado exacto, commits y guion | Monitorizar y recuperar servicio si falla | Recorrido de 90 segundos reproducible. |

Tiempos relativos y aproximados; si el evento avanza, no sacrifiques cotización. Primero un PLC totalmente funcional, luego los otros dos. No pedir a Antigravity que edite los mismos archivos que Cursor; comandos y resultados de deploy deben intercambiarse por issue/nota breve con SHA esperado, host, procedimiento de migración, health check y rollback. No ejecutar migración en producción sin copia y prueba.

## 9. Matriz mínima de pruebas y evidencia para jueces

- Autenticación: sin token 401; token de API no habilita `/admin`; SKU ajeno 404/403; peticiones fuera de límites 400/429.
- Técnica: PLC DIN/2 entradas 4–20/RTU cumple; TCP sin fuente `no_consta`; controlador panel no cumple DIN; salida 4–20 no satisface entrada; Pt100 pasivo no es transmisor; fuente eliminada produce `no_consta`; cada cita abre página correcta.
- Comercio: precio y stock actualizados en Medusa demo aparecen en nueva oferta; relectura en POST impide precio obsoleto; cotización vieja queda congelada; subtotal con cantidad 2 correcto; precio nulo = revisión manual; caída Medusa = 503 o revisión justificada, nunca valor inventado.
- PDF: número, variante, unidad y moneda correctas, etiquetas sintéticas, impuesto/transporte claros, link externo abre desde celular fuera de la red local; clave API ausente de enlace y del documento.
- Muse: una interacción real muestra dato cambiado y un request correlacionado en log por ID/horario. Si no hay acceso privado, cliente de prueba HTTP + captura y declaración `Integración Meta Muse pendiente de habilitación`; jamás etiquetar una llamada curl como Muse.
- Entrega: repo GitHub con hashes de commits del día, instrucciones de ejecución, env solo nombres, migración/seed/reversión, OpenAPI, URL HTTPS, capturas/logs redactados, límites, comando para comprobar PDF y estado exacto de integración. Guion: preguntar → requisitos y fuentes → precio/stock actual → PDF → confirmación humana.

## 10. Instrucción final para Cursor

Actúa como responsable técnico. Empieza **ahora** con puerta 0, inspecciona el repositorio vivo y la documentación/cuenta de Meta Muse, anota hallazgos comprobados y decide implementación concreta sin inventar APIs. Sigue las puertas 1–5 y produce commits y despliegue durante el evento. Cuando una hipótesis del texto no coincida con código o documentación observada, prioriza lo observado, registra cambio y continúa. En cada puerta informa: SHA, archivos, pruebas ejecutadas con resultado, URL pública si existe, bloqueo concreto y siguiente tarea. No detengas el recorrido por detalles cosméticos. La salida final debe distinguir `API desplegada`, `cliente de prueba verificado` y `Meta Muse conectado` según evidencia real.

## Fuentes que Cursor debe consultar y validar

- Documentación oficial Medusa: https://docs.medusajs.com/resources/commerce-modules/product/variant-inventory ; https://docs.medusajs.com/resources/commerce-modules/product/guides/variant-inventory ; https://docs.medusajs.com/resources/commerce-modules/pricing ; https://docs.medusajs.com/resources/storefront-development/products/price . Comparar siempre con dependencias y código instalado.
- Meta Muse: buscar la documentación oficial de **conectores del agente Meta Muse** desde la cuenta activa y dominio oficial de Meta; conservar URL y fecha, forma de auth y ejemplo funcional. No sustituir por una página de otro producto llamado Muse.

