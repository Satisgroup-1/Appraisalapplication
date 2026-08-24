import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { services } from '@/lib/services';
import { createPageMetadata } from '@/lib/seo';
import styles from './services.module.css';

export const metadata: Metadata = createPageMetadata({
  title: 'AI consulting and software services',
  description: 'Advisory, engineering, secure local AI and adoption services for organisations with difficult decisions, sensitive data or work that needs to run better.',
  path: '/services',
});

export default function ServicesPage() {
  return <>
    <section className={styles.hero}>
      <div><span className={styles.eyebrow}>Services</span><h1>From decision<br /><em>to delivery.</em></h1></div>
      <div className={styles.heroAside}>
        <p>Senior advice and hands-on engineering for AI systems your team can own.</p>
        <Link className={styles.primaryAction} href="/contact">Discuss a project <ArrowRight size={17} /></Link>
      </div>
    </section>

    <section className={styles.directory} aria-labelledby="services-title">
      <div className={styles.directoryHeading}>
        <span className={styles.eyebrow}>Capabilities</span><h2 id="services-title">Choose where to start.</h2><span>{services.length} services</span>
      </div>
      <div className={styles.serviceGrid}>
        {services.map((service) => <Link href={`/services/${service.slug}`} className={styles.service} key={service.slug}>
          <span className={styles.number}>{service.number}</span>
          <div><small>{service.group}</small><h3>{service.title}</h3><p>{service.summary}</p></div>
          <ArrowUpRight size={17} aria-hidden="true" />
        </Link>)}
      </div>
    </section>

    <section className={styles.cta}>
      <div><span className={styles.eyebrow}>Not sure where to start?</span><h2>Show us where the work catches.</h2></div>
      <Link className={styles.primaryAction} href="/contact">Start a conversation <ArrowRight size={17} /></Link>
    </section>
  </>;
}
