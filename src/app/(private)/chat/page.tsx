'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import styles from './chat.module.css'

interface Message {
  id: number
  role: 'user' | 'ai'
  content: string
}

interface UserFile {
  name: string
  id: string
}

export default function ChatPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const temaName = searchParams.get('tema') || 'Chat'

  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // User and Setup State
  const [userId, setUserId] = useState<string | null>(null)
  const [hasApiKey, setHasApiKey] = useState<boolean | null>(null)
  const [apiKeyValue, setApiKeyValue] = useState('')
  const [verifyingKey, setVerifyingKey] = useState(false)
  const [setupError, setSetupError] = useState('')
  const [setupSuccess, setSetupSuccess] = useState('')

  // Files State
  const [files, setFiles] = useState<UserFile[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserId(user.id)
        if (user.user_metadata?.gemini_api_key) {
          setHasApiKey(true)
        } else {
          setHasApiKey(false)
        }
      }
    }
    fetchUser()
  }, [])

  // Cargar archivos al tener el usuario listo
  const loadFiles = async () => {
    if (!userId || !temaName) return
    const folderPath = `${userId}/${temaName}`

    const { data, error } = await supabase.storage
      .from('archivos_chat')
      .list(folderPath)

    if (error) {
      console.error('Error fetching files:', error)
      return
    }

    if (data) {
      const formattedFiles = data
        .filter(f => f.name !== '.emptyFolderPlaceholder')
        .map(f => ({
          name: f.name,
          id: f.id || f.name
        }))
      setFiles(formattedFiles)
    }
  }

  useEffect(() => {
    if (hasApiKey && userId) {
      loadFiles()
    }
  }, [hasApiKey, userId, temaName])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  const handleSaveApiKey = async () => {
    if (!apiKeyValue.trim()) {
      setSetupError('Por favor ingresa una API Key.')
      return
    }

    setVerifyingKey(true)
    setSetupError('')
    setSetupSuccess('')

    try {
      // 1. Verificar la API Key
      const verifyRes = await fetch('/api/gemini/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: apiKeyValue.trim() })
      })

      const verifyData = await verifyRes.json()

      if (!verifyRes.ok) {
        setSetupError(verifyData.error || 'Error al verificar la API Key.')
        setVerifyingKey(false)
        return
      }

      // 2. Guardar en Supabase user_metadata
      const { error } = await supabase.auth.updateUser({
        data: { gemini_api_key: apiKeyValue.trim() }
      })

      if (error) {
        setSetupError(error.message)
        setVerifyingKey(false)
      } else {
        setSetupSuccess('¡API Key verificada y guardada correctamente!')
        setTimeout(() => {
          setHasApiKey(true)
        }, 1500)
      }
    } catch (err: any) {
      setSetupError('Error de red al verificar la API Key.')
      setVerifyingKey(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !userId || !temaName) return

    setIsUploading(true)
    const filePath = `${userId}/${temaName}/${file.name}`

    const { error } = await supabase.storage
      .from('archivos_chat')
      .upload(filePath, file, { upsert: true })

    if (error) {
      console.error('Upload error', error)

      // Si el bucket no existe, esto arrojará un error 404 (Bucket not found).
      // En tal caso el usuario deberá configurarlo
      alert('Error al subir el archivo. Verifica que el bucket "archivos_chat" exista. Detalle: ' + error.message)
    } else {
      await loadFiles()
    }

    setIsUploading(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleDeleteFile = async (fileName: string) => {
    if (!userId || !temaName) return
    if (!confirm('¿Seguro que deseas eliminar este archivo?')) return

    const filePath = `${userId}/${temaName}/${fileName}`
    const { error } = await supabase.storage
      .from('archivos_chat')
      .remove([filePath])

    if (error) {
      console.error('Delete error', error)
      alert('Error al eliminar: ' + error.message)
    } else {
      await loadFiles()
    }
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: Date.now(),
      role: 'user',
      content: inputValue.trim()
    }

    // Add user message to state
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInputValue('')
    setIsTyping(true)

    try {
      const chatRes = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages })
      })

      const chatData = await chatRes.json()

      if (!chatRes.ok) {
        const errorContent = chatRes.status === 429
          ? '⚠️ ' + chatData.error
          : '❌ Hubo un error al generar la respuesta. Por favor intenta de nuevo.'

        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          role: 'ai',
          content: errorContent
        }])
      } else {
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          role: 'ai',
          content: chatData.content
        }])
      }
    } catch (err) {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'ai',
        content: 'Hubo un problema de conexión. Por favor reintenta.'
      }])
    } finally {
      setIsTyping(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  if (hasApiKey === null) {
    return <div className={styles.container} style={{ justifyContent: 'center', alignItems: 'center' }}>Cargando entorno de chat...</div>
  }

  // --- VISTA DE TUTORIAL DE API KEY ---
  if (!hasApiKey) {
    return (
      <div className={styles.container}>
        <main className={styles.mainChat}>
          <header className={styles.chatHeader}>
            <button onClick={() => router.push('/temas')} className={styles.backButton}>
              ← Volver a Materias
            </button>
            <div>
              <h1 className={styles.chatTitle}>Configuración de Asistente IA</h1>
            </div>
          </header>

          <div className={styles.setupContainer}>
            <div className={styles.setupCard}>
              <h2 className={styles.setupTitle}>¡Bienvenido al Chat de AcademIA!</h2>
              <p className={styles.setupDescription}>
                Para poder utilizar nuestro tutor interactivo (basado en Gemini 2.5 Flash), necesitas proporcionar tu propia API Key de Google. Esto mantiene nuestro servicio gratuito para ti.
              </p>

              <div className={styles.setupList}>
                <ol>
                  <li>Ve a <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer">Google AI Studio</a> e inicia sesión con tu cuenta de Google.</li>
                  <li>Haz clic en <strong>"Create API Key"</strong> y selecciona crearla en un nuevo proyecto o uno existente.</li>
                  <li>Copia la clave generada y pégala aquí abajo.</li>
                </ol>
              </div>

              <div className={styles.setupInputGroup}>
                <input
                  type="password"
                  placeholder="Ingresa tu API Key (Ej: AIzaSyB...)"
                  className={styles.setupInput}
                  value={apiKeyValue}
                  onChange={(e) => setApiKeyValue(e.target.value)}
                />

                {setupError && <p className={styles.errorText}>{setupError}</p>}
                {setupSuccess && <p className={styles.successText}>{setupSuccess}</p>}

                <button
                  className={styles.setupButton}
                  onClick={handleSaveApiKey}
                  disabled={verifyingKey}
                >
                  {verifyingKey ? 'Verificando y guardando...' : 'Comenzar a aprender'}
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  // --- VISTA PRINCIPAL DEL CHAT ---
  return (
    <div className={styles.container}>

      {/* --- SIDEBAR PARA ARCHIVOS --- */}
      <aside className={styles.sidebar}>
        <h2 className={styles.sidebarTitle}>📁 Mis Documentos</h2>
        <p style={{ fontSize: '0.8rem', color: 'var(--color-text-light)', marginBottom: '1.25rem', lineHeight: 1.4 }}>
          Sube aquí el material de estudio para este tema (PDFs, PPTs, etc.).
        </p>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          style={{ display: 'none' }}
        />
        <button
          className={styles.uploadButton}
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          {isUploading ? '⏳ Subiendo...' : '➕ Subir Archivo'}
        </button>

        <div className={styles.fileList}>
          {files.map(file => (
            <div key={file.id} className={styles.fileItem}>
              <span className={styles.fileName} title={file.name}>{file.name}</span>
              <button
                className={styles.deleteFileBtn}
                onClick={() => handleDeleteFile(file.name)}
                title="Eliminar archivo"
              >
                🗑️
              </button>
            </div>
          ))}
          {files.length === 0 && !isUploading && (
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-light)', textAlign: 'center', marginTop: '1rem' }}>
              Aún no has subido documentos para este tema.
            </p>
          )}
        </div>
      </aside>

      <main className={styles.mainChat}>
        <header className={styles.chatHeader}>
          <button onClick={() => router.push('/temas')} className={styles.backButton}>
            ← Volver
          </button>
          <div>
            <h1 className={styles.chatTitle}>{temaName} <span style={{ fontSize: '0.8rem', color: 'var(--color-primary)', fontWeight: 'normal' }}>⭐ Gemini 2.5 Flash</span></h1>
          </div>
        </header>

        <div className={styles.messagesContainer}>
          {messages.length === 0 ? (
            <div className={styles.aiMessage} style={{ alignSelf: 'center', maxWidth: '70%', textAlign: 'center' }}>
              Hola! Soy tu asistente de estudio inteligente. Pregúntame cualquier cosa detallada sobre <strong>{temaName}</strong>.
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`${styles.message} ${message.role === 'user' ? styles.userMessage : styles.aiMessage}`}
                >
                  {message.content}
                </div>
              ))}
              {isTyping && (
                <div className={styles.typingIndicator}>
                  <span className={styles.dot}></span>
                  <span className={styles.dot}></span>
                  <span className={styles.dot}></span>
                </div>
              )}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className={styles.inputContainer}>
          <div className={styles.inputWrapper}>
            <textarea
              className={styles.inputField}
              placeholder="Escribe tu pregunta..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              rows={1}
            />
            <button
              className={styles.sendButton}
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isTyping}
            >
              <span className={styles.sendIcon}>↑</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
