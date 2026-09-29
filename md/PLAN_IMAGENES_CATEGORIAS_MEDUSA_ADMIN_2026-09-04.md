# Plan técnico — Imágenes de categoría no editables desde Medusa Admin

**Fecha:** 2026-09-04  
**Estado:** investigación completa · **pendiente de ejecución** (esperando aprobación)  
**Síntoma reportado (Marketing):** *“Me sigue apareciendo igual… en el código me debería aparecer la parte de imagen, y solo me deja cambiar texto”* — captura sobre categoría **Control e Indicación** (`pcat_01M01FKGCQQGP5GYZCR3P9HF75`), JSON Inspector: `metadata: null`, UI Metadata **0 keys**.

**Alcance distinto al de ayer:** el pipeline LLL / File Module `/static` habilita **Media de producto**. Este ticket es **imágenes de categoría** (home tiles, hubs `/store`, cabeceras de familia/hoja).

---

## 0. Veredicto

**No es un bug del upload de productos.** Medusa `product_category` **no tiene** campos nativos `thumbnail` / `image` ni UI “Media”. El Admin stock solo edita texto (`name`, `handle`, `description`, status/visibility) + metadata genérico key/value. Las imágenes que ve el storefront **no salen de Medusa**: salen de un mapa estático en el repo (`category-images.json` → `/cn-media/categories/*.webp`). Por eso Marketing edita la categoría en Admin, guarda texto, y la foto de la tienda **no cambia**.

---

## 1. Evidencia

| Hecho | Prueba |
|-------|--------|
| Pantalla = **Categories**, no Products | Captura Admin: nav Categories, handle `control-e-indicacion`, Metadata 0 keys |
| Schema sin imagen | `product_category`: columnas texto + `metadata jsonb`; **sin** thumbnail/image |
| Metadata vacío en prod | `control-e-indicacion` → `metadata NULL`; **73/73** categorías `metadata` null/`{}` |
| Storefront ignora Medusa para imagen | `familyImage` / `leafImage` leen solo JSON local |
| Fuente de verdad actual | `b2b-storefront/src/lib/cn-catalog/data/category-images.json` + `public/cn-media/categories/*.webp` |
| Admin sin widget de categoría | Único widget: `product-pim-widget.tsx` → zone `product.details.after` |
| Ya previsto en plan maestro | `PLAN_MAESTRO_…_2026-08-31` § migración `metadata.image_url` — **no implementado** |

Ejemplo canónico:

```json
"control-e-indicacion": "/cn-media/categories/control-e-indicacion.webp"
```

Consumidores: home L1, hub `/store`, `store/[...slug]`, `leaf-category-listing` (chips/cabecera). Árbol Medusa (`catalog-category-tree.ts`) **no pide** `metadata`.

---

## 2. Causa raíz (cadena)

```
Marketing abre Category Edit
  → UI Medusa sin zona Media (producto ≠ categoría)
  → metadata null / 0 keys
  → Storefront resuelve imagen vía category-images.json + disco storefront
  → Cambiar name/description en Admin ≠ cambiar tile de categoría
```

Confusión esperable: ayer se dijo “ya pueden editar imágenes”; el runbook y el fix cubrían **producto → Media**, no categorías.

---

## 3. Objetivo de solución

Que Marketing pueda **subir / reemplazar la imagen de una categoría desde Medusa Admin** y que el storefront la muestre (home, hubs, cabeceras) sin redeploy de JSON/archivos en repo.

---

## 4. Diseño propuesto (Opción A — recomendada)

Reutilizar File Module `/static` ya operativo + contrato en metadata (alineado al plan maestro).

### 4.1 Contrato de datos

```ts
product_category.metadata = {
  image_url: "/static/categories/<handle>-vN.webp"  // o URL absoluta normalizable
  // opcional: image_alt, image_updated_at
}
```

* Prioridad storefront: `metadata.image_url` → fallback `category-images.json` → fallback calefacción.  
* Normalizar con `normalizeMediaUrl` (same-origin `/static` y `/cn-media`).

### 4.2 Admin — widget custom

* Nuevo: `src/admin/widgets/category-image-widget.tsx`  
* Zone: `product_category.details.after` (o equivalente SDK Admin v2 para category details).  
* UI: preview actual · upload (SDK Admin uploads → File Module) · “Usar como imagen de categoría” · guardar `POST/POST update category` con `metadata.image_url`.  
* No depender del editor genérico “Metadata 0 keys” (poco usable para Marketing).

### 4.3 Storefront

* Extender fetch del árbol de categorías: incluir `metadata` en `fields`.  
* Cambiar `familyImage` / `leafImage` (o capa encima) para aceptar override Medusa por `handle`.  
* Cache/revalidate: tag categorías al guardar (hook backend o `REVALIDATE` ya usado en productos).

### 4.4 Migración one-shot

* Script: leer `category-images.json` → para cada handle con archivo en `public/cn-media/categories/`:  
  - copiar a `apps/backend/static/categories/` **o** dejar URL `/cn-media/...` en metadata (válida vía Nginx),  
  - `UPDATE product_category SET metadata = jsonb_set(...)`  
* Gate: N categorías con `metadata.image_url` no vacío = N en JSON con asset.

### 4.5 Ops / docs

* Ampliar `RUNBOOK_MARKETING_IMAGENES.md`: sección **Categorías** (dónde clic, formato 1:1 WebP, max size).  
* Mensaje claro a Marketing: **Producto → Media** vs **Categoría → widget Imagen**.  
* `ALLOW` / no tocar reconcile de imágenes de producto.

---

## 5. Alternativas descartadas / diferidas

| Opción | Pros | Contras |
|--------|------|---------|
| **B.** Solo editar JSON + `.webp` en repo + rebuild | Cero código Admin | Marketing no puede; requiere ingeniero/redeploy |
| **C.** Metadata manual key/value en Admin sin widget | Cero UI custom | UX mala; sin upload; Marketing ya ve “0 keys” |
| **D.** Extender schema core Medusa con columna image | Ideal semánticamente | Invasivo / upgrades Medusa frágiles |

**Recomendación:** A (widget + `metadata.image_url` + File Module).

---

## 6. Plan de ejecución (fases)

| Fase | Trabajo | Criterio de hecho |
|------|---------|-------------------|
| **0** | Backup DB + confirmar zone Admin category details | dump OK |
| **1** | Migración metadata desde JSON (`/cn-media` o copia a `/static/categories`) | 73 o subset L1+hojas con URL |
| **2** | Storefront: fields `metadata` + prioridad `image_url` + tests mapper | unit + smoke visual 1 categoría |
| **3** | Widget Admin upload → metadata + rebuild backend | Marketing sube en canario |
| **4** | Revalidate categorías + runbook | tile home cambia sin rebuild storefront |
| **5** | Gates: smoke 14/14 · canario Admin E2E · historialcn | PASS |

**Canario sugerido:** `control-e-indicacion` (el de la captura).

**Estimación:** ~0.5–1 día (infra File Module ya existe).

---

## 7. Riesgos

* Zone Admin incorrecta → widget no aparece (validar en docs Medusa Admin SDK v2).  
* SSR sin `metadata` en fields → sigue el JSON (regresión silenciosa).  
* Caché Next/ISR: sin revalidate, Marketing cree que “no guardó”.  
* No confundir con Media de producto en comunicaciones a Marketing.

---

## 8. Workaround inmediato (sin desarrollo)

1. Reemplazar archivo:  
   `b2b-storefront/public/cn-media/categories/control-e-indicacion.webp`  
2. (Si cambia handle/ruta) editar `category-images.json`.  
3. `npm run build` storefront + `pm2 restart cnweb-storefront`.  

Esto **no** es el flujo deseado para Marketing; solo bridge operativo.

---

## 9. Decisión requerida

Aprobar **Opción A** (widget + `metadata.image_url` + migración + storefront) para ejecutar fases 0–5.
