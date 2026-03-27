import { DelayedSkeleton } from '@/components/delayed-skeleton'

export default function Loading() {
  return (
    <DelayedSkeleton>
      <div className="max-w-lg mx-auto p-4 space-y-3 pb-24">
        <div className="skeleton-shimmer h-32 rounded-[2rem]" />
        <div className="skeleton-shimmer h-8 w-48 rounded-full" style={{ animationDelay: '0.08s' }} />
        {[0, 1, 2, 3, 4].map(i => (
          <div key={i} className="skeleton-shimmer h-20 rounded-[2rem]" style={{ animationDelay: `${0.12 + i * 0.07}s` }} />
        ))}
      </div>
    </DelayedSkeleton>
  )
}
