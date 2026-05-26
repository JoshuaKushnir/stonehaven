import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'serviceArea',
  title: 'Service Area',
  type: 'document',
  fields: [
    defineField({ name: 'town', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'state', type: 'string', validation: (r) => r.required().length(2) }),
    defineField({ name: 'region', type: 'string', validation: (r) => r.required() }),
    defineField({
      name: 'slug',
      type: 'slug',
      options: { source: (doc) => `${doc.town}-${doc.state}` },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'description',
      type: 'text',
      rows: 4,
      validation: (r) => r.required().max(500),
    }),
    defineField({
      name: 'image',
      type: 'image',
      options: { hotspot: true },
      validation: (r) => r.required(),
    }),
  ],
  preview: { select: { title: 'town', subtitle: 'region', media: 'image' } },
});
