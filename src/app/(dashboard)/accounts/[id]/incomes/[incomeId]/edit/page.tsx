import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { IncomeForm } from '@/components/forms/IncomeForm'

interface Props {
  params: Promise<{ id: string; incomeId: string }>
}

export default async function EditIncomePage({ params }: Props) {
  const { id, incomeId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: account }, { data: income }] = await Promise.all([
    supabase.from('accounts').select('id, name').eq('id', id).eq('user_id', user!.id).single(),
    supabase.from('incomes').select('id, date, source, amount, currency').eq('id', incomeId).eq('user_id', user!.id).single(),
  ])

  if (!account || !income) notFound()

  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-6">
        <Link
          href={`/accounts/${id}?tab=ingresos`}
          className="text-gray-400 dark:text-slate-500 hover:text-gray-700 dark:hover:text-slate-300 text-sm"
        >
          ← {account.name}
        </Link>
        <h1 className="text-2xl font-bold mt-2">Editar ingreso</h1>
      </div>
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6">
        <IncomeForm
          accountId={id}
          initialValues={{
            id: income.id,
            date: income.date,
            source: income.source,
            amount: income.amount,
            currency: income.currency as 'CLP' | 'USD' | 'EUR' | 'JPY',
          }}
        />
      </div>
    </div>
  )
}
