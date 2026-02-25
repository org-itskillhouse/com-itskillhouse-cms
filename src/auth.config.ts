import type { NextAuthConfig } from 'next-auth'
import microsoftEntraID from 'next-auth/providers/microsoft-entra-id'

import { getEntraAuthEnv } from '@/auth/entra-auth-env'

type AuthConfigEnv = {
  AUTH_SECRET?: string
  ENTRA_CLIENT_ID?: string
  ENTRA_CLIENT_SECRET?: string
  ENTRA_TENANT_ID?: string
}

type EntraProfileLike = {
  sub?: string
  oid?: string
  name?: string
  email?: string
  preferred_username?: string
  upn?: string
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

const isValidEmail = (value: unknown): value is string =>
  typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())

const resolveEntraEmail = (profile: EntraProfileLike): string => {
  const candidates = [profile.email, profile.preferred_username, profile.upn]
  for (const candidate of candidates) {
    if (isValidEmail(candidate)) {
      return candidate.trim().toLowerCase()
    }
  }

  const stableId = profile.oid ?? profile.sub ?? 'user'
  return `${stableId}@users.itskillhouse.com`
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
        const causeInline = authError.cause ? formatUnknown(authError.cause) : 'null'
        console.error(
          `[auth][error] ${label}: ${authError.message} | env clientIdSuffix=${clientIdSuffix} tenantSuffix=${tenantSuffix} secretLength=${secretLength} authUrl=${authUrl} nextAuthUrl=${nextAuthUrl} | cause=${causeInline}`,
        )
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
        profile(profile) {
          const normalizedProfile = profile as EntraProfileLike
          const email = resolveEntraEmail(normalizedProfile)
          return {
            id: normalizedProfile.sub ?? normalizedProfile.oid ?? crypto.randomUUID(),
            name: normalizedProfile.name ?? email,
            email,
            image: null,
          }
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
