import { describe, expect, it, vi } from 'vitest'

const signInMock = vi.fn(async () => undefined)

vi.mock('@/auth', () => ({
  signIn: signInMock,
}))

describe('admin login route', () => {
  it('initiates Entra sign-in and redirects to admin home', async () => {
    const module = await import('@/app/(payload)/admin/login/route')
    const response = await module.GET(new Request('https://itskillhouse.com/cms/admin/login'))

    expect(signInMock).toHaveBeenCalledWith('microsoft-entra-id', {
      redirectTo: 'https://itskillhouse.com/cms/admin',
    })
    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toBe('https://itskillhouse.com/cms/admin')
  })
})
