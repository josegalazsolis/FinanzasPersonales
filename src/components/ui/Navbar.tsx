'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { SignOutButton } from './SignOutButton'

const navItems = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/analytics', label: 'Analytics' },
  { href: '/settings/categories', label: 'Configuración' },
]

export function Navbar({ userName }: { userName: string }) {
  const pathname = usePathname()
  return (
    <>
      {/* Desktop nav */}
      <nav className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 hidden md:block">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <span className="font-bold text-lg text-indigo-600">💰 Finanzas</span>
            <div className="flex gap-1">
              {navItems.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-sm font-medium px-3 py-2 rounded-md transition-colors ${
                    pathname === item.href || (item.href === '/settings/categories' && pathname.startsWith('/settings'))
                      ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                      : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-100 hover:bg-gray-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500 dark:text-slate-400">{userName}</span>
            <SignOutButton />
          </div>
        </div>
      </nav>

      {/* Mobile top bar */}
      <nav className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 md:hidden">
        <div className="px-4 flex items-center justify-between h-14">
          <span className="font-bold text-indigo-600">💰 Finanzas</span>
          <SignOutButton />
        </div>
      </nav>

      {/* Mobile bottom bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-700 md:hidden z-50">
        <div className="flex">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 flex flex-col items-center py-2 text-xs font-medium transition-colors ${
                pathname === item.href || (item.href === '/settings/categories' && pathname.startsWith('/settings'))
                  ? 'text-indigo-600 dark:text-indigo-400'
                  : 'text-gray-500 dark:text-slate-500 hover:text-gray-900 dark:hover:text-slate-200'
              }`}
            >
              {item.label === 'Dashboard' && <span className="text-lg mb-0.5">🏠</span>}
              {item.label === 'Analytics' && <span className="text-lg mb-0.5">📊</span>}
              {item.label === 'Configuración' && <span className="text-lg mb-0.5">⚙️</span>}
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
    </>
  )
}
