# Plan maestro técnico: Medusa como fuente única del catálogo

**Proyecto:** Control Nautas B2B — CN_Web  
**Documento creado:** 2026-08-31 20:26:12 UTC  
**Estado:** especificación de implementación; todavía no ejecutada  
**Versión:** 1.0  
**Alcance de esta sesión:** investigación y documentación. No se modificó código de backend, storefront, base de datos, procesos ni infraestructura.  
**Objetivo operativo:** que un cambio válido guardado por Marketing en Medusa Admin —título, descripción, imágenes, precio, variante, stock, disponibilidad comercial, marca, documentos, SEO o especificaciones— aparezca en todos los consumidores públicos correctos sin editar JSON, recompilar manualmente ni reiniciar por cada cambio.

---

## 1. Decisión arquitectónica

La solución definitiva será:

1. **Medusa v2 + PostgreSQL es la única fuente de verdad del contenido comercial.**
2. El storefront obtiene el catálogo desde Store API de Medusa, con precio calculado para la región Perú, inventario, categorías, marca y PIM.
3. El código transforma la respuesta de Medusa a un contrato interno estable llamado **CatalogProduct**. Los componentes visuales no consumen directamente ni tipos crudos de Medusa ni products.json.
4. El PIM se vincula formalmente con Product mediante un **inverse read-only Module Link**, aprovechando el product_id ya almacenado y evitando una segunda tabla de enlaces.
5. Next.js puede cachear el catálogo, pero con etiquetas globales y específicas, y Medusa invalida esas etiquetas mediante eventos.
6. products.json, products-slim.json y product-details.json quedan congelados como respaldo de migración y fixtures; no participan en runtime después del corte.
7. Se introduce una bandera de despliegue temporal, server-only, para rollback controlado: CATALOG_SOURCE=medusa|json. La opción json se elimina después del periodo de estabilización.

Esta decisión evita cuatro estados incompatibles: Medusa, PIM, JSON y caché. Después del corte solamente habrá un estado persistente autoritativo —PostgreSQL— y copias cacheadas invalidables.

---

## 2. Conclusiones de la segunda investigación

### 2.1 Causa raíz principal: el storefront ignora Medusa

El guardado de Medusa sí funciona. El storefront público, sin embargo, importa en tiempo de compilación:

- [products.ts](/home/ubuntu/CN_Web/b2b-storefront/src/lib/cn-catalog/products.ts), líneas actuales 6–7: products.json y taxonomy-counts.json.
- [products.json](/home/ubuntu/CN_Web/b2b-storefront/src/lib/cn-catalog/data/products.json): 498 registros.
- [product-details.json](/home/ubuntu/CN_Web/b2b-storefront/src/lib/cn-catalog/data/product-details.json).
- [taxonomy.ts](/home/ubuntu/CN_Web/b2b-storefront/src/lib/cn-catalog/taxonomy.ts): árbol, textos y conteos escritos en código.

Prueba reproducible observada el 2026-08-31:

| Fuente | Producto | Precio PEN |
|---|---|---:|
| Medusa Store API, con region_id Perú | sensores-con-punta-de-metal | 283.20 |
| PostgreSQL / Price Module | mismo producto | 283.20 |
| products.json | mismo producto | 89.00 |
| HTML público | mismo producto | 89.00 |

El HTML público respondió además:

~~~
Cache-Control: private, no-cache, no-store, max-age=0, must-revalidate
~~~

Por lo tanto, vaciar el navegador, Nginx o el Data Cache de Next no puede corregir esa página: el valor 89.00 está dentro del bundle construido desde JSON. El problema antecede a cualquier caché.

### 2.2 Causa raíz independiente: el widget PIM no usa autenticación JWT

El Admin se compila con autenticación JWT en [medusa-config.ts](/home/ubuntu/CN_Web/b2b-backend/apps/backend/medusa-config.ts), línea actual 23. Sin embargo:

- [product-pim-widget.tsx](/home/ubuntu/CN_Web/b2b-backend/apps/backend/src/admin/widgets/product-pim-widget.tsx), líneas actuales 24 y 50, usa window.fetch directamente.
- Ese fetch no adjunta el token administrado por Medusa JS SDK.
- Los logs muestran repetidamente GET /admin/products/:id/pim con HTTP 401, incluidos eventos del 2026-08-31.
- Los errores del GET se descartan con catch vacío.
- Un POST no exitoso no muestra error; solamente no activa el indicador de éxito.
- specs se representa como una tabla de solo lectura; no existen controles para agregar, renombrar, editar, reordenar o eliminar una especificación.

Este fallo impide editar la parte PIM incluso antes de discutir el storefront.

### 2.3 Aun guardando PIM, el storefront no lo lee

No existe actualmente una lectura pública de:

- mfr_model
- item_number
- purchase_mode
- availability_mode
- lead_time_days
- technical_pdf
- manual_pdf
- specs
- seo_title
- seo_description
- og_image

La ficha estática consume esos conceptos desde products.json. La plantilla Medusa alternativa lee metadata y contiene fallbacks genéricos no demostrables en [templates/index.tsx](/home/ubuntu/CN_Web/b2b-storefront/src/modules/products/templates/index.tsx), líneas actuales 19–49.

### 2.4 El PIM carece de una relación formal e integridad suficiente

El modelo [pim-info.ts](/home/ubuntu/CN_Web/b2b-backend/apps/backend/src/modules/b2b-pim/models/pim-info.ts) guarda product_id como texto, pero:

- no hay Module Link PIM ↔ Product;
- no existe índice único sobre product_id;
- no hay clave foránea entre módulos;
- el endpoint toma pimInfos[0], ocultando cualquier duplicado;
- la base tiene 500 PIM activos para 498 productos activos;
- existen exactamente 2 PIM huérfanos de productos ya eliminados;
- no existen duplicados activos de product_id en la fotografía actual, pero la base no lo impide.

### 2.5 Los vocabularios de disponibilidad son incompatibles

| Capa | Valores |
|---|---|
| CnProduct JSON | in_stock, backorder, made_to_order, out_of_stock |
| PIM Medusa | in_stock, lead_time, made_to_order, discontinued |

El seed copia availabilityMode sin traducirlo y oculta excepciones. Un valor backorder del JSON viola el enum PIM y puede no guardarse sin dejar evidencia.

### 2.6 El inventario actual no representa fielmente la intención comercial

Fotografía de la base al 2026-08-31:

- 498 productos publicados y 498 variantes.
- Los 498 productos activos tienen PIM; los otros 2 PIM son huérfanos.
- PIM activos enlazados: 327 in_stock, 1 lead_time y 170 made_to_order.
- JSON: 251 in_stock, 77 backorder y 170 made_to_order.
- JSON: 251 inStock=true y 247 inStock=false.
- Casi todos los niveles de Medusa tienen una cantidad artificial de 50.
- El script histórico seed-industrial-inventory.js asigna stockQty=50 a todas las variantes y allow_backorder=true.
- Un ejemplo documentado como cero stock, CN-11400, actualmente es expuesto por Store API con inventory_quantity=50.

Conclusión: **no se debe activar el storefront dinámico tomando inventario actual sin reconciliación**. Resolver el cableado sin sanear datos produciría cambios visibles, pero algunos serían falsos.

### 2.7 Hay defectos adicionales que deben resolverse en el mismo programa

1. 73 categorías activas/no eliminadas, 10 raíces; comunicacion-industrial está inactiva aunque el catálogo estático la muestra.
2. Dos productos activos carecen de categoría hoja: CN-12929 y CN-13472.
3. Hay 1,007 relaciones producto-categoría, que requieren validar exactamente una hoja canónica por producto.
4. La página de producto siempre elige HvacProductTemplate si el handle está en JSON; para los 498 productos actuales la rama Medusa es prácticamente inaccesible.
5. El buscador predictivo incorpora los 498 productos en JavaScript del cliente.
6. El carrito local calcula precio y subtotal desde JSON; el checkout crea líneas en Medusa con el precio real. Puede mostrarse 89.00 antes del checkout y 283.20 después.
7. Feed de Google Merchant y sitemap consumen JSON.
8. No hay subscribers de catálogo; src/subscribers solo contiene README.md.
9. El cache tag actual incorpora _medusa_cache_id por navegador. Un evento de backend no puede enumerar todos esos tags privados.
10. medusa-cn-seed.ts multiplica precio por 100, aunque Medusa 2.17 en este proyecto almacena/expone unidades monetarias mayores; ejecutarlo de nuevo puede producir precios 100 veces mayores.
11. Varios scripts históricos escriben SQL directo, eliminan precios o inventario, incluyen IDs fijos, inicializan todo a 50 y algunos contienen una credencial PostgreSQL en código.
12. Numerosos catches vacíos permiten declarar éxito aunque haya enlaces, PIM o precios fallidos.

---

## 3. Alcance funcional obligatorio

Después de la implementación, Marketing debe poder modificar desde Medusa Admin:

- estado publicado/borrador;
- título, subtítulo y descripción;
- handle con protección de redirección;
- imágenes y thumbnail;
- variante, SKU y opciones;
- precio regional PEN y, cuando aplique, USD;
- inventario físico;
- categorías L1/L2;
- marca;
- modelo de fabricante y número de ítem;
- modalidad comercial;
- disponibilidad comercial y plazo;
- especificaciones estructuradas;
- ficha técnica, manual e imagen OG;
- título y descripción SEO.

El cambio debe reflejarse en:

- PDP;
- categoría y subcategoría;
- búsqueda completa;
- typeahead;
- portada/productos recientes;
- quick order;
- listas locales;
- carrito, WhatsApp, correo y checkout;
- JSON-LD;
- metadata de página;
- sitemap;
- Google Merchant Feed;
- cualquier contador o faceta derivada.

### Fuera de alcance

- Rediseñar visualmente el storefront.
- Cambiar proveedor de pagos.
- Reemplazar Medusa.
- Introducir Elasticsearch/Algolia en la primera entrega.
- Implementar un CMS separado.
- Mantener sincronización bidireccional permanente JSON ↔ Medusa.
- Crear RBAC tipo WordPress como parte de este arreglo. La instalación actual no contiene un modelo de roles de editor; cualquier RBAC granular es un proyecto separado.

---

## 4. Invariantes no negociables

1. **Un producto activo tiene exactamente un PIM activo.**
2. **product_id de PIM es único entre filas no eliminadas.**
3. **El precio visible sale de variants.calculated_price para la región solicitada.**
4. **Nunca dividir ni multiplicar por 100 en el adaptador.** La prueba real devuelve 283.2 para S/ 283.20.
5. **El carrito nunca persiste precio, título ni stock como autoridad.** Persiste variantId y quantity; el servidor resuelve el resto.
6. **No se puede comprar una modalidad quote_only, contact_for_price, made_to_order o discontinued.**
7. **Un badge En stock requiere inventario disponible mayor que cero**, salvo una política explícita y probada para manage_inventory=false.
8. **No hay texto técnico inventado como fallback.** Si falta un dato, se omite o se muestra “Consultar”.
9. **Todo endpoint de escritura valida esquema y autenticación.**
10. **Todo error de PIM llega a UI y logs; no hay catch vacío.**
11. **Un evento perdido no deja datos obsoletos indefinidamente:** existe TTL de seguridad y reconciliación programada/operativa.
12. **El JSON no se actualiza al guardar en Medusa.** Eso sería doble escritura frágil.
13. **Ningún secreto usa prefijo NEXT_PUBLIC.**
14. **Los eventos son idempotentes y su reintento no cambia el resultado.**
15. **La activación dinámica queda bloqueada hasta aprobar la reconciliación de precios, stock, PIM y categorías.**

---

## 5. Arquitectura objetivo

~~~
Marketing
   |
   v
Medusa Admin
   |-- Admin Product API ----------> Product / Variant / Image / Category
   |-- Admin Pricing API ----------> Pricing Module
   |-- Admin Inventory API --------> Inventory Module
   '-- Admin PIM API --------------> B2B PIM Module
                                         |
                                         | inverse read-only Module Link
                                         v
PostgreSQL <------------------------- Product
   |
   v
Medusa Store API /store/products
   |  Product + variants.calculated_price + inventory_quantity
   |  + brand + pim_info + categories
   v
Storefront server repository
   |-- valida respuesta
   |-- transforma a CatalogProduct
   |-- cache tags globales/específicos
   v
Server Components / APIs
   '-- props serializables a componentes cliente

Después de cada escritura:
Medusa Event Subscriber --> POST firmado /api/internal/catalog/revalidate
                          --> revalidateTag/revalidatePath
~~~

### 5.1 Por qué usar Store API estándar

La ruta instalada /store/products ya:

- acepta region_id;
- calcula variants.calculated_price;
- puede incluir variants.inventory_quantity;
- usa Query Graph;
- admite campos de Module Links, demostrado actualmente con +brand.*;
- aplica contexto de pricing y reglas fiscales.

Tras definir el inverse read-only link, el primer contrato a certificar será solicitar +pim_info.* en esa misma ruta. No se duplicará la lógica de pricing en una ruta propia.

### 5.2 Puerta de contingencia

Si el test de contrato demuestra que la versión 2.17.0 no expone el inverse read-only link en Store API estándar, se implementará una ruta de composición en Medusa que **reutilice el query config y pricingContext del Store API**, no una consulta SQL ni un cálculo manual. Esta contingencia requiere una decisión registrada antes de que el agente de storefront congele tipos.

---

## 6. Contrato interno del storefront

Crear [catalog-types.ts](/home/ubuntu/CN_Web/b2b-storefront/src/lib/catalog/catalog-types.ts) con tipos explícitos. Especificación mínima:

~~~ts
export type PurchaseMode =
  | "buy_now"
  | "quote_only"
  | "contact_for_price"
  | "made_to_order"

export type AvailabilityMode =
  | "in_stock"
  | "lead_time"
  | "made_to_order"
  | "discontinued"

export type DerivedAvailability =
  | "in_stock"
  | "backorder"
  | "made_to_order"
  | "out_of_stock"
  | "discontinued"

export type Money = {
  amount: number
  currencyCode: "pen" | "usd" | string
  originalAmount: number | null
}

export type CatalogVariant = {
  id: string
  sku: string
  title: string
  manageInventory: boolean
  allowBackorder: boolean
  inventoryQuantity: number | null
  calculatedPrice: Money | null
  options: Array<{ id: string; name: string; value: string }>
  isPurchasable: boolean
}

export type CatalogCategory = {
  id: string
  handle: string
  name: string
  description: string
  parentId: string | null
  rank: number
  isActive: boolean
  metadata: Record<string, unknown> | null
}

export type CatalogProduct = {
  id: string
  handle: string
  title: string
  subtitle: string | null
  description: string
  status: "published"
  thumbnail: string | null
  images: Array<{ id: string; url: string; rank: number }>
  updatedAt: string
  brand: {
    id: string
    name: string
    handle: string
    logoUrl: string | null
  } | null
  pim: {
    id: string
    productId: string
    mfrModel: string | null
    itemNumber: string | null
    purchaseMode: PurchaseMode
    availabilityMode: AvailabilityMode
    leadTimeDays: number | null
    technicalPdf: string | null
    manualPdf: string | null
    specs: Record<string, string>
    seoTitle: string | null
    seoDescription: string | null
    ogImage: string | null
  }
  categories: CatalogCategory[]
  leafCategory: CatalogCategory
  variants: CatalogVariant[]
  primaryVariant: CatalogVariant
  display: {
    availability: DerivedAvailability
    price: Money | null
    priceLabel: string
    canAddToCart: boolean
    requiresQuote: boolean
  }
}
~~~

### 6.1 Reglas de transformación

Implementar en [catalog-mappers.ts](/home/ubuntu/CN_Web/b2b-storefront/src/lib/catalog/catalog-mappers.ts), como funciones puras:

1. Rechazar producto sin id, handle, title, PIM, categoría hoja o variante.
2. Normalizar specs:
   - aceptar solamente objeto plano;
   - clave trim, no vacía, máximo 120 caracteres;
   - valor string/number/boolean transformado a string;
   - omitir null, arrays, objetos anidados y claves duplicadas después de trim;
   - máximo 100 entradas y 2,000 caracteres por valor.
3. Ordenar imágenes por rank y usar thumbnail como fallback solamente si no está duplicado.
4. Elegir hoja como categoría cuyo parent_category_id no sea null. Antes del corte debe existir exactamente una.
5. Para los 498 productos actuales, primaryVariant es la única variante.
6. Si en el futuro hay varias variantes:
   - en listados, display.price es el menor precio calculado válido y la UI muestra “Desde”;
   - en PDP, el usuario debe seleccionar variante antes de añadir;
   - nunca tomar variants[0] silenciosamente para carrito.
7. display.requiresQuote es verdadero si purchaseMode no es buy_now o no existe calculatedPrice.
8. display.canAddToCart requiere buy_now, variante válida, precio y disponibilidad permitida.
9. El mapper nunca usa un precio de raw prices; usa calculated_price.
10. Una respuesta inválida genera CatalogContractError con productId, handle y campo, sin datos sensibles.

### 6.2 Regla determinista de disponibilidad

Aplicar en este orden:

| Condición | Resultado | Compra |
|---|---|---|
| PIM discontinued | discontinued | no |
| PIM made_to_order | made_to_order | no; cotizar |
| PIM lead_time | backorder | solo si política comercial buy_now + allowBackorder; inicialmente cotizar |
| manageInventory=true e inventoryQuantity>0 | in_stock | sí si buy_now y precio |
| manageInventory=true, quantity<=0 y allowBackorder=true | backorder | inicialmente cotizar |
| manageInventory=true, quantity<=0 y allowBackorder=false | out_of_stock | no |
| manageInventory=false y PIM in_stock | in_stock | sí si buy_now y precio |
| cualquier inconsistencia | out_of_stock + alerta de calidad | no |

La primera versión será conservadora: backorder no entra en checkout hasta que Negocio apruebe compras sin stock. Cotizar seguirá disponible.

---

## 7. Contrato de lectura con Medusa

### 7.1 Consulta de listado

El repositorio server-only solicitará por páginas, no un límite implícito de 100:

~~~
GET /store/products
  ?limit=100
  &offset=0
  &region_id=<PERU_REGION_ID>
  &fields=id,title,subtitle,description,handle,status,thumbnail,created_at,updated_at,
          *images,*categories,*categories.parent_category,
          *variants,*variants.options,+variants.inventory_quantity,
          *variants.calculated_price,+brand.*,+pim_info.*
~~~

El fields final debe serializarse sin espacios. Se repetirá hasta offset + limit >= count. Con 498 productos serán cinco páginas de 100.

### 7.2 Consulta de detalle

Usar filtro handle y limit=1 con los mismos campos. No descargar el catálogo completo para una PDP.

### 7.3 Búsqueda

Primera implementación recomendada:

- búsqueda de página en servidor con q, limit y offset de Store API;
- typeahead mediante endpoint Next server-only /api/catalog/search?q=, debounce 200–300 ms, mínimo 2 caracteres, límite 8;
- abortar solicitud anterior con AbortController;
- cache corta por término normalizado, sin exponer publishable key adicional.

Antes del corte, probar que q cubra SKU, título y descripción. Si Store API no busca PIM mfr_model/item_number/specs, implementar un endpoint Medusa de búsqueda usando Index/Query; no volver a descargar los 498 productos al navegador.

### 7.4 Validación runtime

Crear [catalog-schema.ts](/home/ubuntu/CN_Web/b2b-storefront/src/lib/catalog/catalog-schema.ts) con Zod o validadores equivalentes para:

- respuesta paginada;
- producto;
- variante/calculated_price;
- PIM;
- error Medusa.

El código no debe usar any para cruzar el límite Medusa → storefront.

---

## 8. Modelo PIM e integridad

### 8.1 Estrategia de enlace recomendada

Crear [product-pim.ts](/home/ubuntu/CN_Web/b2b-backend/apps/backend/src/links/product-pim.ts) como inverse read-only link:

~~~ts
export default defineLink(
  {
    linkable: ProductModule.linkable.product,
    field: "id",
  },
  {
    ...B2bPimModule.linkable.pimInfo.id,
    primaryKey: "product_id",
  },
  {
    readOnly: true,
  }
)
~~~

El import real debe usar el default export del módulo y confirmarse con medusa build. La relación esperada en Query será pim_info; no congelar ese alias por intuición: el test de contrato debe registrar el alias exacto generado y el contrato storefront usará ese resultado.

Ventajas:

- no crea tabla pivot;
- no duplica el product_id existente;
- no exige crear/destruir Remote Links al guardar;
- Query puede resolver Product → PimInfo;
- la unicidad se impone donde corresponde, en pim_info.product_id.

### 8.2 Migración de PIM

Crear migración generada por Medusa, no escrita con nombre de fecha inventado. La migración debe:

1. Identificar y reportar huérfanos antes de crear restricciones.
2. Marcar como eliminados o eliminar físicamente los dos PIM huérfanos solo después de guardar un reporte y validar que los productos fueron eliminados intencionalmente.
3. Fallar si hay product_id duplicados activos.
4. Crear índice para búsquedas por product_id.
5. Crear índice único parcial equivalente a:

~~~sql
CREATE UNIQUE INDEX ... ON pim_info(product_id) WHERE deleted_at IS NULL;
~~~

6. No crear FK cross-module: el read-only link es la abstracción soportada.
7. Incluir down migration que quite únicamente los índices introducidos, sin resucitar huérfanos.

### 8.3 Esquema PIM definitivo

Modificar [pim-info.ts](/home/ubuntu/CN_Web/b2b-backend/apps/backend/src/modules/b2b-pim/models/pim-info.ts):

- conservar product_id obligatorio;
- conservar enum purchase_mode existente;
- conservar enum availability_mode existente;
- lead_time_days: entero >= 1 solo si availability_mode=lead_time; null para otros estados;
- URLs: null o URL https/ruta local que empiece con /;
- seo_title: máximo 70;
- seo_description: máximo 170;
- specs: Record<string,string> validado en API;
- oem_brand queda temporalmente por compatibilidad, pero Brand Module es autoridad. Tras reconciliar, deprecar o eliminar para no mantener dos marcas.

No usar mfr_model o item_number duplicados en product.metadata.

---

## 9. API Admin PIM

### 9.1 Validación

Crear [validators.ts](/home/ubuntu/CN_Web/b2b-backend/apps/backend/src/api/admin/products/[id]/pim/validators.ts) con:

- AdminUpsertPimSchema;
- parámetros product id;
- allowlist de campos;
- trim y conversión de string vacío a null;
- rechazo de claves desconocidas;
- las reglas condicionales de lead_time_days;
- saneamiento de specs.

Registrar validateAndTransformBody y, para GET, query config si se habilitan fields, en [middlewares.ts](/home/ubuntu/CN_Web/b2b-backend/apps/backend/src/api/middlewares.ts). Conservar intactos ALTCHA y static media.

### 9.2 Semántica HTTP

Modificar [route.ts](/home/ubuntu/CN_Web/b2b-backend/apps/backend/src/api/admin/products/[id]/pim/route.ts):

- GET:
  - 404 PRODUCT_NOT_FOUND si no existe producto;
  - 200 con pim_info:null solamente durante migración; después del backfill debe tratarse como error de integridad;
  - no extraer id analizando req.url; usar params.id.
- POST o PUT:
  - preferir PUT por upsert idempotente;
  - validar existencia de producto;
  - buscar por product_id único;
  - crear o actualizar;
  - emitir b2b-pim.updated con product_id, pim_info_id y updated_at;
  - devolver 200 en actualización y 201 en creación;
  - devolver objeto persistido, no el body.
- Errores:
  - 400 VALIDATION_ERROR con fieldErrors;
  - 401/403 gestionado por capa Admin;
  - 404 PRODUCT_NOT_FOUND;
  - 409 PIM_INTEGRITY_CONFLICT;
  - 500 con request_id, sin stack en respuesta.

### 9.3 Concurrencia

Evitar el patrón list → create sin protección. El índice único es la última defensa. Si dos requests crean simultáneamente:

- capturar unique violation;
- releer por product_id;
- ejecutar update una sola vez;
- responder idempotentemente.

Opcional recomendado: envolver el upsert y emisión del evento en un workflow [upsert-product-pim.ts](/home/ubuntu/CN_Web/b2b-backend/apps/backend/src/workflows/upsert-product-pim.ts), con step compensable. Si se usa workflow, el route no contiene lógica de persistencia.

---

## 10. Widget Admin PIM

### 10.1 Cliente autenticado

Crear [sdk.ts](/home/ubuntu/CN_Web/b2b-backend/apps/backend/src/admin/lib/sdk.ts). Debe inicializar Medusa JS SDK con backend Vite y el mismo auth type JWT del Admin. No leer manualmente medusa_auth_token y no construir Authorization a mano.

En [product-pim-widget.tsx](/home/ubuntu/CN_Web/b2b-backend/apps/backend/src/admin/widgets/product-pim-widget.tsx):

- sustituir window.fetch por sdk.client.fetch;
- GET con useQuery;
- PUT con useMutation;
- invalidar queryKey ["product-pim", productId] tras éxito;
- conservar datos anteriores durante refetch;
- desactivar Guardar si no hay cambios;
- prevenir doble envío;
- mostrar Skeleton, estado vacío y Retry.

### 10.2 Formulario

Usar componentes de @medusajs/ui, no estilos HTML aislados. Campos:

- modelo fabricante;
- número ítem;
- modalidad comercial;
- disponibilidad;
- plazo en días condicionado;
- ficha técnica;
- manual;
- SEO title con contador;
- SEO description con contador;
- OG image;
- specs editable.

Editor specs:

- filas {key,value};
- agregar;
- editar clave/valor;
- eliminar;
- reordenar;
- detectar clave duplicada normalizada;
- confirmar pérdida si se cambia de producto con cambios sin guardar;
- no permitir guardar clave o valor vacío;
- serializar a objeto solamente al enviar.

### 10.3 Feedback

- Toast de éxito solo después de respuesta 2xx válida.
- Toast de error con mensaje de API y request_id.
- 401: “La sesión venció; vuelva a iniciar sesión”.
- 403: “No tiene permiso”.
- 409: “Existe un conflicto de integridad; no reintente hasta revisar”.
- Nunca catch(() => {}).

### 10.4 Marcas

[brands/page.tsx](/home/ubuntu/CN_Web/b2b-backend/apps/backend/src/admin/routes/brands/page.tsx) también usa window.fetch sin SDK. Debe migrarse al mismo sdk.client.fetch y React Query. Aunque no causa el precio viejo, es el mismo defecto JWT y debe corregirse para que Marketing gestione marca consistentemente.

---

## 11. Repositorio de catálogo en el storefront

Crear directorio src/lib/catalog:

| Archivo nuevo | Responsabilidad |
|---|---|
| catalog-types.ts | contrato interno |
| medusa-types.ts | forma mínima de respuesta externa |
| catalog-schema.ts | validación runtime |
| catalog-mappers.ts | transformación pura |
| catalog-cache.ts | nombres de tags, TTL y helpers |
| catalog-repository.ts | list/detail/category/search |
| catalog-source.ts | selección temporal medusa/json, server-only |
| legacy-json-adapter.ts | adaptador de rollback; no exportable a clientes |
| catalog-errors.ts | errores tipados |

Reglas:

- todos salvo catalog-types y helpers puros llevan import server-only;
- ningún componente importa sdk;
- ninguna función oculta errores devolviendo array vacío;
- NetworkError puede usar último valor cacheado; ContractError debe alertar y fallar cerrado;
- listAllProducts pagina hasta count;
- detailByHandle requiere un resultado exacto;
- el repositorio recibe countryCode/regionId explícito;
- no hardcodear region ID actual; resolverlo por getRegion.

### Cache tags

~~~
catalog
catalog:products
catalog:product:<productId>
catalog:handle:<handle>
catalog:categories
catalog:category:<categoryId>
catalog:category-handle:<handle>
catalog:prices
catalog:inventory
catalog:search
catalog:feed
catalog:sitemap
~~~

Eliminar dependencia de _medusa_cache_id para catálogo público. Ese cookie puede continuar para sesiones/carritos, pero no debe formar el tag de contenido global.

---

## 12. Migración de consumidores, archivo por archivo

### 12.1 PDP

Modificar [products/[handle]/page.tsx](/home/ubuntu/CN_Web/b2b-storefront/src/app/[countryCode]/(main)/products/[handle]/page.tsx):

- eliminar getProductByHandle y la bifurcación Hvac/Medusa;
- detailByHandle(handle,countryCode);
- metadata desde PIM SEO, con fallback a Product;
- OG desde PIM, thumbnail o primera imagen;
- tags product-specific;
- notFound solo para inexistente/no publicado.

Modificar [hvac-product.tsx](/home/ubuntu/CN_Web/b2b-storefront/src/modules/products/templates/hvac-product.tsx):

- recibir product: CatalogProduct; no handle;
- remover lectura global JSON;
- precio, GA4, JSON-LD, disponibilidad, specs, docs y relacionados desde props/repositorio;
- priceValidUntil no puede quedar fijo a 2026-12-31; eliminar o calcular desde política real;
- addToCart usa primary/selected variantId.

Deprecar la plantilla paralela [templates/index.tsx](/home/ubuntu/CN_Web/b2b-storefront/src/modules/products/templates/index.tsx) o convertirla en la misma vista. Eliminar certificaciones/país/garantía inventados.

### 12.2 Categorías

Modificar:

- [store/[...slug]/page.tsx](/home/ubuntu/CN_Web/b2b-storefront/src/app/[countryCode]/(main)/store/[...slug]/page.tsx)
- [hvac-category.tsx](/home/ubuntu/CN_Web/b2b-storefront/src/modules/store/templates/hvac-category.tsx)
- [leaf-category-listing.tsx](/home/ubuntu/CN_Web/b2b-storefront/src/modules/store/templates/leaf-category-listing.tsx)
- [technical-listing.tsx](/home/ubuntu/CN_Web/b2b-storefront/src/modules/store/templates/technical-listing.tsx)
- [product-row.tsx](/home/ubuntu/CN_Web/b2b-storefront/src/modules/store/templates/product-row.tsx)
- componentes mobile asociados.

La page server resuelve categoría y productos. Las plantillas cliente reciben CatalogCategory y CatalogProduct[]. Facets se calculan sobre esos props.

Mantener [leaf-spec-schema.ts](/home/ubuntu/CN_Web/b2b-storefront/src/lib/cn-catalog/leaf-spec-schema.ts) y [spec-aliases.ts](/home/ubuntu/CN_Web/b2b-storefront/src/lib/cn-catalog/spec-aliases.ts) como **configuración de presentación**, no fuente de atributos. Ningún valor de producto puede residir allí.

### 12.3 Taxonomía

Reemplazar contenido dinámico de [taxonomy.ts](/home/ubuntu/CN_Web/b2b-storefront/src/lib/cn-catalog/taxonomy.ts):

- nombres, descripciones, active, rank, parent y conteos vienen de ProductCategory;
- alias de URLs antiguas puede permanecer en código;
- configuración de hubs especiales puede permanecer por handle;
- productCount se calcula, no se escribe.

Migrar imágenes de categoría a metadata.image_url en Medusa. [category-images.ts](/home/ubuntu/CN_Web/b2b-storefront/src/lib/cn-catalog/category-images.ts) queda como fallback de presentación durante una fase y se elimina al completar cobertura.

### 12.4 Búsqueda

Modificar:

- [search/page.tsx](/home/ubuntu/CN_Web/b2b-storefront/src/app/[countryCode]/(main)/search/page.tsx)
- [search-results.tsx](/home/ubuntu/CN_Web/b2b-storefront/src/modules/search/templates/search-results.tsx)
- [search-bar/index.tsx](/home/ubuntu/CN_Web/b2b-storefront/src/modules/layout/components/search-bar/index.tsx)

Eliminar CN_PRODUCTS del bundle cliente. La página usa búsqueda server; typeahead usa API. Conservar el algoritmo difuso solamente si opera en servidor sobre resultados autorizados o un índice server-side.

### 12.5 Portada, recientes, listas y quick order

Modificar:

- [home/templates/index.tsx](/home/ubuntu/CN_Web/b2b-storefront/src/modules/home/templates/index.tsx)
- [home-recent-products.tsx](/home/ubuntu/CN_Web/b2b-storefront/src/modules/home/components/home-recent-products.tsx)
- [recent-product-card.tsx](/home/ubuntu/CN_Web/b2b-storefront/src/modules/home/components/recent-product-card.tsx)
- [quick-order/page.tsx](/home/ubuntu/CN_Web/b2b-storefront/src/app/[countryCode]/(main)/quick-order/page.tsx)
- shell-lists y consumers.

LocalStorage de vistos/listas conserva IDs o handles solamente. Al mostrar, resolver batch desde servidor/API; si un producto fue retirado, eliminarlo de la lista y no reconstruirlo desde snapshot.

### 12.6 Feed, sitemap, descripción extendida

Modificar:

- [google-merchant/route.ts](/home/ubuntu/CN_Web/b2b-storefront/src/app/api/feed/google-merchant/route.ts)
- [sitemap.ts](/home/ubuntu/CN_Web/b2b-storefront/src/app/sitemap.ts)
- [product-detail/route.ts](/home/ubuntu/CN_Web/b2b-storefront/src/app/api/cn/product-detail/route.ts)

Feed:

- solamente published + buy_now + precio PEN válido;
- disponibilidad desde DerivedAvailability;
- stable ID: preservar gla_<legacyWcId> durante migración usando metadata legada; no cambiar identificadores de Merchant;
- cache tag catalog:feed;
- escapar TSV;
- no marcar in_stock un producto lead_time.

Sitemap:

- productos published;
- categorías active y no internal;
- updated_at real;
- cache tag catalog:sitemap;
- no comentario “523 productos”.

product-detail:

- preferiblemente eliminarlo y usar description de Product/PIM;
- si una UI requiere HTML, definir un campo PIM explícito sanitizado. No servir product-details.json.

---

## 13. Carrito: corrección crítica

### 13.1 Esquema local v2

Modificar [shell-cart.tsx](/home/ubuntu/CN_Web/b2b-storefront/src/lib/cn-catalog/shell-cart.tsx).

Nuevo almacenamiento:

~~~ts
type ShellCartV2 = {
  version: 2
  updatedAt: string
  lines: Array<{
    variantId: string
    productId: string
    handle: string
    quantity: number
  }>
}
~~~

No guardar price, title, stock ni currency.

### 13.2 Migración localStorage v1 → v2

Al iniciar:

1. Leer cn_shell_cart_v2.
2. Si no existe, leer cn_shell_cart_v1.
3. Enviar handles a resolución batch.
4. Convertir solamente productos publicados con variante válida.
5. Informar líneas retiradas.
6. Escribir v2.
7. Mantener v1 siete días sin modificar para rollback; eliminar después.

### 13.3 Sincronización

Modificar [cart.ts](/home/ubuntu/CN_Web/b2b-storefront/src/lib/data/cart.ts):

- syncCartFromClient recibe variantId+quantity; elimina import dinámico CN_PRODUCTS;
- deduplicar variante;
- validar quantity 1..999;
- evitar duplicar una línea ya presente en Medusa Cart;
- devolver cart actualizado, no solo id;
- si precio/stock cambió, UI presenta el valor del carrito de Medusa;
- no navegar al checkout si la sincronización falla;
- errores por línea deben mostrarse, no continuar silenciosamente.

Modificar [cart/templates/shell-cart.tsx](/home/ubuntu/CN_Web/b2b-storefront/src/modules/cart/templates/shell-cart.tsx):

- resolver producto/precio actuales;
- subtotal desde Medusa cart o respuesta batch actual;
- WhatsApp y correo usan dato actual;
- quote_only no se mezcla con checkout: generar RFQ, no line item pagable.

### 13.4 Aceptación específica del caso 89/283.20

Con precio Medusa 283.20:

- PDP: 283.20;
- tarjeta: 283.20;
- carrito local resuelto: 283.20;
- line item Medusa: 283.20;
- checkout: 283.20;
- WhatsApp/feed/JSON-LD: 283.20 cuando aplique;
- ninguna superficie puede mostrar 89.00.

---

## 14. Reconciliación de datos antes del corte

Crear scripts de auditoría dry-run en backend, usando servicios Medusa/Store API, no SQL de escritura:

| Archivo nuevo | Salida |
|---|---|
| src/scripts/audit-catalog-cutover.ts | resumen y JSON detallado |
| src/scripts/reconcile-catalog-cutover.ts | plan de cambios; exige --apply |
| src/scripts/verify-catalog-cutover.ts | invariantes post-cambio |

Los reportes deben guardarse fuera de src, en md/auditoria-catalogo-<timestamp>/, sin secretos.

### 14.1 Clave de emparejamiento

Orden:

1. product.id/variantId ya registrados en snapshot;
2. handle único;
3. SKU exacto;
4. legacyWcId en metadata;
5. coincidencia manual aprobada.

No emparejar automáticamente solo por título.

Existen 10 equivalencias de SKU conocidas que deben entrar a un mapping versionado de migración, no al runtime:

| JSON legado | SKU Medusa observado |
|---|---|
| CN-SSR4810 | SKU-novus-ssr-4810 |
| CN-SSR4825 | SKU-novus-ssr-4825 |
| CN-SSR4840 | SKU-novus-ssr-4840 |
| CN-SSR4880 | SKU-novus-ssr-4880 |
| CN-SSR3-4840 | SKU-novus-ssr-3ph-40a |
| CN-PCW60A | SKU-novus-power-controll |
| CN-PCW100A | CN-407 |
| CN-PCW200A | CN-408 |
| CN-NIO24V | CN-409 |
| CN-NIO220V | CN-410 |

Negocio debe decidir el SKU definitivo; el script no debe perpetuar alias accidentales.

### 14.2 Precedencia inicial por campo

| Campo | Fuente inicial recomendada | Acción |
|---|---|---|
| id, handle, status, variante | Medusa | conservar |
| title, description, thumbnail | comparar; actualmente alta paridad | Medusa salvo revisión |
| precio | Medusa, con revisión del cambio CN-10756 | aprobar explícitamente |
| specs | JSON auditado, porque PIM difiere masivamente | importar una vez a PIM |
| mfr_model/item_number | revisión; 60 diferencias detectadas anteriormente | resolver manual/mapping |
| purchase_mode | JSON priceMode traducido | validar 149 buy_now/349 quote |
| availability | JSON traducido, luego validar comercialmente | no usar PIM actual ciegamente |
| stock físico | conteo real de almacén | no JSON ni 50 artificial |
| SEO | PIM si revisado; si autogenerado, auditar | no asumir calidad |
| categorías | mapping JSON ↔ ProductCategory | corregir 2 sin hoja |
| marca | Brand Module | eliminar duplicación oem_brand |

### 14.3 Traducción de enums durante migración

~~~
JSON in_stock      -> PIM in_stock
JSON backorder     -> PIM lead_time
JSON made_to_order -> PIM made_to_order
JSON out_of_stock  -> inventario 0 + allow_backorder false;
                      PIM no se cambia a discontinued salvo decisión comercial
~~~

### 14.4 Gates cuantitativos

No activar CATALOG_SOURCE=medusa hasta que:

- 498/498 productos publicados tengan exactamente 1 PIM;
- 0 PIM huérfanos;
- 0 product_id duplicados;
- 498/498 tengan al menos 1 variante y SKU;
- 498/498 tengan exactamente 1 categoría hoja canónica para esta versión;
- 498/498 tengan Brand link;
- 149/149 buy_now tengan precio PEN calculable;
- 349 quote_only no sean añadibles a checkout;
- 0 precio con sospecha x100 o /100;
- 100% inventario aprobado por Operaciones, no por script;
- 0 enum inválido;
- 0 asset principal inexistente;
- auditoría de diferencias firmada.

---

## 15. Caché e invalidación

### 15.1 Ruta interna Next

Crear [route.ts](/home/ubuntu/CN_Web/b2b-storefront/src/app/api/internal/catalog/revalidate/route.ts).

Request:

~~~json
{
  "eventId": "uuid-or-ulid",
  "event": "product.updated",
  "occurredAt": "ISO-8601",
  "entityId": "prod_...",
  "productIds": ["prod_..."],
  "categoryIds": [],
  "tags": ["catalog:product:prod_...", "catalog:products"]
}
~~~

Cabeceras:

~~~
x-cn-timestamp: unix-seconds
x-cn-signature: hex(HMAC-SHA256(secret, timestamp + "." + rawBody))
content-type: application/json
~~~

Validaciones:

- secreto REVALIDATE_SECRET server-only, mínimo 32 bytes aleatorios;
- comparación timingSafeEqual;
- timestamp con tolerancia máxima 300 segundos;
- eventId idempotente durante 24 h;
- body máximo 32 KB;
- allowlist de events y tags; el emisor no puede invalidar tags arbitrarios;
- máximo 100 IDs;
- 401 firma ausente/inválida;
- 409 replay;
- 422 schema;
- 200 con invalidatedTags e invalidatedPaths.

### 15.2 Estrategia

- revalidateTag para datos precisos;
- revalidatePath como respaldo de rutas afectadas;
- catalog:products para create/delete/status/handle;
- catalog:product:<id> para cambios individuales;
- catalog:prices para precios;
- catalog:inventory para stock;
- catalog:categories para árbol;
- catalog:feed y catalog:sitemap cuando elegibilidad/URL cambia.

Usar la firma de revalidateTag compatible con Next 15.3.9 instalada; no copiar sin verificar ejemplos de Next 16. Los tests deben demostrar invalidación real en next start.

### 15.3 TTL de seguridad

Aunque haya eventos:

- detalle: revalidate 15 minutos;
- listado/categoría: 15 minutos;
- typeahead: 5 minutos;
- feed: 15 minutos;
- sitemap: 60 minutos;
- no-store para carrito/checkout.

El SLA normal tras evento será <= 30 segundos; el TTL evita obsolescencia infinita si falla el webhook.

---

## 16. Eventos Medusa

Crear:

- src/subscribers/catalog-core-revalidation.ts
- src/subscribers/catalog-price-revalidation.ts
- src/subscribers/catalog-inventory-revalidation.ts
- src/subscribers/catalog-pim-revalidation.ts
- src/lib/catalog-revalidation-client.ts

Usar nombres confirmados en @medusajs/utils 2.17.0:

| Eventos | Tags mínimos |
|---|---|
| product.created/updated/deleted | products, product, handle, feed, sitemap |
| product-variant.created/updated/deleted | products, product, price/inventory según campo |
| product-category.created/updated/deleted | categories, products, sitemap |
| pricing.price.created/updated/deleted | prices, producto resuelto, feed |
| pricing.price-set.updated | prices, productos afectados, feed |
| inventory.inventory-level.created/updated/deleted | inventory, producto resuelto, feed |
| b2b-pim.created/updated/deleted | product, products, categories, search, feed |

No mezclar los eventos internos product.product.updated del módulo con los workflow events product.updated sin prueba. Suscribirse a los eventos que efectivamente emiten los flujos Admin, certificado por integration test.

### 16.1 Resolución indirecta

Price e Inventory events pueden entregar priceId/inventoryLevelId y no productId. El subscriber debe resolver:

- price → price_set → variant → product;
- inventory level → inventory item → variant link → product.

Usar Query/servicios Medusa. No SQL. Si no puede resolver:

- invalidar tags globales de la dimensión;
- registrar resolution=fallback_global;
- no descartar el evento.

### 16.2 Entrega

- timeout HTTP 3 s;
- 3 reintentos exponenciales con jitter;
- eventId constante entre reintentos;
- 2xx es éxito;
- 409 replay se considera éxito;
- 4xx excepto 409 no se reintenta indefinidamente;
- 5xx/network se reintenta;
- tras fallar, log ERROR estructurado y métrica.

Para garantía superior se puede añadir outbox persistente en una segunda iteración. No bloquear el guardado de Marketing porque Next esté temporalmente caído.

---

## 17. Inventario de cambios propuestos

### Backend: crear

- apps/backend/src/links/product-pim.ts
- apps/backend/src/admin/lib/sdk.ts
- apps/backend/src/api/admin/products/[id]/pim/validators.ts
- apps/backend/src/workflows/upsert-product-pim.ts
- apps/backend/src/lib/catalog-revalidation-client.ts
- apps/backend/src/subscribers/catalog-core-revalidation.ts
- apps/backend/src/subscribers/catalog-price-revalidation.ts
- apps/backend/src/subscribers/catalog-inventory-revalidation.ts
- apps/backend/src/subscribers/catalog-pim-revalidation.ts
- apps/backend/src/scripts/audit-catalog-cutover.ts
- apps/backend/src/scripts/reconcile-catalog-cutover.ts
- apps/backend/src/scripts/verify-catalog-cutover.ts
- migración PIM generada por CLI
- integration-tests/http/pim-admin.spec.ts
- integration-tests/http/store-catalog-contract.spec.ts
- integration-tests/subscribers/catalog-revalidation.spec.ts

### Backend: modificar

- apps/backend/src/modules/b2b-pim/models/pim-info.ts
- apps/backend/src/api/admin/products/[id]/pim/route.ts
- apps/backend/src/api/middlewares.ts
- apps/backend/src/admin/widgets/product-pim-widget.tsx
- apps/backend/src/admin/routes/brands/page.tsx
- apps/backend/.env.template
- apps/backend/package.json, solo scripts de auditoría/pruebas si procede

### Backend: retirar o bloquear

- src/scripts/medusa-cn-seed.ts
- src/scripts/seed-prices-direct.js
- src/scripts/seed-industrial-inventory.js
- src/scripts/seed-categories-direct.js
- src/scripts/link-brands-and-sales-channel.js
- demás scripts de reparación SQL directa.

No borrarlos en la primera PR. Moverlos a scripts/legacy-readonly o añadir un guard que aborte salvo ALLOW_DESTRUCTIVE_LEGACY_SEED y documentarlos como no ejecutables. Retirar credenciales embebidas inmediatamente.

### Storefront: crear

- src/lib/catalog/catalog-types.ts
- src/lib/catalog/medusa-types.ts
- src/lib/catalog/catalog-schema.ts
- src/lib/catalog/catalog-mappers.ts
- src/lib/catalog/catalog-cache.ts
- src/lib/catalog/catalog-repository.ts
- src/lib/catalog/catalog-source.ts
- src/lib/catalog/legacy-json-adapter.ts
- src/lib/catalog/catalog-errors.ts
- src/app/api/catalog/search/route.ts
- src/app/api/internal/catalog/revalidate/route.ts
- tests unitarios del mapper/cache
- tests contract/e2e del catálogo.

### Storefront: modificar

- src/lib/config.ts
- src/lib/data/products.ts
- src/lib/data/categories.ts
- src/lib/data/cookies.ts
- src/lib/data/cart.ts
- src/lib/cn-catalog/index.ts
- src/lib/cn-catalog/facets.ts
- src/lib/cn-catalog/shell-cart.tsx
- src/lib/cn-catalog/shell-lists.tsx
- src/lib/cn-catalog/taxonomy.ts
- src/app/[countryCode]/(main)/products/[handle]/page.tsx
- src/app/[countryCode]/(main)/store/[...slug]/page.tsx
- src/app/[countryCode]/(main)/search/page.tsx
- src/app/[countryCode]/(main)/quick-order/page.tsx
- src/app/api/feed/google-merchant/route.ts
- src/app/api/cn/product-detail/route.ts
- src/app/sitemap.ts
- src/modules/products/templates/hvac-product.tsx
- src/modules/products/templates/index.tsx
- src/modules/store/templates/hvac-category.tsx
- src/modules/store/templates/leaf-category-listing.tsx
- src/modules/store/templates/technical-listing.tsx
- src/modules/store/templates/product-row.tsx
- src/modules/store/components/mobile-industrial-product-card.tsx
- src/modules/store/components/mobile-filter-sheet.tsx
- src/modules/search/templates/search-results.tsx
- src/modules/layout/components/search-bar/index.tsx
- src/modules/home/templates/index.tsx
- src/modules/home/components/home-recent-products.tsx
- src/modules/home/components/recent-product-card.tsx
- src/modules/cart/templates/shell-cart.tsx
- .env.template.

### Storefront: dejar de usar en runtime

- src/lib/cn-catalog/data/products.json
- src/lib/cn-catalog/data/products-slim.json
- src/lib/cn-catalog/data/product-details.json
- src/lib/cn-catalog/data/taxonomy-counts.json

---

## 18. Orden de implementación

### Fase 0 — congelación y evidencias

1. Crear rama de trabajo.
2. Capturar commit SHA, versiones, PM2, DB migration status.
3. Backup PostgreSQL verificable y checksum.
4. Copiar JSON con checksum como snapshot, sin editarlo.
5. Ejecutar auditoría dry-run.
6. Congelar cambios de catálogo por una ventana corta durante la reconciliación.
7. Registrar el caso testigo CN-10756 y al menos nueve productos representativos.

**Gate:** backup restaurable probado en entorno no productivo y reporte de diferencias revisado.

### Fase 1 — integridad PIM y Admin

1. Limpiar huérfanos aprobados.
2. Crear índice único.
3. Definir inverse read-only link.
4. Implementar validadores/upsert/eventos.
5. SDK JWT en widget y marcas.
6. Specs editable.
7. Integration tests.

**Gate:** Marketing puede leer/editar PIM, recibe feedback, recarga mantiene datos y Store Query recupera PIM por Product.

### Fase 2 — contrato storefront

1. Congelar alias real pim_info.
2. Crear tipos, schemas, mapper y repository.
3. Certificar pricing/inventory/categorías.
4. Añadir feature flag server-only.
5. Tests unit/contract.

**Gate:** los 498 productos se transforman sin ContractError en staging.

### Fase 3 — consumidores sin checkout

1. PDP.
2. categorías/facetas.
3. search/typeahead.
4. home/recientes/listas/quick order.
5. SEO/JSON-LD/feed/sitemap.

**Gate:** paridad visual y datos desde Medusa; rg no encuentra imports JSON en rutas de runtime.

### Fase 4 — carrito

1. localStorage v2.
2. sync por variantId.
3. precio/subtotal backend.
4. RFQ separado de checkout.
5. e2e price change.

**Gate:** cero divergencia entre tarjeta, carrito y checkout.

### Fase 5 — eventos y caché

1. endpoint firmado.
2. subscribers por dominio.
3. event matrix tests.
4. observabilidad y TTL.
5. prueba next start, no next dev.

**Gate:** cada mutación de prueba se refleja en <=30 s sin build/restart.

### Fase 6 — reconciliación y canary

1. aplicar cambios aprobados con script idempotente.
2. verificar invariantes.
3. desplegar backend.
4. desplegar storefront con CATALOG_SOURCE=json.
5. habilitar Medusa para usuarios internos/canary.
6. comparar.
7. habilitar global.

### Fase 7 — estabilización y limpieza

1. observar 7–14 días.
2. retirar fallback JSON y v1 localStorage.
3. archivar scripts destructivos.
4. actualizar historial y runbook.
5. eliminar código duplicado.

---

## 19. Ejecución con agentes paralelos

Los agentes no deben comenzar todos a editar a la vez. Primero se congela el contrato.

### 19.1 Oleadas y dependencias

~~~
W0 Auditoría/reconciliación
   |
W1 Backend PIM/Admin ---- W1 Store contract spike
   |                         |
   +-----------+-------------+
               v
W2 Contrato CatalogProduct congelado
   |
   +--> W3-A PDP/SEO
   +--> W3-B Categorías/facetas
   +--> W3-C Búsqueda/home
   +--> W3-D Carrito
   |
   v
W4 Eventos/cache
   |
W5 Integración/E2E/canary
~~~

### 19.2 Paquetes de trabajo

**Agente A — integridad PIM**

- propiedad exclusiva: module PIM, product-pim link, migración, workflow, Admin PIM API;
- no editar storefront;
- entrega: pruebas y contrato de alias.

**Agente B — Admin UI**

- propiedad exclusiva: admin/lib/sdk.ts, widget, brands page;
- depende del schema de Agente A;
- no cambiar API.

**Agente C — repository/contrato storefront**

- propiedad exclusiva: src/lib/catalog, config/cookies de cache;
- publica CatalogProduct v1;
- ningún componente UI.

**Agente D — PDP/SEO**

- propiedad: product page, product templates, JSON-LD, product detail API;
- depende de CatalogProduct v1.

**Agente E — categorías**

- propiedad: store page/templates/componentes mobile, facets;
- no editar taxonomy core mientras Agente C lo haga.

**Agente F — búsqueda/home**

- propiedad: search pages/components, search API, home/recent/quick-order;
- coordinar shell-lists con carrito.

**Agente G — carrito**

- propiedad: shell-cart provider/template y lib/data/cart.ts;
- contrato v2 congelado antes de editar.

**Agente H — feeds/sitemap**

- propiedad: merchant route, sitemap;
- no tocar PDP.

**Agente I — eventos/cache backend**

- propiedad: subscribers y revalidation client;
- coordina payload con Agente C; no modificar widget.

**Agente J — QA/integración**

- solo tests/reportes al inicio;
- no arreglar código ajeno sin reasignación;
- mantiene matriz de aceptación.

### 19.3 Reglas de coordinación

1. Un archivo tiene un propietario por oleada.
2. CatalogProduct v1, payload de revalidación v1 y enum mapping se aprueban antes de W3.
3. Cada agente trabaja en branch/commit aislado.
4. Merge: A → B → C → I → D/E/F/H → G → J.
5. Después de cada merge: typecheck + unit; después de oleada: build + integration.
6. No resolver conflictos aceptando ours/theirs en archivos de contrato.
7. Toda desviación del contrato requiere ADR corto y aviso a consumidores.
8. Los agentes no ejecutan seeds ni SQL de escritura en producción.

---

## 20. Pruebas requeridas

### 20.1 Unitarias

- mapper de campos;
- normalización specs;
- enum legacy;
- disponibilidad;
- priceMode;
- múltiples variantes;
- ausencia de precio;
- producto discontinuado;
- tags por evento;
- HMAC/timestamp/replay;
- localStorage v1→v2;
- TSV escaping.

### 20.2 Backend integration

- Admin GET/PUT PIM con JWT válido;
- sin JWT → 401;
- body inválido → 400;
- product inexistente → 404;
- creación concurrente → una fila;
- Query Product → PIM;
- Store API entrega calculated_price correcto con region_id;
- inventory_quantity correcto;
- brand y categorías;
- emisión b2b-pim.updated;
- cada workflow Admin emite el evento suscrito real.

### 20.3 Contract

Fixtures:

1. buy_now, precio y stock;
2. quote_only;
3. lead_time;
4. made_to_order;
5. discontinued;
6. sin precio;
7. múltiples imágenes;
8. specs Unicode;
9. categoría inactiva;
10. dos variantes.

Snapshot de contrato no debe contener datos privados ni IDs de sesión.

### 20.4 E2E

Para cada campo:

1. login Admin;
2. editar;
3. guardar;
4. confirmar 2xx;
5. observar evento;
6. observar invalidación;
7. visitar superficie pública nueva/incógnito;
8. confirmar valor;
9. refrescar y confirmar persistencia.

Campos mínimos: title, description, image, PEN price, inventory, category, mfr_model, specs, technical_pdf, purchase_mode, availability_mode, seo_title.

### 20.5 Matriz de superficies

| Cambio | PDP | Categoría | Search | Typeahead | Home | Cart | Feed | Sitemap |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| título | sí | sí | sí | sí | sí | sí | sí | no |
| precio | sí | sí | sí | sí | sí | sí | sí | no |
| stock | sí | sí | sí | opcional | sí | sí | sí | no |
| specs | sí | sí | sí | búsqueda | no | no | no | no |
| handle | URL | links | links | links | links | links | link | sí |
| status | 404 | retirar | retirar | retirar | retirar | retirar | retirar | retirar |
| categoría | breadcrumb | mover | facet | selector | contador | no | opcional | sí |
| SEO | metadata | no | no | no | no | no | no | lastmod |

### 20.6 Rendimiento

- 498 productos paginados, sin N+1;
- carga de categoría p95 objetivo <500 ms server-side con cache caliente;
- typeahead p95 <300 ms;
- payload cliente no incluye catálogo completo;
- invalidación no hace thundering herd;
- build no genera 498 copias con datos incrustados si se decide rendering dinámico/ISR.

---

## 21. Observabilidad

Logs estructurados:

~~~
event_id
event_name
entity_id
product_ids
source
attempt
http_status
duration_ms
invalidated_tags_count
resolution=exact|fallback_global
request_id
error_code
~~~

Métricas:

- catalog_revalidation_total por event/status;
- catalog_revalidation_failure_total;
- catalog_revalidation_latency_seconds;
- catalog_contract_error_total por field;
- catalog_source_total medusa/json;
- catalog_stale_probe_mismatch_total;
- pim_admin_save_total success/error;
- products_without_pim;
- products_without_leaf_category;
- buy_now_without_price;
- in_stock_without_inventory.

Alertas:

- cualquier ContractError en producción;
- tres fallos consecutivos de revalidación;
- PIM huérfano/duplicado >0;
- buy_now sin precio >0;
- fuente JSON activa después de ventana;
- discrepancia precio storefront/Store API.

Crear un smoke probe periódico que compare cinco handles canarios contra Store API y HTML/endpoint de storefront. No muta datos.

---

## 22. Despliegue, canary y rollback

### 22.1 Variables

Backend:

- STOREFRONT_REVALIDATE_URL
- STOREFRONT_REVALIDATE_SECRET

Storefront:

- CATALOG_SOURCE=medusa|json
- REVALIDATE_SECRET
- MEDUSA_BACKEND_URL
- NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY

CATALOG_SOURCE no lleva NEXT_PUBLIC.

### 22.2 Orden

1. backup;
2. migración PIM;
3. backend;
4. smoke Admin/Store API;
5. storefront con source=json;
6. smoke rutas;
7. canary source=medusa;
8. reconciliación final;
9. source=medusa global;
10. pruebas de mutación;
11. monitoreo.

### 22.3 Rollback

Si falla UI/contrato:

- volver CATALOG_SOURCE=json;
- reiniciar solamente storefront;
- mantener escrituras en Medusa;
- no copiar Medusa a JSON;
- corregir y reactivar.

Si falla backend PIM:

- rollback de aplicación;
- down migration solo si no elimina datos;
- productos/precios core siguen operativos.

Si hay dato erróneo:

- restaurar mediante APIs/workflows desde reporte/backup;
- no ejecutar seed masivo;
- invalidar tags.

Rollback no significa volver a editar JSON. Es una ventana técnica temporal de lectura.

---

## 23. Riesgos y mitigaciones

| Riesgo | Impacto | Mitigación |
|---|---|---|
| inventario 50 artificial | venta falsa | reconciliación obligatoria |
| x100 en seed | precios catastróficos | bloquear seed, tests de rango |
| PIM specs inferiores al JSON | pérdida técnica | import one-time por precedencia |
| eventos de nombre incorrecto | caché vieja | integration test de Admin real + TTL |
| handle cambiado | SEO/404 | redirección histórica y sitemap |
| varias variantes futuras | precio equivocado | contrato variants + selección |
| evento indirecto sin productId | invalidación incompleta | resolver o global fallback |
| source flag expuesto al cliente | manipulación/bundle doble | server-only |
| catálogo completo en cliente | bundle/rendimiento | typeahead server |
| feed cambia ID gla | Merchant pierde historial | preservar legacy ID |
| doble escritura | divergencia recurrente | prohibir JSON runtime |
| varios agentes pisan archivos | errores de merge | ownership y oleadas |

---

## 24. Acciones prohibidas

- No editar products.json para “sincronizar” cada cambio.
- No agregar un cron Medusa→JSON→build como solución definitiva.
- No llamar revalidatePath y declarar resuelto antes de retirar imports JSON.
- No consultar PostgreSQL directamente desde Next.
- No calcular precios tomando variants.prices[0].
- No asumir céntimos ni aplicar /100.
- No usar window.fetch en extensiones JWT del Admin.
- No leer token desde localStorage manualmente.
- No usar any en límites de API.
- No ocultar catches.
- No ejecutar medusa-cn-seed.ts actual.
- No ejecutar seed-prices-direct.js o seed-industrial-inventory.js en producción.
- No asignar stock representativo.
- No insertar relaciones con SQL directo.
- No desplegar dynamic source antes de aprobar datos.
- No borrar snapshots/legacy hasta acabar rollback.
- No permitir que varios agentes editen el mismo contrato a la vez.

---

## 25. Criterios de aceptación y Definition of Done

La tarea está terminada únicamente si:

1. Marketing edita todos los campos incluidos sin 401 silencioso.
2. Un cambio se refleja en todas las superficies en <=30 s normalmente y <=15 min aun perdiendo evento.
3. No hace falta build/restart por cambio de catálogo.
4. rg confirma cero imports runtime de products.json/product-details.json/taxonomy-counts.json.
5. Los 498 productos cumplen invariantes.
6. No hay PIM huérfanos/duplicados.
7. Precio PDP=carrito=checkout=Store API.
8. Stock visible deriva de inventario aprobado.
9. Feed y sitemap son dinámicos.
10. Pruebas unit, integration, contract, e2e y build pasan.
11. next start fue probado; no solo next dev.
12. Eventos de producto, PIM, precio, inventario y categoría invalidan.
13. Rollback se probó.
14. Fallback JSON se elimina después de estabilización.
15. Scripts destructivos están bloqueados y sin secretos.
16. Runbook e historial están actualizados.

---

## 26. Checklist de revisión de PR

- [ ] No introduce fuente nueva de producto.
- [ ] No importa JSON de catálogo en runtime.
- [ ] Usa CatalogProduct.
- [ ] Usa calculated_price con region_id.
- [ ] Trata múltiples variantes.
- [ ] Valida PIM.
- [ ] No usa any en API boundary.
- [ ] No tiene catch vacío.
- [ ] Incluye tags.
- [ ] Incluye tests.
- [ ] Incluye logs sin secretos.
- [ ] Respeta server/client boundary.
- [ ] No modifica diseño fuera de alcance.
- [ ] No cambia IDs Merchant sin aprobación.
- [ ] No ejecuta seed/SQL directo.
- [ ] Documenta migración/rollback.

---

## 27. Runbook posterior

### Cambio no aparece

1. Confirmar Admin request 2xx y request_id.
2. Consultar Store API con handle, region_id y fields del contrato.
3. Si Store API está viejo: problema Medusa/dato, no Next.
4. Si Store API está nuevo: buscar subscriber/eventId.
5. Ver respuesta de revalidation.
6. Consultar source activo.
7. Probar endpoint storefront server con cache bypass autorizado.
8. Comparar tags.
9. Esperar TTL solo como contingencia; abrir incidente si excede SLA.

### Precio diferente

1. Confirmar región.
2. Confirmar variante.
3. Inspeccionar calculated_amount/original_amount.
4. Revisar price lists/rules.
5. Revisar carrito existente, que puede requerir refresh.
6. Buscar cualquier /100 o *100.

### PIM 401

1. Confirmar SDK JWT.
2. Confirmar sesión Admin.
3. No agregar token manual.
4. Revisar CORS/proxy.
5. Ver request_id y route protection.

### Invalidación fallida

1. firma/timestamp;
2. URL interna;
3. secreto en ambos servicios;
4. event allowlist;
5. resolución entity→product;
6. respuesta Next;
7. invalidación global manual autenticada si es incidente.

---

## 28. Alternativas evaluadas

### A. no-store en todo

Funcionaría para reflejo inmediato una vez retirado JSON. Es simple, pero aumenta llamadas y latencia. Útil como modo diagnóstico o contingencia, no primera opción permanente.

### B. Medusa + tags + eventos — recomendada

Equilibra frescura, carga y trazabilidad. Requiere más implementación, pero cumple el flujo editorial.

### C. Medusa exporta JSON y reinicia Next

Reduce cambios iniciales, pero conserva build como CMS, retrasa cambios, crea doble escritura y falla parcialmente. No recomendada.

### D. Next consulta PostgreSQL

Acopla esquemas internos, evita pricingContext, rompe límites y seguridad. Rechazada.

### E. CDN purgado únicamente

No resuelve datos compilados ni Data Cache. Rechazada como solución raíz.

---

## 29. Fuentes técnicas

Documentación oficial consultada el 2026-08-31:

- [Medusa: personalizar Admin y usar sdk.client.fetch](https://docs.medusajs.com/learn/customization/customize-admin/route)
- [Medusa: Events and Subscribers](https://docs.medusajs.com/learn/fundamentals/events-and-subscribers)
- [Medusa: precios calculados de variantes en storefront](https://docs.medusajs.com/resources/storefront-development/products/price)
- [Medusa: extender Product](https://docs.medusajs.com/resources/commerce-modules/product/extend)
- [Medusa: inverse read-only Module Links](https://docs.medusajs.com/learn/fundamentals/module-links/read-only)
- [Medusa: extender funcionalidades core](https://docs.medusajs.com/learn/customization/extend-features)
- [Next.js 15: caching y revalidación, modelo anterior a Cache Components](https://nextjs.org/docs/app/guides/caching-without-cache-components)
- [Next.js: revalidatePath](https://nextjs.org/docs/app/api-reference/functions/revalidatePath)
- [Next.js: self-hosting y coordinación de cache](https://nextjs.org/docs/app/guides/self-hosting)

Fuentes locales principales:

- historialcn.md;
- código actual backend/storefront;
- esquema PostgreSQL en ejecución;
- Store API local;
- HTML/headers públicos;
- logs backend;
- paquetes instalados @medusajs 2.17.0 y Next 15.3.9.

---

## 30. Resultado esperado

El estado final no imita WordPress internamente; ofrece el mismo resultado editorial esperado con arquitectura headless:

> Marketing guarda una vez en Medusa. PostgreSQL conserva el cambio. Store API lo presenta con precio e inventario correctos. El evento invalida la copia cacheada. Todas las superficies vuelven a leer el dato autoritativo. No hay JSON paralelo que pueda contradecirlo.

