'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

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
