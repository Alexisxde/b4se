"use client"
import { Button } from "@b4se/ui"
import { useSession } from "next-auth/react"

export function Header() {
  const session = useSession()
  console.log(session)
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
