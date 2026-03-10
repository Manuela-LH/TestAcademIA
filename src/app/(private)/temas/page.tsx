'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import styles from './temas.module.css'

interface Tema {
  temaid: number
  userid: number
  tema_name: string
}

export default function TemasPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [temas, setTemas] = useState<Tema[]>([])
  const [showModal, setShowModal] = useState(false)
  const [newTemaName, setNewTemaName] = useState('')
  const [saving, setSaving] = useState(false)
  const [userIdState, setUserIdState] = useState<number | null>(null)

  useEffect(() => {
    const fetchUserAndTemas = async () => {
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        setUser(user)
        const { data: usuario, error } = await supabase
          .from('usuarios')
          .select('*')
          .eq('auth_id', user.id)
          .single()

        if (error) {
          console.error('Error fetching internal UserID:', error)
          // El usuario probablamente no exista en la tabla
        }

        if (usuario) {
          const uId = usuario.userid || usuario.UserID
          setUserIdState(uId)
          fetchTemas(uId)
        }
      }
      setLoading(false)
    }

    fetchUserAndTemas()
  }, [])

  const fetchTemas = async (userId: number) => {
    const { data, error } = await supabase
      .from('temas')
      .select('*')
      .eq('userid', userId)
      .order('temaid', { ascending: false })

    if (error) {
      console.error('Error fetching temas:', error)
    } else if (data) {
      setTemas(data)
    }
    setLoading(false)
  }

  const handleAddTema = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTemaName.trim() || !user || !userIdState) {
      if (!userIdState) {
        console.error('No se pudo encontrar el ID interno del usuario para guardar el tema.')
        alert('Error crítico: Falta de perfil interno vinculado.')
      }
      return
    }

    setSaving(true)

    const { data, error } = await supabase
      .from('temas')
      .insert([
        {
          userid: userIdState,
          tema_name: newTemaName.trim()
        }
      ])
      .select()

    if (error) {
      console.error('Error insertando tema:', error)
      alert(`Hubo un error al guardar la materia: ${error.message}`)
    } else if (data) {
      setTemas([data[0], ...temas])
      setNewTemaName('')
      setShowModal(false)
    }

    setSaving(false)
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Cargando...</div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <div className={styles.header}>
          <h1 className={styles.title}>Mis Materias</h1>
          <p className={styles.subtitle}>Organiza tus materiales de estudio por materia</p>
        </div>

        <div className={styles.grid}>
          <button className={styles.addCard} onClick={() => setShowModal(true)}>
            <span className={styles.addIcon}>+</span>
            <span className={styles.addText}>Agregar Materia</span>
          </button>

          {temas.map((tema) => (
            <div 
              key={tema.temaid} 
              className={styles.temaCard}
              onClick={() => router.push(`/chat?tema=${encodeURIComponent(tema.tema_name)}`)}
            >
              <div className={styles.temaIcon}>📚</div>
              <h3 className={styles.temaName}>{tema.tema_name}</h3>
              <span className={styles.temaStatus}>Sin materiales</span>
            </div>
          ))}
        </div>
      </main>

      {showModal && (
        <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>Nueva Materia</h2>
            <form onSubmit={handleAddTema}>
              <div className={styles.inputGroup}>
                <label htmlFor="temaName">Nombre de la materia</label>
                <input
                  type="text"
                  id="temaName"
                  placeholder="Ej: Cálculo I, Física, Historia..."
                  value={newTemaName}
                  onChange={(e) => setNewTemaName(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              <div className={styles.modalButtons}>
                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={() => setShowModal(false)}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={styles.saveBtn}
                  disabled={saving}
                >
                  {saving ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
