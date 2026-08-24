import type { Metadata } from 'next';

export const SITE_NAME = 'Quiet Gears';
export const SITE_URL = 'https://quietgears.co.uk';
export const SITE_DESCRIPTION =
  'Senior AI advisory, production engineering and adoption support for ambitious UK SMEs.';

export function absoluteUrl(path = '/') {
  return new URL(path, SITE_URL).toString();
}

type PageMetadataOptions = {
  title: string;
  description: string;
  path: string;
  image?: string | null;
  type?: 'website' | 'article';
  publishedTime?: string;
};

export function createPageMetadata({
  title,
  description,
  path,
  image = '/og.png',
  type = 'website',
  publishedTime,
}: PageMetadataOptions): Metadata {
  const canonical = absoluteUrl(path);
  const images = image ? [absoluteUrl(image)] : [];
  const socialTitle = `${title} | ${SITE_NAME}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title: socialTitle,
      description,
      url: canonical,
      siteName: SITE_NAME,
      locale: 'en_GB',
      type,
      images,
      ...(type === 'article' && publishedTime ? { publishedTime } : {}),
    },
    twitter: {
      card: image ? 'summary_large_image' : 'summary',
      title: socialTitle,
      description,
      images,
    },
  };
}

export function toIsoDate(date: string) {
  const match = date.match(/^(\d{1,2}) ([A-Z][a-z]{2}) (\d{4})$/);
  if (!match) return undefined;
  const months: Record<string, string> = {
    Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06',
    Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12',
  };
  const month = months[match[2]];
  return month ? `${match[3]}-${month}-${match[1].padStart(2, '0')}` : undefined;
}

export function breadcrumbJsonLd(items: Array<{ name: string; path: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}
