import { describe, expect, it } from 'vitest'
import {
  getEntraAuthEnv,
  getEntraAuthEnvFromProcess,
  shouldAllowMissingEntraAuthEnvForCLI,
} from '@/auth/entra-auth-env'

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

  it('allows missing env when explicitly enabled (for CLI contexts)', () => {
    const env = getEntraAuthEnv(
      {
        AUTH_SECRET: '',
        ENTRA_CLIENT_ID: '',
        ENTRA_CLIENT_SECRET: '',
        ENTRA_TENANT_ID: '',
      },
      { allowMissing: true },
    )

    expect(env).toEqual({
      authSecret: 'payload-cli-auth-secret',
      clientId: 'payload-cli-client-id',
      clientSecret: 'payload-cli-client-secret',
      tenantId: 'common',
      issuer: 'https://login.microsoftonline.com/common/v2.0',
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

describe('shouldAllowMissingEntraAuthEnvForCLI', () => {
  it('returns true for payload migrate and generate commands', () => {
    expect(shouldAllowMissingEntraAuthEnvForCLI(['node', '/x/payload/bin.js', 'migrate:create'])).toBe(true)
    expect(shouldAllowMissingEntraAuthEnvForCLI(['node', '/x/payload/bin.js', 'generate:importmap'])).toBe(true)
    expect(shouldAllowMissingEntraAuthEnvForCLI(['node', '/x/payload/bin.js', 'generate:types'])).toBe(true)
  })

  it('returns false for non-payload runtime commands', () => {
    expect(shouldAllowMissingEntraAuthEnvForCLI(['node', '.next/server.js'])).toBe(false)
  })
})
