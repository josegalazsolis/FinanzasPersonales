import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { BudgetManager } from '@/components/forms/BudgetManager'

interface Props {
  searchParams: Promise<{ month?: string; year?: string }>
}

export default async function BudgetsPage({ searchParams }: Props) {
  const sp = await searchParams
  const now = new Date()
  const month = parseInt(sp.month ?? String(now.getMonth() + 1))
  const year = parseInt(sp.year ?? String(now.getFullYear()))

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: categories }, { data: budgets }] = await Promise.all([
    supabase.from('categories').select('id, name, color').eq('user_id', user.id).eq('is_active', true).order('name'),
    supabase.from('budgets').select('id, category_id, amount_clp').eq('user_id', user.id).eq('month', month).eq('year', year),
  ])

  return (
    <>
      <p className="text-gray-500 mb-6">
        Define cuánto quieres gastar por categoría cada mes
      </p>
      <BudgetManager
        categories={categories ?? []}
        budgets={(budgets ?? []) as { id: string; category_id: string; amount_clp: number }[]}
        month={month}
        year={year}
      />
    </>
  )
}
