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

  return {
    secret: entra.authSecret,
    trustHost: true,
    basePath: '/cms/api/auth',
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
