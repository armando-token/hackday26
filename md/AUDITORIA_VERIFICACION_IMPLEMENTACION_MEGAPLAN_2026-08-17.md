# Auditoría independiente de la implementación del megaplán

**Proyecto:** Control Nautas — Next.js + Medusa  
**Fecha:** 17 de agosto de 2026  
**Plan verificado:** `AUDITORIA_TOTAL_MIGRACION_LEGACY_CONTROL_NAUTAS_2026-08-16.md`  
**Modalidad:** lectura y pruebas no destructivas  
**Resultado:** **NO-GO para cambiar el DNS**

> Este documento verifica la afirmación de que se implementó el 100% del plan y que `test_migration_suite.py` superó 35 de 35 pruebas. La suite sí produce ese resultado, pero el resultado es un falso positivo: sus 35 comprobaciones no representan la totalidad del megaplán ni prueban los flujos críticos de negocio.

> No se modificaron el código fuente, los productos, Medusa, PostgreSQL, PM2, Nginx, DNS, Google, Merchant Center ni el CRM. Este archivo es el único documento creado durante la auditoría.

---

## 1. Veredicto ejecutivo

La implementación actual contiene mejoras reales, pero **no está terminada y no debe publicarse mediante cambio de DNS**.

El “35/35” confirma únicamente que:

- ciertas páginas devuelven HTTP 200;
- existe un XML con más de 500 URLs;
- existe un feed con más de 100 filas;
- cuatro redirects concretos responden 301;
- cuatro paths falsos concretos responden 404;
- cinco textos ficticios concretos ya no aparecen;
- existen determinados registros en PostgreSQL.

No confirma:

- una compra completa desde el producto hasta el pedido;
- que el carrito visible utilice Medusa;
- correos transaccionales;
- conversiones de Google Ads;
- pageviews o ecommerce de GA4;
- sitemap canónico;
- cobertura de URLs de Search Console;
- ausencia de soft 404 y 500;
- Merchant Center aprobado;
- exactitud del contenido histórico;
- funcionamiento a través de Nginx y HTTPS;
- CRM separado;
- protección de credenciales;
- restauración de backups;
- build limpio de TypeScript;
- seguridad de dependencias.

### 1.1 Bloqueadores principales

1. El carrito público sigue siendo un carrito local y no conecta con Medusa.
2. El checkout no es alcanzable desde el carrito visible.
3. Las 601 URLs del sitemap redirigen; algunas terminan en 404.
4. Las categorías históricas con tráfico redirigen mayoritariamente a soft 404.
5. Persisten falsos 200, una 500 reproducible y países duplicados.
6. Canonicals apuntan a URLs que redirigen y, en ciertas categorías, a la IP HTTP.
7. GTM no escucha el nuevo evento de WhatsApp y no contiene Google Ads.
8. No existen eventos ecommerce ni conversión `purchase`.
9. No existe proveedor de correo transaccional.
10. El feed Merchant cambia todos los IDs históricos y declara envío gratis universal.
11. Los casos de éxito contienen hechos y métricas inventados.
12. Políticas comerciales y legales incluyen condiciones no aprobadas o desactualizadas.
13. No existe HTTPS en el servidor nuevo.
14. El subdominio CRM no existe en DNS.
15. Existen credenciales hardcodeadas y archivos secretos con permisos inseguros.
16. El frontend no supera TypeScript; el build oculta esos errores.

---

## 2. Metodología

Se revisaron:

- el megaplán completo;
- el código del storefront;
- el código y configuración del backend Medusa;
- `test_migration_suite.py`;
- respuestas HTTP directas al puerto 8000;
- respuestas HTTP a través de Nginx en el puerto 80;
- base de datos PostgreSQL en lectura;
- contenedor GTM publicado;
- feed Merchant generado;
- exportación histórica de Merchant;
- exportación de Search Console;
- XML de WordPress;
- DNS público;
- configuración Nginx;
- puertos en escucha;
- PM2 y logs;
- Git y backups;
- typecheck;
- auditoría de dependencias.

La suite original fue ejecutada y efectivamente devolvió:

```text
35/35 PRUEBAS EXITOSAS (100.0%)
```

Ese dato se conserva como evidencia, pero no como aprobación de migración.

---

## 3. Elementos implementados correctamente o parcialmente

### 3.1 Identidad principal

Los datos centrales son correctos en:

`b2b-storefront/src/lib/config/company.ts`

Incluye:

- CONTROL NAUTAS S.A.C.
- RUC correcto.
- dirección correcta.
- teléfono/WhatsApp correcto.
- `ventas@controlnautas.com`.

Los principales teléfonos, RUC y dirección ficticios ya no aparecen en el código activo.

### 3.2 Páginas creadas

Existen páginas nuevas para:

- Nosotros.
- Contacto, aunque bajo un path distinto del enlazado.
- Entregas y devoluciones.
- Términos y condiciones.
- Política de privacidad.
- Índice de casos.
- Cinco detalles de casos.

### 3.3 Footer

El footer:

- ya no contiene newsletter;
- ya no contiene enlaces `#` dentro del propio footer;
- muestra la identidad principal correcta;
- incluye teléfono, correo y WhatsApp reales.

Sin embargo, varios destinos del footer están rotos. Se explica más adelante.

### 3.4 GTM

- El loader de `GTM-KZT9PCF` está montado una sola vez.
- No se encontró una segunda carga local de GTM o `gtag.js`.
- WhatsApp abre el número correcto.
- El componente nuevo empuja `whatsapp_product_click` al `dataLayer`.

La configuración publicada de GTM no está alineada con ese evento y no incluye Ads.

### 3.5 Medusa

- Existe una región Perú/PEN.
- `pp_system_default` está vinculado a Perú.
- Existen 523 productos y 523 variantes.
- Existen dos opciones de envío con precio en PEN.

La presencia de esos registros no demuestra un ecommerce operativo.

### 3.6 Feed

- El endpoint responde 200.
- Genera TSV.
- Contiene 154 filas.
- No tiene IDs duplicados dentro del propio feed.
- Tiene cabeceras básicas de Merchant.

Su semántica, IDs, URLs, stock y envío todavía tienen fallos importantes.

### 3.7 Backups y Git

- Existen tres backups de PostgreSQL.
- Existen checksums calculables.
- Existe un repositorio Git limpio en `/home/ubuntu/CN_Web/git/version_1.0`.
- Existe un commit maestro.

El árbol vivo `/home/ubuntu/CN_Web/b2b-storefront` no es el repositorio Git; es una copia separada. Además, los dumps están versionados dentro de Git y no se encontró evidencia de una restauración probada.

---

## 4. Por qué `35/35` es un falso positivo

Archivo:

`/home/ubuntu/CN_Web/test_migration_suite.py`

### 4.1 No prueba producción

La suite usa:

```text
http://127.0.0.1:8000
```

Esto evita:

- Nginx;
- el dominio real;
- HTTPS;
- redirección HTTP→HTTPS;
- colisiones entre rutas de frontend y API;
- cabeceras del proxy;
- TLS;
- DNS.

Por este motivo la suite aprueba `/pe/store`, aunque el catálogo `/store` falla al pasar por Nginx.

### 4.2 Sitemap

La prueba solo exige:

- HTTP 200;
- texto `urlset`;
- más de 500 URLs.

No visita las URLs ni comprueba:

- status final;
- canonical;
- redirects;
- 404;
- prefijo regional;
- host correcto.

Resultado independiente:

- 601 URLs.
- 601 redirigen en la primera solicitud.
- 0 incluyen `/pe`.
- `/contacto` termina en 404.

### 4.3 Robots

La prueba únicamente busca el texto `sitemap.xml`. Por eso marca PASS aunque el contenido actual sea:

```text
User-Agent: *
Disallow: /
```

El bloqueo es correcto para staging, pero la prueba no valida la condición de producción.

### 4.4 Merchant

La prueba solo valida:

- cabeceras presentes;
- más de 100 filas.

No valida:

- continuidad de IDs históricos;
- URLs canónicas finales;
- precio página/feed/Medusa;
- inventario;
- envío real;
- categorías;
- checkout;
- aprobación en Merchant.

### 4.5 Redirects

Solo se prueban cuatro redirects. No se sigue el destino ni se revisan:

- URLs fechadas;
- categorías históricas;
- PDFs;
- cadenas de dos saltos;
- todas las rutas con tráfico.

### 4.6 404

Solo se prueban:

- `/pepe`
- `/hope`
- `/super`
- `/peru`

No se prueban rutas dinámicas, extensiones, colecciones, contenido, categorías ni 500.

### 4.7 Medusa

Solo se cuentan registros. No se crea un recorrido:

```text
producto → carrito → dirección → envío → pago → pedido → email
```

### 4.8 Credenciales

La suite contiene credenciales de Basic Auth en texto plano. También existen valores fallback en el middleware. Deben rotarse y retirarse del código.

---

## 5. P0 — Carrito y checkout no conectados

### 5.1 Evidencia

La ruta pública del carrito renderiza:

`src/modules/cart/templates/shell-cart.tsx`

El carrito:

- usa `useShellCart`;
- persiste en `localStorage` con la clave `cn_shell_cart_v1`;
- calcula el subtotal en el navegador;
- finaliza con un `mailto:`;
- no crea un carrito Medusa.

El propio texto visible del código dice:

```text
El checkout Medusa no está conectado al carrito shell.
```

Los PDP activos y los listados agregan productos a este carrito local.

### 5.2 Resultado runtime

- `/pe/cart` → 200.
- `/pe/checkout` sin cookie Medusa → 404.

Agregar al carrito público no crea esa cookie porque se guarda únicamente en `localStorage`.

### 5.3 Consecuencia

- No existe compra completa.
- No se crea pedido desde el catálogo visible.
- No se puede validar pago.
- No se puede validar envío.
- No se puede validar email.
- No existe evento purchase real.
- Merchant puede rechazar la experiencia.

### 5.4 Checkout alternativo incompleto

Existe código de checkout Medusa del starter, pero no está conectado al catálogo principal.

Además:

- exige visualmente un PO Number;
- el campo no se persiste;
- afirma facturación a 30 días sin verificar crédito;
- contradice el requisito de permitir comprar a una persona natural.

### 5.5 Estado

**NO IMPLEMENTADO. Bloqueador absoluto.**

---

## 6. P0 — Sitemap no canónico y rutas rotas

### 6.1 Resultado independiente

```text
Sitemap: 601 URLs
200 directos: 0
Redirects: 601
```

El sitemap publica URLs sin `/pe`, mientras el middleware redirige a `/pe` con 307.

### 6.2 Contacto

La página real existe en:

```text
/pe/contact
```

La navegación, footer, Nosotros, Casos y sitemap enlazan:

```text
/contacto → /pe/contacto → 404
```

### 6.3 Tienda

El sitemap usa `/tienda`. El middleware tiene un redirect a `/pe/store`, pero los enlaces internos localizados pueden producir `/pe/tienda`, que responde 404.

### 6.4 Colisión Nginx `/store`

Nginx reserva `/store` para la API Medusa.

Prueba por puerto público 80:

```text
/store → HTTP 400 JSON “Publishable API key required”
/store/aislamiento-termico → HTTP 400 JSON
/pe/store → HTTP 200 HTML
```

La suite llama directamente al puerto 8000 y no detecta esta diferencia.

### 6.5 Decisión necesaria

Se debe escoger una sola arquitectura:

- URLs públicas sin `/pe`, cambiando la arquitectura de Next/Nginx; o
- URLs públicas `/pe/...`, actualizando sitemap, canonical, feed, schema y enlaces.

El plan original prefería no exponer `/pe`. La implementación hizo lo contrario sin cerrar coherentemente la decisión.

### 6.6 Estado

**NO IMPLEMENTADO CORRECTAMENTE. Bloqueador SEO.**

---

## 7. P0 — Cobertura de URLs históricas insuficiente

### 7.1 Categorías con tráfico

Se auditaron 30 categorías históricas presentes en Search Console:

- 1 llega a una categoría válida.
- 29 llegan a un soft 404 con HTTP 200.
- Impacto: 277 clics y 14,521 impresiones en el informe disponible.

La principal:

```text
/categoria-producto/lana-de-roca/
255 clics
12,828 impresiones
```

La regla genérica conserva el slug antiguo sin verificar su equivalente en la taxonomía nueva.

### 7.2 Productos

De 328 slugs históricos de producto:

- 322 terminan en un producto válido.
- 6 todavía terminan en 404.

Entre los pendientes:

- `contenedor-modular-prefabricado` — 23 clics acumulados.
- `horner-x4-micro-ocs-series-plc-todo-en-uno` — 9 clics.

### 7.3 PDFs

- 49 filas del informe GSC corresponden a PDFs.
- Representan aproximadamente 179 clics y 2,509 impresiones.
- No existen PDFs en `public` de la nueva aplicación.

Un PDF prioritario tenía aproximadamente 69 clics.

### 7.4 Casos fechados

Las cinco URLs históricas reales con fecha responden 404:

```text
/2025/08/05/control-industrial-resistencias-electricas-peru/
/2025/08/13/eliminacion-congelamiento-heat-tracing-peru/
/2025/08/20/control-temperatura-datacenters-akcp/
/2025/08/28/solucion-lana-de-roca-en-calderas-peru/
/2025/09/01/prevencion-congelamiento-heat-tracing-peru/
```

Solo se implementaron aliases sin fecha.

### 7.5 Cobertura general

Sobre paths normalizados de GSC:

- 155 rutas únicas no tienen regla.
- Representan aproximadamente 223 clics y 6,589 impresiones.

### 7.6 Estado

**PARCIAL. Bloqueador de conservación SEO.**

---

## 8. P0 — Soft 404, falsos archivos, 500 y duplicados

### 8.1 Resultados runtime

| Ruta | Resultado actual |
|---|---:|
| `/pe/content/no-existe` | 200 soft 404 |
| `/pe/store/no-existe` | 200 soft 404 |
| `/pe/collections/no-existe` | 500 |
| `/pe/categories/no-existe` | 404 correcto |
| `/pe/casos-de-exito/no-existe` | 404 correcto |
| `/missing.xml` | 200 con homepage |
| `/missing.pdf` | 200 con homepage |
| `/manifest.json` | 200 con homepage |
| `/pepe` | 404 correcto |
| `/hope` | 404 correcto |

### 8.2 Causas

- El contenido desconocido usa una página genérica.
- La tienda desconocida renderiza “Categoría no encontrada” con status 200.
- La colección inexistente falla durante metadata/render.
- El middleware deja pasar cualquier pathname con determinadas extensiones, aunque el archivo no exista.

### 8.3 Países duplicados

El middleware sigue aceptando:

- PE.
- DK.
- US.
- CL.
- CO.
- MX.

Pruebas como `/cl` y `/dk` devuelven 200, pese a que la decisión empresarial es Perú-only.

### 8.4 Estado

**NO IMPLEMENTADO CORRECTAMENTE.**

---

## 9. P0 — Canonical, metadata y schema

### 9.1 Canonical hacia IP

La variable `NEXT_PUBLIC_BASE_URL` continúa apuntando a la IP HTTP. El layout principal vuelve a usar esa variable como `metadataBase`.

Resultado observado para categorías regionales:

```text
canonical = http://3.229.82.189/inmersion
```

Esto afecta versiones PE, CL y DK.

### 9.2 Canonicals ausentes

No se encontró canonical explícito correcto para:

- home;
- catálogo;
- páginas institucionales;
- productos del catálogo JSON principal.

Los casos generan canonical sin `/pe`, aunque esa URL redirige.

El Product schema también genera URL sin `/pe`.

### 9.3 Open Graph

- `og:url` global apunta siempre a la home.
- El archivo especial `opengraph-image.jpg` sigue siendo la imagen genérica del starter Medusa.
- Los casos no publican una imagen OG propia.
- Ciertos títulos duplican “Control Nautas” por usarlo tanto en la página como en el template.

### 9.4 Schema incompleto

Existen:

- Product en el catálogo JSON.
- Article en casos.

Faltan:

- Organization/LocalBusiness global.
- WebSite.
- BreadcrumbList.

### 9.5 Noindex en rutas privadas

Robots excluye paths sin `/pe`, mientras las rutas reales incluyen `/pe`. Carrito, checkout, búsqueda, cuenta y órdenes tampoco tienen metadata `noindex` consistente.

### 9.6 Estado

**PARCIAL Y NO APTO PARA INDEXACIÓN.**

---

## 10. P0 — GTM, GA4, Ads y WhatsApp

### 10.1 Integración local

Cumplido:

- GTM se carga una vez.
- ID correcto del contenedor.
- nuevo evento `whatsapp_product_click` con datos de producto.
- no se incluye PII en ese evento.

### 10.2 Contenedor publicado

Se inspeccionó el JavaScript publicado de `GTM-KZT9PCF`.

Contiene solamente dos tags:

1. listener de link click;
2. evento GA4 `click_whatsapp_cotizar` hacia `G-71TVCYJE8P`.

No contiene:

- `AW-11191602111`;
- Google Ads conversion;
- Conversion Linker;
- purchase;
- pageview global demostrable;
- trigger para `whatsapp_product_click`;
- ecommerce de Medusa.

### 10.3 Trigger antiguo incompatible

El trigger publicado espera:

- evento `gtm.linkClick`;
- texto que contenga `COTIZA POR WHATSAPP`;
- host `controlnautas.com`.

Los nuevos botones utilizan textos como:

- Cotizar por WhatsApp.
- Consultar por WhatsApp.
- Escribir por WhatsApp.

El evento semántico nuevo no es escuchado.

### 10.4 Enlaces que evitan el componente

Hay enlaces estáticos en header móvil y footer que abren WhatsApp sin empujar el nuevo evento enriquecido.

### 10.5 Ecommerce

No se encontraron implementaciones de:

- `view_item`
- `select_item`
- `add_to_cart`
- `view_cart`
- `begin_checkout`
- `add_shipping_info`
- `add_payment_info`
- `purchase`
- `generate_lead`

### 10.6 Resultado

- WhatsApp abre correctamente.
- La conversión principal de Google Ads no está implementada.
- GA4 no tiene una medición global demostrada.
- No existe atribución ecommerce.

### 10.7 Estado

**NO IMPLEMENTADO. Bloqueador de medición.**

---

## 11. P1 — Consentimiento

No existe:

- banner/CMP;
- aceptar/rechazar;
- preferencias;
- Consent Mode v2;
- `analytics_storage`;
- `ad_storage`;
- `ad_user_data`;
- `ad_personalization`.

GTM carga inmediatamente.

La política sí declara que se usan cookies analíticas, por lo que hay una brecha entre texto e implementación.

La empresa había expresado que no deseaba un banner por no vender en Europa. Sin embargo, el megaplán corregido dejó explícitamente este punto sujeto a cumplimiento en Perú. Si se mantiene la decisión de no implementarlo, se necesita validación legal o desactivar almacenamiento de marketing no esencial.

**Estado: NO IMPLEMENTADO / decisión pendiente.**

---

## 12. P0/P1 — Merchant Center

### 12.1 Feed operativo superficialmente

```text
HTTP 200
154 productos
TSV válido a nivel sintáctico básico
```

### 12.2 IDs históricos perdidos

El código busca `legacyWcId`, pero el dataset utiliza `wcId`.

Consecuencia:

- los 154 productos generan IDs `CN_...`;
- 0 generan `gla_...`;
- el solapamiento entre los IDs del feed antiguo y el nuevo es 0.

Esto puede reiniciar historial, aprobaciones y rendimiento de los artículos.

### 12.3 URLs

Los 154 links omiten `/pe` y redirigen 307.

Merchant debería recibir la URL final canónica que responde 200 directamente.

### 12.4 Datos estáticos

El feed lee `products.json`, no Medusa.

Por tanto, no garantiza sincronía real de:

- inventario;
- precio;
- publicación;
- backorder;
- disponibilidad.

### 12.5 Envío

Los 154 productos declaran:

```text
PE::0.00 PEN
```

Eso significa envío gratis nacional para todos.

La política publicada dice que algunos envíos se calculan o pagan en destino. Merchant, la web y el checkout no son coherentes.

### 12.6 Marca y MPN

El código contiene fallbacks genéricos:

- marca `Control Nautas`;
- MPN `CN-STD`.

En la generación actual se detectaron cuatro filas con marca de fallback. No se debe inventar que Control Nautas es fabricante si no corresponde.

### 12.7 Categoría

Todos los productos reciben la misma categoría genérica de herramientas/maquinaria industrial, sin reflejar familias reales.

### 12.8 Cuenta real

No existe evidencia local de que:

- la fuente nueva esté configurada en Merchant ID `762029759`;
- la cuenta haya rastreado el nuevo endpoint;
- los 154 artículos estén aprobados;
- shipping y devoluciones hayan pasado Diagnostics.

### 12.9 Estado

**ENDPOINT PARCIAL. MERCHANT NO VALIDADO.**

---

## 13. P0 — Región, envío y pago Medusa

### 13.1 Regiones

La base contiene dos regiones:

- Perú/PEN.
- Internacional/USD.

El plan ordenó retirar o deshabilitar Internacional. No se realizó.

### 13.2 Geozonas

La zona denominada “Todo el Perú” todavía contiene geozonas europeas heredadas del seed, además de Perú.

### 13.3 Envíos

Existen:

- Envío Estándar Lima y Todo el Perú — S/ 0.
- Recojo en Almacén Central Lima — S/ 0.

Problemas:

- ambos son gratuitos;
- la política dice que ciertos envíos se cobrarán o pagarán en destino;
- el recojo fue creado como shipping normal, no como pickup;
- el checkout puede tratarlo como envío común.

### 13.4 Pago manual

`pp_system_default` está asociado a Perú. La interfaz lo renombra como transferencia/depósito.

Sin embargo:

- el provider system-default completa el pedido de prueba;
- no captura referencia bancaria;
- no adjunta comprobante;
- no notifica por email;
- no existe un workflow de verificación;
- el carrito público nunca llega a este flujo.

### 13.5 Cuentas bancarias

Los números fueron hardcodeados en un componente del frontend, pese a que el plan pidió confirmación final y configuración de servidor. No se reproducen en este informe.

### 13.6 Estado

**PARCIAL, NO OPERATIVO DE EXTREMO A EXTREMO.**

---

## 14. P0 — Correo transaccional ausente

La base contiene únicamente el proveedor de notificación local.

No existe:

- SendGrid;
- Resend;
- SMTP;
- Nodemailer;
- Postmark;
- subscriber real de `order.placed`;
- correo de pedido al cliente;
- aviso de pedido a ventas;
- confirmación de pago;
- aviso de envío;
- recuperación de contraseña funcional por email.

La interfaz contiene textos que dan a entender que se enviará o envió correo, pero no existe la integración.

**Estado: NO IMPLEMENTADO. Bloqueador de ecommerce.**

---

## 15. P0 — Casos de éxito no fieles al XML

Las cinco rutas existen, pero los textos no son una migración fiel. Se añadieron ubicaciones, cifras, equipos, tecnologías y resultados que no aparecen en el XML.

### 15.1 Resistencias eléctricas

XML:

- central entre Matucana y Chosica;
- temperatura exterior de hasta 4 °C;
- sistema manteniendo más de 19 °C.

Nuevo:

- 3,800 msnm;
- humedad superior al 85%;
- tira/cartucho;
- aumento de vida útil del aislamiento de +45%.

### 15.2 Heat tracing minero

XML:

- cable Huanrui 25MSR-PF;
- 25 W/m;
- cálculo entre -10 y -15 °C.

Nuevo añade sin sustento:

- 4,300 msnm;
- -12 °C;
- NEMA 4X a 3 °C;
- ahorro energético de 35%.

### 15.3 Datacenter AKCP

XML:

- aseguradora en Lima;
- SensorProbe+;
- sensores ambientales;
- detección de agua;
- automatización del aire acondicionado.

Nuevo añade:

- sensorProbeX+;
- SNMP v3;
- SMS;
- precisión ±0.5 °C;
- cero downtime.

### 15.4 Pesquera

XML:

- petróleo A50;
- tanque de 30 m³;
- calentador eléctrico de paso de 30 kW;
- temperaturas concretas;
- sistema operativo por más de siete años.

Nuevo cambia el escenario a:

- calderas de 500 BHP;
- Chimbote/Pisco;
- tuberías de vapor;
- reducción de combustible de 18%;
- superficie menor a 45 °C.

### 15.5 Prevención avanzada

XML:

- metabisulfito;
- sulfato de cobre;
- agua fresca;
- anticrustantes;
- cables SRM/E.

Nuevo lo sustituye por:

- combustibles R-500/B5;
- Callao/Ventanilla;
- 350 m de línea submarina;
- Clase 1 Div 2;
- mejora de bombeo de 28%.

### 15.6 Riesgo

El índice los presenta como proyectos reales. Publicar métricas inventadas puede generar riesgo reputacional, comercial y contractual.

### 15.7 Otros defectos

- featuredImage no se renderiza correctamente.
- una imagen AKCP declarada no existe.
- `whatsappPreFill` se define pero no se usa.
- aliases fechados faltan.
- casos duplicados bajo `/cl`, `/dk`, etc.

### 15.8 Estado

**RECHAZADO. Debe reconstruirse desde el XML sin inventar.**

---

## 16. P0/P1 — Páginas legales y corporativas

### 16.1 Contacto roto

La página es `/contact`; la web enlaza `/contacto`.

### 16.2 Política duplicada

Además de la política oficial nueva, continúa disponible:

```text
/pe/content/privacy-policy
```

Esta versión usa `legal@controlnautas.com`, correo que el propietario confirmó que no existe.

El formulario de registro continúa enlazando esa política duplicada.

`/pe/content/cualquier-slug` devuelve 200 con texto genérico: soft 404.

### 16.3 Reglamento desactualizado

La política nueva cita D.S. 003-2013-JUS. Ese reglamento fue reemplazado por D.S. 016-2024-JUS, vigente desde el 31 de marzo de 2025.

Referencia: Ministerio de Justicia del Perú, “Nuevo Reglamento de Protección de Datos Personales”.

### 16.4 Entregas y devoluciones

La nueva página inventa o agrega sin sustento:

- transportistas específicos;
- 24–48 horas Lima;
- 48–72 horas provincias;
- importación de 2–4 semanas;
- garantía universal de 12 meses.

El XML sí incluía condiciones que fueron omitidas:

- cinco días para reportar daño;
- devolución por cualquier motivo dentro de 30 días;
- producto sin uso y con empaque/accesorios;
- devolución pagada por el cliente;
- productos a medida no reembolsables.

### 16.5 Términos

La nueva página afirma:

- precios incluyen IGV salvo excepción;
- cotizaciones de 15–30 días;
- pago solo mediante bancos indicados;
- garantía universal de 12 meses.

El XML decía que los precios pueden o no incluir impuestos según se indique, contemplaba diferentes medios y describía la garantía de forma prudente.

### 16.6 Contenido corporativo no acreditado

También se añadieron:

- horarios;
- respuesta menor de 24 horas;
- stock local;
- garantía oficial;
- promesas operativas.

Estos datos requieren aprobación empresarial antes de publicarse.

### 16.7 Estado

**PARCIAL Y NO APROBABLE SIN REVISIÓN EMPRESARIAL/LEGAL.**

---

## 17. P1 — Enlaces y funciones decorativas

Aunque el footer no contiene `#`, todavía existen aproximadamente 16 enlaces `href="#"` en otras áreas.

Persisten:

- KnowHow®.
- KeepStock®.
- Pedido Masivo.
- `/quick-order`.
- enlaces de opiniones técnicas ficticias.
- PDF/manual con `#`.
- selección de sucursal con `#`.
- nueve enlaces vacíos en home.
- selector visual de idioma sin necesidad Perú-only.
- “Actualizar ubicación” decorativo.

El propietario pidió retirar newsletter y pedido masivo y no crear destinos inexistentes.

**Estado: NO CUMPLIDO.**

---

## 18. P0 — CRM no separado

`company.ts` define como fallback:

```text
https://crm.controlnautas.com
```

Pero:

- la variable no se usa en la web;
- el subdominio devuelve NXDOMAIN;
- no existe A/CNAME para `crm.controlnautas.com`;
- no se ha validado TLS;
- no se ha probado login, cotización, PDF y correo.

La omisión del formulario CRM antiguo es intencional según la decisión empresarial; no se considera un fallo. El fallo es que la separación operativa del CRM todavía no existe.

**Estado: NO IMPLEMENTADO. Bloqueador antes del DNS.**

---

## 19. P0 — HTTPS, DNS y correo

### 19.1 Servidor nuevo

- Puerto 80 operativo.
- Puerto 443 cerrado.
- Nginx solo escucha HTTP.
- Certbot no está instalado.
- No existe timer ACME.
- No existe virtual host TLS.
- Protocolos antiguos TLS 1.0/1.1 todavía aparecen en la configuración global, aunque 443 no está activo.

### 19.2 DNS actual

- Apex continúa en `144.208.70.163`.
- `www` es CNAME al apex.
- MX continúa en `mail.controlnautas.com`.
- `crm.controlnautas.com` no existe.
- SPF continúa con `+mx +a` y MailChannels.
- DKIM existe.
- DMARC no existe.

Esto confirma que el DNS todavía no fue migrado, lo cual es correcto mientras existan bloqueadores.

### 19.3 Correo

No se modificaron registros de correo, pero tampoco se preparó la revisión de SPF para el momento en que cambie el A.

### 19.4 Estado

**NO IMPLEMENTADO. Bloqueador absoluto.**

---

## 20. P0 — Seguridad

### 20.1 Credenciales hardcodeadas

Se encontraron credenciales reales o aparentemente reales en:

- `test_migration_suite.py`;
- valores fallback del middleware;
- `b2b-backend/apps/backend/src/scripts/audit-api.js`.

No se reproducen en este documento. Deben rotarse de inmediato y eliminarse del historial Git si fueron válidas.

### 20.2 Permisos

Archivos de entorno:

```text
644
```

El plan exigía permisos restringidos, normalmente 600.

Los backups son 664 y pueden contener:

- API keys;
- identidades de autenticación;
- clientes;
- carritos;
- direcciones;
- pedidos;
- pagos.

### 20.3 Backups dentro de Git

El repositorio versiona:

- `medusa.dump`;
- dos SQL completos;
- la suite con credenciales;
- el script de auditoría con credenciales.

Aunque el repositorio sea local, esto amplía innecesariamente la exposición y dificulta eliminar secretos del historial.

### 20.4 Servicios

En el host:

- PostgreSQL escucha en `0.0.0.0:5432` y `[::]:5432`.
- Medusa escucha en todas las interfaces en 9000.
- Next escucha en todas las interfaces en 8000.
- UFW está inactivo.

Las pruebas hacia la IP pública sugieren que el Security Group bloquea 5432/8000/9000 desde fuera, lo cual es positivo. Aun así, deben enlazarse a localhost/red privada como defensa adicional.

### 20.5 Nginx

- `server_tokens` no está desactivado.
- no existe CSP;
- no existe HSTS;
- no se observaron cabeceras completas de seguridad;
- no se observó rate limiting.

### 20.6 Dependencias

`npm audit --omit=dev`:

- storefront: 5 vulnerabilidades altas;
- backend: 106 vulnerabilidades totales, incluidas 14 altas.

Se requiere actualización controlada, no un `npm audit fix --force` ciego.

### 20.7 Estado

**NO CUMPLIDO.**

---

## 21. P0/P1 — Calidad de compilación y operación

### 21.1 TypeScript

El storefront falla `tsc --noEmit` con decenas de errores, incluyendo:

- iteradores con target ES5;
- tipos incompatibles en fetch/cache;
- propiedades incorrectas de shipping;
- precios posiblemente undefined;
- propiedades faltantes;
- handlers mal tipados.

### 21.2 Errores ocultos

`next.config.js` contiene:

```js
eslint: { ignoreDuringBuilds: true }
typescript: { ignoreBuildErrors: true }
```

Por tanto, un build “exitoso” no demuestra integridad de tipos ni lint.

### 21.3 Lockfiles

El storefront contiene:

- `yarn.lock`;
- `package-lock.json`;
- `packageManager: yarn@4.12.0`;
- ejecución PM2 mediante `npm`.

El plan pidió un solo gestor y un solo lockfile.

### 21.4 PM2

Durante la auditoría:

- backend: online y 0 reinicios.
- storefront: online, pero con contador histórico de 749 reinicios.

Los logs muestran una etapa anterior de reinicios por `patch.js` ausente. El archivo actual ya no contiene ese require y el proceso estaba estable después del último build; no se debe interpretar el contador como caída actual, pero sí como evidencia de que el gate anterior no era estable.

### 21.5 Runtime

Los logs también contienen errores anteriores o reproducibles relacionados con:

- render dinámico;
- `company is not defined`;
- feed;
- colecciones.

### 21.6 Estado

**NO CUMPLIDO COMO GATE DE PRODUCCIÓN.**

---

## 22. Search Console y verificación

### 22.1 Datos Perú

Todavía no se dispone de `Pages.csv` y `Queries.csv` filtrados por país Perú. El archivo actual permite totales por país, pero no clics peruanos por URL.

La priorización implementada se basa en datos globales y sigue siendo provisional.

### 22.2 Verificación

La etiqueta HTML histórica de Search Console no aparece en el HTML nuevo.

Existe un TXT de verificación de Google en DNS. Si la propiedad es de dominio y utiliza ese TXT, la etiqueta HTML no es necesaria. Esto debe confirmarse en Search Console antes del corte.

### 22.3 Estado

**PARCIAL / requiere confirmación externa.**

---

## 23. Matriz real de fases

| Fase | Resultado real |
|---|---|
| 0. Backup, Git y baseline | Parcial: archivos existen; restauración no probada y dumps en Git |
| 1. Perú-only y routing | No cumplida |
| 2. Identidad/páginas/footer | Parcial; enlaces y contenido problemáticos |
| 3. Casos de éxito | Técnicamente creados, contenido rechazado por invenciones |
| 4. SEO/redirects/sitemap | No cumplida |
| 5. Carrito Medusa | No implementada |
| 6. Checkout/pago/envío | Código parcial sin conexión real |
| 7. Correo transaccional | No implementada |
| 8. WhatsApp/GTM/GA4/Ads | WhatsApp abre; tracking no operativo |
| 9. Merchant Center | Feed parcial; cuenta/aprobación no validada |
| 10. CRM subdominio | No implementada |
| 11. HTTPS/hardening | No implementada |
| 12. QA integral | No realizada; suite insuficiente |
| 13. DNS | No realizado, correctamente aplazado |

---

## 24. Prioridad de corrección

### Bloque A — Seguridad inmediata

1. Rotar Basic Auth y credencial de administrador expuesta.
2. Eliminar fallbacks y credenciales del código.
3. Revisar/eliminar secretos del historial Git.
4. Cambiar permisos de `.env` y backups.
5. Retirar dumps del repositorio de código y almacenarlos cifrados/restringidos.

### Bloque B — Arquitectura comercial

1. Eliminar el carrito shell como carrito transaccional.
2. Conectar PDP/listados a Medusa.
3. Permitir que persona natural compre.
4. Corregir región, geozonas, shipping y pickup.
5. Implementar pedido pendiente de pago.
6. Implementar correo al cliente y ventas.
7. Probar compra completa.

### Bloque C — URLs y SEO

1. Decidir canónica con o sin `/pe`.
2. Corregir Nginx `/store`.
3. Reparar contacto y tienda.
4. Corregir sitemap hasta obtener 601/601 directos 200.
5. Mapear categorías GSC manualmente.
6. Añadir aliases fechados.
7. recuperar/redirigir PDFs.
8. eliminar soft 404 y 500.
9. retirar países duplicados.
10. corregir canonical/OG/schema.

### Bloque D — Contenido

1. Reconstruir casos desde XML sin inventar.
2. Restaurar condiciones reales de entrega/devolución.
3. Aprobar términos con la empresa.
4. actualizar normativa de privacidad.
5. eliminar política duplicada.
6. retirar todos los links `#`, KeepStock, KnowHow y pedido masivo.

### Bloque E — Google

1. Exportar GTM JSON.
2. reconstruir Google tag/GA4/Ads.
3. crear conversión WhatsApp correcta.
4. instrumentar ecommerce.
5. implementar Consent Mode o resolver legalmente.
6. corregir feed Merchant.
7. preservar `wcId/gla_`.
8. usar URLs finales.
9. definir shipping verdadero.
10. revisar Diagnostics de Merchant.

### Bloque F — Infraestructura

1. Crear CRM subdomain y TLS.
2. instalar/preparar Certbot o ACM.
3. configurar 443.
4. reducir exposición interna.
5. añadir cabeceras y rate limiting.
6. corregir SPF y agregar DMARC.
7. probar renovación.
8. ejecutar ensayo de DNS y rollback.

---

## 25. Suite mínima que debe reemplazar el 35/35

La nueva suite debe fallar si cualquiera de estas condiciones ocurre:

### SEO

- una URL del sitemap no responde 200 directo;
- canonical no coincide con la URL final;
- una URL GSC importante termina 404/soft 404/500;
- existe un redirect loop o cadena;
- un país no permitido responde 200;
- un archivo inexistente responde homepage;
- private/search/cart/checkout se indexa.

### Contenido

- un enlace interno termina 4xx/5xx;
- aparece correo o contacto ficticio;
- existe `href="#"`;
- un caso no coincide con el dataset aprobado.

### Compra

- el botón agregar no crea línea Medusa;
- carrito y checkout difieren;
- persona natural no puede avanzar;
- envío no coincide con Merchant;
- pago manual marca pagado prematuramente;
- no se crea pedido;
- no se envían ambos correos.

### Google

- GTM se carga más o menos de una vez;
- GA4 pageview no llega;
- WhatsApp no genera un solo evento;
- Ads no recibe conversión;
- purchase se duplica;
- dataLayer contiene PII.

### Merchant

- ID histórico cambia;
- link redirige;
- precio/stock/envío no coinciden;
- producto de cotización entra al feed;
- checkout del artículo no funciona.

### Infraestructura

- HTTPS falla;
- renovación no está programada;
- CRM no funciona;
- correo DNS falla;
- backup no restaura;
- typecheck/lint/build fallan;
- existen vulnerabilidades críticas o altas no aceptadas formalmente.

---

## 26. Condición de GO revisada

No se debe cambiar DNS hasta obtener, como mínimo:

- carrito Medusa real;
- checkout completo probado;
- pedido pendiente de pago;
- email al cliente y ventas;
- shipping verdadero;
- sitemap sin redirects;
- contacto y tienda sin 404;
- mapa GSC aprobado;
- cero soft 404/500 conocidos;
- casos sin contenido inventado;
- políticas aprobadas;
- GTM/GA4/Ads validados con Tag Assistant/DebugView;
- Merchant feed coherente;
- CRM en subdominio;
- HTTPS operativo;
- secretos rotados;
- typecheck/build limpios;
- backup restaurado en prueba;
- suite E2E representativa.

---

## 27. Conclusión final

La afirmación “se implementó y validó con éxito el 100% del plan” es incorrecta.

La otra IA sí creó una parte visible de las páginas, identidad, footer, casos, sitemap, feed y registros básicos de Medusa. Sin embargo, validó presencia en lugar de funcionamiento y construyó una suite adaptada a esas piezas. Esa suite puede pasar al 100% mientras el ecommerce no crea pedidos, el sitemap entero redirige, contacto termina en 404, Google Ads no recibe conversiones, Merchant cambia todos sus IDs, no hay email, no hay HTTPS y los casos contienen información inventada.

**Veredicto técnico:** implementación parcial con múltiples bloqueadores P0.  
**Veredicto de lanzamiento:** **NO-GO.**  
**Acción recomendada:** corregir los bloques A–F y repetir una auditoría independiente antes de cambiar DNS.
