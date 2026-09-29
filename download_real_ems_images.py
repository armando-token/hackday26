import urllib.request
import re
import os
import json
import time

headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}

products_path = "/home/ubuntu/CN_Web/b2b-storefront/src/lib/cn-catalog/data/products.json"
ems_media_dir = "/home/ubuntu/CN_Web/b2b-storefront/public/cn-media/products/ems"
os.makedirs(ems_media_dir, exist_ok=True)

with open(products_path, "r", encoding="utf-8") as f:
    products = json.load(f)

urls_to_crawl = [
    "https://emskontrol.com/",
    "https://emskontrol.com/urunler/",
    "https://emskontrol.com/or-tak-ortam-takip-sistemi/",
    "https://emskontrol.com/transmitter-grubu/",
    "https://emskontrol.com/kontrol-cihazlari-grubu/",
    "https://emskontrol.com/en/products/",
    "https://emskontrol.com/urun-kategori/transmitter-grubu/sicaklik-sensorleri/",
    "https://emskontrol.com/urun-kategori/transmitter-grubu/nem-sensorleri/",
    "https://emskontrol.com/urun-kategori/transmitter-grubu/karbondioksit-sensorleri/",
    "https://emskontrol.com/urun-kategori/transmitter-grubu/fark-basinc-sensorleri/",
    "https://emskontrol.com/urun-kategori/transmitter-grubu/gaz-grubu-sensorleri/",
    "https://emskontrol.com/urun-kategori/kontrol-cihazlari-grubu/duvar-tipi-kontrol-cihazlari/",
    "https://emskontrol.com/urun-kategori/kontrol-cihazlari-grubu/panel-tipi-kontrol-cihazlari/",
    "https://emskontrol.com/urun-kategori/or-tak-ortam-takip-sistemi/kablosuz-sensor-modulleri/",
    "https://emskontrol.com/urun-kategori/or-tak-ortam-takip-sistemi/master-cihazlar/"
]

all_product_urls = set()
for url in urls_to_crawl:
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=10) as resp:
            html = resp.read().decode("utf-8", errors="ignore")
            found = set(re.findall(r"https://emskontrol.com/(?:en/)?urun/[a-zA-Z0-9\-\%]+/?", html))
            all_product_urls.update(found)
    except Exception as e:
        print("Error crawling", url, e)

print("Total Unique Product Pages to process:", len(all_product_urls))

model_to_image = {}
image_cache = {}

for idx, purl in enumerate(sorted(all_product_urls)):
    slug = purl.rstrip("/").split("/")[-1].lower()
    try:
        req = urllib.request.Request(purl, headers=headers)
        with urllib.request.urlopen(req, timeout=10) as resp:
            p_html = resp.read().decode("utf-8", errors="ignore")
            
            # Find image URLs
            imgs = re.findall(r"https://emskontrol.com/wp-content/uploads/\d{4}/\d{2}/[a-zA-Z0-9\-\._]+\.(?:jpg|jpeg|png|webp)", p_html)
            # Filter out logos, icons, banners
            good_imgs = [i for i in imgs if not any(x in i.lower() for x in ["logo", "favicon", "icon", "banner", "loader"])]
            
            if good_imgs:
                img_url = good_imgs[0]
                img_url = re.sub(r"-\d+x\d+\.(jpg|png|webp|jpeg)", r".", img_url)
                
                code_match = re.search(r"([a-z]{2}-[\dx]+)", slug)
                if code_match:
                    code_key = code_match.group(1)
                    model_to_image[code_key] = img_url
                model_to_image[slug] = img_url
                    
                print(f"[{idx+1}/{len(all_product_urls)}] Found: {slug} -> {img_url}")
            else:
                print(f"[{idx+1}/{len(all_product_urls)}] No image found on {purl}")
    except Exception as e:
        print("Error fetching", purl, e)
    time.sleep(0.05)

print("Scraped model mappings:", len(model_to_image))

downloaded_count = 0
updated_products = 0

for p in products:
    if p.get("brand") != "EMS Kontrol":
        continue
        
    handle = p.get("handle") or ""
    title = p.get("title") or ""
    model = (p.get("mfrModel") or p.get("itemNumber") or "").lower()
    
    found_img_url = None
    for code_key, img_url in model_to_image.items():
        if code_key in handle.lower() or code_key in model or code_key in title.lower():
            found_img_url = img_url
            break
            
    if not found_img_url:
        for part in handle.split("-"):
            if len(part) >= 4 and part in model_to_image:
                found_img_url = model_to_image[part]
                break
                
    if found_img_url:
        ext = found_img_url.split(".")[-1].split("?")[0].lower()
        if ext not in ["png", "jpg", "jpeg", "webp"]:
            ext = "png"
            
        dest_filename = f"{handle}.{ext}"
        dest_path = os.path.join(ems_media_dir, dest_filename)
        
        if found_img_url not in image_cache:
            try:
                img_req = urllib.request.Request(found_img_url, headers=headers)
                with urllib.request.urlopen(img_req, timeout=15) as i_resp:
                    img_data = i_resp.read()
                    with open(dest_path, "wb") as img_out:
                        img_out.write(img_data)
                image_cache[found_img_url] = dest_path
                downloaded_count += 1
                print("Downloaded REAL photo for", handle, "->", dest_filename)
            except Exception as dl_err:
                print("Failed to download", found_img_url, dl_err)
        else:
            with open(image_cache[found_img_url], "rb") as src_f, open(dest_path, "wb") as dst_f:
                dst_f.write(src_f.read())
                
        web_path = f"/cn-media/products/ems/{dest_filename}"
        p["image"] = web_path
        p["images"] = [web_path]
        updated_products += 1

print("="*60)
print("SUMMARY OF REAL MANUFACTURER PHOTOS FOR EMS KONTROL:")
print(f"Downloaded {downloaded_count} new original image files.")
print(f"Updated {updated_products} EMS Kontrol products with authentic manufacturer photos.")
print("="*60)

with open(products_path, "w", encoding="utf-8") as f:
    json.dump(products, f, ensure_ascii=False, indent=2)

print("Saved updated products.json successfully!")
