import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const QuerySchema = z.object({
  year: z.coerce.number().int().min(2020).max(2100),
  month: z.coerce.number().int().min(1).max(12),
})

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(req.url)
    const queryParsed = QuerySchema.safeParse({
      year: url.searchParams.get('year') ?? new Date().getFullYear(),
      month: url.searchParams.get('month') ?? new Date().getMonth() + 1,
    })
    if (!queryParsed.success) {
      return NextResponse.json({ error: 'year và month phải là số hợp lệ.' }, { status: 400 })
    }
    const { year, month } = queryParsed.data

    const start = new Date(year, month - 1, 1)
    const end = new Date(year, month, 0)
    const startStr = start.toISOString().split('T')[0]
    const endStr = end.toISOString().split('T')[0]

    const [{ data: meals }, { data: habits }] = await Promise.all([
      supabase
        .from('meal_logs')
        .select('logged_at, calories, protein, carbs, fat')
        .eq('user_id', user.id)
        .gte('logged_at', startStr)
        .lte('logged_at', endStr),
      supabase
        .from('daily_habits')
        .select('date, steps, water_ml, exercise_minutes, exercise_calories')
        .eq('user_id', user.id)
        .gte('date', startStr)
        .lte('date', endStr),
    ])

    type DayAgg = {
      calories: number
      protein: number
      carbs: number
      fat: number
      steps: number
      water_ml: number
      exercise_minutes: number
    }

    const byDate = new Map<string, DayAgg>()

      ; (meals ?? []).forEach((m) => {
        const key = m.logged_at
        const existing =
          byDate.get(key) ?? {
            calories: 0,
            protein: 0,
            carbs: 0,
            fat: 0,
            steps: 0,
            water_ml: 0,
            exercise_minutes: 0,
          }
        existing.calories += m.calories ?? 0
        existing.protein += m.protein ?? 0
        existing.carbs += m.carbs ?? 0
        existing.fat += m.fat ?? 0
        byDate.set(key, existing)
      })

      ; (habits ?? []).forEach((h) => {
        const key = h.date
        const existing =
          byDate.get(key) ?? {
            calories: 0,
            protein: 0,
            carbs: 0,
            fat: 0,
            steps: 0,
            water_ml: 0,
            exercise_minutes: 0,
          }
        existing.steps = h.steps ?? 0
        existing.water_ml = h.water_ml ?? 0
        existing.exercise_minutes = h.exercise_minutes ?? 0
        byDate.set(key, existing)
      })

    const days = Array.from(byDate.entries())
      .sort(([a], [b]) => (a < b ? -1 : 1))
      .map(([date, v]) => ({
        date,
        ...v,
      }))

    if (days.length === 0) {
      return NextResponse.json({
        year,
        month,
        days: [],
        avgCalories: 0,
        avgProtein: 0,
        avgSteps: 0,
      })
    }

    const total = days.reduce(
      (acc, d) => {
        acc.calories += d.calories
        acc.protein += d.protein
        acc.steps += d.steps
        return acc
      },
      { calories: 0, protein: 0, steps: 0 },
    )

    const dayCount = days.length

    return NextResponse.json({
      year,
      month,
      days,
      avgCalories: total.calories / dayCount,
      avgProtein: total.protein / dayCount,
      avgSteps: total.steps / dayCount,
    })
  } catch (error) {
    console.error('Monthly summary error:', error)
    return NextResponse.json(
      { error: 'Không lấy được tổng kết tháng.' },
      { status: 500 },
    )
  }
}

