import { ThemeToggle } from '@/components/ui/ThemeToggle'

export default function AppearancePage() {
  return (
    <>
      <p className="text-gray-500 dark:text-slate-400 mb-6">Personaliza la apariencia de la app</p>
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-slate-100">Tema</p>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">Elige entre modo claro u oscuro</p>
          </div>
          <ThemeToggle />
        </div>
      </div>
    </>
  )
}
