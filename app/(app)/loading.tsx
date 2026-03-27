export default function Loading() {
  return (
    <div className="max-w-5xl mx-auto p-4 space-y-4 pb-24">
      <div className="skeleton-shimmer h-64 rounded-[2rem]" />
      <div className="flex gap-3">
        <div className="skeleton-shimmer h-20 flex-1 rounded-2xl" />
        <div className="skeleton-shimmer h-20 flex-1 rounded-2xl" style={{ animationDelay: '0.1s' }} />
        <div className="skeleton-shimmer h-20 flex-1 rounded-2xl" style={{ animationDelay: '0.2s' }} />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="skeleton-shimmer h-52 rounded-[2rem]" style={{ animationDelay: '0.1s' }} />
        <div className="space-y-4">
          <div className="skeleton-shimmer h-24 rounded-[2rem]" style={{ animationDelay: '0.15s' }} />
          <div className="skeleton-shimmer h-24 rounded-[2rem]" style={{ animationDelay: '0.25s' }} />
        </div>
      </div>
      <div className="skeleton-shimmer h-40 rounded-[2rem]" style={{ animationDelay: '0.2s' }} />
      {[0, 1, 2].map(i => (
        <div key={i} className="skeleton-shimmer h-16 rounded-2xl" style={{ animationDelay: `${0.25 + i * 0.08}s` }} />
      ))}
    </div>
  )
}
