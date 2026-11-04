import { siteUrl } from '~/lib/site';
import { portfolio } from '~/portfolio.config';

/** schema.org Person for the owner, used on the home and About pages. */
export function personJsonLd() {
  const [city, region] = portfolio.location.city.split(',').map((s) => s.trim());
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': siteUrl('/#person'),
    name: portfolio.name,
    jobTitle: portfolio.role,
    description: portfolio.tagline,
    url: siteUrl('/'),
    image: siteUrl('/og-image.jpg'),
    address: {
      '@type': 'PostalAddress',
      addressLocality: city,
      ...(region ? { addressRegion: region } : {})
    },
    sameAs: portfolio.social.map((s) => s.href),
    ...(portfolio.ownerEmail ? { email: `mailto:${portfolio.ownerEmail}` } : {})
  };
}
