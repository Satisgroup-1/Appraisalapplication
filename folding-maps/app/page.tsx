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
      'So the first weeks of an engagement go on the workflow, not on model selection. It is the least interesting part of the work and the most reliable source of value in it.',
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
    claim: 'Automation should be argued for, not assumed.',
    body: [
      'The case for automating a task is an empirical claim, and it is usually made without evidence. Multiplying estimated minutes by a salary rate produces a number, not a business case, because the minutes saved are rarely contiguous and the quality cost is rarely counted.',
      'We baseline before we build, and we say so when the evidence does not support the work. Declining a project is cheaper for both sides than delivering one that cannot be defended at the next budget review.',
    ],
  },
];

/* Four stages. Each says what actually happens and what ends it, because a
   process diagram without an exit condition is decoration. */
const method = [
  {
    number: '01',
    title: 'Diagnose',
    detail:
      'We follow the work as it is actually done: the hand-offs, the exceptions, the spreadsheet nobody mentions in the process map. The output is a written account of where effort goes, and how much of it is judgement as opposed to administration.',
    ends: 'Ends with a baseline both sides accept.',
  },
  {
    number: '02',
    title: 'Scope',
    detail:
      'We define the smallest system that would settle the question, with the controls and data access it needs. Where a requirement rests on an assumption about the business, we put the assumption in writing and do not build on it silently.',
    ends: 'Ends with a fixed scope and a stated success test.',
  },
  {
    number: '03',
    title: 'Build',
    detail:
      'Delivery is staged so the first release is useful on its own. We instrument it from the first day, because a system nobody is measuring cannot be defended later, and we keep humans on the decisions that carry commercial or regulatory weight.',
    ends: 'Ends when the success test passes, or when it demonstrably will not.',
  },
  {
    number: '04',
    title: 'Hand over',
    detail:
      'Your team takes ownership: the documentation, the tests, the operating model and the account of what we chose not to do. We stay available, but the arrangement is designed so that you do not need us.',
    ends: 'Ends with your team running it without us.',
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
          <h1 id="home-title">Independent AI advice, and the engineering to act on it.</h1>
          <p className={styles.heroLede}>
            We work with UK companies that have decided AI matters to them and now need a
            clear account of where it pays, what it costs to run, and who owns it once we
            leave.
          </p>
          <div className={styles.heroActions}>
            <Link className="button" href="/contact">
              Discuss an engagement <ArrowRight size={17} aria-hidden="true" />
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
                <dd>Advice and delivery in one team, not a strategy deck and a referral</dd>
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
            <h2 id="position-title">Three things we think are true, and act on.</h2>
          </div>
          <p className="lede">
            Every firm in this market says it is practical and outcome-led. That is not a
            position, it is a reflex. These are the arguments we would defend in front of
            your board, including the parts that cost us work.
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
              <h2 id="services-title">Advisory and engineering, under one accountability.</h2>
            </div>
            <p className="lede">
              The split between the firm that recommends and the firm that builds is where
              most AI programmes lose their thread. We do both, so the advice has to survive
              being implemented.
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

      <section className="section section-dark" aria-labelledby="method-title">
        <div className="container">
          <div className="page-head">
            <div>
              <span className="kicker">How we work</span>
              <h2 id="method-title">Four stages, each with a condition that ends it.</h2>
            </div>
            <p className="lede">
              A stage that cannot fail is not a stage. Each of ours has an exit test agreed
              in advance, which is what makes it possible to stop the work early when the
              evidence says we should.
            </p>
          </div>

          <ol className={styles.method}>
            {method.map((stage) => (
              <li key={stage.number}>
                <span className={styles.methodNum}>{stage.number}</span>
                <h3>{stage.title}</h3>
                <p>{stage.detail}</p>
                <span className={styles.methodEnds}>{stage.ends}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section container" aria-labelledby="work-title">
        <div className="page-head">
          <div>
            <span className="kicker">Selected work</span>
            <h2 id="work-title">Engagements, and what they turned on.</h2>
          </div>
          <p className="lede">
            Each account states the situation we found, the reasoning behind the design, and
            the measures the work is being judged against.
          </p>
        </div>

        <div className={styles.cardGrid}>
          {featuredCases.map((item) => (
            <Link className={styles.card} href={`/case-studies/${item.slug}`} key={item.slug}>
              <span className={styles.cardMeta}>{item.sector}</span>
              <h3>{item.title}</h3>
              <p>{item.summary}</p>
              <span className="text-link">
                Read the engagement <ArrowRight size={15} aria-hidden="true" />
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
              <h2 id="insight-title">What we are arguing about in public.</h2>
            </div>
            <p className="lede">
              Published thinking is how a firm this size proves it can reason about a
              problem before it is paid to. Each piece carries its sources.
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
              A first conversation is diagnostic, not a pitch. If the problem does not need
              us, we will say so and tell you what we would do instead.
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
