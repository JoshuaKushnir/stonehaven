import type { APIRoute } from 'astro';
import { site } from '../lib/site';

export const GET: APIRoute = () => {
  const body = [
    'User-agent: *',
    'Allow: /',
    '',
    `Sitemap: ${site.url}/sitemap-index.xml`,
    '',
  ].join('\n');

  return new Response(body, {
    headers: { 'content-type': 'text/plain' },
  });
};
