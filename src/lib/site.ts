export const site = {
  name: 'Stonehaven',
  legalName: 'Stonehaven Landscape Studio LLC',
  tagline: 'Landscape architecture and design-build for considered homes.',
  description:
    'A landscape architecture and design-build studio working across New York, Connecticut, and New Jersey. Master planning, hardscape and masonry, naturalistic planting, and estate management.',
  url: import.meta.env.SITE_URL || 'https://stonehaven-studio.example.com',
  address: {
    street: '348 Warren Street',
    city: 'Hudson',
    region: 'NY',
    postalCode: '12534',
    country: 'US',
  },
  phone: '+1 518 555 0142',
  email: 'studio@stonehaven.example',
  social: {
    instagram: 'https://instagram.com/stonehaven.studio',
  },
  hours: 'Mon — Fri, 9 — 5 ET. Site visits by appointment.',
  founded: 2011,
} as const;

export const nav = [
  { label: 'Projects', href: '/projects' },
  { label: 'Services', href: '/services' },
  { label: 'Studio', href: '/about' },
  { label: 'Service Area', href: '/areas' },
  { label: 'Contact', href: '/contact' },
] as const;
