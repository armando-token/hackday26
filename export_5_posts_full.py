import xml.etree.ElementTree as ET
import re
import html

tree = ET.parse("/home/ubuntu/CN_Web/extra/controlnautas.WordPress.2026-08-16.xml")
root = tree.getroot()
channel = root.find("channel")
items = channel.findall("item")

target_slugs = [
    "control-industrial-resistencias-electricas-peru",
    "eliminacion-congelamiento-heat-tracing-peru",
    "control-temperatura-datacenters-akcp",
    "solucion-lana-de-roca-en-calderas-peru",
    "prevencion-congelamiento-heat-tracing-peru"
]

def strip_tags(text):
    if not text:
        return ""
    text = re.sub(r'<!--.*?-->', '', text, flags=re.DOTALL)
    text = re.sub(r'<br\s*/?>', '\n', text)
    text = re.sub(r'</p>', '\n\n', text)
    text = re.sub(r'</li>', '\n', text)
    text = re.sub(r'<h[1-6][^>]*>', '\n\n### ', text)
    text = re.sub(r'</h[1-6]>', '\n\n', text)
    text = re.sub(r'<[^<]+?>', '', text)
    text = html.unescape(text)
    text = re.sub(r'[ \t]+', ' ', text)
    text = re.sub(r'\n\s*\n+', '\n\n', text)
    return text.strip()

for target in target_slugs:
    for item in items:
        post_name = item.find("{http://wordpress.org/export/1.2/}post_name")
        slug = post_name.text if post_name is not None else ""
        if slug == target:
            title = item.find("title").text if item.find("title") is not None else ""
            pubDate = item.find("pubDate").text if item.find("pubDate") is not None else ""
            post_date = item.find("{http://wordpress.org/export/1.2/}post_date").text if item.find("{http://wordpress.org/export/1.2/}post_date") is not None else ""
            content = item.find("{http://purl.org/rss/1.0/modules/content/}encoded").text if item.find("{http://purl.org/rss/1.0/modules/content/}encoded") is not None else ""
            
            with open(f"/home/ubuntu/CN_Web/post_{slug}.txt", "w", encoding="utf-8") as f:
                f.write(f"SLUG: {slug}\n")
                f.write(f"TITLE: {title}\n")
                f.write(f"POST_DATE: {post_date}\n")
                f.write(f"PUBDATE: {pubDate}\n\n")
                f.write(strip_tags(content))

print("Exported all 5 posts successfully.")
