"use client"
import { cn } from "@/lib/utils"
import { Button, type ButtonProps } from "@b4se/ui"
import { motion } from "motion/react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import type React from "react"
import { createContext, useContext } from "react"

const MenuContext = createContext<{ pathname: string } | null>(null)

function useMenu() {
  const context = useContext(MenuContext)
  if (!context) throw new Error("Menu components must be used within a <Menu />")
  return context
}

export function Menu({ children, className }: { children: React.ReactNode; className?: string }) {
  const pathname = usePathname()

  return (
    <MenuContext.Provider value={{ pathname }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className={cn(
          "fixed bottom-4 transform translate-y-0 left-1/2 -translate-x-1/2 flex items-center justify-center pointer-events-none z-2",
          className
        )}>
        {children}
      </motion.div>
    </MenuContext.Provider>
  )
}

export function MenuContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "bg-card border-outlineflex items-center justify-center gap-1 rounded-full border px-4 py-2 pointer-events-auto",
        className
      )}>
      {children}
    </div>
  )
}

interface MenuItemProps {
  title: string
  icon: React.ReactNode
  isActive?: boolean
  className?: string
}

function MenuItem({ title, icon, isActive, className }: MenuItemProps) {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      {icon}
      {isActive ? (
        <motion.span
          initial={{ opacity: 0, width: 0 }}
          animate={{ opacity: 1, width: "auto" }}
          className="text-xs font-medium whitespace-nowrap overflow-hidden">
          {title}
        </motion.span>
      ) : null}
    </div>
  )
}

type MenuLinkProps = ButtonProps &
  MenuItemProps & {
    href: string
  }

export function MenuLink({ href, title, icon, isActive: customIsActive, className }: MenuLinkProps) {
  const { pathname } = useMenu()
  const isActive = customIsActive ?? pathname === href

  return (
    <Button
      asChild
      size="sm"
      variant="ghost"
      className={cn(
        "bg-muted h-10 rounded-full transition-all duration-300",
        !isActive ? "w-10 p-0" : "px-4",
        className
      )}>
      <Link href={href}>
        <MenuItem title={title} icon={icon} isActive={isActive} />
      </Link>
    </Button>
  )
}

type MenuButtonProps = ButtonProps & MenuItemProps

export function MenuButton({ onClick, title, icon, isActive, className }: MenuButtonProps) {
  return (
    <Button
      variant="ghost"
      onClick={onClick}
      className={cn(
        "bg-muted h-10 rounded-full transition-all duration-300",
        !isActive ? "w-10 p-0" : "px-4",
        className
      )}>
      <MenuItem title={title} icon={icon} isActive={isActive} />
    </Button>
  )
}

export default Object.assign(Menu, { Content: MenuContent, Link: MenuLink, Button: MenuButton })
