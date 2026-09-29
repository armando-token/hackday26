#!/usr/bin/env python3
"""
Suite de Validación y Auditoría Exhaustiva de Migración — Control Nautas B2B
Verifica los 12 bloques técnicos del plan maestro (AUDITORIA_TOTAL_MIGRACION_LEGACY_CONTROL_NAUTAS_2026-08-16.md)
"""

import urllib.request
import urllib.error
import base64
import json
import subprocess
import sys
import xml.etree.ElementTree as ET

BASE_URL = "http://127.0.0.1:8000"
AUTH_USER = "admin"
AUTH_PASS = "controlnautas2026"

def get_auth_headers():
    token = base64.b64encode(f"{AUTH_USER}:{AUTH_PASS}".encode()).decode()
    return {"Authorization": f"Basic {token}"}

def http_get(path, follow_redirects=False):
    url = f"{BASE_URL}{path}"
    req = urllib.request.Request(url, headers=get_auth_headers())
    
    class NoRedirectHandler(urllib.request.HTTPRedirectHandler):
        def http_error_302(self, req, fp, code, msg, headers):
            return fp
        http_error_301 = http_error_302
        http_error_307 = http_error_302
        http_error_308 = http_error_302

    opener = urllib.request.build_opener(NoRedirectHandler) if not follow_redirects else urllib.request.build_opener()
    try:
        res = opener.open(req, timeout=10)
        return res.getcode(), res.read().decode('utf-8', errors='ignore'), res.headers
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode('utf-8', errors='ignore') if e.fp else "", e.headers
    except Exception as e:
        return 0, str(e), {}

results = []

def test(name, passed, detail=""):
    results.append((name, passed, detail))
    status = "✅ PASS" if passed else "❌ FAIL"
    print(f"{status} | {name} {f'({detail})' if detail else ''}")

print("==================================================================")
print("🚀 INICIANDO AUDITORÍA INTEGRAL DE MIGRACIÓN — CONTROL NAUTAS")
print("==================================================================\n")

# 1. Rutas Institucionales y Corporativas
print("--- [1] PÁGINAS INSTITUCIONALES Y CASOS DE ÉXITO ---")
routes = [
    ("/pe/nosotros", 200, "Sobre Nosotros"),
    ("/pe/contact", 200, "Contacto Oficial"),
    ("/pe/entregas-y-devoluciones", 200, "Entregas y Devoluciones"),
    ("/pe/terminos-y-condiciones", 200, "Términos y Condiciones"),
    ("/pe/politica-de-privacidad", 200, "Política de Privacidad"),
    ("/pe/casos-de-exito", 200, "Casos de Éxito Index"),
    ("/pe/casos-de-exito/resistencias-electricas-prevenir-cortocircuitos", 200, "Caso Resistencias"),
    ("/pe/casos-de-exito/heat-tracing-evitar-congelamiento", 200, "Caso Heat Tracing Minería"),
    ("/pe/casos-de-exito/control-temperatura-datacenters-akcp", 200, "Caso AKCP Datacenter"),
    ("/pe/casos-de-exito/solucion-lana-de-roca-en-calderas-peru", 200, "Caso Lana de Roca Calderas"),
    ("/pe/casos-de-exito/prevencion-avanzada-congelamiento-heat-tracing", 200, "Caso Fluidos Viscosos"),
]

for path, expected_code, desc in routes:
    code, body, _ = http_get(path)
    test(f"Ruta {path} ({desc})", code == expected_code, f"Status HTTP: {code}")

# 2. Catálogo y Productos Canónicos
print("\n--- [2] CATÁLOGO Y FICHA DE PRODUCTO (PDP) ---")
catalog_routes = [
    ("/pe/store", 200, "Catálogo General"),
    ("/pe/store/calefaccion-electrica", 200, "Familia L1 Calefacción"),
    ("/pe/products/lana-de-roca-rockwool-prorox-sl-920", 200, "PDP Lana de Roca"),
    ("/pe/products/controlador-novus-n323-pt100-rs485", 200, "PDP Novus N323"),
]

for path, expected_code, desc in catalog_routes:
    code, body, _ = http_get(path)
    has_wa = "wa.me/51950302141" in body or "whatsapp_product_click" in body
    has_schema = "application/ld+json" in body if "products" in path else True
    test(f"Catálogo {path} ({desc})", code == expected_code and has_wa and has_schema, f"Status: {code}, WhatsApp CTA: {has_wa}, Schema: {has_schema}")

# 3. Dynamic Sitemap XML y Robots.txt
print("\n--- [3] SITEMAP XML Y ROBOTS.TXT ---")
s_code, s_body, s_headers = http_get("/sitemap.xml")
is_valid_xml = False
url_count = 0
if s_code == 200 and "urlset" in s_body:
    try:
        root = ET.fromstring(s_body)
        url_count = len(root.findall('{http://www.sitemaps.org/schemas/sitemap/0.9}url'))
        is_valid_xml = url_count > 500
    except Exception as e:
        is_valid_xml = False

test("Sitemap XML Dinámico", is_valid_xml, f"URLs indexables generadas: {url_count}")

r_code, r_body, _ = http_get("/robots.txt")
has_sitemap_link = "sitemap.xml" in r_body
test("Robots.txt con enlace al Sitemap", r_code == 200 and has_sitemap_link, f"Status: {r_code}")

# 4. Google Merchant Center Feed
print("\n--- [4] GOOGLE MERCHANT CENTER TSV FEED ---")
m_code, m_body, _ = http_get("/api/feed/google-merchant")
tsv_lines = m_body.strip().split("\n")
header_line = tsv_lines[0] if tsv_lines else ""
has_required_headers = all(h in header_line for h in ["id", "title", "price", "availability", "brand", "mpn", "shipping"])
product_feed_count = len(tsv_lines) - 1 if len(tsv_lines) > 1 else 0

test("Feed TSV Google Merchant", m_code == 200 and has_required_headers and product_feed_count > 100, f"Productos elegibles con precio PEN en feed: {product_feed_count}")

# 5. Redirecciones SEO Legadas (301 Permanent)
print("\n--- [5] REDIRECCIONES SEO LEGADAS (301) ---")
redirect_tests = [
    ("/panel-de-lana-de-roca-rockwool-prorox-sl-920", "/pe/products/lana-de-roca-rockwool-prorox-sl-920"),
    ("/producto/panel-de-lana-de-roca-rockwool-prorox-sl-920", "/pe/products/lana-de-roca-rockwool-prorox-sl-920"),
    ("/control-industrial-resistencias-electricas-peru", "/pe/casos-de-exito/resistencias-electricas-prevenir-cortocircuitos"),
    ("/sobre-nosotros", "/pe/nosotros"),
]

for legacy_path, target_expected in redirect_tests:
    code, _, headers = http_get(legacy_path, follow_redirects=False)
    loc = headers.get("Location", "")
    test(f"Redirect 301 {legacy_path}", code == 301 and target_expected in loc, f"Status: {code}, Destino: {loc}")

# 6. Blindaje contra Falsos 200 y URLs Duplicadas
print("\n--- [6] BLINDAJE 404 Y ROUTING DETERMINISTA ---")
test_404_paths = ["/pepe", "/hope", "/super", "/peru"]
for p in test_404_paths:
    code, _, _ = http_get(p)
    test(f"Bloqueo ruta falsa {p}", code == 404, f"HTTP Status devuelto: {code}")

# 7. Auditoría de Cero Datos Ficticios (Grep Check)
print("\n--- [7] AUDITORÍA DE DATOS FICTICIOS (0 OCURRENCIAS) ---")
fake_patterns = ["800-NAUTAS", "456-7890", "987 654 321", "Av. Industrial 1234", "20601234567"]
for pat in fake_patterns:
    res = subprocess.run(["grep", "-rnI", pat, "/home/ubuntu/CN_Web/b2b-storefront/src/"], stdout=subprocess.PIPE, text=True)
    matches = res.stdout.strip()
    test(f"Cero ocurrencias de '{pat}'", len(matches) == 0, f"Ocurrencias encontradas: {len(matches.splitlines()) if matches else 0}")

# 8. Verificación de Integridad en Medusa PostgreSQL
print("\n--- [8] BASE DE DATOS MEDUSA POSTGRESQL (PERÚ COMMERCE) ---")
def run_sql(query):
    cmd = ["docker", "exec", "medusa-db", "psql", "-U", "postgres", "-d", "medusa", "-t", "-A", "-c", query]
    res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    return res.stdout.strip()

reg_pen = run_sql("SELECT count(*) FROM region WHERE currency_code = 'pen' AND name = 'Perú'")
test("Región Perú (PEN) activa", reg_pen == "1", f"Regiones Perú: {reg_pen}")

payment_link = run_sql("SELECT count(*) FROM region_payment_provider WHERE payment_provider_id = 'pp_system_default'")
test("Proveedor de pago manual vinculado a región", payment_link == "1", f"Vínculos activos: {payment_link}")

shipping_pen = run_sql("SELECT count(*) FROM price WHERE currency_code = 'pen' AND id LIKE 'price_shipping_%'")
test("Opciones de envío con precio en PEN", int(shipping_pen or "0") >= 2, f"Precios de envío PEN: {shipping_pen}")

products_count = run_sql("SELECT count(*) FROM product")
test("Catálogo Maestro de Productos", int(products_count or "0") >= 520, f"Total productos en BD: {products_count}")

# 9. Resumen Final
print("\n==================================================================")
passed_count = sum(1 for _, p, _ in results if p)
total_count = len(results)
print(f"📊 RESUMEN FINAL: {passed_count}/{total_count} PRUEBAS EXITOSAS ({passed_count/total_count*100:.1f}%)")
print("==================================================================")

if passed_count == total_count:
    print("🎉 TODAS LAS VALIDACIONES DE LA MIGRACIÓN HAN SIDO SATISFECHAS AL 100%.")
    sys.exit(0)
else:
    print("⚠️ ALGUNAS PRUEBAS REQUIEREN REVISIÓN.")
    sys.exit(1)
