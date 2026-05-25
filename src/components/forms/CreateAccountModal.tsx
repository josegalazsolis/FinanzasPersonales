'use client'
import { useActionState, useState } from 'react'
import { createAccount } from '@/app/(dashboard)/dashboard/actions'

export function CreateAccountModal({ buttonLabel = '+ Nueva cuenta' }: { buttonLabel?: string }) {
  const [open, setOpen] = useState(false)
  const [state, action, pending] = useActionState(
    async (prevState: { error: string } | null, formData: FormData) => {
      const result = await createAccount(prevState, formData)
      if ('success' in result) {
        setOpen(false)
        return null
      }
      return result
    },
    null
  )

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors"
      >
        {buttonLabel}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl p-6 w-full max-w-sm mx-4">
            <h2 className="text-lg font-semibold mb-4 dark:text-slate-100">Nueva cuenta</h2>
            <form action={action} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                  Nombre de la cuenta
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  placeholder="Ej: Banco BCI"
                  className="w-full border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                  Tipo de cuenta
                </label>
                <select
                  id="type"
                  name="type"
                  className="w-full border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="cuenta_corriente">Cuenta Corriente</option>
                  <option value="tarjeta_credito">Tarjeta de Crédito</option>
                </select>
              </div>

              {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex-1 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 py-2 rounded-md text-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={pending}
                  className="flex-1 bg-indigo-600 text-white py-2 rounded-md text-sm font-medium hover:bg-indigo-700 disabled:opacity-60 transition-colors"
                >
                  {pending ? 'Creando...' : 'Crear cuenta'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
