import type { Metadata } from 'next';
import { Instrument_Serif, IBM_Plex_Sans } from 'next/font/google';
import './globals.css';
import './tailwind.css';
import { Header, Footer } from '@/components/Shell';
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from '@/lib/seo';

const display = Instrument_Serif({ subsets: ['latin'], variable: '--display', weight: '400' });
const body = IBM_Plex_Sans({ subsets: ['latin'], variable: '--body', weight: 'variable' });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: 'Quiet Gears | AI systems for ambitious SMEs', template: '%s | Quiet Gears' },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: 'technology',
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 } },
  openGraph: {
    title: 'Quiet Gears | AI systems for ambitious SMEs',
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: 'en_GB',
    type: 'website',
    images: ['/og.png'],
  },
  twitter: { card: 'summary_large_image', title: 'Quiet Gears | AI systems for ambitious SMEs', description: SITE_DESCRIPTION, images: ['/og.png'] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const readingModeInitializer = `(function(){try{var mode=localStorage.getItem('quiet-gears-reading-mode');document.documentElement.dataset.readingMode=mode==='simple'?'simple':'advanced'}catch(e){document.documentElement.dataset.readingMode='advanced'}})();`;
  return <html lang="en" data-reading-mode="advanced" suppressHydrationWarning><head><script dangerouslySetInnerHTML={{ __html: readingModeInitializer }}/></head><body className={`${display.variable} ${body.variable}`}><Header/><main>{children}</main><Footer/></body></html>;
}
