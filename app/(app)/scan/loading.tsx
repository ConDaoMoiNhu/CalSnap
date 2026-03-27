import { DelayedSkeleton } from '@/components/delayed-skeleton'

export default function Loading() {
  return (
    <DelayedSkeleton>
      <div className="max-w-lg mx-auto p-4 space-y-4 pb-24">
        <div className="relative skeleton-shimmer h-48 rounded-[2rem] overflow-hidden">
          <span className="scan-corner scan-corner-tl" />
          <span className="scan-corner scan-corner-tr" />
          <span className="scan-corner scan-corner-bl" />
          <span className="scan-corner scan-corner-br" />
        </div>
        <div className="skeleton-shimmer h-24 rounded-[2rem]" style={{ animationDelay: '0.1s' }} />
        <div className="skeleton-shimmer h-24 rounded-[2rem]" style={{ animationDelay: '0.2s' }} />
      </div>
    </DelayedSkeleton>
  )
}
