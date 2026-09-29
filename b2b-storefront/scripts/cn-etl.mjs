#!/usr/bin/env node
/**
 * CN_Web Fase 1 ETL — fetch all WooCommerce Store API products → CN catalog JSON.
 *
 * Usage:
 *   node --experimental-strip-types scripts/cn-etl.mjs
 *   DOWNLOAD_IMAGES=1 node --experimental-strip-types scripts/cn-etl.mjs
 *
 * Requires User-Agent Mozilla/5.0 (ModSecurity returns 406 otherwise).
 */

import { createWriteStream } from "node:fs"
import { mkdir, writeFile, access, constants as fsConstants } from "node:fs/promises"
import { dirname, join, basename, extname } from "node:path"
import { pipeline } from "node:stream/promises"
import { fileURLToPath } from "node:url"
import { Readable } from "node:stream"

import { mapWcToCnTaxonomy } from "../src/lib/cn-catalog/taxonomy-map.ts"
import { CN_ROOT } from "../src/lib/cn-catalog/taxonomy.ts"

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, "..")
const DATA_DIR = join(ROOT, "src/lib/cn-catalog/data")
const MEDIA_DIR = join(ROOT, "public/cn-media/products")

const API_BASE = "https://controlnautas.com/wp-json/wc/store/products"
const PER_PAGE = 100
const PAGES = [1, 2, 3, 4]
const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
const DOWNLOAD_IMAGES = process.env.DOWNLOAD_IMAGES === "1"
const IMAGE_CONCURRENCY = 3

/** @typedef {{
 *   handle: string
 *   wcId: number
 *   title: string
 *   brand: string
 *   itemNumber: string
 *   mfrModel: string
 *   priceMode: "fixed" | "quote"
 *   price: number
 *   currency: "PEN"
 *   shortDescription: string
 *   descriptionHtml: string
 *   categoryPath: string[]
 *   categorySlug: string
 *   images: string[]
 *   inStock: boolean
 *   isPurchasable: boolean
 *   specs: Record<string, string>
 *   rating: number
 *   reviewCount: number
 *   permalink: string
 * }} CnEtlProduct */

const HTML_ENTITIES = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
}

function decodeHtmlEntities(text) {
  if (!text) return ""
  let s = String(text)
  s = s.replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCodePoint(parseInt(h, 16)))
  s = s.replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
  s = s.replace(/&([a-zA-Z]+);/g, (m, name) => HTML_ENTITIES[name] ?? m)
  return s
}

function stripHtml(html) {
  if (!html) return ""
  let s = String(html)
  s = s.replace(/<script[\s\S]*?<\/script>/gi, "")
  s = s.replace(/<style[\s\S]*?<\/style>/gi, "")
  s = s.replace(/<br\s*\/?>/gi, "\n")
  s = s.replace(/<\/p>/gi, "\n")
  s = s.replace(/<\/li>/gi, "\n")
  s = s.replace(/<[^>]+>/g, " ")
  s = decodeHtmlEntities(s)
  s = s.replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n")
  s = s.replace(/[ \t]{2,}/g, " ").trim()
  return s
}

function sanitizeHtml(html) {
  if (!html) return ""
  let s = String(html)
  s = s.replace(/<script[\s\S]*?<\/script>/gi, "")
  s = s.replace(/<style[\s\S]*?<\/style>/gi, "")
  s = s.replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
  s = s.replace(/javascript:/gi, "")
  return s.trim()
}

function truncate(s, max) {
  if (s.length <= max) return s
  return s.slice(0, max - 1).trimEnd() + "…"
}

async function fetchJson(url) {
  const res = await fetch(url, {
    headers: {
      "User-Agent": UA,
      Accept: "application/json",
    },
  })
  if (!res.ok) {
    const body = await res.text().catch(() => "")
    throw new Error(`HTTP ${res.status} for ${url}: ${body.slice(0, 200)}`)
  }
  return res.json()
}

async function fetchAllProducts() {
  const all = []
  for (const page of PAGES) {
    const url = `${API_BASE}?per_page=${PER_PAGE}&page=${page}`
    process.stdout.write(`Fetching page ${page}/${PAGES.length}… `)
    const batch = await fetchJson(url)
    if (!Array.isArray(batch)) throw new Error(`Unexpected response page ${page}`)
    console.log(`${batch.length} products`)
    all.push(...batch)
  }
  return all
}

function extractBrand(p) {
  const fromBrands = p.brands?.[0]?.name
  if (fromBrands) return decodeHtmlEntities(fromBrands)

  const marca = (p.attributes || []).find((a) => /marca|brand/i.test(a.name || ""))
  const term = marca?.terms?.[0]?.name
  if (term && !/reemplazo|dynisco|gefran/i.test(term)) {
    return decodeHtmlEntities(term)
  }

  const title = decodeHtmlEntities(p.name || "")
  const patterns = [
    [/AKCP/i, "AKCP"],
    [/King Electric/i, "King Electric"],
    [/\bKing\b/i, "King Electric"],
    [/MPI Morheat/i, "MPI"],
    [/\bMPI\b/i, "MPI"],
    [/Novus/i, "Novus"],
    [/Horner/i, "Horner"],
    [/Tzone|TZONE/i, "Tzone"],
    [/Huanrui/i, "Huanrui"],
    [/ROCKWOOL|Rockwool/i, "Rockwool"],
    [/Termolan/i, "Termolan"],
    [/Perfect/i, "Perfect"],
    [/Armaflex/i, "Armaflex"],
    [/Sinopan/i, "Sinopan"],
  ]
  for (const [re, name] of patterns) {
    if (re.test(title)) return name
  }
  return "Control Nautas"
}

function extractMfrModel(p, title) {
  const sku = (p.sku || "").trim()
  const GENERIC =
    /^(calentadores?|calefactor(es)?|sensor(es)?|sistema(s)?|controlador(es)?|indicador(es)?|novus|king|mpi|horner|akcp|termopares?|resistencias?|panel(es)?|cable(s)?)$/i

  const modelo = (p.attributes || []).find((a) =>
    /^(modelo|modelo exacto|model)$/i.test((a.name || "").trim())
  )
  const term = modelo?.terms?.[0]?.name
  if (term) {
    const t = decodeHtmlEntities(term).trim()
    if (t && !GENERIC.test(t)) return t
  }

  if (sku && !GENERIC.test(sku)) return sku

  const m =
    title.match(
      /\b((?:HE-|N|BTC-|TEC-|KB|KBP|PKB|DAW|MKT|CX|WHF|LPW|PAW|N\d{3,4})[A-Z0-9./-]*)\b/i
    ) ||
    title.match(/\b([A-Z]{1,6}[- ]?\d{2,5}[A-Z0-9./-]*)\b/)
  if (m) {
    const tok = m[1].trim()
    if (!GENERIC.test(tok)) return tok
  }
  return sku || ""
}

function extractSpecs(p) {
  /** @type {Record<string, string>} */
  const specs = {}
  for (const a of p.attributes || []) {
    const name = decodeHtmlEntities(a.name || "").trim()
    const terms = (a.terms || [])
      .map((t) => decodeHtmlEntities(t.name || "").trim())
      .filter(Boolean)
    const value = terms.join(", ")
    if (name && value) specs[name] = value
  }
  return specs
}

function buildTechnicalDescription(shortRaw, title, brand, specs) {
  let text = String(shortRaw || "")
    .replace(/sobre este art[ií]culo[:\s]*/gi, "")
    .replace(/\s+/g, " ")
    .trim()
  const isTriplet = (text.match(/·/g) || []).length >= 2 && (text.match(/:/g) || []).length >= 2
  if (!text || isTriplet) {
    const typ = specs["Tipo de Dispositivo"] || specs["Tipo de Producto"] || ""
    if (typ) text = `${typ}. Producto ${brand || ""} para aplicaciones industriales.`.replace(/\s+/g, " ").trim()
    else text = truncate(title, 180)
  }
  // first 1–2 sentences
  const parts = text.split(/(?<=[.!?])\s+/).filter(Boolean)
  return truncate(text, 280)
}

function parsePrice(p) {
  const minor = Number(p.prices?.currency_minor_unit ?? 2)
  const raw = Number(p.prices?.price ?? 0)
  const price = Number.isFinite(raw) ? raw / Math.pow(10, minor) : 0
  const priceHtml = decodeHtmlEntities(p.price_html || "")
  const isPurchasable = Boolean(p.is_purchasable)
  const quote =
    price === 0 || !isPurchasable || /cotizaci[oó]n/i.test(priceHtml)
  return {
    price: quote ? 0 : price,
    priceMode: /** @type {"fixed"|"quote"} */ (quote ? "quote" : "fixed"),
    isPurchasable,
  }
}

function imageUrls(p) {
  const urls = []
  for (const img of p.images || []) {
    const src = img.src || img.thumbnail
    if (src && !urls.includes(src)) urls.push(src)
  }
  return urls
}

/**
 * @param {any} p
 * @returns {{ product: CnEtlProduct, unmapped: object | null }}
 */
function mapProduct(p) {
  const title = decodeHtmlEntities(p.name || "").trim()
  const brand = extractBrand(p)
  const categorySlugs = (p.categories || []).map((c) => c.slug)
  const categoryNames = (p.categories || []).map((c) => decodeHtmlEntities(c.name || ""))

  const mapped = mapWcToCnTaxonomy({
    title,
    brand,
    categorySlugs,
    categoryNames,
    sku: p.sku,
  })

  const { price, priceMode, isPurchasable } = parsePrice(p)
  const shortRaw = truncate(stripHtml(p.short_description || p.description || ""), 800)
  const sku = (p.sku || "").trim()
  const mfrModel = extractMfrModel(p, title)
  const specs = extractSpecs(p)

  /** @type {CnEtlProduct} */
  const product = {
    handle: p.slug || `product-${p.id}`,
    wcId: Number(p.id),
    title,
    brand,
    itemNumber: sku || `CN-${p.id}`,
    mfrModel: mfrModel || sku || `CN-${p.id}`,
    priceMode,
    price,
    currency: "PEN",
    shortDescription: shortRaw,
    technicalDescription: buildTechnicalDescription(shortRaw, title, brand, specs),
    descriptionHtml: sanitizeHtml(p.description || ""),
    categoryPath: mapped.categoryPath,
    categorySlug: mapped.categorySlug,
    images: imageUrls(p),
    inStock: Boolean(p.is_in_stock),
    isPurchasable,
    specs,
    rating: Number(p.average_rating || 0),
    reviewCount: Number(p.review_count || 0),
    permalink: p.permalink || "",
  }

  const unmapped =
    mapped.uncertain
      ? {
          wcId: product.wcId,
          handle: product.handle,
          title: product.title,
          brand: product.brand,
          wcCategories: categorySlugs,
          mappedTo: mapped.categoryPath,
          reason: mapped.reason || "uncertain",
          uncertain: true,
        }
      : null

  return { product, unmapped }
}

function recomputeTaxonomyCounts(products) {
  const counts = {
    total: products.length,
    byL1: {},
    byL2: {},
    tree: [],
  }

  for (const p of products) {
    const [l1, l2] = p.categoryPath
    counts.byL1[l1] = (counts.byL1[l1] || 0) + 1
    const l2key = `${l1}/${l2}`
    counts.byL2[l2key] = (counts.byL2[l2key] || 0) + 1
  }

  counts.tree = (CN_ROOT.children || []).map((l1) => ({
    slug: l1.slug,
    name: l1.name,
    productCount: counts.byL1[l1.slug] || 0,
    children: (l1.children || []).map((l2) => ({
      slug: l2.slug,
      name: l2.name,
      productCount: counts.byL2[`${l1.slug}/${l2.slug}`] || 0,
    })),
  }))

  return counts
}

async function fileExists(path) {
  try {
    await access(path, fsConstants.F_OK)
    return true
  } catch {
    return false
  }
}

function filenameFromUrl(url) {
  try {
    const u = new URL(url)
    let name = basename(u.pathname) || "image.jpg"
    name = decodeURIComponent(name)
    if (!extname(name)) name += ".jpg"
    // sanitize
    name = name.replace(/[^a-zA-Z0-9._-]/g, "_")
    return name
  } catch {
    return "image.jpg"
  }
}

async function downloadOne(url, destPath) {
  if (await fileExists(destPath)) return { skipped: true }
  const res = await fetch(url, { headers: { "User-Agent": UA } })
  if (!res.ok) throw new Error(`download ${res.status} ${url}`)
  await mkdir(dirname(destPath), { recursive: true })
  const body = res.body
  if (!body) throw new Error(`no body ${url}`)
  await pipeline(Readable.fromWeb(body), createWriteStream(destPath))
  return { skipped: false }
}

async function mapPool(items, concurrency, fn) {
  const results = new Array(items.length)
  let i = 0
  async function worker() {
    while (i < items.length) {
      const idx = i++
      results[idx] = await fn(items[idx], idx)
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, () => worker()))
  return results
}

async function downloadImages(products) {
  /** @type {{ url: string, dest: string, wcId: number, localPath: string }[]} */
  const jobs = []
  for (const p of products) {
    const dir = join(MEDIA_DIR, String(p.wcId))
    const localUrls = []
    for (const url of p.images) {
      const file = filenameFromUrl(url)
      const dest = join(dir, file)
      const localPath = `/cn-media/products/${p.wcId}/${file}`
      jobs.push({ url, dest, wcId: p.wcId, localPath })
      localUrls.push(localPath)
    }
    // rewrite paths up-front; failed downloads keep local path (file may be missing)
    p.images = localUrls.length ? localUrls : p.images
  }

  let downloaded = 0
  let skipped = 0
  let failed = 0

  console.log(`Downloading images: ${jobs.length} files, concurrency ${IMAGE_CONCURRENCY}`)
  await mapPool(jobs, IMAGE_CONCURRENCY, async (job) => {
    try {
      const r = await downloadOne(job.url, job.dest)
      if (r.skipped) skipped++
      else downloaded++
      if ((downloaded + skipped) % 25 === 0) {
        process.stdout.write(`  … ${downloaded} new, ${skipped} skipped, ${failed} failed\n`)
      }
    } catch (err) {
      failed++
      console.warn(`  ! ${job.wcId}: ${err.message}`)
    }
  })

  return { downloaded, skipped, failed, total: jobs.length }
}

async function main() {
  console.log("CN ETL — Control Nautas catalog")
  console.log(`DOWNLOAD_IMAGES=${DOWNLOAD_IMAGES ? "1" : "0"}`)

  await mkdir(DATA_DIR, { recursive: true })
  await mkdir(MEDIA_DIR, { recursive: true })

  const raw = await fetchAllProducts()
  console.log(`Fetched ${raw.length} products`)

  const products = []
  const unmapped = []
  const imageManifest = []

  for (const p of raw) {
    const { product, unmapped: um } = mapProduct(p)
    products.push(product)
    if (um) unmapped.push(um)
    imageManifest.push({ wcId: product.wcId, urls: [...product.images] })
  }

  // Stable sort by wcId
  products.sort((a, b) => a.wcId - b.wcId)
  imageManifest.sort((a, b) => a.wcId - b.wcId)
  unmapped.sort((a, b) => a.wcId - b.wcId)

  let imageStats = null
  if (DOWNLOAD_IMAGES) {
    imageStats = await downloadImages(products)
  }

  const taxonomyCounts = recomputeTaxonomyCounts(products)

  const productsPath = join(DATA_DIR, "products.json")
  const unmappedPath = join(DATA_DIR, "unmapped-report.json")
  const manifestPath = join(DATA_DIR, "image-manifest.json")
  const countsPath = join(DATA_DIR, "taxonomy-counts.json")

  await writeFile(productsPath, JSON.stringify(products, null, 2) + "\n")
  await writeFile(
    unmappedPath,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        count: unmapped.length,
        note: "Products mapped to otros or flagged uncertain — review manually",
        items: unmapped,
      },
      null,
      2
    ) + "\n"
  )
  await writeFile(manifestPath, JSON.stringify(imageManifest, null, 2) + "\n")
  await writeFile(
    countsPath,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        ...taxonomyCounts,
      },
      null,
      2
    ) + "\n"
  )

  const quote = products.filter((p) => p.priceMode === "quote").length
  const fixed = products.filter((p) => p.priceMode === "fixed").length

  console.log("\n—— Summary ——")
  console.log(`products:     ${products.length}`)
  console.log(`fixed price:  ${fixed}`)
  console.log(`quote:        ${quote}`)
  console.log(`unmapped:     ${unmapped.length}`)
  console.log(`L1 counts:    ${JSON.stringify(taxonomyCounts.byL1)}`)
  console.log(`wrote:        ${productsPath}`)
  console.log(`wrote:        ${unmappedPath}`)
  console.log(`wrote:        ${manifestPath}`)
  console.log(`wrote:        ${countsPath}`)
  if (imageStats) {
    console.log(
      `images:       downloaded=${imageStats.downloaded} skipped=${imageStats.skipped} failed=${imageStats.failed} total=${imageStats.total}`
    )
  } else {
    console.log("images:       remote URLs kept (set DOWNLOAD_IMAGES=1 to download)")
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
