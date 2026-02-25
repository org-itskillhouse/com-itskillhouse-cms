import { describe, expect, it } from 'vitest'
import { createAuthConfig } from '@/auth.config'

describe('createAuthConfig', () => {
  it('uses authjs base path and trustHost by default', () => {
    const config = createAuthConfig({
      AUTH_SECRET: 'secret',
      ENTRA_CLIENT_ID: 'client-id',
      ENTRA_CLIENT_SECRET: 'client-secret',
      ENTRA_TENANT_ID: 'tenant-id',
    })

    expect(config.basePath).toBe('/cms/api/auth')
    expect(config.trustHost).toBe(true)
  })
})
