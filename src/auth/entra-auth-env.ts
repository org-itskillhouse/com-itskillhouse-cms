export type EntraAuthEnvInput = {
  AUTH_SECRET?: string
  ENTRA_CLIENT_ID?: string
  ENTRA_CLIENT_SECRET?: string
  ENTRA_TENANT_ID?: string
}

export type EntraAuthEnv = {
  authSecret: string
  clientId: string
  clientSecret: string
  issuer: string
}

const REQUIRED_KEYS = ['AUTH_SECRET', 'ENTRA_CLIENT_ID', 'ENTRA_CLIENT_SECRET', 'ENTRA_TENANT_ID'] as const

export const getEntraAuthEnv = (input: EntraAuthEnvInput): EntraAuthEnv => {
  const values = {
    AUTH_SECRET: input.AUTH_SECRET?.trim() ?? '',
    ENTRA_CLIENT_ID: input.ENTRA_CLIENT_ID?.trim() ?? '',
    ENTRA_CLIENT_SECRET: input.ENTRA_CLIENT_SECRET?.trim() ?? '',
    ENTRA_TENANT_ID: input.ENTRA_TENANT_ID?.trim() ?? '',
  }

  const missing = REQUIRED_KEYS.filter((key) => !values[key])
  if (missing.length > 0) {
    throw new Error(`Missing required auth env vars: ${missing.join(', ')}`)
  }

  return {
    authSecret: values.AUTH_SECRET,
    clientId: values.ENTRA_CLIENT_ID,
    clientSecret: values.ENTRA_CLIENT_SECRET,
    issuer: `https://login.microsoftonline.com/${values.ENTRA_TENANT_ID}/v2.0`,
  }
}
