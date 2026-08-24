import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { SectionNav } from '@/components/SectionNav';
import { getIndustry, industries } from '@/lib/industries';
import { getIndustryServiceRecommendations } from '@/lib/industry-services';
import { getService } from '@/lib/services';
import { createPageMetadata } from '@/lib/seo';
import styles from './industry-detail.module.css';

export function generateStaticParams() {
  return industries.map((industry) => ({ slug: industry.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const industry = getIndustry(slug);
  if (!industry) return {};
  return createPageMetadata({
    title: `${industry.name}`,
    description: industry.lead,
    path: `/industries/${industry.slug}`,
    image: null,
  });
}

const sections = [
  { id: 'context', label: 'Operating reality' },
  { id: 'opportunities', label: 'Where the value is' },
  { id: 'decisions', label: 'Decisions to take' },
  { id: 'controls', label: 'Controls' },
  { id: 'roadmap', label: 'Sequence' },
  { id: 'services', label: 'Relevant services' },
];

export default async function IndustryDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const industry = getIndustry(slug);
  if (!industry) notFound();

  const index = industries.findIndex((item) => item.slug === industry.slug);
  const next = industries[(index + 1) % industries.length];
  const recommendedServices = getIndustryServiceRecommendations(industry.slug).flatMap(
    (recommendation) => {
      const service = getService(recommendation.slug);
      return service ? [{ ...recommendation, service }] : [];
    },
  );

  return (
    <article>
      <header className="page-hero container">
        <Link className="back" href="/industries">
          <ArrowLeft size={15} aria-hidden="true" /> All industries
        </Link>
        <span className="kicker">
          {industry.family} · {industry.eyebrow}
        </span>
        <h1>{industry.name}</h1>
        <p className="lede">{industry.headline}</p>
        <p className={styles.lead}>{industry.lead}</p>
      </header>

      <div className={`container ${styles.body}`}>
        <SectionNav sections={sections} />

        <div className={styles.content}>
          <section className={styles.thesis} aria-label="Sector view">
            <span className="kicker">Our view</span>
            <blockquote>{industry.thesis}</blockquote>
          </section>

          <section id="context" className={styles.section}>
            <span className={styles.sectionNum}>01</span>
            <h2>{industry.contextTitle}</h2>
            <div className="prose">
              {industry.context.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </section>

          <section id="opportunities" className={styles.section}>
            <span className={styles.sectionNum}>02</span>
            <h2>{industry.opportunitiesTitle}</h2>
            <p className={styles.sectionLede}>
              Each has a defined scope, a named owner and a measure that would show it
              working. An opportunity without the third is a hypothesis.
            </p>
            <div className={styles.opportunities}>
              {industry.opportunities.map((opportunity, opportunityIndex) => (
                <article key={opportunity.title}>
                  <span>{String(opportunityIndex + 1).padStart(2, '0')}</span>
                  <h3>{opportunity.title}</h3>
                  <p>{opportunity.copy}</p>
                  <div className={styles.measure}>
                    <span className="fact-label">Measure</span>
                    {opportunity.measure.replace(/^Measure:\s*/i, '')}
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section id="decisions" className={styles.section}>
            <span className={styles.sectionNum}>03</span>
            <h2>{industry.decisionsTitle}</h2>
            <ol className={styles.decisions}>
              {industry.decisions.map((decision, decisionIndex) => (
                <li key={decision}>
                  <span>{String(decisionIndex + 1).padStart(2, '0')}</span>
                  <p>{decision}</p>
                </li>
              ))}
            </ol>
          </section>

          <section id="controls" className={styles.section}>
            <span className={styles.sectionNum}>04</span>
            <h2>{industry.controlTitle}</h2>
            <div className={styles.controls}>
              {industry.controls.map((control) => (
                <article key={control.title}>
                  <h3>{control.title}</h3>
                  <p>{control.copy}</p>
                </article>
              ))}
            </div>
          </section>

          <section id="roadmap" className={styles.section}>
            <span className={styles.sectionNum}>05</span>
            <h2>{industry.roadmapTitle}</h2>
            <ol className={styles.roadmap}>
              {industry.roadmap.map((step, stepIndex) => (
                <li key={step.title}>
                  <span>{String(stepIndex + 1).padStart(2, '0')}</span>
                  <div>
                    <h3>{step.title}</h3>
                    <p>{step.copy}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section id="services" className={styles.section}>
            <span className={styles.sectionNum}>06</span>
            <h2>Where we would usually start in {industry.name.toLowerCase()}.</h2>
            <p className={styles.sectionLede}>
              A first engagement here normally draws on these. The reasoning matters more
              than the label: if it does not match your situation, the label is wrong.
            </p>
            <div className={styles.services}>
              {recommendedServices.map(({ service, rationale }) => (
                <article key={service.slug}>
                  <span className="fact-label">{service.group}</span>
                  <h3>{service.title}</h3>
                  <p>{rationale}</p>
                  <Link className="text-link" href={`/services/${service.slug}`}>
                    Read the service <ArrowRight size={15} aria-hidden="true" />
                  </Link>
                </article>
              ))}
            </div>
          </section>

          <p className={styles.closing}>{industry.closing}</p>
        </div>
      </div>

      <section className="section-tight container">
        <Link className={styles.next} href={`/industries/${next.slug}`}>
          <span className="kicker">Next sector</span>
          <strong>{next.name}</strong>
          <ArrowRight size={18} aria-hidden="true" />
        </Link>
      </section>

      <section className="contact-band">
        <div className="container inner">
          <div>
            <span className="kicker">Enquiries</span>
            <h2>Sector notes generalise. Yours will differ.</h2>
            <p>
              This page describes the sector in general terms, and your operation will
              depart from it in at least one way that matters. Tell us which, and that is
              where we start.
            </p>
          </div>
          <Link
            className="button"
            href={`/contact?industry=${encodeURIComponent(industry.name)}`}
          >
            Start an enquiry <ArrowRight size={17} aria-hidden="true" />
          </Link>
        </div>
      </section>
    </article>
  );
}
