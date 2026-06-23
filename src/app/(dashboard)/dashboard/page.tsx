import { createClient } from '@/lib/supabase/server'
import { AccountCard } from '@/components/ui/AccountCard'
import { CreateAccountModal } from '@/components/forms/CreateAccountModal'
import { QuickExpenseModal } from '@/components/forms/QuickExpenseModal'
import { applyRecurringExpenses } from './actions'
import { formatCLP } from '@/lib/utils/currency'

const MONTHS_ES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

export default async function DashboardPage() {
  await applyRecurringExpenses()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const now = new Date()
  const currentMonth = now.getMonth() + 1
  const currentYear = now.getFullYear()
  const firstDayOfMonth = `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`

  const [{ data: accounts }, { data: monthExpenses }, { data: monthBudgets }, { data: categories }] = await Promise.all([
    supabase
      .from('accounts')
      .select(`id, name, type, expenses(amount_clp, date), incomes(amount_clp, date)`)
      .eq('user_id', user!.id)
      .order('created_at', { ascending: true }),
    supabase
      .from('expenses')
      .select('amount_clp, category_id, categories(id, name, color)')
      .eq('user_id', user!.id)
      .gte('date', firstDayOfMonth),
    supabase
      .from('budgets')
      .select('category_id, amount_clp, categories(id, name, color)')
      .eq('user_id', user!.id)
      .eq('month', currentMonth)
      .eq('year', currentYear),
    supabase
      .from('categories')
      .select('id, name, color')
      .eq('user_id', user!.id)
      .order('name', { ascending: true }),
  ])

  const accountsWithTotals = (accounts ?? []).map(account => {
    const monthlyExpenses = (account.expenses as { amount_clp: number; date: string }[])
      .filter(e => e.date >= firstDayOfMonth)
      .reduce((sum, e) => sum + e.amount_clp, 0)
    const monthlyIncome = (account.incomes as { amount_clp: number; date: string }[])
      .filter(i => i.date >= firstDayOfMonth)
      .reduce((sum, i) => sum + i.amount_clp, 0)
    return {
      ...account,
      monthlyTotal: monthlyExpenses,
      monthlyIncome,
      expenses: undefined,
      incomes: undefined,
    }
  })

  const totalMonthlyExpenses = accountsWithTotals.reduce((s, a) => s + a.monthlyTotal, 0)
  const totalMonthlyIncome = accountsWithTotals.reduce((s, a) => s + a.monthlyIncome, 0)
  const netFlow = totalMonthlyIncome - totalMonthlyExpenses

  // Top 3 categorías por gasto
  const catMap: Record<string, { name: string; color: string; total: number }> = {}
  type CatRef = { id: string; name: string; color: string }
  for (const e of (monthExpenses ?? [])) {
    const cat = (e.categories as unknown) as CatRef | null
    if (!cat || !e.category_id) continue
    if (!catMap[e.category_id]) catMap[e.category_id] = { name: cat.name, color: cat.color, total: 0 }
    catMap[e.category_id].total += e.amount_clp
  }
  const top3 = Object.values(catMap).sort((a, b) => b.total - a.total).slice(0, 3)

  // Presupuestos excedidos
  const spentByCategory: Record<string, number> = {}
  for (const e of (monthExpenses ?? [])) {
    if (e.category_id) spentByCategory[e.category_id] = (spentByCategory[e.category_id] ?? 0) + e.amount_clp
  }
  const exceededBudgets = (monthBudgets ?? [])
    .map(b => {
      const cat = (b.categories as unknown) as CatRef | null
      return {
        name: cat?.name ?? 'Sin nombre',
        color: cat?.color ?? '#888',
        spent: spentByCategory[b.category_id] ?? 0,
        budget: b.amount_clp,
        pct: Math.round(((spentByCategory[b.category_id] ?? 0) / b.amount_clp) * 100),
      }
    })
    .filter(b => b.spent > b.budget)

  const hasAccounts = accountsWithTotals.length > 0

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Mis cuentas</h1>
        <CreateAccountModal />
      </div>

      {/* Resumen del mes */}
      {hasAccounts && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
          {/* Flujo neto */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4">
            <p className="text-xs text-gray-500 dark:text-slate-400 mb-1">
              Flujo neto — {MONTHS_ES[now.getMonth()]} {currentYear}
            </p>
            <p className={`text-2xl font-bold ${netFlow >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
              {formatCLP(netFlow)}
            </p>
            <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">
              {formatCLP(totalMonthlyIncome)} ingresos · {formatCLP(totalMonthlyExpenses)} gastos
            </p>
          </div>

          {/* Top 3 categorías */}
          {top3.length > 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4">
              <p className="text-xs text-gray-500 dark:text-slate-400 mb-3">Top categorías del mes</p>
              <div className="space-y-2">
                {top3.map(cat => (
                  <div key={cat.name} className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-sm text-gray-700 dark:text-slate-300">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                      {cat.name}
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-slate-100">{formatCLP(cat.total)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Alertas de presupuesto */}
          {exceededBudgets.length > 0 && (
            <div className="bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800 p-4">
              <p className="text-xs font-medium text-red-600 dark:text-red-400 mb-3">
                ⚠ Presupuestos excedidos
              </p>
              <div className="space-y-2">
                {exceededBudgets.map(b => (
                  <div key={b.name} className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-sm text-red-700 dark:text-red-300">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: b.color }} />
                      {b.name}
                    </span>
                    <span className="text-sm font-semibold text-red-600 dark:text-red-400">{b.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {!hasAccounts ? (
        <div className="text-center py-16 text-gray-500 dark:text-slate-400">
          <p className="text-lg mb-4">No tienes cuentas creadas aún.</p>
          <CreateAccountModal buttonLabel="Crear primera cuenta" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {accountsWithTotals.map(account => (
            <AccountCard key={account.id} account={account} />
          ))}
        </div>
      )}

      <QuickExpenseModal
        accounts={(accounts ?? []).map(a => ({ id: a.id, name: a.name }))}
        categories={categories ?? []}
      />
    </div>
  )
}
