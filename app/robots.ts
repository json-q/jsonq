import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/private/',
    },
    sitemap: `${process.env.NEXT_PUBLIC_SITE_HOST}/sitemap.xml`,
    host: process.env.NEXT_PUBLIC_SITE_HOST,
  };
}
