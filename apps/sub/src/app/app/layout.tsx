import Navigation from "@/components/navegation"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <section className="flex h-dvh">
      <Navigation />
      <main className="flex-1 overflow-auto">{children}</main>
    </section>
  )
}
