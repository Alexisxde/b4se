export function SubscriptionSkeleton() {
  return (
    <section className="flex-1 grid grid-cols-7 grid-rows-6 auto-rows-fr gap-1">
      {Array.from({ length: 42 }).map((_, index) => {
        const row = Math.floor(index / 7)
        const col = index % 7
        const delay = (row + col) * 200

        return (
          <div
            key={`day-skeleton-${index}`}
            className="bg-muted animate-pulse rounded-full md:rounded-4xl"
            style={{ animationDelay: `${delay}ms` }}
          />
        )
      })}
    </section>
  )
}
