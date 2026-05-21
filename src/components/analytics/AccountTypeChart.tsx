'use client'
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { formatCLP } from '@/lib/utils/currency'
import type { ExpenseRow } from './types'

interface AccountTypeChartProps {
  expenses: ExpenseRow[]
}

const ACCOUNT_LABELS: Record<string, string> = {
  cuenta_corriente: 'Cuenta Corriente',
  tarjeta_credito: 'Tarjeta de Crédito',
}

const ACCOUNT_COLORS: Record<string, string> = {
  cuenta_corriente: '#4f46e5',
  tarjeta_credito: '#10b981',
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-2 text-sm">
      <p className="font-medium text-gray-900 mb-1">{label}</p>
      {payload.map(p => (
        <p key={p.name} className="text-gray-600">{p.name}: {formatCLP(p.value)}</p>
      ))}
    </div>
  )
}

export function AccountTypeChart({ expenses }: AccountTypeChartProps) {
  const typeMap = new Map<string, number>()

  for (const e of expenses) {
    if (!e.accounts) continue
    const type = e.accounts.type
    typeMap.set(type, (typeMap.get(type) ?? 0) + e.amount_clp)
  }

  const data = Array.from(typeMap.entries()).map(([type, total]) => ({
    name: ACCOUNT_LABELS[type] ?? type,
    total,
    color: ACCOUNT_COLORS[type] ?? '#6b7280',
  }))

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-base font-semibold text-gray-900 mb-4">Gastos por tipo de cuenta</h2>
      {data.length === 0 ? (
        <p className="text-gray-400 text-sm text-center py-12">Sin datos</p>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6b7280' }} />
              <YAxis
                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                width={55}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="total" name="Total CLP" radius={[4, 4, 0, 0]}>
                {data.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {data.map(item => (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-gray-700">{item.name}</span>
                </div>
                <span className="font-medium text-gray-900">{formatCLP(item.total)}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
