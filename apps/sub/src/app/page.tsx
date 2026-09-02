"use client"
import { Button } from "@b4se/ui/button"
import { Dialog } from "@b4se/ui/dialog"
import { Popover } from "@b4se/ui/popover"
import { Header } from "../components/header"
import { SignInForm } from "../features/auth/components/sign-in-form"

export default function Home() {
  return (
    <section className="min-h-dvh">
      <Header />
      <main className="flex flex-col items-center justify-center gap-8 p-8 max-w-4xl mx-auto">
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-5xl font-bold tracking-tight">Monorepo con Nx</h1>
          <p className="text-muted-foreground text-sm max-w-125">
            Esta es una aplicación de ejemplo dentro de un monorepo Nx. Construida con Next.js y TypeScript, utilizando
            un diseño de componentes compartidos y estilos globales.
          </p>
        </div>

        <SignInForm />

        <div className="flex flex-wrap items-center justify-center gap-4 p-6 rounded-2xl border border-outline/30 bg-card/60">
          {/* Dialog morphing example */}
          <Dialog>
            <Dialog.Trigger render={<Button variant="outline">Open Dialog</Button>} />
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>Edit profile</Dialog.Title>
                <Dialog.Description>Make changes to your profile here. Click save when you're done.</Dialog.Description>
              </Dialog.Header>
              <div className="py-2 text-sm text-muted-foreground">
                Este diálogo hace un morph fluido utilizando GSAP Flip desde el botón disparador hasta el modal
                centrado.
              </div>
              <Dialog.Footer>
                <Dialog.Close render={<Button variant="outline">Cancel</Button>} />
                <Button type="submit">Save changes</Button>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog>

          <Popover side="right" align="start">
            <Popover.Trigger render={<Button variant="secondary">Open Popover</Button>} />
            <Popover.Content>
              <Popover.Header>
                <Popover.Title>Dimensiones y Ajustes</Popover.Title>
                <Popover.Description>
                  Popover flotante reutilizable con GSAP Flip y Compound Components.
                </Popover.Description>
              </Popover.Header>
              <div className="flex flex-col gap-3 py-2">
                <div className="grid grid-cols-3 items-center gap-3">
                  <label htmlFor="width" className="text-xs font-medium text-muted-foreground">
                    Ancho
                  </label>
                  <input
                    id="width"
                    defaultValue="100%"
                    className="col-span-2 h-8 rounded-lg border border-outline/50 bg-background px-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
                <div className="grid grid-cols-3 items-center gap-3">
                  <label htmlFor="max-width" className="text-xs font-medium text-muted-foreground">
                    Max. Ancho
                  </label>
                  <input
                    id="max-width"
                    defaultValue="360px"
                    className="col-span-2 h-8 rounded-lg border border-outline/50 bg-background px-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
                <div className="grid grid-cols-3 items-center gap-3">
                  <label htmlFor="height" className="text-xs font-medium text-muted-foreground">
                    Alto
                  </label>
                  <input
                    id="height"
                    defaultValue="Auto"
                    className="col-span-2 h-8 rounded-lg border border-outline/50 bg-background px-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
              </div>
              <Popover.Footer>
                <Popover.Close
                  render={
                    <Button variant="outline" size="sm">
                      Cerrar
                    </Button>
                  }
                />
                <Button size="sm">Guardar cambios</Button>
              </Popover.Footer>
            </Popover.Content>
          </Popover>
        </div>
      </main>
    </section>
  )
}
