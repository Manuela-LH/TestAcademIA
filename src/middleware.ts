import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request: {
      headers: req.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            req.cookies.set(name, value)
            supabaseResponse.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const {
    data: { session },
  } = await supabase.auth.getSession()

  const { pathname } = req.nextUrl

  // Rutas privadas
  if (pathname.startsWith('/temas') || pathname.startsWith('/dashboard')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', req.url))
    }
  }

  // Rutas públicas de auth
  if (pathname === '/login' || pathname === '/registro') {
    if (session) {
      return NextResponse.redirect(new URL('/temas', req.url))
    }
  }

  // Página principal
  if (pathname === '/') {
    if (session) {
      return NextResponse.redirect(new URL('/temas', req.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/', '/login', '/registro', '/temas/:path*', '/dashboard/:path*'],
}
