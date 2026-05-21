'use client'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { formatCLP } from '@/lib/utils/currency'
import type { ExpenseRow } from './types'

interface TemporalBarChartProps {
  expenses: ExpenseRow[]
  startDate: string
  endDate: string
}

function daysBetween(start: string, end: string): number {
  return Math.round(
    (new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60 * 24)
  )
}

function buildDailyData(expenses: ExpenseRow[], start: string, end: string) {
  const map = new Map<string, number>()
  const startD = new Date(start)
  const endD = new Date(end)

  for (let d = new Date(startD); d <= endD; d.setDate(d.getDate() + 1)) {
    const key = d.toISOString().slice(0, 10)
    map.set(key, 0)
  }

  for (const e of expenses) {
    map.set(e.date, (map.get(e.date) ?? 0) + e.amount_clp)
  }

  return Array.from(map.entries()).map(([date, total]) => {
    const [, m, d] = date.split('-')
    return { label: `${d}/${m}`, total }
  })
}

function buildWeeklyData(expenses: ExpenseRow[], start: string) {
  const map = new Map<number, { label: string; total: number }>()

  for (const e of expenses) {
    const diff = daysBetween(start, e.date)
    const week = Math.floor(diff / 7)
    if (!map.has(week)) {
      const weekStart = new Date(start)
      weekStart.setDate(weekStart.getDate() + week * 7)
      const [, m, d] = weekStart.toISOString().slice(0, 10).split('-')
      map.set(week, { label: `Sem ${d}/${m}`, total: 0 })
    }
    map.get(week)!.total += e.amount_clp
  }

  return Array.from(map.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([, v]) => v)
}

function buildMonthlyData(expenses: ExpenseRow[]) {
  const MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
  const map = new Map<string, number>()

  for (const e of expenses) {
    const [y, m] = e.date.split('-')
    const key = `${y}-${m}`
    map.set(key, (map.get(key) ?? 0) + e.amount_clp)
  }

  return Array.from(map.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([key, total]) => {
      const [, m] = key.split('-')
      return { label: MONTHS[parseInt(m) - 1], total }
    })
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-2 text-sm">
      <p className="text-gray-500 mb-0.5">{label}</p>
      <p className="font-semibold text-gray-900">{formatCLP(payload[0].value)}</p>
    </div>
  )
}

export function TemporalBarChart({ expenses, startDate, endDate }: TemporalBarChartProps) {
  const days = daysBetween(startDate, endDate)

  let data: { label: string; total: number }[]
  let subtitle: string

  if (days <= 31) {
    data = buildDailyData(expenses, startDate, endDate)
    subtitle = 'por día'
  } else if (days <= 92) {
    data = buildWeeklyData(expenses, startDate)
    subtitle = 'por semana'
  } else {
    data = buildMonthlyData(expenses)
    subtitle = 'por mes'
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-gray-900">Evolución temporal</h2>
        <span className="text-xs text-gray-400">{subtitle}</span>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: '#9ca3af' }}
            interval="preserveStartEnd"
          />
          <YAxis
            tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
            tick={{ fontSize: 11, fill: '#9ca3af' }}
            width={55}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="total" fill="#4f46e5" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
