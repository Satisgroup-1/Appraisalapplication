import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import styles from './home.module.css';
import { GroundBand } from '@/components/GroundBand';
import { JsonLd } from '@/components/JsonLd';
import { articles, cases } from '@/lib/content';
import { services } from '@/lib/services';
import { absoluteUrl, createPageMetadata, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from '@/lib/seo';

export const metadata: Metadata = createPageMetadata({
  title: 'AI Consulting & Engineering',
  description: SITE_DESCRIPTION,
  path: '/',
});

const homeJsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: SITE_URL,
    email: 'enquiries@quietgears.xyz',
    description: SITE_DESCRIPTION,
    image: absoluteUrl('/og.png'),
    address: { '@type': 'PostalAddress', addressLocality: 'London', addressCountry: 'GB' },
    areaServed: { '@type': 'Country', name: 'United Kingdom' },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    name: SITE_NAME,
    url: SITE_URL,
    publisher: { '@id': `${SITE_URL}/#organization` },
  },
];

/* The firm's position, stated as three arguments and not three adjectives.
   Each ran to two paragraphs and now runs to one: the second paragraph in each
   case restated the first at greater length, which is the habit this pass is
   removing. The clause that costs us something is kept, because it is the only
   part a competitor would not also print. */
const positions = [
  {
    claim: 'The model is rarely the constraint.',
    body: 'Frontier models are now good enough for most of the work an SME would put to them. A system holds up or fails on the process around it: whether the data it reads is current, whether the hand-offs between people are defined, and whether somebody owns the exception when the answer is wrong. Model selection comes later and matters less than most people expect.',
  },
  {
    claim: 'A system the client cannot run is not a result.',
    body: 'A pilot that depends on its builders is a liability dressed as progress. It works while attention is on it and decays once the original team has moved on and nobody remembers which threshold was set by hand. The handover is designed for from the start, which costs time in the build and is the reason the work survives us.',
  },
  {
    claim: 'Automation has to be argued for.',
    body: 'The case for automating a task is an empirical claim, and it is usually made without evidence. Multiplying estimated minutes by a salary rate produces a number and falls short of a business case. The baseline comes before the build, and we say so when the evidence does not support the work.',
  },
];

const featuredCases = cases.slice(0, 3);
const featuredArticles = articles.slice(0, 3);
const featuredServices = services.slice(0, 6);

export default function Home() {
  return (
    <>
      <JsonLd data={homeJsonLd} />

      <section className={`${styles.hero} section-dark`} aria-labelledby="home-title">
        <div className="container">
          <span className={styles.heroKicker}>London · working UK-wide</span>
          <h1 id="home-title">AI Consulting &amp; Engineering</h1>
          <p className={styles.heroLede}>
            For UK companies that have decided AI matters to them and now need a clear
            account of where it pays, what it costs to run, and who owns it once the
            engagement ends.
          </p>
          <div className={styles.heroActions}>
            <Link className="button" href="/contact">
              Discuss a project <ArrowRight size={17} aria-hidden="true" />
            </Link>
            <Link className="button light" href="/services">
              Our services
            </Link>
          </div>
        </div>
      </section>

      <section className="section container" aria-labelledby="position-title">
        <span className="kicker">Our position</span>
        <h2 id="position-title">Three things clients hear early.</h2>

        <div className={styles.positions}>
          {positions.map((position, index) => (
            <article className={styles.position} key={position.claim}>
              <span className={styles.positionNum}>{String(index + 1).padStart(2, '0')}</span>
              <h3>{position.claim}</h3>
              <p>{position.body}</p>
            </article>
          ))}
        </div>
      </section>

      <GroundBand ground="home" plate="Quiet Gears" />

      <section className="section section-surface" aria-labelledby="services-title">
        <div className="container">
          <span className="kicker">Services</span>
          <h2 id="services-title">The advice and the building, in one place.</h2>

          <div className="index-list">
            {featuredServices.map((service, index) => (
              <Link className="index-item" href={`/services/${service.slug}`} key={service.slug}>
                <span className="index-num">{String(index + 1).padStart(2, '0')}</span>
                <div>
                  <h3>{service.shortTitle}</h3>
                  <p>{service.summary}</p>
                </div>
                <ArrowRight size={17} aria-hidden="true" className={styles.itemArrow} />
              </Link>
            ))}
          </div>

          <p className={styles.listFoot}>
            <Link className="text-link" href="/services">
              All {services.length} services <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </p>
        </div>
      </section>

      <section className="section container" aria-labelledby="work-title">
        <span className="kicker">Projects</span>
        <h2 id="work-title">Three projects from the work.</h2>

        <div className={styles.cardGrid}>
          {featuredCases.map((item) => (
            <Link className={styles.card} href={`/case-studies/${item.slug}`} key={item.slug}>
              <span className={styles.cardMeta}>{item.sector}</span>
              <h3>{item.title}</h3>
              <p>{item.summary}</p>
              <span className="text-link">
                Read the project <ArrowRight size={15} aria-hidden="true" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="section section-surface" aria-labelledby="insight-title">
        <div className="container">
          <span className="kicker">Insights</span>
          <h2 id="insight-title">Recent writing.</h2>

          <div className={styles.cardGrid}>
            {featuredArticles.map((item) => (
              <Link className={styles.card} href={`/news/${item.slug}`} key={item.slug}>
                <span className={styles.cardMeta}>
                  {item.tag} · {item.date}
                </span>
                <h3>{item.title}</h3>
                <p>{item.intro}</p>
                <span className="text-link">
                  Read <ArrowRight size={15} aria-hidden="true" />
                </span>
              </Link>
            ))}
          </div>

          <p className={styles.listFoot}>
            <Link className="text-link" href="/news">
              All insights <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </p>
        </div>
      </section>

      <section className={styles.contact} aria-labelledby="contact-title">
        <div className="container">
          <div>
            <span className="kicker">Enquiries</span>
            <h2 id="contact-title">The first conversation is diagnostic.</h2>
          </div>
          <Link className="button" href="/contact">
            Start an enquiry <ArrowRight size={17} aria-hidden="true" />
          </Link>
        </div>
      </section>
    </>
  );
}
