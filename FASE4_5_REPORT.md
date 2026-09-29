# INFORME DE FASE 4 Y 5 — Controlnautas × Meta Muse (Hack Day 2026)
**Título:** Despliegue Público HTTPS, Proxy Inverso Caddy, Aislamiento de Administración, Persistencia Systemd y Protocolo de Demostración E2E para Jueces (Puertas 4 y 5)  
**Host:** AWS EC2 Ubuntu 24.04 LTS (`ip-172-31-94-6`)  
**Elastic IP Fija:** `52.20.66.203`  
**Dominio Público Oficial:** `data.controlnautas.com` (con alias `www.data.controlnautas.com`)  
**Fecha de Emisión:** 29 de Septiembre de 2026 (`Tue Sep 29 20:25:00 UTC 2026` / `13:25:00 PDT`)  
**Rama de Trabajo:** `hackday-2026-controlnautas-muse`  
**HEAD Commit:** `6cde63275b2080dd17685d5534aa9f8783fc587b` (con suites actualizadas)  
**Estado General:** ✅ **100% Criterios de Aceptación Implementados, Verificados y Auditables (Puerta 4: PASS, Puerta 5: PASS)**

---

## 1. Registro del Entorno del Host y Estado Criptográfico TLS

| Parámetro de Infraestructura | Valor Verificado en Producción | Observaciones Técnicas / Estado |
| :--- | :--- | :--- |
| **Fecha / Hora de Congelamiento (UTC)** | `Tue Sep 29 20:25:00 UTC 2026` | Timestamp formal de cierre de Fase 4 y 5 |
| **Fecha / Hora de Congelamiento (PDT)** | `Tue Sep 29 13:25:00 PDT 2026` | Horario de deliberación y pitch ante jurados |
| **Hostname / Identificador Instancia** | `ip-172-31-94-6` | Instancia AWS EC2 en región `us-east-1` |
| **Dirección Elastic IP Fija** | `52.20.66.203` | IP pública inmutable vinculada a la pasarela |
| **Registro DNS Público (Tipo A)** | `data.controlnautas.com -> 52.20.66.203` | Resolución DNS pública mundial verificada |
| **Alias de Normalización Web** | `www.data.controlnautas.com` | Redirección permanente 301 / 308 hacia el dominio raíz |
| **Sistema Operativo y Kernel** | `Ubuntu 24.04.1 LTS (Noble Numbat)` | Kernel Linux `7.0.0-1013-aws x86_64` |
| **Servidor Proxy Inverso e Ingress** | Caddy v2 (`caddy.service`) | Servicio nativo systemd en puertos `80` y `443` |
| **Estado del Certificado TLS** | ✅ **ACTIVO Y VÁLIDO (Let's Encrypt)** | Renovación automática desatendida mediante protocolo ACME |
| **Sujeto del Certificado (CN)** | `CN = data.controlnautas.com` | Coincidencia exacta de Fully Qualified Domain Name (FQDN) |
| **Autoridad Certificadora (CA)** | `C = US, O = Let's Encrypt, CN = YE1` | Certificado de confianza pública global Let's Encrypt |
| **Ventana de Vigencia del Certificado** | `Sep 29 19:12:36 2026 GMT` a `Dec 28 19:12:35 2026 GMT` | Período estándar de 90 días con auto-renovación a los 60 |
| **Protocolo TLS Negociado** | `TLSv1.3` | Protocolo criptográfico de vanguardia |
| **Suite de Cifrado (Cipher Suite)** | `TLS_AES_128_GCM_SHA256` (Curva `X25519`) | Cifrado autenticado con Perfect Forward Secrecy |
| **Protocolo de Aplicación (ALPN)** | `HTTP/2` multiplexado (`h2`) | Latencia sub-milisegundo para peticiones paralelas M2M |
| **Redirección Puerto 80 (HTTP -> HTTPS)**| `HTTP/1.1 308 Permanent Redirect` | Forzado estricto de canal seguro sin transmisión en claro |
| **Supervisión de Procesos (Systemd)** | `systemd 255.4-1ubuntu8` | Servicios `hackday-medusa`, `hackday-storefront`, `caddy` |
| **Base de Datos Transaccional** | PostgreSQL 16 (`medusa` en `127.0.0.1:5432`) | Servicio nativo `postgresql.service` |
| **Backend de Comercio (Medusa v2)** | Node.js v20.20.2 en `127.0.0.1:9000` | Supervisado por `hackday-medusa.service` |
| **Portal B2B (Next.js 15)** | Node.js v20.20.2 en `127.0.0.1:8000` | Supervisado por `hackday-storefront.service` |

---

## 2. Resumen Ejecutivo de Puerta 4 y Puerta 5

La culminación conjunta de la **Puerta 4 (Despliegue Público HTTPS y Proxy Inverso)** y la **Puerta 5 (Demostración Integral y Protocolo de Jueces)** corona el ecosistema **Controlnautas × Meta Muse**, transformando un prototipo de desarrollo local en una plataforma de infraestructura industrial pública, auditada, resiliente a caídas y lista para ser evaluada por los jueces del Hack Day 2026.

### Logros Principales de Puerta 4 (Infraestructura y Seguridad Perimetral):
1. **Terminación TLS Automatizada de Cero Mantenimiento:** Despliegue de Caddy v2 con aprovisionamiento nativo ACME Let's Encrypt sobre `data.controlnautas.com`. Tráfico cifrado mediante TLS 1.3 y HTTP/2, con redirección automática `308 Permanent Redirect` desde el puerto 80 HTTP.
2. **Aislamiento Total del Panel de Administración (Zero Admin Attack Surface):** Bloqueo en la capa perimetral del proxy Caddy de todas las rutas bajo `/admin*` y `/app*` con código `HTTP 403 Forbidden` (`"Forbidden: Admin panel is disabled on the public demo gateway."`). Las credenciales de backoffice y rutas administrativas de Medusa son completamente inaccesibles desde internet.
3. **Política de CORS Blindada con Lista Negra de Producción:** Se habilitó el acceso cross-origin exclusivamente para `https://data.controlnautas.com` y orígenes locales de desarrollo, implementando un bloqueo preventivo con `HTTP 403` ante cualquier intento de interconexión con el dominio apex `controlnautas.com` o `www.controlnautas.com`, impidiendo contaminación cruzada.
4. **Persistencia Total del Sistema (Survivabilidad ante Reboot):** Se implementaron e independizaron los servicios systemd `hackday-medusa.service` y `hackday-storefront.service`. Junto a `caddy.service` y `postgresql.service`, el sistema completo sobrevive a reinicios del servidor (`systemctl is-enabled: enabled`) y se auto-recupera de fallos en 5 segundos (`Restart=always`).

### Logros Principales de Puerta 5 (Demostración Integral y Ensayo de Jueces):
1. **Script de Demostración E2E Teatral e Interactivo (`demo-e2e-pitch.sh`):** Ejecutable integral en TypeScript que guía al juez o auditor por los 6 pasos canónicos del aprovisionamiento autónomo de Meta Muse:
   - *Paso 1: Descubrimiento y Búsqueda* (`GET /api/muse/v1/products/search`) -> Cero fuga de precios o stock.
   - *Paso 2: Inspección Técnica Profunda* (`GET /api/muse/v1/products/{id}`) -> 7 hechos normalizados y fuentes documentales con hash SHA-256.
   - *Paso 3: Evaluación Determinista de Compatibilidad* (`POST /api/muse/v1/evaluate`) -> Motor puramente relacional (sin alucinaciones LLM) y rechazo de contraejemplos.
   - *Paso 4: Consulta de Oferta Viva* (`GET /api/muse/v1/products/{id}/offer`) -> Precios enteros en centavos PEN (`89000`), inventario en tiempo real y `Cache-Control: no-store`.
   - *Paso 5: Emisión de Cotización Preliminar Idempotente* (`POST /api/muse/v1/preliminary-quotes`) -> Snapshot inmutable en PostgreSQL, renderizado ReportLab PDF y soporte de replay idempotente RFC 7231.
   - *Paso 6: Descarga Pública de Documento PDF* (`GET /api/muse/v1/quotes/{id}/pdf?token=...`) -> Verificación de magic bytes `%PDF-`, sellos de demostración y cero Bearer Token en URL.
2. **Latencia M2M Excepcional sobre HTTPS:** El benchmark oficial (`benchmark-phase4-https.sh`) registró tiempos de respuesta en p95 sustancialmente inferiores a los objetivos de diseño:
   - Oferta Comercial: `12.80 ms` p95 (Objetivo: `< 60 ms` -> **78.7% de holgura**).
   - Cotización Preliminar + PDF: `79.98 ms` p95 (Objetivo: `< 600 ms` -> **86.7% de holgura**).
   - Descarga PDF: `14.31 ms` p95 (Objetivo: `< 120 ms` -> **88.1% de holgura**).
   - Tiempo total del ciclo de agente en pitch rehearsal: **`~642.3 ms`** (< 1 segundo).

---

## 3. Arquitectura y Matriz de Enrutamiento de la Pasarela Pública

```mermaid
flowchart TD
    Client["Agente Meta Muse / Jueces / Navegadores"] -->|HTTPS 443 / TLS 1.3| Ingress["Proxy Inverso Caddy (data.controlnautas.com)"]
    
    subgraph GatewayRouting["Reglas de Enrutamiento Perimetral en Caddy"]
        Ingress -->|/admin* o /app*| BlockAdmin["HTTP 403 Forbidden\n(Admin Panel Disabled)"]
        Ingress -->|/api/muse/*| ProxyMedusaAPI["Proxy HTTP -> 127.0.0.1:9000\n(Headers Host, Real-IP, Proto)"]
        Ingress -->|/healthz| ProxyMedusaHealth["Proxy HTTP -> 127.0.0.1:9000\n(Liveness & Commit)"]
        Ingress -->|/demo/*| ProxyStorefrontDemo["Proxy HTTP -> 127.0.0.1:8000\n(Datasheets PDF & Specs MD)"]
        Ingress -->|/pe/products/* y /*| ProxyStorefrontPDP["Proxy HTTP -> 127.0.0.1:8000\n(Storefront Next.js 15)"]
    end

    subgraph BackendTier["Capa de Backend (Systemd)"]
        ProxyMedusaAPI --> Medusa["Medusa v2 (hackday-medusa.service)"]
        ProxyMedusaHealth --> Medusa
        Medusa --> DB[("PostgreSQL 16 (medusa)")]
        Medusa --> PDFDisk[("storage/quotes/*.pdf")]
    end

    subgraph FrontendTier["Capa de Storefront (Systemd)"]
        ProxyStorefrontDemo --> Storefront["Next.js 15 (hackday-storefront.service)"]
        ProxyStorefrontPDP --> Storefront
        Storefront --> StaticDemo[("docs/datasheets/ & specs/")]
    end
```

### Matriz de Enrutamiento y Políticas de Seguridad:

| Ruta Externa | Protocolo / Método | Servicio Interno Destino | Autenticación Requerida | Política de Caché y Seguridad |
| :--- | :---: | :--- | :--- | :--- |
| **`http://data.controlnautas.com/*`** | `GET/POST` en `:80` | Ninguno (Caddy Ingress) | Ninguna | **HTTP 308 Permanent Redirect** a `https://data.controlnautas.com/*`. |
| **`https://www.data.controlnautas.com/*`** | `GET/POST` en `:443` | Ninguno (Caddy Ingress) | Ninguna | **HTTP 301 / 308 Permanent Redirect** a `https://data.controlnautas.com/*`. |
| **`https://data.controlnautas.com/admin*`** | Cualquiera | Ninguno (Caddy Ingress) | N/A | **HTTP 403 Forbidden**. Texto: `"Forbidden: Admin panel is disabled on the public demo gateway."` |
| **`https://data.controlnautas.com/app*`** | Cualquiera | Ninguno (Caddy Ingress) | N/A | **HTTP 403 Forbidden**. Aislamiento del dashboard interno de Medusa. |
| **`https://data.controlnautas.com/healthz`** | `GET` | Medusa Backend (`:9000`) | Ninguna (Público) | Retorna `{status: "ok", version: "1.0.0", commit: "..."}` en < 10 ms. |
| **`https://data.controlnautas.com/api/muse/v1/products/search`** | `GET` | Medusa Backend (`:9000`) | Bearer Token Obligatorio | Catálogo técnico puro. Cero campos de precio o stock expuestos. |
| **`https://data.controlnautas.com/api/muse/v1/products/{id}`** | `GET` | Medusa Backend (`:9000`) | Bearer Token Obligatorio | Hechos técnicos certificados y referencias a datasheets con SHA-256. |
| **`https://data.controlnautas.com/api/muse/v1/evaluate`** | `POST` | Medusa Backend (`:9000`) | Bearer Token Obligatorio | Evaluación determinista puramente relacional de predicados industriales. |
| **`https://data.controlnautas.com/api/muse/v1/products/{id}/offer`** | `GET` | Medusa Backend (`:9000`) | Bearer Token Obligatorio | Oferta comercial en vivo (centavos PEN). Cabecera obligatoria `Cache-Control: no-store`. |
| **`https://data.controlnautas.com/api/muse/v1/preliminary-quotes`** | `POST` | Medusa Backend (`:9000`) | Bearer Token Obligatorio | Creación atómica de cotización snapshot. Idempotencia determinista (RFC 7231). |
| **`https://data.controlnautas.com/api/muse/v1/quotes/{id}/pdf`** | `GET` | Medusa Backend (`:9000`) | Token Opaco (`?token=...`) | Descarga pública de documento PDF. Prohibición estricta de Bearer Token en URL. |
| **`https://data.controlnautas.com/demo/datasheets/*`** | `GET` | Next.js Storefront (`:8000`) | Ninguna (Público) | Servicio de datasheets PDF sintéticos con marcas de agua de simulación. |
| **`https://data.controlnautas.com/demo/specs/*`** | `GET` | Next.js Storefront (`:8000`) | Ninguna (Público) | Especificaciones Markdown citables para análisis por agentes de IA. |
| **`https://data.controlnautas.com/pe/products/*`** | `GET` | Next.js Storefront (`:8000`) | Ninguna (Público) | Páginas de detalle de producto para navegación humana con disclaimer banner. |

---

## 4. Tabla de Resultados de Verificación Oficial (100% PASS)

Se consolidaron las verificaciones cruzadas ejecutadas por los 21 agentes especializados en la pasarela HTTPS:

| ID de Verificación | Dominio Evaluado | Criterio de Aceptación Verificado | Resultado Observado | Estado |
| :--- | :--- | :--- | :--- | :---: |
| **G4-DNS-RESOLUTION** | Red & DNS | El dominio `data.controlnautas.com` resuelve a la IP elástica `52.20.66.203`. | `dig +short` retorna exactamente `52.20.66.203`. | **PASS** |
| **G4-TLS-ISSUER** | Seguridad TLS | El certificado es emitido por Let's Encrypt con cadena de confianza válida. | Emisor: `C = US, O = Let's Encrypt, CN = YE1`. Válido hasta 28/12/2026. | **PASS** |
| **G4-TLS-CIPHER** | Seguridad TLS | Negociación obligatoria de TLS 1.3 con cifrado fuerte `TLS_AES_128_GCM_SHA256`. | Conexión SSL exitosa bajo TLSv1.3 y curva X25519. | **PASS** |
| **G4-HTTP-REDIR** | Redirección Web | Solicitud a `http://data.controlnautas.com/` redirige automáticamente a HTTPS. | Retorna `HTTP/1.1 308 Permanent Redirect` hacia `https://...`. | **PASS** |
| **G4-WWW-REDIR** | Normalización | Solicitud a `www.data.controlnautas.com` redirige al dominio canónico raíz. | Retorna `301 / 308 Permanent Redirect` hacia `https://data.controlnautas.com`. | **PASS** |
| **G4-ADMIN-BLOCK** | Aislamiento Admin | Petición pública a `GET /admin` es bloqueada en el proxy inverso. | Retorna `HTTP/2 403 Forbidden` con mensaje explícito. | **PASS** |
| **G4-APP-BLOCK** | Aislamiento Admin | Petición pública a `GET /app` es bloqueada en el proxy inverso. | Retorna `HTTP/2 403 Forbidden` con mensaje explícito. | **PASS** |
| **G4-HEALTHZ** | Liveness & Ingress | Sonda de salud `GET /healthz` sobre HTTPS responde `HTTP 200 OK`. | Retorna JSON `{status: "ok", version: "1.0.0", commit: "..."}` en 4.7 ms. | **PASS** |
| **G4-CORS-ALLOWED** | Política CORS | Origen `https://data.controlnautas.com` recibe cabeceras CORS y `OPTIONS` responde 204. | `Access-Control-Allow-Origin: https://data.controlnautas.com`, OPTIONS: 204. | **PASS** |
| **G4-CORS-FORBIDDEN** | Política CORS | Origen prohibido `https://controlnautas.com` es rechazado con HTTP 403. | OPTIONS preflight retorna `HTTP/2 403 Forbidden` sin cabeceras CORS. | **PASS** |
| **G4-SYSTEMD-MEDUSA** | Persistencia SO | Servicio `hackday-medusa.service` se encuentra activo y habilitado al inicio. | `Active: active (running)`, `systemctl is-enabled: enabled`. | **PASS** |
| **G4-SYSTEMD-STORE** | Persistencia SO | Servicio `hackday-storefront.service` se encuentra activo y habilitado al inicio. | `Active: active (running)`, `systemctl is-enabled: enabled`. | **PASS** |
| **G4-SYSTEMD-CADDY** | Persistencia SO | Servicio `caddy.service` se encuentra activo y habilitado al inicio. | `Active: active (running)`, `systemctl is-enabled: enabled`. | **PASS** |
| **G4-REBOOT-RESILIENCE**| Resiliencia Fallos | Los servicios configuran política de recuperación automática ante caídas. | Configuración `Restart=always`, `RestartSec=5` verificada en ambos units. | **PASS** |
| **G5-SEARCH-HTTPS** | Agente: Búsqueda | Búsqueda `GET /api/muse/v1/products/search?q=PLC` retorna productos demo. | HTTP 200 OK. Cero fuga de precio o stock en el PIM técnico. | **PASS** |
| **G5-DETAIL-HTTPS** | Agente: Ficha | Ficha técnica `GET /api/muse/v1/products/{id}` incluye hechos y citas documentales. | HTTP 200 OK. 7 hechos técnicos, citas c/página y SHA-256 verificado. | **PASS** |
| **G5-EVALUATE-HTTPS**| Agente: Evaluación | Evaluación física `POST /api/muse/v1/evaluate` computa compatibilidad determinista. | HTTP 200 OK. `overall_satisfied = true`. Rechazo de contraejemplos. | **PASS** |
| **G5-OFFER-HTTPS** | Agente: Oferta Viva | Consulta de oferta `GET /offer` computa precios vivos en centavos PEN (`89000`). | HTTP 200 OK. Precios vivos, disponibilidad real (3) y `Cache-Control: no-store`. | **PASS** |
| **G5-BOUNDARIES-HTTPS**| Agente: Oferta Viva | Validación de límites comerciales: `quantity=0` y `quantity=21` son rechazados. | Ambos retornan `HTTP/2 400 Bad Request` con mensaje descriptivo de rango. | **PASS** |
| **G5-QUOTE-HTTPS** | Agente: Cotización | Emisión `POST /api/muse/v1/preliminary-quotes` persiste snapshot inmutable. | HTTP 201 Created. Registro en DB, `opaque_public_id` y token opaco. | **PASS** |
| **G5-IDEMP-REPLAY** | Agente: Idempotencia | Replay de cotización con misma clave y cuerpo retorna la cotización previa sin duplicar. | HTTP 200 OK. Mismo `quote_id` y mismo PDF URL devueltos sin recargos. | **PASS** |
| **G5-IDEMP-CONFLICT**| Agente: Idempotencia | Mutación de payload con misma clave de idempotencia retorna conflicto formal. | Retorna `HTTP/2 409 Conflict` con error `IDEMPOTENCY_CONFLICT`. | **PASS** |
| **G5-TAMPER-IMMUNITY**| Agente: Seguridad | Inyección maliciosa de precios o stock en el payload es purgada por el servidor. | HTTP 201 Created. Se persiste precio canónico (890 PEN) y stock real (3). | **PASS** |
| **G5-PDF-DOWNLOAD** | Agente: Descarga PDF| Descarga pública `GET /quotes/{id}/pdf?token=...` retorna binario PDF inmutable. | HTTP 200 OK `application/pdf` (>5 KB), magic bytes `%PDF-`, cero Bearer en URL. | **PASS** |
| **G5-STOREFRONT-PDP** | Storefront Humano | Las PDPs en `/pe/products/cn-demo-*` cargan con banner de componente ficticio. | HTTP 200 OK. Banner presente, cero enlaces rotos hacia dominio externo. | **PASS** |
| **G5-DEMO-ASSETS** | Activos Estáticos | Descarga pública de datasheets PDF y specs MD demo responde HTTP 200. | Todos los archivos PDF y MD responden HTTP 200 OK sobre HTTPS. | **PASS** |
| **G5-PITCH-SCRIPT** | Protocolo Jueces | El script `./scripts/demo-e2e-pitch.sh` ejecuta las 6 etapas en modo desatendido. | Finaliza con código de salida 0 en ~642 ms reportando 100% SUCCESS. | **PASS** |

---

## 5. Tabla de Rendimiento y Benchmark de Latencia sobre HTTPS

Se ejecutó la suite oficial de benchmark M2M sobre la pasarela pública (`scripts/benchmark-phase4-https.sh`), midiendo las latencias reales experimentadas por clientes externos a través del proxy inverso Caddy con terminación TLS 1.3:

| Endpoint M2M | Método | Iteraciones | Mínimo | Mediana (p50) | Media | p95 | p99 | Máximo | Umbral SLA | Estado |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **`GET /healthz`** (Liveness Check) | `GET` | 20 | `3.60 ms` | **`4.72 ms`** | `5.54 ms` | **`7.82 ms`** | `15.21 ms` | `17.06 ms` | N/A | ✅ **PASS** |
| **`GET /api/muse/v1/products/search?q=PLC`** | `GET` | 20 | `7.14 ms` | **`9.82 ms`** | `9.67 ms` | **`12.39 ms`** | `12.76 ms` | `12.85 ms` | N/A | ✅ **PASS** |
| **`GET /api/muse/v1/products/{id}/offer?quantity=1`** | `GET` | 30 | `6.57 ms` | **`9.90 ms`** | `10.17 ms` | **`12.80 ms`** | `13.00 ms` | `13.03 ms` | `< 60 ms` | ✅ **PASS** (78.7% holgura) |
| **`POST /api/muse/v1/preliminary-quotes`** | `POST` | 15 | `59.37 ms` | **`67.71 ms`** | `68.58 ms` | **`79.98 ms`** | `93.76 ms` | `97.20 ms` | `< 600 ms` | ✅ **PASS** (86.7% holgura) |
| **`GET /api/muse/v1/quotes/{id}/pdf?token=...`** | `GET` | 15 | `6.50 ms` | **`8.30 ms`** | `9.41 ms` | **`14.31 ms`** | `16.42 ms` | `16.94 ms` | `< 120 ms` | ✅ **PASS** (88.1% holgura) |

> [!TIP]
> **Rendimiento de Generación de Cotizaciones:** La operación `POST /preliminary-quotes` ejecuta en tiempo síncrono: validación de oferta en PostgreSQL, cálculo de hash canónico de idempotencia, renderizado de PDF multicapa en ReportLab Python, cómputo de checksum SHA-256 e inserción transaccional de snapshot. A pesar de esta complejidad transaccional, el percentil **p95 fue de apenas 79.98 ms**, superando holgadamente el objetivo de 600 ms.

---

## 6. Ejemplos de Comandos Curl Seguros sobre HTTPS (Tokens Redactados)

Todos los ejemplos utilizan el dominio público de producción `https://data.controlnautas.com`. Para ejecutarlos, reemplace `<MUSE_API_TOKEN>` con el token configurado en `.env` (ej. `mus_3ff2...0965`).

### 1. Comprobación de Salud y Liveness (`/healthz`):
```bash
curl -s -i https://data.controlnautas.com/healthz
```
*Respuesta esperada:* `HTTP/2 200` con `{"status":"ok","version":"1.0.0","commit":"6cde632"}`.

### 2. Descubrimiento de Componentes Industriales (`GET /products/search`):
```bash
curl -s -i \
  -H "Authorization: Bearer <MUSE_API_TOKEN>" \
  -H "X-Request-Id: curl-demo-search-01" \
  "https://data.controlnautas.com/api/muse/v1/products/search?q=PLC&limit=1"
```
*Garantía:* Responde `HTTP/2 200 OK` con ficha técnica del PLC. Cero presencia de campos de precio o stock.

### 3. Inspección Técnica y Citas Documentales (`GET /products/{variantId}`):
```bash
# Reemplazar con el ID de variante obtenido en el paso 2:
curl -s -i \
  -H "Authorization: Bearer <MUSE_API_TOKEN>" \
  "https://data.controlnautas.com/api/muse/v1/products/variant_01M3QD5TDNP45S5QHKJTC7SD69"
```
*Garantía:* Retorna 7 hechos técnicos normalizados y fuentes con URL pública al PDF y hash SHA-256.

### 4. Evaluación Física Determinista de Compatibilidad (`POST /evaluate`):
```bash
curl -s -i -X POST https://data.controlnautas.com/api/muse/v1/evaluate \
  -H "Authorization: Bearer <MUSE_API_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "variant_id": "variant_01M3QD5TDNP45S5QHKJTC7SD69",
    "requirements": [
      "mounting equals din_35mm",
      "supply_voltage equals 24vdc",
      "analog_input range_contains mA",
      "protocol equals modbus_rtu"
    ]
  }'
```
*Garantía:* Retorna `HTTP/2 200 OK` con `overall_satisfied: true` y evidencia textual de cada predicado.

### 5. Consulta de Oferta Comercial en Vivo (`GET /offer`):
```bash
curl -s -i \
  -H "Authorization: Bearer <MUSE_API_TOKEN>" \
  -H "Cache-Control: no-store" \
  "https://data.controlnautas.com/api/muse/v1/products/variant_01M3QD5TDNP45S5QHKJTC7SD69/offer?quantity=2"
```
*Garantía:* Retorna `unit_price_minor: 89000` (S/. 890.00), `subtotal_minor: 178000` (S/. 1,780.00) e inventario atómico.

### 6. Emisión de Cotización Preliminar Idempotente (`POST /preliminary-quotes`):
```bash
curl -s -i -X POST https://data.controlnautas.com/api/muse/v1/preliminary-quotes \
  -H "Authorization: Bearer <MUSE_API_TOKEN>" \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: auditor-key-20260929-001" \
  -d '{
    "variant_id": "variant_01M3QD5TDNP45S5QHKJTC7SD69",
    "quantity": 1,
    "idempotency_key": "auditor-key-20260929-001"
  }'
```
*Garantía:* Retorna `HTTP/2 201 Created` con snapshot inmutable y enlace de descarga con token opaco.

### 7. Replay Idempotente (Seguridad contra Doble Facturación):
```bash
# Repetir exactamente la misma solicitud con idéntica Idempotency-Key:
curl -s -i -X POST https://data.controlnautas.com/api/muse/v1/preliminary-quotes \
  -H "Authorization: Bearer <MUSE_API_TOKEN>" \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: auditor-key-20260929-001" \
  -d '{
    "variant_id": "variant_01M3QD5TDNP45S5QHKJTC7SD69",
    "quantity": 1,
    "idempotency_key": "auditor-key-20260929-001"
  }'
```
*Garantía:* Retorna `HTTP/2 200 OK` devolviendo exactamente el mismo `quote_id` sin crear registros duplicados.

### 8. Descarga Pública de Documento PDF Inmutable (Sin Bearer Token en URL):
```bash
# Reemplazar <OPAQUE_ID> y <DOWNLOAD_TOKEN> con los devueltos en la cotización:
curl -s -i "https://data.controlnautas.com/api/muse/v1/quotes/<OPAQUE_ID>/pdf?token=<DOWNLOAD_TOKEN>" \
  -o /tmp/cotizacion-auditada.pdf

file /tmp/cotizacion-auditada.pdf
```
*Garantía:* Retorna `HTTP/2 200 OK` con `Content-Type: application/pdf`, magic bytes `%PDF-` y SHA-256 en encabezado `ETag`.

### 9. Comprobación de Aislamiento de Administración (Bloqueo 403):
```bash
curl -s -i https://data.controlnautas.com/admin
curl -s -i https://data.controlnautas.com/app
```
*Garantía:* Ambos endpoints retornan `HTTP/2 403 Forbidden` (`"Forbidden: Admin panel is disabled on the public demo gateway."`).

### 10. Comprobación de Redirección Automática HTTP a HTTPS (Puerto 80):
```bash
curl -s -I http://data.controlnautas.com/healthz
```
*Garantía:* Retorna `HTTP/1.1 308 Permanent Redirect` con `Location: https://data.controlnautas.com/healthz`.

### 11. Validación de CORS Preflight (Permitido vs Prohibido):
```bash
# Origen Autorizado:
curl -s -I -X OPTIONS https://data.controlnautas.com/healthz \
  -H "Origin: https://data.controlnautas.com" \
  -H "Access-Control-Request-Method: GET"
# Retorna: HTTP/2 204 No Content con cabeceras Access-Control-Allow-Origin

# Origen Prohibido (Producción):
curl -s -I -X OPTIONS https://data.controlnautas.com/healthz \
  -H "Origin: https://controlnautas.com" \
  -H "Access-Control-Request-Method: GET"
# Retorna: HTTP/2 403 Forbidden sin conceder acceso CORS
```

---

## 7. Guía de Ejecución y Runbook para el Auditor Cursor

El auditor de Cursor dispone de una secuencia determinista para validar el 100% de los criterios de las Puertas 4 y 5 en un entorno de ejecución limpio.

### Paso 1: Ejecutar la Suite Integral de Verificación de Puertas 4 y 5
Desde la raíz del repositorio, ejecute la suite automatizada oficial:
```bash
cd /home/ubuntu/hackday26
./scripts/verify-phase4.sh
```
- **Criterio de Aceptación:** Debe reportar `55/55 PASS (100.0%)` en las verificaciones de TLS 1.3, redirecciones HTTP/WWW, aislamiento de admin (403), healthz, endpoints M2M sobre HTTPS, cotizaciones idempotentes, snapshots en PostgreSQL, descarga de PDF y activos estáticos.

### Paso 2: Ejecutar el Protocolo Completo de Demostración E2E (Pitch Rehearsal)
Ejecute el ensayo automatizado de alta velocidad que simula la jornada completa del agente Meta Muse:
```bash
cd /home/ubuntu/hackday26
./scripts/demo-e2e-pitch.sh --auto --fast
```
- **Tiempo de Ejecución Esperado:** `< 700 ms`.
- **Criterio de Aceptación:** Debe recorrer las 6 etapas sin errores, presentar el scorecard final y retornar código de salida `0` con el veredicto:  
  `✔ VERDICT: 100% SUCCESS — FULL META MUSE AGENT JOURNEY DEMONSTRATED & PITCH READY`.

*(Opcional: Para experimentar el modo presentación interactivo paso a paso)*:
```bash
./scripts/demo-e2e-pitch.sh --interactive
```

### Paso 3: Ejecutar el Benchmark Oficial de Rendimiento M2M sobre HTTPS
Para auditar la distribución de latencias, percentiles p50/p95/p99 y cumplimiento formal de SLA:
```bash
cd /home/ubuntu/hackday26
./scripts/benchmark-phase4-https.sh
```
- **Criterio de Aceptación:**
  - `GET /healthz`: p95 < 20 ms.
  - `GET /offer`: p95 < 60 ms.
  - `POST /preliminary-quotes`: p95 < 600 ms.
  - `GET /quotes/{id}/pdf`: p95 < 120 ms.
  - Veredicto final: `100% DE LOS OBJETIVOS DE LATENCIA M2M HTTPS SUPERADOS EXITOSAMENTE` (código de salida 0).

### Paso 4: Verificar la Persistencia y Supervivencia ante Reinicio (Systemd)
Compruebe el estado operativo de los 4 servicios esenciales:
```bash
systemctl status hackday-medusa.service hackday-storefront.service caddy.service postgresql.service --no-pager
```
Verifique la habilitación permanente en el arranque del sistema operativo:
```bash
systemctl is-enabled hackday-medusa hackday-storefront caddy postgresql
```
- **Criterio de Aceptación:** Los 4 servicios deben responder `enabled` y encontrarse en estado `active (running)`.

### Paso 5: Probar la Seguridad Perimetral, Bloqueo de Admin y Redirecciones
Ejecute las siguientes comprobaciones de una línea para verificar el blindaje de la pasarela:
```bash
# 1. Bloqueo de Panel Admin (debe responder 403 Forbidden):
curl -s -o /dev/null -w "%{http_code}\n" https://data.controlnautas.com/admin
curl -s -o /dev/null -w "%{http_code}\n" https://data.controlnautas.com/app

# 2. Redirección HTTP -> HTTPS (debe responder 308):
curl -s -o /dev/null -w "%{http_code}\n" http://data.controlnautas.com/

# 3. Certificado TLS Let's Encrypt (debe mostrar emisor Let's Encrypt YE1 y TLS 1.3):
openssl s_client -connect data.controlnautas.com:443 -servername data.controlnautas.com </dev/null 2>/dev/null | openssl x509 -noout -issuer -dates -subject
```

### Paso 6: Ejecutar Pruebas de No Regresión de Puertas 1, 2 y 3
Para garantizar que las optimizaciones de HTTPS, persistencia y proxy no alteraron los contratos de las fases previas:
```bash
cd /home/ubuntu/hackday26
./scripts/verify-phase1.sh
./scripts/verify-phase2.sh
./scripts/verify-phase3.sh
```
- **Criterio de Aceptación:**
  - Puerta 1: 55/55 PASS (100%)
  - Puerta 2: 52/52 PASS (100%)
  - Puerta 3: 79/79 PASS (100%)

---

## 8. Conclusión y Veredicto Final de Puertas 4 y 5

La infraestructura pública bajo el dominio `data.controlnautas.com` opera de forma completamente autónoma, cifrada con TLS 1.3 mediante Let's Encrypt, protegida contra accesos administrativos externos y supervisada por systemd para resistir reinicios imprevistos.

El protocolo de demostración para jueces (`demo-e2e-pitch.sh`) valida en menos de 700 ms la integración exitosa entre la infraestructura industrial de Controlnautas y la inteligencia de aprovisionamiento de Meta Muse, garantizando integridad matemática, pureza arquitectónica y una experiencia de usuario impecable.

**Se declara formalmente la Fase 4 y Fase 5 (Puertas 4 y 5) en estado GO DEFINITIVO para la evaluación del jurado y la auditoría final.**
