import type { GlobalConfig } from 'payload'

export const ContractingPage: GlobalConfig = {
  slug: 'contracting-page',
  label: 'Services / IT Contracting Page',
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
    {
      name: 'body',
      type: 'richText',
      localized: true,
    },
  ],
}
