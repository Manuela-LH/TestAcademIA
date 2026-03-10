'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import styles from './configuracion.module.css'

export default function ConfiguracionPage() {
  const [user, setUser] = useState<any>(null)

  const [name, setName] = useState('')
  const [originalName, setOriginalName] = useState('')
  const [savingName, setSavingName] = useState(false)

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [savingPassword, setSavingPassword] = useState(false)

  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
        const fullName = user.user_metadata?.full_name || user.user_metadata?.display_name || ''
        setName(fullName)
        setOriginalName(fullName)
      }
    }
    fetchUser()
  }, [])

  const handleUpdateName = async () => {
    if (name.trim() === '') {
      setMessage({ type: 'error', text: 'El nombre no puede estar vacío.' })
      return
    }
    setSavingName(true)
    setMessage(null)
    const { error } = await supabase.auth.updateUser({
      data: { full_name: name.trim() }
    })
    setSavingName(false)

    if (error) {
      setMessage({ type: 'error', text: error.message })
    } else {
      setOriginalName(name.trim())
      setMessage({ type: 'success', text: 'Nombre actualizado correctamente.' })
    }
  }

  const handleUpdatePassword = async () => {
    if (password.length < 6) {
      setMessage({ type: 'error', text: 'La contraseña debe tener al menos 6 caracteres.' })
      return
    }
    if (password !== confirmPassword) {
      setMessage({ type: 'error', text: 'Las contraseñas no coinciden.' })
      return
    }
    setSavingPassword(true)
    setMessage(null)
    const { error } = await supabase.auth.updateUser({
      password: password
    })
    setSavingPassword(false)

    if (error) {
      setMessage({ type: 'error', text: error.message })
    } else {
      setPassword('')
      setConfirmPassword('')
      setMessage({ type: 'success', text: 'Contraseña actualizada correctamente.' })
    }
  }

  const showNameButton = name !== originalName
  const showPasswordButton = password.length > 0 || confirmPassword.length > 0

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Configuración</h1>
        <p className={styles.subtitle}>Administra tu cuenta</p>
      </div>

      {message && (
        <div className={`${styles.message} ${message.type === 'error' ? styles.error : styles.success}`}>
          {message.text}
        </div>
      )}

      <div className={styles.card}>
        <h2 className={styles.cardTitle}>👤 Información de la Cuenta</h2>

        <div className={styles.section}>
          <label className={styles.label}>Correo electrónico</label>
          <div className={styles.value}>
            {user?.email || 'Cargando...'}
          </div>
        </div>

        <div className={styles.section}>
          <label className={styles.label}>Nombre de usuario</label>
          <div className={styles.inputWrapper}>
            <input
              type="text"
              className={styles.input}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tu nombre completo"
            />
            {showNameButton && (
              <button
                className={styles.actionBtn}
                onClick={handleUpdateName}
                disabled={savingName}
              >
                {savingName ? 'Guardando...' : 'Confirmar'}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className={styles.card}>
        <h2 className={styles.cardTitle}>🔒 Seguridad</h2>
        <div className={styles.section}>
          <label className={styles.label}>Nueva contraseña</label>
          <div className={styles.inputWrapper}>
            <input
              type="password"
              className={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
            />
          </div>
        </div>

        {(password.length > 0 || confirmPassword.length > 0) && (
          <div className={styles.section}>
            <label className={styles.label}>Confirmar nueva contraseña</label>
            <div className={styles.inputWrapper}>
              <input
                type="password"
                className={styles.input}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repite tu nueva contraseña"
              />
              <button
                className={styles.actionBtn}
                onClick={handleUpdatePassword}
                disabled={savingPassword}
              >
                {savingPassword ? 'Guardando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
