import Link from 'next/link'
import { formatCLP } from '@/lib/utils/currency'

interface Account {
  id: string
  name: string
  type: string
  monthlyTotal: number
}

export function AccountCard({ account }: { account: Account }) {
  return (
    <Link href={`/accounts/${account.id}`} className="block">
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-5 hover:border-indigo-300 dark:hover:border-indigo-500 hover:shadow-sm transition-all">
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-semibold text-gray-900 dark:text-slate-100">{account.name}</h3>
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${
            account.type === 'cuenta_corriente'
              ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
              : 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
          }`}>
            {account.type === 'cuenta_corriente' ? 'Cuenta Corriente' : 'Tarjeta de Crédito'}
          </span>
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-slate-400">Gasto mes actual</p>
          <p className="text-xl font-bold text-gray-900 dark:text-slate-100 mt-0.5">{formatCLP(account.monthlyTotal)}</p>
        </div>
      </div>
    </Link>
  )
}
