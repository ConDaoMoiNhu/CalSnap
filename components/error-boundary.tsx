'use client'

import { useEffect } from 'react'

interface ErrorBoundaryProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function ErrorBoundary({ error, reset }: ErrorBoundaryProps) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex items-center justify-center min-h-[400px] p-4">
      <div className="glass-card rounded-[2rem] p-8 max-w-md w-full text-center space-y-5">
        <div className="hoverboard-gradient w-16 h-16 rounded-full flex items-center justify-center mx-auto text-3xl">
          ⚠️
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">
            Có lỗi xảy ra!
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 break-words">
            {error.message || 'Đã xảy ra lỗi không mong muốn. Vui lòng thử lại.'}
          </p>
          {error.digest && (
            <p className="text-xs text-gray-400 font-mono">ID: {error.digest}</p>
          )}
        </div>
        <button
          onClick={reset}
          className="hoverboard-gradient text-white font-semibold px-6 py-2.5 rounded-[2rem] transition-opacity hover:opacity-90 active:scale-95"
        >
          Thử lại
        </button>
      </div>
    </div>
  )
}
