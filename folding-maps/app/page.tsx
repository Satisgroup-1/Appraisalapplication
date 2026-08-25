import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import styles from './home.module.css';
import { JsonLd } from '@/components/JsonLd';
import { articles, cases } from '@/lib/content';
import { services } from '@/lib/services';
import { absoluteUrl, createPageMetadata, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from '@/lib/seo';

export const metadata: Metadata = createPageMetadata({
  title: 'AI advisory and engineering for UK companies',
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
    email: 'quietgearsai@gmail.com',
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
   Each names the claim, the reasoning behind it and what it costs us. */
const positions = [
  {
    claim: 'The model is rarely the constraint.',
    body: [
      'Frontier models are now good enough for most of the work an SME would put to them. What decides whether a system holds up is the process around it: whether the data it reads is current, whether the hand-offs between people are defined, and whether somebody owns the exception when the answer is wrong.',
      'So the first weeks of an engagement go on the workflow. Model selection comes later and matters less than most people expect. It is the least interesting part of the work and the most reliable source of value in it.',
    ],
  },
  {
    claim: 'A system your team cannot run is not a result.',
    body: [
      'A pilot that depends on its builders is a liability dressed as progress. It works while attention is on it and decays quietly afterwards, usually at the point where the original team has moved on and nobody remembers which threshold was set by hand.',
      'We design for the handover from the start: documented decisions, tests that fail loudly, and an operating model naming who maintains what. That costs time in the build and is the reason the work survives us.',
    ],
  },
  {
    claim: 'Automation has to be argued for.',
    body: [
      'The case for automating a task is an empirical claim, and it is usually made without evidence. Multiplying estimated minutes by a salary rate produces a number. It falls short of a business case because the minutes saved are rarely contiguous and the quality cost is rarely counted.',
      'We baseline before we build, and we say so when the evidence does not support the work. Declining a project is cheaper for both sides than delivering one that cannot be defended at the next budget review.',
    ],
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
          <span className={styles.heroKicker}>AI advisory and engineering</span>
          <h1 id="home-title">We advise UK companies on AI, then build what we recommend.</h1>
          <p className={styles.heroLede}>
            We work with UK companies that have decided AI matters to them and now need a
            clear account of where it pays, what it costs to run, and who owns it once we
            leave.
          </p>
          <div className={styles.heroActions}>
            <Link className="button" href="/contact">
              Discuss a project <ArrowRight size={17} aria-hidden="true" />
            </Link>
            <Link className="button light" href="/services">
              What we do
            </Link>
          </div>
        </div>

        <div className={styles.heroFacts}>
          <div className="container">
            <dl>
              <div>
                <dt>Practice</dt>
                <dd>Advice and delivery in one team, so the advice has to survive being built</dd>
              </div>
              <div>
                <dt>Clients</dt>
                <dd>UK small and mid-sized companies, and the operators inside them</dd>
              </div>
              <div>
                <dt>Base</dt>
                <dd>London, working UK-wide</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      <section className="section container" aria-labelledby="position-title">
        <div className="page-head">
          <div>
            <span className="kicker">Our position</span>
            <h2 id="position-title">Three things we tell clients early.</h2>
          </div>
          <p className="lede">
            Every firm in this market calls itself practical and outcome-led, which tells a
            buyer nothing. These three are what we would say in front of your board,
            including the parts that cost us work.
          </p>
        </div>

        <div className={styles.positions}>
          {positions.map((position, index) => (
            <article className={styles.position} key={position.claim}>
              <span className={styles.positionNum}>{String(index + 1).padStart(2, '0')}</span>
              <h3>{position.claim}</h3>
              {position.body.map((paragraph) => (
                <p key={paragraph.slice(0, 40)}>{paragraph}</p>
              ))}
            </article>
          ))}
        </div>
      </section>

      <section className="section section-surface" aria-labelledby="services-title">
        <div className="container">
          <div className="page-head">
            <div>
              <span className="kicker">What we do</span>
              <h2 id="services-title">We do the advice and the building.</h2>
            </div>
            <p className="lede">
              Most AI programmes are advised on by one firm and built by another. That split
              is where they come apart. We do both, so our advice has to survive being
              built.
            </p>
          </div>

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
        <div className="page-head">
          <div>
            <span className="kicker">Projects</span>
            <h2 id="work-title">Three projects we have worked on.</h2>
          </div>
          <p className="lede">
            Each one sets out what the client asked for, what we found when we looked at the
            work, what we built and how it is being measured.
          </p>
        </div>

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
          <div className="page-head">
            <div>
              <span className="kicker">Insights</span>
              <h2 id="insight-title">What we have published.</h2>
            </div>
            <p className="lede">
              Long pieces on AI in UK businesses. Each one takes a position, sets out the
              case against it, and links every figure to where it came from.
            </p>
          </div>

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
            <h2 id="contact-title">Tell us where the work is getting stuck.</h2>
            <p>
              The first conversation is diagnostic. If the problem does not need us, we will
              say so and tell you what we would do instead.
            </p>
          </div>
          <Link className="button" href="/contact">
            Start an enquiry <ArrowRight size={17} aria-hidden="true" />
          </Link>
        </div>
      </section>
    </>
  );
}
