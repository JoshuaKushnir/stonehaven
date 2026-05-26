import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  __experimental_actions: ['update', 'publish'],
  fields: [
    defineField({ name: 'name', type: 'string', initialValue: 'Stonehaven' }),
    defineField({ name: 'legalName', type: 'string' }),
    defineField({ name: 'tagline', type: 'string' }),
    defineField({ name: 'description', type: 'text', rows: 3 }),
    defineField({ name: 'email', type: 'email' }),
    defineField({ name: 'phone', type: 'string' }),
    defineField({
      name: 'address',
      type: 'object',
      fields: [
        defineField({ name: 'street', type: 'string' }),
        defineField({ name: 'city', type: 'string' }),
        defineField({ name: 'region', type: 'string' }),
        defineField({ name: 'postalCode', type: 'string' }),
        defineField({ name: 'country', type: 'string', initialValue: 'US' }),
      ],
    }),
    defineField({ name: 'instagram', type: 'url' }),
    defineField({ name: 'hours', type: 'string' }),
    defineField({ name: 'founded', type: 'number' }),
    defineField({
      name: 'heroImage',
      type: 'image',
      options: { hotspot: true },
    }),
  ],
  preview: { prepare: () => ({ title: 'Site Settings' }) },
});
