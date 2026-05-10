'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

interface ExpenseData {
  accountId: string
  categoryId: string
  date: string
  merchant: string
  amount: number
  currency: string
  amountCLP: number
  exchangeRateUsed: number
}

export async function createExpense(data: ExpenseData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { error } = await supabase.from('expenses').insert({
    user_id: user.id,
    account_id: data.accountId,
    category_id: data.categoryId,
    date: data.date,
    merchant: data.merchant,
    amount: data.amount,
    currency: data.currency,
    amount_clp: data.amountCLP,
    exchange_rate_used: data.exchangeRateUsed,
  })

  if (error) return { error: error.message }
  revalidatePath(`/accounts/${data.accountId}`)
  return { success: true }
}

export async function updateExpense(expenseId: string, data: ExpenseData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { error } = await supabase
    .from('expenses')
    .update({
      account_id: data.accountId,
      category_id: data.categoryId,
      date: data.date,
      merchant: data.merchant,
      amount: data.amount,
      currency: data.currency,
      amount_clp: data.amountCLP,
      exchange_rate_used: data.exchangeRateUsed,
    })
    .eq('id', expenseId)
    .eq('user_id', user.id)

  if (error) return { error: error.message }
  revalidatePath(`/accounts/${data.accountId}`)
  return { success: true }
}

export async function deleteExpense(expenseId: string, accountId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { error } = await supabase
    .from('expenses')
    .delete()
    .eq('id', expenseId)
    .eq('user_id', user.id)

  if (error) return { error: error.message }
  revalidatePath(`/accounts/${accountId}`)
  return { success: true }
}
