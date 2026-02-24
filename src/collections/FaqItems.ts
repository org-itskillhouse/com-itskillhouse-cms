import type { CollectionConfig } from 'payload'

export const FaqItems: CollectionConfig = {
  slug: 'questions',
  labels: {
    singular: 'Question',
    plural: 'Questions',
  },
  admin: {
    useAsTitle: 'question',
    defaultColumns: ['question', 'order', 'isPublished', 'updatedAt'],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'question',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'answer',
      type: 'richText',
      required: true,
      localized: true,
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 10,
      required: true,
    },
    {
      name: 'isPublished',
      type: 'checkbox',
      defaultValue: true,
      required: true,
    },
  ],
}
