'use client'

import Link from 'next/link'
import { Sparkles } from 'lucide-react'

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  subtitle?: string
  ctaLabel?: string
  ctaHref?: string
  onCtaClick?: () => void
}

export function EmptyState({
  icon,
  title,
  subtitle,
  ctaLabel,
  ctaHref,
  onCtaClick,
}: EmptyStateProps) {
  const Icon = icon ?? (
    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center">
      <Sparkles className="h-6 w-6" />
    </div>
  )

  return (
    <div className="glass-card rounded-[2rem] p-10 text-center border border-slate-100 bg-white/60">
      <div className="mb-4 flex justify-center">{Icon}</div>
      <p className="font-semibold text-slate-800">{title}</p>
      {subtitle && (
        <p className="text-sm text-slate-500 mt-1 mb-4 leading-relaxed max-w-md mx-auto">
          {subtitle}
        </p>
      )}
      {(ctaLabel && (ctaHref || onCtaClick)) && (
        ctaHref ? (
          <Link
            href={ctaHref}
            className="inline-flex items-center justify-center gap-2 hoverboard-gradient text-white font-bold rounded-2xl py-3.5 px-6 active:scale-95 transition-all"
          >
            <Sparkles className="h-4 w-4" />
            {ctaLabel}
          </Link>
        ) : (
          <button
            type="button"
            onClick={onCtaClick}
            className="inline-flex items-center justify-center gap-2 hoverboard-gradient text-white font-bold rounded-2xl py-3.5 px-6 active:scale-95 transition-all"
          >
            <Sparkles className="h-4 w-4" />
            {ctaLabel}
          </button>
        )
      )}
    </div>
  )
}
