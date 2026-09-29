import xml.etree.ElementTree as ET
import re
import html

tree = ET.parse("/home/ubuntu/CN_Web/extra/controlnautas.WordPress.2026-08-16.xml")
root = tree.getroot()
channel = root.find("channel")
items = channel.findall("item")

posts_found = []
for item in items:
    ptype = item.find("{http://wordpress.org/export/1.2/}post_type")
    ptype_text = ptype.text if ptype is not None else ""
    pstatus = item.find("{http://wordpress.org/export/1.2/}status")
    pstatus_text = pstatus.text if pstatus is not None else ""
    
    if ptype_text == "post" and pstatus_text == "publish":
        title = item.find("title").text if item.find("title") is not None else ""
        link = item.find("link").text if item.find("link") is not None else ""
        post_name = item.find("{http://wordpress.org/export/1.2/}post_name")
        slug = post_name.text if post_name is not None else ""
        pubDate = item.find("pubDate").text if item.find("pubDate") is not None else ""
        post_date = item.find("{http://wordpress.org/export/1.2/}post_date")
        date_str = post_date.text if post_date is not None else ""
        content = item.find("{http://purl.org/rss/1.0/modules/content/}encoded")
        content_text = content.text if content is not None else ""
        
        # Check categories / tags
        categories = []
        for cat in item.findall("category"):
            domain = cat.attrib.get("domain", "")
            categories.append((domain, cat.text))
            
        posts_found.append({
            "title": title,
            "slug": slug,
            "link": link,
            "date": date_str,
            "pubDate": pubDate,
            "categories": categories,
            "content": content_text
        })

print(f"Total published posts in XML: {len(posts_found)}")
for p in posts_found:
    print(f"Slug: {p['slug']} | Date: {p['date']} | Title: {p['title']}")

