'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function DashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
      } else {
        setUser(user)
        setLoading(false)
      }
    }

    checkUser()
  }, [router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: '#FAFAFA'
      }}>
        <div>Cargando...</div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAFA' }}>
      <nav style={{
        padding: '1rem 2rem',
        background: 'white',
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Link href="/" style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#16697A' }}>
          🎓 AcademIA
        </Link>
        <button 
          onClick={handleLogout}
          style={{
            padding: '0.5rem 1rem',
            background: '#16697A',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          Cerrar Sesión
        </button>
      </nav>

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', color: '#5B4B49' }}>
          Bienvenido{user?.user_metadata?.full_name ? `, ${user.user_metadata.full_name}` : ''}
        </h1>
        <p style={{ color: '#666', marginBottom: '2rem' }}>
          {user?.email}
        </p>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '1.5rem' 
        }}>
          <div style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '16px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
          }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: '#16697A' }}>📚 Tus Temas</h3>
            <p style={{ color: '#666' }}>Crea y gestiona tus materiales de estudio</p>
          </div>

          <div style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '16px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
          }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: '#16697A' }}>📊 Tu Progreso</h3>
            <p style={{ color: '#666' }}>Visualiza tus métricas de aprendizaje</p>
          </div>

          <div style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '16px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
          }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: '#16697A' }}>🧠 Asistencia IA</h3>
            <p style={{ color: '#666' }}>Chatea con tu asistente de estudio</p>
          </div>
        </div>
      </main>
    </div>
  )
}
