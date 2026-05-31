import { formatCLP } from '@/lib/utils/currency'
import type { ExpenseRow, IncomeRow } from './types'

interface KPICardsProps {
  expenses: ExpenseRow[]
  incomes: IncomeRow[]
}

export function KPICards({ expenses, incomes }: KPICardsProps) {
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount_clp, 0)
  const totalIncomes = incomes.reduce((sum, i) => sum + i.amount_clp, 0)
  const netBalance = totalIncomes - totalExpenses
  const count = expenses.length
  const average = count > 0 ? totalExpenses / count : 0

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
      label: 'Total ingresos',
      value: formatCLP(totalIncomes),
      sub: `${incomes.length} transacción${incomes.length !== 1 ? 'es' : ''}`,
      accent: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      label: 'Total gastos',
      value: formatCLP(totalExpenses),
      sub: `${count} transacción${count !== 1 ? 'es' : ''}`,
      accent: 'text-gray-900 dark:text-slate-100',
    },
    {
      label: 'Saldo neto',
      value: formatCLP(netBalance),
      sub: netBalance >= 0 ? 'superávit' : 'déficit',
      accent: netBalance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400',
    },
    {
      label: 'Mayor categoría',
      value: topCategory?.name ?? '—',
      sub: topCategory ? formatCLP(topCategory.total) : 'Sin datos',
      accent: 'text-gray-900 dark:text-slate-100',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map(card => (
        <div key={card.label} className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-5">
          <p className="text-xs text-gray-500 dark:text-slate-400 uppercase tracking-wide mb-1">{card.label}</p>
          <p className={`text-xl font-bold truncate ${card.accent}`}>{card.value}</p>
          <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">{card.sub}</p>
        </div>
      ))}
    </div>
  )
}
