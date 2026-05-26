import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';
import tailwindcss from '@tailwindcss/vite';

const SITE_URL = process.env.SITE_URL || 'https://stonehaven-studio.example.com';

export default defineConfig({
  site: SITE_URL,
  output: 'static',
  adapter: vercel({ webAnalytics: { enabled: false } }),
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
  image: {
    domains: ['images.unsplash.com', 'cdn.sanity.io'],
  },
});
