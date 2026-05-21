import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const from = request.nextUrl.searchParams.get('from')
  if (!from || from === 'CLP') return NextResponse.json({ rate: 1 })

  try {
    const res = await fetch(`https://open.er-api.com/v6/latest/${from}`)
    if (!res.ok) throw new Error('API error')
    const data = await res.json()
    if (!data.rates?.CLP) throw new Error('No CLP rate')
    return NextResponse.json({ rate: data.rates.CLP })
  } catch {
    return NextResponse.json({ error: 'No se pudo obtener el tipo de cambio' }, { status: 500 })
  }
}
