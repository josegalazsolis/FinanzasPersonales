'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { formatCLP } from '@/lib/utils/currency'
import { updateAccount, deleteAccount } from '@/app/(dashboard)/dashboard/actions'
import { createClient } from '@/lib/supabase/client'

interface Account {
  id: string
  name: string
  type: string
  monthlyTotal: number
  monthlyIncome: number
}

export function AccountCard({ account }: { account: Account }) {
  const router = useRouter()
  const netBalance = account.monthlyIncome - account.monthlyTotal

  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [name, setName] = useState(account.name)
  const [type, setType] = useState(account.type)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deletePassword, setDeletePassword] = useState('')
  const [deleteError, setDeleteError] = useState<string | null>(null)

  function openDeleteModal() {
    setDeletePassword('')
    setDeleteError(null)
    setDeleteOpen(true)
  }

  async function handleEdit() {
    setSaving(true)
    setError(null)
    const result = await updateAccount(account.id, name, type)
    setSaving(false)
    if ('error' in result) { setError(result.error ?? 'Error'); return }
    setEditOpen(false)
    router.refresh()
  }

  async function handleDelete() {
    if (!deletePassword) { setDeleteError('Ingresa tu contraseña para confirmar'); return }
    setDeleting(true)
    setDeleteError(null)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.email) { setDeleteError('No se pudo obtener el usuario'); setDeleting(false); return }

    const { error: authError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: deletePassword,
    })

    if (authError) {
      setDeleteError('Contraseña incorrecta')
      setDeleting(false)
      return
    }

    await deleteAccount(account.id)
    setDeleting(false)
    setDeleteOpen(false)
    router.refresh()
  }

  return (
    <>
      <div
        className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-5 hover:border-indigo-300 dark:hover:border-indigo-500 hover:shadow-sm transition-all cursor-pointer"
        onClick={() => router.push(`/accounts/${account.id}`)}
      >
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-semibold text-gray-900 dark:text-slate-100 truncate mr-2">{account.name}</h3>
          <div className="flex items-center gap-1 flex-shrink-0">
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${
              account.type === 'cuenta_corriente'
                ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                : 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
            }`}>
              {account.type === 'cuenta_corriente' ? 'CC' : 'TC'}
            </span>
            <button
              onClick={e => { e.stopPropagation(); setName(account.name); setType(account.type); setError(null); setEditOpen(true) }}
              className="p-1 rounded text-gray-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors"
              title="Editar cuenta"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
            </button>
            <button
              onClick={e => { e.stopPropagation(); openDeleteModal() }}
              className="p-1 rounded text-gray-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
              title="Eliminar cuenta"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <p className="text-xs text-gray-500 dark:text-slate-400">Ingresos</p>
            <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">{formatCLP(account.monthlyIncome)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-slate-400">Gastos</p>
            <p className="text-sm font-semibold text-gray-900 dark:text-slate-100">{formatCLP(account.monthlyTotal)}</p>
          </div>
        </div>
        <div className="border-t border-gray-100 dark:border-slate-700 pt-3">
          <p className="text-xs text-gray-500 dark:text-slate-400">Saldo neto del mes</p>
          <p className={`text-xl font-bold mt-0.5 ${netBalance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
            {formatCLP(netBalance)}
          </p>
        </div>
      </div>

      {/* Modal editar */}
      {editOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setEditOpen(false)}>
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl p-6 w-full max-w-sm mx-4" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-semibold mb-4 dark:text-slate-100">Editar cuenta</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Nombre</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Tipo</label>
                <select
                  value={type}
                  onChange={e => setType(e.target.value)}
                  className="w-full border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="cuenta_corriente">Cuenta Corriente</option>
                  <option value="tarjeta_credito">Tarjeta de Crédito</option>
                </select>
              </div>
              {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
              <div className="flex gap-3 pt-1">
                <button
                  onClick={() => setEditOpen(false)}
                  className="flex-1 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 py-2 rounded-md text-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleEdit}
                  disabled={saving}
                  className="flex-1 bg-indigo-600 text-white py-2 rounded-md text-sm font-medium hover:bg-indigo-700 disabled:opacity-60 transition-colors"
                >
                  {saving ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal eliminar */}
      {deleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setDeleteOpen(false)}>
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl p-6 w-full max-w-sm mx-4" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-semibold mb-2 dark:text-slate-100">¿Eliminar "{account.name}"?</h2>
            <p className="text-sm text-gray-600 dark:text-slate-400 mb-4">
              Se eliminarán todos los gastos e ingresos asociados. Esta acción no se puede deshacer.
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                Ingresa tu contraseña para confirmar
              </label>
              <input
                type="password"
                value={deletePassword}
                onChange={e => { setDeletePassword(e.target.value); setDeleteError(null) }}
                onKeyDown={e => e.key === 'Enter' && handleDelete()}
                placeholder="Tu contraseña"
                autoFocus
                className="w-full border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              {deleteError && (
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">{deleteError}</p>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteOpen(false)}
                className="flex-1 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 py-2 rounded-md text-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 bg-red-600 text-white py-2 rounded-md text-sm font-medium hover:bg-red-700 disabled:opacity-60 transition-colors"
              >
                {deleting ? 'Verificando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
