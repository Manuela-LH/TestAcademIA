'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import styles from './chat.module.css'

interface Message {
  id: number
  role: 'user' | 'ai'
  content: string
}

export default function ChatPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const temaName = searchParams.get('tema') || 'Chat'
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  const handleSendMessage = () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: Date.now(),
      role: 'user',
      content: inputValue.trim()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsTyping(true)

    setTimeout(() => {
      setIsTyping(false)
      const aiMessage: Message = {
        id: Date.now() + 1,
        role: 'ai',
        content: 'Esta es una respuesta de ejemplo. La funcionalidad del chat con IA se implementará proximamente.'
      }
      setMessages(prev => [...prev, aiMessage])
    }, 1500)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className={styles.container}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <button onClick={() => router.push('/temas')} className={styles.backButton}>
            ← Volver a Materias
          </button>
          <h1 className={styles.chatTitle}>{temaName}</h1>
          <p className={styles.chatSubtitle}>Conversacion con IA</p>
        </div>
      </aside>

      <div className={styles.messagesContainer}>
        {messages.length === 0 ? (
          <div className={styles.aiMessage} style={{ alignSelf: 'center', maxWidth: '70%', textAlign: 'center' }}>
            Hola! Soy tu asistente de estudio. Preguntame cualquier cosa sobre <strong>{temaName}</strong> y te ayudare a entender mejor el tema.
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
    </div>
  )
}
