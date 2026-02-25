import type { NextAuthConfig } from 'next-auth'
import microsoftEntraID from 'next-auth/providers/microsoft-entra-id'

import { getEntraAuthEnv } from '@/auth/entra-auth-env'

type AuthConfigEnv = {
  AUTH_SECRET?: string
  ENTRA_CLIENT_ID?: string
  ENTRA_CLIENT_SECRET?: string
  ENTRA_TENANT_ID?: string
}

const formatUnknown = (value: unknown): string => {
  if (value instanceof Error) {
    return JSON.stringify(
      {
        name: value.name,
        message: value.message,
        stack: value.stack,
      },
      null,
      2,
    )
  }

  try {
    return JSON.stringify(value, null, 2)
  } catch {
    return String(value)
  }
}

export const createAuthConfig = (env: AuthConfigEnv): NextAuthConfig => {
  const entra = getEntraAuthEnv(env)
  const basePath = '/cms/api/auth'
  const authDebug = process.env.AUTH_DEBUG === 'true'

  if (authDebug) {
    const clientIdSuffix = entra.clientId.slice(-6)
    const tenantIdSuffix = env.ENTRA_TENANT_ID?.slice(-6) ?? ''
    console.log(
      `[auth][config] basePath=${basePath} clientIdSuffix=${clientIdSuffix} tenantSuffix=${tenantIdSuffix} secretLength=${entra.clientSecret.length}`,
    )
  }

  return {
    secret: entra.authSecret,
    trustHost: true,
    basePath,
    debug: authDebug,
    logger: {
      error(error) {
        const authError = error as Error & { cause?: unknown; type?: string }
        const label = authError.type || authError.name || 'AuthError'
        const clientIdSuffix = entra.clientId.slice(-6)
        const tenantSuffix = env.ENTRA_TENANT_ID?.slice(-6) ?? ''
        const secretLength = entra.clientSecret.length
        const authUrl = process.env.AUTH_URL ?? ''
        const nextAuthUrl = process.env.NEXTAUTH_URL ?? ''
        console.error(
          `[auth][error] ${label}: ${authError.message} | env clientIdSuffix=${clientIdSuffix} tenantSuffix=${tenantSuffix} secretLength=${secretLength} authUrl=${authUrl} nextAuthUrl=${nextAuthUrl}`,
        )
        if (authError.cause) {
          console.error(`[auth][cause]: ${formatUnknown(authError.cause)}`)
        }
      },
    },
    providers: [
      microsoftEntraID({
        clientId: entra.clientId,
        clientSecret: entra.clientSecret,
        issuer: entra.issuer,
        client: {
          token_endpoint_auth_method: 'client_secret_post',
        },
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
