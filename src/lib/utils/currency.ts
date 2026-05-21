export async function getExchangeRate(fromCurrency: string): Promise<number> {
  if (fromCurrency === 'CLP') return 1

  const response = await fetch(
    `https://open.er-api.com/v6/latest/${fromCurrency}`,
    { next: { revalidate: 3600 } }
  )

  if (!response.ok) throw new Error('No se pudo obtener el tipo de cambio')

  const data = await response.json()
  if (!data.rates?.CLP) throw new Error('No se pudo obtener el tipo de cambio')
  return data.rates.CLP as number
}

export function formatCLP(amount: number): string {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(amount)
}
