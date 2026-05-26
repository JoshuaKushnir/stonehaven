# Sanity Studio — production content layer

These are the schemas for swapping the site's content source from local Astro
content collections (the default) to a hosted Sanity Studio.

The schema shape mirrors `src/content.config.ts` one-for-one. The Astro pages
do not need to change beyond replacing `getCollection()` calls with a Sanity
client query (and an image-URL builder for `image` fields).

## To wire it up

1. Create a free project at <https://sanity.io/manage>
2. Add the project ID and dataset to `.env`:
   ```
   SANITY_PROJECT_ID=your-project-id
   SANITY_DATASET=production
   ```
3. Install Sanity packages and the Astro integration:
   ```
   npm i sanity @sanity/vision @sanity/client @sanity/astro
   ```
4. In `astro.config.mjs`, add the Sanity integration so Studio embeds at `/studio`:
   ```js
   import sanity from '@sanity/astro';
   integrations: [sitemap(), sanity({
     projectId: process.env.SANITY_PROJECT_ID,
     dataset: process.env.SANITY_DATASET,
     useCdn: true,
     studioBasePath: '/studio',
   })]
   ```
5. In your page frontmatter, swap content-collection queries for Sanity ones:
   ```ts
   // Before
   const projects = await getCollection('projects');
   // After
   import { useSanityClient } from '@sanity/astro';
   const client = useSanityClient();
   const projects = await client.fetch(`*[_type == "project"] | order(year desc)`);
   ```

## Files

- `sanity.config.ts` — Studio config (project ID, plugins, schemas)
- `schemas/index.ts` — schema registry
- `schemas/project.ts` — project documents
- `schemas/service.ts` — service offerings
- `schemas/testimonial.ts` — testimonials with optional project reference
- `schemas/teamMember.ts` — studio principals
- `schemas/serviceArea.ts` — service-area town pages
- `schemas/siteSettings.ts` — singleton with site-wide settings
