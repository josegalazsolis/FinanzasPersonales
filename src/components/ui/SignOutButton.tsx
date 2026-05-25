'use client'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export function SignOutButton() {
  const router = useRouter()
  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }
  return (
    <button onClick={handleSignOut} className="text-sm text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-100">
      Cerrar sesión
    </button>
  )
}
