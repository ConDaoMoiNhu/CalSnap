'use client'

import { useState, useEffect } from 'react'

interface Props {
  children: React.ReactNode
  delay?: number
}

export function DelayedSkeleton({ children, delay = 300 }: Props) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setShow(true), delay)
    return () => clearTimeout(t)
  }, [delay])

  if (!show) return null
  return <>{children}</>
}
