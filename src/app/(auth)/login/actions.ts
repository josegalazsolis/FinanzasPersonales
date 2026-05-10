'use server'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

function getErrorMessage(error: string): string {
  if (error.includes('Invalid login credentials')) return 'Correo o contraseña incorrectos'
  if (error.includes('Email not confirmed')) return 'Revisa tu correo y confirma tu cuenta'
  if (error.includes('User already registered')) return 'Ya existe una cuenta con este correo'
  return 'Ocurrió un error. Intenta nuevamente.'
}

export async function loginWithEmail(
  _prevState: { error: string } | null,
  formData: FormData
): Promise<{ error: string }> {
  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  })
  if (error) return { error: getErrorMessage(error.message) }
  redirect('/dashboard')
}

export async function loginWithGoogle(_formData: FormData): Promise<void> {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  })
  if (error) redirect('/login')
  if (data.url) redirect(data.url)
}
