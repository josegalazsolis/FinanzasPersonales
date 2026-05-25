'use client'
import { useState } from 'react'
import { createCategory, updateCategory, deleteCategory } from '@/app/(dashboard)/settings/categories/actions'

interface Category {
  id: string
  name: string
  color: string
  is_active: boolean
}

export function CategoriesManager({ categories: initialCategories }: { categories: Category[] }) {
  const [categories, setCategories] = useState(initialCategories)
  const [showNewForm, setShowNewForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string; hasExpenses: boolean } | null>(null)
  const [newName, setNewName] = useState('')
  const [newColor, setNewColor] = useState('#6366f1')
  const [editName, setEditName] = useState('')
  const [editColor, setEditColor] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [editError, setEditError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleCreate() {
    if (!newName.trim()) { setFormError('El nombre es requerido'); return }
    setFormError(null)
    setLoading(true)
    const result = await createCategory({ name: newName.trim(), color: newColor })
    setLoading(false)
    if ('error' in result) { setFormError(result.error ?? 'Error desconocido'); return }
    setCategories(prev => [...prev, { id: Date.now().toString(), name: newName.trim(), color: newColor, is_active: true }])
    setNewName('')
    setNewColor('#6366f1')
    setShowNewForm(false)
    // Refresh page data
    window.location.reload()
  }

  async function handleUpdate(id: string) {
    if (!editName.trim()) { setEditError('El nombre es requerido'); return }
    setEditError(null)
    setLoading(true)
    const result = await updateCategory(id, { name: editName.trim(), color: editColor })
    setLoading(false)
    if ('error' in result) { setEditError(result.error ?? 'Error desconocido'); return }
    setCategories(prev => prev.map(c => c.id === id ? { ...c, name: editName.trim(), color: editColor } : c))
    setEditingId(null)
  }

  async function handleDelete(id: string) {
    setLoading(true)
    const result = await deleteCategory(id)
    setLoading(false)
    if ('error' in result && result.error?.includes('gastos asociados')) {
      setDeleteTarget(prev => prev ? { ...prev, hasExpenses: true } : null)
      return
    }
    setCategories(prev => prev.filter(c => c.id !== id))
    setDeleteTarget(null)
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button
          onClick={() => { setShowNewForm(true); setFormError(null) }}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          + Nueva categoría
        </button>
      </div>

      {showNewForm && (
        <div className="bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4 mb-4 space-y-3">
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Nombre</label>
              <input
                type="text"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="Ej: Viajes"
                className="w-full border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Color</label>
              <input type="color" value={newColor} onChange={e => setNewColor(e.target.value)} className="h-9 w-16 rounded border border-gray-300 dark:border-slate-600 cursor-pointer" />
            </div>
          </div>
          {formError && <p className="text-sm text-red-600">{formError}</p>}
          <div className="flex gap-2">
            <button onClick={() => setShowNewForm(false)} className="border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 px-3 py-1.5 rounded-md text-sm hover:bg-gray-50 dark:hover:bg-slate-700">Cancelar</button>
            <button onClick={handleCreate} disabled={loading} className="bg-indigo-600 text-white px-3 py-1.5 rounded-md text-sm hover:bg-indigo-700 disabled:opacity-60">
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 divide-y divide-gray-100 dark:divide-slate-700">
        {categories.length === 0 && (
          <p className="text-center text-gray-500 dark:text-slate-400 py-8 text-sm">No hay categorías creadas</p>
        )}
        {categories.map(cat => (
          <div key={cat.id} className="px-4 py-3">
            {editingId === cat.id ? (
              <div className="space-y-2">
                <div className="flex gap-3 items-end">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      className="w-full border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <input type="color" value={editColor} onChange={e => setEditColor(e.target.value)} className="h-9 w-16 rounded border border-gray-300 dark:border-slate-600 cursor-pointer" />
                </div>
                {editError && <p className="text-xs text-red-600">{editError}</p>}
                <div className="flex gap-2">
                  <button onClick={() => setEditingId(null)} className="border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 px-3 py-1 rounded-md text-xs hover:bg-gray-50 dark:hover:bg-slate-700">Cancelar</button>
                  <button onClick={() => handleUpdate(cat.id)} disabled={loading} className="bg-indigo-600 text-white px-3 py-1 rounded-md text-xs hover:bg-indigo-700 disabled:opacity-60">
                    {loading ? 'Guardando...' : 'Guardar'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                  <span className="text-sm text-gray-900 dark:text-slate-100">{cat.name}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => { setEditingId(cat.id); setEditName(cat.name); setEditColor(cat.color); setEditError(null) }}
                    className="text-gray-400 hover:text-indigo-600 text-sm"
                    title="Editar"
                  >✏️</button>
                  <button
                    onClick={() => setDeleteTarget({ id: cat.id, name: cat.name, hasExpenses: false })}
                    className="text-gray-400 hover:text-red-600 text-sm"
                    title="Eliminar"
                  >🗑️</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modal eliminar */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl p-6 w-full max-w-sm mx-4">
            {deleteTarget.hasExpenses ? (
              <>
                <h2 className="text-lg font-semibold mb-2 dark:text-slate-100">No se puede eliminar</h2>
                <p className="text-sm text-gray-600 dark:text-slate-400 mb-6">Esta categoría tiene gastos asociados y no puede eliminarse.</p>
                <button onClick={() => setDeleteTarget(null)} className="w-full border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 py-2 rounded-md text-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-700">Cerrar</button>
              </>
            ) : (
              <>
                <h2 className="text-lg font-semibold mb-2 dark:text-slate-100">¿Eliminar &ldquo;{deleteTarget.name}&rdquo;?</h2>
                <p className="text-sm text-gray-600 dark:text-slate-400 mb-6">Esta acción no se puede deshacer.</p>
                <div className="flex gap-3">
                  <button onClick={() => setDeleteTarget(null)} className="flex-1 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 py-2 rounded-md text-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-700">Cancelar</button>
                  <button onClick={() => handleDelete(deleteTarget.id)} disabled={loading} className="flex-1 bg-red-600 text-white py-2 rounded-md text-sm font-medium hover:bg-red-700 disabled:opacity-60">
                    {loading ? 'Eliminando...' : 'Eliminar'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
