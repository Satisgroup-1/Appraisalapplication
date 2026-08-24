import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { cases } from '@/lib/content';
import styles from './case-studies.module.css';
import { createPageMetadata } from '@/lib/seo';

export const metadata = createPageMetadata({
  title: 'Work',
  description:
    'Engagement accounts: the operating problem, the reasoning behind the design, the controls, and the measures each piece of work is judged against.',
  path: '/case-studies',
});

const caseImagery: Record<string, string> = {
  'yacht-operations': '/images/cases/yacht-operations.webp',
  'cold-chain': '/images/cases/cold-chain.webp',
  'property-pipeline': '/images/cases/property-pipeline.webp',
  'professional-services-intake': '/images/cases/professional-services-intake.webp',
  'field-service-planning': '/images/cases/field-service-planning.webp',
};

export default function Cases() {
  return (
    <>
      <section className="page-hero container">
        <span className="kicker">Work</span>
        <h1>Engagement accounts, written as decision papers.</h1>
        <p className="lede">
          Each one sets out the situation as we found it, the design and the alternatives
          rejected, the control model, and the measures the work is judged against. Clients
          are unnamed where they asked to be. They are longer than a case study usually is,
          because the reasoning is the part worth reading.
        </p>
      </section>

      <section className="section container" aria-labelledby="selected-work-title">
        <h2 id="selected-work-title" className="sr-only">
          Selected work
        </h2>

        <div className={styles.list}>
          {cases.map((study, index) => (
            <Link href={`/case-studies/${study.slug}`} className={styles.item} key={study.slug}>
              <div className={styles.visual}>
                <Image
                  src={caseImagery[study.slug] ?? study.image}
                  alt=""
                  fill
                  sizes="(max-width: 900px) 100vw, 40vw"
                  className={styles.image}
                />
              </div>
              <div className={styles.copy}>
                <span className={styles.meta}>
                  <span className={styles.num}>{String(index + 1).padStart(2, '0')}</span>
                  {study.sector}
                </span>
                <h3>{study.title}</h3>
                <p>{study.summary}</p>
                <span className="text-link">
                  Read the engagement <ArrowRight size={15} aria-hidden="true" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="contact-band">
        <div className="container inner">
          <div>
            <span className="kicker">Enquiries</span>
            <h2>The shape of the problem travels between sectors.</h2>
            <p>
              If one of these accounts reads like your operation, the first conversation
              can start from there. The sector matters less than the shape of the
              coordination that is failing.
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
