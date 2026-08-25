import type { Metadata } from 'next';
import { IBM_Plex_Sans } from 'next/font/google';
import './globals.css';
import './tailwind.css';
import { Header, Footer } from '@/components/Shell';
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from '@/lib/seo';

// One family across the whole site. The institutional register carries its
// hierarchy in weight, size and space, not in a second typeface.
const body = IBM_Plex_Sans({ subsets: ['latin'], variable: '--body', weight: ['400', '500', '600'], display: 'swap' });

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
  // The font variable belongs on <html>: globals.css derives --sans and
  // --display from --body at :root, and a custom property set on <body> is not
  // visible to its own ancestor. Setting it here served the whole site in the
  // browser default serif.
  return <html lang="en" className={body.variable}><body><a className="skip-link" href="#main">Skip to content</a><Header/><main id="main">{children}</main><Footer/></body></html>;
}
