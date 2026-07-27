export default function robots() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.closetrush.in';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/dashboard', '/api/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
