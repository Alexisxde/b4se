"use client"
import { cn } from "@b4se/ui"
import { motion } from "motion/react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import type React from "react"
import { createContext, useContext } from "react"

const SidebarContext = createContext<{ pathname: string } | null>(null)

function useSidebar() {
  const context = useContext(SidebarContext)
  if (!context) throw new Error("Sidebar components must be used within a <Sidebar />")
  return context
}

export function Sidebar({ children, className }: { children: React.ReactNode; className?: string }) {
  const pathname = usePathname()
  return (
    <SidebarContext value={{ pathname }}>
      <motion.aside initial={false} className={cn("z-2 md:flex h-dvh flex-col items-center py-6 hidden", className)}>
        {children}
      </motion.aside>
    </SidebarContext>
  )
}

export function SidebarContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return <nav className={cn("flex w-full flex-1 flex-col justify-center gap-2 px-3", className)}>{children}</nav>
}

export function SidebarFooter({ children, className }: { children: React.ReactNode; className?: string }) {
  return <footer className={cn("mt-auto w-full px-4 flex flex-col gap-2", className)}>{children}</footer>
}

interface SidebarItemProps {
  title: string
  isActive?: boolean
  className?: string
}

function SidebarItem({ title, isActive, className }: SidebarItemProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center gap-1 rounded-4xl text-muted-foreground p-3 transition-all duration-200 ease-in-out hover:text-primary bg-muted/50 hover:bg-muted hover:opacity-100 transform hover:translate-x-2 hover:scale-105",
        {
          "bg-muted text-primary": isActive,
          "opacity-80": !isActive
        },
        className
      )}>
      <span className="font-medium text-md tracking-tight">{title}</span>
    </div>
  )
}

export function SidebarLink({ href, title, isActive: customIsActive, className }: SidebarItemProps & { href: string }) {
  const { pathname } = useSidebar()
  const isActive = customIsActive ?? pathname === href

  return (
    <Link href={href} className="w-fit">
      <SidebarItem title={title} isActive={isActive} className={className} />
    </Link>
  )
}
