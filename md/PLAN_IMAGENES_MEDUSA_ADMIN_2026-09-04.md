# Plan técnico — Imágenes de producto no editables desde Medusa Admin

**Fecha:** 2026-09-04  
**Estado:** investigación completa · **pendiente de ejecución** (esperando aprobación)  
**Síntoma reportado:** Marketing puede editar subtítulos en Medusa Admin, pero **no puede cambiar ni subir imágenes** de productos. Parece que las imágenes están “hardcodeadas”.

---

## 0. Veredicto (1 párrafo)

**No están hardcodeadas en el código React.** Las URLs viven en PostgreSQL (`product.thumbnail` + tabla `image`) y el storefront las lee desde Medusa. El bloqueo real es de **infraestructura de archivos**: el Admin de Medusa intenta subir vía File Module local a `/static`, pero esa ruta **no está configurada, no existe en disco y Nginx no la sirve**. Las imágenes actuales son rutas relativas `/cn-media/...` apuntando a archivos estáticos en el storefront. Subtítulos funcionan porque son campos de texto en BD; las imágenes requieren un pipeline de upload + URL pública que hoy está incompleto.

---

## 1. Evidencia que confirma el reporte de Marketing

### 1.1 Subtítulos sí se editan (probado)

Hoy 2026-09-03 Marketing actualizó subtítulos. Ejemplos en BD (`product.updated_at`):

| Handle | `updated_at` (UTC) |
|--------|--------------------|
| `manta-de-lana-de-roca-con-malla` | 2026-09-03 21:40 |
| `panel-de-lana-de-roca-con-aluminio` | 2026-09-03 21:39 |
| `panel-lana-de-roca-alta-densidad` | 2026-09-03 21:36 |
| … (varios productos lana de roca) | misma sesión |

Eso demuestra: **sesión Admin OK, permisos de escritura de producto OK, API Admin funciona para campos de texto.**

### 1.2 Imágenes actuales: 100 % rutas `/cn-media/`

Consulta PostgreSQL (productos publicados):

| Campo | http://… | `/cn-media/…` | `/static/…` |
|-------|----------|---------------|-------------|
| `product.thumbnail` (498) | **0** | **498** | **0** |
| `image.url` (708) | **0** | **708** | **0** |

Ejemplo real:

```
handle: panel-lana-de-roca-alta-densidad
thumbnail: /cn-media/products/12937/Captura-de-pantalla-345-2.webp
archivo en disco: b2b-storefront/public/cn-media/products/12937/...webp  (existe)
```

### 1.3 Por qué “parece hardcodeado”

- En Admin se ve la imagen, pero la URL es un path relativo a un **árbol de archivos estáticos** migrado del catálogo WooCommerce/JSON.
- Nginx sirve `/cn-media/` directo desde disco con `Cache-Control: immutable` (1 año).
- El botón Media del Admin **no escribe en `/cn-media/`**; intenta otro pipeline (`/static` vía File Module).
- Resultado percibido: “puedo editar texto, pero la imagen no cambia / no me deja subir”.

---

## 2. Arquitectura actual de imágenes (cómo funciona hoy)

```
┌─────────────────────┐     Store API      ┌──────────────────────┐
│  PostgreSQL Medusa  │ ─────────────────► │  Next.js storefront  │
│  thumbnail + images │   URLs /cn-media/  │  catalog-mappers.ts  │
└─────────────────────┘                    └──────────┬───────────┘
                                                      │ <img src="/cn-media/...">
                                                      ▼
┌─────────────────────┐                    ┌──────────────────────┐
│  Disco (única fuente│ ◄── Nginx root ─── │  location /cn-media/ │
│  de bytes de imagen)│                    │  → storefront/public │
│  public/cn-media/   │                    └──────────────────────┘
└─────────────────────┘
```

**Capa datos (editable vía Admin API):** filas en `product` / `image`.  
**Capa bytes (no editable hoy desde Admin):** archivos en `b2b-storefront/public/cn-media/`.

El storefront **sí** usa Medusa como fuente de verdad de URLs (`catalog-repository.ts` pide `thumbnail,*images`; `catalog-mappers.ts` las mapea). No hay fallback a `products.json` en runtime (Fase 7).

---

## 3. Causa raíz técnica (por qué falla el upload)

### 3.1 Medusa File Module local — defaults sin configurar

`medusa-config.ts` **no declara** el módulo `file` ni opciones de storage. Medusa usa el provider local por defecto:

| Opción | Default de `@medusajs/file-local` | Estado en CN_Web |
|--------|----------------------------------|------------------|
| `upload_dir` | `{cwd}/static` | **La carpeta no existe** |
| `backend_url` | `http://localhost:9000/static` | **Incorrecto en producción** |
| Serving HTTP `/static` | Debe montarse en Express/Nginx | **404** en backend y no hay `location` en Nginx |

Código del provider (resumen):

```js
// node_modules/@medusajs/file-local/.../local-file.js
this.uploadDir_ = options?.upload_dir || path.join(process.cwd(), "static")
this.backendUrl_ = options?.backend_url || "http://localhost:9000/static"
```

### 3.2 Nginx no enruta `/static` al backend

En `/etc/nginx/sites-enabled/cnweb`:

- Existe: `/cn-media/`, `/images/`, `/_next/static/`, `/app`, `/admin`, `/auth`, `/hooks`
- **No existe:** `location /static/`
- Cualquier petición a `https://controlnautas.com/static/...` cae en `location /` → **Next.js** → **404**

### 3.3 Endpoint de upload existe, pero el ciclo está roto

```
POST /admin/uploads  →  401 sin auth (endpoint vivo)
GET  /static/        →  404
GET  /uploads/       →  404
```

Aunque Marketing autenticada logre un `POST /admin/uploads` 200:

1. El archivo se escribiría en `apps/backend/static/` (si se crea).
2. La URL guardada sería algo como `http://localhost:9000/static/…` o similar.
3. Esa URL **no es pública** desde el navegador de Marketing ni desde la tienda.
4. En Admin/PDP la imagen aparece rota o no se actualiza de forma usable.

### 3.4 Contraste: por qué los subtítulos sí funcionan

| Acción | Pipeline | ¿Depende de File Module? | ¿Depende de Nginx static? |
|--------|----------|--------------------------|---------------------------|
| Editar subtitle | `POST/PUT /admin/products/:id` → columna `product.subtitle` | No | No |
| Subir imagen Media | `POST /admin/uploads` → disco + URL → update `images`/`thumbnail` | **Sí** | **Sí** |

---

## 4. Factores secundarios (no causan el bloqueo, pero agravarán el fix)

### 4.1 Parche frágil en `node_modules`

`@medusajs/medusa/dist/loaders/admin.js` fue parchado a mano para servir `/cn-media` e `/images` desde el storefront. Eso:

- Solo ayuda a **ver** imágenes existentes en Admin.
- **No** habilita uploads.
- Se **pierde en `npm install` / upgrade** de Medusa.

### 4.2 `reconcile-catalog-cutover.ts` puede sobrescribir imágenes

El paso `images` del reconcile toma URLs desde `products.json` y las aplica a Medusa. Si Marketing cambia una imagen en BD y luego alguien ejecuta `catalog:reconcile:apply`, **puede revertir** el cambio. Hay que excluir imágenes del reconcile o exigir flag explícito.

### 4.3 Cache immutable de Nginx en `/cn-media/`

```nginx
location /cn-media/ {
    root .../b2b-storefront/public;
    add_header Cache-Control "public, max-age=31536000, immutable";
}
```

Si se **reemplaza el mismo filename**, el navegador/CDN puede seguir mostrando la imagen vieja. Solución operativa: nombres con timestamp/hash (Medusa local ya antepone `Date.now()-`).

### 4.4 `next.config.js` remotePatterns

Hoy permite `localhost` y buckets S3 de demo Medusa. **No** incluye `controlnautas.com` ni un bucket propio. Con rutas relativas `/cn-media/...` Next las sirve como same-origin (OK). Si el fix genera URLs absolutas `https://controlnautas.com/static/...`, hay que añadir el hostname a `remotePatterns` **o** seguir usando paths relativos.

### 4.5 Límite de tamaño

`client_max_body_size 50m` en Nginx → no es el problema para fotos de producto típicas (<5 MB).

---

## 5. Hipótesis descartadas

| Hipótesis | ¿Cierta? | Evidencia |
|-----------|----------|-----------|
| Imágenes hardcodeadas en JSX/React del catálogo | **No** | Mapper lee `thumbnail`/`images` de Medusa Store API |
| Fallback JSON en runtime | **No** | Fase 7: `CATALOG_SOURCE=medusa` only |
| Marketing sin permisos de producto | **No** | Editó subtítulos hoy en varios productos |
| Admin Media deshabilitado a propósito | **No** | UI estándar Medusa; endpoint `/admin/uploads` existe |
| Solo falla en un producto | **No** | 498/498 thumbs usan el mismo patrón `/cn-media/` |

---

## 6. Objetivo de la solución

Marketing debe poder, desde Medusa Admin (sección **Media** del producto):

1. Subir una o más imágenes nuevas.
2. Reordenar / marcar thumbnail.
3. Ver la imagen inmediatamente en Admin.
4. Verla en la tienda (PDP, listados, feed) tras revalidación de caché.
5. Sin depender de SSH, `scp`, ni editar `products.json`.

**Invariante de negocio:** URLs públicas finales preferiblemente bajo el mismo dominio (`/cn-media/...` o `/static/...` en `controlnautas.com`), no `localhost`.

---

## 7. Opciones de solución (comparadas)

### Opción A — File Module local + servir `/static` (recomendada corto plazo)

**Qué hacer:**

1. Crear `apps/backend/static/` (o `static/uploads/`).
2. Configurar en `medusa-config.ts`:

```ts
{
  resolve: "@medusajs/medusa/file",
  options: {
    providers: [{
      resolve: "@medusajs/medusa/file-local",
      id: "local",
      options: {
        upload_dir: "static",
        // URL pública real (NO localhost)
        backend_url: "https://controlnautas.com/static",
      },
    }],
  },
}
```

3. Nginx: añadir

```nginx
location /static/ {
    alias /home/ubuntu/CN_Web/b2b-backend/apps/backend/static/;
    expires 30d;
    add_header Cache-Control "public, max-age=2592000";
    # NO usar immutable si se reescribe el mismo nombre
}
```

4. Montar también Express static `/static` en el backend (además de Nginx) para que `:9000/static` funcione en smoke interno.
5. Añadir `controlnautas.com` a `next.config.js` → `images.remotePatterns` si se guardan URLs absolutas; **mejor** normalizar a path relativo `/static/...` en un mapper/helper.
6. Restart PM2 + `nginx -t && reload`.
7. Prueba E2E: Admin → Media → upload → Save → PDP muestra nueva imagen.

**Pros:** cambio acotado, sin AWS, alinea con Medusa standard.  
**Contras:** archivos en el servidor (backup/disco); hay que incluir `static/` en backups; no ideal a escala multi-nodo.

### Opción B — Subir a `/cn-media/products/{sku|id}/` (máxima compatibilidad con catálogo actual)

Provider local o script/widget custom que escriba en `b2b-storefront/public/cn-media/products/...` y guarde URL relativa `/cn-media/...`.

**Pros:** mismo patrón que las 708 imágenes actuales; Nginx ya sirve `/cn-media/`.  
**Contras:** acopla backend a path del storefront; hay que evitar `immutable` o usar filenames únicos; más custom.

### Opción C — S3 / R2 (recomendado medio plazo / producción robusta)

Provider `@medusajs/file-s3` (o compatible) + bucket privado/público + CDN.

**Pros:** estándar Medusa Cloud, escalable, backups de objetos separados.  
**Contras:** coste, IAM, CORS, migración de 708 URLs existentes (opcional: solo nuevas subidas).

### Recomendación

1. **Ahora:** Opción **A** (desbloquea Marketing en horas).  
2. **En paralelo:** proteger reconcile (no pisar imágenes) + runbook Marketing.  
3. **Después:** evaluar Opción **C** si el catálogo/media crece o se replica el backend.

---

## 8. Plan de implementación detallado (Opción A)

### Fase 0 — Congelación y backup (15–20 min)

1. Dump PostgreSQL: `medusa_pre_image_upload_YYYYMMDD.dump`.
2. Snapshot de conteos:

```sql
SELECT COUNT(*) FROM image WHERE deleted_at IS NULL;
SELECT LEFT(url, 20), COUNT(*) FROM image WHERE deleted_at IS NULL GROUP BY 1;
```

3. Confirmar gate baseline: `catalog:audit` / `catalog:verify` en verde.
4. **No** ejecutar `catalog:reconcile:apply` durante la ventana.

### Fase 1 — Config File Module (20–30 min)

1. Editar `b2b-backend/apps/backend/medusa-config.ts` → registrar módulo `file` + `file-local` con `backend_url: https://controlnautas.com/static`.
2. Crear directorio `apps/backend/static` con permisos `ubuntu:ubuntu`, writable por PM2.
3. Añadir `static/` a `.gitignore` del backend (o política de backup explícita).
4. Documentar en `.env.template`: `FILE_BACKEND_URL`, opcional override.

### Fase 2 — Serving público (20 min)

1. Patch **propio** (no solo `node_modules`): loader/middleware en `src/` o config documentada que haga `app.use("/static", express.static(...))` de forma durable (evitar depender del patch frágil de `admin.js`).
2. Nginx `location /static/` → alias al directorio real.
3. `nginx -t` + reload.
4. Smoke: `curl -I https://controlnautas.com/static/.keep` → 200 tras poner archivo de prueba.

### Fase 3 — Storefront (15–20 min)

1. `next.config.js`: añadir hostname `controlnautas.com` (y `www` si aplica) a `remotePatterns`.
2. Opcional: helper `normalizeMediaUrl(url)` que convierta `https://controlnautas.com/static/x` → `/static/x` para same-origin.
3. Verificar que revalidación de catálogo (`catalog-*-revalidation`) dispara en `product.updated` (ya existe) tras cambiar Media.

### Fase 4 — Protección contra sobrescritura (15 min)

1. En `reconcile-catalog-cutover.ts`: **no** aplicar paso `images` por defecto; requerir flag `ALLOW_IMAGE_RECONCILE=1` o argumento `images`.
2. Actualizar runbook: “Marketing es dueña de imágenes en Medusa; JSON solo referencia histórica”.

### Fase 5 — Prueba con Marketing (30 min)

Producto canario (ej. `panel-lana-de-roca-alta-densidad`):

1. Admin → Media → Upload imagen nueva (webp/jpg < 2 MB).
2. Verificar respuesta `POST /admin/uploads` = 200 y URL bajo `/static/...`.
3. Save producto → fila nueva en `image` + `thumbnail` actualizado.
4. Abrir PDP en tienda (hard refresh / espera revalidate) → imagen nueva visible.
5. Confirmar que subtítulo sigue editable y no se rompió.

### Fase 6 — Documentación y gates (15 min)

1. Sección en `md/historialcn.md`.
2. Runbook Marketing: pasos exactos Media + formatos aceptados.
3. Comando smoke opcional: `catalog:smoke` + check HTTP 200 de una URL `/static/` de prueba.

---

## 9. Criterios de aceptación (Definition of Done)

- [ ] Marketing sube imagen desde Admin sin SSH.
- [ ] `POST /admin/uploads` autenticado → **200** (no 401/500).
- [ ] Archivo aparece en disco bajo el dir configurado.
- [ ] `GET https://controlnautas.com/static/<archivo>` → **200**.
- [ ] PDP y listado muestran la imagen nueva.
- [ ] 498 productos con `/cn-media/` **siguen funcionando** (regresión cero).
- [ ] `catalog:audit` / `catalog:verify` / `catalog:smoke` en verde.
- [ ] Reconcile **no** pisa imágenes sin flag explícito.
- [ ] Backup pre-cambio conservado.

---

## 10. Riesgos y mitigación

| Riesgo | Impacto | Mitigación |
|--------|---------|------------|
| Patch solo en `node_modules` | Se pierde en upgrade | Config en `medusa-config` + middleware propio en `src/` + Nginx |
| Disco se llena con uploads | Medio | Rotación, límites, o migrar a S3 (Opción C) |
| Cache immutable `/cn-media` | Imagen vieja visible | Filenames únicos; no reutilizar nombre |
| Reconcile apply | Revierte Media | Gate/flag en script |
| URLs `localhost` en BD | Imágenes rotas fuera del server | `backend_url` = dominio público desde el día 1 |
| Multi-instancia futura | Archivos solo en un nodo | Entonces Opción C (S3) |

---

## 11. Estimación

| Fase | Esfuerzo |
|------|----------|
| 0 Backup + baseline | 20 min |
| 1 Config File Module | 30 min |
| 2 Nginx + static serve | 20 min |
| 3 Storefront remotePatterns | 20 min |
| 4 Proteger reconcile | 15 min |
| 5 Prueba E2E Marketing | 30 min |
| 6 Docs | 15 min |
| **Total** | **~2.5 h** |

---

## 12. Qué NO hay que hacer

- No “hardcodear” nuevas imágenes en componentes React.
- No volver a sincronizar catálogo desde JSON como fuente de imágenes.
- No usar `backend_url: http://localhost:9000/static` en producción.
- No decirle a Marketing que edite archivos por FTP/SCP como flujo normal (solo emergencia).

---

## 13. Próximo paso solicitado al negocio

Este documento es **solo investigación + plan**. Para implementar la **Opción A** (desbloqueo inmediato) hace falta aprobación explícita.

Cuando se apruebe, el orden de ejecución será exactamente: Fase 0 → 1 → 2 → 3 → 4 → 5 → 6, sin avanzar si falla un smoke de la fase anterior.
