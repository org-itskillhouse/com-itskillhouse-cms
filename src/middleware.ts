import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname === '/api/auth' || request.nextUrl.pathname.startsWith('/api/auth/')) {
    const url = request.nextUrl.clone()
    url.pathname = `/cms${request.nextUrl.pathname}`
    return NextResponse.rewrite(url)
  }

  if (request.nextUrl.pathname === '/') {
    const url = request.nextUrl.clone()
    url.pathname = '/admin'
    return NextResponse.redirect(url, 308)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/', '/api/auth/:path*'],
}
