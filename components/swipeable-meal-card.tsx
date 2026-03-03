'use client'

import { useRef, useState, useCallback } from 'react'

interface Props {
    children: React.ReactNode
    onDelete: () => void | Promise<void>
    className?: string
}

const SWIPE_THRESHOLD = 60 // px to reveal the delete button

export function SwipeableMealCard({ children, onDelete, className = '' }: Props) {
    const [offset, setOffset] = useState(0)
    const [isDragging, setIsDragging] = useState(false)
    const [isOpen, setIsOpen] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const startX = useRef(0)
    const startOffset = useRef(0)

    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        startX.current = e.touches[0].clientX
        startOffset.current = offset
        setIsDragging(true)
    }, [offset])

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
        if (!isDragging) return
        const delta = e.touches[0].clientX - startX.current
        const newOffset = Math.min(0, Math.max(-120, startOffset.current + delta))
        setOffset(newOffset)
    }, [isDragging])

    const handleTouchEnd = useCallback(() => {
        setIsDragging(false)
        if (offset < -SWIPE_THRESHOLD) {
            setOffset(-80)
            setIsOpen(true)
        } else {
            setOffset(0)
            setIsOpen(false)
        }
    }, [offset])

    const handleDelete = async () => {
        setDeleting(true)
        await onDelete()
        setDeleting(false)
    }

    const close = () => {
        setOffset(0)
        setIsOpen(false)
    }

    return (
        <div className={`relative overflow-hidden rounded-[2rem] ${className}`}>
            {/* Delete button revealed on swipe */}
            <div className="absolute inset-y-0 right-0 flex items-center justify-center w-20 bg-red-500 rounded-r-[2rem]">
                <button
                    onClick={handleDelete}
                    disabled={deleting}
                    aria-label="Xóa bữa ăn"
                    className="flex flex-col items-center gap-1 text-white font-bold text-xs px-3 disabled:opacity-70"
                >
                    {deleting ? (
                        <span className="text-lg animate-spin">⏳</span>
                    ) : (
                        <>
                            <span className="text-lg">🗑️</span>
                            <span>Xóa</span>
                        </>
                    )}
                </button>
            </div>

            {/* Overlay to close when tapping */}
            {isOpen && (
                <div
                    className="absolute inset-0 z-10"
                    style={{ right: 80 }}
                    onClick={close}
                />
            )}

            {/* Swipeable card */}
            <div
                className={`relative z-20 ${isDragging ? '' : 'transition-transform duration-200'}`}
                style={{ transform: `translateX(${offset}px)` }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                {children}
            </div>
        </div>
    )
}
