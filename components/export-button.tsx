'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Download, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface Props {
    year: number
    month: number
}

function toCSV(rows: any[]): string {
    if (rows.length === 0) return ''
    const headers = ['Date', 'Food Name', 'Calories (kcal)', 'Protein (g)', 'Carbs (g)', 'Fat (g)']
    const lines = [
        headers.join(','),
        ...rows.map((r) =>
            [
                r.logged_at,
                `"${(r.food_name ?? '').replace(/"/g, '""')}"`,
                r.calories ?? 0,
                r.protein ?? 0,
                r.carbs ?? 0,
                r.fat ?? 0,
            ].join(',')
        ),
    ]
    return lines.join('\n')
}

export function ExportButton({ year, month }: Props) {
    const [loading, setLoading] = useState(false)

    const handleExport = async () => {
        setLoading(true)
        try {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) { toast.error('Cần đăng nhập để xuất dữ liệu'); return }

            const startDate = `${year}-${String(month).padStart(2, '0')}-01`
            const endDate = new Date(year, month, 0).toISOString().split('T')[0]

            const { data, error } = await supabase
                .from('meal_logs')
                .select('logged_at, food_name, calories, protein, carbs, fat')
                .eq('user_id', user.id)
                .gte('logged_at', startDate)
                .lte('logged_at', endDate)
                .order('logged_at', { ascending: true })

            if (error) { toast.error('Không thể lấy dữ liệu: ' + error.message); return }
            if (!data || data.length === 0) { toast.error('Không có dữ liệu trong tháng này'); return }

            const csv = toCSV(data)
            const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `calsnap-${year}-${String(month).padStart(2, '0')}.csv`
            a.click()
            URL.revokeObjectURL(url)
            toast.success(`Đã xuất ${data.length} bữa ăn!`)
        } catch {
            toast.error('Lỗi khi xuất file. Thử lại sau.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <button
            onClick={handleExport}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 text-xs font-bold transition-colors disabled:opacity-60"
            aria-label="Xuất dữ liệu CSV"
            title={`Xuất nhật ký ${month}/${year} ra file CSV`}
        >
            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
            Xuất CSV
        </button>
    )
}
