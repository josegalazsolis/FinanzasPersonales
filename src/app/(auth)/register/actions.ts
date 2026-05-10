'use server'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

function getErrorMessage(error: string): string {
  if (error.includes('User already registered')) return 'Ya existe una cuenta con este correo'
  if (error.includes('Password should be')) return 'La contraseña debe tener al menos 6 caracteres'
  return 'Ocurrió un error. Intenta nuevamente.'
}

export async function registerWithEmail(
  _prevState: { error: string } | null,
  formData: FormData
): Promise<{ error: string }> {
  const supabase = await createClient()
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('full_name') as string

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  })
  if (error) return { error: getErrorMessage(error.message) }
  redirect('/dashboard')
}
