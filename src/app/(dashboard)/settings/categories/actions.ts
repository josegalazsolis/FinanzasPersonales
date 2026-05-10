'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createCategory(data: { name: string; color: string }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { error } = await supabase.from('categories').insert({
    user_id: user.id,
    name: data.name.trim(),
    color: data.color,
  })

  if (error?.code === '23505') return { error: 'Ya existe una categoría con este nombre' }
  if (error) return { error: error.message }

  revalidatePath('/settings/categories')
  return { success: true }
}

export async function updateCategory(id: string, data: { name: string; color: string }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { error } = await supabase
    .from('categories')
    .update({ name: data.name.trim(), color: data.color })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error?.code === '23505') return { error: 'Ya existe una categoría con este nombre' }
  if (error) return { error: error.message }

  revalidatePath('/settings/categories')
  return { success: true }
}

export async function deleteCategory(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { count } = await supabase
    .from('expenses')
    .select('id', { count: 'exact', head: true })
    .eq('category_id', id)
    .eq('user_id', user.id)

  if (count && count > 0) {
    return { error: 'Esta categoría tiene gastos asociados y no puede eliminarse' }
  }

  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/settings/categories')
  return { success: true }
}
