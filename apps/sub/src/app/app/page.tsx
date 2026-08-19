import { auth } from "@/lib/auth"
import { Button } from "@b4se/ui"
import { logout } from "../../features/auth/actions/logout"

export default async function App() {
  const session = await auth()

  return (
    <section className="flex flex-col items-center justify-center gap-6 h-dvh p-8">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        {session?.user && (
          <div className="text-sm text-muted-foreground space-y-1">
            <p>
              <span className="font-medium text-foreground">Nombre:</span> {session.user.name}
            </p>
            <p>
              <span className="font-medium text-foreground">Email:</span> {session.user.email}
            </p>
            <p>
              <span className="font-medium text-foreground">Rol:</span> {session.user.role}
            </p>
          </div>
        )}
      </div>
      <form action={logout}>
        <Button type="submit" variant="secondary">
          Cerrar sesión
        </Button>
      </form>
    </section>
  )
}
