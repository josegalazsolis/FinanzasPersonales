'use client'
import { useTheme } from '@/components/providers/ThemeProvider'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-slate-700 rounded-lg">
      <button
        onClick={() => setTheme('light')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
          theme === 'light'
            ? 'bg-white dark:bg-slate-600 text-gray-900 dark:text-slate-100 shadow-sm'
            : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300'
        }`}
        aria-pressed={theme === 'light'}
      >
        ☀️ Claro
      </button>
      <button
        onClick={() => setTheme('dark')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
          theme === 'dark'
            ? 'bg-white dark:bg-slate-600 text-gray-900 dark:text-slate-100 shadow-sm'
            : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300'
        }`}
        aria-pressed={theme === 'dark'}
      >
        🌙 Oscuro
      </button>
    </div>
  )
}
