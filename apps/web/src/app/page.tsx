"use client"
import { Button, Popover } from "@b4se/ui"
import { Plus } from "lucide-react"

export default function Page() {
  return (
    <main className="flex h-dvh flex-col items-center justify-between p-24 bg-background text-foreground">
      <Button>Click me</Button>
      <Popover maxWidth={420} height={480}>
        <Popover.Trigger>
          <Button>
            <Plus className="size-4" />
          </Button>
        </Popover.Trigger>
        <Popover.Content className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-popover-foreground">
              Título
            </h2>
            <Popover.Close />
          </div>
          <p className="text-muted-foreground text-sm">
            Contenido del popover sincronizado mediante Context y useId usando
            las variables CSS del tema.
          </p>
        </Popover.Content>
      </Popover>
    </main>
  )
}
