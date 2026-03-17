import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

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
          cookiesToSet.forEach(({ name, value, options }) => req.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request: {
              headers: req.headers,
            },
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = req.nextUrl

  // Rutas privadas
  if (pathname.startsWith('/temas') || pathname.startsWith('/dashboard')) {
    if (!user) {
      const redirectUrl = new URL('/login', req.url)
      const redirectResponse = NextResponse.redirect(redirectUrl)
      
      // Preserve any updated cookies (e.g. refreshed access tokens)
      supabaseResponse.cookies.getAll().forEach((cookie) => {
        const { name, value, ...options } = cookie
        redirectResponse.cookies.set(name, value, options)
      })
      return redirectResponse
    }
  }

  // Rutas públicas de auth
  if (pathname === '/login' || pathname === '/registro') {
    if (user) {
      const redirectUrl = new URL('/temas', req.url)
      const redirectResponse = NextResponse.redirect(redirectUrl)
      
      supabaseResponse.cookies.getAll().forEach((cookie) => {
        const { name, value, ...options } = cookie
        redirectResponse.cookies.set(name, value, options)
      })
      return redirectResponse
    }
  }

  // Página principal
  if (pathname === '/') {
    if (user) {
      const redirectUrl = new URL('/temas', req.url)
      const redirectResponse = NextResponse.redirect(redirectUrl)
      
      supabaseResponse.cookies.getAll().forEach((cookie) => {
        const { name, value, ...options } = cookie
        redirectResponse.cookies.set(name, value, options)
      })
      return redirectResponse
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/', '/login', '/registro', '/temas/:path*', '/dashboard/:path*'],
}
