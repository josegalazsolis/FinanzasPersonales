import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ExpenseTable } from '@/components/ui/ExpenseTable'
import { IncomeTable } from '@/components/ui/IncomeTable'
import { formatCLP } from '@/lib/utils/currency'

interface Props {
  params: Promise<{ id: string }>
  searchParams: Promise<{ month?: string; year?: string; tab?: string }>
}

export default async function AccountPage({ params, searchParams }: Props) {
  const { id } = await params
  const sp = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: account } = await supabase
    .from('accounts')
    .select('id, name, type')
    .eq('id', id)
    .eq('user_id', user!.id)
    .single()

  if (!account) notFound()

  const now = new Date()
  const year = parseInt(sp.year ?? String(now.getFullYear()))
  const month = parseInt(sp.month ?? String(now.getMonth() + 1))
  const tab = sp.tab === 'ingresos' ? 'ingresos' : 'gastos'

  const firstDay = `${year}-${String(month).padStart(2, '0')}-01`
  const lastDayDate = new Date(year, month, 0)
  const lastDay = `${year}-${String(month).padStart(2, '0')}-${String(lastDayDate.getDate()).padStart(2, '0')}`

  const [expensesResult, incomesResult] = await Promise.all([
    supabase
      .from('expenses')
      .select(`id, date, merchant, amount, currency, amount_clp, categories(id, name, color)`)
      .eq('account_id', id)
      .eq('user_id', user!.id)
      .gte('date', firstDay)
      .lte('date', lastDay)
      .order('date', { ascending: false }),
    supabase
      .from('incomes')
      .select(`id, date, source, amount, currency, amount_clp`)
      .eq('account_id', id)
      .eq('user_id', user!.id)
      .gte('date', firstDay)
      .lte('date', lastDay)
      .order('date', { ascending: false }),
  ])

  const expenses = expensesResult.data ?? []
  const incomes = incomesResult.data ?? []
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount_clp, 0)
  const totalIncomes = incomes.reduce((sum, i) => sum + i.amount_clp, 0)
  const netBalance = totalIncomes - totalExpenses

  return (
    <div>
      <div className="flex items-center gap-4 mb-2">
        <Link href="/dashboard" className="text-gray-400 dark:text-slate-500 hover:text-gray-700 dark:hover:text-slate-300 text-sm">← Mis cuentas</Link>
      </div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold">{account.name}</h1>
          <span className="text-sm text-gray-500 dark:text-slate-400">
            {account.type === 'cuenta_corriente' ? 'Cuenta Corriente' : 'Tarjeta de Crédito'}
          </span>
        </div>
        {tab === 'gastos' ? (
          <Link
            href={`/accounts/${account.id}/expenses/new`}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            + Nuevo gasto
          </Link>
        ) : (
          <Link
            href={`/accounts/${account.id}/incomes/new`}
            className="bg-emerald-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-emerald-700 transition-colors"
          >
            + Nuevo ingreso
          </Link>
        )}
      </div>

      {/* Saldo neto del período */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4">
          <p className="text-xs text-gray-500 dark:text-slate-400 mb-1">Ingresos</p>
          <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{formatCLP(totalIncomes)}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4">
          <p className="text-xs text-gray-500 dark:text-slate-400 mb-1">Gastos</p>
          <p className="text-lg font-bold text-red-500 dark:text-red-400">{formatCLP(totalExpenses)}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4">
          <p className="text-xs text-gray-500 dark:text-slate-400 mb-1">Saldo neto</p>
          <p className={`text-lg font-bold ${netBalance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
            {formatCLP(netBalance)}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-gray-200 dark:border-slate-700">
        <Link
          href={`/accounts/${id}?tab=gastos&month=${month}&year=${year}`}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            tab === 'gastos'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300'
          }`}
        >
          Gastos
        </Link>
        <Link
          href={`/accounts/${id}?tab=ingresos&month=${month}&year=${year}`}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            tab === 'ingresos'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300'
          }`}
        >
          Ingresos
        </Link>
      </div>

      {tab === 'gastos' ? (
        <ExpenseTable
          expenses={expenses as any[]}
          accountId={account.id}
          total={totalExpenses}
          currentMonth={month}
          currentYear={year}
        />
      ) : (
        <IncomeTable
          incomes={incomes}
          accountId={account.id}
          total={totalIncomes}
          currentMonth={month}
          currentYear={year}
        />
      )}
    </div>
  )
}
