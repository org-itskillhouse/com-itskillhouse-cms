import type { GlobalConfig } from 'payload'

export const QuestionsPage: GlobalConfig = {
  slug: 'questions-page',
  label: 'FAQ',
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
