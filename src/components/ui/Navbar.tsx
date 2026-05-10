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
      <nav className="bg-white border-b border-gray-200 hidden md:block">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <span className="font-bold text-lg text-indigo-600">💰 Finanzas</span>
            <div className="flex gap-1">
              {navItems.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-sm font-medium px-3 py-2 rounded-md transition-colors ${
                    pathname === item.href
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">{userName}</span>
            <SignOutButton />
          </div>
        </div>
      </nav>

      {/* Mobile top bar */}
      <nav className="bg-white border-b border-gray-200 md:hidden">
        <div className="px-4 flex items-center justify-between h-14">
          <span className="font-bold text-indigo-600">💰 Finanzas</span>
          <SignOutButton />
        </div>
      </nav>

      {/* Mobile bottom bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-50">
        <div className="flex">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 flex flex-col items-center py-2 text-xs font-medium transition-colors ${
                pathname === item.href
                  ? 'text-indigo-600'
                  : 'text-gray-500 hover:text-gray-900'
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
