import type { NextAuthConfig } from 'next-auth'
import microsoftEntraID from 'next-auth/providers/microsoft-entra-id'

import { getEntraAuthEnv } from '@/auth/entra-auth-env'

type AuthConfigEnv = {
  AUTH_SECRET?: string
  ENTRA_CLIENT_ID?: string
  ENTRA_CLIENT_SECRET?: string
  ENTRA_TENANT_ID?: string
  AUTH_BASE_PATH?: string
}

export const createAuthConfig = (env: AuthConfigEnv): NextAuthConfig => {
  const entra = getEntraAuthEnv(env)
  const basePath = env.AUTH_BASE_PATH?.trim() || '/cms/api/auth'

  return {
    secret: entra.authSecret,
    trustHost: true,
    basePath,
    providers: [
      microsoftEntraID({
        clientId: entra.clientId,
        clientSecret: entra.clientSecret,
        issuer: entra.issuer,
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
    AUTH_BASE_PATH: process.env.AUTH_BASE_PATH,
  })
