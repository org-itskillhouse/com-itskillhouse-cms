import type { GlobalConfig } from 'payload'

export const ArticlesPage: GlobalConfig = {
  slug: 'articles-page',
  label: 'Articles Page',
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
  ],
}
