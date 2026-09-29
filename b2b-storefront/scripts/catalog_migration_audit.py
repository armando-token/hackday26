#!/usr/bin/env python3
"""Read-only catalog migration audit: WooCommerce CSV vs current CN JSON."""

from __future__ import annotations

import csv
import html
import json
import re
import unicodedata
from collections import Counter, defaultdict
from difflib import SequenceMatcher
from pathlib import Path
from urllib.parse import unquote, urlparse


ROOT = Path(__file__).resolve().parents[2]
OLD_CSV = ROOT / "extra" / "wc-product-export-15-8-2026-1786846848839.csv"
CURRENT_JSON = ROOT / "b2b-storefront" / "src/lib/cn-catalog/data/products.json"
PUBLIC = ROOT / "b2b-storefront" / "public"
OUT_DIR = ROOT / "md" / "auditoria-catalogo-2026-08-16"


def plain(value: object) -> str:
    text = html.unescape(str(value or ""))
    text = re.sub(r"<script\b[^>]*>[\s\S]*?</script>", " ", text, flags=re.I)
    text = re.sub(r"<style\b[^>]*>[\s\S]*?</style>", " ", text, flags=re.I)
    text = re.sub(r"<[^>]+>", " ", text)
    return re.sub(r"\s+", " ", text).strip()


def norm(value: object) -> str:
    text = unicodedata.normalize("NFKD", plain(value)).encode("ascii", "ignore").decode()
    text = text.casefold().replace("×", "x")
    return re.sub(r"[^a-z0-9]+", " ", text).strip()


def norm_key(value: object) -> str:
    text = norm(value)
    aliases = {
        "marca fabricante": "marca",
        "fabricante": "marca",
        "modelo exacto": "modelo",
        "model": "modelo",
        "voltaje": "tension",
        "voltaje alimentacion": "tension",
        "tension alimentacion": "tension",
        "temperatura maxima": "temperatura maxima",
        "t maxima": "temperatura maxima",
        "temp maxima": "temperatura maxima",
        "dimensiones nominales": "dimensiones",
        "densidad nominal": "densidad",
    }
    return aliases.get(text, text)


def is_ems(title: object, brand: object) -> bool:
    hay = norm(f"{title or ''} {brand or ''}")
    return "ems kontrol" in hay or hay.startswith("ems ") or " or tak " in f" {hay} "


def old_brand(row: dict[str, str]) -> str:
    return (row.get("Marcas") or "").strip()


def old_specs(row: dict[str, str]) -> dict[str, str]:
    result: dict[str, str] = {}
    for idx in range(1, 17):
        key = (row.get(f"Nombre del atributo {idx}") or "").strip()
        value = (row.get(f"Valor(es) del atributo {idx}") or "").strip()
        if key and value:
            result[key] = value.replace("\\,", ",")
    return result


def old_images(row: dict[str, str]) -> list[str]:
    return [x.strip() for x in (row.get("Imágenes") or "").split(",") if x.strip()]


def basename_from_url(value: str) -> str:
    return unquote(Path(urlparse(value).path).name).casefold()


def to_float(value: object) -> float | None:
    raw = str(value or "").strip().replace(",", ".")
    if not raw:
        return None
    try:
        return float(raw)
    except ValueError:
        return None


def score(a: object, b: object) -> float:
    aa, bb = norm(a), norm(b)
    if not aa and not bb:
        return 1.0
    return SequenceMatcher(None, aa, bb).ratio()


def duplicate_values(items: list[dict], field: str) -> dict[str, list[int]]:
    grouped: dict[str, list[int]] = defaultdict(list)
    for p in items:
        value = norm(p.get(field))
        if value:
            grouped[value].append(int(p.get("wcId") or 0))
    return {k: v for k, v in grouped.items() if len(v) > 1}


def write_csv(path: Path, rows: list[dict], fieldnames: list[str]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8-sig", newline="") as fh:
        writer = csv.DictWriter(fh, fieldnames=fieldnames, extrasaction="ignore")
        writer.writeheader()
        writer.writerows(rows)


with OLD_CSV.open(encoding="utf-8-sig", newline="") as fh:
    old_rows = list(csv.DictReader(fh))
current_all = json.loads(CURRENT_JSON.read_text(encoding="utf-8"))

old_non_ems = [r for r in old_rows if not is_ems(r.get("Nombre"), old_brand(r))]
current_non_ems = [p for p in current_all if not is_ems(p.get("title"), p.get("brand"))]
old_ems = [r for r in old_rows if r not in old_non_ems]
current_ems = [p for p in current_all if p not in current_non_ems]

old_by_id = {int(r["ID"]): r for r in old_non_ems if (r.get("ID") or "").isdigit()}
cur_by_id = {int(p["wcId"]): p for p in current_non_ems if str(p.get("wcId", "")).isdigit()}
matched_ids = sorted(set(old_by_id) & set(cur_by_id))
missing_ids = sorted(set(old_by_id) - set(cur_by_id))
extra_ids = sorted(set(cur_by_id) - set(old_by_id))

missing_rows = [
    {
        "old_id": oid,
        "title": old_by_id[oid].get("Nombre", ""),
        "brand": old_brand(old_by_id[oid]),
        "published": old_by_id[oid].get("Publicado", ""),
        "categories": old_by_id[oid].get("Categorías", ""),
    }
    for oid in missing_ids
]
extra_rows = [
    {
        "current_wc_id": cid,
        "handle": cur_by_id[cid].get("handle", ""),
        "title": cur_by_id[cid].get("title", ""),
        "brand": cur_by_id[cid].get("brand", ""),
        "category": "/".join(cur_by_id[cid].get("categoryPath") or []),
    }
    for cid in extra_ids
]

comparison_rows: list[dict] = []
spec_change_rows: list[dict] = []
image_problem_rows: list[dict] = []
for pid in matched_ids:
    old = old_by_id[pid]
    cur = cur_by_id[pid]
    ospec = old_specs(old)
    cspec = cur.get("specs") or {}
    old_by_key = {norm_key(k): (k, v) for k, v in ospec.items()}
    cur_by_key = {norm_key(k): (k, str(v)) for k, v in cspec.items() if str(v).strip()}

    missing_specs = sorted(set(old_by_key) - set(cur_by_key))
    added_specs = sorted(set(cur_by_key) - set(old_by_key))
    changed_specs = []
    for key in sorted(set(old_by_key) & set(cur_by_key)):
        old_k, old_v = old_by_key[key]
        cur_k, cur_v = cur_by_key[key]
        if norm(old_v) != norm(cur_v):
            changed_specs.append(key)
            spec_change_rows.append({
                "wc_id": pid,
                "title": cur.get("title", ""),
                "kind": "changed",
                "canonical_key": key,
                "old_key": old_k,
                "old_value": old_v,
                "current_key": cur_k,
                "current_value": cur_v,
            })
    for key in missing_specs:
        old_k, old_v = old_by_key[key]
        spec_change_rows.append({
            "wc_id": pid,
            "title": cur.get("title", ""),
            "kind": "missing_from_current",
            "canonical_key": key,
            "old_key": old_k,
            "old_value": old_v,
            "current_key": "",
            "current_value": "",
        })
    for key in added_specs:
        cur_k, cur_v = cur_by_key[key]
        spec_change_rows.append({
            "wc_id": pid,
            "title": cur.get("title", ""),
            "kind": "added_after_migration",
            "canonical_key": key,
            "old_key": "",
            "old_value": "",
            "current_key": cur_k,
            "current_value": cur_v,
        })

    oimgs = old_images(old)
    cimgs = cur.get("images") or []
    old_names = {basename_from_url(x) for x in oimgs}
    cur_names = {basename_from_url(x) for x in cimgs}
    missing_files = []
    zero_files = []
    remote_current = []
    for img in cimgs:
        if str(img).startswith(("http://", "https://")):
            remote_current.append(img)
            continue
        file_path = PUBLIC / str(img).lstrip("/")
        if not file_path.exists():
            missing_files.append(str(img))
        elif file_path.stat().st_size == 0:
            zero_files.append(str(img))
    dropped_names = sorted(old_names - cur_names)
    if not cimgs or missing_files or zero_files or remote_current or dropped_names:
        image_problem_rows.append({
            "wc_id": pid,
            "title": cur.get("title", ""),
            "old_image_count": len(oimgs),
            "current_image_count": len(cimgs),
            "dropped_old_basenames": " | ".join(dropped_names),
            "missing_local_files": " | ".join(missing_files),
            "zero_byte_files": " | ".join(zero_files),
            "remote_current": " | ".join(remote_current),
        })

    old_price = to_float(old.get("Precio normal"))
    cur_price = to_float(cur.get("price"))
    tech = plain(cur.get("technicalDescription"))
    short = plain(cur.get("shortDescription"))
    old_short = plain(old.get("Descripción corta"))
    old_long = plain(old.get("Descripción"))
    title_sim = score(old.get("Nombre"), cur.get("title"))
    tech_sim = score(old_short, tech)
    suspicious_end = bool(tech and not re.search(r"[.!?…:)\]°%]$", tech))
    exact_brand = norm(old_brand(old)) == norm(cur.get("brand"))
    price_mismatch = (
        old_price is not None and cur_price is not None and abs(old_price - cur_price) > 0.009
    )
    comparison_rows.append({
        "wc_id": pid,
        "handle": cur.get("handle", ""),
        "old_title": old.get("Nombre", ""),
        "current_title": cur.get("title", ""),
        "title_similarity": round(title_sim, 4),
        "old_brand": old_brand(old),
        "current_brand": cur.get("brand", ""),
        "brand_exact": exact_brand,
        "old_price": old_price,
        "current_price": cur_price,
        "price_mode": cur.get("priceMode", ""),
        "price_mismatch": price_mismatch,
        "old_short_len": len(old_short),
        "current_short_len": len(short),
        "technical_len": len(tech),
        "technical_similarity_to_old_short": round(tech_sim, 4),
        "technical_suspicious_end": suspicious_end,
        "old_long_description_len": len(old_long),
        "current_has_long_description": bool(plain(cur.get("descriptionHtml") or cur.get("longDescription"))),
        "old_specs": len(ospec),
        "current_specs": len(cspec),
        "missing_old_specs": len(missing_specs),
        "changed_same_key_specs": len(changed_specs),
        "added_specs": len(added_specs),
        "old_images": len(oimgs),
        "current_images": len(cimgs),
        "missing_current_image_files": len(missing_files),
        "dropped_old_images": len(dropped_names),
        "published_old": old.get("Publicado", ""),
    })

# Whole-current integrity checks, excluding EMS.
current_integrity_rows: list[dict] = []
for p in current_non_ems:
    issues: list[str] = []
    for field in ("handle", "wcId", "title", "brand", "itemNumber", "mfrModel", "categorySlug"):
        if p.get(field) in (None, "", []):
            issues.append(f"missing:{field}")
    if not p.get("images"):
        issues.append("no_images")
    if not p.get("specs"):
        issues.append("no_specs")
    tech = plain(p.get("technicalDescription"))
    if not tech:
        issues.append("no_technical_description")
    elif len(tech) < 80:
        issues.append("short_technical_description")
    # Check if template has truncation logic
    template_code = (ROOT / "b2b-storefront/src/modules/products/templates/hvac-product.tsx").read_text(encoding="utf-8")
    if "titleShort" in template_code or "title.slice" in template_code:
        if len(str(p.get("title") or "")) > 90:
            issues.append("title_truncated_by_pdp_ui")
    if p.get("priceMode") == "quote" and p.get("isPurchasable") is True:
        issues.append("quote_but_isPurchasable_true")
    if p.get("inStock") is True and p.get("priceMode") == "quote":
        issues.append("quote_marked_in_stock")
    if issues:
        current_integrity_rows.append({
            "wc_id": p.get("wcId"),
            "handle": p.get("handle", ""),
            "title": p.get("title", ""),
            "brand": p.get("brand", ""),
            "issues": " | ".join(issues),
        })

issue_counts = Counter()
for row in current_integrity_rows:
    issue_counts.update(row["issues"].split(" | "))

summary = {
    "source_files": {"old_csv": str(OLD_CSV), "current_json": str(CURRENT_JSON)},
    "inventory": {
        "old_rows_total": len(old_rows),
        "old_rows_published": sum((r.get("Publicado") or "").strip() == "1" for r in old_rows),
        "old_ems_excluded": len(old_ems),
        "old_non_ems_scope": len(old_non_ems),
        "current_total": len(current_all),
        "current_ems_excluded": len(current_ems),
        "current_non_ems_scope": len(current_non_ems),
        "matched_by_wc_id": len(matched_ids),
        "missing_from_current": len(missing_ids),
        "extra_in_current": len(extra_ids),
    },
    "matched_quality": {
        "title_changed": sum(r["title_similarity"] < 0.9999 for r in comparison_rows),
        "title_low_similarity_below_0_80": sum(r["title_similarity"] < 0.8 for r in comparison_rows),
        "brand_changed": sum(not r["brand_exact"] for r in comparison_rows),
        "price_mismatch": sum(r["price_mismatch"] for r in comparison_rows),
        "old_long_descriptions_present": sum(r["old_long_description_len"] > 0 for r in comparison_rows),
        "current_long_descriptions_present": sum(r["current_has_long_description"] for r in comparison_rows),
        "technical_description_suspicious_end": sum(r["technical_suspicious_end"] for r in comparison_rows),
        "technical_description_under_80_chars": sum(r["technical_len"] < 80 for r in comparison_rows),
        "products_with_missing_old_specs": sum(r["missing_old_specs"] > 0 for r in comparison_rows),
        "products_with_changed_same_key_specs": sum(r["changed_same_key_specs"] > 0 for r in comparison_rows),
        "products_with_added_specs": sum(r["added_specs"] > 0 for r in comparison_rows),
        "spec_change_records": dict(Counter(r["kind"] for r in spec_change_rows)),
        "products_with_no_current_images": sum(r["current_images"] == 0 for r in comparison_rows),
        "products_with_missing_current_image_files": sum(r["missing_current_image_files"] > 0 for r in comparison_rows),
        "products_with_dropped_old_images": sum(r["dropped_old_images"] > 0 for r in comparison_rows),
        "old_image_total": sum(r["old_images"] for r in comparison_rows),
        "current_image_total": sum(r["current_images"] for r in comparison_rows),
    },
    "current_integrity_issue_counts": dict(issue_counts.most_common()),
    "duplicates_current_non_ems": {
        "handles": duplicate_values(current_non_ems, "handle"),
        "item_numbers": duplicate_values(current_non_ems, "itemNumber"),
        "titles": duplicate_values(current_non_ems, "title"),
    },
    "brand_counts_old_non_ems": dict(Counter(old_brand(r) or "(vacía)" for r in old_non_ems).most_common()),
    "brand_counts_current_non_ems": dict(Counter(p.get("brand") or "(vacía)" for p in current_non_ems).most_common()),
    "category_counts_current_non_ems": dict(Counter((p.get("categoryPath") or ["(vacía)"])[0] for p in current_non_ems).most_common()),
}

OUT_DIR.mkdir(parents=True, exist_ok=True)
(OUT_DIR / "resumen.json").write_text(json.dumps(summary, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
write_csv(OUT_DIR / "productos-faltantes.csv", missing_rows, ["old_id", "title", "brand", "published", "categories"])
write_csv(OUT_DIR / "productos-extra.csv", extra_rows, ["current_wc_id", "handle", "title", "brand", "category"])
write_csv(OUT_DIR / "comparacion-producto-a-producto.csv", comparison_rows, list(comparison_rows[0]) if comparison_rows else ["wc_id"])
write_csv(OUT_DIR / "cambios-especificaciones.csv", spec_change_rows, ["wc_id", "title", "kind", "canonical_key", "old_key", "old_value", "current_key", "current_value"])
write_csv(OUT_DIR / "problemas-imagenes.csv", image_problem_rows, ["wc_id", "title", "old_image_count", "current_image_count", "dropped_old_basenames", "missing_local_files", "zero_byte_files", "remote_current"])
write_csv(OUT_DIR / "problemas-integridad-actual.csv", current_integrity_rows, ["wc_id", "handle", "title", "brand", "issues"])
print(json.dumps(summary, ensure_ascii=False, indent=2))
