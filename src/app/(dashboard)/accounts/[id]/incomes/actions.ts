'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

interface IncomeData {
  accountId: string
  date: string
  source: string
  amount: number
  currency: string
  amountCLP: number
  exchangeRateUsed: number
}

export async function createIncome(data: IncomeData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { error } = await supabase.from('incomes').insert({
    user_id: user.id,
    account_id: data.accountId,
    date: data.date,
    source: data.source,
    amount: data.amount,
    currency: data.currency,
    amount_clp: data.amountCLP,
    exchange_rate_used: data.exchangeRateUsed,
  })

  if (error) return { error: error.message }
  revalidatePath(`/accounts/${data.accountId}`)
  return { success: true }
}

export async function updateIncome(incomeId: string, data: IncomeData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { error } = await supabase
    .from('incomes')
    .update({
      account_id: data.accountId,
      date: data.date,
      source: data.source,
      amount: data.amount,
      currency: data.currency,
      amount_clp: data.amountCLP,
      exchange_rate_used: data.exchangeRateUsed,
    })
    .eq('id', incomeId)
    .eq('user_id', user.id)

  if (error) return { error: error.message }
  revalidatePath(`/accounts/${data.accountId}`)
  return { success: true }
}

export async function deleteIncome(incomeId: string, accountId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { error } = await supabase
    .from('incomes')
    .delete()
    .eq('id', incomeId)
    .eq('user_id', user.id)

  if (error) return { error: error.message }
  revalidatePath(`/accounts/${accountId}`)
  return { success: true }
}
