import { NextResponse } from 'next/server'

export async function POST(req: Request) {
    try {
        const { apiKey } = await req.json()
        if (!apiKey) {
            return NextResponse.json({ error: 'La API Key es requerida' }, { status: 400 })
        }

        // 1. Obtener todos los modelos disponibles de la api key del usuario
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`)

        if (!response.ok) {
            const errorData = await response.json()
            return NextResponse.json({ error: 'API Key inválida o no configurada correctamente', details: errorData }, { status: 401 })
        }

        const data = await response.json()
        const models = data.models || []

        // 2. Buscar si la versión gemini-2.5-flash está entre los modelos disponibles
        const hasGemini25Flash = models.some((m: any) => m.name === 'models/gemini-2.5-flash' || m.name.includes('gemini-2.5-flash'))

        if (!hasGemini25Flash) {
            return NextResponse.json({
                error: 'La versión gemini-2.5-flash no está disponible para esta API Key.'
            }, { status: 403 })
        }

        return NextResponse.json({ success: true, message: 'API Key verificada con éxito' })

    } catch (error: any) {
        return NextResponse.json({ error: 'Error al verificar la API Key', details: error.message }, { status: 500 })
    }
}
