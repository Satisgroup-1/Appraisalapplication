import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
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

/* Three questions, three answers. The point of the section is that most
   enquiries arrive as one of these, and the reader should recognise theirs. */
const routes = [
  {
    question: '“We think AI could help, but we cannot tell where.”',
    answer:
      'The problem here is diagnostic before it is technical. The work starts by measuring where effort actually goes, which usually contradicts the process map and occasionally contradicts the executive team. It ends with a ranked list of candidates and an honest note on the ones not worth doing.',
    service: 'Strategy and readiness',
    slug: 'ai-strategy',
  },
  {
    question: '“We know what we want built, and we need it to survive contact with the business.”',
    answer:
      'The risk here is rarely the model. It is integration with systems that were not designed to be integrated with, and an operating model that does not yet exist. We build in stages so the first release is defensible on its own, and we instrument it so its value can be argued for later.',
    service: 'Custom AI systems',
    slug: 'ai-implementation',
  },
  {
    question: '“We bought the tools and nothing changed.”',
    answer:
      'Licences are not adoption. When usage stalls it is usually because the tool sits beside the work and not inside it, and because nobody has been given permission to change how the work is done. That is an operating-model problem, and it is fixable without buying anything else.',
    service: 'AI adoption and operating model',
    slug: 'enterprise-ai',
  },
];

export default function ServicesPage() {
  return (
    <>
      <section className="page-hero container">
        <span className="kicker">Services</span>
        <h1>Ten services, three kinds of work.</h1>
        <p className="lede">
          We advise, we build, and we embed what we build in how a team already works. The
          three carry different risks, which is why we separate them: advice can be wrong on
          paper, a build can be wrong in production, and an adoption programme can be wrong
          for a year before anybody notices.
        </p>
      </section>

      <section className="section container" aria-labelledby="directory-title">
        <h2 id="directory-title" className="sr-only">
          Service directory
        </h2>
        <ServiceDirectory services={services} />
      </section>

      <section className="section section-surface" aria-labelledby="routes-title">
        <div className="container">
          <div className="page-head">
            <div>
              <span className="kicker">Where people start</span>
              <h2 id="routes-title">Most enquiries arrive as one of three sentences.</h2>
            </div>
            <p className="lede">
              If one of these is close to yours, the linked service is the usual first
              project. It is rarely the only one.
            </p>
          </div>

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
            <h2>Start with the problem.</h2>
            <p>
              Describe the problem and we will tell you which kind of work it is, including
              when the answer is that it is not ours.
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
