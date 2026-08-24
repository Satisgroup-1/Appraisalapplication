import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, permanentRedirect } from 'next/navigation';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { getService, serviceAliases, services } from '@/lib/services';
import { createPageMetadata } from '@/lib/seo';
import styles from './service-detail.module.css';

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return [
    ...services.map(({ slug }) => ({ slug })),
    ...Object.keys(serviceAliases).map((slug) => ({ slug })),
  ];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const service = getService(serviceAliases[slug] ?? slug);
  if (!service) return {};
  return createPageMetadata({
    title: service.title,
    description: service.summary,
    path: `/services/${service.slug}`,
    image: null,
  });
}

export default async function ServiceDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const canonicalSlug = serviceAliases[slug];
  if (canonicalSlug) permanentRedirect(`/services/${canonicalSlug}`);
  const service = getService(slug);
  if (!service) notFound();

  const currentIndex = services.findIndex((item) => item.slug === service.slug);
  const next = services[(currentIndex + 1) % services.length];

  return (
    <>
      <article>
        <header className="page-hero container">
          <Link className="back" href="/services">
            <ArrowLeft size={15} aria-hidden="true" /> All services
          </Link>
          <span className="kicker">
            {service.group} · Service {service.number}
          </span>
          <h1>{service.title}</h1>
          <p className="lede">{service.promise}</p>
          <div className={styles.heroActions}>
            <Link className="button" href="/contact">
              Discuss this service <ArrowRight size={17} aria-hidden="true" />
            </Link>
            <a className="button light" href="#stages">
              How the work runs
            </a>
          </div>
        </header>

        <section className="section container" aria-labelledby="what-title">
          <div className="page-head">
            <div>
              <span className="kicker">What this is</span>
              {/* The summary is a sentence, not a headline: setting it at display
                  size produced six lines of oversized type. The heading stays for
                  the document outline; the sentence reads as a standfirst. */}
              <h2 id="what-title" className="sr-only">
                What this is
              </h2>
              <p className="lede">{service.summary}</p>
            </div>
            <div>
              <p className={styles.explanation}>{service.explanation}</p>
            </div>
          </div>

          <div className={styles.stack}>
            <span className="fact-label">Typical stack</span>
            <ul className={styles.tags}>
              {service.technologies.map((technology) => (
                <li key={technology}>{technology}</li>
              ))}
            </ul>
            <p className="small">
              Named for transparency, not preference. The right components depend on your
              data, your existing systems and what your team can maintain. Where the honest
              answer is a tool you already own, we will say so.
            </p>
          </div>
        </section>

        <section className="section section-surface" id="stages" aria-labelledby="stages-title">
          <div className="container">
            <div className="page-head">
              <div>
                <span className="kicker">How the work runs</span>
                <h2 id="stages-title">The stages, and what each one produces.</h2>
              </div>
              <p className="lede">
                Each stage ends in something you can read and challenge. Nothing moves to
                the next stage on the strength of a conversation alone.
              </p>
            </div>

            <ol className={styles.stages}>
              {service.stages.map((stage, index) => (
                <li key={stage.label}>
                  <span className={styles.stageNum}>{String(index + 1).padStart(2, '0')}</span>
                  <h3>{stage.label}</h3>
                  <p>{stage.detail}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="section container" aria-labelledby="cases-title">
          <div className="page-head">
            <div>
              <span className="kicker">Applied</span>
              <h2 id="cases-title">Where this earns its place.</h2>
            </div>
            <p className="lede">
              Each pattern begins with an operating constraint, not a technology, and keeps a
              traceable route from source information to accountable action.
            </p>
          </div>

          <div className={styles.useCases}>
            {service.useCases.map((useCase, index) => (
              <article key={useCase.title}>
                <span className={styles.useCaseNum}>{String(index + 1).padStart(2, '0')}</span>
                <h3>{useCase.title}</h3>
                <div className={styles.useCaseBody}>
                  <div>
                    <span className="fact-label">The constraint</span>
                    <p>{useCase.problem}</p>
                  </div>
                  <div>
                    <span className="fact-label">In practice</span>
                    <p>{useCase.example}</p>
                  </div>
                </div>
                <ol className={styles.path} aria-label="How the work flows">
                  {useCase.path.map((step, stepIndex) => (
                    <li key={step}>
                      <span>{stepIndex + 1}</span>
                      {step}
                    </li>
                  ))}
                </ol>
              </article>
            ))}
          </div>
        </section>

        <section className="section section-dark" aria-labelledby="scope-title">
          <div className="container">
            <h2 id="scope-title" className="sr-only">
              Scope and controls
            </h2>
            <div className={styles.columns}>
              <div>
                <span className="kicker">What we provide</span>
                <h3>Everything needed to run it, not just to demonstrate it.</h3>
                <ul className={styles.checkList}>
                  {service.provisions.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <span className="kicker">Controls we insist on</span>
                <h3>The parts we will not drop to save time.</h3>
                <ul className={styles.checkList}>
                  {service.safeguards.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <p className={styles.controlNote}>
                  These are conditions of the engagement, not options within it. A
                  system without them is cheaper to build and considerably more expensive to
                  own.
                </p>
              </div>
            </div>
          </div>
        </section>
      </article>

      <section className="section-tight container" aria-labelledby="next-title">
        <div className={styles.next}>
          <div>
            <span className="kicker">Next service</span>
            <h2 id="next-title">{next.title}</h2>
            <p>{next.promise}</p>
          </div>
          <Link className="button light" href={`/services/${next.slug}`}>
            Read it <ArrowRight size={17} aria-hidden="true" />
          </Link>
        </div>
      </section>

      <section className="contact-band">
        <div className="container inner">
          <div>
            <span className="kicker">Enquiries</span>
            <h2>Constraints like this one are where we start.</h2>
            <p>
              Send the situation, not a specification. The first response will tell you what we
              would need to know to scope it properly.
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
