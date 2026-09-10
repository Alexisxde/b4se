import type { ReactElement, ReactNode, Ref, RefObject } from "react"
import { cloneElement } from "react"
import { cn } from "./utils"

export function mergeRefs<T>(...refs: (Ref<T> | undefined)[]) {
  return (node: T | null) => {
    for (const ref of refs) {
      if (!ref) continue
      if (typeof ref === "function") ref(node)
      else (ref as RefObject<T | null>).current = node
    }
  }
}

export function withRender(
  render: ReactElement,
  ours: Record<string, unknown>,
  className?: string,
  attach?: (el: never | null) => void,
  children?: ReactNode
) {
  const theirs = render.props as Record<string, unknown> & {
    ref?: Ref<never>
    className?: string
  }
  const merged: Record<string, unknown> = { ...ours }

  if (attach) merged.ref = mergeRefs(theirs.ref, attach)
  if (children !== undefined) merged.children = children

  for (const key of Object.keys(ours)) {
    const mine = ours[key]
    const yours = theirs[key]
    if (key.startsWith("on") && typeof mine === "function" && typeof yours === "function") {
      merged[key] = (...args: unknown[]) => {
        ;(yours as (...a: unknown[]) => void)(...args)
        ;(mine as (...a: unknown[]) => void)(...args)
      }
    }
  }
  merged.className = cn(theirs.className, className)

  return cloneElement(render, merged)
}
