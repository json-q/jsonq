/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_HOST,
  generateRobotsTxt: true,
  generateIndexSitemap: false,
  exclude: ['/', '/about'],
};
