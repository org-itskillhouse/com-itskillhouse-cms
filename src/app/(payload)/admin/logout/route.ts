import { NextResponse } from 'next/server'

import { signOut } from '@/auth'
import { getEntraAuthEnv } from '@/auth/entra-auth-env'

const ADMIN_LOGIN_PATH = '/cms/admin/login'

const buildEntraLogoutUrl = (origin: string, tenantId: string): string => {
  const url = new URL(`https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/logout`)
  url.searchParams.set('post_logout_redirect_uri', `${origin}${ADMIN_LOGIN_PATH}`)
  return url.toString()
}

export async function GET(request: Request): Promise<Response> {
  const origin = new URL(request.url).origin
  const localLoginUrl = `${origin}${ADMIN_LOGIN_PATH}`

  const { cookies } = await signOut({
    redirect: false,
    redirectTo: localLoginUrl,
  })

  getEntraAuthEnv({
    AUTH_SECRET: process.env.AUTH_SECRET,
    ENTRA_CLIENT_ID: process.env.ENTRA_CLIENT_ID,
    ENTRA_CLIENT_SECRET: process.env.ENTRA_CLIENT_SECRET,
    ENTRA_TENANT_ID: process.env.ENTRA_TENANT_ID,
  })

  const tenantId = (process.env.ENTRA_TENANT_ID ?? '').trim()
  const response = NextResponse.redirect(buildEntraLogoutUrl(origin, tenantId))

  for (const cookie of cookies) {
    response.cookies.set(cookie.name, cookie.value, cookie.options)
  }

  return response
}
