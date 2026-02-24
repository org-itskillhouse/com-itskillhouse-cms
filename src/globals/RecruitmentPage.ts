import type { GlobalConfig } from 'payload'

export const RecruitmentPage: GlobalConfig = {
  slug: 'recruitment-page',
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
