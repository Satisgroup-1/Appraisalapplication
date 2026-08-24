import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { PrecisionLabel } from '@/components/PrecisionLabel';
import { articles } from '@/lib/content';
import { newsEditorial } from '@/lib/newsEditorial';
import styles from './news.module.css';
import { createPageMetadata } from '@/lib/seo';

export const metadata = createPageMetadata({
  title: 'AI news and analysis for UK business leaders',
  description: 'Evidence-led analysis for leaders navigating AI, automation, governance and operating-model change.',
  path: '/news',
});

export default function News() {
  return (
    <>
      <section className="page-hero report-hero insight-hero report-hero-layout">
        <div className="report-hero-copy"><PrecisionLabel index="QG–RS" label="News and analysis" detail="Evidence / argument / decision" />
          <h1>Evidence for better<br/><em>technology decisions.</em></h1>
          <p>Evidence-led analysis for leaders navigating AI, automation and operating-model change. Each report develops a clear argument, tests the downside and preserves the route to its underlying sources.</p>
        </div>
        <div className={styles.researchPlate} aria-hidden="true"><i/><i/><i/><span>QG / RESEARCH DATUM</span></div>
      </section>
      <section className={styles.journal} aria-labelledby="latest-analysis-title">
        <div className={styles.journalHeading}>
          <PrecisionLabel index="01–08" label="Latest analysis" />
          <h2 id="latest-analysis-title">Research that supports<br/><em>an accountable decision.</em></h2>
          <p>Long-form briefs structured around argument, evidence, counterargument and practical action.</p>
        </div>
        <div className={styles.storyField}>
        {articles.map((article, index) => {
          const editorial = newsEditorial[article.slug];
          return <Link className={`${styles.story} ${index === 0 ? styles.leadStory : ''}`} href={`/news/${article.slug}`} key={article.slug}>
            <div className={styles.storyArt}>
              <Image src={article.image} alt="" fill sizes={index === 0 ? '100vw' : '(max-width: 800px) 100vw, 44vw'} className={styles.storyImage}/>
              <span>{String(index + 1).padStart(2, '0')}</span>
            </div>
            <div className={styles.storyCopy}>
              <PrecisionLabel index={article.tag} label={article.date} detail={article.read} />
              <h3>{editorial.title}</h3>
              <p>{editorial.standfirst}</p>
              <blockquote><span>Central contention</span>{editorial.thesis}</blockquote>
              <span className={styles.storyAction}>Read the analysis <ArrowUpRight size={15}/></span>
            </div>
          </Link>;
        })}
        </div>
      </section>
    </>
  );
}
