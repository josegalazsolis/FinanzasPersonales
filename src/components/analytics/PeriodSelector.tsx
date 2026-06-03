'use client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import type { Period } from './types'

const PERIODS: { key: Period; label: string }[] = [
  { key: 'this_month', label: 'Este mes' },
  { key: 'last_month', label: 'Mes anterior' },
  { key: '3_months', label: 'Últimos 3 meses' },
  { key: 'this_year', label: 'Este año' },
  { key: 'custom', label: 'Personalizado' },
]

interface PeriodSelectorProps {
  currentPeriod: Period
  currentStart?: string
  currentEnd?: string
  currentAccount?: string
}

export function PeriodSelector({ currentPeriod, currentStart, currentEnd, currentAccount }: PeriodSelectorProps) {
  const router = useRouter()
  const [customStart, setCustomStart] = useState(currentStart ?? '')
  const [customEnd, setCustomEnd] = useState(currentEnd ?? '')

  function buildUrl(period: Period, start?: string, end?: string) {
    const params = new URLSearchParams()
    params.set('period', period)
    if (period === 'custom' && start && end) {
      params.set('start', start)
      params.set('end', end)
    }
    if (currentAccount) params.set('account', currentAccount)
    return `/analytics?${params.toString()}`
  }

  function selectPeriod(period: Period) {
    router.push(buildUrl(period))
  }

  function applyCustom() {
    if (customStart && customEnd) {
      router.push(buildUrl('custom', customStart, customEnd))
    }
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {PERIODS.map(p => (
          <button
            key={p.key}
            onClick={() => selectPeriod(p.key)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              currentPeriod === p.key
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-700'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {currentPeriod === 'custom' && (
        <div className="flex flex-wrap gap-2 items-center mt-3">
          <input
            type="date"
            value={customStart}
            onChange={e => setCustomStart(e.target.value)}
            className="border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 rounded-md px-3 py-1.5 text-sm"
          />
          <span className="text-gray-400 dark:text-slate-500">—</span>
          <input
            type="date"
            value={customEnd}
            onChange={e => setCustomEnd(e.target.value)}
            className="border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 rounded-md px-3 py-1.5 text-sm"
          />
          <button
            onClick={applyCustom}
            disabled={!customStart || !customEnd}
            className="bg-indigo-600 text-white px-3 py-1.5 rounded-md text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            Aplicar
          </button>
        </div>
      )}
    </div>
  )
}
