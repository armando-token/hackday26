# Decisiones Arquitectónicas y Técnicas — Fase 1 (Puerta 1)
**Proyecto:** Controlnautas × Meta Muse (Hack Day 2026)  
**Host:** AWS EC2 Ubuntu 24.04 LTS (`ip-172-31-94-6`)  
**Fecha:** 29 de Septiembre de 2026  
**Rama de Trabajo:** `hackday-2026-controlnautas-muse`  
**HEAD Commit Base:** `7d8628a35c9ebfd9a3fca7fcab2ca3976ce34c9f`

---

## 1. Registro del Entorno de Ejecución

| Parámetro | Valor Registrado |
| :--- | :--- |
| **Fecha / Hora (UTC)** | `Tue Sep 29 18:24:16 UTC 2026` |
| **Fecha / Hora (PDT)** | `Tue Sep 29 11:24:16 PDT 2026` |
| **Hostname** | `ip-172-31-94-6` |
| **Kernel / OS** | `Linux ip-172-31-94-6 7.0.0-1013-aws #13~24.04.1-Ubuntu SMP PREEMPT Sat Sep 5 01:10:01 UTC 2026 x86_64` |
| **Antigravity CLI (agy)** | `1.2.13` |
| **Espacio en Disco (`df -h /`)** | 29G total, 6.5G usado, 22G disponible (24% de uso) |
| **Node.js / npm** | Node v20.20.2 / npm 10.8.2 |
| **Python** | Python 3.12.3 |
| **Motor de Base de Datos** | PostgreSQL 16 (Localhost:5432, base de datos `medusa`) |

---

## 2. Región, Moneda y Canales de Venta

### A. Moneda del Proyecto
- **Moneda oficial:** Nuevo Sol Peruano (`PEN`, símbolo `S/.`).
- **Configuración en Medusa:** La moneda `pen` se encuentra registrada en la tabla `currency` y asignada como moneda soportada en `store_currency`.

### B. Región Operativa
- **Región:** Se determinó y configuró la Región Perú (`Peru / PEN`) asignada al país `pe` (código numérico 604, ISO alpha-2 `pe`), con proveedor de pago `manual` y moneda `pen`.
- **Compatibilidad con Catálogo Preexistente:** La instancia mantenía una región por defecto europea (`reg_01M3Q5VTTTDD0CQB51ZEJT783B`), por lo que la incorporación de la región Perú se efectuó sin alterar las configuraciones previas.

### C. Canales de Venta e Inventario
- **Canal de Ventas:** Los 3 productos demo están vinculados al canal de ventas por defecto (`Default Sales Channel` / `sc_...`) y asociados a la clave pública de API (`Industrial Storefront Key` / `Default Publishable API Key`).
- **Ubicación de Stock:** Se utilizó la ubicación de almacenamiento principal (`European Warehouse` / `sloc_01M3Q5VTXYB552BSCQY58WFNFM`), vinculada al canal de ventas mediante `sales_channel_stock_location`.

---

## 3. Método Real de Precios y Stock Observado en Medusa v2

### A. Precios en Medusa v2
En Medusa v2, la arquitectura de precios está completamente desacoplada de la tabla `product_variant`:
1. Cada variante posee una relación a un `price_set` en la tabla `product_variant_price_set`.
2. Los precios se gestionan a través del módulo `pricingModuleService`, creando o actualizando registros en la tabla `price` vinculados al `price_set_id`.
3. **Unidades de Precio:** Siguiendo la convención unificada del proyecto y el script de cutover `fix-prices-major-units.ts`, los importes se registran en unidades mayores estándar (`PEN 890`, `PEN 480`, `PEN 75`), soportando también la representación en centavos (`89000`, `48000`, `7500`) según el contexto de consulta del SDK de Medusa.

### B. Gestión de Stock e Inventario
En Medusa v2, el inventario opera mediante tres entidades vinculadas:
1. `inventory_item`: Almacena el ítem con su SKU, título e indicación de transporte.
2. `product_variant_inventory_item`: Establece el enlace `1:1` entre la variante del producto y el ítem de inventario.
3. `inventory_level`: Registra la cantidad en stock físico (`stocked_quantity`: 3, 2, 8) para la ubicación designada (`location_id`), con cantidades raw codificadas en formato de alta precisión JSON (`raw_stocked_quantity: {"value": "3", "precision": 20}`).

---

## 4. Extensión del Esquema Técnico (Módulo PIM)

### Evaluación del PIM Preexistente
El módulo `b2b-pim` existente contenía la tabla `pim_info` con atributos planos de catálogo general. No disponía de una estructura normalizada para hechos técnicos verificables, fuentes documentales, trazabilidad de citas ni el vocabulario controlado requerido por Meta Muse.

### Nuevas Tablas Implementadas
Se diseñaron e incorporaron 3 entidades normalizadas mediante el framework `@medusajs/framework/utils` en `src/modules/b2b-pim/models/`:

1. **`technical_profile`**:
   - `id` (text, PK)
   - `variant_id` (text, UNIQUE, FK a product_variant)
   - `model` (text)
   - `revision` (text)
   - `demo` (boolean, default true)
   - Timestamps (`created_at`, `updated_at`, `deleted_at`)

2. **`technical_fact`**:
   - `id` (text, PK)
   - `variant_id` (text, FK a product_variant)
   - `property` (enum cerrado: `mounting`, `supply_voltage`, `analog_input`, `analog_output`, `protocol`, `interface`, `sensor_element`, `control_function`)
   - `normalized_value_json` (jsonb, ej. `{"direction":"input","min":4,"max":20,"unit":"mA","channels":2}`)
   - `display_value` (text)
   - `source_id` (text, referencia a technical_source)
   - `page` (integer)
   - `section` (text)
   - `excerpt` (text, fragmento textual citable exacto)
   - `polarity` (boolean, default true; false para contraejemplos o hechos prohibitivos)
   - Timestamps (`created_at`, `updated_at`, `deleted_at`)

3. **`technical_source`**:
   - `id` (text, PK)
   - `url` (text, enlace HTTPS / local al datasheet PDF)
   - `kind` (text, ej. `datasheet_pdf`)
   - `revision` (text, ej. `rev-2026.1`)
   - `checksum` (text, SHA-256 del archivo PDF)
   - `published_at` (timestamptz)
   - Timestamps (`created_at`, `updated_at`, `deleted_at`)

### Migración Ejecutada
- Archivo generado: `Migration20260929181517.ts`.
- Ejecutado limpiamente en PostgreSQL `medusa` con índices sobre `variant_id`, `property`, `source_id`, `url` y `checksum`.

---

## 5. Diseño y Generación de Datasheets PDF y Especificaciones Markdown

### A. Datasheets Sintéticos en PDF
- **Script generador:** `/home/ubuntu/hackday26/scripts/generate-synthetic-datasheets.py`.
- **Librería utilizada:** Python `reportlab` con `NumberedCanvas` de dos pasadas para calcular totales de página exactos.
- **Marcas de conformidad obligatorias:**
  - Cabecera y pie de cada página: `SIMULACIÓN — AMBIENTE DE DEMOSTRACIÓN TÉCNICA` en rojo `#DC2626`.
  - Encabezado principal: `PRODUCTO FICTICIO — DATOS DE DEMOSTRACIÓN`.
- **Estructura fija citable:** 6 secciones numeradas idénticas en los 3 documentos:
  - Sección 1: Identificación y Modelo
  - Sección 2: Montaje Físico
  - Sección 3: Alimentación Eléctrica
  - Sección 4: Entradas / Salidas Analógicas y Sensores
  - Sección 5: Comunicaciones y Protocolos
  - Sección 6: Restricciones y Contraindicaciones de Diseño
- **Ubicación de archivos:** `/home/ubuntu/hackday26/docs/datasheets/` y copia estática en `/home/ubuntu/hackday26/b2b-backend/apps/backend/static/demo/datasheets/`.

### B. Especificaciones Técnicas en Markdown
- **Archivos creados:**
  - `/home/ubuntu/hackday26/docs/demo-specs/CN-DEMO-PLC-DIN-420-MR1.md`
  - `/home/ubuntu/hackday26/docs/demo-specs/CN-DEMO-PID-PT100-RS1.md`
  - `/home/ubuntu/hackday26/docs/demo-specs/CN-DEMO-PT100-3W-A1.md`
  (con copias estáticas en `/home/ubuntu/hackday26/b2b-backend/apps/backend/static/demo/specs/`).
- **Citas textuales verificadas:** 100% de los fragmentos citados (`excerpt`) corresponden de manera idéntica al texto contenido en los PDFs generados.
- **Regla estricta de precio/stock:** Se comprobó la ausencia total de precios y niveles de stock en los documentos Markdown.

---

## 6. Estrategia de Idempotencia y Reversibilidad del Seed

### A. Script de Seed (`seed-hackday-demo.ts`)
- Localiza productos y variantes existentes por SKU (`CN-DEMO-PLC-DIN-420-MR1`, `CN-DEMO-PID-PT100-RS1`, `CN-DEMO-PT100-3W-A1`) o handle.
- Si existen, actualiza sus campos in-place sin duplicar registros ni alterar sus identificadores primarios.
- Si no existen, los crea vinculados al canal demo, categoría correspondiente y ubicación de inventario.
- Asocia metadata `{ hackday_demo: true }`.
- Pobla de manera determinista `technical_profile`, `technical_fact` y `technical_source`.
- Genera el archivo `/home/ubuntu/hackday26/hackday-demo-manifest.json` reflejando los IDs dinámicos generados por Medusa.

### B. Script de Revert (`revert-hackday-demo.ts`)
- Filtra de manera segura y exclusiva los registros marcados con SKU que comience con `CN-DEMO-` o metadata `hackday_demo: true`.
- Elimina los hechos técnicos (`technical_fact`), perfiles (`technical_profile`), fuentes demo (`technical_source`), niveles de inventario (`inventory_level`), ítems de inventario (`inventory_item`), precios (`price`), variantes (`product_variant`) y productos demo (`product`).
- **Garantía de No Contaminación:** No realiza operaciones `CASCADE` masivas sobre tablas de catálogo general, garantizando la preservación al 100% de los productos industriales preexistentes.

---

## 7. Verificación Automatizada (Suite `verify-phase1.ts`)
Se implementó una suite integral automatizada en TypeScript:
- Ruta: `/home/ubuntu/hackday26/scripts/verify-phase1.ts`.
- Runner ejecutable: `/home/ubuntu/hackday26/scripts/verify-phase1.sh`.
- Cubre el 100% de los criterios de la Puerta 1 con validación criptográfica, de base de datos, extracción directa de streams PDF y parsing de markdown.
