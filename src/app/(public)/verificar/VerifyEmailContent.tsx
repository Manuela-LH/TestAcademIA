'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import styles from '../login/auth.module.css'

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const checkVerification = async () => {
      const token = searchParams.get('token')
      
      if (token) {
        const { error } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: 'email_change',
        })

        if (error) {
          setStatus('error')
          setMessage('El enlace de verificación ha expirado o es inválido.')
        } else {
          setStatus('success')
          setMessage('¡Tu correo ha sido verificado correctamente!')
        }
      } else {
        setStatus('success')
        setMessage('Por favor, verifica tu correo electrónico haciendo clic en el enlace que te enviamos.')
      }
    }

    checkVerification()
  }, [searchParams])

  return (
    <div className={styles.container}>
      <div className={styles.formWrapper}>
        <Link href="/" className={styles.logo}>
          <span className={styles.logoIcon}>🎓</span>
          <span className={styles.logoText}>AcademIA</span>
        </Link>
        
        <h1 className={styles.title}>
          {status === 'loading' ? 'Verificando...' : 
           status === 'success' ? '¡Correo verificado!' : 'Error de verificación'}
        </h1>
        
        {status === 'loading' ? (
          <div className={styles.loading}></div>
        ) : status === 'success' ? (
          <div className={styles.success}>{message}</div>
        ) : (
          <div className={styles.error}>{message}</div>
        )}
        
        <p className={styles.switchAuth}>
          <Link href="/login">Ir a iniciar sesión</Link>
        </p>
      </div>
    </div>
  )
}

export default VerifyEmailContent
