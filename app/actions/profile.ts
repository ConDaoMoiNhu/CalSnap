'use server'

import { createClient } from '@/lib/supabase/server'

export async function updateGoals(formData: FormData): Promise<void> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    console.error('updateGoals: not authenticated')
    return
  }

  const dailyCaloriesRaw = formData.get('daily_calories') as string | null
  const targetWeightRaw = formData.get('target_weight_kg') as string | null

  const dailyCalories = dailyCaloriesRaw ? parseInt(dailyCaloriesRaw, 10) : null
  const targetWeight = targetWeightRaw ? parseFloat(targetWeightRaw) : null

  const update: Record<string, number> = {}
  if (dailyCalories && dailyCalories > 800 && dailyCalories < 6000) {
    update.daily_calorie_goal = dailyCalories
  }
  if (targetWeight && targetWeight > 30 && targetWeight < 250) {
    update.target_weight_kg = targetWeight
  }

  if (Object.keys(update).length === 0) {
    console.error('updateGoals: invalid values')
    return
  }

  const { error } = await supabase
    .from('profiles')
    .update(update)
    .eq('id', user.id)

  if (error) {
    console.error('updateGoals error:', error.message)
  }
}


