export async function getExchangeRate(fromCurrency: string): Promise<number> {
  if (fromCurrency === 'CLP') return 1

  const response = await fetch(
    `https://api.frankfurter.app/latest?from=${fromCurrency}&to=CLP`,
    { next: { revalidate: 3600 } }
  )

  if (!response.ok) throw new Error('No se pudo obtener el tipo de cambio')

  const data = await response.json()
  return data.rates.CLP as number
}

export function formatCLP(amount: number): string {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(amount)
}
