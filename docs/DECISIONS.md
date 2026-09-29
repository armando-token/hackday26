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

---

# Decisiones Arquitectónicas y Técnicas — Fase 2 (Puerta 2)
**Proyecto:** Controlnautas × Meta Muse (Hack Day 2026)  
**Host:** AWS EC2 Ubuntu 24.04 LTS (`ip-172-31-94-6`) | Elastic IP: `52.20.66.203`  
**Fecha:** 29 de Septiembre de 2026  
**Rama de Trabajo:** `hackday-2026-controlnautas-muse`  
**HEAD Base Fase 2:** `bcff68d1e07cb802cb7703094034d9ef6ee88111`

---

## 8. Arquitectura y Contrato de la API Agent-Commerce (`/api/muse/v1`)

### A. Propósito y Alcance de la Puerta 2
La Fase 2 establece el contrato de interfaz HTTP machine-to-machine (M2M) diseñado específicamente para agentes autónomos de aprovisionamiento industrial (conector Meta Muse). Su propósito es permitir el descubrimiento técnico de productos, la inspección de perfiles documentados y la evaluación formal de idoneidad técnica.

### B. Endpoints del Contrato HTTP `/api/muse/v1`

| Endpoint | Método | Autenticación | Status Codes | Propósito y Contrato |
| :--- | :---: | :---: | :---: | :--- |
| `/healthz` | `GET` | Pública (Sin Auth) | `200`, `500` | Healthcheck de liveness sin secretos: `{ status: "ok", version, commit }`. |
| `/api/muse/v1/products/search` | `GET` | Bearer Token | `200`, `400`, `401`, `500` | Búsqueda técnica de variantes demo con filtrado determinista y URLs públicas. |
| `/api/muse/v1/products/{variantId}` | `GET` | Bearer Token | `200`, `401`, `404`, `500` | Perfil técnico completo, hechos (`facts`) y fuentes documentales (`sources`) versionadas. |
| `/api/muse/v1/evaluate` | `POST` | Bearer Token | `200`, `400`, `401`, `404`, `500` | Motor de evaluación determinista basado en predicados formales y evidencia citable. |

### C. Exclusiones de Alcance (Diferidas a Fases 3 y 4)
Quedan estrictamente fuera de la Fase 2:
- Endpoint `/offer` (cotización comercial y disponibilidad en vivo).
- Endpoint `/preliminary-quotes` (gestión de solicitudes preliminares).
- Generación de PDFs comerciales de cotización.
- Adaptador real del conector Meta Muse (se simula mediante el contrato HTTP estándar).

---

## 9. Esquema de Predicados Técnicos y Motor Determinista (NO LLM)

### A. Vocabulario Técnico Cerrado (`property`)
Para garantizar la estricta interoperabilidad entre agentes y evitar ambigüedades semánticas, se restringió el conjunto de propiedades evaluables a un vocabulario cerrado canónico de 8 términos tipados:
1. `mounting`: Tipo y estándar de montaje mecánico (ej. `din_35mm`, `panel`).
2. `supply_voltage`: Especificación de alimentación eléctrica (ej. `24_vdc`, `85_265_vac`).
3. `analog_input`: Canales, rango y señal de entrada analógica (ej. `4_20_ma`, `pt100_3w`).
4. `analog_output`: Canales, rango y señal de salida analógica (ej. `4_20_ma`, `0_10_v`).
5. `protocol`: Protocolos de comunicación industrial soportados (ej. `modbus_rtu`, `none`).
6. `interface`: Interfaz física de capa de enlace (ej. `rs485`, `none`).
7. `sensor_element`: Tipo de elemento transductor (ej. `pt100_class_a`).
8. `control_function`: Modo de control o lógica de proceso (ej. `pid`, `logic_control`).

Cualquier solicitud de evaluación con una propiedad no perteneciente a este vocabulario es rechazada de inmediato con `HTTP 400 Bad Request` y código de error `INVALID_VOCABULARY` o `INVALID_PROPERTY`.

### B. Operadores Deterministas Permitidos
El motor soporta únicamente operadores relacionales y de conjuntos de evaluación booleana pura:
- `equals`: Igualdad estricta de valores normalizados o cadenas canónicas.
- `not_equals`: Desigualdad estricta respecto al valor normalizado.
- `range_contains`: Inclusión de rangos analógicos (verifica compatibilidad de unidades, dirección `input` vs `output`, cobertura de rango mínimo/máximo y número mínimo de canales requeridos).
- `in`: Pertenencia de un valor escalar dentro de un conjunto o compatibilidad de listas.
- `greater_than_or_equal`: Comparación numérica para capacidades y límites operacionales.
- `less_than_or_equal`: Comparación numérica para límites superiores de consumo o tolerancia.
- `contains`: Subcadena o token presente en descripciones técnicas formales.

### C. Justificación de Exclusión de LLMs en el Runtime de Evaluación
Se prohibió taxativamente el uso de modelos de lenguaje (LLMs) dentro del flujo crítico de `/evaluate` por los siguientes motivos arquitectónicos:
1. **Determinismo y Repetibilidad:** En adquisiciones e ingeniería industrial, las especificaciones de compatibilidad deben ser 100% reproducibles, sin variaciones estocásticas ni temperatura.
2. **Latencia y Disponibilidad:** La evaluación puramente matemática y relacional en TypeScript sobre hechos en memoria/PostgreSQL ejecuta en menos de 5 ms, mientras que una inferencia LLM añadiría cientos de milisegundos y puntos únicos de fallo.
3. **Inmunidad a Alucinaciones:** Las decisiones de aceptación o rechazo técnico se fundamentan estrictamente en registros cotejados contra el PDF técnico. Un LLM podría asumir compatibilidad analógica inexistente (ej. asumir erróneamente que una entrada de corriente 4–20 mA puede recibir un sensor RTD Pt100 directamente).

### D. Tratamiento Formal de Contraejemplos y Polaridad
El modelo incorpora el atributo `polarity: boolean` en la tabla `technical_fact`:
- **Hechos Positivos (`polarity: true`):** El dispositivo cuenta fehacientemente con dicha característica técnica (ej. "Entrada RTD Pt100 3 hilos").
- **Hechos Negativos / Contraejemplos (`polarity: false`):** El dispositivo explícitamente NO dispone de dicha capacidad (ej. "SIN transmisor 4–20 mA integrado", "Sin Modbus TCP").
- **Regla de Evaluación:**
  - Si un requerimiento exige una propiedad con `polarity: false` en los hechos del dispositivo, la evaluación retorna `satisfied: false` con la justificación técnica documentada.
  - Si un requerimiento exige una característica positiva y no existe ningún hecho que la sustente (o el hecho indica lo opuesto, como `analog_output` en un PLC que sólo posee entradas), el resultado es deterministamente `satisfied: false`.
  - El resultado global `overall_satisfied` es la conjunción lógica estricta (`AND`) de todas las evaluaciones individuales (`overall_satisfied = requirements.every(r => r.satisfied)`).

---

## 10. Política de Uniformidad de Errores, Trazabilidad e Invariantes HTTP

### A. Estructura Estándar de Respuesta de Error
Todas las respuestas de error emitidas por los endpoints `/api/muse/v1/*` comparten el mismo esquema tipado, facilitando el parsing automático por agentes de IA:

```json
{
  "error": {
    "code": "UNAUTHORIZED | INVALID_REQUEST | INVALID_PARAM | INVALID_VOCABULARY | NOT_FOUND | INTERNAL_SERVER_ERROR",
    "message": "Descripción clara y accionable del motivo del fallo",
    "details": null
  },
  "request_id": "c1f7b82e-9d21-4f32-8411-d102e38c7f99"
}
```

### B. Headers Obligatorios e Invariantes de Seguridad
1. **`X-Request-Id`:**
   - Si el cliente envía `x-request-id`, el backend lo adopta y propaga en los headers y en el payload JSON.
   - Si no se suministra, el backend genera un UUID v4 criptográfico mediante `crypto.randomUUID()`.
2. **`Cache-Control: no-store`:**
   - Inyectado obligatoriamente en todas las respuestas de `/api/muse/v1/evaluate` y `/api/muse/v1/products/search` para evitar que proxies intermedios o cachés HTTP entreguen evaluaciones obsoletas o no deterministas.

### C. Límites Defensivos de Validación (Anti-DoS)
- Parámetro de búsqueda `q`: Longitud máxima de 200 caracteres (rechazo con `400 INVALID_PARAM` si se excede).
- Parámetro de paginación `limit`: Rango estricto entre 1 y 3 (valor por defecto 3; rechazo con `400 INVALID_PARAM` si es `< 1` o `> 3`).
- Arreglo de requerimientos en `evaluate`: Mínimo 1 requerimiento, máximo 10 requerimientos (rechazo con `400 INVALID_REQUEST` si es vacío o excede 10).

---

## 11. Principio de Separación de Concerns y Prohibición de Precios Cacheados (Pure Technical PIM)

### A. Separación entre PIM Técnico y Capa Comercial
La arquitectura de Fase 2 desacopla radicalmente el **PIM Técnico** (compatibilidad, ingeniería de producto, hojas de datos) del **Módulo Transaccional B2B** (precios, stock, crédito, fletes).

### B. Justificación de la Prohibición de Precios en `/api/muse/v1`
1. **Dinamismo de Precios B2B:** Los precios industriales no son fijos de catálogo; dependen de acuerdos marco, volumen de compra escalonado, plazos de entrega, condiciones de pago en PEN y descuentos vigentes. Embeber precios en la API técnica provocaría decisiones erróneas basadas en datos obsoletos (*stale pricing*).
2. **Ciclo de Vida de Decisión del Agente:** El flujo agent-commerce opera en dos fases desacopladas:
   - **Filtro de Compatibilidad Técnica (Fase 2):** El agente valida si el SKU cumple físicamente con el requerimiento de ingeniería.
   - **Negociación y Cotización Comercial (Fase 3):** Una vez preseleccionados los SKUs viables, el agente invoca `/offer` para obtener cotizaciones formales vinculantes con vigencia temporal.
3. **Pureza de Responsabilidad:** Mantener los endpoints técnicos libres de precios garantiza que los perfiles y evaluaciones puedan ser cacheados localmente por la ingeniería del cliente sin riesgo de violaciones de compliance de precios.

---

## 12. Aislamiento de Red, CORS e Higiene de Secretos

### A. Desacoplamiento de Dominios de Producción
Se eliminó cualquier referencia o dependencia hacia dominios productivos (`https://controlnautas.com`). El prototipo de Hackday opera en una topología autosuficiente:
- Host EC2 Elastic IP: `52.20.66.203`
- Backend Medusa v2: `http://localhost:9000` / `http://52.20.66.203:9000`
- Storefront B2B Next.js: `http://localhost:8000` / `http://52.20.66.203:8000`
- Servidor de Assets Demo: `http://localhost:8000/demo/...` (y fallback en puerto 9000)

### B. Configuración de CORS
Se configuró una política restrictiva que permite exclusivamente peticiones originadas desde los entornos locales y la IP elástica de demostración:
- `http://localhost:8000`, `http://127.0.0.1:8000`, `http://52.20.66.203:8000`
- `http://localhost:9000`, `http://127.0.0.1:9000`, `http://52.20.66.203:9000`
Headers permitidos: `Authorization`, `Content-Type`, `X-Request-Id`, `Accept`.

### C. Gestión Segura de Secretos y Redacción de Logs
- Se generó el token `MUSE_API_TOKEN` mediante generador pseudoaleatorio criptográfico (`crypto.randomBytes(32).toString('hex')`).
- El secreto reside exclusivamente en `.env` (ignorado por `.gitignore`).
- Las políticas de logging estructurado JSON aplican filtros de sanitización automática: cualquier aparición de headers de autorización o campos sensibles es anonimizada antes de salir al stream de logs (`[REDACTED]`). En reportes técnicos solo se autoriza la mención truncada de verificación (ej. `mus_...xxxx`).

---

## 13. Helper de Acceso a Base de Datos de Alta Velocidad (`lib/muse/db.ts`)

### A. Conectividad y Pool de Conexiones
- **Librería:** `pg.Pool` nativo (`pg` v8.12+).
- **Configuración de Pool:** 10 conexiones máximas, `idleTimeoutMillis: 30000`, `connectionTimeoutMillis: 5000`.
- **Credenciales:** `process.env.DATABASE_URL` con fallback predeterminado a `postgres://postgres:password@localhost:5432/medusa`.
- **Manejo de Errores y Ciclo de Vida:** Event listener sobre clientes ociosos (`pool.on('error')`) y método `closePool()` para cierre ordenado en pruebas y apagado del servidor.

### B. Optimización de Índices y Latencia
- Se verificó la existencia y operatividad de los índices B-tree parciales:
  - `IDX_technical_profile_variant_id` y `IDX_technical_profile_variant_id_unique` sobre `technical_profile(variant_id) WHERE deleted_at IS NULL`.
  - `IDX_technical_fact_variant_id` y `IDX_technical_fact_variant_property` sobre `technical_fact(variant_id, property) WHERE deleted_at IS NULL`.
- Latencia medida en benchmarks y suite de pruebas: consultas de hechos y perfiles completadas en tiempos sub-milisegundo a escasos milisegundos (~4ms a ~12ms bajo carga de pruebas Jest).

### C. Métodos Exportados
1. **`getTechnicalProfile(variantId: string)`**:
   - Resuelve perfiles técnicos por `variant_id` o `sku`.
   - Recupera datos enriquecidos de producto (título, descripción, handle, SKU, modelo, revisión).
   - Retorna `null` si no existe o si no es de demostración.
2. **`getTechnicalFacts(variantId: string)`**:
   - Recupera hechos técnicos normalizados ordenados ascendentemente por página y propiedad.
   - Preserva `normalized_value_json`, `display_value`, `source_id`, `page`, `section`, `excerpt`, y `polarity`.
3. **`getTechnicalSources(sourceIds: string[])`**:
   - Recupera metadatos documentales de hojas de datos PDF (`url`, `kind`, `revision`, `checksum`, `published_at`).
   - Retorna array vacío inmediatamente si la lista de IDs está vacía.
4. **`searchDemoVariants(q?: string, limit?: number)`**:
   - Búsqueda textual insensible a mayúsculas/minúsculas sobre SKU, modelo, título de producto, descripción o handle.
   - Parámetro `limit` controlado (por defecto 20, máximo 100).
5. **`isDemoVariant(variantId: string)`**:
   - Helper booleano de alta velocidad para validación de precondiciones en guards y rutas HTTP.

### D. Garantía Estricta de Filtrado de Demostración
- **Aislamiento Total:** Todas las consultas SQL filtran explícitamente `tp.demo = true` y `deleted_at IS NULL`.
- **Protección contra Fuga de Catálogo:** Las consultas de hechos técnicos vinculan internamente con `technical_profile`, garantizando que jamás se expongan hechos o registros de variantes fuera del entorno controlado de demostración.


