"use client"
import { createContext, type ReactNode, useContext, useEffect, useMemo, useRef } from "react"
import { gsap } from "../../lib/gsap"

export interface SelectItem {
  id: string | number
  name: string
  logo?: string | ReactNode
  [key: string]: any
}

export interface SelectStateContextValue<T extends SelectItem = SelectItem> {
  id: string
  errorId: string
  name?: string
  value?: string | number
  selectedItem: T | null
  hasValue: boolean
  error?: string
  disabled?: boolean
  selectItem: (item: T) => void
  clear: () => void
  renderLogo: (logo: string | ReactNode) => ReactNode
}

export interface SelectQueryContextValue<T extends SelectItem = SelectItem> {
  query: string
  setQuery: (q: string) => void
  filteredData: T[]
}

export interface SelectContentContextValue {
  empty?: ReactNode
}

/* ---------------------------------------------------------------------------
 * Contexts
 * Split into StateContext and QueryContext so typing in Select.Input does not
 * re-render Select.Preview (outside the popover).
 * ------------------------------------------------------------------------- */

export const SelectStateContext = createContext<SelectStateContextValue<any> | null>(null)
export const SelectQueryContext = createContext<SelectQueryContextValue<any> | null>(null)
export const SelectContentContext = createContext<SelectContentContextValue | null>(null)

/* ---------------------------------------------------------------------------
 * Consumer Hooks
 * ------------------------------------------------------------------------- */

export function useSelectState<T extends SelectItem = SelectItem>() {
  const ctx = useContext(SelectStateContext) as SelectStateContextValue<T> | null
  if (!ctx) throw new Error("useSelectState must be used inside <Select>.")
  return ctx
}

export function useSelectQuery<T extends SelectItem = SelectItem>() {
  const ctx = useContext(SelectQueryContext) as SelectQueryContextValue<T> | null
  if (!ctx) throw new Error("useSelectQuery must be used inside <Select>.")
  return ctx
}

export function useSelectContent() {
  return useContext(SelectContentContext)
}

export function useSelect<T extends SelectItem = SelectItem>() {
  const state = useSelectState<T>()
  const query = useSelectQuery<T>()
  return { ...state, ...query }
}

/* ---------------------------------------------------------------------------
 * Split Computation Hooks (rule: rerender-split-combined-hooks)
 * Each computation or side-effect has its own hook with minimal dependencies.
 * ------------------------------------------------------------------------- */

export function useFilteredData<T extends SelectItem = SelectItem>(
  data: T[],
  query: string,
  filterFn?: (item: T, query: string) => boolean
): T[] {
  return useMemo(() => {
    if (!query.trim()) return data
    const q = query.toLowerCase()
    if (filterFn) return data.filter((item) => filterFn(item, query))
    return data.filter((item) => item.name?.toLowerCase().includes(q))
  }, [data, query, filterFn])
}

export function useSelectedItem<T extends SelectItem = SelectItem>(data: T[], value?: string | number): T | null {
  return useMemo(() => {
    if (value === undefined || value === null || value === "") return null
    return data.find((item) => String(item.id) === String(value)) ?? null
  }, [data, value])
}

export function useHasValue(value?: string | number): boolean {
  return useMemo(() => {
    return value !== undefined && value !== null && String(value).length > 0
  }, [value])
}

export function useErrorShake(ref: React.RefObject<HTMLElement | null>, error?: string | boolean) {
  useEffect(() => {
    if (error && ref.current) {
      gsap.fromTo(
        ref.current,
        { x: 0 },
        {
          keyframes: [
            { x: -8, duration: 0.06 },
            { x: 8, duration: 0.06 },
            { x: -6, duration: 0.06 },
            { x: 6, duration: 0.06 },
            { x: -3, duration: 0.06 },
            { x: 3, duration: 0.06 },
            { x: 0, duration: 0.06 }
          ],
          ease: "power2.out"
        }
      )
    }
  }, [error, ref])
}

export function useErrorSlide(ref: React.RefObject<HTMLElement | null>, error?: string | boolean) {
  useEffect(() => {
    if (error && ref.current) {
      gsap.fromTo(ref.current, { opacity: 0, y: -4 }, { opacity: 1, y: 0, duration: 0.25, ease: "power2.out" })
    }
  }, [error, ref])
}

export function useLogoAnimation(ref: React.RefObject<HTMLElement | null>, logo?: unknown) {
  useEffect(() => {
    if (logo && ref.current) {
      gsap.fromTo(
        ref.current,
        { opacity: 0, scale: 0.5 },
        { opacity: 1, scale: 1, duration: 0.25, ease: "back.out(1.7)" }
      )
    }
  }, [logo, ref])
}

export function useClearBtnAnimation(ref: React.RefObject<HTMLElement | null>, hasValue: boolean) {
  const prevHasValueRef = useRef(false)

  useEffect(() => {
    if (hasValue && !prevHasValueRef.current && ref.current) {
      gsap.fromTo(ref.current, { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 0.2, ease: "power2.out" })
    }
    prevHasValueRef.current = hasValue
  }, [hasValue, ref])
}

export function useListStagger(ref: React.RefObject<HTMLElement | null>, count: number) {
  useEffect(() => {
    if (ref.current && count > 0) {
      const items = ref.current.querySelectorAll("[data-search-item]")
      if (items.length > 0) {
        gsap.fromTo(
          items,
          { opacity: 0, y: -6 },
          { opacity: 1, y: 0, stagger: 0.02, duration: 0.18, ease: "power2.out" }
        )
      }
    }
  }, [count, ref])
}
