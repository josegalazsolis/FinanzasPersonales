'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { DayPicker } from 'react-day-picker'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import 'react-day-picker/style.css'
import { createIncome, updateIncome } from '@/app/(dashboard)/accounts/[id]/incomes/actions'
import { formatCLP } from '@/lib/utils/currency'

interface InitialValues {
  id: string
  date: string
  source: string
  amount: number
  currency: 'CLP' | 'USD' | 'EUR' | 'JPY'
}

interface IncomeFormProps {
  accountId: string
  initialValues?: InitialValues
}

type Currency = 'CLP' | 'USD' | 'EUR' | 'JPY'

export function IncomeForm({ accountId, initialValues }: IncomeFormProps) {
  const router = useRouter()
  const [date, setDate] = useState<Date>(
    initialValues ? new Date(initialValues.date + 'T12:00:00') : new Date()
  )
  const [showCalendar, setShowCalendar] = useState(false)
  const [source, setSource] = useState(initialValues?.source ?? '')
  const [amount, setAmount] = useState(initialValues?.amount?.toString() ?? '')
  const [currency, setCurrency] = useState<Currency>(initialValues?.currency ?? 'CLP')
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

  function validate() {
    const newErrors: Record<string, string> = {}
    if (!source.trim()) newErrors.source = 'La fuente es requerida'
    const numAmount = parseFloat(amount)
    if (!amount || isNaN(numAmount) || numAmount <= 0) newErrors.amount = 'Ingresa un monto válido mayor a 0'
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
    const data = {
      accountId,
      date: format(date, 'yyyy-MM-dd'),
      source: source.trim(),
      amount: numAmount,
      currency,
      amountCLP: currency === 'CLP' ? numAmount : (amountCLP ?? numAmount),
      exchangeRateUsed: currency === 'CLP' ? 1 : (exchangeRate ?? 1),
    }

    const result = initialValues
      ? await updateIncome(initialValues.id, data)
      : await createIncome(data)

    setIsSubmitting(false)
    if (result && 'error' in result) {
      setError(result.error ?? 'Error desconocido')
    } else {
      router.push(`/accounts/${accountId}?tab=ingresos`)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-md px-4 py-3 text-sm">
          {error}
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

      {/* Fuente */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Fuente</label>
        <input
          type="text"
          value={source}
          onChange={e => setSource(e.target.value)}
          placeholder="Ej: Sueldo, Freelance, Arriendo"
          className="w-full border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 rounded-md px-3 py-2 text-sm text-gray-900 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        {errors.source && <p className="text-xs text-red-600 mt-1">{errors.source}</p>}
      </div>

      {/* Valor */}
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

      {/* Moneda */}
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

      {/* Conversión */}
      {currency !== 'CLP' && (
        <div className="bg-gray-50 dark:bg-slate-800 rounded-md px-4 py-3 text-sm space-y-1">
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

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-emerald-600 text-white py-2.5 rounded-md text-sm font-medium hover:bg-emerald-700 disabled:opacity-60 transition-colors"
      >
        {isSubmitting
          ? (initialValues ? 'Guardando...' : 'Registrando...')
          : (initialValues ? 'Guardar cambios' : 'Registrar ingreso')}
      </button>
    </form>
  )
}
