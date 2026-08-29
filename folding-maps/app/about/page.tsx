import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { GroundBand } from '@/components/GroundBand';
import { createPageMetadata } from '@/lib/seo';
import styles from './about.module.css';

export const metadata = createPageMetadata({
  title: 'About',
  description:
    'Quiet Gears is a small, senior-led London firm advising UK companies on where AI is worth using and building the systems that follow.',
  path: '/about',
});

const leadConsultants = ['Rohan Campion', 'Luc Balonwu'];

/* What the firm will not do. Stated plainly, because a list of refusals tells a
   prospective client more about how a firm works than a list of capabilities. */
const refusals = [
  {
    title: 'No software is resold on commission.',
    body: 'No commission or referral fee is taken on any tool recommended. Where the right answer is a product the client already pays for, that is the answer given.',
  },
  {
    title: 'No project is staffed without a senior lead.',
    body: 'A small firm scales by putting junior people on work sold by senior ones. That trade is declined, which caps how much comes in.',
  },
  {
    title: 'Nothing is built that cannot be handed over.',
    body: 'A system that would leave the client’s team dependent on this firm to operate it is the wrong system, whatever else it does well.',
  },
  {
    title: 'No number is promised without a baseline.',
    body: 'Efficiency claims made before measurement are guesses with a decimal point. If the current position cannot be measured, measuring it is the first piece of work.',
  },
];

export default function About() {
  return (
    <>
      <section className="page-hero page-hero-index container">
        <span className="kicker">The firm</span>
        <h1>About</h1>
        <p className="lede">
          Quiet Gears advises UK companies on where AI is worth using and builds the systems
          that follow. Two lead consultants, a network of specialists when a brief needs
          them, and no layer in between.
        </p>
      </section>

      <section className="section container" aria-labelledby="why-title">
        <span className="kicker">Purpose</span>
        <h2 id="why-title">Most companies already know what their problem is.</h2>

        <div className={styles.prose}>
          <p>
            Important work in a mid-sized company usually runs through a patchwork:
            spreadsheets that only one person fully understands, an inbox that functions as
            a queue, and a scheduling decision that lives in somebody&rsquo;s head. It works,
            often for years, and it degrades as volume grows. The failure is rarely
            dramatic. It shows up as a Tuesday that takes until Thursday.
          </p>
          <p>
            The obstacle to fixing it is seldom ambition or budget. It is that the people
            who understand the operation are the same people running it, and the technical
            judgement needed (what to automate, what to leave alone, what will still be
            maintainable in two years) is not the judgement their day job builds. Sometimes
            AI belongs in the answer. Often the honest answer is simpler software, better
            data, or a process change that costs nothing at all.
          </p>
        </div>
      </section>

      <section className="section section-surface" aria-labelledby="refusals-title">
        <div className="container">
          <span className="kicker">Working principles</span>
          <h2 id="refusals-title">Four things ruled out.</h2>

          <div className={styles.refusals}>
            {refusals.map((item, index) => (
              <article key={item.title}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <GroundBand ground="about" plate="London" />

      <section className="section container" aria-labelledby="people-title">
        <span className="kicker">People</span>
        <h2 id="people-title">The people at the first meeting do the work.</h2>

        <div className={styles.people}>
          {leadConsultants.map((name, index) => (
            <article key={name}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <h3>{name}</h3>
              <p>Lead consultant</p>
            </article>
          ))}
        </div>

        <aside className={styles.network}>
          <div>
            <span className="fact-label">Specialist network</span>
            <p>
              Specialists in data engineering, security review or sector regulation are
              brought in where a brief requires one, and named before they start.
            </p>
          </div>
          <a
            className="text-link"
            href="mailto:enquiries@quietgears.xyz?subject=Working%20with%20Quiet%20Gears"
          >
            Introduce yourself <ArrowRight size={16} aria-hidden="true" />
          </a>
        </aside>
      </section>

      <section className="contact-band">
        <div className="container inner">
          <div>
            <span className="kicker">Enquiries</span>
            <h2>Enquiries and introductions.</h2>
          </div>
          <Link className="button" href="/contact">
            Start an enquiry <ArrowRight size={17} aria-hidden="true" />
          </Link>
        </div>
      </section>
    </>
  );
}
