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
import { getProductByHandle, type HvacProduct } from "./products"

const STORAGE_KEY = "cn_hvac_shell_cart_v1"

export type ShellCartLine = {
  handle: string
  quantity: number
}

type ShellCartContextValue = {
  lines: ShellCartLine[]
  itemCount: number
  subtotal: number
  addItem: (handle: string, qty?: number) => void
  setQuantity: (handle: string, qty: number) => void
  removeItem: (handle: string) => void
  clear: () => void
  getLinesWithProducts: () => { product: HvacProduct; quantity: number }[]
}

const ShellCartContext = createContext<ShellCartContextValue | null>(null)

function loadLines(): ShellCartLine[] {
  if (typeof window === "undefined" || !window.localStorage || typeof window.localStorage.getItem !== "function") return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function ShellCartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<ShellCartLine[]>([])
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setLines(loadLines())
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lines))
  }, [lines, hydrated])

  const addItem = useCallback((handle: string, qty = 1) => {
    setLines((prev) => {
      const existing = prev.find((l) => l.handle === handle)
      if (existing) {
        return prev.map((l) =>
          l.handle === handle ? { ...l, quantity: l.quantity + qty } : l
        )
      }
      return [...prev, { handle, quantity: qty }]
    })
  }, [])

  const setQuantity = useCallback((handle: string, qty: number) => {
    setLines((prev) => {
      if (qty <= 0) return prev.filter((l) => l.handle !== handle)
      return prev.map((l) => (l.handle === handle ? { ...l, quantity: qty } : l))
    })
  }, [])

  const removeItem = useCallback((handle: string) => {
    setLines((prev) => prev.filter((l) => l.handle !== handle))
  }, [])

  const clear = useCallback(() => setLines([]), [])

  const getLinesWithProducts = useCallback(() => {
    return lines
      .map((l) => {
        const product = getProductByHandle(l.handle)
        return product ? { product, quantity: l.quantity } : null
      })
      .filter(Boolean) as { product: HvacProduct; quantity: number }[]
  }, [lines])

  const itemCount = useMemo(
    () => lines.reduce((sum, l) => sum + l.quantity, 0),
    [lines]
  )

  const subtotal = useMemo(() => {
    return lines.reduce((sum, l) => {
      const p = getProductByHandle(l.handle)
      return sum + (p ? p.price * l.quantity : 0)
    }, 0)
  }, [lines])

  const value = useMemo(
    () => ({
      lines,
      itemCount,
      subtotal,
      addItem,
      setQuantity,
      removeItem,
      clear,
      getLinesWithProducts,
    }),
    [
      lines,
      itemCount,
      subtotal,
      addItem,
      setQuantity,
      removeItem,
      clear,
      getLinesWithProducts,
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
