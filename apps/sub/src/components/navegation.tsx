"use client"
import { Popover } from "@b4se/ui"
import { ChartLine, HomeIcon, LockKeyhole } from "lucide-react"
import { Sidebar, SidebarButton, SidebarContent, SidebarFooter, SidebarLink } from "./ui/sidebar"

const navItems = {
  user: [
    { href: "/app", icon: <HomeIcon className="size-4 md:size-full" />, title: "Inicio" },
    { href: "/app/analytics", icon: <ChartLine className="size-4 md:size-full" />, title: "Estadisticas" },
    { href: "/app/admin", icon: <LockKeyhole className="size-4 md:size-full" />, title: "Administración" }
  ]
}

export default function Navigation() {
  return (
    <Sidebar>
      <SidebarContent>
        {navItems.user.map((item) => (
          <SidebarLink key={item.href} href={item.href} title={item.title} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <Popover side="right" align="end" sideOffset={12}>
          <Popover.Trigger render={<SidebarButton title="Opciones" />} />
          <Popover.Content>
            <Popover.Header>
              <Popover.Title>Opciones</Popover.Title>
              <Popover.Description>Preferencias de tu cuenta</Popover.Description>
            </Popover.Header>
            <div className="flex flex-col gap-1 py-1">
              <span className="text-xs text-muted-foreground">Sesión activa</span>
            </div>
          </Popover.Content>
        </Popover>
      </SidebarFooter>
    </Sidebar>
  )
}
