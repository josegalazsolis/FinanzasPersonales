export interface ExpenseRow {
  id: string
  date: string
  merchant: string
  amount: number
  currency: string
  amount_clp: number
  categories: { id: string; name: string; color: string } | null
  accounts: { id: string; name: string; type: string } | null
}

export type Period = 'this_month' | 'last_month' | '3_months' | 'this_year' | 'custom'
