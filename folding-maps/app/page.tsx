import { getImageProps } from 'next/image';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import styles from './home.module.css';
import { JsonLd } from '@/components/JsonLd';
import { absoluteUrl, createPageMetadata, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from '@/lib/seo';

export const metadata: Metadata = createPageMetadata({
  title: 'AI systems for ambitious SMEs', description: SITE_DESCRIPTION, path: '/',
});

const homeJsonLd = [
  { '@context': 'https://schema.org', '@type': 'Organization', '@id': `${SITE_URL}/#organization`, name: SITE_NAME, url: SITE_URL, email: 'quietgearsai@gmail.com', description: SITE_DESCRIPTION, image: absoluteUrl('/og.png'), address: { '@type': 'PostalAddress', addressLocality: 'London', addressCountry: 'GB' }, areaServed: { '@type': 'Country', name: 'United Kingdom' } },
  { '@context': 'https://schema.org', '@type': 'WebSite', '@id': `${SITE_URL}/#website`, name: SITE_NAME, url: SITE_URL, publisher: { '@id': `${SITE_URL}/#organization` } },
];

const services = [
  { title: 'AI strategy', slug: 'ai-strategy', text: 'Choose the right use cases, controls and investment path.' },
  { title: 'AI implementation', slug: 'ai-implementation', text: 'Build dependable systems around your data and workflows.' },
  { title: 'Agents & automation', slug: 'agentic-ai', text: 'Remove repetitive work while keeping human oversight.' },
  { title: 'Modern applications', slug: 'legacy-modernisation', text: 'Replace operational friction with focused software.' },
  { title: 'AI assistants', slug: 'ai-chatbot', text: 'Make approved knowledge easier to find and use.' },
  { title: 'Training & adoption', slug: 'chatgpt-training-for-teams', text: 'Give teams the skills and standards to work safely.' },
];

const process = [
  ['01', 'Find', 'Locate the costly friction.'],
  ['02', 'Design', 'Define the smallest useful system.'],
  ['03', 'Build', 'Ship, test and improve.'],
  ['04', 'Scale', 'Embed what proves its value.'],
];

function HeroImage() {
  const common = { alt: '', sizes: '100vw' };
  const { props: { srcSet: desktop } } = getImageProps({ ...common, width: 1672, height: 941, src: '/images/quiet-gears-workshop-hero.webp' });
  const { props: { srcSet: mobile, ...rest } } = getImageProps({ ...common, width: 1122, height: 1402, src: '/images/quiet-gears-workshop-hero-mobile.webp' });
  return <picture className={styles.heroMedia} aria-hidden="true"><source media="(min-width: 801px)" srcSet={desktop} /><source media="(max-width: 800px)" srcSet={mobile} /><img {...rest} className={styles.heroImage} fetchPriority="high" /></picture>;
}

export default function Home() {
  return <>
    <JsonLd data={homeJsonLd} />
    <section className={styles.hero} aria-labelledby="home-title">
      <HeroImage /><div className={styles.heroShade} />
      <div className={styles.heroContent}>
        <span className={styles.eyebrow}>AI advisory + engineering</span>
        <h1 id="home-title">Put AI to work.<br /><em>Keep moving.</em></h1>
        <p>We find operational friction and build focused AI systems for ambitious UK SMEs.</p>
        <div className={styles.actions}>
          <Link className={styles.primaryAction} href="/contact">Start a conversation <ArrowRight size={17} /></Link>
          <Link className={styles.textAction} href="/case-studies">See our work <ArrowUpRight size={16} /></Link>
        </div>
      </div>
    </section>

    <section className={styles.services} id="services" aria-labelledby="services-title">
      <div className={styles.sectionIntro}>
        <span className={styles.eyebrow}>What we do</span>
        <h2 id="services-title">From decision<br /><em>to delivery.</em></h2>
        <p>Senior advice and hands-on engineering, in one team.</p>
      </div>
      <div className={styles.serviceGrid}>
        {services.map((service, index) => <Link href={`/services/${service.slug}`} className={styles.service} key={service.slug}>
          <span>{String(index + 1).padStart(2, '0')}</span><div><h3>{service.title}</h3><p>{service.text}</p></div><ArrowUpRight size={17} aria-hidden="true" />
        </Link>)}
      </div>
      <Link className={styles.inlineLink} href="/services">All services <ArrowRight size={16} /></Link>
    </section>

    <section className={styles.process} aria-labelledby="process-title">
      <div className={styles.processIntro}><span className={styles.eyebrow}>How we work</span><h2 id="process-title">One clear path.</h2></div>
      <div className={styles.processGrid}>{process.map(([number, title, detail]) => <article key={number}><span>{number}</span><h3>{title}</h3><p>{detail}</p></article>)}</div>
    </section>

    <section className={styles.cta} aria-labelledby="cta-title">
      <div><span className={styles.eyebrow}>Have a project in mind?</span><h2 id="cta-title">Let’s make the work flow.</h2></div>
      <Link className={styles.primaryAction} href="/contact">Book a free consultation <ArrowRight size={17} /></Link>
    </section>
  </>;
}
