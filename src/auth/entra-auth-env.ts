export type EntraAuthEnvInput = {
  AUTH_SECRET?: string
  ENTRA_CLIENT_ID?: string
  ENTRA_CLIENT_SECRET?: string
  ENTRA_TENANT_ID?: string
}

export type EntraAuthEnvOptions = {
  allowMissing?: boolean
}

export type EntraAuthEnv = {
  authSecret: string
  clientId: string
  clientSecret: string
  tenantId: string
  issuer: string
}

const REQUIRED_KEYS = ['AUTH_SECRET', 'ENTRA_CLIENT_ID', 'ENTRA_CLIENT_SECRET', 'ENTRA_TENANT_ID'] as const
const CLI_FALLBACK = {
  AUTH_SECRET: 'payload-cli-auth-secret',
  ENTRA_CLIENT_ID: 'payload-cli-client-id',
  ENTRA_CLIENT_SECRET: 'payload-cli-client-secret',
  ENTRA_TENANT_ID: 'common',
} as const

export const getEntraAuthEnv = (input: EntraAuthEnvInput, options: EntraAuthEnvOptions = {}): EntraAuthEnv => {
  const values = {
    AUTH_SECRET: input.AUTH_SECRET?.trim() || (options.allowMissing ? CLI_FALLBACK.AUTH_SECRET : ''),
    ENTRA_CLIENT_ID: input.ENTRA_CLIENT_ID?.trim() || (options.allowMissing ? CLI_FALLBACK.ENTRA_CLIENT_ID : ''),
    ENTRA_CLIENT_SECRET:
      input.ENTRA_CLIENT_SECRET?.trim() || (options.allowMissing ? CLI_FALLBACK.ENTRA_CLIENT_SECRET : ''),
    ENTRA_TENANT_ID: input.ENTRA_TENANT_ID?.trim() || (options.allowMissing ? CLI_FALLBACK.ENTRA_TENANT_ID : ''),
  }

  const missing = REQUIRED_KEYS.filter((key) => !values[key])
  if (missing.length > 0) {
    throw new Error(`Missing required auth env vars: ${missing.join(', ')}`)
  }

  return {
    authSecret: values.AUTH_SECRET,
    clientId: values.ENTRA_CLIENT_ID,
    clientSecret: values.ENTRA_CLIENT_SECRET,
    tenantId: values.ENTRA_TENANT_ID,
    issuer: `https://login.microsoftonline.com/${values.ENTRA_TENANT_ID}/v2.0`,
  }
}

export const getEntraAuthEnvFromProcess = (): EntraAuthEnv =>
  getEntraAuthEnv({
    AUTH_SECRET: process.env.AUTH_SECRET,
    ENTRA_CLIENT_ID: process.env.ENTRA_CLIENT_ID,
    ENTRA_CLIENT_SECRET: process.env.ENTRA_CLIENT_SECRET,
    ENTRA_TENANT_ID: process.env.ENTRA_TENANT_ID,
  })

export const shouldAllowMissingEntraAuthEnvForCLI = (argv: string[] = process.argv): boolean => {
  const joined = argv.join(' ')
  if (!joined.includes('payload')) {
    return false
  }

  return (
    joined.includes('migrate') ||
    joined.includes('generate:importmap') ||
    joined.includes('generate:types') ||
    joined.includes('generate:schema')
  )
}

export const getEntraAuthEnvInputFromProcess = (): EntraAuthEnvInput => ({
  AUTH_SECRET: process.env.AUTH_SECRET,
  ENTRA_CLIENT_ID: process.env.ENTRA_CLIENT_ID,
  ENTRA_CLIENT_SECRET: process.env.ENTRA_CLIENT_SECRET,
  ENTRA_TENANT_ID: process.env.ENTRA_TENANT_ID,
})
