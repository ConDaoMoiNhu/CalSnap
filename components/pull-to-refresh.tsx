'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

import { triggerHaptic, playFeedbackSound } from '@/lib/feedback'

// Remove local triggerHaptic implementation as it's now shared

export function PullToRefresh({ children }: { children: React.ReactNode }) {
    const [startY, setStartY] = useState(0)
    const [currentY, setCurrentY] = useState(0)
    const [isPulling, setIsPulling] = useState(false)
    const [isRefreshing, setIsRefreshing] = useState(false)

    // Ref để tracking trạng thái haptic threshold (chỉ rung 1 lần khi vượt ngưỡng)
    const thresholdReached = useRef(false)
    const router = useRouter()
    const contentRef = useRef<HTMLDivElement>(null)

    const PULL_THRESHOLD = 80
    const REFRESH_HEIGHT = 65
    const MAX_PULL = 180

    // Hàm tính toán độ cản (resistance) theo đường cong tự nhiên (giống iOS)
    // Khi kéo càng xa, UI di chuyển càng chậm
    const calculateResistance = (distance: number) => {
        return MAX_PULL * Math.log10(1 + (distance / MAX_PULL));
    }

    useEffect(() => {
        const handleTouchStart = (e: TouchEvent) => {
            // Chỉ kích hoạt chức năng vuốt xuống khi đang ở đỉnh trang
            if (window.scrollY === 0) {
                setStartY(e.touches[0].clientY)
                setIsPulling(true)
                thresholdReached.current = false // Reset trạng thái
            }
        }

        const handleTouchMove = (e: TouchEvent) => {
            if (!isPulling || isRefreshing) return

            const y = e.touches[0].clientY
            const distance = y - startY

            // Chỉ thực hiện khi người dùng vuốt xuống trang (từ đỉnh)
            if (distance > 0) {
                // Ngăn chặn cuộn trang mặc định của trình duyệt để hiển thị animation riêng
                if (e.cancelable) e.preventDefault()

                const resistedY = calculateResistance(distance)
                setCurrentY(resistedY)

                // Haptic feedback khi vượt qua ngưỡng làm mới
                if (resistedY >= PULL_THRESHOLD && !thresholdReached.current) {
                    triggerHaptic('medium')
                    thresholdReached.current = true
                } else if (resistedY < PULL_THRESHOLD && thresholdReached.current) {
                    // Rút lại dưới ngưỡng
                    thresholdReached.current = false
                }
            }
        }

        const handleTouchEnd = async () => {
            if (!isPulling || isRefreshing) return
            setIsPulling(false)

            if (currentY >= PULL_THRESHOLD) {
                setIsRefreshing(true)
                setCurrentY(REFRESH_HEIGHT) // Giữ ở một khoảng hở đủ để scroll loading

                triggerHaptic('light')
                router.refresh()

                // Timeout chờ load (hoặc giả lập network duration để có độ trễ mượt)
                await new Promise(resolve => setTimeout(resolve, 800))

                triggerHaptic('success')
                setIsRefreshing(false)
                setCurrentY(0)
            } else {
                // Hủy pull và thả lại
                setCurrentY(0)
            }
        }

        const handleExternalRefresh = () => {
            if (isRefreshing) return;
            setIsRefreshing(true);
            setCurrentY(REFRESH_HEIGHT);
            triggerHaptic('light');
            playFeedbackSound('tick');
            router.refresh();

            setTimeout(() => {
                setIsRefreshing(false);
                setCurrentY(0);
                triggerHaptic('success');
            }, 1000);
        };

        window.addEventListener('calsnap:trigger-refresh', handleExternalRefresh);

        const element = contentRef.current
        if (element) {
            // Quan trọng: { passive: false } ở touchmove để có thể preventDefault()
            element.addEventListener('touchstart', handleTouchStart, { passive: true })
            element.addEventListener('touchmove', handleTouchMove, { passive: false })
            element.addEventListener('touchend', handleTouchEnd)
        }

        return () => {
            window.removeEventListener('calsnap:trigger-refresh', handleExternalRefresh);
            if (element) {
                element.removeEventListener('touchstart', handleTouchStart)
                element.removeEventListener('touchmove', handleTouchMove)
                element.removeEventListener('touchend', handleTouchEnd)
            }
        }
    }, [startY, isPulling, isRefreshing, currentY, router])

    // Tính animation dựa trên độ nén (Scale và Opacity)
    const opacity = Math.min(1, currentY / (PULL_THRESHOLD * 0.8))
    const scale = 0.5 + Math.min(0.5, currentY / PULL_THRESHOLD)
    const rotateCounter = currentY * 3

    return (
        <div ref={contentRef} className="min-h-screen relative overflow-hidden bg-slate-50 dark:bg-slate-900">
            {/* iOS Style Pull indicator nằm bên dưới nội dung đẩy xuống */}
            <div
                className="absolute top-0 left-0 right-0 flex justify-center items-center h-20 w-full z-0 pointer-events-none"
            >
                <div
                    className="flex items-center justify-center transition-opacity"
                    style={{ opacity, transform: `scale(${isRefreshing ? 1 : scale})` }}
                >
                    {isRefreshing ? (
                        <div className="flex flex-col items-center gap-2">
                            <Loader2 className="h-6 w-6 text-emerald-500 animate-spin" />
                        </div>
                    ) : (
                        <div
                            className="flex h-8 w-8 items-center justify-center rounded-full bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 text-slate-400 dark:text-slate-500"
                            style={{ transform: `rotate(${rotateCounter}deg)` }}
                        >
                            <Loader2 className="h-4 w-4" />
                        </div>
                    )}
                </div>
            </div>

            {/* Main Content wrapper */}
            <div
                className="w-full h-full relative z-10 bg-white dark:bg-[#0a0f1c] min-h-screen origin-top shadow-[-10px_0_20px_rgba(0,0,0,0.03)]"
                style={{
                    transform: currentY > 0 ? `translateY(${currentY}px)` : undefined,
                    // Dùng spring physics cảm giác giống iOS hơn: bezier curve có nảy nhẹ
                    transition: isPulling ? 'none' : 'transform 0.4s cubic-bezier(0.3, 1.05, 0.4, 1)',
                    // Cbo cong mượt mà mô phỏng app khi bị kéo
                    borderRadius: currentY > 0 ? '24px 24px 0 0' : '0px',
                }}
            >
                {children}
            </div>
        </div>
    )
}
