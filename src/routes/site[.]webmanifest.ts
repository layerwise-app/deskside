import { createFileRoute } from '@tanstack/react-router';
import { portfolio } from '~/portfolio.config';

// Name and colors come from `src/portfolio.config.ts`; icons from
// `pnpm favicons`.
export const Route = createFileRoute('/site.webmanifest')({
  server: {
    handlers: {
      GET: () =>
        Response.json(
          {
            name: `${portfolio.name}, ${portfolio.role}`,
            short_name: portfolio.name,
            description: portfolio.tagline,
            start_url: '/',
            icons: [
              { src: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
              { src: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' }
            ],
            theme_color: portfolio.colors.paper,
            background_color: portfolio.colors.paper,
            display: 'standalone'
          },
          { headers: { 'content-type': 'application/manifest+json; charset=utf-8' } }
        )
    }
  }
});
