"use client"
import { type RefObject, useEffect } from "react"

export default function useClickOutside<T extends HTMLElement>(
  ref: RefObject<T>,
  handler: (event: MouseEvent | TouchEvent) => void,
  uniqueId?: string
): void {
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (uniqueId && (event as any).__handledPopovers?.has(uniqueId)) {
        return
      }

      if (!ref || !ref.current || ref.current.contains(event.target as Node)) return
      handler(event)
    }

    document.addEventListener("mousedown", handleClickOutside)
    document.addEventListener("touchstart", handleClickOutside)

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("touchstart", handleClickOutside)
    }
  }, [uniqueId, ref, handler])
}
