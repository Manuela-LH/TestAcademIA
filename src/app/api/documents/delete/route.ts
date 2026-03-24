import { NextRequest, NextResponse } from 'next/server'
import { deleteDocumentSegments } from '@/lib/document-processing'

export async function POST(req: NextRequest) {
  try {
    const { fileName, userId, temaName } = await req.json()

    if (!fileName || !userId || !temaName) {
      return NextResponse.json(
        { error: 'Faltan datos requeridos: fileName, userId, temaName' },
        { status: 400 }
      )
    }

    await deleteDocumentSegments(userId, temaName, fileName)

    return NextResponse.json({ 
      success: true, 
      message: 'Documento eliminado correctamente' 
    })

  } catch (error: any) {
    console.error('Error deleting document:', error)
    return NextResponse.json(
      { error: error.message || 'Error al eliminar el documento' },
      { status: 500 }
    )
  }
}
