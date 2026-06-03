'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

interface RecurringData {
  accountId: string
  categoryId: string | null
  description: string
  amountClp: number
  dayOfMonth: number
}

export async function createRecurring(data: RecurringData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { error } = await supabase.from('recurring_expenses').insert({
    user_id: user.id,
    account_id: data.accountId,
    category_id: data.categoryId || null,
    description: data.description,
    amount_clp: data.amountClp,
    day_of_month: data.dayOfMonth,
  })

  if (error) return { error: error.message }
  revalidatePath('/settings/recurring')
  return { success: true }
}

export async function toggleRecurring(id: string, isActive: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { error } = await supabase
    .from('recurring_expenses')
    .update({ is_active: isActive })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { error: error.message }
  revalidatePath('/settings/recurring')
  return { success: true }
}

export async function deleteRecurring(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { error } = await supabase
    .from('recurring_expenses')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { error: error.message }
  revalidatePath('/settings/recurring')
  return { success: true }
}
