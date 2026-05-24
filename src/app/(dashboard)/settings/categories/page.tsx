import { createClient } from '@/lib/supabase/server'
import { CategoriesManager } from '@/components/forms/CategoriesManager'

export default async function CategoriesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, color, is_active')
    .eq('user_id', user!.id)
    .order('name', { ascending: true })

  return (
    <>
      <p className="text-gray-500 mb-6">Gestiona las categorías de tus gastos</p>
      <CategoriesManager categories={categories ?? []} />
    </>
  )
}
