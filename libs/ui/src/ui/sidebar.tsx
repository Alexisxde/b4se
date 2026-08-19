"use client"
import { createContext, type ReactNode, useContext, useRef } from "react"
import { gsap, useGSAP } from "../lib/gsap"
import { cn } from "../lib/utils"
import { Button, type ButtonProps } from "./button"

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

interface SidebarContextValue {
  pathname: string
}

const SidebarContext = createContext<SidebarContextValue | null>(null)

function useSidebar() {
  const ctx = useContext(SidebarContext)
  if (!ctx) throw new Error("Sidebar sub-components must be used inside <Sidebar />")
  return ctx
}

// ---------------------------------------------------------------------------
// Sidebar (root)
// ---------------------------------------------------------------------------

export interface SidebarProps {
  children: ReactNode
  className?: string
  /** Current pathname — pass usePathname() from your router */
  pathname: string
}

export function Sidebar({ children, className, pathname }: SidebarProps) {
  const asideRef = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      gsap.fromTo(
        asideRef.current,
        { opacity: 0, x: -16 },
        { opacity: 1, x: 0, duration: 0.35, ease: "power2.out" }
      )
    },
    { scope: asideRef }
  )

  return (
    <SidebarContext.Provider value={{ pathname }}>
      <aside
        ref={asideRef}
        className={cn("z-2 md:flex h-dvh flex-col items-center py-8 hidden", className)}>
        {children}
      </aside>
    </SidebarContext.Provider>
  )
}

// ---------------------------------------------------------------------------
// SidebarContent
// ---------------------------------------------------------------------------

export function SidebarContent({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <nav className={cn("flex w-full flex-1 flex-col justify-center gap-2 px-3", className)}>
      {children}
    </nav>
  )
}

// ---------------------------------------------------------------------------
// SidebarFooter
// ---------------------------------------------------------------------------

export function SidebarFooter({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <footer className={cn("mt-auto w-full px-4 flex flex-col gap-2", className)}>
      {children}
    </footer>
  )
}

// ---------------------------------------------------------------------------
// SidebarItem (internal)
// ---------------------------------------------------------------------------

interface SidebarItemProps {
  title: string
  isActive?: boolean
  className?: string
}

function SidebarItem({ title, isActive, className }: SidebarItemProps) {
  const itemRef = useRef<HTMLDivElement>(null)

  const { contextSafe } = useGSAP({ scope: itemRef })

  const onEnter = contextSafe(() => {
    gsap.to(itemRef.current, { x: 8, scale: 1.05, duration: 0.2, ease: "power2.out" })
  })

  const onLeave = contextSafe(() => {
    gsap.to(itemRef.current, { x: 0, scale: 1, duration: 0.2, ease: "power2.out" })
  })

  return (
    <div
      ref={itemRef}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      className={cn(
        "flex items-center justify-center gap-1 rounded-4xl text-muted-foreground p-3 transition-colors duration-200 ease-in-out bg-muted/50 hover:bg-muted hover:text-primary hover:opacity-100",
        { "bg-muted text-primary": isActive, "opacity-80": !isActive },
        className
      )}>
      <span className="font-medium text-md tracking-tight">{title}</span>
    </div>
  )
}

// ---------------------------------------------------------------------------
// SidebarLink
// ---------------------------------------------------------------------------

export interface SidebarLinkProps extends SidebarItemProps {
  href: string
  /**
   * Optional render-prop for custom link components (e.g. Next.js <Link>).
   *
   * @example
   * <SidebarLink
   *   href="/dashboard"
   *   title="Dashboard"
   *   renderLink={({ href, className, children }) => (
   *     <Link href={href} className={className}>{children}</Link>
   *   )}
   * />
   */
  renderLink?: (props: { href: string; className?: string; children: ReactNode }) => ReactNode
}

export function SidebarLink({ href, title, isActive: customIsActive, className, renderLink }: SidebarLinkProps) {
  const { pathname } = useSidebar()
  const isActive = customIsActive ?? pathname === href

  const inner = <SidebarItem title={title} isActive={isActive} className={className} />

  if (renderLink) {
    return <>{renderLink({ href, className: "w-fit", children: inner })}</>
  }

  return (
    <a href={href} className="w-fit">
      {inner}
    </a>
  )
}

// ---------------------------------------------------------------------------
// SidebarButton
// ---------------------------------------------------------------------------

export interface SidebarButtonProps extends SidebarItemProps, ButtonProps {
  onClick?: () => void
}

export function SidebarButton({ onClick, title, isActive, className, ...props }: SidebarButtonProps) {
  const spanRef = useRef<HTMLSpanElement>(null)

  const { contextSafe } = useGSAP({ scope: spanRef })

  const onEnter = contextSafe(() => {
    gsap.to(spanRef.current, { x: 8, scale: 1.05, duration: 0.2, ease: "power2.out" })
  })

  const onLeave = contextSafe(() => {
    gsap.to(spanRef.current, { x: 0, scale: 1, duration: 0.2, ease: "power2.out" })
  })

  return (
    <Button
      variant="secondary"
      onClick={onClick}
      size="lg"
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      className={cn(
        "text-base flex items-center justify-center gap-1 rounded-4xl text-muted-foreground p-3 bg-muted/50 hover:bg-muted hover:text-primary",
        className
      )}
      {...props}>
      <span ref={spanRef}>{title}</span>
    </Button>
  )
}
