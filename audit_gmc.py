import requests
import json
import csv
import io
import re
import subprocess

BASE_URL = "http://localhost:8000"
AUTH = ("admin", "controlnautas2026")

print("=" * 70)
print("INICIANDO AUDITORIA INTEGRAL DE CUMPLIMIENTO GOOGLE MERCHANT CENTER (2026)")
print("=" * 70)

checks_passed = 0
checks_total = 0

def check(name, condition, details=""):
    global checks_passed, checks_total
    checks_total += 1
    if condition:
        checks_passed += 1
        print(f"PASS | {name} {details}")
    else:
        print(f"FAIL | {name} {details}")

# 1. FEED TSV
print("\n--- [1] FEED TSV DE GOOGLE MERCHANT CENTER ---")
feed_res = requests.get(f"{BASE_URL}/api/feed/google-merchant", auth=AUTH)
check("Endpoint Feed Responde HTTP 200", feed_res.status_code == 200, f"(Status: {feed_res.status_code})")

tsv_text = feed_res.text
tsv_reader = csv.reader(io.StringIO(tsv_text), delimiter="\t")
rows = list(tsv_reader)
header = rows[0] if rows else []

expected_headers = ["id", "title", "description", "link", "image_link", "availability", "price", "condition", "brand", "mpn", "identifier_exists", "google_product_category", "shipping"]
check("Cabeceras TSV requeridas por Google", all(h in header for h in expected_headers), f"(Campos encontrados: {len(header)})")
check("Cantidad de productos con precio en feed", len(rows) > 100, f"(Total productos: {len(rows) - 1})")

sample_rows = rows[1:10]
all_prices_valid = True
all_currencies_pen = True

for r in sample_rows:
    if len(r) >= 7:
        price_val = r[6]
        if not re.match(r"^\d+\.\d{2}\s+PEN$", price_val):
            all_prices_valid = False
        if not price_val.endswith("PEN"):
            all_currencies_pen = False

check("Formato de Precios estrictos (XX.XX PEN)", all_prices_valid)
check("Moneda unica regional Peru (PEN)", all_currencies_pen)

# 2. LANDING PAGE PDP
print("\n--- [2] LANDING PAGE PDP Y STRUCTURED DATA (SCHEMA.ORG) ---")
sample_handle = "lana-de-roca-rockwool-prorox-sl-920"
pdp_res = requests.get(f"{BASE_URL}/pe/products/{sample_handle}", auth=AUTH)
check("Pagina de Producto responde HTTP 200", pdp_res.status_code == 200)

json_ld_match = re.search(r"<script type=\"application/ld\+json\">(.*?)</script>", pdp_res.text, re.DOTALL)
check("Etiqueta JSON-LD presente en HTML", bool(json_ld_match))

if json_ld_match:
    try:
        schema = json.loads(json_ld_match.group(1))
        check("Schema @type es Product", schema.get("@type") == "Product")
        check("Schema incluye name y sku", bool(schema.get("name")) and bool(schema.get("sku")))
        check("Schema incluye brand con objeto Organization/Brand", bool(schema.get("brand", {}).get("name")))
        offer = schema.get("offers", {})
        check("Schema Offer incluye @type Offer", offer.get("@type") == "Offer")
        check("Schema Offer priceCurrency es PEN", offer.get("priceCurrency") == "PEN")
        check("Schema Offer availability valida", offer.get("availability") in ["https://schema.org/InStock", "https://schema.org/PreOrder", "https://schema.org/OutOfStock"])
    except Exception as e:
        check("Parsing JSON-LD exitoso", False, str(e))

# 3. POLICIES
print("\n--- [3] POLITICAS OBLIGATORIAS (SHIPPING, RETURNS, PRIVACY, TERMS) ---")
devoluciones_res = requests.get(f"{BASE_URL}/pe/entregas-y-devoluciones", auth=AUTH)
check("Politica de Entregas y Devoluciones responde HTTP 200", devoluciones_res.status_code == 200)
check("Politica declara plazo de devolucion (30 dias)", "30" in devoluciones_res.text)
check("Politica declara direccion fisica de devolucion", "Jesús María" in devoluciones_res.text or "Garzón" in devoluciones_res.text)

contacto_res = requests.get(f"{BASE_URL}/pe/contacto", auth=AUTH)
check("Pagina de Contacto responde HTTP 200", contacto_res.status_code == 200)
check("Contacto incluye RUC de la empresa (20610965807)", "20610965807" in contacto_res.text)
check("Contacto incluye telefono y correo oficial", "950 302 141" in contacto_res.text and "ventas@controlnautas.com" in contacto_res.text)

terminos_res = requests.get(f"{BASE_URL}/pe/terminos-y-condiciones", auth=AUTH)
check("Terminos y Condiciones responde HTTP 200", terminos_res.status_code == 200)

privacidad_res = requests.get(f"{BASE_URL}/pe/politica-de-privacidad", auth=AUTH)
check("Politica de Privacidad responde HTTP 200", privacidad_res.status_code == 200)
check("Privacidad cita Ley 29733 / D.S. 016-2024-JUS", "016-2024-JUS" in privacidad_res.text or "29733" in privacidad_res.text)

# 4. SIMULACION E2E MEDUSA
print("\n--- [4] SIMULACION TRANSACCIONAL E2E (DESDE CARRITO HASTA ORDEN) ---")
node_script = """
const Medusa = require("@medusajs/js-sdk").default || require("@medusajs/js-sdk");
const sdk = new Medusa({
  baseUrl: "http://127.0.0.1:9000",
  publishableKey: "pk_eb1292e091094841f6432858a500b61842aeca4ebe6a490d218b5db7a6b6985e",
});

async function testE2E() {
  const cartRes = await sdk.store.cart.create({ region_id: "reg_01M01FK2K4G93M9GKDRTPRP6ZB" });
  const cartId = cartRes.cart.id;

  await sdk.store.cart.createLineItem(cartId, {
    variant_id: "variant_01M01FKGTNGD4E0QGCF0ZPCB6A",
    quantity: 1
  });

  await sdk.store.cart.update(cartId, {
    shipping_address: {
      first_name: "Juan",
      last_name: "Pérez",
      company: "Servicios Industriales SAC",
      address_1: "Av. Industrial 500",
      city: "Lima",
      country_code: "pe",
      province: "Lima",
      postal_code: "15072",
      phone: "950302141"
    },
    email: "compras@serviciosindustriales.pe"
  });

  const shippingRes = await sdk.client.fetch("/store/shipping-options?cart_id=" + cartId);
  const optionId = shippingRes.shipping_options[0].id;
  await sdk.store.cart.addShippingMethod(cartId, { option_id: optionId });

  await sdk.store.payment.initiatePaymentSession(cartRes.cart, { provider_id: "pp_system_default" });

  const completeRes = await sdk.store.cart.complete(cartId);
  console.log(JSON.stringify(completeRes));
}

testE2E().catch(err => {
  console.error(err);
  process.exit(1);
});
"""

node_sim = subprocess.run(
    ["node", "-e", node_script],
    capture_output=True,
    text=True,
    cwd="/home/ubuntu/CN_Web/b2b-storefront"
)

check("Simulacion E2E de compra exitosa (Sin errores)", node_sim.returncode == 0, node_sim.stderr if node_sim.returncode != 0 else "")

if node_sim.returncode == 0:
    try:
        order_data = json.loads(node_sim.stdout)
        order_obj = order_data.get("order", {})
        order_id = order_obj.get("id")
        check("Orden de compra generada en Medusa", bool(order_id), f"(ID: {order_id})")
        check("Moneda de la orden es PEN", order_obj.get("currency_code") == "pen")
        check("Total de orden coherente", (order_obj.get("total") or 0) > 0)
        
        order_page_res = requests.get(f"{BASE_URL}/pe/order/{order_id}/confirmed", auth=AUTH)
        check("Pagina de Confirmacion /pe/order/{id}/confirmed responde HTTP 200", order_page_res.status_code == 200)
    except Exception as e:
        check("Validacion de orden generada", False, str(e))

# 5. BOTS & SITEMAP
print("\n--- [5] RASTREABILIDAD, ROBOTS.TXT Y SITEMAP ---")
robots_res = requests.get(f"{BASE_URL}/robots.txt", auth=AUTH)
check("Robots.txt responde HTTP 200", robots_res.status_code == 200)
check("Robots.txt permite rastreo de productos", "Disallow: /pe/products/" not in robots_res.text)

sitemap_res = requests.get(f"{BASE_URL}/sitemap.xml", auth=AUTH)
check("Sitemap XML responde HTTP 200", sitemap_res.status_code == 200)
check("Sitemap contiene URLs de productos", "/pe/products/" in sitemap_res.text)

print("\n" + "=" * 70)
print(f"RESUMEN AUDITORIA GMC: {checks_passed}/{checks_total} PRUEBAS EXITOSAS ({(checks_passed/checks_total)*100:.1f}%)")
print("=" * 70)
