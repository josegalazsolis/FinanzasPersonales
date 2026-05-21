import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { ExpenseForm } from '@/components/forms/ExpenseForm'

export default async function EditExpensePage({
  params,
}: {
  params: Promise<{ id: string; expenseId: string }>
}) {
  const { id, expenseId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: expense } = await supabase
    .from('expenses')
    .select('id, date, merchant, category_id, amount, currency, account_id')
    .eq('id', expenseId)
    .eq('user_id', user!.id)
    .single()

  if (!expense || expense.account_id !== id) notFound()

  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, color')
    .eq('user_id', user!.id)
    .eq('is_active', true)
    .order('name', { ascending: true })

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Editar gasto</h1>
      <ExpenseForm
        accountId={id}
        categories={categories ?? []}
        initialValues={{
          id: expense.id,
          date: expense.date,
          merchant: expense.merchant,
          category_id: expense.category_id,
          amount: expense.amount,
          currency: expense.currency as 'CLP' | 'USD' | 'EUR' | 'JPY',
        }}
      />
    </div>
  )
}
