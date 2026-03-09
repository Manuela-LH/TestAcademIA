'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import styles from './temas.module.css'

interface Tema {
  TemaID: number
  UserID: number
  tema_name: string
}

export default function TemasPage() {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [temas, setTemas] = useState<Tema[]>([])
  const [showModal, setShowModal] = useState(false)
  const [newTemaName, setNewTemaName] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const fetchUserAndTemas = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        setUser(user)
        const { data: usuario } = await supabase
          .from('usuarios')
          .select('UserID')
          .eq('auth_id', user.id)
          .single()
        
        if (usuario) {
          fetchTemas(usuario.UserID)
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
      .eq('UserID', userId)
      .order('TemaID', { ascending: false })

    if (!error && data) {
      setTemas(data)
    }
    setLoading(false)
  }

  const handleAddTema = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTemaName.trim() || !user) return

    setSaving(true)

    const { data: usuario } = await supabase
      .from('usuarios')
      .select('UserID')
      .eq('auth_id', user.id)
      .single()

    if (!usuario) {
      setSaving(false)
      return
    }

    const { data, error } = await supabase
      .from('temas')
      .insert([
        {
          UserID: usuario.UserID,
          tema_name: newTemaName.trim()
        }
      ])
      .select()

    if (!error && data) {
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
            <div key={tema.TemaID} className={styles.temaCard}>
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
