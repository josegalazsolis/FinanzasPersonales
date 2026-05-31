'use client'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { formatCLP } from '@/lib/utils/currency'
import { useTheme } from '@/components/providers/ThemeProvider'
import type { ExpenseRow, IncomeRow } from './types'

interface NetFlowChartProps {
  expenses: ExpenseRow[]
  incomes: IncomeRow[]
  startDate: string
  endDate: string
}

const MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

function buildData(expenses: ExpenseRow[], incomes: IncomeRow[], startDate: string, endDate: string) {
  const days = Math.round(
    (new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)
  )

  if (days <= 31) {
    const map = new Map<string, { ingresos: number; gastos: number }>()
    const start = new Date(startDate)
    const end = new Date(endDate)
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      map.set(d.toISOString().slice(0, 10), { ingresos: 0, gastos: 0 })
    }
    for (const e of expenses) map.get(e.date) && (map.get(e.date)!.gastos += e.amount_clp)
    for (const i of incomes) map.get(i.date) && (map.get(i.date)!.ingresos += i.amount_clp)
    return Array.from(map.entries()).map(([date, v]) => {
      const [, m, d] = date.split('-')
      return { label: `${d}/${m}`, ...v }
    })
  }

  const map = new Map<string, { ingresos: number; gastos: number }>()
  for (const e of expenses) {
    const [y, m] = e.date.split('-')
    const key = `${y}-${m}`
    const entry = map.get(key) ?? { ingresos: 0, gastos: 0 }
    entry.gastos += e.amount_clp
    map.set(key, entry)
  }
  for (const i of incomes) {
    const [y, m] = i.date.split('-')
    const key = `${y}-${m}`
    const entry = map.get(key) ?? { ingresos: 0, gastos: 0 }
    entry.ingresos += i.amount_clp
    map.set(key, entry)
  }
  return Array.from(map.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([key, v]) => {
      const [, m] = key.split('-')
      return { label: MONTHS[parseInt(m) - 1], ...v }
    })
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-lg px-3 py-2 text-sm space-y-1">
      <p className="text-gray-500 dark:text-slate-400 mb-1">{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color }} className="font-semibold">
          {p.name}: {formatCLP(p.value)}
        </p>
      ))}
    </div>
  )
}

export function NetFlowChart({ expenses, incomes, startDate, endDate }: NetFlowChartProps) {
  const { theme } = useTheme()
  const tickFill = theme === 'dark' ? '#94a3b8' : '#9ca3af'
  const gridStroke = theme === 'dark' ? '#334155' : '#f3f4f6'

  const data = buildData(expenses, incomes, startDate, endDate)

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6">
      <h2 className="text-base font-semibold text-gray-900 dark:text-slate-100 mb-4">Flujo neto — ingresos vs gastos</h2>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: tickFill }} interval="preserveStartEnd" />
          <YAxis tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11, fill: tickFill }} width={55} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="ingresos" name="Ingresos" fill="#10b981" radius={[3, 3, 0, 0]} />
          <Bar dataKey="gastos" name="Gastos" fill="#4f46e5" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
