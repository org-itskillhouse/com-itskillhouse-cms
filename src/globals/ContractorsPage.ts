import type { GlobalConfig } from 'payload'

export const ContractorsPage: GlobalConfig = {
  slug: 'contractors-page',
  label: 'Contractors Page',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'intro',
      type: 'textarea',
      localized: true,
    },
  ],
}
