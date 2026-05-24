'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function saveBudgets(
  items: { categoryId: string; amountClp: number | null }[],
  month: number,
  year: number
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  await supabase.from('budgets').delete().eq('user_id', user.id).eq('month', month).eq('year', year)

  const toInsert = items
    .filter(b => b.amountClp && b.amountClp > 0)
    .map(b => ({
      user_id: user.id,
      category_id: b.categoryId,
      month,
      year,
      amount_clp: b.amountClp!,
    }))

  if (toInsert.length > 0) {
    const { error } = await supabase.from('budgets').insert(toInsert)
    if (error) return { error: error.message }
  }

  revalidatePath('/settings/budgets')
  revalidatePath('/analytics')
  return { success: true }
}

export async function copyPreviousMonthBudgets(month: number, year: number) {
  const prevMonth = month === 1 ? 12 : month - 1
  const prevYear = month === 1 ? year - 1 : year

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { data: prev, error: fetchError } = await supabase
    .from('budgets')
    .select('category_id, amount_clp')
    .eq('user_id', user.id)
    .eq('month', prevMonth)
    .eq('year', prevYear)

  if (fetchError) return { error: fetchError.message }
  if (!prev?.length) return { error: 'No hay presupuestos en el mes anterior' }

  const inserts = prev.map(b => ({
    user_id: user.id,
    category_id: b.category_id,
    month,
    year,
    amount_clp: b.amount_clp,
  }))

  await supabase.from('budgets').delete().eq('user_id', user.id).eq('month', month).eq('year', year)
  const { error } = await supabase.from('budgets').insert(inserts)
  if (error) return { error: error.message }

  revalidatePath('/settings/budgets')
  return { success: true, count: inserts.length }
}
