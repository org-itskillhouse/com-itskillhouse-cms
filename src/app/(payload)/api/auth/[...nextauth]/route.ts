import { handlers } from '@/auth'
import { getAuthConfig } from '@/auth.config'
import { NextRequest } from 'next/server'

const authBasePath = getAuthConfig().basePath ?? '/api/auth'

const toAuthRequest = (request: NextRequest): NextRequest => {
  const currentUrl = new URL(request.url)
  const expectedPrefix = authBasePath.endsWith('/api/auth')
    ? authBasePath.slice(0, -'/api/auth'.length)
    : ''

  // On Next.js apps with basePath, route handlers can receive "/api/auth/*"
  // while Auth.js is configured with "/cms/api/auth/*". Normalize for Auth.js.
  if (
    expectedPrefix &&
    !currentUrl.pathname.startsWith(authBasePath) &&
    currentUrl.pathname.startsWith('/api/auth/')
  ) {
    currentUrl.pathname = `${expectedPrefix}${currentUrl.pathname}`
    return new NextRequest(currentUrl, request)
  }

  return request
}

export const GET = (request: NextRequest) => handlers.GET(toAuthRequest(request))
export const POST = (request: NextRequest) => handlers.POST(toAuthRequest(request))
