'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Header from '@/components/layout/Header'

export default function PrivateLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        router.push('/login')
      } else {
        setLoading(false)
      }
    }

    checkSession()
  }, [router])

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
    <>
      <Header title="AcademIA" />
      <main style={{ paddingTop: '80px', minHeight: '100vh', background: '#FAFAFA' }}>
        {children}
      </main>
    </>
  )
}
