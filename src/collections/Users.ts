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
      ({ data, operation, originalDoc, req }) => {
        if (!data || typeof data !== 'object') {
          return data
        }

        const mutableData = data as Record<string, unknown>

        // Some auth adapter update paths can validate `id` from incoming data.
        // Ensure it is present for updates when Payload already knows the document id.
        if ((operation === 'update' || operation === 'create') && !mutableData.id) {
          const fallbackId =
            (req as { routeParams?: { id?: string | number } } | undefined)?.routeParams?.id ?? originalDoc?.id
          if (fallbackId !== undefined && fallbackId !== null) {
            mutableData.id = String(fallbackId)
          }
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
          if (typeof record.id === 'number') {
            record.id = String(record.id)
          }
          if (!record.id || (typeof record.id === 'string' && record.id.trim().length === 0)) {
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
