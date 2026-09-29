"use client"

import React, { useState, useEffect, useRef, useCallback } from "react"
import { useRouter, useParams } from "next/navigation"
import Image from "next/image"

type CategoryOption = { name: string; slug: string }

type TypeaheadHit = {
  handle: string
  title: string
  brand: string
  itemNumber: string | null
  image: string
  priceLabel: string
  categorySlug: string
}

/**
 * Normaliza cadenas de texto eliminando tildes y caracteres diacríticos (Unicode NFKD).
 */
function normalizeText(text: string): string {
  if (!text) return ""
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
}

/**
 * Resalta en negrita las partes del texto que coinciden con la búsqueda
 */
function HighlightedText({ text, query }: { text: string; query: string }) {
  if (!query || !text) return <span>{text}</span>
  const nText = normalizeText(text)
  const nQuery = normalizeText(query)
  const idx = nText.indexOf(nQuery)
  if (idx === -1) return <span>{text}</span>

  return (
    <span>
      {text.slice(0, idx)}
      <strong className="text-[#131921] font-black bg-yellow-100 px-0.5 rounded">
        {text.slice(idx, idx + query.length)}
      </strong>
      {text.slice(idx + query.length)}
    </span>
  )
}

export default function SearchBar({
  className = "h-[40px]",
  showCategorySelector = true,
  categoryFamilies = [],
}: {
  className?: string
  showCategorySelector?: boolean
  categoryFamilies?: CategoryOption[]
}) {
  const router = useRouter()
  const params = useParams()
  const countryCode = params?.countryCode || "pe"
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategorySlug, setSelectedCategorySlug] = useState("all")
  const [isFocused, setIsFocused] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const formRef = useRef<HTMLFormElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const categories = [
    { name: "All Categories", slug: "all" },
    ...[...categoryFamilies].sort((a, b) => a.name.localeCompare(b.name, "en")),
  ]

  const selectedCategoryName =
    categories.find((c) => c.slug === selectedCategorySlug)?.name || "Todas"

  const [typeaheadResults, setTypeaheadResults] = useState<TypeaheadHit[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    const q = searchQuery.trim()
    if (q.length < 2) {
      setTypeaheadResults([])
      setTotalCount(0)
      return
    }

    const timer = setTimeout(() => {
      abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current = controller

      fetch(
        `/api/catalog/search?q=${encodeURIComponent(q)}&countryCode=${countryCode}`,
        { signal: controller.signal }
      )
        .then((r) => r.json())
        .then((data) => {
          let hits: TypeaheadHit[] = data.products || []
          if (selectedCategorySlug !== "all") {
            hits = hits.filter((p) => p.categorySlug === selectedCategorySlug)
          }
          setTypeaheadResults(hits)
          setTotalCount(data.count ?? hits.length)
        })
        .catch(() => {
          setTypeaheadResults([])
          setTotalCount(0)
        })
    }, 250)

    return () => {
      clearTimeout(timer)
      abortRef.current?.abort()
    }
  }, [searchQuery, countryCode, selectedCategorySlug])

  const filteredResults = typeaheadResults

  const isOpen =
    isFocused && searchQuery.trim().length >= 2 && filteredResults.length > 0

  // 3. Ejecutar búsqueda general
  const handleSearchSubmit = useCallback(
    (e?: React.FormEvent) => {
      if (e) e.preventDefault()
      setIsFocused(false)
      const q = searchQuery.trim()

      if (activeIndex >= 0 && activeIndex < filteredResults.length) {
        const selected = filteredResults[activeIndex]
        router.push(`/${countryCode}/products/${selected.handle}`)
        return
      }

      if (!q && selectedCategorySlug === "all") return

      if (selectedCategorySlug !== "all" && !q) {
        router.push(`/${countryCode}/store/${selectedCategorySlug}`)
      } else if (selectedCategorySlug !== "all" && q) {
        router.push(
          `/${countryCode}/store/${selectedCategorySlug}?q=${encodeURIComponent(q)}`
        )
      } else {
        router.push(`/${countryCode}/search?q=${encodeURIComponent(q)}`)
      }
    },
    [activeIndex, countryCode, filteredResults, router, searchQuery, selectedCategorySlug]
  )

  // 4. Navegación por teclado (Flechas Arriba/Abajo/Enter/Escape)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) return

    const maxItems = filteredResults.length // incluye el botón de ver todos como índice final

    if (e.key === "ArrowDown") {
      e.preventDefault()
      setActiveIndex((prev) => (prev < maxItems ? prev + 1 : 0))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : maxItems))
    } else if (e.key === "Escape") {
      setIsFocused(false)
      setActiveIndex(-1)
      inputRef.current?.blur()
    }
  }

  // 5. Cerrar al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (formRef.current && !formRef.current.contains(e.target as Node)) {
        setIsFocused(false)
        setActiveIndex(-1)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <>
      {/* Fondo Oscuro Atenuado (Amazon Backdrop) cuando el buscador tiene foco */}
      {isFocused && (
        <div
          className="fixed inset-0 bg-black/60 z-40 transition-opacity duration-200"
          onClick={() => setIsFocused(false)}
          aria-hidden="true"
        />
      )}

      <div className="relative w-full z-50">
        <form
          ref={formRef}
          onSubmit={handleSearchSubmit}
          className={`w-full flex bg-white rounded-[6px] transition-all duration-150 relative ${
            isFocused
              ? "ring-2 ring-[#FF9900] border border-[#FF9900] shadow-xl"
              : "border border-[#CDCDCD]"
          } ${className}`}
        >
          {/* Selector de Categorías (Estilo Amazon) */}
          {showCategorySelector && (
            <div className="relative flex items-center bg-[#E6E6E6] hover:bg-[#D4D4D4] border-r border-[#CDCDCD] text-[#0F1111] px-1.5 sm:px-2.5 text-[11px] sm:text-[12px] font-medium cursor-pointer select-none h-full transition-colors flex-shrink-0 max-w-[85px] sm:max-w-[170px] rounded-l-[5px]">
              <select
                value={selectedCategorySlug}
                onChange={(e) => {
                  setSelectedCategorySlug(e.target.value)
                  setIsFocused(true)
                }}
                onFocus={() => setIsFocused(true)}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full text-black bg-white"
                aria-label="Select category"
              >
                {categories.map((cat) => (
                  <option key={cat.slug} value={cat.slug} className="text-black bg-white py-1">
                    {cat.name}
                  </option>
                ))}
              </select>
              <span className="truncate mr-1 max-w-[65px] sm:max-w-[130px]" title={selectedCategoryName}>
                {selectedCategorySlug === "all" ? "Todas" : selectedCategoryName}
              </span>
              <span className="text-[8px] sm:text-[9px] text-[#555555]">▼</span>
            </div>
          )}

          {/* Input de Búsqueda Predictiva */}
          <input
            ref={inputRef}
            type="search"
            value={searchQuery}
            onFocus={() => {
              setIsFocused(true)
              setActiveIndex(-1)
            }}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setIsFocused(true)
              setActiveIndex(-1)
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search Control Nautas (keyword, item, model, or SKU)..."
            className="flex-1 px-3 text-[14px] text-[#0F1111] focus:outline-none placeholder-[#757575] font-normal bg-white min-w-0"
            autoComplete="off"
            spellCheck="false"
            role="combobox"
            aria-expanded={isOpen}
            aria-autocomplete="list"
          />

          {/* Botón Lupa Naranja Amazon */}
          <button
            type="submit"
            aria-label="Search"
            className="bg-[#FEBD69] hover:bg-[#F3A847] text-[#111111] w-[45px] transition-colors flex items-center justify-center flex-shrink-0 h-full cursor-pointer rounded-r-[5px]"
          >
            <svg
              className="w-5 h-5 text-[#111111]"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </button>
        </form>

        {/* Dropdown Predictivo Enriquecido (Typeahead) */}
        {isOpen && (
          <div
            role="listbox"
            className="absolute left-0 right-0 top-[calc(100%+4px)] bg-white border border-[#E2E8F0] rounded-lg shadow-2xl overflow-hidden z-[999999] max-h-[460px] overflow-y-auto font-[Arial,Helvetica,sans-serif]"
          >
            <div className="py-1 divide-y divide-gray-100">
              {filteredResults.map((product, idx) => {
                const isSelected = activeIndex === idx
                const imageSrc =
                  product.image ||
                  "/cn-media/categories/calefaccion-electrica.webp"
                const isQuote =
                  product.priceLabel === "Request price" ||
                  product.priceLabel.startsWith("Consultar")

                return (
                  <div
                    key={product.handle}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      setIsFocused(false)
                      router.push(`/${countryCode}/products/${product.handle}`)
                    }}
                    onMouseEnter={() => setActiveIndex(idx)}
                    className={`px-3 py-2.5 flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                      isSelected ? "bg-[#F0F7FF]" : "hover:bg-gray-50 bg-white"
                    }`}
                  >
                    {/* Miniatura + Título + Metadatos */}
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-[42px] h-[42px] relative flex-shrink-0 bg-white border border-gray-200 rounded p-0.5 flex items-center justify-center overflow-hidden">
                        <Image
                          src={imageSrc}
                          alt={product.title}
                          width={40}
                          height={40}
                          className="object-contain max-h-full max-w-full"
                          unoptimized
                        />
                      </div>

                      <div className="flex flex-col min-w-0">
                        <span className="text-[13.5px] font-normal text-[#131921] truncate leading-snug">
                          <HighlightedText text={product.title} query={searchQuery} />
                        </span>
                        <div className="flex items-center gap-2 text-[11px] text-[#666] mt-0.5 truncate">
                          <span className="font-semibold text-[#0066CC]">{product.brand || "Control Nautas"}</span>
                          <span>•</span>
                          <span>Mod: {product.itemNumber || "CN-STD"}</span>
                        </div>
                      </div>
                    </div>

                    {/* Price / Quote */}
                    <div className="text-right flex-shrink-0 pl-2">
                      {!isQuote ? (
                        <span className="text-[13px] font-bold text-[#131921] block">
                          {product.priceLabel}
                        </span>
                      ) : (
                        <span className="text-[11px] font-bold text-[#C8102E] bg-red-50 px-2 py-0.5 rounded border border-red-200 inline-block">
                          Quote
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}

              {/* Botón Inferior: Ver todos los resultados */}
              <div
                role="option"
                aria-selected={activeIndex === filteredResults.length}
                onClick={() => handleSearchSubmit()}
                onMouseEnter={() => setActiveIndex(filteredResults.length)}
                className={`px-4 py-3 flex items-center justify-between text-[13px] font-bold text-[#0066CC] cursor-pointer transition-colors ${
                  activeIndex === filteredResults.length ? "bg-blue-50" : "hover:bg-blue-50 bg-[#F8FAFC]"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>🔍</span>
                  <span>
                    Ver todos los <strong>{totalCount}</strong> resultados para &ldquo;{searchQuery}&rdquo;
                  </span>
                </div>
                <span className="text-sm">›</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
