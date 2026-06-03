'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function applyRecurringExpenses() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const today = new Date()
  const currentMonth = today.getMonth() + 1
  const currentYear = today.getFullYear()
  const todayDay = today.getDate()

  const { data: recurring } = await supabase
    .from('recurring_expenses')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_active', true)

  if (!recurring?.length) return

  const toApply = recurring.filter(r => {
    const notAppliedThisMonth =
      r.last_applied_month !== currentMonth || r.last_applied_year !== currentYear
    return notAppliedThisMonth && r.day_of_month <= todayDay
  })

  if (!toApply.length) return

  const dateStr = (day: number) =>
    `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`

  await supabase.from('expenses').insert(
    toApply.map(r => ({
      user_id: user.id,
      account_id: r.account_id,
      category_id: r.category_id,
      date: dateStr(r.day_of_month),
      merchant: r.description,
      amount: r.amount_clp,
      currency: 'CLP',
      amount_clp: r.amount_clp,
      exchange_rate_used: 1,
    }))
  )

  await supabase
    .from('recurring_expenses')
    .update({ last_applied_month: currentMonth, last_applied_year: currentYear })
    .in('id', toApply.map(r => r.id))
    .eq('user_id', user.id)
}

export async function createAccount(
  _prevState: { error: string } | null,
  formData: FormData
): Promise<{ error: string } | { success: true }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const name = (formData.get('name') as string).trim()
  if (!name) return { error: 'El nombre es requerido' }

  const { error } = await supabase.from('accounts').insert({
    user_id: user.id,
    name,
    type: formData.get('type') as string,
  })

  if (error) return { error: error.message }
  revalidatePath('/dashboard')
  return { success: true }
}
