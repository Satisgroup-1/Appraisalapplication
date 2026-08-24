import type { MetadataRoute } from 'next';
import { articles, cases } from '@/lib/content';
import { industries } from '@/lib/industries';
import { services } from '@/lib/services';
import { absoluteUrl, toIsoDate } from '@/lib/seo';

export default function sitemap(): MetadataRoute.Sitemap {
  const paths: Array<{ path: string; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency']; priority: number }> = [
    { path: '/', changeFrequency: 'weekly', priority: 1 },
    { path: '/about', changeFrequency: 'monthly', priority: 0.7 },
    { path: '/services', changeFrequency: 'weekly', priority: 0.9 },
    { path: '/industries', changeFrequency: 'weekly', priority: 0.9 },
    { path: '/case-studies', changeFrequency: 'monthly', priority: 0.8 },
    { path: '/news', changeFrequency: 'weekly', priority: 0.8 },
    { path: '/contact', changeFrequency: 'yearly', priority: 0.6 },
    { path: '/privacy', changeFrequency: 'yearly', priority: 0.2 },
    { path: '/terms', changeFrequency: 'yearly', priority: 0.2 },
    { path: '/accessibility', changeFrequency: 'yearly', priority: 0.2 },
    ...industries.map((industry) => ({ path: `/industries/${industry.slug}`, changeFrequency: 'monthly' as const, priority: 0.7 })),
    ...services.map((service) => ({ path: `/services/${service.slug}`, changeFrequency: 'monthly' as const, priority: 0.8 })),
    ...cases.map((study) => ({ path: `/case-studies/${study.slug}`, changeFrequency: 'monthly' as const, priority: 0.7 })),
  ];
  const staticEntries: MetadataRoute.Sitemap = paths.map(({ path, ...entry }) => ({ url: absoluteUrl(path), ...entry }));
  const articleEntries: MetadataRoute.Sitemap = articles.map((article) => ({
    url: absoluteUrl(`/news/${article.slug}`),
    lastModified: toIsoDate(article.date),
    changeFrequency: 'monthly',
    priority: 0.7,
  }));
  return [...staticEntries, ...articleEntries];
}
