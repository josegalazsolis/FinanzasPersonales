import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Navbar } from '@/components/ui/Navbar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      <Navbar userName={profile?.full_name ?? user.email ?? ''} />
      <main className="max-w-6xl mx-auto px-4 py-8 pb-24 md:pb-8">
        {children}
      </main>
    </div>
  )
}
