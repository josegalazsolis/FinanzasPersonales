'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { formatCLP } from '@/lib/utils/currency'
import { createRecurring, toggleRecurring, deleteRecurring } from '@/app/(dashboard)/settings/recurring/actions'

interface RecurringItem {
  id: string
  description: string
  amount_clp: number
  day_of_month: number
  is_active: boolean
  account_id: string
  category_id: string | null
  last_applied_month: number | null
  last_applied_year: number | null
}

interface Account { id: string; name: string }
interface Category { id: string; name: string; color: string }

interface Props {
  items: RecurringItem[]
  accounts: Account[]
  categories: Category[]
}

const ORDINAL = (n: number) => `${n}`

function ordinalLabel(day: number) {
  if (day === 1) return '1ro'
  if (day === 28) return '28 (últ. seguro)'
  return `${day}`
}

const emptyForm = { description: '', accountId: '', categoryId: '', amountClp: '', dayOfMonth: '1' }

export function RecurringManager({ items, accounts, categories }: Props) {
  const router = useRouter()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  function resetForm() {
    setForm(emptyForm)
    setShowForm(false)
    setMessage(null)
  }

  async function handleCreate() {
    if (!form.description.trim() || !form.accountId || !form.amountClp) {
      setMessage({ type: 'error', text: 'Completa descripción, cuenta y monto' })
      return
    }
    setSaving(true)
    setMessage(null)
    const result = await createRecurring({
      accountId: form.accountId,
      categoryId: form.categoryId || null,
      description: form.description.trim(),
      amountClp: Math.round(parseFloat(form.amountClp)),
      dayOfMonth: parseInt(form.dayOfMonth),
    })
    setSaving(false)
    if ('error' in result) {
      setMessage({ type: 'error', text: result.error ?? 'Error' })
    } else {
      resetForm()
      router.refresh()
    }
  }

  async function handleToggle(id: string, current: boolean) {
    setTogglingId(id)
    await toggleRecurring(id, !current)
    setTogglingId(null)
    router.refresh()
  }

  async function handleDelete(id: string) {
    setDeletingId(id)
    await deleteRecurring(id)
    setDeletingId(null)
    router.refresh()
  }

  function appliedLabel(item: RecurringItem) {
    if (!item.last_applied_month || !item.last_applied_year) return 'Nunca aplicado'
    const now = new Date()
    if (item.last_applied_month === now.getMonth() + 1 && item.last_applied_year === now.getFullYear()) {
      return 'Aplicado este mes'
    }
    const MONTHS = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']
    return `Últ.: ${MONTHS[item.last_applied_month - 1]} ${item.last_applied_year}`
  }

  const days = Array.from({ length: 28 }, (_, i) => i + 1)

  return (
    <div>
      {message && (
        <div className={`rounded-md px-4 py-3 text-sm mb-4 ${
          message.type === 'success'
            ? 'bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800'
            : 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800'
        }`}>
          {message.text}
        </div>
      )}

      {/* Lista */}
      {items.length === 0 && !showForm ? (
        <div className="text-center py-12 text-gray-500 dark:text-slate-400 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700">
          <p className="text-sm mb-4">No tienes gastos recurrentes configurados.</p>
          <button
            onClick={() => setShowForm(true)}
            className="text-sm text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
          >
            + Agregar el primero
          </button>
        </div>
      ) : (
        <>
          {items.length > 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 divide-y divide-gray-100 dark:divide-slate-700 mb-4">
              {items.map(item => {
                const cat = categories.find(c => c.id === item.category_id)
                const acc = accounts.find(a => a.id === item.account_id)
                return (
                  <div key={item.id} className={`flex items-center gap-3 px-4 py-3 ${!item.is_active ? 'opacity-50' : ''}`}>
                    {/* Indicador día */}
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex flex-col items-center justify-center">
                      <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 leading-none">
                        {ordinalLabel(item.day_of_month)}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {cat && (
                          <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                        )}
                        <span className="text-sm font-medium text-gray-900 dark:text-slate-100 truncate">{item.description}</span>
                      </div>
                      <div className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">
                        {acc?.name} · {appliedLabel(item)}
                      </div>
                    </div>

                    {/* Monto */}
                    <span className="text-sm font-semibold text-gray-900 dark:text-slate-100 flex-shrink-0">
                      {formatCLP(item.amount_clp)}
                    </span>

                    {/* Acciones */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleToggle(item.id, item.is_active)}
                        disabled={togglingId === item.id}
                        title={item.is_active ? 'Pausar' : 'Activar'}
                        className="text-xs px-2 py-1 rounded border border-gray-200 dark:border-slate-600 text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50 transition-colors"
                      >
                        {item.is_active ? 'Pausar' : 'Activar'}
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        disabled={deletingId === item.id}
                        title="Eliminar"
                        className="text-xs px-2 py-1 rounded border border-red-200 dark:border-red-800 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50 transition-colors"
                      >
                        {deletingId === item.id ? '...' : 'Eliminar'}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="text-sm text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
            >
              + Agregar gasto recurrente
            </button>
          )}
        </>
      )}

      {/* Formulario nuevo */}
      {showForm && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-5 mt-2">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-slate-100 mb-4">Nuevo gasto recurrente</h3>
          <div className="grid grid-cols-1 gap-3">
            <div>
              <label className="block text-xs text-gray-500 dark:text-slate-400 mb-1">Descripción</label>
              <input
                type="text"
                placeholder="Ej: Netflix, Arriendo, Gym"
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                className="w-full border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 dark:text-slate-400 mb-1">Cuenta</label>
                <select
                  value={form.accountId}
                  onChange={e => setForm(f => ({ ...f, accountId: e.target.value }))}
                  className="w-full border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Seleccionar...</option>
                  {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs text-gray-500 dark:text-slate-400 mb-1">Categoría</label>
                <select
                  value={form.categoryId}
                  onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))}
                  className="w-full border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Sin categoría</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 dark:text-slate-400 mb-1">Monto (CLP)</label>
                <input
                  type="number"
                  min="1"
                  step="1000"
                  placeholder="0"
                  value={form.amountClp}
                  onChange={e => setForm(f => ({ ...f, amountClp: e.target.value }))}
                  className="w-full border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-500 dark:text-slate-400 mb-1">Día del mes</label>
                <select
                  value={form.dayOfMonth}
                  onChange={e => setForm(f => ({ ...f, dayOfMonth: e.target.value }))}
                  className="w-full border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {days.map(d => <option key={d} value={d}>{ordinalLabel(d)}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <button
              onClick={handleCreate}
              disabled={saving}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 disabled:opacity-60 transition-colors"
            >
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
            <button
              onClick={resetForm}
              className="text-sm text-gray-500 dark:text-slate-400 px-4 py-2 hover:text-gray-700 dark:hover:text-slate-200 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
