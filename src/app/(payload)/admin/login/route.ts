import { NextResponse } from 'next/server'
import { signIn } from '@/auth'

const ADMIN_HOME_PATH = '/cms/admin'
const ENTRA_PROVIDER_ID = 'microsoft-entra-id'

export async function GET(request: Request): Promise<Response> {
  const callbackUrl = new URL(ADMIN_HOME_PATH, new URL(request.url).origin).toString()
  await signIn(ENTRA_PROVIDER_ID, { redirectTo: callbackUrl })

  return NextResponse.redirect(callbackUrl)
}
