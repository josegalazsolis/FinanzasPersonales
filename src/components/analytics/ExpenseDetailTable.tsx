'use client'
import { useState } from 'react'
import { formatCLP } from '@/lib/utils/currency'
import type { ExpenseRow } from './types'

type SortKey = 'date' | 'merchant' | 'category' | 'amount_clp'
type SortDir = 'asc' | 'desc'

interface ExpenseDetailTableProps {
  expenses: ExpenseRow[]
}

export function ExpenseDetailTable({ expenses }: ExpenseDetailTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('date')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  const sorted = [...expenses].sort((a, b) => {
    let cmp = 0
    switch (sortKey) {
      case 'date':
        cmp = a.date.localeCompare(b.date)
        break
      case 'merchant':
        cmp = a.merchant.localeCompare(b.merchant)
        break
      case 'category':
        cmp = (a.categories?.name ?? '').localeCompare(b.categories?.name ?? '')
        break
      case 'amount_clp':
        cmp = a.amount_clp - b.amount_clp
        break
    }
    return sortDir === 'asc' ? cmp : -cmp
  })

  function exportCSV() {
    const header = 'Fecha,Comercio,Categoría,Cuenta,Monto Original,Moneda,Monto CLP'
    const rows = sorted.map(e => [
      e.date,
      `"${e.merchant}"`,
      `"${e.categories?.name ?? ''}"`,
      `"${e.accounts?.name ?? ''}"`,
      e.amount,
      e.currency,
      e.amount_clp,
    ].join(','))
    const csv = [header, ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'gastos.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  function SortHeader({ label, field }: { label: string; field: SortKey }) {
    const active = sortKey === field
    return (
      <th
        className="text-left px-4 py-3 cursor-pointer select-none hover:text-gray-900 transition-colors"
        onClick={() => handleSort(field)}
      >
        <span className={active ? 'text-indigo-600 font-semibold' : ''}>
          {label}
          {active && <span className="ml-1">{sortDir === 'asc' ? '↑' : '↓'}</span>}
        </span>
      </th>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <h2 className="text-base font-semibold text-gray-900">Detalle de gastos</h2>
        <button
          onClick={exportCSV}
          className="text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
        >
          Exportar CSV
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
            <tr>
              <SortHeader label="Fecha" field="date" />
              <SortHeader label="Comercio" field="merchant" />
              <SortHeader label="Categoría" field="category" />
              <th className="text-left px-4 py-3">Cuenta</th>
              <th className="text-right px-4 py-3">Monto original</th>
              <SortHeader label="CLP" field="amount_clp" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sorted.map(e => {
              const [y, m, d] = e.date.split('-')
              return (
                <tr key={e.id} className="bg-white hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{`${d}/${m}/${y}`}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{e.merchant}</td>
                  <td className="px-4 py-3">
                    {e.categories && (
                      <span className="inline-flex items-center gap-1.5 text-xs">
                        <span
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: e.categories.color }}
                        />
                        {e.categories.name}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                    {e.accounts?.name ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-600 whitespace-nowrap">
                    {e.amount.toLocaleString('es-CL')} {e.currency}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-gray-900 whitespace-nowrap">
                    {formatCLP(e.amount_clp)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <div className="px-6 py-3 border-t border-gray-100 flex justify-end">
        <p className="text-sm text-gray-500">
          {sorted.length} gasto{sorted.length !== 1 ? 's' : ''} ·{' '}
          <span className="font-semibold text-gray-900">
            {formatCLP(sorted.reduce((s, e) => s + e.amount_clp, 0))}
          </span>
        </p>
      </div>
    </div>
  )
}
