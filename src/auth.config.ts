import type { NextAuthConfig } from 'next-auth'
import microsoftEntraID from 'next-auth/providers/microsoft-entra-id'

import { getEntraAuthEnv } from '@/auth/entra-auth-env'

const entra = getEntraAuthEnv({
  AUTH_SECRET: process.env.AUTH_SECRET,
  ENTRA_CLIENT_ID: process.env.ENTRA_CLIENT_ID,
  ENTRA_CLIENT_SECRET: process.env.ENTRA_CLIENT_SECRET,
  ENTRA_TENANT_ID: process.env.ENTRA_TENANT_ID,
})

export const authConfig: NextAuthConfig = {
  secret: entra.authSecret,
  providers: [
    microsoftEntraID({
      clientId: entra.clientId,
      clientSecret: entra.clientSecret,
      issuer: entra.issuer,
    }),
  ],
}
