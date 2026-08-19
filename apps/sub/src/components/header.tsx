import { Button } from "@b4se/ui"

export function Header() {
  return (
    <header className="flex items-center justify-end p-8">
      <nav className="flex gap-2">
        <Button variant="secondary">Iniciar sesión</Button>
        <Button>Comenzar</Button>
        {/* <SignInForm /> */}
      </nav>
    </header>
  )
}
