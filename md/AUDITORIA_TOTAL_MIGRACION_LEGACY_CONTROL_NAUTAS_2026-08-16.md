# Megaplán técnico corregido de migración — Control Nautas

**Documento maestro de implementación**  
**Fecha de revisión:** 17 de agosto de 2026  
**Proyecto nuevo:** Next.js + Medusa  
**Sitio legado auditado:** WordPress/WooCommerce exportado como HTML, XML y SQL  
**Dominio final:** `https://controlnautas.com`  
**Mercado objetivo:** Perú  
**Moneda:** PEN — soles peruanos

> Este documento reemplaza el plan anterior contenido en este mismo archivo. Incorpora las decisiones empresariales comunicadas por Control Nautas y los hallazgos adicionales obtenidos de Google Search Console, el XML de WordPress, la base de datos SQL, el feed de Merchant Center y la configuración actual de Next.js/Medusa.

> La auditoría fue realizada en modo lectura. No se han modificado la aplicación, los productos, la base de datos, el servidor, Google Analytics, Google Ads, Google Tag Manager, Merchant Center, DNS ni el CRM. La única escritura realizada es la actualización solicitada de este informe Markdown.

---

## 1. Veredicto ejecutivo corregido

La migración es viable, pero todavía es **NO-GO para cambiar el DNS**. Esto no significa cancelar el proyecto: significa completar primero las correcciones y pruebas enumeradas en este plan.

El orden correcto es:

1. Reparar la aplicación nueva y terminar las funciones críticas.
2. Migrar el contenido corporativo y los casos de éxito aprobados.
3. Implementar SEO técnico, URLs, redirecciones, sitemap y metadatos.
4. Conectar correctamente Medusa, carrito, checkout, pago manual, envío y correo.
5. Implementar una sola arquitectura de medición mediante GTM.
6. Preparar Merchant Center con un subconjunto de productos realmente elegibles.
7. Separar el CRM en un subdominio y probarlo.
8. Preparar HTTPS y conservar cuidadosamente los registros de correo.
9. Ejecutar pruebas integrales.
10. Recién entonces cambiar el DNS.

### 1.1 Riesgos críticos todavía abiertos

- La aplicación nueva bloquea actualmente la indexación mediante `noindex`, `nofollow`, `robots.txt` con bloqueo total y autenticación básica.
- No existe un sitemap XML funcional.
- Las URLs históricas importantes no tienen todavía un mapa de redirección implementado.
- El middleware genera rutas duplicadas y falsos `200 OK`.
- El carrito visible no utiliza a Medusa como fuente única de verdad.
- Medusa no tiene todavía una configuración productiva coherente de región, pago, envío y notificaciones.
- Los datos de contacto publicados en la web nueva son ficticios.
- No existe aún un botón real de WhatsApp conectado a una conversión verificable de Google Ads.
- La aplicación nueva no contiene actualmente una implantación validada de GTM/GA4/Google Ads.
- El feed histórico de Merchant Center tiene deficiencias de atributos y envío.
- El servidor nuevo responde por HTTP, pero no tiene HTTPS operativo en el puerto 443.
- El CRM todavía depende del dominio que se utilizará para la tienda nueva.

### 1.2 Corrección de una conclusión anterior sobre Analytics y Ads

Cambiar el DNS **no borra** el historial de Google Analytics ni de Google Ads. Las propiedades y cuentas existen independientemente del servidor web.

El riesgo real es otro: si el sitio nuevo se publica sin los tags correctos, o los ejecuta dos veces, habrá desde ese momento una interrupción o duplicación de la medición. El historial anterior permanece, pero las sesiones, eventos y conversiones posteriores al cambio pueden quedar incompletos o inflados.

### 1.3 Decisiones empresariales ya cerradas

- El lanzamiento será solo para Perú.
- La moneda pública y transaccional será PEN.
- Se implementará un ecommerce completo, no solo una solicitud de cotización.
- El pago inicial será transferencia o depósito bancario manual.
- No se implementarán Stripe ni PayPal en esta etapa.
- El envío debe presentarse de forma verdadera y coherente; no se puede declarar gratis y cobrarlo posteriormente como regla general.
- El clic en WhatsApp desde un producto será la conversión comercial primaria.
- La compra completada será una conversión ecommerce secundaria.
- El correo operativo será `ventas@controlnautas.com`.
- El CRM se moverá a un subdominio o dominio separado antes del cambio principal.
- No se migrarán las noticias ni los artículos históricos generales.
- Sí se migrarán los casos de éxito.
- Sí se reconstruirán las páginas corporativas, legales, de contacto y entrega.
- No habrá newsletter en esta etapa.
- No se migrarán Contact Form 7 ni Mailchimp.
- No se migrarán Google Fonts Open Sans ni los videos antiguos de YouTube solo por existir en el legado.
- No se agregará una función de pedidos masivos.
- No se ampliarán wishlist o comparación si no están plenamente operativas y justificadas.
- El encabezado nuevo se conservará en lo esencial.
- El footer se reconstruirá únicamente con enlaces reales.
- Se creará un sitemap versión 1 dinámico y ampliable.
- El certificado HTTPS tendrá renovación automática.
- El DNS solo se cambiará después de completar y aprobar las pruebas.

---

## 2. Fuentes auditadas

### 2.1 Sitio legado estático

Ruta:

`/home/ubuntu/CN_Web/extra/simply-static-1-1786846676`

Se utilizó para revisar HTML, scripts, rutas, textos, datos corporativos, navegación, estructura de WooCommerce, enlaces y huellas de servicios externos.

### 2.2 Exportación XML de WordPress

Ruta:

`/home/ubuntu/CN_Web/extra/controlnautas.WordPress.2026-08-16.xml`

Hallazgos relevantes:

- 31 entradas editoriales.
- 47 páginas.
- 401 productos en el XML.
- Dos formularios de Contact Form 7, que el propietario confirma que ya no se usan.
- Contenido histórico de casos de éxito que sí debe recuperarse.

### 2.3 Base de datos SQL del WordPress antiguo

Ruta:

`/home/ubuntu/CN_Web/extra/petald5_wp794.sql`

La base permitió verificar opciones de WooCommerce, Google Site Kit, GTM, pago bancario, país, moneda, snippets y datos corporativos. No deben copiarse secretos, contraseñas ni números bancarios a código fuente o a este documento.

### 2.4 Google Search Console

Ruta:

`/home/ubuntu/CN_Web/extra/https___controlnautas.com_-Performance-on-Search-2026-08-16`

Periodo: últimos 16 meses.

Resumen del conjunto exportado:

- 1,000 URLs incluidas en el informe de páginas.
- 3,552 clics acumulados en páginas.
- 85,518 impresiones.
- Perú: 1,046 clics y 34,348 impresiones en el informe agregado por país.
- Merchant Listings: 1,594 clics.
- Product snippets: 428 clics.
- Review snippets: 86 clics.

Limitación importante: el archivo de páginas no está filtrado por país. El archivo de países solo contiene totales agregados, por lo que no permite atribuir a Perú los clics de cada URL individual. Antes de cerrar el mapa SEO se necesita otra exportación de `Páginas` y `Consultas` aplicando el filtro `País = Perú`.

### 2.5 Exportación de Merchant Center

Ruta:

`/home/ubuntu/CN_Web/extra/products_2026-08-16_16-43-12/products_2026-08-16_16-43-12.tsv`

Hallazgos principales:

- 180 artículos exportados.
- 179 indicados como disponibles.
- 1 indicado como agotado.
- Los 180 tienen precio en el archivo.
- 156 no tienen marca informada.
- 160 no tienen MPN.
- 176 no tienen condición.
- 143 no tienen peso de envío.
- 179 contienen un valor de envío incompleto equivalente a `PE:`.
- Solo uno contiene explícitamente `PE:0.00 PEN`.

### 2.6 Proyecto nuevo Next.js + Medusa

Se revisaron el frontend, su middleware, metadata, rutas, páginas, footer, carrito visible, configuración del backend y datos actuales de Medusa.

Resumen actual de Medusa:

- 523 productos.
- 523 variantes internas: una variante por producto.
- 154 productos con precio fijo en PEN.
- 369 productos configurados como cotización o sin precio transaccional válido.
- 113 productos de cotización aparecen simultáneamente como comprables, lo que es inconsistente.
- Existe una región Perú/PEN y una región internacional/USD que debe retirarse o deshabilitarse.
- El proveedor de pago manual existe, pero su asociación regional es inconsistente o huérfana.
- Las opciones de envío visibles son de demostración y tienen importes en EUR/USD, no PEN.
- El proveedor de notificaciones actual es local, no apto para producción.

---

## 3. Arquitectura objetivo

### 3.1 Dominio público

- URL canónica: `https://controlnautas.com`
- Variante `www`: redirección permanente hacia la URL canónica o CNAME al apex con una única política canónica.
- Mercado: Perú.
- Idioma: español.
- Moneda: PEN.
- No exponer públicamente prefijos artificiales como `/pe`, `/cl`, `/co`, `/mx`, `/dk` o `/us`.

### 3.2 Aplicación

- Next.js: frontend, navegación, contenido corporativo, SEO y páginas de compra.
- Medusa: catálogo, variante interna, precio, disponibilidad, carrito, regiones, envío, pago y pedidos.
- GTM: capa única de orquestación de medición.
- GA4: analítica y eventos.
- Google Ads: conversiones de WhatsApp y compra.
- Merchant Center: solo productos realmente aptos para compra.
- Proveedor SMTP o SendGrid/Resend: correos transaccionales.
- CRM antiguo: subdominio separado temporalmente.

### 3.3 Fuente única de verdad

Medusa debe ser la fuente única de verdad para:

- ID de producto.
- Variante interna.
- Precio.
- Moneda.
- Disponibilidad.
- Condición de compra o cotización.
- Carrito.
- Región.
- Envío.
- Método de pago.
- Pedido.

El frontend no debe conservar un segundo carrito transaccional en JSON o `localStorage` desconectado de Medusa.

---

## 4. Identidad empresarial y contacto

### 4.1 Datos reales que deben reemplazar todos los datos ficticios

- **Razón social:** CONTROL NAUTAS S.A.C.
- **RUC:** 20610965807
- **Dirección:** Av. General Eugenio Garzón 2099, Jesús María, Lima 15072, Perú
- **Teléfono y WhatsApp:** +51 950 302 141
- **Correo:** `ventas@controlnautas.com`

### 4.2 Datos falsos que deben eliminarse

- `(01) 800-NAUTAS`
- `(01) 456-7890`
- `+51 987 654 321`
- `Av. Industrial 1234`
- `RUC 20601234567`
- Correos ficticios como soporte, legal o mesa de partes que no existan realmente.

### 4.3 Implementación técnica

Centralizar la identidad en una sola configuración tipada, por ejemplo:

```ts
export const company = {
  legalName: "CONTROL NAUTAS S.A.C.",
  taxId: "20610965807",
  email: "ventas@controlnautas.com",
  phoneDisplay: "+51 950 302 141",
  phoneE164: "+51950302141",
  address: "Av. General Eugenio Garzón 2099, Jesús María, Lima 15072, Perú",
}
```

Esta configuración debe alimentar header, footer, contacto, checkout, datos estructurados, plantillas de correo y WhatsApp. Así se evita que vuelvan a aparecer datos contradictorios.

### 4.4 Criterios de aceptación

- No queda ningún teléfono, dirección, RUC o correo ficticio en el código renderizado.
- El teléfono utiliza un enlace `tel:+51950302141`.
- WhatsApp utiliza `https://wa.me/51950302141`.
- El correo utiliza `mailto:ventas@controlnautas.com`.
- Los datos visibles coinciden con los de `Organization`/`LocalBusiness` en JSON-LD.

---

## 5. Contenido corporativo y casos de éxito

### 5.1 Páginas que sí deben existir en la web nueva

- Inicio.
- Tienda o catálogo.
- Nosotros.
- Contacto.
- Entregas y devoluciones.
- Términos y condiciones.
- Política de privacidad.
- Casos de éxito.
- Carrito.
- Checkout.
- Confirmación o estado de pedido, sin reutilizarla como conversión histórica obsoleta.

### 5.2 Casos de éxito que se deben migrar

El XML contiene cinco casos relevantes:

1. Resistencias eléctricas para prevenir cortocircuitos.
2. Heat tracing para evitar congelamiento.
3. Implementación AKCP en datacenter.
4. Lana de roca para calderas pesqueras.
5. Prevención avanzada de congelamiento mediante heat tracing.

Cada caso debe reconstruirse como contenido limpio, no como una copia ciega del HTML de WordPress.

Campos recomendados:

- Título.
- Slug definitivo.
- Resumen.
- Industria.
- Problema.
- Solución.
- Tecnología o productos utilizados.
- Resultado.
- Imágenes aprobadas.
- Fecha original, si aporta contexto.
- Autor institucional.
- Metadata SEO.
- CTA de WhatsApp.

Implementación recomendada: MDX o un sistema de contenido versionado en el repositorio. Para cinco casos no se justifica introducir un CMS complejo en esta etapa.

### 5.3 Alias históricos de los casos

Las variantes antiguas con fecha y sin fecha deben redirigir a:

`/casos-de-exito/{slug}/`

También deben resolverse rutas históricas con señales de búsqueda, como:

- Paneles sándwich para aislamiento de discoteca en Perú.
- Lana de roca para aislamiento de tuberías de hospital en Perú.
- Heat tracing para agua caliente en Perú.

Si el contenido exacto ya no se conservará, deben redirigirse al caso de éxito o categoría más equivalente. No deben redirigirse indiscriminadamente a la portada.

### 5.4 Contenido que no debe migrarse

- Noticias antiguas de automatización sin valor actual.
- Artículos editoriales generales que no sean casos de éxito.
- Páginas automáticas del tema WordPress.
- Páginas duplicadas de WooCommerce que Medusa reemplaza.
- Formularios antiguos de Contact Form 7.
- Newsletter y Mailchimp.
- Videos de YouTube solo porque estaban embebidos antes.
- Fuentes Open Sans del tema antiguo.
- Shortcodes, widgets y residuos del constructor WordPress.

### 5.5 Redirección de artículos que no se migran

- Artículo con tráfico y equivalente claro: `301` o `308` al producto, categoría o caso relacionado.
- Artículo sin tráfico ni equivalente: `410 Gone` o `404` real.
- Artículo dudoso: conservar temporalmente en inventario hasta tener el informe de Perú por URL.

---

## 6. Footer, navegación y funciones decorativas

### 6.1 Problema actual

El footer nuevo contiene al menos 26 enlaces con `href="#"` y un formulario de boletín sin procesamiento. Eso genera una apariencia de funcionalidad que no existe.

### 6.2 Footer objetivo

El footer debe enlazar únicamente a destinos publicados y útiles:

**Empresa**

- Nosotros.
- Contacto.
- Casos de éxito.

**Compra y soporte**

- Tienda.
- Entregas y devoluciones.
- Términos y condiciones.
- Política de privacidad.

**Contacto**

- Dirección real.
- WhatsApp y teléfono real.
- `ventas@controlnautas.com`.

### 6.3 Elementos a retirar mientras no exista su destino

- Trabaja con nosotros.
- Inversionistas.
- Prensa.
- Sostenibilidad.
- Proveedores.
- Clientes.
- Sucursales.
- Aplicaciones.
- KeepStock.
- KnowHow.
- Protección.
- Catálogos inexistentes.
- Redes sociales sin perfil real.
- Newsletter.
- Pedido masivo.

### 6.4 Regla de calidad

No debe existir ningún enlace `#`, botón sin acción, formulario sin endpoint o contacto ficticio en la versión publicable.

---

## 7. Estrategia de URLs y redirecciones SEO

### 7.1 Rutas públicas recomendadas

```text
/
/producto/{slug}/
/categoria-producto/{slug}/
/tienda/
/nosotros/
/contacto/
/entregas-y-devoluciones/
/politica-de-privacidad/
/terminos-y-condiciones/
/casos-de-exito/
/casos-de-exito/{slug}/
/carrito/
/checkout/
```

La forma exacta puede ajustarse para maximizar la conservación de URLs históricas. Siempre que sea posible, conviene mantener la misma URL canónica que ya recibe tráfico.

### 7.2 Distribución histórica de clics en la exportación disponible

- Productos: aproximadamente 2,686 clics.
- Categorías de producto: aproximadamente 281 clics.
- Portada: aproximadamente 322 clics.
- Entradas editoriales: aproximadamente 185 clics.
- Categorías editoriales: aproximadamente 2 clics.

Esto confirma que productos, portada y categorías de producto son las áreas de mayor riesgo SEO. Aunque los productos ya fueron revisados funcionalmente, sus URLs históricas todavía necesitan una validación de migración.

### 7.3 Coincidencia de productos

Se compararon 328 slugs canónicos de producto encontrados en Search Console:

- 318 tienen coincidencia exacta con handles del proyecto nuevo.
- Esas coincidencias representan aproximadamente 2,549 clics del informe global.
- 10 requieren alias o revisión manual.
- Esas 10 representan aproximadamente 137 clics.

Alias prioritarios conocidos:

| URL o slug legado | Destino nuevo propuesto | Motivo |
|---|---|---|
| `panel-de-lana-de-roca-rockwool-prorox-sl-920` | `lana-de-roca-rockwool-prorox-sl-920` | Aproximadamente 93 clics; máxima prioridad |
| `controlador-de-temperatura-de-3-salidas-independientes-n323` | `controlador-novus-n323-pt100-rs485` | Cambio de nombre técnico |
| `sensorprobex-akcp` | `akcp-sensorprobex` | Orden distinto de marca/modelo |
| `cubierta-resistente-al-agua-fo-cover-24` | `funda-resistente-al-agua-fo-cover-24` | Sinónimo cubierta/funda |
| Horner X4/X7 históricos | Producto equivalente confirmado | Revisión manual necesaria |
| Novus Telik histórico | Producto equivalente confirmado | Revisión manual necesaria |
| Contenedor modular histórico | Categoría o producto equivalente | Revisión manual necesaria |

No se debe implementar una coincidencia aproximada automática sin revisión humana para equipos industriales, porque un redirect hacia un modelo equivocado puede afectar SEO y generar una consulta técnica incorrecta.

### 7.4 Documentos técnicos con tráfico

Los PDF históricos también deben inventariarse. Entre los que aparecen con tráfico se encuentran:

- `TZ-THT-03R`: aproximadamente 69 clics.
- `XL4`: aproximadamente 27 clics.
- `TempU04`: aproximadamente 19 clics.
- `TZ-BT06`: aproximadamente 16 clics.

Para cada PDF:

- Mantener la URL si el documento sigue vigente.
- Reubicarlo con redirección directa si cambia de ruta.
- Sustituirlo por la revisión nueva solo si corresponde al mismo modelo.
- Retirarlo con `410` si está obsoleto y no existe sustituto.
- Evitar enviarlo a la portada.

### 7.5 Manifiesto de redirecciones

Crear un archivo versionado, por ejemplo `seo/redirects.csv`, con estas columnas:

```text
source_url,normalized_source,peru_clicks,global_clicks,target_url,action,reason,verified
```

Valores permitidos en `action`:

- `redirect_301`
- `redirect_308`
- `keep_200`
- `gone_410`
- `not_found_404`
- `manual_review`

### 7.6 Política correcta para errores

No se recomienda redirigir todos los errores a la página principal.

- URL antigua con reemplazo real: `301` o `308` al equivalente.
- URL eliminada deliberadamente y sin equivalente: `410`.
- URL desconocida o mal escrita: `404` real.
- Error interno: `500` real, con registro, alerta y opción visible de volver al inicio.

Una página 404 puede ser útil y agradable: debe incluir buscador, categorías principales, enlace al inicio y WhatsApp. Sin embargo, su código HTTP debe seguir siendo 404. Redirigir todo al inicio produce soft 404, confunde a Google y reduce la calidad del rastreo.

### 7.7 Parámetros heredados

Normalizar o eliminar mediante redirect los parámetros WordPress/WooCommerce que no representan contenido único:

- selección manual histórica de país;
- `add-to-cart` legado;
- banderas y parámetros de geolocalización;
- estrellas y filtros antiguos;
- ordenamientos que no deban indexarse.

Los parámetros UTM pueden preservarse durante la navegación y medición, pero el canonical debe apuntar a la URL limpia.

---

## 8. SEO técnico de la aplicación nueva

### 8.1 Bloqueos que deben mantenerse en staging y retirarse en producción

Actualmente existen:

- `noindex` y `nofollow` en el layout.
- `robots.txt` con `Disallow: /`.
- autenticación básica.

Estos controles son adecuados para impedir que se indexe una versión en construcción. Deben retirarse como una tarea de lanzamiento controlada, no varios días antes.

### 8.2 Middleware

El middleware actual compara códigos de país con `includes()`. Esto permite duplicados como:

- `/peru`
- `/pepe`
- `/hope`
- `/super`
- `/pepe/contact`

También permite que rutas con extensión, por ejemplo `/foo.xml`, `/missing.jpg` o `/manifest.json`, evadan la lógica normal y terminen mostrando la portada con código 200.

Corrección:

- Eliminar el prefijo de país para este proyecto Perú-only, o realizar una coincidencia exacta de segmento.
- No redirigir por geolocalización.
- No servir la portada como fallback universal.
- Tratar extensiones y archivos inexistentes como 404.
- Crear pruebas unitarias de rutas antes del lanzamiento.

### 8.3 Soft 404 y errores

Se observaron comportamientos como:

- `/content` y `/store` respondiendo 200 con contenido que no corresponde.
- Colección inexistente generando 500.
- `/sitemap.xml` y `/sitemap_index.xml` respondiendo con la portada HTML y código 200.

Se debe usar `notFound()` de Next.js para recursos ausentes y establecer el status apropiado en cada capa.

### 8.4 Sitemap versión 1

Implementar `src/app/sitemap.ts` dinámico.

Debe incluir:

- Portada.
- Páginas corporativas publicadas.
- Productos publicados y canónicos.
- Categorías públicas válidas.
- Casos de éxito.

Debe excluir:

- Carrito.
- Checkout.
- Cuenta y autenticación.
- Pedidos privados.
- Búsquedas internas.
- URLs con filtros u ordenamientos.
- API.
- Admin.
- CRM.
- Cotizaciones privadas.
- Recursos no publicados.

Con aproximadamente 523 productos basta un sitemap único en la versión inicial. Se puede dividir en índices cuando el volumen lo justifique.

`robots.txt` debe enlazarlo explícitamente:

```text
User-agent: *
Allow: /
Sitemap: https://controlnautas.com/sitemap.xml
```

### 8.5 Metadata

Cada página indexable necesita:

- `title` único.
- `description` útil.
- canonical absoluto HTTPS.
- Open Graph con nombre, descripción, URL e imagen reales.
- Twitter cards coherentes.
- `robots: index, follow` en producción.
- idioma `es-PE`.

Eliminar la metadata genérica observada:

- URL base `http://3.229.82.189`.
- Imagen o texto “Next.js Starter Template / Medusa Store”.

### 8.6 Datos estructurados

Implementar JSON-LD válido:

- `Organization` o `LocalBusiness` para la empresa.
- `WebSite`.
- `BreadcrumbList`.
- `Product` + `Offer` solo cuando precio, moneda, disponibilidad y compra sean reales.
- `Article` para casos de éxito.

No declarar reseñas, estrellas, precio o disponibilidad si la página no puede demostrar esos datos.

### 8.7 Hreflang

Al ser un sitio exclusivo de Perú y español, no es necesario construir una arquitectura internacional. Puede usarse `lang="es-PE"`. No se deben generar hreflang ficticios para países que no se atienden.

---

## 9. Medusa: catálogo, región y consistencia comercial

### 9.1 Región

- Mantener una región activa: Perú.
- Moneda: PEN.
- País permitido: PE.
- Eliminar o deshabilitar la región internacional/USD.
- El frontend debe obtener y conservar el `region_id` de Perú.
- Todas las operaciones del carrito deben realizarse con esa región.

### 9.2 Variantes

Medusa requiere una variante transaccional incluso cuando el producto comercialmente no tiene opciones. Por ello:

- Mantener una variante interna por producto.
- No mostrar un selector de variantes si solo existe una.
- Al agregar al carrito, resolver automáticamente la variante única.

### 9.3 Productos de precio fijo y productos de cotización

Separar claramente dos cohortes:

**Compra directa**

- Precio PEN mayor que cero.
- Disponibilidad definida.
- Variante válida.
- Elegible para carrito y checkout.
- Potencialmente elegible para Merchant Center.

**Cotización técnica**

- Sin precio final verificable.
- CTA principal de WhatsApp o solicitud de asesoría.
- No debe agregarse a un carrito con precio ficticio.
- No debe enviarse a Shopping/Merchant como compra directa.

La inconsistencia de 113 productos marcados como cotización y comprables debe resolverse con una regla única en backend y frontend.

### 9.4 Identificador estable

Conservar, cuando sea posible, el identificador histórico de Merchant:

`gla_{wcId}`

El nuevo producto debe guardar ese ID en metadata, junto con:

- SKU.
- marca.
- MPN/modelo.
- slug legado.
- URL canónica.
- estado de compra directa o cotización.

---

## 10. Carrito y checkout completo

### 10.1 Problema actual

El carrito visual de la aplicación nueva funciona como una capa local separada y no completa correctamente el flujo de Medusa. Esto impide garantizar precios, región, pedido, inventario, pago y correo.

### 10.2 Flujo objetivo

```text
Producto publicado
  → variante interna única
  → carrito Medusa para región Perú/PEN
  → datos del comprador
  → dirección de entrega/facturación
  → opción de envío real
  → transferencia o depósito manual
  → creación del pedido
  → estado pendiente de pago
  → instrucciones bancarias seguras
  → correo al cliente y a ventas
  → confirmación manual de pago
  → preparación y entrega
```

### 10.3 Campos de checkout

Campos mínimos:

- Nombres y apellidos.
- Correo.
- Teléfono.
- Dirección.
- Distrito/provincia/departamento.
- Referencia opcional.
- Tipo de comprobante.

Campos empresariales condicionales:

- Razón social.
- RUC.
- Orden de compra.
- Contacto técnico.

No se debe exigir RUC o empresa a todos los compradores, porque Merchant Center espera que una persona individual también pueda completar la compra.

### 10.4 Integridad del precio

- El precio mostrado en producto, carrito, checkout, Merchant y schema debe coincidir.
- Todos los importes deben estar en PEN.
- Impuestos, descuentos y envío deben explicarse antes de confirmar el pedido.
- No introducir importes desde el cliente sin validación del servidor.
- Recalcular el carrito en Medusa antes de crear el pedido.

### 10.5 Estado de pedido

Estados mínimos operativos:

- Pedido recibido.
- Pendiente de pago.
- Pago confirmado.
- En preparación.
- Enviado/entregado.
- Cancelado.

---

## 11. Pago por transferencia o depósito

### 11.1 Evidencia del legado

La base antigua confirma:

- WooCommerce BACS estaba habilitado.
- PayPal estaba deshabilitado.
- País Perú.
- Moneda PEN.
- Correo remitente asociado a ventas.

### 11.2 Configuración de Medusa

El proveedor de pago manual del sistema debe:

- Estar asociado realmente a la región Perú.
- Aparecer como “Transferencia o depósito bancario”.
- Permitir completar el pedido con estado pendiente de pago.
- No marcar el pago como capturado automáticamente.
- Permitir una confirmación administrativa posterior.

### 11.3 Instrucciones bancarias

Las cuentas bancarias históricas no deben copiarse desde el SQL directamente a un componente público sin una confirmación final del propietario.

Después de confirmarlas:

- Guardarlas en configuración segura del servidor o panel administrativo.
- Mostrarlas después de crear el pedido.
- Enviarlas en el correo de pedido recibido.
- No registrarlas innecesariamente en logs.
- No incluirlas en repositorios públicos.

### 11.4 Criterios de aceptación

- Un usuario puede completar el checkout sin Stripe o PayPal.
- El pedido queda registrado en Medusa.
- El pedido no figura pagado hasta la confirmación manual.
- El cliente recibe instrucciones correctas.
- Ventas recibe todos los datos del pedido.
- No se exponen secretos ni credenciales.

---

## 12. Envíos y coherencia con Merchant Center

### 12.1 Problema actual

Las opciones Standard/Express observadas son datos de demostración con valores EUR/USD. No sirven para una tienda Perú/PEN.

### 12.2 Configuración técnica

Crear en Medusa:

- Fulfillment set para Perú.
- Service zone para el territorio atendido.
- Opción u opciones de envío en PEN.
- Plazos de preparación y entrega realistas.
- Condiciones por tipo de producto, peso o ubicación si son necesarias.

### 12.3 Decisión comercial pendiente

No es válido comunicar “envío gratis” a Google y luego cobrar normalmente un importe adicional. Las alternativas correctas son:

1. Envío verdaderamente gratuito para el subconjunto anunciado, absorbiendo el costo.
2. Tarifa fija veraz que cubra razonablemente el servicio.
3. Tarifa calculada o sobreestimada, pero nunca inferior a lo que verá el comprador.
4. Ofrecer envío gratuito solo para ciertos productos o zonas mediante `shipping_label`.
5. Excluir de Merchant los equipos voluminosos o de envío necesariamente cotizable.

Recomendación: comenzar Merchant Center solo con los productos de precio fijo cuyo envío pueda ser gratuito de verdad o calculado de manera veraz. Los demás pueden recibir campañas de búsqueda y conducir a WhatsApp.

### 12.4 Política de entrega

La página “Entregas y devoluciones” debe explicar:

- Cobertura en Perú.
- Plazos estimados.
- Cómo se calcula el envío.
- Casos especiales de equipos industriales.
- Procedimiento de recepción.
- Cambios, devoluciones y garantías.
- Canal de contacto.

---

## 13. Correo transaccional

### 13.1 Estado actual

El proveedor local de notificaciones de Medusa no es una solución productiva de correo.

### 13.2 Alternativas

- SendGrid mediante el módulo oficial de Medusa.
- Resend mediante integración equivalente.
- SMTP del correo corporativo mediante un proveedor personalizado/Nodemailer.

### 13.3 Configuración

Remitente y respuesta:

`ventas@controlnautas.com`

Variables de entorno orientativas:

```text
SMTP_HOST
SMTP_PORT
SMTP_USER
SMTP_PASSWORD
SMTP_FROM
SMTP_REPLY_TO
```

Las credenciales no deben guardarse en Git ni en este informe.

### 13.4 Correos mínimos

- Confirmación de pedido al cliente.
- Aviso de pedido nuevo a ventas.
- Confirmación de pago, si se administra desde Medusa.
- Aviso de envío o entrega, si se dispone del estado.

### 13.5 Entregabilidad

- Revisar SPF después de cambiar el A del dominio.
- Mantener DKIM.
- Agregar DMARC inicialmente en modo monitoreo `p=none`.
- Verificar que From, Return-Path y proveedor sean coherentes.
- Probar Gmail, Outlook y el correo corporativo.

---

## 14. WhatsApp como conversión principal

### 14.1 Hallazgo crítico

La web nueva no contiene actualmente un enlace real `wa.me` al número corporativo. El sitio legado sí construía enlaces de WhatsApp mediante un Code Snippet aplicado a productos:

- Aproximadamente 254 productos con el snippet activo.
- Aproximadamente 7 con el snippet desactivado.

El snippet antiguo solo construía el enlace de WhatsApp; no contenía directamente el código de conversión. Por ello la medición probablemente dependía de un trigger oculto dentro de GTM.

### 14.2 Componente recomendado

Crear un componente único `WhatsAppProductCTA` que reciba:

- ID estable.
- Nombre del producto.
- Marca.
- Modelo/SKU.
- Categoría.
- URL canónica.
- Ubicación del CTA.

Mensaje sugerido:

```text
Hola Control Nautas. Deseo asesoría para el producto {nombre}, modelo {modelo}. URL: {url}
```

### 14.3 Evento dataLayer

Antes de abrir WhatsApp:

```js
window.dataLayer?.push({
  event: "whatsapp_product_click",
  lead_channel: "whatsapp",
  cta_location: "product_detail",
  item_id: "gla_...",
  item_name: "...",
  item_brand: "...",
  item_category: "...",
  currency: "PEN",
  value: 1
})
```

No incluir nombre, correo, teléfono u otra información personal en la capa de datos.

### 14.4 Configuración en GTM

- Trigger: Custom Event `whatsapp_product_click`.
- Tag GA4: evento `whatsapp_click`.
- Tag GA4 recomendado adicional: `generate_lead`.
- Tag Google Ads: conversión de lead por WhatsApp con su ID y label exactos.
- Variables dataLayer para producto, ubicación y categoría.
- Un solo disparo por clic.

### 14.5 Alcance de la conversión

El botón puede existir en:

- Ficha de producto.
- Carrito.
- Contacto.
- Casos de éxito.

Pero la conversión comercial principal solicitada debe dispararse específicamente desde productos, o diferenciar claramente `cta_location` para analizar las demás ubicaciones.

### 14.6 Resiliencia

WhatsApp debe abrir aunque:

- el usuario rechace medición;
- GTM no cargue;
- un bloqueador impida Google Analytics;
- ocurra un error de red en el evento.

El tracking nunca debe bloquear la acción comercial.

---

## 15. Google Tag Manager, GA4 y Google Ads

### 15.1 Identificadores encontrados o informados

- Contenedor GTM: `GTM-KZT9PCF`
- GA4: `G-71TVCYJE8P`
- Google Ads: `AW-11191602111`
- Google tag: `GT-NCNRWDP`
- Tag adicional que requiere aclaración: `GT-NNQ5KTK`

### 15.2 Arquitectura recomendada: una sola instalación

No se deben pegar cuatro snippets independientes “por si acaso”. Esto puede duplicar pageviews, eventos y conversiones.

Implementación correcta:

1. Instalar el contenedor `GTM-KZT9PCF` una sola vez en el layout raíz.
2. Definir dentro de GTM el Google tag principal.
3. Conectar como destinos GA4 y Google Ads según la configuración real de la cuenta.
4. Publicar tags de conversión y ecommerce dentro del contenedor.
5. No cargar simultáneamente `gtag.js` directo salvo que exista una justificación y se garantice deduplicación.

La base SQL mostró que:

- Google Site Kit tenía `useSnippet=false`.
- GTM era insertado por DuracellTomi.
- WooCommerce Analytics podía cargar GA directamente.

Esta combinación explica por qué el legado pudo funcionar sin que todos los IDs aparezcan como scripts independientes en cada HTML.

### 15.3 Conversión histórica de página de gracias

El label histórico:

`II1LCNfH3aYYEL-Xydgp`

debe considerarse retirado. No se debe migrar como conversión principal.

### 15.4 Conversión de compra encontrada

En el SQL aparece una conversión de compra más reciente asociada a Google Ads:

`_NaQCPW1tpscEL-Xydgp`

Esta corresponde al flujo de compra de WooCommerce y no debe confundirse con el clic de WhatsApp.

### 15.5 Dato todavía faltante

No se encontró de manera concluyente el label exacto de la conversión activa de WhatsApp. Para resolverlo se necesita:

- exportación JSON del contenedor GTM publicado, o
- captura/configuración de la acción de conversión actual en Google Ads.

Si la conversión histórica está mal configurada o no puede identificarse, la opción más limpia será crear una nueva conversión de WhatsApp, documentarla y publicarla mediante GTM.

### 15.6 Eventos ecommerce

Usar los eventos estándar de la aplicación nueva y alimentarlos con datos de Medusa:

- `view_item`
- `select_item`
- `add_to_cart`
- `view_cart`
- `begin_checkout`
- `add_shipping_info`
- `add_payment_info`
- `purchase`

El evento `purchase` debe dispararse una sola vez, con:

- ID único de pedido.
- valor real.
- moneda PEN.
- productos reales.
- impuestos/envío si corresponden.

No reutilizar eventos antiguos de WooCommerce si no representan el nuevo flujo.

### 15.7 Instalación técnica en Next.js

- Insertar GTM en el layout raíz mediante el mecanismo oficial de scripts de Next.js o el componente de terceros apropiado.
- Cargarlo una sola vez.
- No hardcodear IDs en múltiples componentes.
- Usar variables públicas de entorno para identificadores no secretos.
- Mantener desactivada la medición productiva en entornos locales o de staging, o enviar a una propiedad de prueba.

### 15.8 Validación

- GTM Preview/Tag Assistant.
- GA4 DebugView.
- Network requests a Google.
- Tiempo real de GA4.
- Diagnóstico de conversiones de Google Ads.
- Clic desde móvil y escritorio.
- Clic repetido y navegación SPA.
- Ausencia de pageviews dobles.
- Ausencia de conversiones duplicadas.

---

## 16. Consentimiento de cookies y privacidad en Perú

El negocio no vende en Europa, por lo que no necesita construir un mecanismo internacional complejo pensado para múltiples jurisdicciones europeas. Sin embargo, no se recomienda eliminar por completo el consentimiento de marketing: Perú también tiene reglas de protección de datos y la ANPD ha emitido criterios relacionados con cookies.

### 16.1 Solución proporcional recomendada

Implementar un aviso mínimo para Perú:

- Cookies esenciales activas para carrito y checkout.
- Botones claros “Aceptar” y “Rechazar”.
- Enlace a política de privacidad/cookies.
- GA4 y Ads condicionados a la elección cuando corresponda.
- La web y WhatsApp deben funcionar aunque se rechace.

No es necesario agregar geolocalización europea, múltiples idiomas o un CMP empresarial costoso para esta etapa.

### 16.2 Si la empresa decide no implementarlo

Debe obtener una validación jurídica aplicable a Perú o deshabilitar almacenamiento publicitario no esencial. Esta es una decisión de cumplimiento, no solo de diseño.

Referencia: [Resolución Directoral 1594-2023-JUS/DGTAIPD-DPDP de la ANPD](https://cdn.www.gob.pe/uploads/document/file/5703583/5063498-rd-1594-2023.pdf).

---

## 17. Merchant Center

### 17.1 Identificadores históricos

- Merchant Center: `762029759`
- Fuente de datos histórica: `10092604709`

La verificación/reclamación del sitio aparece en la configuración antigua. Debe preservarse y comprobarse después del cambio de dominio/servidor.

### 17.2 Merchant no es solo un tag

Merchant Center puede requerir verificación del sitio, pero su aprobación depende principalmente de la coherencia entre:

- feed;
- ficha del producto;
- precio;
- disponibilidad;
- envío;
- devolución;
- identidad empresarial;
- checkout funcional;
- seguridad HTTPS;
- experiencia de compra.

### 17.3 Cohorte inicial elegible

El nuevo feed debe incluir únicamente productos que cumplan simultáneamente:

- `priceMode = fixed`.
- Precio mayor que cero.
- Moneda PEN.
- Producto publicado.
- Compra directa habilitada.
- Disponibilidad real.
- Imagen válida.
- URL canónica pública.
- Método de envío real.
- Checkout completable.
- Identificadores de producto suficientes.

Con los datos actuales, el máximo teórico inicial parece ser aproximadamente 154 productos con precio fijo, sujeto a revisión de envío, disponibilidad e identificadores.

Los productos de cotización no deben fingir precio o envío para entrar a Merchant. Pueden anunciarse mediante campañas de búsqueda con conversión de WhatsApp.

### 17.4 Campos requeridos o recomendados

- `id`
- `title`
- `description`
- `link`
- `image_link`
- `availability`
- `price`
- `condition`
- `brand`
- `mpn`
- `gtin` si existe
- `identifier_exists`
- `google_product_category`
- `product_type`
- `shipping`
- `shipping_weight` cuando aplique

### 17.5 Correcciones del feed

- Completar marca para los 156 productos faltantes.
- Completar MPN/modelo para los 160 faltantes.
- Establecer `condition = new` cuando sea verdadero.
- Añadir peso o reglas de envío donde sea necesario.
- No enviar `PE:` vacío.
- Garantizar que el envío del feed sea igual o superior al checkout.
- Mantener IDs estables `gla_{wcId}` cuando se pueda.
- Evitar cambios innecesarios de ID que reinicien el historial del artículo.

### 17.6 Coherencia página-feed

Para cada artículo anunciado:

```text
Feed = página Product = JSON-LD Offer = carrito = checkout
```

Debe coincidir:

- precio;
- moneda;
- disponibilidad;
- condición;
- URL;
- envío aplicable;
- capacidad real de compra.

### 17.7 Proceso de validación

1. Completar checkout y políticas.
2. Generar el feed de la nueva aplicación.
3. Validarlo localmente.
4. Publicarlo bajo HTTPS.
5. Actualizar la fuente en Merchant Center.
6. Revisar rastreo del sitio.
7. Corregir diagnósticos de artículos.
8. Esperar el procesamiento, que puede tomar horas o más según Google.
9. No lanzar campañas Shopping hasta que los productos clave estén aprobados.

Referencias:

- [Requisitos de checkout de Merchant Center](https://support.google.com/merchants/answer/9158778?hl=en)
- [Atributo y configuración de envío](https://support.google.com/merchants/answer/6324484?hl=en)

---

## 18. CRM en subdominio separado

### 18.1 Arquitectura recomendada

Usar:

`https://crm.controlnautas.com`

El subdominio debe apuntar al servidor antiguo o al alojamiento donde continuará funcionando el CRM.

### 18.2 Trabajo en cPanel/servidor antiguo

- Crear el subdominio.
- Asignar el document root correcto del CRM.
- Instalar TLS para el subdominio.
- Actualizar la URL base del CRM.
- Revisar cookies de sesión.
- Revisar CORS y CSRF.
- Revisar callbacks y enlaces absolutos.
- Verificar generación de cotizaciones y PDF.
- Verificar envío de correo.

### 18.3 Integración con la nueva web

Definir una variable de servidor, por ejemplo:

```text
CRM_BASE_URL=https://crm.controlnautas.com
```

No hardcodear la IP o el host antiguo en componentes.

### 18.4 Rutas antiguas

Si el CRM era accesible bajo una ruta del dominio principal, las rutas conocidas pueden:

- redirigir al subdominio, o
- usar proxy temporal si la arquitectura lo exige.

No se debe redirigir todo el espacio desconocido hacia el CRM.

### 18.5 Criterios de aceptación

- Login operativo.
- Sesión persistente y segura.
- Creación y edición de cotizaciones.
- PDF operativo.
- Correo operativo.
- Acceso HTTPS.
- Enlaces desde la web nueva correctos.

El hostname exacto sigue pendiente de confirmación final.

---

## 19. HTTPS, servidor y certificados

### 19.1 Estado observado

- IP nueva: `3.229.82.189`.
- Puerto 80 accesible.
- Puerto 443 no operativo durante la auditoría.
- El dominio todavía apunta al servidor antiguo.

### 19.2 Momento correcto para HTTPS

Antes del cambio de DNS se puede preparar:

- Nginx.
- virtual host de `controlnautas.com` y `www`.
- reglas de proxy.
- firewall/puerto 443.
- Certbot.
- renovación automática.

La emisión pública por desafío HTTP normalmente debe realizarse cuando el dominio ya resuelva al servidor nuevo, o mediante un desafío DNS controlado. Por ello conviene preparar todo, reducir TTL, cambiar el A en la ventana de lanzamiento y emitir/validar inmediatamente; alternativamente usar DNS-01 antes del cambio.

### 19.3 Certificado recomendado

Opción directa y económica en EC2:

- Let’s Encrypt/Certbot.
- Renovación automática con systemd timer.
- Prueba `certbot renew --dry-run`.
- Alerta si la renovación falla.

Los certificados ACME son de vida corta por diseño. Lo importante es que su renovación sea automática, no que se emita manualmente un certificado de un año. Operativamente puede funcionar de manera continua sin intervención trimestral.

Alternativa administrada:

- AWS Certificate Manager detrás de Application Load Balancer o CloudFront.
- Renovación administrada.
- Mayor complejidad y costo de infraestructura.

### 19.4 Secuencia

1. Reservar/confirmar Elastic IP.
2. Configurar Nginx para ambos hosts.
3. Abrir 443 en Security Group y firewall.
4. Probar la aplicación por host local o staging.
5. Reducir TTL del DNS.
6. Cambiar registros web.
7. Emitir o activar certificado.
8. Redirigir HTTP a HTTPS.
9. Probar cadena completa.
10. Activar HSTS solo después de confirmar estabilidad.

---

## 20. DNS y protección del correo

### 20.1 Estado observado

- Nameservers y zona en InMotion/cPanel.
- Apex A actual: `144.208.70.163`.
- MX: `mail.controlnautas.com`.
- `mail`, `webmail`, `autodiscover` y `autoconfig` asociados al servidor anterior.
- SPF incluye `+mx`, `+a` y MailChannels.
- DKIM presente.
- No se observó DMARC ni CAA durante la revisión.

### 20.2 Registros que deben cambiar

- A de `controlnautas.com` → Elastic IP nueva.
- `www` → CNAME al apex o A equivalente.
- A/CNAME de `crm` → servidor antiguo o destino definido.

### 20.3 Registros que deben preservarse

- MX.
- `mail`.
- `webmail`.
- `autodiscover`.
- `autoconfig`.
- DKIM.
- TXT de verificación de Google.
- TXT de otros servicios legítimos.

### 20.4 SPF

El SPF histórico usa `+a`. Al cambiar el A del dominio, esa expresión empezará a autorizar la IP web nueva como remitente y puede dejar de representar correctamente el servidor de correo.

Antes del cambio:

- identificar todos los remitentes reales;
- reescribir SPF con hosts/IP/includes necesarios;
- evitar dos registros SPF separados;
- mantener MailChannels solo si continúa utilizándose.

### 20.5 DMARC

Agregar inicialmente:

```text
v=DMARC1; p=none; rua=mailto:{buzon-de-reportes-aprobado}; adkim=s; aspf=s
```

El buzón de reportes debe confirmarse antes de publicar. Después del monitoreo se puede endurecer a `quarantine` o `reject`.

### 20.6 Checklist posterior al DNS

- Web apex.
- Web `www`.
- HTTPS.
- Envío desde `ventas@controlnautas.com`.
- Recepción en `ventas@controlnautas.com`.
- Webmail.
- Autodiscover.
- SPF.
- DKIM.
- DMARC.
- CRM.
- Google Search Console.
- Merchant Center.

---

## 21. Seguridad e infraestructura

### 21.1 Autenticación básica temporal

Las credenciales no deben estar hardcodeadas en el repositorio. Antes del lanzamiento:

- moverlas a variables de entorno;
- rotarlas;
- retirarlas de producción pública;
- conservar protección separada para staging.

### 21.2 Servicios internos

- Backend Medusa accesible solo por la red necesaria.
- Base de datos no expuesta públicamente.
- Redis privado o local según arquitectura.
- Admin protegido por HTTPS y autenticación fuerte.
- CORS limitado a dominios reales.

### 21.3 Cabeceras

Configurar gradualmente:

- `X-Content-Type-Options: nosniff`
- `Referrer-Policy`
- `Permissions-Policy`
- `Content-Security-Policy` compatible con GTM/GA/Ads/WhatsApp
- `Strict-Transport-Security` después de estabilizar HTTPS

Eliminar exposición innecesaria de `X-Powered-By`.

### 21.4 Rate limiting y bots

- Rate limit en login, búsqueda, carrito, checkout y endpoints públicos sensibles.
- Protección específica de admin y CRM.
- Registro de patrones abusivos.
- Bloqueo por comportamiento, no solo por país.
- CDN/WAF si el volumen de ataques lo justifica.

No conviene bloquear agresivamente todo tráfico no peruano si eso impide crawlers legítimos de Google o servicios externos.

### 21.5 Dependencias y compilación

- Unificar el gestor de paquetes y mantener un solo lockfile.
- Ejecutar typecheck, lint, tests y build en CI.
- Actualizar dependencias de manera controlada.
- Evitar actualizaciones masivas durante la ventana de lanzamiento.

### 21.6 Observabilidad

- Logs estructurados de frontend/proxy/backend.
- Alertas de errores 5xx.
- Monitor de disponibilidad.
- Seguimiento de pedidos fallidos.
- Alerta de renovación TLS.
- Rotación y retención de logs.

---

## 22. Backups, Git y recuperación

El propietario confirma que existe un backup y control de cambios con Git. Por ello el hallazgo anterior de “ausencia de respaldo” queda corregido.

Antes de implementar:

- verificar fecha y tamaño del backup;
- calcular checksum;
- guardar una copia fuera del servidor;
- probar restauración en un entorno separado;
- crear rama de implementación;
- etiquetar el estado previo al cambio;
- respaldar base Medusa y archivos de entorno de forma segura.

Un backup solo se considera confiable después de probar que puede restaurarse.

---

## 23. Fases del proyecto

## Fase 0 — Congelamiento, inventario y respaldo

### Trabajo

- Crear rama de migración.
- Verificar estado de Git.
- Inventariar variables de entorno sin imprimir secretos.
- Respaldar frontend, backend, bases de datos y configuración de proxy.
- Verificar restauración.
- Crear tablero de tareas y responsables.
- Congelar cambios no esenciales de catálogo durante la implementación.

### Entregables

- Tag Git de baseline.
- Registro de checksums.
- Procedimiento probado de rollback.
- Inventario técnico.

### Salida

No avanzar sin una restauración comprobada.

---

## Fase 1 — Simplificación a Perú y reparación de rutas

### Trabajo

- Definir Perú como única región pública.
- Eliminar rutas internacionales.
- Corregir middleware.
- Eliminar coincidencias parciales de código de país.
- Reparar rutas con extensiones.
- Implementar 404 y 500 reales.
- Corregir colecciones inexistentes.
- Crear pruebas automáticas de routing.

### Pruebas

- `/pepe`, `/hope`, `/super`, `/missing.jpg` → 404.
- Producto existente → 200.
- Producto inexistente → 404, nunca 500.
- No hay contenido duplicado bajo prefijos arbitrarios.

### Salida

Routing determinista, sin soft 404 ni duplicados.

---

## Fase 2 — Identidad, páginas corporativas y footer

### Trabajo

- Centralizar datos reales.
- Reemplazar datos ficticios.
- Reconstruir Nosotros, Contacto, Entregas/Devoluciones, Términos y Privacidad.
- Crear footer real.
- Eliminar newsletter y enlaces vacíos.
- Hacer operativos `tel:`, `mailto:` y WhatsApp.

### Salida

Contenido corporativo aprobado y sin placeholders.

---

## Fase 3 — Casos de éxito

### Trabajo

- Extraer los cinco casos del XML.
- Limpiar HTML y shortcodes.
- Seleccionar imágenes aprobadas.
- Redactar estructura homogénea sin inventar hechos.
- Crear metadata y schema Article.
- Añadir CTA WhatsApp.
- Implementar alias históricos.

### Salida

Cinco casos publicados y redirecciones verificadas.

---

## Fase 4 — SEO, redirects, sitemap y metadata

### Trabajo

- Obtener Search Console filtrado por Perú.
- Crear inventario definitivo de URLs.
- Clasificar cada URL.
- Implementar redirecciones.
- Preservar productos y PDF con tráfico.
- Crear sitemap dinámico.
- Crear robots de staging/producción.
- Implementar canonical, OG, Twitter y JSON-LD.
- Eliminar metadata de starter template.

### Pruebas

- Rastreo automatizado de todas las URLs históricas.
- Cero cadenas de redirección innecesarias.
- Cero loops.
- Cero sitemap HTML falso.
- Canonical absoluto y consistente.

### Salida

Mapa SEO aprobado y rastreo técnico limpio.

---

## Fase 5 — Carrito Medusa

### Trabajo

- Retirar el carrito transaccional paralelo.
- Resolver región Perú.
- Resolver variante única automáticamente.
- Crear y recuperar carrito Medusa.
- Implementar agregar, actualizar y eliminar ítems.
- Validar precios del servidor.
- Diferenciar compra directa y cotización.

### Salida

Carrito persistente y completamente respaldado por Medusa.

---

## Fase 6 — Checkout, pago y envío

### Trabajo

- Crear fulfillment Perú.
- Definir envío real en PEN.
- Reparar asociación del proveedor manual.
- Construir checkout.
- Crear pedido pendiente de pago.
- Mostrar instrucciones bancarias confirmadas.
- Implementar estados administrativos.
- Crear páginas de política comercial.

### Salida

Compra completa de extremo a extremo en un entorno de prueba.

---

## Fase 7 — Correo transaccional

### Trabajo

- Elegir proveedor.
- Configurar secretos en el servidor.
- Implementar plantillas.
- Enviar pedido al cliente y a ventas.
- Probar SPF/DKIM/DMARC.
- Registrar errores sin filtrar información sensible.

### Salida

Correos entregables y verificables.

---

## Fase 8 — WhatsApp, GTM, GA4 y Google Ads

### Trabajo

- Obtener exportación GTM.
- Aclarar `GT-NNQ5KTK`.
- Confirmar o crear la conversión WhatsApp.
- Instalar GTM una sola vez.
- Implementar dataLayer.
- Crear eventos GA4 y Ads.
- Conectar ecommerce de Medusa.
- Retirar conversión antigua de página de gracias.
- Verificar deduplicación.

### Salida

- Un pageview por navegación.
- Un evento WhatsApp por clic.
- Una conversión Ads por clic elegible.
- Un evento purchase por pedido.

---

## Fase 9 — Merchant Center

### Trabajo

- Seleccionar cohortes elegibles.
- Completar atributos.
- Definir política veraz de envío.
- Generar feed nuevo.
- Implementar Product/Offer.
- Verificar checkout como usuario particular.
- Actualizar fuente.
- Corregir diagnósticos.

### Salida

Productos prioritarios aprobados o sin errores bloqueantes atribuibles al sitio.

---

## Fase 10 — Separación del CRM

### Trabajo

- Confirmar hostname.
- Crear DNS/subdominio.
- Configurar servidor y TLS.
- Actualizar URL base y sesiones.
- Probar cotizaciones, PDF y correo.
- Actualizar enlaces de la tienda.

### Salida

CRM independiente del apex y operativo.

---

## Fase 11 — Infraestructura, HTTPS y hardening

### Trabajo

- Reservar Elastic IP.
- Configurar Nginx.
- Abrir 443.
- Preparar Certbot o ACM.
- Retirar secretos hardcodeados.
- Restringir CORS y servicios.
- Configurar logs, alertas y rate limiting.
- Ejecutar pruebas de renovación TLS.

### Salida

Servidor listo para recibir el dominio con HTTPS.

---

## Fase 12 — QA integral y ensayo de migración

### Matriz funcional

- Portada.
- Navegación.
- Búsqueda.
- Categorías.
- Producto fijo.
- Producto de cotización.
- WhatsApp.
- Carrito.
- Checkout.
- Pago manual.
- Envío.
- Pedido.
- Correo.
- Casos de éxito.
- Páginas legales.
- CRM.

### Matriz técnica

- Mobile y desktop.
- Chrome, Firefox, Safari y Edge.
- Rendimiento.
- Accesibilidad básica.
- Status HTTP.
- Canonical.
- Sitemap.
- Robots.
- Schema.
- Analytics.
- Ads.
- Merchant.
- HTTPS.
- DNS y correo.

### Ensayo

- Restaurar un backup en staging.
- Ejecutar el procedimiento de despliegue.
- Ejecutar el mapa de URLs.
- Medir tiempo y puntos de fallo.
- Probar rollback.

### Salida

Acta GO/NO-GO firmada.

---

## Fase 13 — Cambio de DNS

### Antes

- Reducir TTL.
- Congelar despliegues.
- Realizar backup final.
- Confirmar correo.
- Confirmar CRM.
- Confirmar certificado o método de emisión.
- Confirmar monitoreo.

### Durante

- Cambiar solo registros web previstos.
- Mantener MX y registros de correo.
- Activar HTTPS.
- Verificar apex y `www`.
- Verificar redirects.
- Revisar logs.

### Después

- Enviar sitemap a Search Console.
- Revisar indexación.
- Actualizar Merchant.
- Supervisar Analytics/Ads en tiempo real.
- Probar pedidos reales controlados.
- Vigilar 404/500.
- Mantener el servidor antiguo disponible durante una ventana de rollback definida.

---

## 24. Pruebas de aceptación detalladas

### 24.1 Producto

- Precio y moneda coinciden con Medusa.
- El producto de precio fijo se compra.
- El producto de cotización no presenta un precio falso.
- WhatsApp contiene producto/modelo/URL.
- Schema coincide con la página.
- Canonical correcto.

### 24.2 Carrito

- Agregar una vez genera una sola línea.
- Cambiar cantidad recalcula en servidor.
- Eliminar funciona.
- Recargar recupera el carrito.
- Carrito usa región Perú/PEN.
- No acepta productos no comprables.

### 24.3 Checkout

- Persona natural puede comprar.
- Empresa puede ingresar RUC opcional.
- Dirección Perú válida.
- Envío visible en PEN.
- Pago manual crea pedido.
- Pedido queda pendiente de pago.
- No hay errores si se vuelve atrás.

### 24.4 Correo

- Cliente recibe pedido.
- Ventas recibe pedido.
- Reply-To funciona.
- No cae sistemáticamente en spam.
- No contiene secretos ni datos de otro pedido.

### 24.5 WhatsApp y analítica

- Abre el número correcto.
- Evento tiene datos del producto.
- No contiene PII.
- GA4 recibe el evento.
- Ads recibe la conversión correcta.
- El clic funciona con tracking bloqueado.
- No hay duplicados.

### 24.6 SEO

- Todas las URLs importantes responden 200 o redirect único.
- Las eliminadas responden 404/410.
- No hay redirect masivo a portada.
- Sitemap es XML válido.
- Robots permite rastreo de producción.
- Staging sigue bloqueado.
- Noindex retirado solo en producción.
- OG y Twitter son reales.

### 24.7 Merchant

- Producto del feed es comprable.
- Precio coincide.
- Disponibilidad coincide.
- Envío coincide.
- Checkout no obliga a ser empresa.
- Política de devolución accesible.
- HTTPS válido.

### 24.8 Infraestructura

- HTTP redirige a HTTPS.
- Certificado cubre apex y `www`.
- Renovación automática probada.
- 5xx genera alerta.
- Backup restaurable.
- Correo no se interrumpe tras DNS.
- CRM funciona en su subdominio.

---

## 25. Información todavía necesaria

El plan ya puede comenzar, pero para cerrarlo sin suposiciones faltan estos elementos:

1. Exportación de Search Console de `Páginas` y `Consultas` con filtro `País = Perú`.
2. Exportación JSON del contenedor publicado `GTM-KZT9PCF`.
3. ID/label exacto de la conversión actual de WhatsApp en Google Ads, o autorización para crear una nueva.
4. Explicación o captura del destino asociado a `GT-NNQ5KTK`.
5. Diagnósticos actuales de Merchant Center, incluyendo envío y devoluciones.
6. Decisión comercial veraz de envío para la cohorte Merchant.
7. Elección del proveedor de correo transaccional y credenciales, entregadas de forma segura cuando se implemente.
8. Hostname final del CRM, recomendado `crm.controlnautas.com`.
9. Confirmación final de las cuentas bancarias antes de publicarlas, aunque se indique que no cambiaron.
10. Buzón que recibirá reportes DMARC.

### Elementos que ya no hace falta solicitar

- Contact Form 7.
- Mailchimp.
- Newsletter.
- Videos antiguos.
- Google Fonts antiguo.
- Blog histórico de noticias.
- Stripe.
- PayPal.
- Configuración internacional de países.
- Conversión antigua por página de gracias.

---

## 26. Prioridad y dependencias

| Prioridad | Bloque | Depende de | Bloquea DNS |
|---|---|---|---|
| P0 | Routing, 404/500 y Perú-only | Código actual | Sí |
| P0 | Identidad real | Confirmación ya recibida | Sí |
| P0 | Carrito/checkout Medusa | Región, pago y envío | Sí |
| P0 | HTTPS | Infraestructura y dominio | Sí |
| P0 | CRM separado | Hostname y servidor antiguo | Sí |
| P0 | SEO/redirects | GSC Perú y mapa legado | Sí |
| P0 | GTM/WhatsApp | Export GTM y label Ads | Sí para medición |
| P1 | Correo transaccional | Proveedor y DNS | Sí para ecommerce |
| P1 | Merchant Center | Checkout y envío | No para DNS, sí para Shopping |
| P1 | Casos de éxito | XML y contenido aprobado | Recomendado antes de DNS |
| P1 | Páginas corporativas | Contenido legado | Sí por confianza/Merchant |
| P2 | Hardening avanzado | Infraestructura estable | No, si lo esencial está cubierto |

---

## 27. Condiciones de GO para cambiar el DNS

El cambio queda aprobado únicamente cuando:

- La aplicación construye y arranca sin errores.
- No existen datos ficticios.
- Las páginas corporativas están publicadas.
- Los casos de éxito aprobados están migrados o sus URLs tienen una decisión documentada.
- El mapa de redirects de URLs con tráfico está implementado.
- Sitemap y robots son válidos.
- Noindex se puede retirar mediante configuración de producción.
- El middleware no crea duplicados.
- Carrito, checkout, pago manual y envío funcionan.
- Los correos transaccionales llegan.
- WhatsApp abre correctamente.
- GTM/GA4/Ads no duplican eventos.
- CRM funciona bajo el nuevo subdominio.
- Puerto 443 y certificado están preparados.
- Registros de correo están inventariados y preservados.
- Existe rollback probado.
- Un responsable aprueba el GO.

---

## 28. Condiciones de NO-GO

No cambiar DNS si ocurre cualquiera de estos casos:

- Checkout no crea pedidos reales.
- No se conoce el costo de envío mostrado.
- WhatsApp apunta a un número ficticio.
- Se perderían los registros MX/DKIM/SPF.
- CRM todavía depende del apex sin alternativa.
- HTTPS no puede activarse.
- Redirects prioritarios no están cargados.
- Producción continúa con `noindex` o bloqueo total de robots.
- Sitemap responde HTML.
- Los tags se disparan duplicados.
- No existe backup restaurable.

---

## 29. Rollback

Si después del cambio se detecta un fallo crítico:

1. Detener nuevos despliegues.
2. Documentar la hora y el síntoma.
3. Restaurar el A/`www` anterior si el fallo impide comprar, contactar o acceder.
4. Mantener MX y correo sin cambios.
5. Confirmar propagación.
6. Verificar que el sitio antiguo responda.
7. Corregir en staging.
8. Repetir QA antes de un segundo intento.

El rollback de DNS no reemplaza el backup de base de datos. Si ya se recibieron pedidos en Medusa, deben preservarse y conciliarse antes de volver a intentar.

---

## 30. Referencias técnicas principales

- [Google: configurar Google tag en Tag Manager](https://support.google.com/tagmanager/answer/12326985?hl=en)
- [Google Search: migración con cambios de URL](https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes?hl=es)
- [Merchant Center: requisitos del checkout](https://support.google.com/merchants/answer/9158778?hl=en)
- [Merchant Center: configuración de envío](https://support.google.com/merchants/answer/6324484?hl=en)
- [Medusa: proveedores de pago](https://docs.medusajs.com/resources/commerce-modules/payment/payment-provider)
- [Medusa: proveedor SendGrid](https://docs.medusajs.com/resources/infrastructure-modules/notification/sendgrid)
- [AWS: servicios integrados con ACM](https://docs.aws.amazon.com/acm/latest/userguide/acm-services.html)
- [ANPD Perú: Resolución Directoral 1594-2023](https://cdn.www.gob.pe/uploads/document/file/5703583/5063498-rd-1594-2023.pdf)

---

## 31. Conclusión

El proyecto nuevo puede heredar correctamente el valor del WordPress antiguo sin copiar sus residuos. La migración debe conservar identidad, URLs con valor, casos de éxito, medición, operación comercial, Merchant Center, correo y CRM; al mismo tiempo debe reemplazar la arquitectura antigua por un flujo coherente de Next.js + Medusa.

La prioridad inmediata no es cambiar el DNS. La prioridad es completar las fases 0 a 12, validar los criterios de aceptación y ejecutar un ensayo de migración. Con ese trabajo terminado, el cambio de DNS pasa a ser una operación controlada y reversible, no una apuesta.

**Estado actual:** plan técnico definido; implementación todavía no iniciada en esta auditoría.  
**Decisión actual:** **NO-GO para DNS hasta completar los bloqueadores P0 y las pruebas de lanzamiento.**
