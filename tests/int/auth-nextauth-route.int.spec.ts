import { describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

const handlersMock = {
  GET: vi.fn(async () => new Response('ok')),
  POST: vi.fn(async () => new Response('ok')),
}

vi.mock('@/auth', () => ({
  handlers: handlersMock,
}))

describe('auth nextauth route', () => {
  it('rewrites /api/auth/* requests to /cms/api/auth/* before passing to handlers', async () => {
    const module = await import('@/app/(payload)/api/auth/[...nextauth]/route')
    const request = new NextRequest('https://itskillhouse.com/api/auth/providers')

    await module.GET(request)

    expect(handlersMock.GET).toHaveBeenCalledTimes(1)
    const forwardedRequest = handlersMock.GET.mock.calls[0]?.[0] as NextRequest
    expect(new URL(forwardedRequest.url).pathname).toBe('/cms/api/auth/providers')
  })

  it('keeps /cms/api/auth/* unchanged', async () => {
    const module = await import('@/app/(payload)/api/auth/[...nextauth]/route')
    const request = new NextRequest('https://itskillhouse.com/cms/api/auth/session')

    await module.GET(request)

    expect(handlersMock.GET).toHaveBeenCalledTimes(2)
    const forwardedRequest = handlersMock.GET.mock.calls[1]?.[0] as NextRequest
    expect(new URL(forwardedRequest.url).pathname).toBe('/cms/api/auth/session')
  })
})
