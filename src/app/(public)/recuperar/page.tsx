'use client'

import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import styles from '../login/auth.module.css'

export default function RecoverPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleRecover = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/nueva-contrasena`,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSuccess('Se ha enviado un enlace de recuperación a tu correo electrónico.')
      setLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.formWrapper}>
        <Link href="/" className={styles.logo}>
          <span className={styles.logoIcon}>🎓</span>
          <span className={styles.logoText}>AcademIA</span>
        </Link>
        
        <h1 className={styles.title}>Recuperar contraseña</h1>
        <p className={styles.subtitle}>Ingresa tu correo y te enviaremos un enlace para restaurar tu contraseña</p>
        
        {error && <div className={styles.error}>{error}</div>}
        {success && <div className={styles.success}>{success}</div>}
        
        <form className={styles.form} onSubmit={handleRecover}>
          <div className={styles.inputGroup}>
            <label htmlFor="email">Correo electrónico</label>
            <input 
              type="email" 
              id="email" 
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? <span className={styles.loading}></span> : null}
            {loading ? 'Enviando...' : 'Enviar Enlace de Recuperación'}
          </button>
        </form>
        
        <p className={styles.switchAuth}>
          ¿Recordaste tu contraseña? <Link href="/login">Inicia sesión</Link>
        </p>
      </div>
    </div>
  )
}
