'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import styles from './Header.module.css'

interface HeaderProps {
  title?: string
}

export default function Header({ title = 'AcademIA' }: HeaderProps) {
  const router = useRouter()
  const [showDropdown, setShowDropdown] = useState(false)
  const [userInitial, setUserInitial] = useState('U')
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const displayName = user.user_metadata?.full_name || user.user_metadata?.display_name
        if (displayName) {
          setUserInitial(displayName.charAt(0).toUpperCase())
        } else if (user.email) {
          setUserInitial(user.email.charAt(0).toUpperCase())
        }
      }
    }
    fetchUser()

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  const handleConfig = () => {
    setShowDropdown(false)
    router.push('/configuracion')
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
        <div className={styles.userMenu} ref={dropdownRef}>
          <button
            className={styles.avatar}
            onClick={() => setShowDropdown(!showDropdown)}
          >
            {userInitial}
          </button>
          {showDropdown && (
            <div className={styles.dropdown}>
              <button className={styles.dropdownItem} onClick={handleConfig}>
                ⚙️ Configuración
              </button>
              <button className={`${styles.dropdownItem} ${styles.logout}`} onClick={handleLogout}>
                Cerrar Sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
