import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
  },
  auth: {
    disableLocalStrategy: true,
  },
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (!data || typeof data !== 'object') {
          return data
        }

        const maybeAccounts = (data as { accounts?: unknown }).accounts
        if (!Array.isArray(maybeAccounts)) {
          return data
        }

        ;(data as { accounts: Array<Record<string, unknown>> }).accounts = maybeAccounts.map((account) => {
          if (!account || typeof account !== 'object') {
            return account as Record<string, unknown>
          }

          const record = account as Record<string, unknown>
          if (!record.id) {
            record.id = crypto.randomUUID()
          }
          return record
        })

        return data
      },
    ],
  },
  fields: [
    // Email added by default
    // Add more fields as needed
  ],
}
