import type { CSSProperties } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, ShieldCheck } from 'lucide-react';
import { IndustrySignal } from '@/components/IndustrySignal';
import { PrecisionLabel } from '@/components/PrecisionLabel';
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
    title: `${industry.name} AI consulting`,
    description: industry.lead,
    path: `/industries/${industry.slug}`,
    image: null,
  });
}

export default async function IndustryDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const industry = getIndustry(slug);
  if (!industry) notFound();
  const index = industries.findIndex((item) => item.slug === industry.slug);
  const next = industries[(index + 1) % industries.length];
  const recommendedServices = getIndustryServiceRecommendations(industry.slug).flatMap((recommendation) => {
    const service = getService(recommendation.slug);
    return service ? [{ ...recommendation, service }] : [];
  });
  const style = { '--industry-accent': industry.accent } as CSSProperties;

  return (
    <>
      <article className={`industry-detail industry-layout-${index % 4} motif-${industry.motif} ${styles.corporateDetail}`} style={style}>
        <section className="industry-hero">
          <div className="industry-hero-copy">
            <Link className="back" href="/industries"><ArrowLeft size={16}/> All industries</Link>
            <PrecisionLabel index={String(index + 1).padStart(2, '0')} label={industry.family} detail={industry.eyebrow} />
            <h1>{industry.name}</h1>
            <h2>{industry.headline}</h2>
            <p>{industry.lead}</p>
          </div>
          <div className="industry-hero-plate" aria-hidden="true">
            <span>{String(index + 1).padStart(2, '0')}</span>
            <i/><i/><i/>
            <b>OPERATING<br/>CONTEXT</b>
          </div>
        </section>

        <section className="industry-thesis">
          <span>Sector perspective</span>
          <blockquote>{industry.thesis}</blockquote>
        </section>

        <section className="industry-context">
          <div className="industry-section-heading">
            <span>01 / Operating reality</span>
            <h2>{industry.contextTitle}</h2>
          </div>
          <div className="industry-context-copy">
            {industry.context.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </div>
        </section>

        <section className="industry-opportunities">
          <div className="industry-section-heading light">
            <span>02 / Priority use cases</span>
            <h2>{industry.opportunitiesTitle}</h2>
            <p>Each option has a defined operating scope, accountable owner and measurable outcome.</p>
          </div>
          <div className="opportunity-grid">
            {industry.opportunities.map((opportunity, opportunityIndex) => (
              <article key={opportunity.title}>
                <span>{String(opportunityIndex + 1).padStart(2, '0')}</span>
                <h3>{opportunity.title}</h3>
                <p>{opportunity.copy}</p>
                <b>{opportunity.measure}</b>
              </article>
            ))}
          </div>
        </section>

        <section className="industry-signal-section">
          <div className="industry-section-heading">
            <span>03 / Decision model</span>
            <h2>{industry.signalTitle}</h2>
            <p>{industry.signalCopy}</p>
          </div>
          <IndustrySignal name={industry.name} motif={industry.motif} signalLabels={industry.signalLabels}/>
        </section>

        <section className="industry-questions">
          <div className="industry-section-heading">
            <span>04 / Leadership agenda</span>
            <h2>{industry.questionsTitle}</h2>
          </div>
          <ol>
            {industry.questions.map((question, questionIndex) => (
              <li key={question}><span>{String(questionIndex + 1).padStart(2, '0')}</span><p>{question}</p></li>
            ))}
          </ol>
        </section>

        <section className="industry-controls">
          <div className="industry-section-heading light">
            <span>05 / Responsible delivery</span>
            <h2>{industry.controlTitle}</h2>
          </div>
          <div>
            {industry.controls.map((control) => (
              <article key={control.title}>
                <ShieldCheck/>
                <h3>{control.title}</h3>
                <p>{control.copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="industry-roadmap">
          <div className="industry-section-heading">
            <span>06 / Implementation roadmap</span>
            <h2>{industry.roadmapTitle}</h2>
          </div>
          <div className="industry-roadmap-steps">
            {industry.roadmap.map((step, stepIndex) => (
              <article key={step.title}>
                <div><span>{String(stepIndex + 1).padStart(2, '0')}</span><Check size={16}/></div>
                <h3>{step.title}</h3>
                <p>{step.copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="industry-services">
          <div className="industry-section-heading light">
            <span>07 / Recommended services</span>
            <h2>A focused service mix for {industry.name}.</h2>
            <p>These recommendations reflect the sector priorities, operating constraints and control requirements outlined above.</p>
          </div>
          <div className="industry-service-grid">
            {recommendedServices.map(({ service, rationale }, serviceIndex) => (
              <article key={service.slug}>
                <div><span>{String(serviceIndex + 1).padStart(2, '0')}</span><small>{service.group}</small></div>
                <h3>{service.title}</h3>
                <p>{rationale}</p>
                <Link href={`/services/${service.slug}`}>View service details <ArrowUpRight size={15}/></Link>
              </article>
            ))}
          </div>
        </section>

        <section className="industry-close">
          <span>Sector consultation</span>
          <h2>Discuss a practical AI programme for {industry.name}.</h2>
          <p>We will help define the priority, operating constraints and most appropriate delivery route.</p>
          <Link className="button lime" href={`/contact?industry=${encodeURIComponent(industry.name)}`}>Discuss your requirements <ArrowRight size={17}/></Link>
        </section>

        <Link className="industry-next" href={`/industries/${next.slug}`}>
          <span>Next industry</span>
          <strong>{next.name}</strong>
          <ArrowRight/>
        </Link>
      </article>
    </>
  );
}
