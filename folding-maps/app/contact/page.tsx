import { ContactForm } from '@/components/ContactForm';
import styles from './contact.module.css';
import { createPageMetadata } from '@/lib/seo';

export const metadata = createPageMetadata({
  title: 'Contact',
  description:
    'Start an enquiry with Quiet Gears. The first conversation is diagnostic: what the problem is, whether we are the right people for it, and what we would do first.',
  path: '/contact',
});

/* What an enquiry actually results in. Setting this out removes the main reason
   people hesitate over a form: not knowing what they are starting. */
const process = [
  {
    step: '01',
    title: 'A reply within one working day',
    detail:
      'One of the two lead consultants reads your enquiry and writes back. The reply either sets out the questions we would need answered to scope the work, or explains why this is not something we should take on and who might be better placed.',
  },
  {
    step: '02',
    title: 'An initial consultation',
    detail:
      'A scheduled call. We ask how the work runs today, where it slows down, what has already been tried and what that cost. We then set out the constraint as we understand it, what we would look at first, and roughly what that would take.',
  },
];

export default function Contact() {
  return (
    <>
      <section className="page-hero container">
        <span className="kicker">Contact</span>
        <h1>Tell us what is not working.</h1>
        <p className="lede">
          The most useful enquiries describe the constraint itself: what slows down, who it
          affects, and what has already been tried. You do not need a brief. An enquiry gets
          a reply within one working day, followed by an initial consultation.
        </p>
      </section>

      <div className={`container ${styles.layout}`}>
        <div className={styles.aside}>
          <section aria-labelledby="process-title">
            <h2 id="process-title" className={styles.asideHeading}>
              What happens next
            </h2>
            <ol className={styles.process}>
              {process.map((item) => (
                <li key={item.step}>
                  <span>{item.step}</span>
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.detail}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section aria-labelledby="details-title" className={styles.details}>
            <h2 id="details-title" className={styles.asideHeading}>
              Details
            </h2>
            <dl>
              <div>
                <dt>Email</dt>
                <dd>
                  <a className="text-link" href="mailto:quietgearsai@gmail.com">
                    quietgearsai@gmail.com
                  </a>
                </dd>
              </div>
              <div>
                <dt>Office</dt>
                <dd>4 Foscote Mews, London. Working UK-wide.</dd>
              </div>
              <div>
                <dt>Confidentiality</dt>
                <dd>
                  Enquiries are treated as confidential. We will sign your NDA before a
                  first conversation if you would rather start there.
                </dd>
              </div>
            </dl>
          </section>
        </div>

        <div className={styles.formPanel}>
          <span className="kicker">Enquiry</span>
          <h2>Give us enough to make the reply useful.</h2>
          <p className={styles.formIntro}>
            The budget range is asked for so we can tell you honestly whether the work fits
            it. An answer of “not sure yet” is a perfectly good answer.
          </p>
          <ContactForm />
        </div>
      </div>
    </>
  );
}
