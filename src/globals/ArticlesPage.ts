import type { GlobalConfig } from 'payload'

export const ArticlesPage: GlobalConfig = {
  slug: 'articles-page',
  label: 'Articles Page',
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
