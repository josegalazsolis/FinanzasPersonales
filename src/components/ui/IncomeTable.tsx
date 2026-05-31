'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import * as XLSX from 'xlsx'
import { formatCLP } from '@/lib/utils/currency'
import { deleteIncome } from '@/app/(dashboard)/accounts/[id]/incomes/actions'

interface Income {
  id: string
  date: string
  source: string
  amount: number
  currency: string
  amount_clp: number
}

interface IncomeTableProps {
  incomes: Income[]
  accountId: string
  total: number
  currentMonth: number
  currentYear: number
}

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

export function IncomeTable({ incomes, accountId, total, currentMonth, currentYear }: IncomeTableProps) {
  const router = useRouter()
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const now = new Date()
  const years = [now.getFullYear(), now.getFullYear() - 1, now.getFullYear() - 2]

  function handlePeriodChange(month: number, year: number) {
    router.push(`/accounts/${accountId}?tab=ingresos&month=${month}&year=${year}`)
  }

  function exportCSV() {
    const header = 'Fecha,Fuente,Monto Original,Moneda,Monto CLP'
    const rows = incomes.map(i => [
      i.date,
      `"${i.source}"`,
      i.amount,
      i.currency,
      i.amount_clp,
    ].join(','))
    const csv = '﻿' + [header, ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'ingresos.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  function exportExcel() {
    const rows = incomes.map(i => ({
      Fecha: i.date,
      Fuente: i.source,
      'Monto Original': i.amount,
      Moneda: i.currency,
      'Monto CLP': i.amount_clp,
    }))
    const ws = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Ingresos')
    XLSX.writeFile(wb, 'ingresos.xlsx')
  }

  async function handleDelete() {
    if (!deleteId) return
    setIsDeleting(true)
    await deleteIncome(deleteId, accountId)
    setIsDeleting(false)
    setDeleteId(null)
  }

  return (
    <div>
      {/* Selector de período */}
      <div className="flex gap-2 mb-6">
        <select
          value={currentMonth}
          onChange={e => handlePeriodChange(parseInt(e.target.value), currentYear)}
          className="border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {MONTHS.map((m, i) => (
            <option key={i} value={i + 1}>{m}</option>
          ))}
        </select>
        <select
          value={currentYear}
          onChange={e => handlePeriodChange(currentMonth, parseInt(e.target.value))}
          className="border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {incomes.length === 0 ? (
        <div className="text-center py-16 text-gray-500 dark:text-slate-400">
          <p className="text-lg mb-4">No hay ingresos en este período</p>
          <Link
            href={`/accounts/${accountId}/incomes/new`}
            className="bg-emerald-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-emerald-700 transition-colors"
          >
            + Nuevo ingreso
          </Link>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-slate-700">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-slate-800 text-gray-600 dark:text-slate-400 text-xs uppercase">
                <tr>
                  <th className="text-left px-4 py-3">Fecha</th>
                  <th className="text-left px-4 py-3">Fuente</th>
                  <th className="text-right px-4 py-3">Monto</th>
                  <th className="text-right px-4 py-3">CLP</th>
                  <th className="text-center px-4 py-3">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                {incomes.map(income => {
                  const [y, m, d] = income.date.split('-')
                  const dateStr = `${d}/${m}/${y}`
                  return (
                    <tr key={income.id} className="bg-white dark:bg-slate-900 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                      <td className="px-4 py-3 text-gray-600 dark:text-slate-400 whitespace-nowrap">{dateStr}</td>
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-slate-100">{income.source}</td>
                      <td className="px-4 py-3 text-right text-gray-700 dark:text-slate-300 whitespace-nowrap">
                        {income.amount.toLocaleString('es-CL')} {income.currency}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                        {formatCLP(income.amount_clp)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Link
                            href={`/accounts/${accountId}/incomes/${income.id}/edit`}
                            className="text-gray-400 hover:text-indigo-600 transition-colors"
                            title="Editar"
                          >
                            ✏️
                          </Link>
                          <button
                            onClick={() => setDeleteId(income.id)}
                            className="text-gray-400 hover:text-red-600 transition-colors"
                            title="Eliminar"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="flex gap-3">
              <button onClick={exportCSV} className="text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors">CSV</button>
              <button onClick={exportExcel} className="text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors">Excel</button>
            </div>
            <p className="text-sm text-gray-600 dark:text-slate-400">
              Total del período:{' '}
              <span className="font-bold text-emerald-600 dark:text-emerald-400 text-base">{formatCLP(total)}</span>
            </p>
          </div>
        </>
      )}

      {/* Modal de eliminación */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl p-6 w-full max-w-sm mx-4">
            <h2 className="text-lg font-semibold mb-2 dark:text-slate-100">¿Eliminar este ingreso?</h2>
            <p className="text-sm text-gray-600 dark:text-slate-400 mb-6">Esta acción no se puede deshacer.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 py-2 rounded-md text-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 bg-red-600 text-white py-2 rounded-md text-sm font-medium hover:bg-red-700 disabled:opacity-60 transition-colors"
              >
                {isDeleting ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
