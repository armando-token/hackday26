"use client"

import { useMemo, useState, useEffect, useRef, Fragment, type KeyboardEvent } from "react"
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
  FACET_OPTIONS_PREVIEW,
  type FacetSelection,
} from "@lib/catalog/catalog-facets"
import {
  getLeafSpecColumns,
  useShellCart,
  useShellLists,
  type CnProduct,
} from "@lib/cn-catalog"
import { calculatePricePerM2 } from "@modules/store/templates/leaf-category-listing"
import MobileToolbar from "@modules/store/components/mobile-toolbar"
import MobileFilterSheet from "@modules/store/components/mobile-filter-sheet"
import MobileSortSheet from "@modules/store/components/mobile-sort-sheet"
import MobileIndustrialProductCard from "@modules/store/components/mobile-industrial-product-card"

const FACET_OPTIONS_PREVIEW_SEARCH = FACET_OPTIONS_PREVIEW

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

export default function SearchResultsTemplate({
  query,
  sortBy,
  page,
  initialProducts = [],
}: {
  query: string
  sortBy?: string
  page?: string
  countryCode?: string
  initialProducts?: CatalogProduct[]
}) {
  const catalogProducts = initialProducts

  const [facetSel, setFacetSel] = useState<FacetSelection>({})
  const [searchWithin, setSearchWithin] = useState("")
  const [sortOrder, setSortOrder] = useState(sortBy || "default")
  const [openFacets, setOpenFacets] = useState<Record<string, boolean>>({
    brand: true,
  })
  const [showAllOpts, setShowAllOpts] = useState<Record<string, boolean>>({})

  // Desktop Table State
  const [expandedHandle, setExpandedHandle] = useState<string | null>(null)
  const [isAutoPeeking, setIsAutoPeeking] = useState(false)
  const autoPeekTimerRef = useRef<NodeJS.Timeout | null>(null)
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)
  const { addItem } = useShellCart()

  // Mobile State
  const [mobileDisplayLimit, setMobileDisplayLimit] = useState(50)
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false)
  const [isSortSheetOpen, setIsSortSheetOpen] = useState(false)

  const facets = useMemo(
    () => buildCatalogFacets(catalogProducts),
    [catalogProducts]
  )

  const onToggleFacet = (facetKey: string, value: string) => {
    setFacetSel((prev) => toggleFacetValue(prev, facetKey, value))
  }

  const clearFacets = () => {
    setFacetSel({})
    setSearchWithin("")
  }

  const clearOneFacetValue = (facetKey: string, value: string) => {
    setFacetSel((prev) => toggleFacetValue(prev, facetKey, value))
  }

  const filtered = useMemo(() => {
    let list = [...catalogProducts]

    // Search within results
    if (searchWithin.trim()) {
      const q = searchWithin.trim().toLowerCase()
      list = list.filter(
        (p) =>
          p.title?.toLowerCase().includes(q) ||
          p.brand?.name?.toLowerCase().includes(q) ||
          p.pim.itemNumber?.toLowerCase().includes(q) ||
          p.pim.mfrModel?.toLowerCase().includes(q)
      )
    }

    // Apply facet filters
    if (Object.keys(facetSel).length > 0) {
      list = list.filter((p) => catalogProductMatchesFacets(p, facetSel))
    }

    if (sortOrder === "price_asc")
      list.sort((a, b) => catalogPriceAmount(a) - catalogPriceAmount(b))
    if (sortOrder === "price_desc")
      list.sort((a, b) => catalogPriceAmount(b) - catalogPriceAmount(a))
    if (sortOrder === "name") list.sort((a, b) => a.title.localeCompare(b.title))

    return list
  }, [catalogProducts, facetSel, searchWithin, sortOrder])

  // Auto-Peek Onboarding for First-time visitors
  useEffect(() => {
    if (typeof window === "undefined") return
    try {
      const alreadySeen = localStorage.getItem("cn_table_peek_seen")
      if (!alreadySeen && filtered.length > 0) {
        const firstProd = filtered[0]
        if (firstProd) {
          autoPeekTimerRef.current = setTimeout(() => {
            setExpandedHandle(firstProd.handle)
            setIsAutoPeeking(true)
            localStorage.setItem("cn_table_peek_seen", "true")

            autoPeekTimerRef.current = setTimeout(() => {
              setExpandedHandle((curr) => (curr === firstProd.handle ? null : curr))
              setIsAutoPeeking(false)
            }, 3000)
          }, 1000)
        }
      }
    } catch (e) {}

    return () => {
      if (autoPeekTimerRef.current) clearTimeout(autoPeekTimerRef.current)
    }
  }, [filtered])

  // Mobile Items
  const mobileItems = filtered.slice(0, mobileDisplayLimit)

  // Spec columns for technical table
  const specCols = useMemo(
    () => getLeafSpecColumns("search-results", specShimForColumns(filtered), 4),
    [filtered]
  )

  const selectedProduct = useMemo(
    () => filtered.find((p) => p.handle === expandedHandle) || null,
    [filtered, expandedHandle]
  )

  const onAddFromExpanded = () => {
    if (!selectedProduct || selectedProduct.display.requiresQuote) return
    addItem(toShellCartLine(selectedProduct, qty))
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  const activeFiltersCount =
    Object.values(facetSel).reduce((acc, val) => acc + (val?.length || 0), 0) +
    (searchWithin.trim() ? 1 : 0)

  const appliedChips = useMemo(() => {
    const chips: { facetKey: string; value: string; label: string }[] = []
    if (searchWithin.trim()) {
      chips.push({
        facetKey: "search",
        value: searchWithin,
        label: `Search: "${searchWithin}"`,
      })
    }
    for (const [facetKey, values] of Object.entries(facetSel)) {
      if (!values?.length) continue
      const facet = facets.find((f) => f.key === facetKey)
      for (const value of values) {
        chips.push({
          facetKey,
          value,
          label: `${facet?.label || facetKey}: ${value}`,
        })
      }
    }
    return chips
  }, [facetSel, facets, searchWithin])

  const sortLabelMap: Record<string, string> = {
    default: "Relevancia",
    price_asc: "Price ↑",
    price_desc: "Price ↓",
    name: "A – Z",
  }

  const isFacetOpen = (key: string, idx: number) => {
    if (key in openFacets) return openFacets[key]
    return idx < 3
  }

  return (
    <div className="w-full bg-white font-[Arial,Helvetica,sans-serif] text-[#333] min-h-screen pb-16">
      <div className="max-w-[1440px] mx-auto px-3 sm:px-6 pt-4 sm:pt-6">
        {/* ========================================================================= */}
        {/* 1. DESKTOP VIEW (>= 769px) - STANDARD CONTROL NAUTAS TECHNICAL TABLE VIEW */}
        {/* ========================================================================= */}
        <div className="hidden md:flex flex-col lg:flex-row gap-8">
          {/* Left Sidebar Filter Column (260px) */}
          <aside className="lg:w-[260px] flex-shrink-0 border border-[#CCCCCC] bg-white h-fit lg:sticky lg:top-2">
            <div className="py-2.5 px-3 border-b border-[#CCCCCC] bg-[#F7F7F7] flex items-center justify-between">
              <h2 className="font-bold text-[14px]">Filtros</h2>
              {activeFiltersCount > 0 && (
                <button
                  type="button"
                  onClick={clearFacets}
                  className="text-[12px] text-[#0066CC] hover:underline cursor-pointer"
                >
                  Limpiar todo
                </button>
              )}
            </div>

            {/* Search within results */}
            <div className="py-3 px-3 border-b border-[#CCCCCC]">
              <label className="block text-[12px] font-bold text-[#666] mb-1">
                Search within results
              </label>
              <input
                type="search"
                value={searchWithin}
                onChange={(e) => setSearchWithin(e.target.value)}
                placeholder="Title, item #, or model"
                className="w-full border border-[#CCC] p-1.5 text-[13px]"
              />
            </div>

            {/* Applied Chips */}
            {appliedChips.length > 0 && (
              <div className="py-2.5 px-3 border-b border-[#CCCCCC] flex flex-wrap gap-1.5">
                {appliedChips.map((chip) => (
                  <button
                    key={`${chip.facetKey}:${chip.value}`}
                    type="button"
                    onClick={() => {
                      if (chip.facetKey === "search") setSearchWithin("")
                      else clearOneFacetValue(chip.facetKey, chip.value)
                    }}
                    className="inline-flex items-center gap-1 max-w-full bg-[#EEF5FC] text-[#0066CC] text-[11px] px-2 py-0.5 border border-[#B3D4F0] cursor-pointer"
                    title="Quitar filtro"
                  >
                    <span className="truncate">{chip.label}</span>
                    <span aria-hidden>×</span>
                  </button>
                ))}
              </div>
            )}

            {/* Sort Selector */}
            <div className="py-3 px-3 border-b border-[#CCCCCC]">
              <label className="block text-[12px] font-bold text-[#666] mb-1">
                Ordenar
              </label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="w-full border border-[#CCC] p-1.5 text-[13px]"
              >
                <option value="default">Technical relevance</option>
                <option value="name">Nombre A–Z</option>
                <option value="price_asc">Price: low to high</option>
                <option value="price_desc">Price: high to low</option>
              </select>
            </div>

            {/* Accordion Facets */}
            {facets.map((facet, idx) => {
              const open = isFacetOpen(facet.key, idx)
              const selected = facetSel[facet.key] || []
              const expandedOpts = showAllOpts[facet.key]
              const opts = expandedOpts
                ? facet.options
                : facet.options.slice(0, FACET_OPTIONS_PREVIEW_SEARCH)
              return (
                <div key={facet.key} className="border-b border-[#CCCCCC]">
                  <button
                    type="button"
                    className="w-full flex items-center justify-between px-3 py-2.5 text-left hover:bg-[#FAFAFA] cursor-pointer"
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
                        const checked = selected.includes(opt.value)
                        return (
                          <label
                            key={opt.value}
                            className="flex items-start gap-2 text-[12px] cursor-pointer leading-snug hover:text-[#0066CC]"
                          >
                            <input
                              type="checkbox"
                              className="mt-0.5 w-3.5 h-3.5 flex-shrink-0"
                              checked={checked}
                              onChange={() => onToggleFacet(facet.key, opt.value)}
                            />
                            <span className="text-[#333]">
                              {opt.value}{" "}
                              <span className="text-[#888]">({opt.count})</span>
                            </span>
                          </label>
                        )
                      })}
                      {facet.options.length > FACET_OPTIONS_PREVIEW_SEARCH && (
                        <button
                          type="button"
                          className="text-[12px] text-[#0066CC] hover:underline mt-1 cursor-pointer"
                          onClick={() =>
                            setShowAllOpts((prev) => ({
                              ...prev,
                              [facet.key]: !expandedOpts,
                            }))
                          }
                        >
                          {expandedOpts
                            ? "Ver menos"
                            : `Show more (${facet.options.length - FACET_OPTIONS_PREVIEW_SEARCH})`}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </aside>

          {/* Right Main Table Content */}
          <div className="flex-1 min-w-0">
            <h1 className="text-[24px] font-bold text-[#333] mb-1">
              {query ? `Search results for “${query}”` : "Product Catalog"}
            </h1>
            <p className="text-[13px] text-[#666] mb-4">
              Mostrando <b className="text-[#333]">{filtered.length}</b> productos · Haga clic en cualquier fila para expandir opciones de pedido
            </p>

            {filtered.length === 0 ? (
              <div className="py-12 text-center bg-gray-50 border border-gray-200">
                <p className="text-[16px] font-bold text-[#333] mb-1">
                  No se encontraron productos para “{query}”.
                </p>
                <p className="text-[13px] text-[#666]">
                  Try checking the spelling or using a broader keyword.
                </p>
              </div>
            ) : (
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
                        <th className="px-2 py-2.5 font-bold w-[34px] text-center"></th>
                        <th className="px-2 py-2.5 font-bold w-[65px]">Foto</th>
                        <th className="px-3 py-2.5 font-bold">Marca</th>
                        <th className="px-3 py-2.5 font-bold min-w-[220px]">Description / Model</th>
                        {specCols.map((c) => (
                          <th key={c} className="px-3 py-2.5 font-bold whitespace-nowrap">
                            {c}
                          </th>
                        ))}
                        <th className="px-3 py-2.5 font-bold">Item #</th>
                        <th className="px-3 py-2.5 font-bold text-right">Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((p) => {
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
                              onClick={() => {
                                if (autoPeekTimerRef.current) {
                                  clearTimeout(autoPeekTimerRef.current)
                                  autoPeekTimerRef.current = null
                                }
                                setIsAutoPeeking(false)
                                try {
                                  localStorage.setItem("cn_table_peek_seen", "true")
                                } catch (e) {}
                                setExpandedHandle((prev) =>
                                  prev === p.handle ? null : p.handle
                                )
                              }}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                  e.preventDefault()
                                  setExpandedHandle((prev) =>
                                    prev === p.handle ? null : p.handle
                                  )
                                }
                              }}
                              className={`border-b border-[#EEEEEE] cursor-pointer group transition-colors ${
                                open ? "bg-[#FFF8E7] border-l-4 border-l-[#CC0000]" : "hover:bg-[#F9FBFC]"
                              }`}
                            >
                              {/* Visual Chevron / Expansion Signifier */}
                              <td className="px-2 py-2 text-center align-middle">
                                <span
                                  className={`inline-flex items-center justify-center w-5 h-5 rounded-xs text-[10px] font-bold transition-all shadow-2xs ${
                                    open
                                      ? "bg-[#CC0000] text-white"
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
                            <td className="px-3 py-2 font-bold text-[#333]">
                              {p.brand?.name || "————"}
                            </td>
                            <td className="px-3 py-2 font-medium text-[#333]">
                              <div className="line-clamp-2 leading-snug">{p.title}</div>
                              {p.pim.mfrModel && (
                                <div className="text-[11px] text-[#666] font-normal mt-0.5">
                                  Mod. {p.pim.mfrModel}
                                </div>
                              )}
                            </td>
                            {specCols.map((c) => (
                              <td key={c} className="px-3 py-2 text-[#444]">
                                {getCatalogSpecValue(p, c) || "————"}
                              </td>
                            ))}
                            <td className="px-3 py-2 text-[#666] font-mono text-[11px]">
                              #{p.pim.itemNumber ?? ""}
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

                          {/* Desktop Expandable Row Panel */}
                          {open && selectedProduct?.handle === p.handle && (
                            <tr className="bg-white">
                              <td
                                colSpan={specCols.length + 6}
                                className="p-0 border-b-2 border-[#CC0000]"
                              >
                                <DesktopExpandedRowPanel
                                  product={selectedProduct}
                                  qty={qty}
                                  setQty={setQty}
                                  onAdd={onAddFromExpanded}
                                  added={added}
                                  onClose={() => setExpandedHandle(null)}
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
              </div>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. MOBILE VIEW (<= 768px) - UNIFIED AMAZON B2B HIGH-DENSITY EXPERIENCE    */}
        {/* ========================================================================= */}
        <div className="block md:hidden w-full -mx-3">
          <div className="px-3 pb-2">
            <h1 className="text-[18px] font-bold text-[#0F1111] mb-0.5">
              {query ? `Resultados para “${query}”` : "Product Search"}
            </h1>
            <p className="text-[12px] text-[#666]">
              {filtered.length} productos encontrados
            </p>
          </div>

          {/* Mobile Sticky Toolbar (Filter, Sort, Count) */}
          <MobileToolbar
            onOpenFilter={() => setIsFilterSheetOpen(true)}
            onOpenSort={() => setIsSortSheetOpen(true)}
            activeFilterCount={activeFiltersCount}
            currentSortLabel={sortLabelMap[sortOrder] || "Relevancia"}
            totalCount={filtered.length}
          />

          {/* Active Filters Dismissable Pills */}
          {appliedChips.length > 0 && (
            <div className="p-2.5 bg-[#F4F6F8] border-b border-[#E5E5E5] flex flex-wrap gap-1.5 items-center">
              <span className="text-[11px] font-bold text-[#565959]">Filtros:</span>
              {appliedChips.map((chip) => (
                <button
                  key={`${chip.facetKey}:${chip.value}`}
                  type="button"
                  onClick={() => {
                    if (chip.facetKey === "search") setSearchWithin("")
                    else clearOneFacetValue(chip.facetKey, chip.value)
                  }}
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

          {/* Mobile High-Density Product Stream */}
          <div className="w-full bg-white divide-y divide-[#E5E5E5]">
            {mobileItems.map((p) => (
              <MobileIndustrialProductCard key={p.handle} product={p} />
            ))}

            {/* Empty State */}
            {filtered.length === 0 && (
              <div className="py-12 px-4 text-center">
                <div className="text-3xl mb-2">🔍</div>
                <h3 className="text-[15px] font-bold text-[#0F1111] mb-1">
                  No se encontraron productos para “{query}”
                </h3>
                <p className="text-[13px] text-[#565959] mb-4">
                  Try checking the spelling or clearing applied filters.
                </p>
                {activeFiltersCount > 0 && (
                  <button
                    type="button"
                    onClick={clearFacets}
                    className="px-5 py-2 bg-[#FFD814] hover:bg-[#F7CA00] border border-[#FCD200] rounded-full text-[13px] font-bold text-[#0F1111] cursor-pointer"
                  >
                    Restablecer filtros
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Load More Button for Mobile (when results > 50) */}
          {filtered.length > mobileDisplayLimit && (
            <div className="p-4 text-center bg-gray-50 border-t border-[#E5E5E5]">
              <p className="text-[12px] text-[#666] mb-2">
                Mostrando {mobileDisplayLimit} de {filtered.length} productos
              </p>
              <button
                type="button"
                onClick={() => setMobileDisplayLimit((prev) => prev + 50)}
                className="w-full py-2.5 bg-white border border-[#0066CC] text-[#0066CC] rounded-full text-[13px] font-bold shadow-2xs hover:bg-blue-50 active:bg-blue-100 transition-colors cursor-pointer"
              >
                Show more products ({filtered.length - mobileDisplayLimit} remaining) ↓
              </button>
            </div>
          )}

          {/* Mobile Bottom Sheets */}
          <MobileFilterSheet
            isOpen={isFilterSheetOpen}
            onClose={() => setIsFilterSheetOpen(false)}
            facets={facets}
            facetSel={facetSel}
            onToggleFacet={onToggleFacet}
            onClearAll={clearFacets}
            totalResults={filtered.length}
          />

          <MobileSortSheet
            isOpen={isSortSheetOpen}
            onClose={() => setIsSortSheetOpen(false)}
            currentSort={sortOrder}
            onSelectSort={setSortOrder}
          />
        </div>
      </div>
    </div>
  )
}

/**
 * Desktop Expandable Row Panel (Exact same as leaf-category-listing.tsx)
 */
function DesktopExpandedRowPanel({
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
  const { list, toggleList } = useShellLists()
  const onList = list.includes(product.handle)
  const [imgIdx, setImgIdx] = useState(0)

  const gallery = getCatalogImageUrls(product)
  const images = gallery.length
    ? gallery
    : product.thumbnail
    ? [product.thumbnail]
    : ["/cn-media/categories/calefaccion-electrica.webp"]

  const productUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/products/${product.handle}`
      : `/products/${product.handle}`

  const mailtoHref = `mailto:ventas@controlnautas.com?subject=${encodeURIComponent(
    `Quote: ${product.title} (Item #${product.pim.itemNumber ?? ""})`
  )}&body=${encodeURIComponent(
    [
      `Hola Control Nautas,`,
      `Please quote the following product:`,
      `Product: ${product.title}`,
      `Marca: ${product.brand?.name ?? ""}`,
      `Modelo Fab.: ${product.pim.mfrModel ?? ""}`,
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
            <span><b>Quick View demo:</b> Click any table row to expand or hide the datasheet and quote.</span>
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
            className="bg-[#CC0000] disabled:bg-[#999] text-white font-bold text-[12px] px-3 py-2 uppercase cursor-pointer"
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
          className="text-[12px] text-[#666] underline mt-1 text-left cursor-pointer"
          onClick={onClose}
        >
          Cerrar
        </button>
      </div>
      </div>
    </div>
  )
}
