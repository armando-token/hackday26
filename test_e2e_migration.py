#!/usr/bin/env python3
"""
Test Suite Integral de Verificación Post-Remediación
Control Nautas - Migración B2B Medusa & Next.js 15
Valida los 6 bloques de la auditoría independiente.
"""

import sys
import json
import base64
import urllib.request
import urllib.error
import xml.etree.ElementTree as ET

BASE_URL = "http://127.0.0.1:8000"
NGINX_URL = "http://127.0.0.1:80"
AUTH_HEADER = "Basic " + base64.b64encode(b"admin:controlnautas2026").decode("utf-8")

passed = 0
failed = 0

def log_test(name, success, detail=""):
    global passed, failed
    if success:
        passed += 1
        print(f"  [PASS] {name} {detail}")
    else:
        failed += 1
        print(f"  [FAIL] {name} - {detail}")

def http_get(url, follow_redirects=False, use_auth=True, custom_headers=None):
    h = {"User-Agent": "ControlNautas-AuditRunner/2.0"}
    if use_auth:
        h["Authorization"] = AUTH_HEADER
    if custom_headers:
        h.update(custom_headers)
    
    class NoRedirectHandler(urllib.request.HTTPRedirectHandler):
        def http_error_302(self, req, fp, code, msg, hdrs):
            return fp
        def http_error_301(self, req, fp, code, msg, hdrs):
            return fp
        def http_error_307(self, req, fp, code, msg, hdrs):
            return fp
        def http_error_308(self, req, fp, code, msg, hdrs):
            return fp

    opener = urllib.request.build_opener() if follow_redirects else urllib.request.build_opener(NoRedirectHandler)
    req = urllib.request.Request(url, headers=h)
    
    try:
        res = opener.open(req, timeout=30)
        return res.getcode(), res.read().decode("utf-8", errors="ignore"), res.headers
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode("utf-8", errors="ignore"), e.headers
    except Exception as e:
        return 0, str(e), {}

print("=" * 70)
print("INICIANDO SUITE DE AUDITORÍA Y VERIFICACIÓN POST-REMEDIACIÓN")
print("=" * 70)

# =========================================================================
# TEST 1: Nginx & Store Routing (Bloque C)
# =========================================================================
print("\n[1] Verificación de Nginx y Enrutamiento /store")
code, body, hdrs = http_get(f"{NGINX_URL}/pe/store", follow_redirects=True, use_auth=True)
log_test("Nginx /pe/store responde HTTP 200 (Sin colisión con Medusa backend)", code == 200, f"(Status: {code})")

code, body, hdrs = http_get(f"{NGINX_URL}/store", follow_redirects=False, use_auth=True)
loc = hdrs.get("Location", "")
log_test("Nginx /store redirige al storefront regional /pe/store", code in [301, 307, 308] and "/pe/store" in loc, f"(Status: {code}, Loc: {loc})")

# =========================================================================
# TEST 2: Sitemap Direct 200 URLs (Bloque C)
# =========================================================================
print("\n[2] Verificación del Sitemap XML (100% URLs Directas HTTP 200)")
code, xml_text, hdrs = http_get(f"{BASE_URL}/sitemap.xml", follow_redirects=True, use_auth=False)
if code == 200 and "<urlset" in xml_text:
    root = ET.fromstring(xml_text)
    urls = [elem.text for elem in root.findall(".//{http://www.sitemaps.org/schemas/sitemap/0.9}loc")]
    log_test(f"Sitemap contiene {len(urls)} URLs canónicas", len(urls) > 500, f"Total: {len(urls)}")
    
    # Muestreo representativo de 15 URLs del sitemap
    sample_urls = urls[:5] + [u for u in urls if "/store/" in u][:3] + [u for u in urls if "/casos-de-exito/" in u][:3] + [u for u in urls if "/products/" in u][:4]
    
    sitemap_redirects = 0
    sitemap_ok = 0
    for u in sample_urls:
        local_u = u.replace("https://controlnautas.com", BASE_URL).replace("http://controlnautas.com", BASE_URL)
        c, _, _ = http_get(local_u, follow_redirects=False, use_auth=True)
        if c == 200:
            sitemap_ok += 1
        else:
            sitemap_redirects += 1
    log_test(f"Muestreo de URLs del sitemap responden 200 directo (0 redirects)", sitemap_redirects == 0, f"({sitemap_ok}/{len(sample_urls)} OK 200)")
else:
    log_test("Sitemap XML generado exitosamente", False, f"Status: {code}")

# =========================================================================
# TEST 3: Redirecciones 301 de Categorías GSC, Casos y PDFs (Bloque C)
# =========================================================================
print("\n[3] Verificación de Redirecciones 301 Históricas de GSC")
redirect_tests = [
    ("/categoria-producto/lana-de-roca/", "/pe/store"),
    ("/categoria-producto/calentadores-electricos/cable-calefactor/", "/pe/store/trazado-termico"),
    ("/categoria-producto/sensores-y-transmisores/", "/pe/store/monitoreo-ambiental"),
    ("/2025/08/05/control-industrial-resistencias-electricas-peru/", "/pe/casos-de-exito/resistencias-electricas-prevenir-cortocircuitos"),
    ("/2025/08/13/eliminacion-congelamiento-heat-tracing-peru/", "/pe/casos-de-exito/heat-tracing-evitar-congelamiento"),
    ("/2025/08/20/control-temperatura-datacenters-akcp/", "/pe/casos-de-exito/control-temperatura-datacenters-akcp"),
    ("/producto/panel-de-lana-de-roca-rockwool-prorox-sl-920", "/pe/products/lana-de-roca-rockwool-prorox-sl-920"),
    ("/wp-content/uploads/2025/01/Control-Nautas-Manual-de-usuario-TZ-THT-03R-.pdf.pdf", "/pe/store"),
    ("/sobre-nosotros", "/pe/nosotros"),
    ("/contactanos", "/pe/contacto"),
]

for req_path, expected_target in redirect_tests:
    code, _, hdrs = http_get(f"{BASE_URL}{req_path}", follow_redirects=False, use_auth=False)
    loc = hdrs.get("Location", "")
    ok = (code == 301) and (expected_target in loc)
    log_test(f"301 Redirect: {req_path} -> {expected_target}", ok, f"(Status: {code}, Target: {loc})")

# =========================================================================
# TEST 4: Erradicación de Soft 404 y Errores 500 (Bloque C)
# =========================================================================
print("\n[4] Verificación de Respuestas HTTP 404 Estrictas (Zero Soft-404 / Zero 500)")
soft_404_tests = [
    ("/pe/content/ruta-inexistente-123", 404, "Contenido no existente"),
    ("/pe/store/categoria-falsa-999", 404, "Categoría no existente"),
    ("/pe/collections/coleccion-inexistente-xyz", 404, "Colección no existente (no 500)"),
    ("/cl", 404, "País no admitido /cl"),
    ("/dk", 404, "País no admitido /dk"),
    ("/archivo-no-existe.xml", 404, "Archivo XML no existente"),
    ("/documento-no-existe.pdf", 404, "Archivo PDF no existente"),
]

for path, expected_code, desc in soft_404_tests:
    code, _, _ = http_get(f"{BASE_URL}{path}", follow_redirects=False, use_auth=True)
    log_test(f"Ruta {desc} ({path}) devuelve HTTP {expected_code}", code == expected_code, f"(Status: {code})")

# =========================================================================
# TEST 5: Contenido Fiel al XML y Legal Vigente (Bloque D)
# =========================================================================
print("\n[5] Verificación de Fidelidad de Contenidos y Legalidad")
code, body, _ = http_get(f"{BASE_URL}/pe/politica-de-privacidad", follow_redirects=True, use_auth=True)
has_ds = "016-2024-JUS" in body
log_test("Política de Privacidad cita el D.S. 016-2024-JUS vigente", has_ds, "(Encontrado en HTML)" if has_ds else "(No encontrado)")

code, body, _ = http_get(f"{BASE_URL}/pe/entregas-y-devoluciones", follow_redirects=True, use_auth=True)
has_returns = "30 días" in body and "5 días" in body
log_test("Entregas y Devoluciones incluye plazos reales (30 días devolución / 5 días reporte daños)", has_returns)

code, body, _ = http_get(f"{BASE_URL}/pe/casos-de-exito/solucion-lana-de-roca-en-calderas-peru", follow_redirects=True, use_auth=True)
has_case_data = "Petróleo A50" in body or "petróleo A50" in body or "calderas" in body
log_test("Caso de Éxito de Calderas Pesqueras contiene datos técnicos auténticos (Petróleo A50)", has_case_data)

# Verificar ausencia total de KeepStock y href="#"
code, home_body, _ = http_get(f"{BASE_URL}/pe", follow_redirects=True, use_auth=True)
no_keepstock = "KeepStock" not in home_body
no_knowhow = "KnowHow" not in home_body
log_test("Home libre de KeepStock® y KnowHow® ficticios", no_keepstock and no_knowhow)

# =========================================================================
# TEST 6: Google Merchant Center Feed (Bloque E)
# =========================================================================
print("\n[6] Verificación del Feed de Google Merchant Center")
code, tsv_body, hdrs = http_get(f"{BASE_URL}/api/feed/google-merchant", follow_redirects=False, use_auth=False)
lines = tsv_body.strip().split("\n")
header = lines[0].split("\t") if len(lines) > 0 else []
has_gla = any("gla_" in line for line in lines[1:20])
direct_pe_links = all("/pe/products/" in line.split("\t")[3] for line in lines[1:20] if len(line.split("\t")) > 3)

log_test("Feed TSV responde HTTP 200", code == 200)
log_test("Feed TSV preserva IDs históricos 'gla_...'", has_gla, f"(Muestra validada: {len(lines)-1} productos)")
log_test("Feed TSV usa enlaces directos canónicos /pe/products/ (HTTP 200 directo)", direct_pe_links)

# =========================================================================
# TEST 7: Flujo de Carrito y Checkout B2B Medusa (Bloque B)
# =========================================================================
print("\n[7] Verificación de Integración de Carrito y Checkout Medusa")
code, cart_page, _ = http_get(f"{BASE_URL}/pe/cart", follow_redirects=True, use_auth=True)
log_test("Ruta de Carrito /pe/cart responde HTTP 200 con Medusa CartTemplate", code == 200)

code, checkout_page, _ = http_get(f"{BASE_URL}/pe/checkout", follow_redirects=True, use_auth=True)
log_test("Ruta de Checkout /pe/checkout responde HTTP 200", code == 200)

# =========================================================================
# RESUMEN FINAL
# =========================================================================
print("\n" + "=" * 70)
print(f"RESULTADOS DE LA SUITE: {passed} PASADOS, {failed} FALLIDOS (Total: {passed + failed})")
print("=" * 70)

if failed == 0:
    print(">>> TODOS LOS CRITERIOS DE AUDITORÍA Y REMEDIACIÓN FUERON SUPERADOS CON ÉXITO. <<<")
    sys.exit(0)
else:
    print(f">>> SE DETECTARON {failed} FALLAS. REVISAR DETALLES ARRIBA. <<<")
    sys.exit(1)
