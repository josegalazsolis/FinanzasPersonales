import { formatCLP } from '@/lib/utils/currency'
import Link from 'next/link'

interface BudgetRow {
  category_id: string
  amount_clp: number
  categories: { name: string; color: string } | null
}

interface BudgetProgressProps {
  budgets: BudgetRow[]
  spentByCategory: Record<string, number>
}

function statusColor(pct: number) {
  if (pct >= 100) return { bar: 'bg-red-500', badge: 'bg-red-50 text-red-700 border-red-200' }
  if (pct >= 80) return { bar: 'bg-amber-400', badge: 'bg-amber-50 text-amber-700 border-amber-200' }
  return { bar: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' }
}

export function BudgetProgress({ budgets, spentByCategory }: BudgetProgressProps) {
  if (budgets.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-base font-semibold text-gray-900 dark:text-slate-100">Presupuesto del mes</h2>
          <Link href="/settings/budgets" className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">
            Configurar →
          </Link>
        </div>
        <p className="text-sm text-gray-400 dark:text-slate-500 py-4 text-center">
          No hay presupuestos configurados para este mes.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base font-semibold text-gray-900 dark:text-slate-100">Presupuesto del mes</h2>
        <Link href="/settings/budgets" className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">
          Editar →
        </Link>
      </div>
      <div className="space-y-4">
        {budgets.map(b => {
          const spent = spentByCategory[b.category_id] ?? 0
          const pct = Math.min(100, Math.round((spent / b.amount_clp) * 100))
          const colors = statusColor(pct)
          const over = spent > b.amount_clp

          return (
            <div key={b.category_id}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: b.categories?.color ?? '#6b7280' }}
                  />
                  <span className="text-sm text-gray-800 dark:text-slate-200 truncate">{b.categories?.name ?? 'Sin nombre'}</span>
                  {pct >= 80 && (
                    <span className={`text-xs px-1.5 py-0.5 rounded border font-medium ${colors.badge}`}>
                      {over ? 'Superado' : `${pct}%`}
                    </span>
                  )}
                </div>
                <div className="text-right flex-shrink-0 ml-3 text-xs text-gray-500 dark:text-slate-400">
                  <span className={over ? 'text-red-600 font-semibold' : 'text-gray-700 dark:text-slate-300 font-medium'}>
                    {formatCLP(spent)}
                  </span>
                  {' / '}
                  {formatCLP(b.amount_clp)}
                </div>
              </div>
              <div className="h-2 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${colors.bar}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
