import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { RecurringManager } from '@/components/forms/RecurringManager'

export default async function RecurringPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: recurring }, { data: accounts }, { data: categories }] = await Promise.all([
    supabase
      .from('recurring_expenses')
      .select('id, description, amount_clp, day_of_month, is_active, account_id, category_id, last_applied_month, last_applied_year')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true }),
    supabase.from('accounts').select('id, name').eq('user_id', user.id).order('name'),
    supabase.from('categories').select('id, name, color').eq('user_id', user.id).eq('is_active', true).order('name'),
  ])

  return (
    <>
      <p className="text-gray-500 dark:text-slate-400 mb-6">
        Los gastos recurrentes se registran automáticamente cada mes en la fecha indicada
      </p>
      <RecurringManager
        items={recurring ?? []}
        accounts={accounts ?? []}
        categories={categories ?? []}
      />
    </>
  )
}
