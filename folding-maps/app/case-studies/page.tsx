import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { PrecisionLabel } from '@/components/PrecisionLabel';
import { ImageStreamHero } from '@/components/ui/image-stream-hero';
import { cases } from '@/lib/content';
import styles from './case-studies.module.css';
import { createPageMetadata } from '@/lib/seo';

export const metadata = createPageMetadata({
  title: 'AI implementation case studies',
  description: 'Decision papers showing how Quiet Gears connects operational problems, control models and delivery architecture for UK SMEs.',
  path: '/case-studies',
});

const caseImagery: Record<string, string> = {
  'yacht-operations': '/images/cases/yacht-operations.webp',
  'cold-chain': '/images/cases/cold-chain.webp',
  'property-pipeline': '/images/cases/property-pipeline.webp',
  'professional-services-intake': '/images/cases/professional-services-intake.webp',
  'field-service-planning': '/images/cases/field-service-planning.webp',
};

const streamImages = cases.map((study) => ({
  src: caseImagery[study.slug] ?? study.image,
  alt: study.title,
}));

export default function Cases() {
  return (
    <>
      <ImageStreamHero
        images={streamImages}
        cards={10}
        speed={20}
        axis={57}
        className={styles.hero}
      >
        <div className={styles.heroContent}>
          <div className={styles.heroLead}>
            <PrecisionLabel index="QG–CS" label="Case studies" detail="Operational evidence / controlled delivery" />
            <h1>From operational friction<br/><em>to working systems.</em></h1>
          </div>
          <p className={styles.heroSummary}>Engagement papers that connect the operating problem, control model and delivery architecture. Illustrative work and in-progress outcomes are labelled clearly.</p>
        </div>
      </ImageStreamHero>
      <section className={styles.collection} aria-labelledby="selected-work-title">
        <div className={styles.collectionHeading}>
          <PrecisionLabel index="01–05" label="Selected work" />
          <h2 id="selected-work-title">Evidence, architecture<br/><em>and accountable delivery.</em></h2>
          <p>Each study is structured as a decision paper: situation, design response, control position and the evidence required before expansion.</p>
        </div>
        {cases.map((study, index) => (
          <Link href={`/case-studies/${study.slug}`} className={styles.caseStudy} key={study.slug}>
            <div className={styles.caseVisual}>
              <Image
                src={caseImagery[study.slug] ?? study.image}
                alt=""
                fill
                sizes="(max-width: 800px) 100vw, 58vw"
                className={styles.caseImage}
              />
              <span className={styles.caseIndex}>{String(index + 1).padStart(2, '0')}</span>
            </div>
            <div className={styles.caseCopy}>
              <PrecisionLabel index={study.status === 'Illustrative' ? 'CONCEPT' : 'ACTIVE'} label={study.sector} />
              <h3>{study.title}</h3>
              <p>{study.summary}</p>
              <span className={styles.caseAction}>Read the decision paper <ArrowUpRight size={16}/></span>
            </div>
          </Link>
        ))}
      </section>
    </>
  );
}
