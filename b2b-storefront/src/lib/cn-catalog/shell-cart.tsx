"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { useParams } from "next/navigation"

const STORAGE_KEY_V2 = "cn_shell_cart_v2"
const LEGACY_CART_KEYS = ["cn_hvac_shell_cart_v1", "cn_shell_cart_v1"] as const

type LegacyCartLine = { handle: string; quantity: number }

export type ShellCartLineV2 = {
  variantId: string
  productId: string
  handle: string
  quantity: number
}

export type ShellCartV2 = {
  version: 2
  updatedAt: string
  lines: ShellCartLineV2[]
}

export type ShellCartAddInput =
  | {
      variantId: string
      productId: string
      handle: string
      quantity?: number
    }
  | {
      handle: string
      quantity?: number
    }

export type ShellCartResolvedLine = ShellCartLineV2 & {
  title: string
  brand: string
  itemNumber: string | null
  mfrModel: string | null
  image: string
  priceLabel: string
  priceAmount: number
  canAddToCart: boolean
  requiresQuote: boolean
}

type ShellCartContextValue = {
  lines: ShellCartLineV2[]
  resolvedLines: ShellCartResolvedLine[]
  itemCount: number
  subtotal: number
  isResolving: boolean
  addItem: (input: ShellCartAddInput) => void
  setQuantity: (variantId: string, qty: number) => void
  removeItem: (variantId: string) => void
  clear: () => void
  /** @deprecated Use resolvedLines */
  getLinesWithProducts: () => {
    product: ShellCartResolvedLine
    quantity: number
  }[]
  getResolvedLines: () => ShellCartResolvedLine[]
}

const ShellCartContext = createContext<ShellCartContextValue | null>(null)

function clampQty(qty: number): number {
  return Math.min(999, Math.max(1, qty || 1))
}

function loadLegacyV1Lines(): LegacyCartLine[] {
  if (
    typeof window === "undefined" ||
    !window.localStorage ||
    typeof window.localStorage.getItem !== "function"
  ) {
    return []
  }

  for (const key of LEGACY_CART_KEYS) {
    try {
      const raw = localStorage.getItem(key)
      if (!raw) continue
      const parsed = JSON.parse(raw)
      if (!Array.isArray(parsed)) continue
      localStorage.removeItem(key)
      return parsed
        .filter((line) => line?.handle)
        .map((line) => ({
          handle: String(line.handle),
          quantity: clampQty(Number(line.quantity) || 1),
        }))
    } catch {
      continue
    }
  }

  return []
}

function loadV2(): ShellCartV2 | null {
  if (
    typeof window === "undefined" ||
    !window.localStorage ||
    typeof window.localStorage.getItem !== "function"
  ) {
    return null
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY_V2)
    if (!raw) return null
    const parsed = JSON.parse(raw) as ShellCartV2
    if (parsed?.version !== 2 || !Array.isArray(parsed.lines)) return null
    return parsed
  } catch {
    return null
  }
}

function saveV2(cart: ShellCartV2) {
  if (!window.localStorage || typeof window.localStorage.setItem !== "function") {
    return
  }
  localStorage.setItem(STORAGE_KEY_V2, JSON.stringify(cart))
}

function mapCatalogToLine(
  line: ShellCartLineV2,
  product: {
    id: string
    handle: string
    title: string
    brand?: { name: string } | null
    pim: { itemNumber: string | null; mfrModel: string | null }
    thumbnail: string | null
    images: Array<{ url: string }>
    display: {
      priceLabel: string
      price: { amount: number } | null
      canAddToCart: boolean
      requiresQuote: boolean
    }
    primaryVariant: { id: string }
  }
): ShellCartResolvedLine {
  return {
    ...line,
    title: product.title,
    brand: product.brand?.name ?? "",
    itemNumber: product.pim.itemNumber,
    mfrModel: product.pim.mfrModel,
    image:
      product.thumbnail ||
      product.images[0]?.url ||
      "/cn-media/categories/calefaccion-electrica.webp",
    priceLabel: product.display.priceLabel,
    priceAmount: product.display.price?.amount ?? 0,
    canAddToCart: product.display.canAddToCart,
    requiresQuote: product.display.requiresQuote,
  }
}

function dedupeLines(lines: ShellCartLineV2[]): ShellCartLineV2[] {
  const map = new Map<string, ShellCartLineV2>()
  for (const line of lines) {
    const existing = map.get(line.variantId)
    if (existing) {
      map.set(line.variantId, {
        ...existing,
        quantity: clampQty(existing.quantity + line.quantity),
      })
    } else {
      map.set(line.variantId, { ...line, quantity: clampQty(line.quantity) })
    }
  }
  return [...map.values()]
}

export function ShellCartProvider({ children }: { children: ReactNode }) {
  const params = useParams()
  const countryCode = (params?.countryCode as string) || "pe"

  const [lines, setLines] = useState<ShellCartLineV2[]>([])
  const [resolvedLines, setResolvedLines] = useState<ShellCartResolvedLine[]>([])
  const [hydrated, setHydrated] = useState(false)
  const [isResolving, setIsResolving] = useState(false)

  useEffect(() => {
    const v2 = loadV2()
    if (v2?.lines.length) {
      setLines(dedupeLines(v2.lines))
      setHydrated(true)
      return
    }

    const legacy = loadLegacyV1Lines()
    if (!legacy.length) {
      setHydrated(true)
      return
    }

    const handles = [...new Set(legacy.map((line) => line.handle))]
    fetch(
      `/api/catalog/products?handles=${encodeURIComponent(handles.join(","))}&countryCode=${countryCode}`
    )
      .then((r) => r.json())
      .then((data) => {
        const products: Array<{
          id: string
          handle: string
          primaryVariant: { id: string }
        }> = data.products || []
        const byHandle = new Map(products.map((p) => [p.handle, p]))
        const migrated = legacy
          .map((line) => {
            const product = byHandle.get(line.handle)
            if (!product?.primaryVariant?.id) return null
            return {
              variantId: product.primaryVariant.id,
              productId: product.id,
              handle: line.handle,
              quantity: line.quantity,
            } satisfies ShellCartLineV2
          })
          .filter(Boolean) as ShellCartLineV2[]
        setLines(dedupeLines(migrated))
      })
      .catch(() => {
        setLines([])
      })
      .finally(() => {
        setHydrated(true)
      })
  }, [countryCode])

  useEffect(() => {
    if (!hydrated) return
    saveV2({
      version: 2,
      updatedAt: new Date().toISOString(),
      lines,
    })
  }, [lines, hydrated])

  useEffect(() => {
    if (!hydrated) {
      setResolvedLines([])
      return
    }

    if (!lines.length) {
      setResolvedLines([])
      return
    }

    const handles = [...new Set(lines.map((l) => l.handle))]
    let cancelled = false
    setIsResolving(true)

    fetch(
      `/api/catalog/products?handles=${encodeURIComponent(handles.join(","))}&countryCode=${countryCode}`
    )
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return
        const products: Array<Parameters<typeof mapCatalogToLine>[1]> =
          data.products || []
        const byHandle = new Map(products.map((p) => [p.handle, p]))
        const resolved = lines
          .map((line) => {
            const product = byHandle.get(line.handle)
            return product ? mapCatalogToLine(line, product) : null
          })
          .filter(Boolean) as ShellCartResolvedLine[]
        setResolvedLines(resolved)
      })
      .catch(() => {
        if (!cancelled) setResolvedLines([])
      })
      .finally(() => {
        if (!cancelled) setIsResolving(false)
      })

    return () => {
      cancelled = true
    }
  }, [lines, hydrated, countryCode])

  const mergeLine = useCallback((incoming: ShellCartLineV2) => {
    setLines((prev) => {
      const existing = prev.find((l) => l.variantId === incoming.variantId)
      if (existing) {
        return prev.map((l) =>
          l.variantId === incoming.variantId
            ? { ...l, quantity: clampQty(l.quantity + incoming.quantity) }
            : l
        )
      }
      return [...prev, { ...incoming, quantity: clampQty(incoming.quantity) }]
    })
  }, [])

  const addItem = useCallback(
    (input: ShellCartAddInput) => {
      const qty = clampQty(input.quantity ?? 1)

      if ("variantId" in input && input.variantId) {
        mergeLine({
          variantId: input.variantId,
          productId: input.productId,
          handle: input.handle,
          quantity: qty,
        })
        return
      }

      fetch(
        `/api/catalog/products?handles=${encodeURIComponent(input.handle)}&countryCode=${countryCode}`
      )
        .then((r) => r.json())
        .then((data) => {
          const product = data.products?.[0]
          if (!product?.primaryVariant?.id) return
          mergeLine({
            variantId: product.primaryVariant.id,
            productId: product.id,
            handle: product.handle,
            quantity: qty,
          })
        })
        .catch(() => {})
    },
    [countryCode, mergeLine]
  )

  const setQuantity = useCallback((variantId: string, qty: number) => {
    setLines((prev) => {
      if (qty <= 0) return prev.filter((l) => l.variantId !== variantId)
      return prev.map((l) =>
        l.variantId === variantId ? { ...l, quantity: clampQty(qty) } : l
      )
    })
  }, [])

  const removeItem = useCallback((variantId: string) => {
    setLines((prev) => prev.filter((l) => l.variantId !== variantId))
  }, [])

  const clear = useCallback(() => setLines([]), [])

  const getResolvedLines = useCallback(() => resolvedLines, [resolvedLines])

  const getLinesWithProducts = useCallback(
    () => resolvedLines.map((line) => ({ product: line, quantity: line.quantity })),
    [resolvedLines]
  )

  const itemCount = useMemo(
    () => lines.reduce((sum, l) => sum + l.quantity, 0),
    [lines]
  )

  const subtotal = useMemo(() => {
    return resolvedLines.reduce((sum, line) => {
      if (line.requiresQuote || !line.canAddToCart) return sum
      return sum + line.priceAmount * line.quantity
    }, 0)
  }, [resolvedLines])

  const value = useMemo(
    () => ({
      lines,
      resolvedLines,
      itemCount,
      subtotal,
      isResolving,
      addItem,
      setQuantity,
      removeItem,
      clear,
      getLinesWithProducts,
      getResolvedLines,
    }),
    [
      lines,
      resolvedLines,
      itemCount,
      subtotal,
      isResolving,
      addItem,
      setQuantity,
      removeItem,
      clear,
      getLinesWithProducts,
      getResolvedLines,
    ]
  )

  return (
    <ShellCartContext.Provider value={value}>
      {children}
    </ShellCartContext.Provider>
  )
}

export function useShellCart() {
  const ctx = useContext(ShellCartContext)
  if (!ctx) {
    throw new Error("useShellCart must be used within ShellCartProvider")
  }
  return ctx
}
