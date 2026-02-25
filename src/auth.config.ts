import type { NextAuthConfig } from 'next-auth'
import microsoftEntraID from 'next-auth/providers/microsoft-entra-id'

import { getEntraAuthEnv } from '@/auth/entra-auth-env'

type AuthConfigEnv = {
  AUTH_SECRET?: string
  ENTRA_CLIENT_ID?: string
  ENTRA_CLIENT_SECRET?: string
  ENTRA_TENANT_ID?: string
}

export const createAuthConfig = (env: AuthConfigEnv): NextAuthConfig => {
  const entra = getEntraAuthEnv(env)
  const basePath = '/cms/api/auth'

  return {
    secret: entra.authSecret,
    trustHost: true,
    basePath,
    debug: process.env.AUTH_DEBUG === 'true',
    logger: {
      error(error) {
        const authError = error as Error & { cause?: unknown; type?: string }
        const label = authError.type || authError.name || 'AuthError'
        console.error(`[auth][error] ${label}: ${authError.message}`)
        if (authError.cause) {
          console.error('[auth][cause]:', authError.cause)
        }
      },
    },
    providers: [
      microsoftEntraID({
        clientId: entra.clientId,
        clientSecret: entra.clientSecret,
        issuer: entra.issuer,
        authorization: {
          params: {
            scope: 'openid profile email',
          },
        },
      }),
    ],
  }
}

export const getAuthConfig = (): NextAuthConfig =>
  createAuthConfig({
    AUTH_SECRET: process.env.AUTH_SECRET,
    ENTRA_CLIENT_ID: process.env.ENTRA_CLIENT_ID,
    ENTRA_CLIENT_SECRET: process.env.ENTRA_CLIENT_SECRET,
    ENTRA_TENANT_ID: process.env.ENTRA_TENANT_ID,
  })
