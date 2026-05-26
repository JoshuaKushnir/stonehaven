import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'testimonial',
  title: 'Testimonial',
  type: 'document',
  fields: [
    defineField({ name: 'quote', type: 'text', rows: 5, validation: (r) => r.required() }),
    defineField({ name: 'author', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'role', type: 'string' }),
    defineField({
      name: 'project',
      type: 'reference',
      to: [{ type: 'project' }],
      description: 'Optional — link the testimonial to the project it references.',
    }),
    defineField({ name: 'featured', type: 'boolean', initialValue: false }),
  ],
  preview: {
    select: { title: 'author', subtitle: 'role' },
  },
});
