import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'teamMember',
  title: 'Team Member',
  type: 'document',
  fields: [
    defineField({ name: 'name', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'title', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'bio', type: 'text', rows: 6, validation: (r) => r.required() }),
    defineField({ name: 'credentials', type: 'array', of: [{ type: 'string' }] }),
    defineField({
      name: 'portrait',
      type: 'image',
      options: { hotspot: true },
      validation: (r) => r.required(),
    }),
    defineField({ name: 'order', type: 'number', initialValue: 0 }),
  ],
  preview: { select: { title: 'name', subtitle: 'title', media: 'portrait' } },
});
