import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname === '/cms') {
    const url = request.nextUrl.clone()
    url.pathname = '/cms/admin'
    return NextResponse.redirect(url, 308)
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/cms',
}
