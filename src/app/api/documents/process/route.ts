import { NextRequest, NextResponse } from 'next/server'
import { processDocument } from '@/lib/document-processing'

export async function POST(req: NextRequest) {
  try {
    const { fileBuffer, fileName, userId, temaName, apiKey } = await req.json()

    if (!fileBuffer || !fileName || !userId || !temaName || !apiKey) {
      return NextResponse.json(
        { error: 'Faltan datos requeridos: fileBuffer, fileName, userId, temaName, apiKey' },
        { status: 400 }
      )
    }

    const buffer = Buffer.from(fileBuffer, 'base64')
    const result = await processDocument(buffer, fileName, userId, temaName, apiKey)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Error al procesar el documento' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      chunksProcessed: result.chunksProcessed,
      message: `Documento procesado exitosamente. ${result.chunksProcessed} fragmentos guardados.`
    })

  } catch (error: any) {
    console.error('Error processing document:', error)
    return NextResponse.json(
      { error: error.message || 'Error al procesar el documento' },
      { status: 500 }
    )
  }
}
