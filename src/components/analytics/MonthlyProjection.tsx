import { formatCLP } from '@/lib/utils/currency'
import type { ExpenseRow } from './types'

interface MonthlyProjectionProps {
  expenses: ExpenseRow[]
  startDate: string
}

export function MonthlyProjection({ expenses, startDate }: MonthlyProjectionProps) {
  const now = new Date()
  const start = new Date(startDate)

  const elapsedDays = Math.max(
    1,
    Math.round((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
  )
  const totalDaysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  const daysRemaining = totalDaysInMonth - elapsedDays

  const total = expenses.reduce((sum, e) => sum + e.amount_clp, 0)
  const dailyAverage = total / elapsedDays
  const projection = Math.round(dailyAverage * totalDaysInMonth)
  const remaining = Math.round(dailyAverage * daysRemaining)

  const progressPercent = Math.min(100, Math.round((elapsedDays / totalDaysInMonth) * 100))

  return (
    <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-indigo-600 uppercase tracking-wide mb-1">
            Proyección del mes
          </p>
          <p className="text-2xl font-bold text-gray-900">{formatCLP(projection)}</p>
          <p className="text-sm text-gray-500 mt-1">
            Promedio diario:{' '}
            <span className="font-medium text-gray-700">{formatCLP(Math.round(dailyAverage))}</span>
            {daysRemaining > 0 && (
              <> · Faltan {daysRemaining} días · Estimado restante:{' '}
                <span className="font-medium text-gray-700">{formatCLP(remaining)}</span>
              </>
            )}
          </p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-xs text-gray-400 mb-1">{elapsedDays} de {totalDaysInMonth} días</p>
          <p className="text-sm font-medium text-indigo-600">{progressPercent}% del mes</p>
        </div>
      </div>
      <div className="mt-3 h-1.5 bg-indigo-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-indigo-500 rounded-full transition-all"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  )
}
