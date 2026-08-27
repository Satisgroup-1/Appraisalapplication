import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
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
    title: 'We do not resell software.',
    body: 'We take no commission or referral fee on any tool we recommend, which is the only way advice about tooling can be worth reading. Where the right answer is a product you already pay for, that is the answer you get.',
  },
  {
    title: 'We do not staff projects we cannot senior-lead.',
    body: 'A small firm scales by putting junior people on work sold by senior ones. We would rather decline than do that, which caps how much we take on and is the main reason our timelines are honest.',
  },
  {
    title: 'We do not build what we cannot hand over.',
    body: 'If a system would leave your team dependent on us to operate it, it is the wrong system. That constraint rules out some interesting architectures and rules in the ones you can still run in three years.',
  },
  {
    title: 'We do not promise a number we cannot baseline.',
    body: 'Efficiency claims made before measurement are guesses with a decimal point. If the current position cannot be measured, the first piece of work is measuring it, and we will say so before quoting any saving.',
  },
];

export default function About() {
  return (
    <>
      <section className="page-hero container">
        <span className="kicker">About</span>
        <h1>A two-person firm with a specialist network.</h1>
        <p className="lede">
          Quiet Gears advises UK companies on where AI is worth using and builds the systems
          that follow. Two lead consultants, a network of specialists when a brief needs
          them, and no layer in between.
        </p>
      </section>

      <section className="section container" aria-labelledby="why-title">
        <div className="page-head">
          <div>
            <span className="kicker">Why we exist</span>
            <h2 id="why-title">Most companies already know what their problem is.</h2>
          </div>
          <p className="lede">
            Most companies we meet have already diagnosed their own problem. They lack the time
            and the technical judgement to act on it without breaking something else.
          </p>
        </div>

        <div className={styles.prose}>
          <p>
            Important work in a mid-sized company usually runs through a patchwork:
            spreadsheets that only one person fully understands, an inbox that functions as
            a queue, and a scheduling decision that lives in somebody&rsquo;s head. It works,
            often for years, and it degrades as volume grows. The failure is rarely
            dramatic. It shows up as a Tuesday that takes until Thursday.
          </p>
          <p>
            The obstacle to fixing it is not usually ambition or budget. It is that the
            people who understand the operation are the same people running it, and the
            technical judgement needed (what to automate, what to leave alone, what will still
            be maintainable in two years) is not the judgement their day job builds.
          </p>
          <p>
            That is the gap we work in. Our job is to understand the operating detail well
            enough to decide what deserves to change, then take responsibility for
            one focused release. Sometimes AI belongs in the answer.
            Often the honest answer is simpler software, better data, or a process change
            that costs nothing at all. We would sooner say so and be trusted next time.
          </p>
        </div>
      </section>

      <section className="section section-surface" aria-labelledby="refusals-title">
        <div className="container">
          <div className="page-head">
            <div>
              <span className="kicker">How we work</span>
              <h2 id="refusals-title">Four things we will not do.</h2>
            </div>
            <p className="lede">
              Every firm's capability list reads the same. A constraint tells you something
              a list cannot: what happens when the commercially convenient answer and the
              correct one diverge.
            </p>
          </div>

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

      <section className="section container" aria-labelledby="people-title">
        <div className="page-head">
          <div>
            <span className="kicker">People</span>
            <h2 id="people-title">The people you meet are the people who do the work.</h2>
          </div>
          <p className="lede">
            Quiet Gears is led by two consultants, supported by a small network of
            specialists when a brief calls for one. There is no delivery team behind the
            pitch, because there is no pitch.
          </p>
        </div>

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
              We bring in specialists in data engineering, security review or sector regulation
              where a brief requires one, and we say who they are before they start.
              Introductions from experienced practitioners who want direct client
              responsibility are welcome.
            </p>
          </div>
          <a
            className="text-link"
            href="mailto:quietgearsai@gmail.com?subject=Working%20with%20Quiet%20Gears"
          >
            Introduce yourself <ArrowRight size={16} aria-hidden="true" />
          </a>
        </aside>
      </section>

      <section className="contact-band">
        <div className="container inner">
          <div>
            <span className="kicker">Enquiries</span>
            <h2>Most clients call us after two attempts have failed.</h2>
            <p>
              Tell us what has already been tried and why it did not hold. That history is
              usually the most informative thing in a first conversation.
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
