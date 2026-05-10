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
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Configuración</h1>
        <p className="text-gray-500 mt-1">Gestiona las categorías de tus gastos</p>
      </div>
      <CategoriesManager categories={categories ?? []} />
    </div>
  )
}
