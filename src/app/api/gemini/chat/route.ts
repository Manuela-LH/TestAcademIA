import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { GoogleGenerativeAI } from '@google/generative-ai'

export async function POST(req: Request) {
    try {
        const cookieStore = cookies()
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return cookieStore.getAll()
                    },
                    setAll(cookiesToSet) {
                        try {
                            cookiesToSet.forEach(({ name, value, options }) => {
                                cookieStore.set(name, value, options)
                            })
                        } catch (error) { }
                    },
                },
            }
        )

        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
            return NextResponse.json({ error: 'No autorizado. Inicia sesión.' }, { status: 401 })
        }

        const { data: { user } } = await supabase.auth.getUser()
        const apiKey = user?.user_metadata?.gemini_api_key

        if (!apiKey) {
            return NextResponse.json({
                error: 'API Key no configurada. Por favor, agrega tu API Key.'
            }, { status: 400 })
        }

        const { messages } = await req.json()
        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            return NextResponse.json({ error: 'No hay mensajes para enviar.' }, { status: 400 })
        }

        const genAI = new GoogleGenerativeAI(apiKey)
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })

        // Convert messages to Gemini history format
        const history = messages.slice(0, -1).map((m: any) => ({
            role: m.role === 'ai' ? 'model' : 'user',
            parts: [{ text: m.content }]
        }))

        const lastMessage = messages[messages.length - 1].content

        const chat = model.startChat({ history })
        const result = await chat.sendMessage(lastMessage)
        const responseText = result.response.text()

        return NextResponse.json({ content: responseText })

    } catch (error: any) {
        if (error.message && (error.message.includes('429') || error.message.toLowerCase().includes('quota'))) {
            return NextResponse.json({
                error: 'Se ha agotado tu cuota de la capa gratis de Gemini 2.5 Flash para esta API Key. Por favor intenta más tarde.'
            }, { status: 429 })
        }
        return NextResponse.json({ error: 'Error del servidor al contactar a la IA', details: error.message }, { status: 500 })
    }
}
