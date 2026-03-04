// app/api/assistant/route.ts
import { createClient } from '@/lib/supabase/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { message, imageBase64, history } = await req.json()

    const apiKey = process.env.GOOGLE_AI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const today = new Date().toISOString().split('T')[0]

    const [{ data: profile }, { data: todayMeals }, { data: adherence }] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase.from('meal_logs').select('food_name, calories, protein, carbs, fat').eq('user_id', user.id).eq('logged_at', today),
      supabase.from('plan_adherence').select('*').eq('user_id', user.id).eq('date', today).single(),
    ])

    const plan = profile?.fitness_plan as any
    const actualCalories = todayMeals?.reduce((s, m) => s + m.calories, 0) ?? 0
    const calorieGoal = plan?.daily_calories ?? profile?.daily_calorie_goal ?? 2000
    const caloriesLeft = calorieGoal - actualCalories

    const systemPrompt = `Bạn là Trợ lý Dinh dưỡng Tối cao của CalSnap, một chuyên gia quyết đoán và thân thiện.
Nhiệm vụ của bạn là giúp người dùng theo dõi sức khỏe một cách NHANH NHẤT và TIỆN NHẤT.

## QUY TẮC CỐT LÕI (PROACTIVE ACTIONS):
1. **LUÔN tự động ước tính**: Khi người dùng nhắc đến món ăn mà không có số liệu, bạn KHÔNG ĐƯỢC HỎI LẠI. Hãy tự tin ước tính dựa trên khẩu phần Việt Nam chuẩn và thực hiện LOG ngay lập tức.
2. **Tự động LOG**: Khi user nói "Tôi ăn X", "vừa ăn X" -> Phân tích -> Ước tính -> Gửi mã [ACTION:LOG_MEAL:...] ở cuối mỗi câu trả lời.
3. **Ước tính thông minh**: Nếu user nói "1 tô phở", hãy tự hiểu đó là ~500-600kcal. Nếu nói "1 dĩa cơm tấm", hãy hiểu đó là ~700kcal.

## CƠ SỞ DỮ LIỆU ƯỚC TÍNH (Tham khảo):
- Cơm trắng (1 chén/100g): 130 kcal (P:2.7g, C:28g, F:0.3g)
- Phở bò (1 tô): 550 kcal (P:25g, C:55g, F:20g)
- Bánh mì thịt (1 ổ): 450 kcal (P:18g, C:50g, F:20g)
- Trứng ốp la (1 quả): 75 kcal (P:6.5g, C:0.5g, F:5g)
- Cơm tấm sườn bì chả (1 dĩa): 750 kcal (P:35g, C:85g, F:30g)
- Bún chả (1 suất): 500 kcal (P:22g, C:60g, F:20g)

## DỮ LIỆU NGƯỜI DÙNG HÔM NAY (${today}):
- Đã ăn: ${actualCalories} / ${calorieGoal} kcal (còn ${caloriesLeft} kcal)
- Protein: ${adherence?.protein_actual ?? 0}g / ${plan?.daily_protein_g ?? 0}g
- Carbs: ${adherence?.carbs_actual ?? 0}g / ${plan?.daily_carbs_g ?? 0}g  
- Fat: ${adherence?.fat_actual ?? 0}g / ${plan?.daily_fat_g ?? 0}g
- Streak: ${profile?.journey_streak ?? 0} ngày

## CÁC BỮA ĂN HÔM NAY (Dùng để Sửa/Xóa):
${todayMeals?.map((m: any) => `[ID:${m.id}] ${m.food_name}: ${m.calories} kcal`).join('\n') || '- Chưa có dữ liệu'}

## ĐỊNH DẠNG HÀNH ĐỘNG (ACTION):
Luôn đặt ACTION ở cuối cùng của response, không có văn bản nào sau nó.
[ACTION:LOG_MEAL:{"foodName":"Tên món","calories":123,"protein":10,"carbs":20,"fat":5,"quantity":1}]
[ACTION:UPDATE_MEAL:{"mealId":"ID","foodName":"Tên","calories":123,...}]
[ACTION:DELETE_MEAL:{"mealId":"ID","foodName":"Tên"}]

## PHONG CÁCH PHẢN HỒI:
- Tiếng Việt hiện đại, dùng "anh/chị/bạn" tùy ngữ cảnh.
- Ngắn gọn, tập trung vào kết quả.
- Sau khi log: "Đã xong! Em đã ghi nhận 100g cơm trắng cho anh rồi nhé. Hôm nay anh còn được ăn thêm ${caloriesLeft} kcal nữa ạ! 🔥"
- KHÔNG BAO GIỜ nói "Em không biết" hoặc "Bạn hãy cung cấp số liệu". Hãy tự tính!`

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    const parts: any[] = []
    if (message?.trim()) parts.push({ text: message.trim() })
    if (imageBase64) parts.push({ inlineData: { mimeType: 'image/jpeg', data: imageBase64 } })
    if (parts.length === 0) parts.push({ text: 'Xin chao' })

    const chatHistory = (history ?? [])
      .filter((m: any) => m.content?.trim())
      .map((m: any) => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }],
      }))

    const chat = model.startChat({
      history: [
        { role: 'user', parts: [{ text: 'System context: ' + systemPrompt }] },
        { role: 'model', parts: [{ text: 'Da hieu! Toi san sang ho tro ban.' }] },
        ...chatHistory,
      ],
    })

    const result = await chat.sendMessage(parts)
    const reply = result.response.text()

    return NextResponse.json({ reply })
  } catch (error: any) {
    console.error('Assistant error:', error)

    const message =
      typeof error?.message === 'string' ? error.message.toLowerCase() : ''

    if (
      message.includes('quota') ||
      message.includes('exceeded') ||
      message.includes('rate limit') ||
      message.includes('429')
    ) {
      return NextResponse.json(
        {
          error:
            'Hệ thống AI đang quá tải hoặc đã vượt giới hạn trong thời gian ngắn. Vui lòng thử lại sau vài phút.',
        },
        { status: 429 },
      )
    }

    return NextResponse.json(
      { error: `Đã xảy ra lỗi trên hệ thống AI: ${message.slice(0, 500)}` },
      { status: 500 },
    )
  }
}
