import catalogs from '~/generated/catalog.json';
import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = catalogs.map((post) => ({
    url: `${process.env.NEXT_PUBLIC_SITE_HOST}/post/${post.slug}`,
    lastModified: post.publishedAt,
  }));
  const routes = ['', '/post', '/about'].map((route) => ({
    url: `${process.env.NEXT_PUBLIC_SITE_HOST}/${route}`,
    lastModified: new Date().toISOString().split('T')[0],
  }));
  return [...routes, ...posts];
}
