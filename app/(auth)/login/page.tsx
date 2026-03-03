'use client'

import { useState } from 'react'
import { login, loginWithGoogle } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { Zap, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'
import { useSearchParams } from 'next/navigation'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const searchParams = useSearchParams()
  const message = searchParams.get('message')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const fd = new FormData(e.currentTarget)
    const result = await login(fd)
    if (result?.error) {
      setError(result.error)
      toast.error(result.error)
    }
    setLoading(false)
  }

  return (
    <div className="glass-card rounded-[3rem] p-10 max-w-sm mx-auto">
      <div className="flex justify-center mb-6">
        <div className="w-14 h-14 rounded-full hoverboard-gradient flex items-center justify-center text-white shadow-lg shadow-emerald-500/25">
          <Zap className="h-7 w-7" fill="currentColor" />
        </div>
      </div>
      <h1 className="text-3xl font-display font-extrabold text-slate-900 text-center mb-1">
        Đăng nhập 👋
      </h1>
      <p className="text-slate-500 text-sm text-center mb-8">
        Theo dõi dinh dưỡng với CalSnap AI
      </p>

      {message && (
        <div className="glass-card rounded-2xl p-4 mb-4 bg-emerald-50 border border-emerald-100 text-left">
          <p className="text-sm text-emerald-700 font-medium">
            {message}
          </p>
        </div>
      )}

      {error && (
        <div className="glass-card rounded-2xl p-4 mb-4 bg-red-50/50 border border-red-100">
          <p className="text-sm text-red-700 font-medium">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <Label htmlFor="email" className="sr-only">Email</Label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Email"
                required
                className="pl-12 pr-4 py-3 bg-slate-50 rounded-2xl border-none focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="password" className="sr-only">Password</Label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Mật khẩu"
                required
                className="pl-12 pr-12 py-3 bg-slate-50 rounded-2xl border-none focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-400 hover:text-slate-600 touch-target"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>
        <Button
          type="submit"
          className="w-full mt-6 hoverboard-gradient text-white font-bold rounded-2xl py-4 min-h-[44px] active:scale-95 transition-all touch-target"
          disabled={loading}
        >
          {loading ? 'Đang đăng nhập…' : 'Đăng nhập'}
        </Button>

        {/* Divider */}
        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-px bg-slate-200" />
          <span className="text-xs text-slate-400 font-medium">hoặc</span>
          <div className="flex-1 h-px bg-slate-200" />
        </div>

        {/* Google OAuth */}
        <form action={loginWithGoogle}>
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl border-2 border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm transition-all active:scale-95"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Đăng nhập với Google
          </button>
        </form>
        <p className="text-sm text-slate-500 text-center mt-6">
          Chưa có tài khoản?{' '}
          <Link href="/register" className="text-emerald-600 font-semibold hover:underline">
            Tạo tài khoản
          </Link>
        </p>
      </form>
    </div>
  )
}
