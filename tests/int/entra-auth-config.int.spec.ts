import { describe, expect, it } from 'vitest'
import { getEntraAuthEnv, getEntraAuthEnvFromProcess } from '@/auth/entra-auth-env'

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
      tenantId: 'tenant-id',
      issuer: 'https://login.microsoftonline.com/tenant-id/v2.0',
    })
  })

  it('reads and validates auth env directly from process.env', () => {
    const originalEnv = { ...process.env }
    process.env.AUTH_SECRET = 'secret'
    process.env.ENTRA_CLIENT_ID = 'client-id'
    process.env.ENTRA_CLIENT_SECRET = 'client-secret'
    process.env.ENTRA_TENANT_ID = 'tenant-id'

    try {
      const env = getEntraAuthEnvFromProcess()

      expect(env).toEqual({
        authSecret: 'secret',
        clientId: 'client-id',
        clientSecret: 'client-secret',
        tenantId: 'tenant-id',
        issuer: 'https://login.microsoftonline.com/tenant-id/v2.0',
      })
    } finally {
      process.env = originalEnv
    }
  })
})
