import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ExpenseTable } from '@/components/ui/ExpenseTable'

interface Props {
  params: Promise<{ id: string }>
  searchParams: Promise<{ month?: string; year?: string }>
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

  const firstDay = `${year}-${String(month).padStart(2, '0')}-01`
  const lastDayDate = new Date(year, month, 0)
  const lastDay = `${year}-${String(month).padStart(2, '0')}-${String(lastDayDate.getDate()).padStart(2, '0')}`

  const { data: expenses } = await supabase
    .from('expenses')
    .select(`id, date, merchant, amount, currency, amount_clp, categories(id, name, color)`)
    .eq('account_id', id)
    .eq('user_id', user!.id)
    .gte('date', firstDay)
    .lte('date', lastDay)
    .order('date', { ascending: false })

  const total = (expenses ?? []).reduce((sum, e) => sum + e.amount_clp, 0)

  return (
    <div>
      <div className="flex items-center gap-4 mb-2">
        <Link href="/dashboard" className="text-gray-400 dark:text-slate-500 hover:text-gray-700 dark:hover:text-slate-300 text-sm">← Mis cuentas</Link>
      </div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{account.name}</h1>
          <span className="text-sm text-gray-500 dark:text-slate-400">
            {account.type === 'cuenta_corriente' ? 'Cuenta Corriente' : 'Tarjeta de Crédito'}
          </span>
        </div>
        <Link
          href={`/accounts/${account.id}/expenses/new`}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          + Nuevo gasto
        </Link>
      </div>

      <ExpenseTable
        expenses={(expenses ?? []) as any[]}
        accountId={account.id}
        total={total}
        currentMonth={month}
        currentYear={year}
      />
    </div>
  )
}
