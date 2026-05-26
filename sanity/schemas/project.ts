import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'project',
  title: 'Project',
  type: 'document',
  fields: [
    defineField({ name: 'title', type: 'string', validation: (r) => r.required() }),
    defineField({
      name: 'slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: (r) => r.required(),
    }),
    defineField({ name: 'location', type: 'string', validation: (r) => r.required() }),
    defineField({
      name: 'year',
      type: 'number',
      validation: (r) => r.required().min(1900).max(2100).integer(),
    }),
    defineField({
      name: 'category',
      type: 'string',
      options: {
        list: [
          { title: 'Residential', value: 'residential' },
          { title: 'Estate', value: 'estate' },
          { title: 'Commercial', value: 'commercial' },
        ],
      },
      validation: (r) => r.required(),
    }),
    defineField({ name: 'featured', type: 'boolean', initialValue: false }),
    defineField({
      name: 'summary',
      type: 'text',
      rows: 3,
      validation: (r) => r.required().max(280),
    }),
    defineField({
      name: 'scope',
      type: 'array',
      of: [{ type: 'string' }],
      validation: (r) => r.required().min(1),
    }),
    defineField({ name: 'materials', type: 'array', of: [{ type: 'string' }] }),
    defineField({ name: 'collaborators', type: 'array', of: [{ type: 'string' }] }),
    defineField({
      name: 'coverImage',
      type: 'image',
      options: { hotspot: true },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'gallery',
      type: 'array',
      of: [{ type: 'image', options: { hotspot: true } }],
      validation: (r) => r.min(2),
    }),
    defineField({
      name: 'body',
      type: 'array',
      of: [{ type: 'block' }],
    }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'location', media: 'coverImage' },
  },
});
