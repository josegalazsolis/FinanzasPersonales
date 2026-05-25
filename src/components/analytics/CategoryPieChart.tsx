'use client'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { formatCLP } from '@/lib/utils/currency'
import { useTheme } from '@/components/providers/ThemeProvider'
import type { ExpenseRow } from './types'

interface CategoryPieChartProps {
  expenses: ExpenseRow[]
}

interface TooltipPayload {
  name: string
  value: number
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: TooltipPayload[] }) {
  if (!active || !payload?.length) return null
  const { name, value } = payload[0]
  return (
    <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-lg px-3 py-2 text-sm">
      <p className="font-medium text-gray-900 dark:text-slate-100">{name}</p>
      <p className="text-gray-600 dark:text-slate-400">{formatCLP(value)}</p>
    </div>
  )
}

export function CategoryPieChart({ expenses }: CategoryPieChartProps) {
  const { theme } = useTheme()
  const legendColor = theme === 'dark' ? '#94a3b8' : '#374151'

  const categoryMap = new Map<string, { name: string; color: string; value: number }>()

  for (const e of expenses) {
    if (!e.categories) continue
    const { id, name, color } = e.categories
    const existing = categoryMap.get(id)
    if (existing) {
      existing.value += e.amount_clp
    } else {
      categoryMap.set(id, { name, color, value: e.amount_clp })
    }
  }

  const data = Array.from(categoryMap.values()).sort((a, b) => b.value - a.value)
  const total = data.reduce((sum, d) => sum + d.value, 0)

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6">
      <h2 className="text-base font-semibold text-gray-900 dark:text-slate-100 mb-4">Gastos por categoría</h2>
      {data.length === 0 ? (
        <p className="text-gray-400 dark:text-slate-500 text-sm text-center py-12">Sin datos</p>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={100}
                paddingAngle={2}
              >
                {data.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                formatter={(value) => (
                  <span style={{ fontSize: 12, color: legendColor }}>{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {data.slice(0, 5).map(item => (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-gray-700 dark:text-slate-300 truncate">{item.name}</span>
                </div>
                <div className="text-right flex-shrink-0 ml-3">
                  <span className="font-medium text-gray-900 dark:text-slate-100">{formatCLP(item.value)}</span>
                  <span className="text-gray-400 dark:text-slate-500 ml-2 text-xs">
                    {total > 0 ? Math.round((item.value / total) * 100) : 0}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
