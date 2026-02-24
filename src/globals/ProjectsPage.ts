import type { GlobalConfig } from 'payload'

export const ProjectsPage: GlobalConfig = {
  slug: 'projects-page',
  label: 'Projects Page',
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
