import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { getSystemPrompt } from '@/lib/prompts'
import { searchRelevantDocuments } from '@/lib/document-processing'

// Modelo principal del chat
const CHAT_MODEL = 'gemini-2.5-flash'

export async function POST(req: Request) {
    try {
        const cookieStore = cookies()
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() { return cookieStore.getAll() },
                    setAll(cookiesToSet) {
                        try {
                            cookiesToSet.forEach(({ name, value, options }) => {
                                cookieStore.set(name, value, options)
                            })
                        } catch { /* route handler: set cookies is optional */ }
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
                error: 'API Key no configurada. Por favor, agrégala en la pantalla de configuración.'
            }, { status: 400 })
        }

        const body = await req.json()
        const { messages, tema } = body

        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            return NextResponse.json({ error: 'No hay mensajes para enviar.' }, { status: 400 })
        }

        const lastMessage = messages[messages.length - 1].content

        // ─── RAG: Búsqueda de documentos relevantes ────────────────────────────────
        // Este bloque es 100% opcional — si falla, el chat continúa normalmente
        let relevantContext = ''
        try {
            const relevantDocs = await searchRelevantDocuments(
                lastMessage,
                user!.id,
                tema || '',
                apiKey,
                5
            )
            if (relevantDocs.length > 0) {
                relevantContext = relevantDocs
                    .map(doc => `[Fuente: ${doc.metadata?.file_name || 'Documento'}]\n${doc.content}`)
                    .join('\n\n')
            }
        } catch {
            // RAG failure is non-fatal — chat continues without document context
        }
        // ──────────────────────────────────────────────────────────────────────────

        const basePrompt = getSystemPrompt(tema || 'General')
        const systemInstruction = relevantContext
            ? `${basePrompt}\n\n=== CONTEXTO DE DOCUMENTOS DEL ESTUDIANTE ===\n${relevantContext}\n=== FIN DEL CONTEXTO ===\n\nUsa esta información cuando sea relevante. Cita la fuente entre corchetes [Fuente: nombre.pdf] cuando la uses.`
            : basePrompt

        // ─── Llamada a Gemini ──────────────────────────────────────────────────────
        const genAI = new GoogleGenerativeAI(apiKey)
        const model = genAI.getGenerativeModel({
            model: CHAT_MODEL,
            systemInstruction
        })

        const history = messages.slice(0, -1).map((m: any) => ({
            role: m.role === 'ai' ? 'model' : 'user',
            parts: [{ text: m.content }]
        }))

        const chat = model.startChat({ history })
        const result = await chat.sendMessage(lastMessage)
        const responseText = result.response.text()

        return NextResponse.json({ content: responseText })
        // ──────────────────────────────────────────────────────────────────────────

    } catch (error: any) {
        // Log completo del error real para depuración
        console.error('[CHAT ROUTE ERROR]', {
            message: error.message,
            status: error.status,
            statusText: error.statusText,
        })

        // Error 429 = límite de tasa real de Gemini
        if (error.status === 429 || (error.message && error.message.includes('429'))) {
            return NextResponse.json({
                error: 'Límite de solicitudes alcanzado en Gemini. Espera un momento e intenta de nuevo.'
            }, { status: 429 })
        }

        // Error 400 = API key inválida u otro problema de parámetros
        if (error.status === 400) {
            return NextResponse.json({
                error: `Error de configuración: ${error.message}`
            }, { status: 400 })
        }

        // Error 403 = API key sin permisos o modelo no disponible
        if (error.status === 403) {
            return NextResponse.json({
                error: 'Tu API Key no tiene acceso a este modelo. Verifica que esté activa en Google AI Studio.'
            }, { status: 403 })
        }

        return NextResponse.json({
            error: `Error del servidor: ${error.message || 'Error desconocido'}`,
        }, { status: 500 })
    }
}
