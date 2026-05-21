import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PeriodSelector } from '@/components/analytics/PeriodSelector'
import { KPICards } from '@/components/analytics/KPICards'
import { CategoryPieChart } from '@/components/analytics/CategoryPieChart'
import { TemporalBarChart } from '@/components/analytics/TemporalBarChart'
import { AccountTypeChart } from '@/components/analytics/AccountTypeChart'
import { MonthlyProjection } from '@/components/analytics/MonthlyProjection'
import { ExpenseDetailTable } from '@/components/analytics/ExpenseDetailTable'
import type { ExpenseRow, Period } from '@/components/analytics/types'

function getDateRange(period: Period, customStart?: string, customEnd?: string) {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1
  const pad = (n: number) => String(n).padStart(2, '0')
  const todayStr = `${year}-${pad(month)}-${pad(now.getDate())}`

  switch (period) {
    case 'last_month': {
      const d = new Date(year, month - 2, 1)
      const y = d.getFullYear()
      const m = d.getMonth() + 1
      const lastDay = new Date(y, m, 0).getDate()
      return { startDate: `${y}-${pad(m)}-01`, endDate: `${y}-${pad(m)}-${pad(lastDay)}`, isCurrentMonth: false }
    }
    case '3_months': {
      const d = new Date(year, month - 4, 1)
      return { startDate: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-01`, endDate: todayStr, isCurrentMonth: false }
    }
    case 'this_year':
      return { startDate: `${year}-01-01`, endDate: todayStr, isCurrentMonth: false }
    case 'custom':
      return {
        startDate: customStart ?? `${year}-${pad(month)}-01`,
        endDate: customEnd ?? todayStr,
        isCurrentMonth: false,
      }
    default: {
      const lastDay = new Date(year, month, 0).getDate()
      return { startDate: `${year}-${pad(month)}-01`, endDate: `${year}-${pad(month)}-${pad(lastDay)}`, isCurrentMonth: true }
    }
  }
}

interface Props {
  searchParams: Promise<{ period?: string; start?: string; end?: string }>
}

export default async function AnalyticsPage({ searchParams }: Props) {
  const sp = await searchParams
  const period = (sp.period as Period) ?? 'this_month'
  const { startDate, endDate, isCurrentMonth } = getDateRange(period, sp.start, sp.end)

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: expenses } = await supabase
    .from('expenses')
    .select(`id, date, merchant, amount, currency, amount_clp,
      categories(id, name, color),
      accounts(id, name, type)`)
    .eq('user_id', user.id)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: false })

  const rows = (expenses ?? []) as unknown as ExpenseRow[]

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Analytics</h1>
        <PeriodSelector currentPeriod={period} currentStart={sp.start} currentEnd={sp.end} />
      </div>

      <KPICards expenses={rows} />

      {rows.length === 0 ? (
        <div className="text-center py-16 text-gray-400 mt-6">
          <p className="text-lg">No hay gastos en este período</p>
        </div>
      ) : (
        <div className="space-y-6 mt-6">
          {isCurrentMonth && (
            <MonthlyProjection expenses={rows} startDate={startDate} />
          )}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CategoryPieChart expenses={rows} />
            <AccountTypeChart expenses={rows} />
          </div>
          <TemporalBarChart expenses={rows} startDate={startDate} endDate={endDate} />
          <ExpenseDetailTable expenses={rows} />
        </div>
      )}
    </div>
  )
}
