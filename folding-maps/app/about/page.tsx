import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { PrecisionLabel } from '@/components/PrecisionLabel';
import { Reveal } from '@/components/Reveal';
import { createPageMetadata } from '@/lib/seo';
import styles from './about.module.css';

export const metadata = createPageMetadata({
  title: 'About Quiet Gears',
  description: 'Quiet Gears is a senior-led London studio that finds costly operational drag and builds focused software to remove it.',
  path: '/about',
});

const leadConsultants = ['Luc Balonwu', 'Rohan Campion'];

export default function About() {
  return (
    <>
      <section className="page-hero code-waterfall">
        <div className="code-rain" aria-hidden="true">
          01&nbsp;&nbsp;SYSTEM.READY&nbsp;&nbsp;BUILD.BETTER<br />
          10&nbsp;&nbsp;CONNECT → AUTOMATE → LEARN<br />
          11&nbsp;&nbsp;HUMAN.IN.THE.LOOP&nbsp;&nbsp;01&nbsp;&nbsp;SHIP
        </div>
        <PrecisionLabel index="QG–AB" label="About Quiet Gears" detail="London / small team / senior-led" />
        <h1>Find the drag.<br /><em>Fix the system.</em></h1>
        <p>
          Quiet Gears is a small London studio for organisations whose everyday work has outgrown its tools. We trace the friction, shape a sensible intervention and build the software needed to make the work move again.
        </p>
      </section>

      <section className={styles.story}>
        <Reveal className={styles.storyLead}>
          <PrecisionLabel index="01" label="Why Quiet Gears" />
          <h2>Useful change starts with the work as it is.</h2>
        </Reveal>
        <Reveal className={styles.storyCopy}>
          <p>
            Important processes often run through a patchwork of spreadsheets, inboxes and knowledge held by a few experienced people. The problem is rarely a lack of ideas. It is the distance between seeing the issue and having the time and technical judgement to resolve it.
          </p>
          <p>
            We work inside that gap. Our role is to understand the operating detail, decide what deserves to change and take responsibility for a focused release. Sometimes AI belongs in that answer. Sometimes simpler software is the better tool.
          </p>
        </Reveal>
      </section>

      <section className={styles.people}>
        <div className={styles.sectionHeading}>
          <PrecisionLabel index="02" label="People" detail="Strategy / engineering / adoption" />
          <h2>The people you meet<br /><em>do the work.</em></h2>
          <p>Quiet Gears is led by two consultants and supported by a focused network of specialists when the brief calls for it.</p>
        </div>
        <div className={styles.consultantList}>
          {leadConsultants.map((name, index) => (
            <article key={name}>
              <span>0{index + 1}</span>
              <h3>{name}</h3>
              <p>Lead consultant</p>
            </article>
          ))}
        </div>
        <aside className={styles.workWithUs}>
          <div>
            <span>Work with us</span>
            <p>We welcome introductions from experienced specialists who value careful craft and direct client responsibility.</p>
          </div>
          <a className="text-link" href="mailto:quietgearsai@gmail.com?subject=Working%20with%20Quiet%20Gears">
            Introduce yourself <ArrowRight size={16} />
          </a>
        </aside>
      </section>

      <section className="cta-band">
        <h2>Have a stubborn problem<br />worth solving?</h2>
        <Link className="button lime" href="/contact">Start a conversation <ArrowRight size={17} /></Link>
      </section>
    </>
  );
}
