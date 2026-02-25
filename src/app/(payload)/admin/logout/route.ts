import { NextResponse } from 'next/server'

import { signOut } from '@/auth'
import { getEntraAuthEnvFromProcess } from '@/auth/entra-auth-env'

const ADMIN_LOGIN_PATH = '/cms/admin/login'

const buildEntraLogoutUrl = (origin: string, tenantId: string): string => {
  const url = new URL(`https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/logout`)
  url.searchParams.set('post_logout_redirect_uri', `${origin}${ADMIN_LOGIN_PATH}`)

  return url.toString()
}

export async function GET(request: Request): Promise<Response> {
  const origin = new URL(request.url).origin
  const entra = getEntraAuthEnvFromProcess()
  const { cookies } = await signOut({
    redirect: false,
    redirectTo: `${origin}${ADMIN_LOGIN_PATH}`,
  })

  const response = NextResponse.redirect(buildEntraLogoutUrl(origin, entra.tenantId))

  for (const cookie of cookies) {
    response.cookies.set(cookie.name, cookie.value, cookie.options)
  }

  return response
}
