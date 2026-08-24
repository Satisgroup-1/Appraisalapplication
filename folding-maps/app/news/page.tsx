import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { articles } from '@/lib/content';
import { newsEditorial } from '@/lib/newsEditorial';
import styles from './news.module.css';
import { createPageMetadata } from '@/lib/seo';

export const metadata = createPageMetadata({
  title: 'Insights',
  description:
    'Long-form analysis for leaders making decisions about AI, automation and operating-model change. Each piece states its argument, tests the counter-case and carries its sources.',
  path: '/news',
});

export default function News() {
  const [lead, ...rest] = articles;
  const leadEditorial = newsEditorial[lead.slug];

  return (
    <>
      <section className="page-hero container">
        <span className="kicker">Insights</span>
        <h1>Arguments, with the evidence attached.</h1>
        <p className="lede">
          Each piece takes a position, sets out the case against it, and links every figure
          to its source. Where the evidence is thin we say so, and do not round it up into
          a recommendation.
        </p>
      </section>

      <section className="section container" aria-labelledby="latest-title">
        <h2 id="latest-title" className="sr-only">
          Latest analysis
        </h2>

        <Link className={styles.lead} href={`/news/${lead.slug}`}>
          <span className={styles.meta}>
            {lead.tag} · {lead.date} · {lead.read}
          </span>
          <h3>{leadEditorial.title}</h3>
          <p className={styles.leadStandfirst}>{leadEditorial.standfirst}</p>
          <div className={styles.thesis}>
            <span className="fact-label">The contention</span>
            <p>{leadEditorial.thesis}</p>
          </div>
          <span className="text-link">
            Read the analysis <ArrowRight size={15} aria-hidden="true" />
          </span>
        </Link>

        <div className={styles.grid}>
          {rest.map((article) => {
            const editorial = newsEditorial[article.slug];
            return (
              <Link className={styles.story} href={`/news/${article.slug}`} key={article.slug}>
                <span className={styles.meta}>
                  {article.tag} · {article.date}
                </span>
                <h3>{editorial.title}</h3>
                <p>{editorial.standfirst}</p>
                <span className={styles.read}>{article.read}</span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="contact-band">
        <div className="container inner">
          <div>
            <span className="kicker">Enquiries</span>
            <h2>Disagreement is the more useful reply.</h2>
            <p>
              These are arguments, not conclusions, and they are better for being tested
              against a real operation. If your own data contradicts one, we would sooner
              hear it than defend the piece.
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
