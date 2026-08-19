import { Header } from "../components/header"
import { SignInForm } from "../features/auth/components/sign-in-form"

export default function Home() {
  return (
    <section className="h-dvh">
      <Header />
      <main className="flex flex-col items-center justify-center gap-6 p-8">
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-5xl font-bold tracking-tight">Monorepo con Nx</h1>
          <p className="text-muted-foreground text-sm max-w-125">
            Esta es una aplicación de ejemplo dentro de un monorepo Nx. Construida con Next.js y TypeScript, utilizando
            un diseño de componentes compartidos y estilos globales.
          </p>
        </div>
        <SignInForm />
      </main>
    </section>
  )
}
