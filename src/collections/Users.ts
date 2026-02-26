import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  access: {
    delete: () => false,
  },
  admin: {
    useAsTitle: 'email',
    hidden: true,
  },
  auth: {
    disableLocalStrategy: true,
  },
  fields: [
    // Email added by default
    // Add more fields as needed
  ],
}
