"use client"

import { useMemo, useState } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import {
  formatPrice,
  getLeafSpecColumns,
  getAllBrands,
  PAGE_SIZE,
  useShellCart,
  type CnProduct,
} from "@lib/cn-catalog"

/**
 * Technical View for a homogeneous product-TYPE leaf.
 * Expand-on-select "ventanita" without leaving the list.
 */
export function TechnicalListing({
  products: initial,
  leafSlug,
}: {
  products: CnProduct[]
  leafSlug: string
}) {
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  const [quoteOnly, setQuoteOnly] = useState(false)
  const [sortOrder, setSortOrder] = useState("default")
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<string | null>(null)
  const { addItem } = useShellCart()
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)

  const brands = useMemo(() => getAllBrands(initial), [initial])

  const products = useMemo(() => {
    let list = [...initial]
    if (selectedBrands.length) {
      list = list.filter((p) => selectedBrands.includes(p.brand))
    }
    if (quoteOnly) list = list.filter((p) => p.priceMode === "quote")
    if (sortOrder === "price_asc") list.sort((a, b) => a.price - b.price)
    if (sortOrder === "price_desc") list.sort((a, b) => b.price - a.price)
    if (sortOrder === "name") list.sort((a, b) => a.title.localeCompare(b.title))
    return list
  }, [initial, selectedBrands, quoteOnly, sortOrder])

  const totalPages = Math.max(1, Math.ceil(products.length / PAGE_SIZE))
  const pageItems = products.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const specCols = getLeafSpecColumns(leafSlug, products, 6)
  const selectedProduct = products.find((p) => p.handle === selected) || null

  const toggleBrand = (brand: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    )
    setPage(1)
  }

  const onAdd = () => {
    if (!selectedProduct || selectedProduct.priceMode === "quote") return
    addItem({ handle: selectedProduct.handle, quantity: qty })
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <aside className="lg:w-[240px] flex-shrink-0 border border-[#CCCCCC] bg-white h-fit">
        <div className="py-3 px-4 border-b border-[#CCCCCC]">
          <label className="flex items-center gap-2 text-[13px] cursor-pointer">
            <input
              type="checkbox"
              checked={quoteOnly}
              onChange={(e) => {
                setQuoteOnly(e.target.checked)
                setPage(1)
              }}
            />
            Solo cotización
          </label>
        </div>
        <div className="py-3 px-4 border-b border-[#CCCCCC]">
          <h3 className="font-bold text-[14px] mb-2">Marca</h3>
          <p className="text-[11px] text-[#666] mb-2">
            Filtro — no agrupa el catálogo
          </p>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {brands.map((brand) => (
              <label key={brand} className="flex items-center text-[13px] cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedBrands.includes(brand)}
                  onChange={() => toggleBrand(brand)}
                  className="w-3.5 h-3.5"
                />
                <span className="pl-1.5">{brand}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="py-3 px-4">
          <h3 className="font-bold text-[14px] mb-2">Ordenar</h3>
          <select
            value={sortOrder}
            onChange={(e) => {
              setSortOrder(e.target.value)
              setPage(1)
            }}
            className="w-full border border-[#CCC] p-2 text-[13px]"
          >
            <option value="default">Destacados</option>
            <option value="name">Nombre A–Z</option>
            <option value="price_asc">Precio ↑</option>
            <option value="price_desc">Precio ↓</option>
          </select>
        </div>
      </aside>

      <div className="flex-1 min-w-0">
        <p className="text-[13px] text-[#666] mb-3">
          {products.length} productos · Vista técnica · haga clic en una fila para expandir
        </p>

        <div className="overflow-x-auto border border-[#CCCCCC]">
          <table className="w-full text-[12px] min-w-[720px]">
            <thead>
              <tr className="bg-[#F2F2F2] border-b border-[#CCCCCC] text-left">
                <th className="px-3 py-2 font-bold w-[70px]">Foto</th>
                {specCols.map((c) => (
                  <th key={c} className="px-3 py-2 font-bold whitespace-nowrap">
                    {c}
                  </th>
                ))}
                <th className="px-3 py-2 font-bold">Marca</th>
                <th className="px-3 py-2 font-bold">Ítem #</th>
                <th className="px-3 py-2 font-bold text-right">Precio</th>
              </tr>
            </thead>
            <tbody>
              {pageItems.map((p) => {
                const thumb =
                  p.images?.[0] ||
                  p.image ||
                  "/cn-media/categories/calefaccion-electrica.webp"
                return (
                  <tr
                    key={p.handle}
                    onClick={() =>
                      setSelected((prev) => (prev === p.handle ? null : p.handle))
                    }
                    className={`border-b border-[#EEEEEE] cursor-pointer ${
                      selected === p.handle ? "bg-[#FFF8E7]" : "hover:bg-[#FAFAFA]"
                    }`}
                  >
                    <td className="px-3 py-2">
                      <div className="w-10 h-10 border border-gray-200 bg-white flex items-center justify-center p-0.5">
                        <img
                          src={thumb}
                          alt=""
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                    </td>
                    {specCols.map((c) => (
                      <td key={c} className="px-3 py-2 text-[#444]">
                        {p.specs?.[c] || "————"}
                      </td>
                    ))}
                    <td className="px-3 py-2 font-semibold">{p.brand || "————"}</td>
                    <td className="px-3 py-2 font-bold text-[#0066CC]">
                      {p.itemNumber}
                    </td>
                    <td className="px-3 py-2 text-right font-bold text-[#1E7E34] whitespace-nowrap">
                      {formatPrice(p.price, p.priceMode)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-4">
            <button
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="border border-[#CCC] px-3 py-1.5 text-[13px] disabled:opacity-40"
            >
              Anterior
            </button>
            <span className="text-[13px] text-[#666]">
              {page} / {totalPages}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
              className="border border-[#CCC] px-3 py-1.5 text-[13px] disabled:opacity-40"
            >
              Siguiente
            </button>
          </div>
        )}

        {/* Ventanita expand-on-select */}
        {selectedProduct && (
          <div className="mt-4 border-2 border-[#CC0000] bg-white p-4 md:p-6 grid grid-cols-1 md:grid-cols-12 gap-6 shadow-sm">
            <div className="md:col-span-3 flex items-center justify-center border border-[#CCC] p-4 min-h-[140px]">
              <img
                src={selectedProduct.images?.[0] || selectedProduct.image}
                alt={selectedProduct.title}
                className="max-h-[140px] max-w-full object-contain"
              />
            </div>
            <div className="md:col-span-6">
              <div className="text-[11px] font-bold text-[#666] uppercase mb-1">
                {selectedProduct.brand}
              </div>
              <div className="text-[16px] font-bold text-[#333] mb-2 leading-snug">
                {selectedProduct.title}
              </div>
              <div className="text-[12px] text-[#666] flex flex-wrap gap-x-4 mb-3">
                <span>
                  Item{" "}
                  <b className="text-[#333]">#{selectedProduct.itemNumber}</b>
                </span>
                <span>
                  Modelo fab.{" "}
                  <b className="text-[#333]">#{selectedProduct.mfrModel}</b>
                </span>
              </div>
              <ul className="text-[12px] text-[#444] list-disc pl-4 space-y-0.5 mb-3">
                {Object.entries(selectedProduct.specs || {})
                  .slice(0, 6)
                  .map(([k, v]) => (
                    <li key={k}>
                      <b>{k}:</b> {v}
                    </li>
                  ))}
              </ul>
              <LocalizedClientLink
                href={`/products/${selectedProduct.handle}`}
                className="text-[#0066CC] text-[13px] font-bold hover:underline"
              >
                Ver ficha completa →
              </LocalizedClientLink>
            </div>
            <div className="md:col-span-3 flex flex-col gap-2 border-l border-[#EEE] pl-0 md:pl-4">
              <div className="text-[#1E7E34] font-bold text-[20px]">
                {formatPrice(selectedProduct.price, selectedProduct.priceMode)}
                {selectedProduct.priceMode === "fixed" && (
                  <span className="block text-[11px] text-[#666] font-normal">
                    / und.
                  </span>
                )}
              </div>
              <div
                className={`text-[12px] font-semibold ${
                  selectedProduct.availabilityMode === "in_stock" || (selectedProduct.inStock && !selectedProduct.availabilityMode)
                    ? "text-[#1E7E34]"
                    : selectedProduct.availabilityMode === "backorder"
                    ? "text-[#D97706]"
                    : selectedProduct.availabilityMode === "made_to_order"
                    ? "text-[#475569]"
                    : selectedProduct.inStock
                    ? "text-[#1E7E34]"
                    : "text-[#CC0000]"
                }`}
              >
                {selectedProduct.availabilityMode === "in_stock" || (selectedProduct.inStock && !selectedProduct.availabilityMode)
                  ? "● En stock"
                  : selectedProduct.availabilityMode === "backorder"
                  ? "● Disponible bajo pedido"
                  : selectedProduct.availabilityMode === "made_to_order"
                  ? "● Suministro a pedido"
                  : selectedProduct.inStock
                  ? "● En stock"
                  : "● Consultar disponibilidad"}
              </div>
              {selectedProduct.priceMode !== "quote" && (
                <div className="flex items-center gap-2">
                  <label className="text-[12px] font-bold">Cant.</label>
                  <input
                    type="number"
                    min={1}
                    value={qty}
                    onChange={(e) =>
                      setQty(Math.max(1, parseInt(e.target.value) || 1))
                    }
                    onClick={(e) => e.stopPropagation()}
                    className="w-16 border border-[#CCC] px-2 py-1 text-[13px]"
                  />
                </div>
              )}
              {selectedProduct.priceMode === "quote" ? (
                <a
                  href={`mailto:ventas@controlnautas.com?subject=${encodeURIComponent(
                    "Cotización " + selectedProduct.itemNumber
                  )}`}
                  className="bg-[#CC0000] text-white text-center font-bold text-[12px] px-3 py-2 uppercase"
                  onClick={(e) => e.stopPropagation()}
                >
                  Cotizar
                </a>
              ) : (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    onAdd()
                  }}
                  disabled={!selectedProduct.inStock}
                  className="bg-[#CC0000] disabled:bg-[#999] text-white font-bold text-[12px] px-3 py-2 uppercase"
                >
                  {added ? "Añadido ✓" : "Añadir al carrito"}
                </button>
              )}
              <button
                type="button"
                className="text-[12px] text-[#666] underline mt-1"
                onClick={(e) => {
                  e.stopPropagation()
                  setSelected(null)
                }}
              >
                Cerrar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
