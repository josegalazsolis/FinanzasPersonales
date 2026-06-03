'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const tabs = [
  { href: '/settings/categories', label: 'Categorías' },
  { href: '/settings/budgets', label: 'Presupuestos' },
  { href: '/settings/recurring', label: 'Recurrentes' },
  { href: '/settings/appearance', label: 'Apariencia' },
]

export function SettingsTabs() {
  const pathname = usePathname()
  return (
    <div className="flex gap-0 border-b border-gray-200 dark:border-slate-700 mb-6">
      {tabs.map(tab => (
        <Link
          key={tab.href}
          href={tab.href}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
            pathname === tab.href
              ? 'border-indigo-600 text-indigo-700 dark:text-indigo-400'
              : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300'
          }`}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  )
}
