"use client"
import { Button, Input, Popover } from "@b4se/ui"
import { DollarSign, Plus } from "lucide-react"

export default function Index() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8 bg-background text-foreground">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-4xl font-bold tracking-tight">Monorepo con Nx</h1>
        <p className="text-muted-foreground text-sm max-w-125">
          Esta es una aplicación de ejemplo dentro de un monorepo Nx. Construida con Next.js y TypeScript, utilizando un
          diseño de componentes compartidos y estilos globales.
        </p>
      </div>
      <div className="flex gap-4">
        <Input type="text" label="Nombre" placeholder="Escribe algo..." />
        <Input label="Monto" placeholder="0.00" icon={<DollarSign className="size-4" />} optional />
        <Button variant="default">Botón Primario</Button>
        <Button variant="outline">Botón Secundario</Button>
        <Popover>
          <Popover.Trigger asChild>
            <Button variant="secondary">
              <Plus className="size-4" />
            </Button>
          </Popover.Trigger>
          <Popover.Content className="w-80">
            <p className="text-sm text-muted-foreground">Este es un ejemplo de contenido dentro del Popover.</p>
          </Popover.Content>
        </Popover>
      </div>
    </main>
  )
}
