"use client"
import { Button, Popover } from "@b4se/ui"
import { CalendarDays, ChartLine, HomeIcon } from "lucide-react"
import { Sidebar, SidebarContent, SidebarFooter, SidebarLink } from "./ui/sidebar"

const navItems = {
  user: [
    { href: "/app", icon: <HomeIcon className="size-4 md:size-full" />, title: "Inicio" },
    { href: "/app/calendar", icon: <CalendarDays className="size-4 md:size-full" />, title: "Calendario" },
    { href: "/app/analytics", icon: <ChartLine className="size-4 md:size-full" />, title: "Estadisticas" }
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
        <Popover>
          <Popover.Trigger
            render={
              <Button variant="secondary" size="lg" className="rounded-full">
                Opciones
              </Button>
            }
          />
          <Popover.Content>
            <Popover.Header>
              <Popover.Title>Opciones</Popover.Title>
            </Popover.Header>
            <Popover.Body>
              <span className="text-xs text-muted-foreground">Sesión activa</span>
            </Popover.Body>
          </Popover.Content>
        </Popover>
      </SidebarFooter>
    </Sidebar>
  )
}
