'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { DayPicker } from 'react-day-picker'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import 'react-day-picker/style.css'
import { createExpense } from '@/app/(dashboard)/accounts/[id]/expenses/actions'
import { formatCLP } from '@/lib/utils/currency'

interface Account {
  id: string
  name: string
}

interface Category {
  id: string
  name: string
  color: string
}

interface QuickExpenseModalProps {
  accounts: Account[]
  categories: Category[]
}

type Currency = 'CLP' | 'USD' | 'EUR' | 'JPY'

export function QuickExpenseModal({ accounts, categories }: QuickExpenseModalProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [accountId, setAccountId] = useState(accounts[0]?.id ?? '')
  const [date, setDate] = useState<Date>(new Date())
  const [showCalendar, setShowCalendar] = useState(false)
  const [merchant, setMerchant] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [amount, setAmount] = useState('')
  const [currency, setCurrency] = useState<Currency>('CLP')
  const [exchangeRate, setExchangeRate] = useState<number | null>(null)
  const [amountCLP, setAmountCLP] = useState<number | null>(null)
  const [isLoadingRate, setIsLoadingRate] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (currency === 'CLP') {
      setExchangeRate(null)
      setAmountCLP(amount ? parseFloat(amount) : null)
      return
    }
    setIsLoadingRate(true)
    fetch(`/api/exchange-rate?from=${currency}`)
      .then(r => r.json())
      .then(data => {
        if (data.rate) {
          setExchangeRate(data.rate)
          if (amount) setAmountCLP(parseFloat(amount) * data.rate)
        }
      })
      .catch(() => setExchangeRate(null))
      .finally(() => setIsLoadingRate(false))
  }, [currency])

  useEffect(() => {
    if (currency === 'CLP') {
      setAmountCLP(amount ? parseFloat(amount) : null)
    } else if (exchangeRate && amount) {
      setAmountCLP(parseFloat(amount) * exchangeRate)
    }
  }, [amount, exchangeRate, currency])

  function resetForm() {
    setAccountId(accounts[0]?.id ?? '')
    setDate(new Date())
    setShowCalendar(false)
    setMerchant('')
    setCategoryId('')
    setAmount('')
    setCurrency('CLP')
    setExchangeRate(null)
    setAmountCLP(null)
    setErrors({})
    setError(null)
  }

  function handleClose() {
    setOpen(false)
    resetForm()
  }

  function validate() {
    const newErrors: Record<string, string> = {}
    if (!accountId) newErrors.accountId = 'Selecciona una cuenta'
    if (!merchant.trim()) newErrors.merchant = 'El comercio es requerido'
    if (!categoryId) newErrors.categoryId = 'Selecciona una categoría'
    const numAmount = parseFloat(amount)
    if (!amount || isNaN(numAmount) || numAmount <= 0) newErrors.amount = 'Ingresa un monto válido'
    return newErrors
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }
    setErrors({})
    setIsSubmitting(true)
    setError(null)

    const numAmount = parseFloat(amount)
    const result = await createExpense({
      accountId,
      categoryId,
      date: format(date, 'yyyy-MM-dd'),
      merchant: merchant.trim(),
      amount: numAmount,
      currency,
      amountCLP: currency === 'CLP' ? numAmount : (amountCLP ?? numAmount),
      exchangeRateUsed: currency === 'CLP' ? 1 : (exchangeRate ?? 1),
    })

    setIsSubmitting(false)
    if (result && 'error' in result) {
      setError(result.error ?? 'Error desconocido')
    } else {
      handleClose()
      router.refresh()
    }
  }

  if (accounts.length === 0) return null

  return (
    <>
      {/* FAB */}
      <button
        onClick={() => setOpen(true)}
        title="Registrar gasto rápido"
        aria-label="Registrar gasto rápido"
        className="fixed bottom-20 md:bottom-6 right-6 z-40 w-14 h-14 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center text-2xl leading-none"
      >
        +
      </button>

      {/* Modal */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40"
          onClick={handleClose}
        >
          <div
            className="bg-white dark:bg-slate-800 rounded-t-2xl sm:rounded-xl shadow-xl p-6 w-full sm:max-w-md mx-0 sm:mx-4 max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100">Gasto rápido</h2>
              <button
                type="button"
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 text-xl leading-none"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-md px-4 py-3 text-sm">
                  {error}
                </div>
              )}

              {/* Cuenta */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Cuenta</label>
                <select
                  value={accountId}
                  onChange={e => setAccountId(e.target.value)}
                  className="w-full border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 rounded-md px-3 py-2 text-sm text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>{acc.name}</option>
                  ))}
                </select>
                {errors.accountId && <p className="text-xs text-red-600 mt-1">{errors.accountId}</p>}
              </div>

              {/* Comercio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Comercio</label>
                <input
                  type="text"
                  value={merchant}
                  onChange={e => setMerchant(e.target.value)}
                  placeholder="Ej: Jumbo, Netflix, Shell"
                  className="w-full border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 rounded-md px-3 py-2 text-sm text-gray-900 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {errors.merchant && <p className="text-xs text-red-600 mt-1">{errors.merchant}</p>}
              </div>

              {/* Categoría */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Categoría</label>
                <select
                  value={categoryId}
                  onChange={e => setCategoryId(e.target.value)}
                  className="w-full border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 rounded-md px-3 py-2 text-sm text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Seleccionar categoría...</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                {errors.categoryId && <p className="text-xs text-red-600 mt-1">{errors.categoryId}</p>}
              </div>

              {/* Valor + Moneda en fila */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Valor</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    min="0"
                    step="any"
                    placeholder="0"
                    className="w-full border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 rounded-md px-3 py-2 text-sm text-gray-900 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  {errors.amount && <p className="text-xs text-red-600 mt-1">{errors.amount}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Moneda</label>
                  <select
                    value={currency}
                    onChange={e => setCurrency(e.target.value as Currency)}
                    className="w-full border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 rounded-md px-3 py-2 text-sm text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="CLP">CLP</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="JPY">JPY</option>
                  </select>
                </div>
              </div>

              {/* Conversión */}
              {currency !== 'CLP' && (
                <div className="bg-gray-50 dark:bg-slate-700 rounded-md px-4 py-3 text-sm space-y-1">
                  {isLoadingRate ? (
                    <p className="text-gray-500 dark:text-slate-400">Obteniendo tipo de cambio...</p>
                  ) : exchangeRate ? (
                    <>
                      <p className="text-gray-600 dark:text-slate-400">1 {currency} = {formatCLP(exchangeRate)}</p>
                      {amountCLP !== null && (
                        <p className="font-medium text-gray-800 dark:text-slate-200">Equivalente: {formatCLP(amountCLP)}</p>
                      )}
                    </>
                  ) : (
                    <p className="text-red-500">No se pudo obtener el tipo de cambio</p>
                  )}
                </div>
              )}

              {/* Fecha */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Fecha</label>
                <button
                  type="button"
                  onClick={() => setShowCalendar(!showCalendar)}
                  className="w-full text-left border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 rounded-md px-3 py-2 text-sm text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  📅 {format(date, 'dd/MM/yyyy', { locale: es })}
                </button>
                {showCalendar && (
                  <div className="absolute z-20 mt-1 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-lg p-2">
                    <DayPicker
                      mode="single"
                      selected={date}
                      onSelect={(d) => { if (d) { setDate(d); setShowCalendar(false) } }}
                      disabled={{ after: new Date() }}
                      locale={es}
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 py-2.5 rounded-md text-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-indigo-600 text-white py-2.5 rounded-md text-sm font-medium hover:bg-indigo-700 disabled:opacity-60 transition-colors"
                >
                  {isSubmitting ? 'Registrando...' : 'Registrar gasto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
