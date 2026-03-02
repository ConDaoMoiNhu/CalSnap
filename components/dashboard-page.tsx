// components/dashboard-page.tsx
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { CalorieProgress } from '@/components/calorie-progress'
import { HabitCards } from '@/components/habit-cards'
import { WeeklyReport } from '@/components/weekly-report'
import { WeightCheckin } from '@/components/weight-checkin'
import { MacroPill } from '@/components/macro-pill'
import type { Profile as DbProfile } from '@/lib/types'
import { WeeklyChart } from '@/components/weekly-chart'
import { QuickRelog } from '@/components/quick-relog'
import { getMealsForDate, getWeeklyCalories, relogMeal } from '@/app/actions/meals'
import { toast } from 'sonner'

interface MealSummary {
  calories: number
  protein: number
  carbs: number
  fat: number
}

export default function DashboardPage() {
  const [profile, setProfile] = useState<DbProfile | null>(null)
  const [totals, setTotals] = useState<MealSummary | null>(null)
  const [date, setDate] = useState(() =>
    new Date().toISOString().split('T')[0]
  )
  const [recentMeals, setRecentMeals] = useState<any[]>([])
  const [weeklyCalories, setWeeklyCalories] = useState<{ date: string; calories: number }[]>([])
  const [loadingWeekly, setLoadingWeekly] = useState(true)

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const [{ data: prof }, { data: meals }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('meal_logs')
          .select('calories, protein, carbs, fat')
          .eq('user_id', user.id)
          .eq('logged_at', date),
      ])

      if (prof) setProfile(prof as DbProfile)

      if (meals && meals.length > 0) {
        const t = (meals as any[]).reduce(
          (acc, m) => ({
            calories: acc.calories + m.calories,
            protein: acc.protein + m.protein,
            carbs: acc.carbs + m.carbs,
            fat: acc.fat + m.fat,
          }),
          { calories: 0, protein: 0, carbs: 0, fat: 0 }
        )
        setTotals(t)
      } else {
        setTotals({ calories: 0, protein: 0, carbs: 0, fat: 0 })
      }

      // Load "log lại gần đây" (một lần)
      if (recentMeals.length === 0) {
        try {
          const data = await getMealsForDate('recent')
          setRecentMeals((data as any[]) ?? [])
        } catch {
          // ignore
        }
      }
    }

    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date])

  useEffect(() => {
    const loadWeekly = async () => {
      setLoadingWeekly(true)
      try {
        const data = await getWeeklyCalories()
        setWeeklyCalories((data as any[]) ?? [])
      } finally {
        setLoadingWeekly(false)
      }
    }
    loadWeekly()
  }, [])

  const plan = profile?.fitness_plan as any
  const calorieGoal = plan?.daily_calories ?? profile?.daily_calorie_goal ?? 2000
  const calories = totals?.calories ?? 0

  // 7 ngày của tuần hiện tại (bắt đầu từ Chủ nhật)
  const today = new Date()
  const weekdayLabels = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
  const startOfWeek = new Date(today)
  startOfWeek.setDate(today.getDate() - today.getDay())
  const headerDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek)
    d.setDate(startOfWeek.getDate() + i)
    return d
  })

  const needsOnboarding =
    !profile?.height_cm || !profile?.age || !profile?.goal || !profile?.activity_level

  const todayStr = new Date().toISOString().split('T')[0]

  return (
    <div className="space-y-6 max-w-5xl mx-auto page-enter pb-24">
      {/* Header + calories */}
      <div className="grid gap-4 md:grid-cols-[minmax(0,3fr)_minmax(0,2.2fr)]">
        <div className="hoverboard-card rounded-[2.5rem] p-6 md:p-8 flex flex-col gap-5">
          {/* Greeting + clickable weekdays */}
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-white/70">
                Good Morning
              </p>
              <h1 className="text-2xl md:text-3xl font-black text-white">
                {profile?.full_name ?? 'CalSnap user'}
              </h1>
            </div>
            <div className="flex gap-1.5 bg-black/10 rounded-2xl px-2 py-1.5">
              {headerDays.map((d, idx) => {
                const dStr = d.toISOString().split('T')[0]
                const isActive = dStr === date
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setDate(dStr)}
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-black transition-all ${
                      isActive
                        ? 'bg-white text-emerald-500'
                        : 'bg-white/10 text-white/70 hover:bg-white/20'
                    }`}
                  >
                    {weekdayLabels[d.getDay()]}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Today's Calories card */}
          <div className="bg-white/10 rounded-[2rem] p-4 md:p-5 space-y-4">
            {totals && (
              <CalorieProgress
                consumed={calories}
                goal={calorieGoal}
              />
            )}

            <div className="flex flex-wrap gap-2">
              <MacroPill type="protein" value={totals?.protein ?? 0} variant="light" />
              <MacroPill type="carbs" value={totals?.carbs ?? 0} variant="light" />
              <MacroPill type="fat" value={totals?.fat ?? 0} variant="light" />
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2">
              {[
                { label: 'GOAL', value: calorieGoal },
                { label: 'FOOD', value: calories },
                { label: 'EXERCISE', value: 0 },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl bg-white/10 px-3 py-2.5 text-xs text-white/80"
                >
                  <p className="text-[10px] font-semibold uppercase tracking-wide">
                    {item.label}
                  </p>
                  <p className="text-lg font-black mt-0.5">
                    {item.value.toLocaleString()}
                    <span className="text-[10px] font-semibold ml-1">kcal</span>
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AI logging */}
        <div className="space-y-4">
          <div className="glass-card rounded-[2rem] p-5 flex flex-col gap-3">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              AI-Powered Food Logging
            </p>
            <p className="text-sm font-black text-slate-800">
              Transform your nutrition tracking với trợ lý AI.
            </p>
            <div className="mt-1 mb-2">
              <div className="flex items-center gap-2 bg-slate-50 rounded-2xl px-3 py-2">
                <span className="text-lg">✨</span>
                <p className="text-xs text-slate-500">
                  Tap to ask AI...{' '}
                  <span className="font-semibold text-slate-700">
                    "150g Cơm tấm sườn"
                  </span>
                </p>
              </div>
            </div>
            <Link
              href="/chat"
              className="inline-flex items-center justify-center px-4 py-2.5 rounded-2xl hoverboard-gradient text-white text-xs font-bold"
            >
              Mở AI Assistant
            </Link>

            <div className="mt-3 grid grid-cols-3 gap-2">
              {[
                { label: 'Voice Log', icon: '🎙️', href: '/chat' },
                { label: 'Meal Scan', icon: '📸', href: '/scan' },
                { label: 'Barcode', icon: '🔍', href: '/scan' },
              ].map((tool) => (
                <Link
                  key={tool.label}
                  href={tool.href}
                  className="rounded-2xl bg-slate-50 px-3 py-3 text-[11px] font-semibold text-slate-700 flex flex-col gap-1"
                >
                  <span className="text-lg">{tool.icon}</span>
                  <span>{tool.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Habits + weekly + weight */}
      <div className="grid gap-4 md:grid-cols-[minmax(0,2.2fr)_minmax(0,2fr)]">
        <div className="space-y-4">
          <HabitCards date={date} initialHabits={null} />
        </div>

        <div className="space-y-4">
          {/* Lấp khoảng trống: biểu đồ + log lại nhanh */}
          <div className="glass-card rounded-[2rem] p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Calories 7 ngày gần nhất
              </h3>
              <span className="text-[10px] text-slate-400 font-semibold">
                Goal {calorieGoal.toLocaleString()} kcal
              </span>
            </div>
            {loadingWeekly ? (
              <div className="h-48 rounded-2xl bg-slate-50 animate-pulse" />
            ) : weeklyCalories.length === 0 ? (
              <p className="text-xs text-slate-400">
                Chưa có dữ liệu tuần này — hãy log vài bữa ăn để thấy biểu đồ nhé.
              </p>
            ) : (
              <WeeklyChart data={weeklyCalories} goal={calorieGoal} />
            )}
          </div>

          <div className="glass-card rounded-[2rem] p-5">
            <QuickRelog
              recentMeals={recentMeals}
              onRelog={async (meal) => {
                const res = await relogMeal(meal)
                if ((res as any)?.error) {
                  toast.error((res as any).error)
                  return
                }
                toast.success(`Đã log lại: ${meal.food_name} (${meal.calories} kcal)`)

                // Nếu đang xem hôm nay thì refresh totals ngay để dashboard "sống"
                if (date === todayStr) {
                  const supabase = createClient()
                  const { data: { user } } = await supabase.auth.getUser()
                  if (!user) return
                  const { data: meals } = await supabase.from('meal_logs')
                    .select('calories, protein, carbs, fat')
                    .eq('user_id', user.id)
                    .eq('logged_at', todayStr)
                  const t = (meals as any[] | null)?.reduce(
                    (acc, m) => ({
                      calories: acc.calories + m.calories,
                      protein: acc.protein + m.protein,
                      carbs: acc.carbs + m.carbs,
                      fat: acc.fat + m.fat,
                    }),
                    { calories: 0, protein: 0, carbs: 0, fat: 0 }
                  ) ?? { calories: 0, protein: 0, carbs: 0, fat: 0 }
                  setTotals(t)
                }
              }}
            />
          </div>

          {/* Giữ lại WeeklyReport để sau này gắn data */}
          <WeeklyReport data={null} />
          {profile?.weight_kg && profile?.target_weight_kg && (
            <WeightCheckin
              currentWeight={profile.weight_kg}
              targetWeight={profile.target_weight_kg}
              history={[]}
            />
          )}
        </div>
      </div>

      {/* Onboarding CTA */}
      {needsOnboarding && (
        <div className="glass-card rounded-[2rem] p-5 border-2 border-dashed border-emerald-200 bg-emerald-50/40 flex flex-col gap-3">
          <h3 className="text-sm font-black text-slate-800">
            Hoàn thiện hồ sơ để nhận plan AI cá nhân hóa 📝
          </h3>
          <p className="text-xs text-slate-500">
            Thêm tuổi, giới tính, chiều cao, cân nặng và mục tiêu để CalSnap tính toán calories và plan luyện tập phù hợp.
          </p>
          <div className="flex flex-wrap gap-2 text-[11px] text-slate-500">
            <span className="px-2 py-1 rounded-full bg-white/70 font-semibold">Tuổi</span>
            <span className="px-2 py-1 rounded-full bg-white/70 font-semibold">Giới tính</span>
            <span className="px-2 py-1 rounded-full bg-white/70 font-semibold">Chiều cao</span>
            <span className="px-2 py-1 rounded-full bg-white/70 font-semibold">Cân nặng</span>
            <span className="px-2 py-1 rounded-full bg-white/70 font-semibold">Mục tiêu</span>
          </div>
          <Link
            href="/onboarding"
            className="self-start mt-1 inline-flex items-center justify-center px-4 py-2.5 rounded-2xl hoverboard-gradient text-white text-xs font-bold"
          >
            Tạo plan với AI →
          </Link>
        </div>
      )}
    </div>
  )
}

