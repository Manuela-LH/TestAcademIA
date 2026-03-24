import { NextRequest, NextResponse } from 'next/server'
import { searchRelevantDocuments } from '@/lib/document-processing'

export async function POST(req: NextRequest) {
  try {
    const { query, userId, temaName, apiKey } = await req.json()

    if (!query || !userId || !temaName || !apiKey) {
      return NextResponse.json(
        { error: 'Faltan datos requeridos: query, userId, temaName, apiKey' },
        { status: 400 }
      )
    }

    const relevantDocs = await searchRelevantDocuments(query, userId, temaName, apiKey, 5)

    return NextResponse.json({ relevantDocs })

  } catch (error: any) {
    console.error('Error searching documents:', error)
    return NextResponse.json(
      { error: error.message || 'Error al buscar documentos' },
      { status: 500 }
    )
  }
}
