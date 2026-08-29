import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { GroundBand } from '@/components/GroundBand';
import { ServiceDirectory } from '@/components/ServiceDirectory';
import { services } from '@/lib/services';
import { createPageMetadata } from '@/lib/seo';
import styles from './services.module.css';

export const metadata: Metadata = createPageMetadata({
  title: 'Services',
  description:
    'Advisory, engineering and adoption services for UK companies putting AI into operational use: strategy and readiness, custom systems, automation, secure deployment and training.',
  path: '/services',
});

/* Three sentences an enquiry usually arrives as, each pointing at the service
   that answers it. The answers ran to a short essay apiece; they now run to a
   sentence, because the detail belongs on the service page they link to and
   was being written twice. */
const routes = [
  {
    question: '“We think AI could help, but we cannot tell where.”',
    answer:
      'A diagnostic problem before a technical one. The work measures where effort goes, which usually contradicts the process map.',
    service: 'Strategy and readiness',
    slug: 'ai-strategy',
  },
  {
    question: '“We know what we want built, and we need it to survive contact with the business.”',
    answer:
      'The risk is integration with systems never designed to be integrated with, and an operating model that does not yet exist.',
    service: 'Custom AI systems',
    slug: 'ai-implementation',
  },
  {
    question: '“We bought the tools and nothing changed.”',
    answer:
      'Licences are not adoption. Usage stalls when the tool sits beside the work, and that is fixable without buying anything else.',
    service: 'AI adoption and operating model',
    slug: 'enterprise-ai',
  },
];

export default function ServicesPage() {
  return (
    <>
      <section className="page-hero page-hero-index container">
        <span className="kicker">{services.length} services</span>
        <h1>Services</h1>
        <p className="lede">
          Advice, delivery, and embedding what gets delivered in how a team already works.
        </p>
      </section>

      <section className="section container" aria-labelledby="directory-title">
        <h2 id="directory-title" className="sr-only">
          Service directory
        </h2>
        <ServiceDirectory services={services} />
      </section>

      <GroundBand ground="services" plate="Services" />

      <section className="section section-surface" aria-labelledby="routes-title">
        <div className="container">
          <span className="kicker">Starting points</span>
          <h2 id="routes-title">Most enquiries arrive as one of three sentences.</h2>

          <div className={styles.routes}>
            {routes.map((route) => (
              <article className={styles.route} key={route.slug}>
                <h3>{route.question}</h3>
                <p>{route.answer}</p>
                <Link className="text-link" href={`/services/${route.slug}`}>
                  {route.service} <ArrowRight size={15} aria-hidden="true" />
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="contact-band">
        <div className="container inner">
          <div>
            <span className="kicker">Enquiries</span>
            <h2>Assessment precedes proposal.</h2>
          </div>
          <Link className="button" href="/contact">
            Start an enquiry <ArrowRight size={17} aria-hidden="true" />
          </Link>
        </div>
      </section>
    </>
  );
}
