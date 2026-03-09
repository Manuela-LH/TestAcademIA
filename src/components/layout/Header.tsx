'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import styles from './Header.module.css'

interface HeaderProps {
  title?: string
}

export default function Header({ title = 'AcademIA' }: HeaderProps) {
  const router = useRouter()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <Link href="/temas" className={styles.logo}>
          <span className={styles.logoIcon}>🎓</span>
          <span className={styles.logoText}>{title}</span>
        </Link>
      </div>
      <div className={styles.right}>
        <button onClick={handleLogout} className={styles.logoutBtn}>
          Cerrar Sesión
        </button>
      </div>
    </header>
  )
}
