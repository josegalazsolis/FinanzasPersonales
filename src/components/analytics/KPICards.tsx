import { formatCLP } from '@/lib/utils/currency'
import type { ExpenseRow } from './types'

interface KPICardsProps {
  expenses: ExpenseRow[]
}

export function KPICards({ expenses }: KPICardsProps) {
  const total = expenses.reduce((sum, e) => sum + e.amount_clp, 0)
  const count = expenses.length
  const average = count > 0 ? total / count : 0

  const categoryTotals = new Map<string, { name: string; total: number }>()
  for (const e of expenses) {
    if (!e.categories) continue
    const { id, name } = e.categories
    const existing = categoryTotals.get(id)
    if (existing) {
      existing.total += e.amount_clp
    } else {
      categoryTotals.set(id, { name, total: e.amount_clp })
    }
  }
  const topCategory = Array.from(categoryTotals.values()).sort((a, b) => b.total - a.total)[0]

  const cards = [
    {
      label: 'Total gastado',
      value: formatCLP(total),
      sub: `${count} transacción${count !== 1 ? 'es' : ''}`,
    },
    {
      label: 'Promedio por gasto',
      value: formatCLP(average),
      sub: 'en CLP',
    },
    {
      label: 'Mayor categoría',
      value: topCategory?.name ?? '—',
      sub: topCategory ? formatCLP(topCategory.total) : 'Sin datos',
    },
    {
      label: 'Transacciones',
      value: String(count),
      sub: count === 0 ? 'Sin gastos' : count === 1 ? '1 gasto' : `${count} gastos`,
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map(card => (
        <div key={card.label} className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">{card.label}</p>
          <p className="text-xl font-bold text-gray-900 truncate">{card.value}</p>
          <p className="text-xs text-gray-400 mt-1">{card.sub}</p>
        </div>
      ))}
    </div>
  )
}
