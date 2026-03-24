import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

export async function POST(req: Request) {
    try {
        const { apiKey } = await req.json()
        if (!apiKey || typeof apiKey !== 'string') {
            return NextResponse.json({ error: 'La API Key es requerida' }, { status: 400 })
        }

        // Verificar la API Key haciendo una llamada de prueba real mínima a gemini-2.5-flash
        const genAI = new GoogleGenerativeAI(apiKey.trim())
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

        await model.generateContent('hola')

        return NextResponse.json({ success: true, message: 'API Key verificada con éxito' })

    } catch (error: any) {
        console.error('[VERIFY ROUTE ERROR]', error.status, error.message)

        if (error.status === 400 || error.status === 401) {
            return NextResponse.json(
                { error: 'API Key inválida. Verifica que la copiaste correctamente desde Google AI Studio.' },
                { status: 401 }
            )
        }
        if (error.status === 403) {
            return NextResponse.json(
                { error: 'Esta API Key no tiene acceso a Gemini. Asegúrate de habilitarla en Google AI Studio.' },
                { status: 403 }
            )
        }

        return NextResponse.json(
            { error: `Error al verificar la API Key: ${error.message}` },
            { status: 500 }
        )
    }
}
