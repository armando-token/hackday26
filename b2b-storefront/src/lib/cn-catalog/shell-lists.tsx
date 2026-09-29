/**
 * Persist Compare / Add to List / Recently Viewed in localStorage (shell).
 */

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

const COMPARE_KEY = "cn_shell_compare_v1"
const LIST_KEY = "cn_shell_list_v1"
const VIEWED_KEY = "cn_shell_viewed_v1"
const MAX_COMPARE = 4
const MAX_VIEWED = 12

type ShellListsCtx = {
  compare: string[]
  list: string[]
  viewed: string[]
  toggleCompare: (handle: string) => void
  toggleList: (handle: string) => void
  trackView: (handle: string) => void
  clearCompare: () => void
}

const Ctx = createContext<ShellListsCtx | null>(null)

function readJson(key: string): string[] {
  if (typeof window === "undefined" || !window.localStorage || typeof window.localStorage.getItem !== "function") return []
  try {
    const raw = localStorage.getItem(key)
    const arr = raw ? JSON.parse(raw) : []
    return Array.isArray(arr) ? arr.filter((x) => typeof x === "string") : []
  } catch {
    return []
  }
}

function writeJson(key: string, val: string[]) {
  if (typeof window === "undefined" || !window.localStorage || typeof window.localStorage.setItem !== "function") return
  try {
    localStorage.setItem(key, JSON.stringify(val))
  } catch {
    /* ignore */
  }
}

export function ShellListsProvider({ children }: { children: ReactNode }) {
  const [compare, setCompare] = useState<string[]>([])
  const [list, setList] = useState<string[]>([])
  const [viewed, setViewed] = useState<string[]>([])

  useEffect(() => {
    setCompare(readJson(COMPARE_KEY))
    setList(readJson(LIST_KEY))
    setViewed(readJson(VIEWED_KEY))
  }, [])

  const toggleCompare = useCallback((handle: string) => {
    setCompare((prev) => {
      const next = prev.includes(handle)
        ? prev.filter((h) => h !== handle)
        : prev.length >= MAX_COMPARE
          ? [...prev.slice(1), handle]
          : [...prev, handle]
      writeJson(COMPARE_KEY, next)
      return next
    })
  }, [])

  const toggleList = useCallback((handle: string) => {
    setList((prev) => {
      const next = prev.includes(handle)
        ? prev.filter((h) => h !== handle)
        : [...prev, handle]
      writeJson(LIST_KEY, next)
      return next
    })
  }, [])

  const trackView = useCallback((handle: string) => {
    setViewed((prev) => {
      const next = [handle, ...prev.filter((h) => h !== handle)].slice(
        0,
        MAX_VIEWED
      )
      writeJson(VIEWED_KEY, next)
      return next
    })
  }, [])

  const clearCompare = useCallback(() => {
    setCompare([])
    writeJson(COMPARE_KEY, [])
  }, [])

  const value = useMemo(
    () => ({
      compare,
      list,
      viewed,
      toggleCompare,
      toggleList,
      trackView,
      clearCompare,
    }),
    [compare, list, viewed, toggleCompare, toggleList, trackView, clearCompare]
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useShellLists() {
  const ctx = useContext(Ctx)
  if (!ctx) {
    return {
      compare: [] as string[],
      list: [] as string[],
      viewed: [] as string[],
      toggleCompare: (_h: string) => {},
      toggleList: (_h: string) => {},
      trackView: (_h: string) => {},
      clearCompare: () => {},
    }
  }
  return ctx
}
