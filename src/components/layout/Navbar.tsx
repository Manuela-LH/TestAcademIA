'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import styles from './Navbar.module.css'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo}>
          <span className={styles.logoIcon}>🎓</span>
          <span className={styles.logoText}>AcademIA</span>
        </Link>
        
        <ul className={styles.navLinks}>
          <li><Link href="#funcionalidades">Funcionalidades</Link></li>
          <li><Link href="#como-funciona">Cómo Funciona</Link></li>
          <li><Link href="#beneficios">Beneficios</Link></li>
        </ul>

        <div className={styles.navButtons}>
          <Link href="/login" className={styles.loginBtn}>Iniciar Sesión</Link>
          <Link href="/registro" className={styles.ctaBtn}>Empezar Gratis</Link>
        </div>
      </div>
    </nav>
  )
}
