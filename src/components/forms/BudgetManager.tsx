'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { formatCLP } from '@/lib/utils/currency'
import { saveBudgets, copyPreviousMonthBudgets } from '@/app/(dashboard)/settings/budgets/actions'

interface Category {
  id: string
  name: string
  color: string
}

interface Budget {
  id: string
  category_id: string
  amount_clp: number
}

interface BudgetManagerProps {
  categories: Category[]
  budgets: Budget[]
  month: number
  year: number
}

const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

export function BudgetManager({ categories, budgets, month, year }: BudgetManagerProps) {
  const router = useRouter()
  const now = new Date()
  const years = [now.getFullYear() + 1, now.getFullYear(), now.getFullYear() - 1]

  const initialAmounts = Object.fromEntries(
    categories.map(cat => {
      const existing = budgets.find(b => b.category_id === cat.id)
      return [cat.id, existing ? String(Math.round(existing.amount_clp)) : '']
    })
  )

  const [amounts, setAmounts] = useState<Record<string, string>>(initialAmounts)
  const [saving, setSaving] = useState(false)
  const [copying, setCopying] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  function handlePeriodChange(newMonth: number, newYear: number) {
    router.push(`/settings/budgets?month=${newMonth}&year=${newYear}`)
  }

  async function handleSave() {
    setSaving(true)
    setMessage(null)
    const items = categories.map(cat => ({
      categoryId: cat.id,
      amountClp: amounts[cat.id] ? parseFloat(amounts[cat.id]) : null,
    }))
    const result = await saveBudgets(items, month, year)
    setSaving(false)
    if ('error' in result) {
      setMessage({ type: 'error', text: result.error ?? 'Error desconocido' })
    } else {
      setMessage({ type: 'success', text: 'Presupuestos guardados correctamente' })
    }
  }

  async function handleCopy() {
    setCopying(true)
    setMessage(null)
    const result = await copyPreviousMonthBudgets(month, year)
    setCopying(false)
    if ('error' in result) {
      setMessage({ type: 'error', text: result.error ?? 'Error' })
    } else {
      setMessage({ type: 'success', text: `Se copiaron ${result.count} presupuesto(s) del mes anterior` })
      router.refresh()
    }
  }

  const total = categories.reduce((sum, cat) => {
    const v = parseFloat(amounts[cat.id] ?? '')
    return sum + (isNaN(v) ? 0 : v)
  }, 0)

  return (
    <div>
      {/* Selector de período */}
      <div className="flex gap-2 mb-6">
        <select
          value={month}
          onChange={e => handlePeriodChange(parseInt(e.target.value), year)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm"
        >
          {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
        </select>
        <select
          value={year}
          onChange={e => handlePeriodChange(month, parseInt(e.target.value))}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm"
        >
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        <button
          onClick={handleCopy}
          disabled={copying}
          className="ml-auto text-sm text-indigo-600 hover:text-indigo-800 font-medium disabled:opacity-50 transition-colors"
        >
          {copying ? 'Copiando...' : '↩ Copiar mes anterior'}
        </button>
      </div>

      {message && (
        <div className={`rounded-md px-4 py-3 text-sm mb-4 ${
          message.type === 'success'
            ? 'bg-green-50 text-green-700 border border-green-200'
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      {categories.length === 0 ? (
        <div className="text-center py-12 text-gray-500 bg-white rounded-xl border border-gray-200">
          <p className="text-sm">No hay categorías activas. Crea categorías primero.</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
            {categories.map(cat => (
              <div key={cat.id} className="flex items-center gap-4 px-4 py-3">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                  <span className="text-sm text-gray-900 truncate">{cat.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-400">$</span>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    placeholder="Sin límite"
                    value={amounts[cat.id]}
                    onChange={e => setAmounts(prev => ({ ...prev, [cat.id]: e.target.value }))}
                    className="w-36 border border-gray-300 rounded-md px-3 py-1.5 text-sm text-right focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Total presupuestado:{' '}
              <span className="font-semibold text-gray-900">{total > 0 ? formatCLP(total) : '—'}</span>
            </p>
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-indigo-600 text-white px-5 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 disabled:opacity-60 transition-colors"
            >
              {saving ? 'Guardando...' : 'Guardar presupuestos'}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
