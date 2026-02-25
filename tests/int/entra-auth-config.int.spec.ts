import { describe, expect, it } from 'vitest'
import { getEntraAuthEnv } from '@/auth/entra-auth-env'

describe('getEntraAuthEnv', () => {
  it('throws when required env vars are missing', () => {
    expect(() =>
      getEntraAuthEnv({
        AUTH_SECRET: '',
        ENTRA_CLIENT_ID: '',
        ENTRA_CLIENT_SECRET: '',
        ENTRA_TENANT_ID: '',
      }),
    ).toThrowError('Missing required auth env vars: AUTH_SECRET, ENTRA_CLIENT_ID, ENTRA_CLIENT_SECRET, ENTRA_TENANT_ID')
  })

  it('returns normalized issuer when env vars are present', () => {
    const env = getEntraAuthEnv({
      AUTH_SECRET: 'secret',
      ENTRA_CLIENT_ID: 'client-id',
      ENTRA_CLIENT_SECRET: 'client-secret',
      ENTRA_TENANT_ID: 'tenant-id',
    })

    expect(env).toEqual({
      authSecret: 'secret',
      clientId: 'client-id',
      clientSecret: 'client-secret',
      issuer: 'https://login.microsoftonline.com/tenant-id/v2.0',
    })
  })
})
