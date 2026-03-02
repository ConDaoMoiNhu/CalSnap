'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, BookOpen, Zap, MessageCircle, ClipboardList } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/log', label: 'Log', icon: BookOpen },
  { href: '/scan', label: 'Scan', icon: Zap },
  { href: '/chat', label: 'Chat', icon: MessageCircle },
  { href: '/fitness-plan', label: 'My Plan', icon: ClipboardList },
]

export function MobileBottomNav() {
  const pathname = usePathname()

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex justify-center items-end pb-3"
      style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
    >
      <div className="relative max-w-xs w-full flex justify-center">
        {/* Dark pill */}
        <div className="w-full bg-slate-900/95 backdrop-blur-2xl rounded-full px-3 py-2 shadow-[0_10px_30px_rgba(15,23,42,0.6)] border border-white/10 flex items-center justify-between gap-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href
            const isCenter = href === '/scan'

            return (
              <Link
                key={href}
                href={href}
                aria-label={label}
                className={cn(
                  'flex-1 flex flex-col items-center justify-center gap-0.5 text-[10px] font-semibold text-white/60',
                  isCenter && 'relative'
                )}
              >
                <span
                  className={cn(
                    'flex items-center justify-center rounded-full transition-all',
                    isCenter
                      ? 'w-12 h-12 -mt-7 hoverboard-gradient text-white shadow-lg shadow-emerald-500/40'
                      : 'w-8 h-8',
                    !isCenter &&
                      (isActive ? 'bg-emerald-500/20 text-emerald-400' : 'text-white/60')
                  )}
                >
                  <Icon className={cn('h-4 w-4', isCenter && 'h-5 w-5')} />
                </span>
                {!isCenter && (
                  <span className={cn(isActive ? 'text-emerald-400' : 'text-white/50')}>
                    {label}
                  </span>
                )}
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
