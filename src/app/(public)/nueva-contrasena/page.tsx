'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import styles from '../login/auth.module.css'

export default function NewPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [validToken, setValidToken] = useState(false)

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        setValidToken(true)
      }
    }
    checkSession()
  }, [])

  const handleNewPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      setLoading(false)
      return
    }

    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSuccess('¡Contraseña actualizada correctamente!')
      setLoading(false)
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    }
  }

  if (!validToken) {
    return (
      <div className={styles.container}>
        <div className={styles.formWrapper}>
          <h1 className={styles.title}>Enlace inválido</h1>
          <p className={styles.subtitle}>El enlace de recuperación ha expirado o es inválido.</p>
          <p className={styles.switchAuth}>
            <Link href="/recuperar">Solicitar nuevo enlace</Link>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.formWrapper}>
        <Link href="/" className={styles.logo}>
          <span className={styles.logoIcon}>🎓</span>
          <span className={styles.logoText}>AcademIA</span>
        </Link>
        
        <h1 className={styles.title}>Nueva contraseña</h1>
        <p className={styles.subtitle}>Ingresa tu nueva contraseña</p>
        
        {error && <div className={styles.error}>{error}</div>}
        {success && <div className={styles.success}>{success}</div>}
        
        <form className={styles.form} onSubmit={handleNewPassword}>
          <div className={styles.inputGroup}>
            <label htmlFor="password">Nueva contraseña</label>
            <input 
              type="password" 
              id="password" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
          
          <div className={styles.inputGroup}>
            <label htmlFor="confirmPassword">Confirmar contraseña</label>
            <input 
              type="password" 
              id="confirmPassword" 
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
          
          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? <span className={styles.loading}></span> : null}
            {loading ? 'Actualizando...' : 'Actualizar Contraseña'}
          </button>
        </form>
        
        <p className={styles.switchAuth}>
          <Link href="/login">Volver a iniciar sesión</Link>
        </p>
      </div>
    </div>
  )
}
