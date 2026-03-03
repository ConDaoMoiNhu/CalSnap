'use client'

import Link from 'next/link'
import { MonthlySummaryCard } from '@/components/monthly-summary-card'
import { ArrowLeft, Sparkles } from 'lucide-react'

export default function MonthlyOverviewPage() {
  return (
    <div className="page-enter max-w-5xl mx-auto pb-24 space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="w-9 h-9 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-slate-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Analytics
            </p>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 flex items-center gap-2">
              Monthly Overview
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                <Sparkles className="w-3 h-3" />
                AI insights
              </span>
            </h1>
            <p className="text-xs md:text-sm text-slate-500 mt-1">
              Xem lại xu hướng calories, protein, bước chân và nước uống theo
              từng tháng để hiểu rõ hơn hành trình của bạn.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] items-start">
        <MonthlySummaryCard />
        <div className="glass-card rounded-[2rem] p-5 md:p-6 space-y-3">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Cách đọc báo cáo
          </p>
          <ul className="text-xs md:text-sm text-slate-600 space-y-1.5">
            <li>
              <span className="font-semibold text-slate-800">
                Đường Calories:
              </span>{' '}
              giúp bạn thấy ngày nào ăn dư hoặc thiếu nhiều so với mặt bằng
              chung.
            </li>
            <li>
              <span className="font-semibold text-slate-800">
                Ô tổng quan:
              </span>{' '}
              cho biết trung bình kcal, protein và số bước mỗi ngày trong tháng
              đó.
            </li>
            <li>
              <span className="font-semibold text-slate-800">
                Bảng chi tiết:
              </span>{' '}
              dùng để soi lại từng ngày cụ thể và tìm pattern (ví dụ cuối tuần
              thường ăn nhiều hơn).
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

