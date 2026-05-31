import { createClient } from '@/lib/supabase/server'
import { AccountCard } from '@/components/ui/AccountCard'
import { CreateAccountModal } from '@/components/forms/CreateAccountModal'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const now = new Date()
  const firstDayOfMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`

  const { data: accounts } = await supabase
    .from('accounts')
    .select(`id, name, type, expenses(amount_clp, date), incomes(amount_clp, date)`)
    .eq('user_id', user!.id)
    .order('created_at', { ascending: true })

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

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Mis cuentas</h1>
        <CreateAccountModal />
      </div>

      {accountsWithTotals.length === 0 ? (
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
    </div>
  )
}
