import type { GlobalConfig } from 'payload'

export const RecruitmentPage: GlobalConfig = {
  slug: 'recruitment-page',
  label: 'Services / IT Recruitment Page',
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
