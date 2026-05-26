import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'service',
  title: 'Service',
  type: 'document',
  fields: [
    defineField({ name: 'title', type: 'string', validation: (r) => r.required() }),
    defineField({
      name: 'slug',
      type: 'slug',
      options: { source: 'title' },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'eyebrow',
      type: 'string',
      description: 'Small caps label shown above the title, e.g. "01 — Design".',
    }),
    defineField({ name: 'description', type: 'text', rows: 4, validation: (r) => r.required() }),
    defineField({
      name: 'bullets',
      type: 'array',
      of: [{ type: 'string' }],
      validation: (r) => r.required().min(1),
    }),
    defineField({ name: 'priceFrom', type: 'string' }),
    defineField({ name: 'image', type: 'image', options: { hotspot: true } }),
    defineField({
      name: 'order',
      type: 'number',
      description: 'Display order on the Services page.',
      initialValue: 0,
    }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'eyebrow', media: 'image' },
  },
});
