import { createFileRoute } from '@tanstack/react-router';
import { Desk } from '~/components/desk/Desk';
import { randomFortune } from '~/components/site/Fortune';
import { personJsonLd } from '~/lib/structured-data';
import { site, siteUrl } from '~/lib/site';
import { portfolio } from '~/portfolio.config';
import { seo } from '~/utils/seo';

export const Route = createFileRoute('/')({
  loader: () => ({ fortune: randomFortune() }),
  head: () =>
    seo({
      title: `${portfolio.name}, ${portfolio.role.toLowerCase()} in ${portfolio.location.city}`,
      description: portfolio.tagline,
      path: '/',
      jsonLd: [
        personJsonLd(),
        {
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: site.name,
          url: siteUrl('/')
        }
      ]
    }),
  component: Home
});

function Home() {
  const { fortune } = Route.useLoaderData();
  return <Desk fortune={fortune} />;
}
