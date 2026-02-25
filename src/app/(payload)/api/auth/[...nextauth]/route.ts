import { handlers } from '@/auth'
import { NextRequest } from 'next/server'

const AUTH_BASE_PATH = '/cms/api/auth'

const toAuthRequest = (request: NextRequest): NextRequest => {
  const currentUrl = new URL(request.url)

  // In this deployment shape, route handlers may receive "/api/auth/*"
  // while Auth.js is configured to parse "/cms/api/auth/*".
  if (!currentUrl.pathname.startsWith(AUTH_BASE_PATH) && currentUrl.pathname.startsWith('/api/auth/')) {
    currentUrl.pathname = `${AUTH_BASE_PATH}${currentUrl.pathname.slice('/api/auth'.length)}`
    return new NextRequest(currentUrl, request)
  }

  return request
}

export const GET = (request: NextRequest) => handlers.GET(toAuthRequest(request))
export const POST = (request: NextRequest) => handlers.POST(toAuthRequest(request))
