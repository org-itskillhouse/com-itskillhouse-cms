import { NextResponse } from 'next/server'
import { signIn } from '@/auth'

const ENTRA_PROVIDER_ID = 'microsoft-entra-id'
const ADMIN_HOME_PATH = '/cms/admin'

export async function GET(request: Request): Promise<Response> {
  const currentUrl = new URL(request.url)
  const callbackUrl = new URL(ADMIN_HOME_PATH, currentUrl.origin).toString()

  await signIn(ENTRA_PROVIDER_ID, { redirectTo: callbackUrl })

  return NextResponse.redirect(callbackUrl)
}
