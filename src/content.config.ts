import { defineCollection, z } from 'astro:content';
import { file, glob } from 'astro/loaders';

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    location: z.string(),
    year: z.number().int(),
    category: z.enum(['residential', 'estate', 'commercial']),
    scope: z.array(z.string()),
    materials: z.array(z.string()).optional(),
    collaborators: z.array(z.string()).optional(),
    featured: z.boolean().default(false),
    coverImage: z.string(),
    gallery: z.array(z.string()),
    summary: z.string(),
  }),
});

const services = defineCollection({
  loader: file('./src/content/services.json'),
  schema: z.object({
    id: z.string(),
    slug: z.string(),
    title: z.string(),
    eyebrow: z.string(),
    description: z.string(),
    bullets: z.array(z.string()),
    priceFrom: z.string().optional(),
    image: z.string(),
  }),
});

const testimonials = defineCollection({
  loader: file('./src/content/testimonials.json'),
  schema: z.object({
    id: z.string(),
    quote: z.string(),
    author: z.string(),
    role: z.string(),
    project: z.string().optional(),
  }),
});

const team = defineCollection({
  loader: file('./src/content/team.json'),
  schema: z.object({
    id: z.string(),
    name: z.string(),
    title: z.string(),
    bio: z.string(),
    credentials: z.array(z.string()).optional(),
    portrait: z.string(),
  }),
});

const areas = defineCollection({
  loader: file('./src/content/areas.json'),
  schema: z.object({
    id: z.string(),
    slug: z.string(),
    town: z.string(),
    state: z.string(),
    region: z.string(),
    image: z.string(),
    description: z.string(),
  }),
});

export const collections = { projects, services, testimonials, team, areas };
