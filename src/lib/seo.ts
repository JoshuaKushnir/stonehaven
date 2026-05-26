import { site } from './site';

export function localBusinessJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'LandscapeArchitect',
    name: site.legalName,
    alternateName: site.name,
    description: site.description,
    url: site.url,
    telephone: site.phone,
    email: site.email,
    foundingDate: String(site.founded),
    address: {
      '@type': 'PostalAddress',
      streetAddress: site.address.street,
      addressLocality: site.address.city,
      addressRegion: site.address.region,
      postalCode: site.address.postalCode,
      addressCountry: site.address.country,
    },
    areaServed: [
      'Westchester County, NY',
      'Hudson Valley, NY',
      'Fairfield County, CT',
      'Litchfield County, CT',
      'Mercer County, NJ',
    ],
    sameAs: [site.social.instagram],
  };
}

export function pageJsonLd(args: {
  type: 'WebPage' | 'AboutPage' | 'ContactPage' | 'CollectionPage';
  name: string;
  description: string;
  url: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': args.type,
    name: args.name,
    description: args.description,
    url: args.url,
    isPartOf: { '@id': site.url },
  };
}

export function projectJsonLd(project: {
  title: string;
  summary: string;
  location: string;
  year: number;
  coverImage: string;
  url: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: project.title,
    description: project.summary,
    locationCreated: project.location,
    dateCreated: String(project.year),
    image: project.coverImage,
    url: project.url,
    creator: { '@type': 'Organization', name: site.name },
  };
}
