'use client'

import { useState, useCallback } from 'react'
import { upsertSteps, upsertWater } from '@/app/actions/habits'
import { Droplets, Footprints, Plus, Minus } from 'lucide-react'
import { toast } from 'sonner'

interface Props {
    date: string
    initialSteps?: number
    initialWaterMl?: number
}

const WATER_PRESETS = [150, 250, 350, 500]
const STEP_PRESETS = [1000, 3000, 5000, 10000]

export function DailyTracker({ date, initialSteps = 0, initialWaterMl = 0 }: Props) {
    const [steps, setSteps] = useState(initialSteps)
    const [waterMl, setWaterMl] = useState(initialWaterMl)
    const [savingSteps, setSavingSteps] = useState(false)
    const [savingWater, setSavingWater] = useState(false)

    const saveSteps = useCallback(async (newVal: number) => {
        setSavingSteps(true)
        const res = await upsertSteps(date, Math.max(0, newVal))
        setSavingSteps(false)
        if (res?.error) toast.error(res.error)
        else setSteps(Math.max(0, newVal))
    }, [date])

    const saveWater = useCallback(async (newVal: number) => {
        setSavingWater(true)
        const res = await upsertWater(date, Math.max(0, newVal))
        setSavingWater(false)
        if (res?.error) toast.error(res.error)
        else setWaterMl(Math.max(0, newVal))
    }, [date])

    const waterCups = Math.round(waterMl / 250)
    const waterGoal = 8 // 8 cups = 2000ml

    return (
        <div className="glass-card rounded-[2rem] p-5 space-y-5">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Nước & Bước chân</p>

            {/* ── WATER ── */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center">
                            <Droplets className="h-4 w-4 text-blue-500" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-800">{waterMl} ml</p>
                            <p className="text-[10px] text-slate-400">{waterCups}/{waterGoal} ly</p>
                        </div>
                    </div>
                    <div className="flex gap-1">
                        <button
                            onClick={() => saveWater(waterMl - 250)}
                            disabled={savingWater || waterMl <= 0}
                            className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 disabled:opacity-40 hover:bg-slate-200 transition-colors"
                            aria-label="Bớt nước"
                        >
                            <Minus className="h-3 w-3" />
                        </button>
                        <button
                            onClick={() => saveWater(waterMl + 250)}
                            disabled={savingWater}
                            className="w-8 h-8 rounded-xl hoverboard-gradient flex items-center justify-center text-white disabled:opacity-60 transition-opacity"
                            aria-label="Thêm nước"
                        >
                            <Plus className="h-3 w-3" />
                        </button>
                    </div>
                </div>

                {/* Water progress bar */}
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-blue-400 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, (waterMl / (waterGoal * 250)) * 100)}%` }}
                    />
                </div>

                {/* Quick add */}
                <div className="flex gap-1.5 flex-wrap">
                    {WATER_PRESETS.map((ml) => (
                        <button
                            key={ml}
                            onClick={() => saveWater(waterMl + ml)}
                            disabled={savingWater}
                            className="px-2.5 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-[10px] font-bold disabled:opacity-60 hover:bg-blue-100 transition-colors"
                        >
                            +{ml}ml
                        </button>
                    ))}
                </div>
            </div>

            <div className="border-t border-slate-100" />

            {/* ── STEPS ── */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-orange-50 flex items-center justify-center">
                            <Footprints className="h-4 w-4 text-orange-500" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-800">{steps.toLocaleString()} bước</p>
                            <p className="text-[10px] text-slate-400">Mục tiêu: 10,000</p>
                        </div>
                    </div>
                    <div className="flex gap-1">
                        <button
                            onClick={() => saveSteps(steps - 1000)}
                            disabled={savingSteps || steps <= 0}
                            className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 disabled:opacity-40 hover:bg-slate-200 transition-colors"
                            aria-label="Bớt bước"
                        >
                            <Minus className="h-3 w-3" />
                        </button>
                        <button
                            onClick={() => saveSteps(steps + 1000)}
                            disabled={savingSteps}
                            className="w-8 h-8 rounded-xl hoverboard-gradient flex items-center justify-center text-white disabled:opacity-60 transition-opacity"
                            aria-label="Thêm bước"
                        >
                            <Plus className="h-3 w-3" />
                        </button>
                    </div>
                </div>

                {/* Steps progress bar */}
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-orange-400 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, (steps / 10000) * 100)}%` }}
                    />
                </div>

                {/* Quick add */}
                <div className="flex gap-1.5 flex-wrap">
                    {STEP_PRESETS.map((s) => (
                        <button
                            key={s}
                            onClick={() => saveSteps(steps + s)}
                            disabled={savingSteps}
                            className="px-2.5 py-1 rounded-full bg-orange-50 border border-orange-100 text-orange-600 text-[10px] font-bold disabled:opacity-60 hover:bg-orange-100 transition-colors"
                        >
                            +{s.toLocaleString()}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}
