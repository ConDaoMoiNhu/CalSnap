'use client'

import Link from 'next/link'
import { ShieldAlert, ArrowLeft, HeartPulse, AlertTriangle } from 'lucide-react'

export default function SafetyPage() {
  return (
    <div className="page-enter max-w-3xl mx-auto pb-24 space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <Link
          href="/profile"
          className="w-9 h-9 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-slate-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Safety
          </p>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 flex items-center gap-2">
            Giới hạn & Lưu ý an toàn
            <ShieldAlert className="w-5 h-5 text-amber-500" />
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            CalSnap hỗ trợ bạn theo dõi dinh dưỡng và thói quen, nhưng không thay thế cho tư vấn y khoa.
          </p>
        </div>
      </div>

      <div className="glass-card rounded-[2rem] p-5 md:p-6 space-y-3">
        <div className="flex items-center gap-3 mb-1">
          <HeartPulse className="w-5 h-5 text-emerald-500" />
          <p className="text-sm font-bold text-slate-800">
            1. Ứng dụng không phải là bác sĩ
          </p>
        </div>
        <p className="text-xs md:text-sm text-slate-600">
          Mọi gợi ý về calories, macro, mục tiêu cân nặng và kế hoạch tập luyện đều mang tính tham khảo chung
          dựa trên thông tin bạn cung cấp. Nếu bạn có bệnh nền, đang mang thai, cho con bú, dùng thuốc hoặc
          gặp vấn đề sức khỏe, hãy trao đổi với bác sĩ/chuyên gia dinh dưỡng trước khi thay đổi chế độ ăn uống
          hoặc luyện tập.
        </p>
      </div>

      <div className="glass-card rounded-[2rem] p-5 md:p-6 space-y-3">
        <div className="flex items-center gap-3 mb-1">
          <AlertTriangle className="w-5 h-5 text-red-500" />
          <p className="text-sm font-bold text-slate-800">
            2. Các ngưỡng được xem là “có thể không an toàn”
          </p>
        </div>
        <ul className="text-xs md:text-sm text-slate-600 space-y-1.5">
          <li>• Mục tiêu calories &lt; 1.000 kcal/ngày trong thời gian dài.</li>
          <li>• Mục tiêu giảm &gt; 1 kg/tuần trong nhiều tuần liên tiếp.</li>
          <li>• Mục tiêu cân nặng quá thấp so với chiều cao (ví dụ BMI &lt; 17).</li>
          <li>• Thay đổi quá đột ngột so với mức hiện tại mà không có hướng dẫn y khoa.</li>
        </ul>
        <p className="text-[11px] text-slate-500">
          Khi phát hiện các mục tiêu cực đoan, trợ lý AI sẽ nhắc bạn cân nhắc lại và đề xuất phạm vi an toàn hơn,
          nhưng quyết định cuối cùng vẫn thuộc về bạn và bác sĩ của bạn.
        </p>
      </div>

      <div className="glass-card rounded-[2rem] p-5 md:p-6 space-y-3">
        <p className="text-sm font-bold text-slate-800">
          3. Một vài gợi ý “an toàn mặc định”
        </p>
        <ul className="text-xs md:text-sm text-slate-600 space-y-1.5">
          <li>• Hạn chế để deficit hoặc surplus quá lớn trong thời gian dài.</li>
          <li>• Ưu tiên ngủ đủ, uống đủ nước và không bỏ bữa kéo dài.</li>
          <li>• Nếu thấy mệt bất thường, chóng mặt, tụt cân quá nhanh — hãy dừng lại và hỏi ý kiến bác sĩ.</li>
        </ul>
      </div>
    </div>
  )
}

