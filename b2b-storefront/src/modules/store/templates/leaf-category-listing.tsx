"use client"

import {
  Fragment,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import type { CatalogProduct } from "@lib/catalog/catalog-types"
import {
  getCatalogImageUrls,
  getCatalogSpecValue,
  getCatalogShortDescription,
  toShellCartLine,
} from "@lib/catalog/catalog-present"
import {
  buildCatalogFacets,
  catalogProductMatchesFacets,
  toggleFacetValue,
  facetValueLabel,
  FACET_OPTIONS_PREVIEW,
  type FacetSelection,
} from "@lib/catalog/catalog-facets"
import {
  getLeafSpecColumns,
  leafImage,
  PAGE_SIZE,
  type CnProduct,
  useShellCart,
  useShellLists,
} from "@lib/cn-catalog"

function specShimForColumns(products: CatalogProduct[]): CnProduct[] {
  return products.map(
    (p) =>
      ({
        specs: p.pim.specs,
        brand: p.brand?.name ?? "",
        mfrModel: p.pim.mfrModel ?? "",
        itemNumber: p.pim.itemNumber ?? "",
      }) as CnProduct
  )
}

function catalogPriceAmount(product: CatalogProduct): number {
  return product.display.price?.amount ?? 0
}
import MobileToolbar from "@modules/store/components/mobile-toolbar"
import MobileFilterSheet from "@modules/store/components/mobile-filter-sheet"
import MobileSortSheet from "@modules/store/components/mobile-sort-sheet"
import MobileSubcatChips from "@modules/store/components/mobile-subcat-chips"
import MobileIndustrialProductCard from "@modules/store/components/mobile-industrial-product-card"

export type ProductCollectionData = {
  id: string
  slug: string
  title: string
  description: string
  imageUrl: string
  products: CatalogProduct[]
}

const AREA_CATEGORIES = new Set([
  "paneles-lana-roca",
  "mantas-canuelas",
  "paneles-sandwich",
  "espuma-elastomerica",
  "suelo-radiante",
])

export function calculatePricePerM2(product: CatalogProduct): string | null {
  const price = catalogPriceAmount(product)
  if (product.display.requiresQuote || !price) return null
  const cat = product.leafCategory.handle || ""
  const title = (product.title || "").toLowerCase()
  const handle = (product.handle || "").toLowerCase()

  // 1. ÁREA (/ m²): Lana de roca, paneles sándwich, mantas, mallas radiantes
  const isAreaProduct =
    (AREA_CATEGORIES.has(cat) ||
      /lana de roca|manta de lana|panel sandwich|panel sándwich|malla radiante|panel frigorífico|panel para sala blanca|panel de fachada|panel de cubierta/.test(
        title
      )) &&
    !/accesorio|tornillo|cinta|soporte|termostato|controlador|sensor|disco|gabinete/.test(
      title
    )

  if (isAreaProduct) {
    const areaSpec =
      getCatalogSpecValue(product, "Área Calefaccionada") ||
      getCatalogSpecValue(product, "Dimensiones") ||
      getCatalogSpecValue(product, "Dimensiones Panel") ||
      ""

    const mArea = (areaSpec + " " + title).match(/(\d+(?:\.\d+)?)\s*m²/i)
    if (mArea) {
      const a = parseFloat(mArea[1])
      if (a > 0) return `S/ ${(price / a).toFixed(2)} / m²`
    }

    const mDims = areaSpec.match(
      /(\d+(?:\.\d+)?)\s*(?:m|mm)?\s*[x×]\s*(\d+(?:\.\d+)?)\s*(?:m|mm)?/i
    )
    if (mDims) {
      let w = parseFloat(mDims[1])
      let h = parseFloat(mDims[2])
      if (w > 20) w /= 1000.0
      if (h > 20) h /= 1000.0
      const a = w * h
      if (a >= 0.1 && a <= 50.0) {
        return `S/ ${(price / a).toFixed(2)} / m²`
      }
    }

    if (cat === "paneles-lana-roca" || title.includes("panel")) {
      return `S/ ${(price / 0.72).toFixed(2)} / m²`
    }
    if (title.includes("manta") || cat === "mantas-canuelas") {
      return `S/ ${(price / 7.2).toFixed(2)} / m²`
    }
    return `S/ ${price.toFixed(2)} / m²`
  }

  // 2. LONGITUD LINEAL (/ m): Cables calefactores, heat tracing, trazado térmico
  const isLinearProduct =
    (title.includes("cable") ||
      title.includes("heat tracing") ||
      title.includes("trazado") ||
      title.includes("autorregulable") ||
      handle.includes("cable")) &&
    !/calefactor king|controlador|termostato|sensor|transmisor|disco|gabinete|módulo|panel|unidad|convector/.test(
      title
    )

  if (isLinearProduct) {
    const lenSpec = getCatalogSpecValue(product, "Longitud") || ""
    const mLen = (lenSpec + " " + title).match(/(\d+(?:\.\d+)?)\s*m(?:etros?)?\b/i)
    if (mLen) {
      const l = parseFloat(mLen[1])
      if (l > 1.0) {
        return `S/ ${(price / l).toFixed(2)} / m`
      }
    }
    return `S/ ${price.toFixed(2)} / m`
  }

  // 3. PRODUCTOS DISCRETOS / EQUIPOS (Sensores, Transmisores, Controladores PID, PLCs, etc.) -> NULL
  return null
}

/**
 * Technical last-level (leaf) PLP:
 * count → description → group carousel → N× (H2 + img|desc + model table + expand-on-select)
 * Left rail = category-specific facets (not a universal Brand-only box).
 */
export function LeafCategoryListing({
  collections: allCollections,
  categoryDescription,
}: {
  collections: ProductCollectionData[]
  categoryDescription?: string
}) {
  const [hiddenGroups, setHiddenGroups] = useState<string[]>([])
  const [facetSel, setFacetSel] = useState<FacetSelection>({})
  const [openFacets, setOpenFacets] = useState<Record<string, boolean>>({})
  const [showAllOpts, setShowAllOpts] = useState<Record<string, boolean>>({})
  const [sortOrder, setSortOrder] = useState("default")
  const [searchWithin, setSearchWithin] = useState("")
  const [expanded, setExpanded] = useState<{
    collectionId: string
    handle: string
  } | null>(null)
  const [isAutoPeeking, setIsAutoPeeking] = useState(false)
  const autoPeekTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Auto-Peek Onboarding Cue (1st time visitor educational hint)
  useEffect(() => {
    if (typeof window === "undefined") return
    try {
      const alreadySeen = localStorage.getItem("cn_table_peek_seen")
      if (!alreadySeen && allCollections.length > 0 && allCollections[0].products.length > 0) {
        const firstCol = allCollections[0]
        const firstProd = firstCol.products[0]
        if (firstProd) {
          autoPeekTimerRef.current = setTimeout(() => {
            setExpanded({ collectionId: firstCol.id, handle: firstProd.handle })
            setIsAutoPeeking(true)
            localStorage.setItem("cn_table_peek_seen", "true")

            autoPeekTimerRef.current = setTimeout(() => {
              setExpanded((curr) => (curr?.handle === firstProd.handle ? null : curr))
              setIsAutoPeeking(false)
            }, 3000)
          }, 1000)
        }
      }
    } catch (e) {}

    return () => {
      if (autoPeekTimerRef.current) clearTimeout(autoPeekTimerRef.current)
    }
  }, [allCollections])
  const { addItem } = useShellCart()
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)

  // Mobile-Dedicated State
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false)
  const [isSortSheetOpen, setIsSortSheetOpen] = useState(false)
  const [selectedSubcatChip, setSelectedSubcatChip] = useState<string | null>(null)

  const allProducts = useMemo(
    () => allCollections.flatMap((c) => c.products),
    [allCollections]
  )

  const subcatChipItems = useMemo(() => {
    return allCollections.map((c) => ({
      id: c.id,
      title: c.title,
      count: c.products.length,
      imageUrl:
        c.imageUrl ||
        leafImage(c.slug) ||
        c.products[0]?.thumbnail ||
        getCatalogImageUrls(c.products[0])[0] ||
        "",
    }))
  }, [allCollections])

  const facets = useMemo(
    () =>
      buildCatalogFacets(allProducts, {
        includeGroupFacet:
          allCollections.length > 1
            ? allCollections.map((c) => ({
                id: c.id,
                title: c.title,
                count: c.products.length,
              }))
            : undefined,
        leafSlug:
          allCollections.length === 1 ? allCollections[0].slug : undefined,
      }),
    [allProducts, allCollections]
  )

  // Default: first 4 facet accordions open
  const isFacetOpen = (key: string, idx: number) => {
    if (key in openFacets) return openFacets[key]
    return idx < 4
  }

  const collections = useMemo(() => {
    const groupFilter = facetSel.group
    const q = searchWithin.trim().toLowerCase()
    return allCollections
      .filter((c) => {
        if (hiddenGroups.includes(c.id)) return false
        if (groupFilter?.length && !groupFilter.includes(c.id)) return false
        return true
      })
      .map((c) => {
        let list = c.products.filter((p) =>
          catalogProductMatchesFacets(p, facetSel, c.id)
        )
        if (q) {
          list = list.filter((p) => {
            const hay = `${p.title} ${p.pim.itemNumber ?? ""} ${p.pim.mfrModel ?? ""}`.toLowerCase()
            return hay.includes(q)
          })
        }
        if (sortOrder === "price_asc")
          list.sort((a, b) => catalogPriceAmount(a) - catalogPriceAmount(b))
        if (sortOrder === "price_desc")
          list.sort((a, b) => catalogPriceAmount(b) - catalogPriceAmount(a))
        if (sortOrder === "name")
          list.sort((a, b) => a.title.localeCompare(b.title))
        return { ...c, products: list }
      })
      .filter((c) => c.products.length > 0)
  }, [allCollections, hiddenGroups, facetSel, sortOrder, searchWithin])

  const mobileCollections = useMemo(() => {
    if (selectedSubcatChip) {
      return collections.filter((c) => c.id === selectedSubcatChip)
    }
    return collections
  }, [collections, selectedSubcatChip])

  const mobileFlatProducts = useMemo(() => {
    return mobileCollections.flatMap((c) => c.products)
  }, [mobileCollections])

  const sortLabelMap: Record<string, string> = {
    default: "Destacados",
    price_asc: "Price ↑",
    price_desc: "Price ↓",
    name: "A – Z",
  }

  const visibleCount = collections.reduce((n, c) => n + c.products.length, 0)
  const hasFilters =
    Object.keys(facetSel).length > 0 ||
    hiddenGroups.length > 0 ||
    searchWithin.trim().length > 0

  const appliedChips = useMemo(() => {
    const chips: { facetKey: string; value: string; label: string }[] = []
    for (const [facetKey, values] of Object.entries(facetSel)) {
      if (!values?.length) continue
      const facet = facets.find((f) => f.key === facetKey)
      for (const value of values) {
        const label =
          facetKey === "group"
            ? allCollections.find((c) => c.id === value)?.title || value
            : facetValueLabel(facetKey, value)
        chips.push({
          facetKey,
          value,
          label: `${facet?.label || facetKey}: ${label}`,
        })
      }
    }
    return chips
  }, [facetSel, facets, allCollections])

  const toggleGroup = (id: string) => {
    setHiddenGroups((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  const onToggleFacet = (facetKey: string, value: string) => {
    setFacetSel((prev) => toggleFacetValue(prev, facetKey, value))
  }

  const clearFacets = () => {
    setFacetSel({})
    setHiddenGroups([])
    setSearchWithin("")
  }

  const clearOneFacetValue = (facetKey: string, value: string) => {
    setFacetSel((prev) => toggleFacetValue(prev, facetKey, value))
  }

  const selectedProduct = useMemo(() => {
    if (!expanded) return null
    const col = allCollections.find((c) => c.id === expanded.collectionId)
    return col?.products.find((p) => p.handle === expanded.handle) || null
  }, [expanded, allCollections])

  const onAdd = () => {
    if (!selectedProduct || selectedProduct.display.requiresQuote) return
    addItem(toShellCartLine(selectedProduct, qty))
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <div className="w-full font-[Arial,Helvetica,sans-serif]">
      {/* 1. DESKTOP VIEW (>= 769px) - 100% INTACT & UNCHANGED */}
      <div className="hidden md:flex flex-col lg:flex-row gap-8">
        <aside className="lg:w-[260px] flex-shrink-0 border border-[#CCCCCC] bg-white h-fit lg:sticky lg:top-2">
        <div className="py-2.5 px-3 border-b border-[#CCCCCC] bg-[#F7F7F7] flex items-center justify-between">
          <h2 className="font-bold text-[14px]">Filtros</h2>
          {hasFilters && (
            <button
              type="button"
              onClick={clearFacets}
              className="text-[12px] text-[#0066CC] hover:underline"
            >
              Limpiar todo
            </button>
          )}
        </div>

        <div className="py-3 px-3 border-b border-[#CCCCCC]">
          <label className="block text-[12px] font-bold text-[#666] mb-1">
            Search within results
          </label>
          <input
            type="search"
            value={searchWithin}
            onChange={(e) => setSearchWithin(e.target.value)}
            placeholder="Título, Item # o fab."
            className="w-full border border-[#CCC] p-1.5 text-[13px]"
          />
        </div>

        {appliedChips.length > 0 && (
          <div className="py-2.5 px-3 border-b border-[#CCCCCC] flex flex-wrap gap-1.5">
            {appliedChips.map((chip) => (
              <button
                key={`${chip.facetKey}:${chip.value}`}
                type="button"
                onClick={() => clearOneFacetValue(chip.facetKey, chip.value)}
                className="inline-flex items-center gap-1 max-w-full bg-[#EEF5FC] text-[#0066CC] text-[11px] px-2 py-0.5 border border-[#B3D4F0]"
                title="Quitar filtro"
              >
                <span className="truncate">{chip.label}</span>
                <span aria-hidden>×</span>
              </button>
            ))}
          </div>
        )}

        <div className="py-3 px-3 border-b border-[#CCCCCC]">
          <label className="block text-[12px] font-bold text-[#666] mb-1">
            Ordenar
          </label>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="w-full border border-[#CCC] p-1.5 text-[13px]"
          >
            <option value="default">Destacados</option>
            <option value="name">Nombre A–Z</option>
            <option value="price_asc">Price: low to high</option>
            <option value="price_desc">Price: high to low</option>
          </select>
        </div>

        {facets.map((facet, idx) => {
          const open = isFacetOpen(facet.key, idx)
          const selected = facetSel[facet.key] || []
          const expandedOpts = showAllOpts[facet.key]
          const opts = expandedOpts
            ? facet.options
            : facet.options.slice(0, FACET_OPTIONS_PREVIEW)
          return (
            <div key={facet.key} className="border-b border-[#CCCCCC]">
              <button
                type="button"
                className="w-full flex items-center justify-between px-3 py-2.5 text-left hover:bg-[#FAFAFA]"
                onClick={() =>
                  setOpenFacets((prev) => ({
                    ...prev,
                    [facet.key]: !open,
                  }))
                }
                aria-expanded={open}
              >
                <span className="font-bold text-[13px] text-[#333]">
                  {facet.label}
                  {selected.length > 0 && (
                    <span className="ml-1 text-[#0066CC] font-normal">
                      ({selected.length})
                    </span>
                  )}
                </span>
                <span className="text-[#666] text-[12px]">
                  {open ? "▾" : "▸"}
                </span>
              </button>
              {open && (
                <div className="px-3 pb-3 space-y-1.5 max-h-56 overflow-y-auto">
                  {opts.map((opt) => {
                    const label =
                      facet.key === "group"
                        ? allCollections.find((c) => c.id === opt.value)
                            ?.title || opt.value
                        : facetValueLabel(facet.key, opt.value)
                    const checked = selected.includes(opt.value)
                    return (
                      <label
                        key={opt.value}
                        className="flex items-start gap-2 text-[12px] cursor-pointer leading-snug"
                      >
                        <input
                          type="checkbox"
                          className="mt-0.5 w-3.5 h-3.5 flex-shrink-0"
                          checked={checked}
                          onChange={() => onToggleFacet(facet.key, opt.value)}
                        />
                        <span className="text-[#333]">
                          {label}{" "}
                          <span className="text-[#888]">({opt.count})</span>
                        </span>
                      </label>
                    )
                  })}
                  {facet.options.length > FACET_OPTIONS_PREVIEW && (
                    <button
                      type="button"
                      className="text-[12px] text-[#0066CC] hover:underline mt-1"
                      onClick={() =>
                        setShowAllOpts((prev) => ({
                          ...prev,
                          [facet.key]: !expandedOpts,
                        }))
                      }
                    >
                      {expandedOpts
                        ? "Ver menos"
                        : `Show more (${facet.options.length - FACET_OPTIONS_PREVIEW})`}
                    </button>
                  )}
                </div>
              )}
            </div>
          )
        })}

        {facets.length === 0 && (
          <p className="text-[12px] text-[#666] p-3">
            Aún no hay filtros de atributos para este conjunto.
          </p>
        )}
      </aside>

      <div className="flex-1 min-w-0">
        {categoryDescription && (
          <p className="text-[13px] text-[#333] mb-4 max-w-3xl">
            {categoryDescription}
          </p>
        )}

        {/* Product group carousel */}
        {allCollections.length > 1 && (
          <ProductGroupCarousel
            allCollections={allCollections}
            hiddenGroups={hiddenGroups}
            toggleGroup={toggleGroup}
          />
        )}

        {/* Dynamic Category Quick Filters */}
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="text-[12px] font-bold text-[#666] uppercase tracking-wide mr-1">
            Filtro Rápido:
          </span>
          {(collections.some(c => /sensores-transmisores|temperatura-termopar-rtd|transmisores-temperatura|humedad-temperatura|presion-proceso|gases-co2|accesorios-sensores/i.test(c.slug || "")) ? [
            { label: "Todos", val: "" },
            { label: "Temperatura (TC / RTD)", val: "Temperatura" },
            { label: "Humedad y Clima", val: "Humedad" },
            { label: "Presión y Melt", val: "Presión" },
            { label: "Nivel Hidrostático", val: "Nivel" },
            { label: "Transmisores 4-20mA / HART", val: "Transmisor" },
          ] : collections.some(c => /monitoreo-data-center|unidades-monitoreo|sensores-ambientales|deteccion-fugas|monitoreo-energia|monitoreo-condicion-telik|monitoreo-inalambrico-climate/i.test(c.slug || "")) ? [
            { label: "Todos", val: "" },
            { label: "Data Center", val: "Center" },
            { label: "Salas de Servidores / Edge", val: "Servidores" },
            { label: "Industria / Predictivo", val: "Predictivo" },
            { label: "Almacenes / Pharma", val: "Pharma" },
            { label: "Telecom / BTS", val: "Telecom" },
          ] : collections.some(c => /control-e-indicacion|controladores-pid|termostatos-industriales|indicadores-proceso|reles-ssr/i.test(c.slug || "")) ? [
            { label: "Todos", val: "" },
            { label: "Control PID", val: "PID" },
            { label: "Termostatos / ON-OFF", val: "Termostato" },
            { label: "Indicadores", val: "Indicador" },
            { label: "Relés SSR", val: "SSR" },
            { label: "Control de Potencia", val: "Potencia" },
          ] : collections.some(c => /comunicacion|gateways|inalambrica|interfaces/i.test(c.slug || "")) ? [
            { label: "Todos", val: "" },
            { label: "Gateways IoT / 4G", val: "4G" },
            { label: "Convertidores de Protocolo", val: "Protocolo" },
            { label: "Wireless / LoRa", val: "LoRa" },
            { label: "Interfaces de Bus", val: "Bus" },
          ] : collections.some(c => /calefaccion|pared|portatiles|unit-heaters|zocalo|radiante|ducto|cartuchos|bandas|strips|tambor|inmersion|termostatos/i.test(c.slug || "")) ? [
            { label: "Todos", val: "" },
            { label: "Calefacción de Ambientes", val: "Ambientes" },
            { label: "HVAC / Aire", val: "HVAC" },
            { label: "Proceso Industrial", val: "Proceso" },
            { label: "Áreas Peligrosas", val: "Peligrosas" },
            { label: "Controles", val: "Control" },
          ] : collections.some(c => /trazado|cable|techos|deshielo|suelo|accesorios/i.test(c.slug || "")) ? [
            { label: "Todos", val: "" },
            { label: "Protección Anticongelamiento", val: "Protección" },
            { label: "Mantenimiento de Proceso", val: "Proceso" },
            { label: "Deshielo Exterior", val: "Deshielo" },
            { label: "Confort de Piso", val: "Piso" },
            { label: "Áreas Peligrosas", val: "Peligrosas" },
          ] : collections.some(c => /logger|frio|cadena|gateway/i.test(c.slug || "")) ? [
            { label: "Todos", val: "" },
            { label: "Cadena de Frío", val: "cadena" },
            { label: "Industriales", val: "industrial" },
            { label: "Tiempo Real / IoT", val: "Tiempo Real" },
          ] : collections.some(c => /plc|hmi|controlador|expansion/i.test(c.slug || "")) ? [
            { label: "Todos", val: "" },
            { label: "PLC + HMI Todo en Uno", val: "PLC + HMI" },
            { label: "PLC sin Pantalla", val: "RCC" },
            { label: "Módulos E/S", val: "E/S" },
            { label: "Gateways / Bus", val: "Modbus" },
          ] : collections.some(c => /otros|sustratos-hidroponicos|ventiladores-alta-velocidad|accesorios-ventilacion|cultivo-hidroponico|ventilacion/i.test(c.slug || "")) ? [
            { label: "Todos", val: "" },
            { label: "Sustratos Hidropónicos", val: "sustrat" },
            { label: "Ventiladores de Alta Velocidad", val: "ventilador" },
            { label: "Accesorios de Ventilación", val: "accesorio" },
          ] : [
            { label: "Todas", val: "" },
            { label: "Muros y Tabiques", val: "Muros y tabiques" },
            { label: "Fachadas y Cubiertas", val: "Fachadas y cubiertas" },
            { label: "Industrial / Alta T°", val: "Industrial" },
            { label: "Salas Blancas / Higiene", val: "Salas blancas" },
          ]).map((app) => {
            const active = app.val === "" 
              ? !facetSel["Aplicación"]?.length && !searchWithin
              : (facetSel["Aplicación"]?.includes(app.val) || searchWithin.toLowerCase().includes(app.val.toLowerCase()))
            return (
              <button
                key={app.label}
                type="button"
                onClick={() => {
                  if (app.val === "") {
                    clearFacets()
                  } else {
                    setSearchWithin(app.val)
                  }
                }}
                className={`px-3 py-1 text-[12px] font-semibold border rounded-none transition-colors ${
                  active
                    ? "bg-[#0066CC] text-white border-[#0066CC]"
                    : "bg-white text-[#333] border-[#CCCCCC] hover:bg-[#F2F2F2]"
                }`}
              >
                {app.label}
              </button>
            )
          })}
        </div>

        <p className="text-[13px] text-[#666] mb-4">
          Mostrando <b className="text-[#333]">{visibleCount}</b> productos
          {hasFilters ? " (filtrados)" : ""}
        </p>

        {/* Stacked collections: image + description + model lines */}
        {collections.map((col) => (
          <ProductCollection
            key={col.id}
            collection={col}
            expandedHandle={
              expanded?.collectionId === col.id ? expanded.handle : null
            }
            onToggleRow={(handle) => {
              if (autoPeekTimerRef.current) {
                clearTimeout(autoPeekTimerRef.current)
                autoPeekTimerRef.current = null
              }
              setIsAutoPeeking(false)
              try {
                localStorage.setItem("cn_table_peek_seen", "true")
              } catch (e) {}
              setExpanded((prev) =>
                prev?.collectionId === col.id && prev.handle === handle
                  ? null
                  : { collectionId: col.id, handle }
              )
              setQty(1)
            }}
            isAutoPeeking={isAutoPeeking && expanded?.collectionId === col.id}
            selectedProduct={
              expanded?.collectionId === col.id ? selectedProduct : null
            }
            qty={qty}
            setQty={setQty}
            onAdd={onAdd}
            added={added}
            onClose={() => setExpanded(null)}
          />
        ))}

        {collections.length === 0 && (
          <p className="text-[14px] text-[#666] py-8">
            Ningún producto coincide con los filtros.
          </p>
        )}

        <p className="text-[11px] text-[#666] mt-8 border-t border-[#EEE] pt-4">
          Availability y precios del catálogo Control Nautas. Haga clic en una fila para ver detalles sin salir de la página.
        </p>
      </div>
    </div>

    {/* ========================================================================= */}
    {/* 2. MOBILE VIEW (<= 768px) - AMAZON B2B INDUSTRIAL HIGH-DENSITY EXPERIENCE */}
    {/* ========================================================================= */}
    <div className="block md:hidden w-full">
      {/* Subcategory selection chips (horizontal scrolling pills) */}
      {allCollections.length > 1 && (
        <MobileSubcatChips
          items={subcatChipItems}
          selectedGroup={selectedSubcatChip}
          onSelectGroup={setSelectedSubcatChip}
          totalCount={allProducts.length}
        />
      )}

      {/* Mobile Sticky Toolbar (Filter, Sort, Count) */}
      <MobileToolbar
        onOpenFilter={() => setIsFilterSheetOpen(true)}
        onOpenSort={() => setIsSortSheetOpen(true)}
        activeFilterCount={
          Object.values(facetSel).reduce((a, b) => a + (b?.length || 0), 0) +
          (selectedSubcatChip ? 1 : 0)
        }
        currentSortLabel={sortLabelMap[sortOrder] || "Destacados"}
        totalCount={mobileFlatProducts.length}
      />

      {/* Active Filters Dismissable Pills */}
      {appliedChips.length > 0 && (
        <div className="p-2.5 bg-[#F4F6F8] border-b border-[#E5E5E5] flex flex-wrap gap-1.5 items-center">
          <span className="text-[11px] font-bold text-[#565959]">Filtros:</span>
          {appliedChips.map((chip) => (
            <button
              key={`${chip.facetKey}:${chip.value}`}
              type="button"
              onClick={() => clearOneFacetValue(chip.facetKey, chip.value)}
              className="inline-flex items-center gap-1.5 bg-white text-[#0066CC] border border-[#B3D4F0] rounded-full text-[11px] font-semibold px-2.5 py-0.5 shadow-2xs cursor-pointer"
            >
              <span>{chip.label}</span>
              <span className="text-gray-400 font-bold">✕</span>
            </button>
          ))}
          <button
            type="button"
            onClick={clearFacets}
            className="text-[11px] text-[#0066CC] hover:underline font-bold ml-1 cursor-pointer"
          >
            Limpiar
          </button>
        </div>
      )}

      {/* Mobile Products List: High-density 2-column flex cards */}
      <div className="w-full bg-white divide-y divide-[#E5E5E5]">
        {mobileCollections.map((col) => (
          <div key={col.id} className="w-full">
            {/* If viewing all collections, show a clean subtle subcategory divider that scrolls naturally */}
            {allCollections.length > 1 && !selectedSubcatChip && (
              <div className="bg-[#F8F9FA] px-3.5 py-2.5 border-b border-t border-[#E5E5E5] flex items-center justify-between">
                <h2 className="text-[13px] font-bold text-[#0F1111] truncate">
                  {col.title}
                </h2>
                <span className="text-[11.5px] text-[#565959] font-medium">
                  {col.products.length} {col.products.length === 1 ? "item" : "items"}
                </span>
              </div>
            )}

            {/* Product Cards */}
            {col.products.map((p) => (
              <MobileIndustrialProductCard
                key={p.handle}
                product={p}
                calculatePricePerM2={calculatePricePerM2}
              />
            ))}
          </div>
        ))}

        {/* Empty State */}
        {mobileFlatProducts.length === 0 && (
          <div className="py-12 px-4 text-center">
            <div className="text-3xl mb-2">🔍</div>
            <h3 className="text-[15px] font-bold text-[#0F1111] mb-1">
              No se encontraron productos coincidentes
            </h3>
            <p className="text-[13px] text-[#565959] mb-4">
              Intente borrar los filtros o buscar con otro término técnico.
            </p>
            <button
              type="button"
              onClick={clearFacets}
              className="px-5 py-2 bg-[#FFD814] hover:bg-[#F7CA00] border border-[#FCD200] rounded-full text-[13px] font-bold text-[#0F1111] cursor-pointer"
            >
              Restablecer todos los filtros
            </button>
          </div>
        )}
      </div>

      {/* Mobile Bottom Sheets */}
      <MobileFilterSheet
        isOpen={isFilterSheetOpen}
        onClose={() => setIsFilterSheetOpen(false)}
        facets={facets}
        facetSel={facetSel}
        onToggleFacet={onToggleFacet}
        onClearAll={clearFacets}
        totalResults={mobileFlatProducts.length}
        allCollections={allCollections}
      />

      <MobileSortSheet
        isOpen={isSortSheetOpen}
        onClose={() => setIsSortSheetOpen(false)}
        currentSort={sortOrder}
        onSelectSort={setSortOrder}
      />
    </div>
  </div>
  )
}

function ProductCollection({
  collection,
  expandedHandle,
  onToggleRow,
  selectedProduct,
  qty,
  setQty,
  onAdd,
  added,
  onClose,
  isAutoPeeking,
}: {
  collection: ProductCollectionData
  expandedHandle: string | null
  onToggleRow: (handle: string) => void
  selectedProduct: CatalogProduct | null
  qty: number
  setQty: (n: number) => void
  onAdd: () => void
  added: boolean
  onClose: () => void
  isAutoPeeking?: boolean
}) {
  const products = collection.products
  const stacks = useMemo(
    () => groupIntoStacks(collection.slug, products),
    [collection.slug, products]
  )
  const image =
    collection.imageUrl ||
    leafImage(collection.slug) ||
    products[0]?.thumbnail ||
    getCatalogImageUrls(products[0])[0] ||
    ""

  return (
    <section className="mb-12" data-collection={collection.id}>
      <h2 className="text-[20px] font-bold text-[#333] mb-3">
        {collection.title}
      </h2>

      {/* Collection header: 72px image left + short description right */}
      <div className="flex gap-4 items-start mb-4 pb-4 border-b border-[#DDDDDD]">
        <div className="w-[72px] h-[72px] flex-shrink-0 border border-[#CCCCCC] bg-white flex items-center justify-center p-1">
          <img
            src={image}
            alt=""
            className="max-w-full max-h-full object-contain"
          />
        </div>
        <p className="text-[13px] text-[#444] leading-snug max-w-3xl pt-1">
          {collection.description ||
            `Consulte modelos y especificaciones de ${collection.title}. Select una fila para ver imágenes y opciones de pedido.`}
        </p>
      </div>

      {stacks.map((stack) => (
        <div key={stack.key} className="mb-6">
          {stack.title && (
            <h3 className="text-[14px] font-bold text-[#333] mb-2 pt-3 border-t border-dashed border-[#CCCCCC]">
              {stack.title}
            </h3>
          )}
          <ModelTable
            leafSlug={collection.slug}
            products={stack.products}
            expandedHandle={expandedHandle}
            onToggleRow={onToggleRow}
            selectedProduct={selectedProduct}
            qty={qty}
            setQty={setQty}
            onAdd={onAdd}
            added={added}
            onClose={onClose}
            isAutoPeeking={isAutoPeeking}
          />
        </div>
      ))}
    </section>
  )
}

function isNonTechnicalStackKey(key: string): boolean {
  return /garant[ií]a|warranty/i.test(key)
}

function groupIntoStacks(
  leafSlug: string,
  products: CatalogProduct[]
): { key: string; title?: string; products: CatalogProduct[] }[] {
  if (products.length < 8) {
    return [{ key: "all", products }]
  }
  const cols = getLeafSpecColumns(leafSlug, specShimForColumns(products), 1)
  const key = cols[0]
  if (!key || isNonTechnicalStackKey(key)) {
    return [{ key: "all", products }]
  }

  const buckets = new Map<string, CatalogProduct[]>()
  for (const p of products) {
    const v = (getCatalogSpecValue(p, key) || "Sin especificar").trim() || "Sin especificar"
    if (!buckets.has(v)) buckets.set(v, [])
    buckets.get(v)!.push(p)
  }
  if (buckets.size < 2 || buckets.size > 8) {
    return [{ key: "all", products }]
  }
  return [...buckets.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([val, list]) => ({
      key: `${key}-${val}`,
      title: `${key}: ${val}`,
      products: list,
    }))
}

type SortKey = string // spec col name | "brand" | "price"
type SortDir = "asc" | "desc"

function ModelTable({
  leafSlug,
  products,
  expandedHandle,
  onToggleRow,
  selectedProduct,
  qty,
  setQty,
  onAdd,
  added,
  onClose,
  isAutoPeeking,
}: {
  leafSlug: string
  products: CatalogProduct[]
  expandedHandle: string | null
  onToggleRow: (handle: string) => void
  selectedProduct: CatalogProduct | null
  qty: number
  setQty: (n: number) => void
  onAdd: () => void
  added: boolean
  onClose: () => void
  isAutoPeeking?: boolean
}) {
  const specCols = getLeafSpecColumns(leafSlug, specShimForColumns(products), 6)
  const [page, setPage] = useState(1)
  const [sortKey, setSortKey] = useState<SortKey | null>(null)
  const [sortDir, setSortDir] = useState<SortDir>("asc")

  useEffect(() => {
    setPage(1)
  }, [products])

  const sorted = useMemo(() => {
    if (!sortKey) return products
    const dir = sortDir === "asc" ? 1 : -1
    return [...products].sort((a, b) => {
      if (sortKey === "brand") {
        return dir * (a.brand?.name ?? "").localeCompare(b.brand?.name ?? "")
      }
      if (sortKey === "price") {
        return dir * (catalogPriceAmount(a) - catalogPriceAmount(b))
      }
      const av = getCatalogSpecValue(a, sortKey) || ""
      const bv = getCatalogSpecValue(b, sortKey) || ""
      return dir * av.localeCompare(bv, undefined, { numeric: true })
    })
  }, [products, sortKey, sortDir])

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const show = sorted.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  const onHeaderClick = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    } else {
      setSortKey(key)
      setSortDir("asc")
    }
    setPage(1)
  }

  const sortMark = (key: SortKey) => {
    if (sortKey !== key) return ""
    return sortDir === "asc" ? " ▲" : " ▼"
  }

  const toggleRow = (handle: string) => onToggleRow(handle)

  const onRowKeyDown = (e: KeyboardEvent<HTMLTableRowElement>, handle: string) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      toggleRow(handle)
    }
  }

  return (
    <div className="border border-[#CCCCCC] bg-white">
      {/* Interactive Guidance Bar */}
      <div className="bg-[#EEF5FC] border-b border-[#D0DFEF] px-3 py-2 flex items-center justify-between text-[12px] text-[#0066CC]">
        <div className="flex items-center gap-2 font-semibold">
          <span className="text-[14px]">💡</span>
          <span><b>Quick View:</b> Click any row to expand the datasheet, high-res photos, and quote without leaving the page.</span>
        </div>
        <span className="text-[11px] text-[#666] font-normal hidden md:inline">
          [ 👆 Clic en fila = Abrir / Cerrar ]
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-[12px] min-w-[720px]">
          <thead>
            <tr className="bg-[#F2F2F2] border-b border-[#CCCCCC] text-left">
              <th className="px-2 py-2 font-bold w-[34px] text-center"></th>
              <th className="px-2 py-2 font-bold w-[65px]">Foto</th>
              {specCols.map((c) => (
                <th key={c} className="px-3 py-2 font-bold whitespace-nowrap">
                  <button
                    type="button"
                    className="font-bold hover:underline cursor-pointer"
                    onClick={() => onHeaderClick(c)}
                  >
                    {c}
                    {sortMark(c)}
                  </button>
                </th>
              ))}
              <th className="px-3 py-2 font-bold">
                <button
                  type="button"
                  className="font-bold hover:underline cursor-pointer"
                  onClick={() => onHeaderClick("brand")}
                >
                  Marca
                  {sortMark("brand")}
                </button>
              </th>
              <th className="px-3 py-2 font-bold text-right">
                <button
                  type="button"
                  className="font-bold hover:underline cursor-pointer"
                  onClick={() => onHeaderClick("price")}
                >
                  Price
                  {sortMark("price")}
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {show.map((p) => {
              const open = expandedHandle === p.handle
              const thumb =
                p.thumbnail ||
                getCatalogImageUrls(p)[0] ||
                "/cn-media/categories/calefaccion-electrica.webp"
              return (
                <Fragment key={p.handle}>
                  <tr
                    tabIndex={0}
                    aria-expanded={open}
                    onClick={() => toggleRow(p.handle)}
                    onKeyDown={(e) => onRowKeyDown(e, p.handle)}
                    className={`border-b border-[#EEEEEE] cursor-pointer group transition-colors ${
                      open ? "bg-[#FFF8E7] border-l-4 border-l-[#CC0000]" : "hover:bg-[#F9FBFC]"
                    }`}
                  >
                    {/* Visual Chevron / Expansion Signifier */}
                    <td className="px-2 py-2 text-center align-middle">
                      <span
                        className={`inline-flex items-center justify-center w-5 h-5 rounded-xs text-[10px] font-bold transition-all shadow-2xs ${
                          open
                            ? "bg-[#CC0000] text-white rotate-0"
                            : "bg-[#EAEAEA] text-[#555] group-hover:bg-[#0066CC] group-hover:text-white"
                        }`}
                        title={open ? "Close details" : "Click for technical details"}
                      >
                        {open ? "▼" : "▶"}
                      </span>
                    </td>
                    <td className="px-2 py-2">
                      <div className="w-10 h-10 border border-gray-200 bg-white flex items-center justify-center p-0.5 relative group-hover:border-[#0066CC] transition-colors">
                        <img
                          src={thumb}
                          alt=""
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                    </td>
                  {specCols.map((c) => (
                    <td key={c} className="px-3 py-2 text-[#444]">
                      {getCatalogSpecValue(p, c) || "————"}
                    </td>
                  ))}
                  <td className="px-3 py-2 font-semibold">
                    {p.brand?.name || "————"}
                  </td>
                  <td className="px-3 py-2 text-right font-bold text-[#1E7E34] whitespace-nowrap">
                    <div>{p.display.priceLabel}</div>
                    {calculatePricePerM2(p) && (
                      <div className="text-[10px] text-[#666] font-normal">
                        {calculatePricePerM2(p)}
                      </div>
                    )}
                    {p.display.availability === "in_stock" ? (
                      <span className="text-[10px] font-semibold text-[#1E7E34] block mt-0.5">
                        ✓ Entrega Inmediata
                      </span>
                    ) : p.display.availability === "backorder" ? (
                      <span className="text-[10px] font-semibold text-[#D97706] block mt-0.5">
                        ⏳ Available on request
                      </span>
                    ) : p.display.availability === "made_to_order" ? (
                      <span className="text-[10px] font-semibold text-[#475569] block mt-0.5">
                        ⚙️ Suministro a pedido
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold text-[#555555] block mt-0.5">
                        ⏳ Import lead time
                      </span>
                    )}
                  </td>
                </tr>
                {open && selectedProduct?.handle === p.handle && (
                  <tr className="bg-white">
                    <td
                      colSpan={specCols.length + 4}
                      className="p-0 border-b-2 border-[#CC0000]"
                    >
                      <ExpandedRowPanel
                        product={selectedProduct}
                        qty={qty}
                        setQty={setQty}
                        onAdd={onAdd}
                        added={added}
                        onClose={onClose}
                        isAutoPeeking={isAutoPeeking}
                      />
                    </td>
                  </tr>
                )}
              </Fragment>
            )
          })}
        </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-2 px-3 py-2 bg-[#FAFAFA] border-t border-[#EEEEEE]">
          <span className="text-[12px] text-[#666]">
            {(safePage - 1) * PAGE_SIZE + 1}–
            {Math.min(safePage * PAGE_SIZE, sorted.length)} de {sorted.length}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={safePage <= 1}
              onClick={() => setPage(safePage - 1)}
              className="border border-[#CCC] px-3 py-1 text-[12px] disabled:opacity-40"
            >
              Anterior
            </button>
            <span className="text-[12px] text-[#666]">
              {safePage} / {totalPages}
            </span>
            <button
              type="button"
              disabled={safePage >= totalPages}
              onClick={() => setPage(safePage + 1)}
              className="border border-[#CCC] px-3 py-1 text-[12px] disabled:opacity-40"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function ExpandedRowPanel({
  product,
  qty,
  setQty,
  onAdd,
  added,
  onClose,
  isAutoPeeking,
}: {
  product: CatalogProduct
  qty: number
  setQty: (n: number) => void
  onAdd: () => void
  added: boolean
  onClose: () => void
  isAutoPeeking?: boolean
}) {
  const [imgIdx, setImgIdx] = useState(0)
  const { compare, list, toggleCompare, toggleList } = useShellLists()
  const gallery = getCatalogImageUrls(product)
  const fallbackGallery = product.thumbnail ? [product.thumbnail] : []
  const images = gallery.length ? gallery : fallbackGallery

  useEffect(() => {
    setImgIdx(0)
  }, [product.handle])

  const onCompare = compare.includes(product.handle)
  const onList = list.includes(product.handle)
  const productUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/products/${product.handle}`
      : `/products/${product.handle}`

  const mailtoHref = `mailto:ventas@controlnautas.com?subject=${encodeURIComponent(
    "Quote " + (product.pim.itemNumber ?? "")
  )}&body=${encodeURIComponent(
    [
      "Solicito quote:",
      product.title,
      `Item #${product.pim.itemNumber ?? ""}`,
      `Quantity: ${qty}`,
      `URL: ${productUrl}`,
    ].join("\n")
  )}`

  return (
    <div onClick={(e) => e.stopPropagation()}>
      {isAutoPeeking && (
        <div className="bg-[#FFF3CD] border-b border-[#FFEAA7] px-4 py-2 text-[12px] font-bold text-[#856404] flex items-center justify-between animate-pulse">
          <span className="flex items-center gap-2">
            <span className="text-[15px]">👆</span>
            <span><b>Demostración de Quick View:</b> Click any table row to expand or hide the datasheet and quote.</span>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="text-[11px] underline text-[#856404] hover:text-[#533f03]"
          >
            Entendido ✕
          </button>
        </div>
      )}
      <div className="p-4 md:p-5 grid grid-cols-1 md:grid-cols-12 gap-5">
      <div className="md:col-span-3">
        <div className="border border-[#CCC] p-3 min-h-[120px] flex items-center justify-center bg-white">
          <img
            src={images[imgIdx] || images[0]}
            alt={product.title}
            className="max-h-[140px] max-w-full object-contain"
          />
        </div>
        {images.length > 1 && (
          <div className="flex gap-1 mt-2 overflow-x-auto">
            {images.slice(0, 5).map((src, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setImgIdx(i)}
                className={`w-10 h-10 border flex-shrink-0 p-0.5 ${
                  i === imgIdx ? "border-[#CC0000]" : "border-[#CCC]"
                }`}
              >
                <img
                  src={src}
                  alt=""
                  className="w-full h-full object-contain"
                />
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="md:col-span-6">
        <div className="text-[11px] font-bold text-[#666] uppercase mb-1">
          {product.brand?.name}
        </div>
        <div className="text-[16px] font-bold text-[#333] mb-2 leading-snug">
          {product.title}
        </div>
        <p className="text-[12px] text-[#555] mb-3 leading-snug">
          {getCatalogShortDescription(product)}
        </p>
        <div className="text-[12px] text-[#666] flex flex-wrap gap-x-4 mb-3">
          <span>
            Item <b className="text-[#333]">#{product.pim.itemNumber ?? ""}</b>
          </span>
          <span>
            Modelo fab. <b className="text-[#333]">#{product.pim.mfrModel ?? ""}</b>
          </span>
        </div>
        <ul className="text-[12px] text-[#444] list-disc pl-4 space-y-0.5 mb-3">
          {Object.entries(product.pim.specs || {})
            .slice(0, 6)
            .map(([k, v]) => (
              <li key={k}>
                <b>{k}:</b> {v}
              </li>
            ))}
        </ul>
        <LocalizedClientLink
          href={`/products/${product.handle}`}
          className="text-[#0066CC] text-[13px] font-bold hover:underline"
        >
          Ver ficha completa →
        </LocalizedClientLink>
      </div>
      <div className="md:col-span-3 flex flex-col gap-2 border-l-0 md:border-l border-[#EEE] md:pl-4">
        <div className="text-[#1E7E34] font-bold text-[20px]">
          {product.display.priceLabel}
          {!product.display.requiresQuote && (
            <span className="block text-[11px] text-[#666] font-normal">
              / und.
            </span>
          )}
        </div>
        <div
          className={`text-[12px] font-semibold ${
            product.display.availability === "in_stock"
              ? "text-[#1E7E34]"
              : product.display.availability === "backorder"
              ? "text-[#D97706]"
              : product.display.availability === "made_to_order"
              ? "text-[#475569]"
              : "text-[#CC0000]"
          }`}
        >
          {product.display.availability === "in_stock"
            ? "● En stock"
            : product.display.availability === "backorder"
            ? "● Available on request"
            : product.display.availability === "made_to_order"
            ? "● Suministro a pedido"
            : "● Consultar availability"}
        </div>
        {!product.display.requiresQuote && (
          <div className="flex items-center gap-2">
            <label className="text-[12px] font-bold">Qty</label>
            <input
              type="number"
              min={1}
              value={qty}
              onChange={(e) =>
                setQty(Math.max(1, parseInt(e.target.value) || 1))
              }
              className="w-16 border border-[#CCC] px-2 py-1 text-[13px]"
            />
          </div>
        )}
        {product.display.requiresQuote ? (
          <a
            href={mailtoHref}
            className="bg-[#CC0000] text-white text-center font-bold text-[12px] px-3 py-2 uppercase"
          >
            Quote
          </a>
        ) : (
          <button
            type="button"
            onClick={onAdd}
            disabled={product.display.availability !== "in_stock"}
            className="bg-[#CC0000] disabled:bg-[#999] text-white font-bold text-[12px] px-3 py-2 uppercase"
          >
            {added ? "Added ✓" : "Add to cart"}
          </button>
        )}
        <button
          type="button"
          onClick={() => toggleList(product.handle)}
          className="border border-[#333] text-[#333] font-bold text-[12px] px-3 py-1.5 bg-white hover:bg-gray-50 cursor-pointer"
        >
          {onList ? "✓ On list" : "Add to list"}
        </button>
        <button
          type="button"
          className="text-[12px] text-[#666] underline mt-1 text-left"
          onClick={onClose}
        >
          Cerrar
        </button>
      </div>
      </div>
    </div>
  )
}

/** Build collection blocks from L1 children (all leaves) or a single leaf. */
export function buildCollectionsFromChildren(
  children: {
    slug: string
    name: string
    description?: string
    imageUrl?: string
  }[],
  getProducts: (slug: string) => CatalogProduct[]
): ProductCollectionData[] {
  return children
    .map((child, idx) => {
      const products = getProducts(child.slug)
      const img =
        child.imageUrl ||
        leafImage(child.slug, idx) ||
        products[0]?.thumbnail ||
        getCatalogImageUrls(products[0])[0] ||
        ""
      return {
        id: child.slug,
        slug: child.slug,
        title: child.name,
        description: child.description || "",
        imageUrl: img,
        products,
      }
    })
    .filter((c) => c.products.length > 0)
}

export function buildSingleCollection(
  leaf: {
    slug: string
    name: string
    description?: string
    imageUrl?: string
  },
  products: CatalogProduct[]
): ProductCollectionData[] {
  return [
    {
      id: leaf.slug,
      slug: leaf.slug,
      title: leaf.name,
      description: leaf.description || "",
      imageUrl:
        leaf.imageUrl ||
        leafImage(leaf.slug) ||
        products[0]?.thumbnail ||
        getCatalogImageUrls(products[0])[0] ||
        "",
      products,
    },
  ]
}

function ProductGroupCarousel({
  allCollections,
  hiddenGroups,
  toggleGroup,
}: {
  allCollections: ProductCollectionData[]
  hiddenGroups: string[]
  toggleGroup: (id: string) => void
}) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const checkScroll = () => {
    if (!scrollRef.current) return
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
    setCanScrollLeft(scrollLeft > 5)
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5)
  }

  useEffect(() => {
    checkScroll()
    window.addEventListener("resize", checkScroll)
    return () => window.removeEventListener("resize", checkScroll)
  }, [allCollections.length])

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return
    const offset = direction === "left" ? -420 : 420
    scrollRef.current.scrollBy({ left: offset, behavior: "smooth" })
  }

  return (
    <div className="mb-8 border border-[#CCCCCC] bg-[#FAFAFA] p-3 select-none">
      <div className="flex items-center justify-between mb-2">
        <div className="text-[12px] font-bold text-[#666] uppercase tracking-wide">
          Grupos de productos ({allCollections.length})
        </div>
        <div className="text-[11px] text-[#666] italic">
          Haz clic para filtrar o mostrar grupos
        </div>
      </div>

      <div className="relative group">
        {/* Left Scroll Arrow Button */}
        <button
          type="button"
          onClick={() => scroll("left")}
          disabled={!canScrollLeft}
          className={`absolute left-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white border border-[#CCCCCC] shadow-lg flex items-center justify-center text-black font-bold text-2xl transition-all ${
            canScrollLeft ? "hover:bg-gray-100 opacity-90 group-hover:opacity-100 cursor-pointer" : "opacity-30 cursor-not-allowed"
          }`}
          aria-label="Anterior grupo"
        >
          ‹
        </button>

        {/* Right Scroll Arrow Button */}
        <button
          type="button"
          onClick={() => scroll("right")}
          disabled={!canScrollRight}
          className={`absolute right-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white border border-[#CCCCCC] shadow-lg flex items-center justify-center text-black font-bold text-2xl transition-all ${
            canScrollRight ? "hover:bg-gray-100 opacity-90 group-hover:opacity-100 cursor-pointer" : "opacity-30 cursor-not-allowed"
          }`}
          aria-label="Siguiente grupo"
        >
          ›
        </button>

        {/* Scrollable Container */}
        <div
          ref={scrollRef}
          onScroll={checkScroll}
          className="flex gap-3 overflow-x-auto pb-2 pt-1 px-1 scroll-smooth scrollbar-none mx-6"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {allCollections.map((g) => {
            const on = !hiddenGroups.includes(g.id)
            return (
              <div
                key={g.id}
                onClick={() => toggleGroup(g.id)}
                className={`flex-shrink-0 w-[145px] h-[145px] cursor-pointer border relative p-2.5 text-center flex flex-col justify-between transition-all rounded-none ${
                  on
                    ? "border-2 border-[#0066CC] bg-white shadow-sm"
                    : "border border-[#D1D5DB] bg-[#F9FAFB] opacity-60"
                }`}
              >
                {/* Top Right Square Checkbox Indicator */}
                <div className="absolute top-2 right-2 z-10">
                  {on ? (
                    <div className="w-5 h-5 rounded-none bg-[#0066CC] border border-[#0066CC] text-white flex items-center justify-center text-[12px] font-bold shadow-sm">
                      ✓
                    </div>
                  ) : (
                    <div className="w-5 h-5 rounded-none border-2 border-[#9CA3AF] bg-white hover:border-[#0066CC] transition-colors" />
                  )}
                </div>

                {/* Product Image */}
                <div className="h-[64px] w-full flex items-center justify-center mt-1 mb-1">
                  <img
                    src={g.imageUrl}
                    alt={g.title}
                    className={`max-h-full max-w-full object-contain transition-all ${
                      on ? "opacity-100" : "opacity-40 grayscale"
                    }`}
                  />
                </div>

                {/* Group Title */}
                <span
                  className={`text-[11px] leading-tight line-clamp-2 transition-colors ${
                    on ? "text-[#0066CC] font-bold" : "text-[#4B5563] font-normal"
                  }`}
                >
                  {g.title}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
