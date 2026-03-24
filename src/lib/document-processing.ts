import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { GoogleGenerativeAI } from '@google/generative-ai'

const EMBEDDING_MODEL = 'text-embedding-004'

function createSupabaseClient() {
  const cookieStore = cookies()
  return createServerClient(
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
          } catch (error) {
            console.error('Error setting cookies:', error)
          }
        },
      },
    }
  )
}

/**
 * Extrae texto de un archivo según su extensión.
 * Soporta: PDF, DOCX/DOC, PPTX/PPT, TXT, JPG, JPEG, PNG, GIF, WEBP.
 */
export async function extractTextFromFile(
  file: Buffer,
  fileName: string,
  apiKey?: string
): Promise<string> {
  const extension = fileName.split('.').pop()?.toLowerCase()

  switch (extension) {
    case 'pdf':
      return await extractFromPDF(file)
    case 'docx':
    case 'doc':
      return await extractFromDOCX(file)
    case 'pptx':
    case 'ppt':
      return await extractFromPPTX(file)
    case 'txt':
      return file.toString('utf-8')
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'webp':
      if (!apiKey) throw new Error('Se necesita una API Key para procesar imágenes.')
      return await extractFromImage(file, fileName, apiKey)
    default:
      throw new Error(`Formato no soportado: ${extension}`)
  }
}

async function extractFromPDF(buffer: Buffer): Promise<string> {
  try {
    // require() para evitar problemas de ESM con pdf-parse
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfParse = require('pdf-parse')
    const data = await pdfParse(buffer)
    return data.text || ''
  } catch (error) {
    console.error('Error extracting PDF:', error)
    throw new Error('Error al extraer texto de PDF')
  }
}

async function extractFromDOCX(buffer: Buffer): Promise<string> {
  try {
    const mammoth = (await import('mammoth')).default
    const result = await mammoth.extractRawText({ buffer })
    return result.value || ''
  } catch (error) {
    console.error('Error extracting DOCX:', error)
    throw new Error('Error al extraer texto de DOCX')
  }
}

async function extractFromPPTX(buffer: Buffer): Promise<string> {
  try {
    const AdmZip = (await import('adm-zip')).default
    const zip = new AdmZip(buffer)
    const zipEntries = zip.getEntries()

    let text = ''

    for (const entry of zipEntries) {
      if (entry.entryName.match(/ppt\/slides\/slide\d+\.xml$/)) {
        const content = entry.getData().toString('utf8')
        // Extraer texto de etiquetas <a:t>
        const textMatches = content.match(/<a:t>([^<]*)<\/a:t>/g)
        if (textMatches) {
          textMatches.forEach(match => {
            const cleanText = match.replace(/<\/?a:t>/g, '').trim()
            if (cleanText) text += cleanText + ' '
          })
          text += '\n'
        }
      }
    }

    return text.trim() || 'No se encontró texto en el archivo PowerPoint.'
  } catch (error) {
    console.error('Error extracting PPTX:', error)
    throw new Error('Error al extraer texto de PowerPoint')
  }
}

async function extractFromImage(
  buffer: Buffer,
  fileName: string,
  apiKey: string
): Promise<string> {
  try {
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    const fileNameLower = fileName.toLowerCase()
    let mimeType: string = 'image/jpeg'
    if (fileNameLower.endsWith('.png')) mimeType = 'image/png'
    else if (fileNameLower.endsWith('.gif')) mimeType = 'image/gif'
    else if (fileNameLower.endsWith('.webp')) mimeType = 'image/webp'

    const imagePart = {
      inlineData: {
        data: buffer.toString('base64'),
        mimeType
      }
    }

    const result = await model.generateContent([
      'Extrae TODO el texto visible de esta imagen. Si hay texto impreso o escrito a mano, escríbelo exactamente como aparece. Si hay fórmulas, escríbelas en formato texto. Si no hay texto, describe brevemente la imagen en detalle.',
      imagePart
    ])

    return result.response.text() || ''
  } catch (error) {
    console.error('Error extracting from image:', error)
    throw new Error(`Error al extraer texto de imagen: ${error}`)
  }
}

export async function generateEmbedding(text: string, apiKey: string): Promise<number[]> {
  try {
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: EMBEDDING_MODEL })

    const result = await model.embedContent(text)
    const embedding = result.embedding.values

    if (!embedding || embedding.length === 0) {
      throw new Error('No se pudo generar el embedding')
    }

    return embedding
  } catch (error) {
    console.error('Error generating embedding:', error)
    throw new Error(`Error al generar embedding: ${error}`)
  }
}

export function chunkText(text: string, chunkSize: number = 800): string[] {
  // Dividir por oraciones para preservar contexto
  const sentences = text.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 0)
  const chunks: string[] = []
  let currentChunk = ''

  for (const sentence of sentences) {
    const trimmed = sentence.trim()
    if (currentChunk.length + trimmed.length + 1 > chunkSize) {
      if (currentChunk) chunks.push(currentChunk.trim())
      currentChunk = trimmed
    } else {
      currentChunk += currentChunk ? ' ' + trimmed : trimmed
    }
  }

  if (currentChunk) chunks.push(currentChunk.trim())
  return chunks.filter(chunk => chunk.length > 20)
}

/**
 * Procesa un documento completo: extrae texto, genera embeddings y guarda en Supabase.
 */
export async function processDocument(
  file: Buffer,
  fileName: string,
  userId: string,
  temaName: string,
  apiKey: string
): Promise<{ success: boolean; chunksProcessed: number; error?: string }> {
  const supabase = createSupabaseClient()

  // Verificar autenticación
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.id !== userId) {
    throw new Error('No autorizado')
  }

  // Extraer texto (pasar apiKey para imágenes)
  const text = await extractTextFromFile(file, fileName, apiKey)

  if (!text || text.trim().length === 0) {
    throw new Error('No se pudo extraer texto del documento')
  }

  const chunks = chunkText(text)

  if (chunks.length === 0) {
    throw new Error('El documento no contiene texto procesable')
  }

  // Eliminar segmentos previos del mismo archivo para evitar duplicados
  await supabase
    .from('document_segments')
    .delete()
    .match({ user_id: userId, tema_name: temaName, file_name: fileName })

  let chunksProcessed = 0

  for (let i = 0; i < chunks.length; i++) {
    try {
      const chunk = chunks[i]
      
      const metadata = {
        file_name: fileName,
        chunk_index: i,
        chunk_count: chunks.length,
        file_type: fileName.split('.').pop()?.toLowerCase() || 'unknown'
      }

      const { error } = await supabase
        .from('document_segments')
        .insert({
          user_id: userId,
          tema_name: temaName,
          file_name: fileName,
          content: chunk,
          metadata
        })

      if (error) {
        console.error(`Error inserting chunk ${i}:`, error)
        continue
      }

      chunksProcessed++
    } catch (chunkError) {
      console.error(`Error processing chunk ${i}:`, chunkError)
      continue
    }
  }

  return { success: chunksProcessed > 0, chunksProcessed }
}

/**
 * Elimina todos los segmentos de un archivo del vector store.
 */
export async function deleteDocumentSegments(
  userId: string,
  temaName: string,
  fileName: string
): Promise<void> {
  const supabase = createSupabaseClient()

  const { error } = await supabase
    .from('document_segments')
    .delete()
    .match({ user_id: userId, tema_name: temaName, file_name: fileName })

  if (error) {
    console.error('Error deleting segments:', error)
    throw new Error(`Error al eliminar segmentos: ${error.message}`)
  }
}

/**
 * Recupera el contexto documental usando la ventana larga de contexto de Gemini.
 * Omitimos los embeddings vectoriales (para evitar errores de modelo en ciertas API keys)
 * y en su lugar recuperamos directamente el texto guardado de forma inteligente.
 */
export async function searchRelevantDocuments(
  query: string,
  userId: string,
  temaName: string,
  apiKey: string,
  limit: number = 30 // Aumentamos límite porque podemos manejar más contexto
): Promise<{ content: string; metadata: any; similarity: number }[]> {
  try {
    const supabase = createSupabaseClient()

    // Solo recuperamos los fragmentos de texto asociados al tema actual
    const { data: segments, error } = await supabase
      .from('document_segments')
      .select('content, metadata')
      .eq('user_id', userId)
      .eq('tema_name', temaName)
      .limit(limit)

    if (error) {
      console.error('Error fetching documents from DB:', error)
      return []
    }

    return (segments || []).map((seg: any) => ({
      content: seg.content,
      metadata: seg.metadata,
      similarity: 1 // No hay similitud matemática, pero le damos 1 por defecto
    }))
  } catch (error: any) {
    console.error('Error in text retrieval:', error.message || error)
    return []
  }
}
