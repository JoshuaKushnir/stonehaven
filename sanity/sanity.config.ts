/**
 * Sanity Studio v3 configuration for Stonehaven.
 *
 * This file is the "production swap" path. The site currently reads from
 * Astro content collections (src/content/), which works without any external
 * service and ships the demo end-to-end.
 *
 * To swap to Sanity in production:
 *
 *   1. Create a free Sanity project at https://sanity.io/manage
 *   2. Set SANITY_PROJECT_ID and SANITY_DATASET in .env
 *   3. Install: npm i sanity @sanity/vision @sanity/client @sanity/astro
 *   4. Add the Sanity Astro integration in astro.config.mjs and embed
 *      Sanity Studio at /studio
 *   5. Replace getCollection() calls with sanity client queries
 *
 * The schemas below are written to match the shape of the existing
 * content collections one-for-one — no migration is necessary on the
 * Astro side once the queries are swapped.
 */

import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';
import { schemaTypes } from './schemas';

export default defineConfig({
  name: 'stonehaven',
  title: 'Stonehaven Studio',
  projectId: process.env.SANITY_PROJECT_ID ?? '',
  dataset: process.env.SANITY_DATASET ?? 'production',
  plugins: [structureTool(), visionTool()],
  schema: { types: schemaTypes },
});
