import type { GlobalConfig } from 'payload'

export const PrivacyPage: GlobalConfig = {
  slug: 'privacy-page',
  label: 'Privacy Page',
  admin: {
    group: 'Pages',
  },
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
      name: 'body',
      type: 'richText',
      required: true,
      localized: true,
    },
    {
      name: 'version',
      type: 'text',
      admin: {
        description: 'Example: 2026-01',
      },
    },
  ],
}
