import Link from 'next/link';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { industries, industryFamilies } from '@/lib/industries';
import styles from './industries-index.module.css';
import { createPageMetadata } from '@/lib/seo';

export const metadata = createPageMetadata({
  title: 'Industries',
  description: 'Practical AI integration for ambitious SMEs across 26 industries.',
  path: '/industries',
});

export default function IndustriesPage() {
  return <>
    <section className={styles.hero}>
      <div><span className={styles.eyebrow}>Industries</span><h1>AI shaped around<br /><em>how your sector works.</em></h1></div>
      <div className={styles.heroAside}>
        <p>Sector-aware systems for established SMEs, built around real operating decisions and controls.</p>
        <a className={styles.textAction} href="#industry-directory">Browse industries <ArrowRight size={16} /></a>
      </div>
    </section>

    <section id="industry-directory" className={styles.directory} aria-labelledby="industries-title">
      <div className={styles.directoryHeading}>
        <span className={styles.eyebrow}>Sector expertise</span><h2 id="industries-title">Find your industry.</h2><span>{industries.length} perspectives</span>
      </div>
      {industryFamilies.map((family) => {
        const familyIndustries = industries.filter((industry) => industry.family === family);
        return <section className={styles.family} key={family}>
          <div className={styles.familyHeading}><h3>{family}</h3><span>{familyIndustries.length}</span></div>
          <div className={styles.industryGrid}>
            {familyIndustries.map((industry) => <Link href={`/industries/${industry.slug}`} key={industry.slug}>
              <div><small>{industry.eyebrow}</small><h4>{industry.name}</h4></div><ArrowUpRight size={16} aria-hidden="true" />
            </Link>)}
          </div>
        </section>;
      })}
    </section>

    <section className={styles.cta}>
      <div><span className={styles.eyebrow}>Have a sector challenge?</span><h2>Start with the operating problem.</h2></div>
      <Link className={styles.primaryAction} href="/contact">Start a conversation <ArrowRight size={17} /></Link>
    </section>
  </>;
}
