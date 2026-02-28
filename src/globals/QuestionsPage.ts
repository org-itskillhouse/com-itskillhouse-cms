import type { GlobalConfig } from 'payload'

export const QuestionsPage: GlobalConfig = {
  slug: 'questions-page',
  label: 'FAQ Page',
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
