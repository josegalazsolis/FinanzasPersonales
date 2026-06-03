'use client'
import { useRouter } from 'next/navigation'
import type { Period } from './types'

interface Account {
  id: string
  name: string
  type: string
}

interface AccountSelectorProps {
  accounts: Account[]
  currentAccount: string | undefined
  currentPeriod: Period
  currentStart?: string
  currentEnd?: string
}

export function AccountSelector({ accounts, currentAccount, currentPeriod, currentStart, currentEnd }: AccountSelectorProps) {
  const router = useRouter()

  function buildUrl(accountId: string) {
    const params = new URLSearchParams()
    params.set('period', currentPeriod)
    if (currentPeriod === 'custom' && currentStart && currentEnd) {
      params.set('start', currentStart)
      params.set('end', currentEnd)
    }
    if (accountId) params.set('account', accountId)
    return `/analytics?${params.toString()}`
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-500 dark:text-slate-400">Cuenta:</span>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => router.push(buildUrl(''))}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            !currentAccount
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-700'
          }`}
        >
          Todas
        </button>
        {accounts.map(acc => (
          <button
            key={acc.id}
            onClick={() => router.push(buildUrl(acc.id))}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              currentAccount === acc.id
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-700'
            }`}
          >
            {acc.name}
          </button>
        ))}
      </div>
    </div>
  )
}
