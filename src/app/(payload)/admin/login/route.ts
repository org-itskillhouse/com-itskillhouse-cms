import { NextResponse } from 'next/server'

const ENTRA_PROVIDER_ID = 'microsoft-entra-id'
const ADMIN_HOME_PATH = '/cms/admin'

export async function GET(request: Request): Promise<Response> {
  const currentUrl = new URL(request.url)
  const callbackUrl = new URL(ADMIN_HOME_PATH, currentUrl.origin).toString()
  const signInUrl = new URL(`/cms/api/auth/signin/${ENTRA_PROVIDER_ID}`, currentUrl.origin)
  signInUrl.searchParams.set('callbackUrl', callbackUrl)

  return NextResponse.redirect(signInUrl)
}
