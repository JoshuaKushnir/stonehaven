import type { APIRoute } from 'astro';

export const prerender = false;

// Hashed-seed → deterministic SVG placeholder.
// Produces a topographic / architectural sketch on a warm-neutral palette —
// reads as an intentional design choice rather than "we forgot to add photos".

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(a: number) {
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function escapeXml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

const PALETTES = [
  // [bg, mid-tone, line, accent]
  ['#f4f1ea', '#e8e2d4', '#4a4740', '#5e6a4d'],
  ['#faf8f3', '#e8e2d4', '#1a1a17', '#8a8275'],
  ['#1a1a17', '#404a35', '#e8e2d4', '#faf8f3'],
  ['#404a35', '#5e6a4d', '#e8e2d4', '#faf8f3'],
  ['#e8e2d4', '#f4f1ea', '#4a4740', '#5e6a4d'],
];

interface Opts {
  w: number;
  h: number;
  label?: string;
  seed: string;
}

function svgFor({ w, h, label, seed }: Opts) {
  const seedNum = hash(seed);
  const rand = mulberry32(seedNum);
  const palette = PALETTES[seedNum % PALETTES.length];
  const [bg, mid, line, accent] = palette;
  const isDark = bg === '#1a1a17' || bg === '#404a35';
  const labelColor = isDark ? '#faf8f3' : '#1a1a17';

  // Topographic contour lines. Each line is a smooth horizontal wave.
  const lines: string[] = [];
  const lineCount = 6 + Math.floor(rand() * 6);
  for (let i = 0; i < lineCount; i++) {
    const baseY = (h / (lineCount + 1)) * (i + 1) + (rand() - 0.5) * 18;
    const amplitude = 8 + rand() * 26;
    const period = (1 + rand() * 1.5) * Math.PI;
    const phase = rand() * Math.PI * 2;
    const segments: string[] = [];
    const step = w / 60;
    for (let x = 0; x <= w; x += step) {
      const y = baseY + Math.sin((x / w) * period + phase) * amplitude;
      segments.push(`${x === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`);
    }
    lines.push(
      `<path d="${segments.join(' ')}" fill="none" stroke="${line}" stroke-width="${(0.8 + rand() * 0.6).toFixed(2)}" stroke-linecap="round" opacity="${(0.35 + rand() * 0.35).toFixed(2)}"/>`,
    );
  }

  // A faint horizon band
  const horizonY = h * (0.55 + (rand() - 0.5) * 0.18);

  // A small architectural plan marker — circle + crosshair
  const markerX = w - 64;
  const markerY = 64;
  const marker = `
    <g opacity="0.45">
      <circle cx="${markerX}" cy="${markerY}" r="14" fill="none" stroke="${line}" stroke-width="1"/>
      <line x1="${markerX - 20}" y1="${markerY}" x2="${markerX + 20}" y2="${markerY}" stroke="${line}" stroke-width="0.6"/>
      <line x1="${markerX}" y1="${markerY - 20}" x2="${markerX}" y2="${markerY + 20}" stroke="${line}" stroke-width="0.6"/>
    </g>`;

  // A small abstract feature — a couple of soft circles representing planting
  const featureCount = 1 + Math.floor(rand() * 3);
  const features: string[] = [];
  for (let i = 0; i < featureCount; i++) {
    const cx = 80 + rand() * (w - 200);
    const cy = horizonY - 20 - rand() * 90;
    const r = 8 + rand() * 22;
    features.push(
      `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${r.toFixed(1)}" fill="${accent}" opacity="0.55"/>`,
    );
  }

  // Subtle background gradient
  const gradId = `g${seedNum % 9999}`;
  const labelFontSize = Math.max(12, Math.min(22, Math.round(w / 60)));

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid slice">
    <defs>
      <linearGradient id="${gradId}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${bg}"/>
        <stop offset="1" stop-color="${mid}"/>
      </linearGradient>
    </defs>
    <rect width="${w}" height="${h}" fill="url(#${gradId})"/>
    <rect y="${horizonY.toFixed(1)}" width="${w}" height="${(h - horizonY).toFixed(1)}" fill="${mid}" opacity="0.35"/>
    ${features.join('')}
    ${lines.join('\n    ')}
    ${marker}
    ${label ? `<text x="40" y="${h - 36}" font-family="'Fraunces', Georgia, serif" font-size="${labelFontSize}" font-style="italic" fill="${labelColor}" opacity="0.78">${escapeXml(label)}</text>` : ''}
  </svg>`;
}

export const GET: APIRoute = ({ params, url }) => {
  const seedParam = String(params.seed ?? 'default').replace(/\.svg$/, '');
  const w = Math.min(3200, parseInt(url.searchParams.get('w') ?? '1600', 10) || 1600);
  const h = Math.min(3200, parseInt(url.searchParams.get('h') ?? '1200', 10) || 1200);
  const label = url.searchParams.get('label') ?? undefined;

  const body = svgFor({ w, h, label, seed: seedParam });

  return new Response(body, {
    headers: {
      'content-type': 'image/svg+xml; charset=utf-8',
      'cache-control': 'public, max-age=86400, immutable',
    },
  });
};
