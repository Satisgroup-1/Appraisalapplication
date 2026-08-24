import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, permanentRedirect } from 'next/navigation';
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, CircleDot, Cpu, Database, GitBranch, ShieldCheck } from 'lucide-react';
import { PrecisionLabel } from '@/components/PrecisionLabel';
import { ServiceSystemLab } from '@/components/ServiceSystemLab';
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

  return <>
    <article className={`service-detail-page ${styles.corporateDetail}`}>
      <section className="service-detail-hero">
        <div className="service-detail-copy">
          <Link className="back" href="/services"><ArrowLeft size={15}/> All services</Link>
          <PrecisionLabel index={service.number} label={service.group} detail="Service specification" />
          <h1>{service.title}</h1>
          <p className="service-promise">{service.promise}</p>
          <p>{service.summary}</p>
          <div className="hero-actions"><Link className="button lime" href="/contact">Discuss this service <ArrowRight size={17}/></Link><a className="text-link" href="#system-model">See how it works <ArrowUpRight size={16}/></a></div>
        </div>
        <div className="service-tech-orbit" aria-hidden="true">
          <div className="tech-core"><Cpu/><span>{service.shortTitle}</span></div>
          {service.technologies.map((technology, index) => <div className={`tech-satellite satellite-${index + 1}`} key={technology}><i/><span>{technology}</span></div>)}
          <div className="tech-orbit-line orbit-a"/><div className="tech-orbit-line orbit-b"/>
        </div>
      </section>

      <section className="service-explainer">
        <div><span className="kicker">Technical view</span><h2>How the service<br/><em>functions.</em></h2></div>
        <div><p>{service.explanation}</p><div className="technical-tags">{service.technologies.map((technology) => <span key={technology}>{technology}</span>)}</div></div>
      </section>

      <div id="system-model"><ServiceSystemLab stages={service.stages} useCases={service.useCases}/></div>

      <section className="use-case-section">
        <div className="use-case-heading"><span className="kicker">Use cases</span><h2>Where the system<br/><em>earns its place.</em></h2><p>Each pattern starts with a real operating constraint and preserves a clear route from source information to accountable action.</p></div>
        <div className="use-case-grid">{service.useCases.map((useCase, index) => <article key={useCase.title}>
          <div className="use-case-number"><span>0{index + 1}</span><GitBranch/></div>
          <h3>{useCase.title}</h3>
          <div><b>The constraint</b><p>{useCase.problem}</p></div>
          <div><b>Example</b><p>{useCase.example}</p></div>
          <ol>{useCase.path.map((step, stepIndex) => <li key={step}><i>{stepIndex + 1}</i><span>{step}</span>{stepIndex < useCase.path.length - 1 && <ArrowRight size={13}/>}</li>)}</ol>
        </article>)}</div>
      </section>

      <section className="service-provision-section">
        <div className="provision-column"><span className="kicker">What we provide</span><h2>A complete route<br/>to a working result.</h2><ul>{service.provisions.map((item) => <li key={item}><Check/><span>{item}</span></li>)}</ul></div>
        <div className="provision-column safeguard-column"><span className="kicker">Control model</span><h2>Designed to remain<br/>under accountable control.</h2><ul>{service.safeguards.map((item) => <li key={item}><ShieldCheck/><span>{item}</span></li>)}</ul></div>
      </section>

      <section className="technical-blueprint">
        <div className="technical-blueprint-heading"><span className="kicker">Delivery blueprint</span><h2>Four layers.<br/><em>One operating system.</em></h2></div>
        <div className="blueprint-stack">
          <article><span>04</span><CircleDot/><div><b>Experience and action</b><p>User interface, workflow decisions, approvals and system updates.</p></div></article>
          <article><span>03</span><ShieldCheck/><div><b>Control and assurance</b><p>Identity, policy, evaluation, observability and exception ownership.</p></div></article>
          <article><span>02</span><Cpu/><div><b>Reasoning and orchestration</b><p>Models, deterministic rules, tools, state and routing logic.</p></div></article>
          <article><span>01</span><Database/><div><b>Data and integration</b><p>Sources, permissions, retrieval, schemas and business-system interfaces.</p></div></article>
        </div>
      </section>
    </article>

    <section className="next-service"><span>Next service / {next.number}</span><h2>{next.title}</h2><p>{next.promise}</p><Link className="button outline" href={`/services/${next.slug}`}>Explore next service <ArrowRight size={17}/></Link></section>
    <section className="cta-band"><span className="kicker">Start with the work</span><h2>Have a similar constraint?</h2><p>We will help you frame the smallest useful decision or release.</p><Link className="button lime" href="/contact">Start a conversation <ArrowRight size={17}/></Link></section>
  </>;
}
