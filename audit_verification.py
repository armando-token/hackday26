import xml.etree.ElementTree as ET
import re
import json

# Load XML
tree = ET.parse("/home/ubuntu/CN_Web/extra/controlnautas.WordPress.2026-08-16.xml")
root = tree.getroot()
channel = root.find("channel")
items = channel.findall("item")

xml_posts = {}
for item in items:
    ptype = item.find("{http://wordpress.org/export/1.2/}post_type")
    if ptype is not None and ptype.text == "post":
        pname = item.find("{http://wordpress.org/export/1.2/}post_name")
        if pname is not None:
            title = item.find("title").text if item.find("title") is not None else ""
            content = item.find("{http://purl.org/rss/1.0/modules/content/}encoded").text if item.find("{http://purl.org/rss/1.0/modules/content/}encoded") is not None else ""
            post_date = item.find("{http://wordpress.org/export/1.2/}post_date").text if item.find("{http://wordpress.org/export/1.2/}post_date") is not None else ""
            xml_posts[pname.text] = {
                "title": title,
                "date": post_date,
                "content": content
            }

# Read case-studies.ts
with open("/home/ubuntu/CN_Web/b2b-storefront/src/lib/data/case-studies.ts", "r") as f:
    ts_content = f.read()

print(f"Total XML posts loaded: {len(xml_posts)}")

mapping = [
    {
        "case_name": "Calderas Petróleo A50 (Pesqueras)",
        "ts_slug": "solucion-lana-de-roca-en-calderas-peru",
        "xml_slug": "solucion-lana-de-roca-en-calderas-peru",
        "key_facts_to_verify": [
            "petróleo A50", "30 m³", "lana de roca", "calentador", "30 kW", "calderas", "50 °C", "80 °C", "90 °C", "120 °C", "7 años", "pesquera"
        ]
    },
    {
        "case_name": "Matucana-Chosica (Central Hidroeléctrica / Resistencias)",
        "ts_slug": "resistencias-electricas-prevenir-cortocircuitos",
        "xml_slug": "control-industrial-resistencias-electricas-peru",
        "key_facts_to_verify": [
            "Matucana", "Chocica", "generador", "hidroeléctrica", "19 °C", "punto de rocío", "4 °C", "condensación", "resistencias eléctricas", "sensores"
        ]
    },
    {
        "case_name": "Minería Sierra / Cables Huanrui 25MSR-PF",
        "ts_slug": "heat-tracing-evitar-congelamiento",
        "xml_slug": "eliminacion-congelamiento-heat-tracing-peru",
        "key_facts_to_verify": [
            "Huanrui", "25MSR-PF", "congelamiento", "minera", "-10", "-15", "vapor", "choques térmicos", "25 W/m", "autorregulable"
        ]
    },
    {
        "case_name": "Datacenters AKCP (Aseguradora Lima)",
        "ts_slug": "control-temperatura-datacenters-akcp",
        "xml_slug": "control-temperatura-datacenters-akcp",
        "key_facts_to_verify": [
            "aseguradora", "Lima", "datacenter", "AKCP", "SensorProbe", "humedad", "fugas", "certificación", "póliza"
        ]
    },
    {
        "case_name": "Fluidos Químicos (Sulfato de Cobre / Metabisulfito / SRM/E)",
        "ts_slug": "prevencion-avanzada-congelamiento-heat-tracing",
        "xml_slug": "prevencion-congelamiento-heat-tracing-peru",
        "key_facts_to_verify": [
            "metabisulfito", "sulfato de cobre", "SRM/E", "anticrustantes", "duchas de seguridad", "congelamiento", "válvulas", "bombas", "purgas"
        ]
    }
]

for m in mapping:
    print("="*70)
    print(f"CASE: {m['case_name']}")
    print(f"TS Slug: {m['ts_slug']} | XML Slug: {m['xml_slug']}")
    
    xml_data = xml_posts.get(m['xml_slug'])
    if not xml_data:
        print("ERROR: XML post not found!")
        continue
        
    xml_text = xml_data['content'].lower()
    print(f"XML Title: {xml_data['title']}")
    print(f"XML Date: {xml_data['date']}")
    
    print("\nVerifying Key Technical Facts in XML:")
    facts_found = 0
    for fact in m['key_facts_to_verify']:
        found = fact.lower() in xml_text or fact.lower() in xml_data['title'].lower()
        print(f"  - [{ 'OK' if found else 'FAIL' }] Fact '{fact}' in XML: {found}")
        if found:
            facts_found += 1
    
    pct = (facts_found / len(m['key_facts_to_verify'])) * 100
    print(f"Factual overlap rate: {pct:.1f}% ({facts_found}/{len(m['key_facts_to_verify'])})")
