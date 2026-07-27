export default function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.closetrush.in';

  const staticRoutes = [
    '',
    '/about',
    '/shop',
    '/product',
    '/value-visualizer',
    '/location',
    '/privacy',
    '/terms',
    '/cancellation',
    '/shipping',
    '/agreement',
    '/login',
    '/signup'
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: route === '' ? 'daily' : 'weekly',
    priority: route === '' ? 1 : 0.8,
  }));

  return staticRoutes;
}
