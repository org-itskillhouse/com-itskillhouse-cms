import { describe, expect, it, vi } from 'vitest'

const signOutMock = vi.fn(async () => ({
  cookies: [
    {
      name: 'authjs.session-token',
      value: '',
      options: { path: '/', expires: new Date(0) },
    },
  ],
}))

const getEntraAuthEnvFromProcessMock = vi.fn(() => ({
  authSecret: 'secret',
  clientId: 'client-id',
  clientSecret: 'client-secret',
  tenantId: 'tenant-id',
  issuer: 'https://login.microsoftonline.com/tenant-id/v2.0',
}))

vi.mock('@/auth', () => ({
  signOut: signOutMock,
}))

vi.mock('@/auth/entra-auth-env', () => ({
  getEntraAuthEnvFromProcess: getEntraAuthEnvFromProcessMock,
}))

describe('admin logout route', () => {
  it('clears local session and redirects to Entra logout', async () => {
    const module = await import('@/app/(payload)/admin/logout/route')
    const response = await module.GET(new Request('https://itskillhouse.com/cms/admin/logout'))

    expect(signOutMock).toHaveBeenCalledWith({
      redirect: false,
      redirectTo: 'https://itskillhouse.com/cms/admin/login',
    })
    expect(getEntraAuthEnvFromProcessMock).toHaveBeenCalledTimes(1)

    const location = response.headers.get('location')
    expect(location).toContain('https://login.microsoftonline.com/tenant-id/oauth2/v2.0/logout')
    expect(location).toContain(
      'post_logout_redirect_uri=https%3A%2F%2Fitskillhouse.com%2Fcms%2Fadmin%2Flogin',
    )

    const cookieHeader = response.headers.get('set-cookie')
    expect(cookieHeader).toContain('authjs.session-token=')
  })
})
