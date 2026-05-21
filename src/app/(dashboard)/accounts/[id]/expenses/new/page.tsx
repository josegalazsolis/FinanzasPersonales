import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { ExpenseForm } from '@/components/forms/ExpenseForm'

export default async function NewExpensePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: account } = await supabase
    .from('accounts')
    .select('id, name, type')
    .eq('id', id)
    .eq('user_id', user!.id)
    .single()

  if (!account) notFound()

  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, color')
    .eq('user_id', user!.id)
    .eq('is_active', true)
    .order('name', { ascending: true })

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Nuevo gasto</h1>
      <p className="text-gray-500 mb-6">{account.name}</p>
      <ExpenseForm accountId={account.id} categories={categories ?? []} />
    </div>
  )
}
