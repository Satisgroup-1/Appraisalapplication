import { ContactForm } from '@/components/ContactForm';
import { GroundBand } from '@/components/GroundBand';
import styles from './contact.module.css';
import { createPageMetadata } from '@/lib/seo';

export const metadata = createPageMetadata({
  title: 'Contact',
  description:
    'Start an enquiry with Quiet Gears. The first conversation is diagnostic: what the problem is, whether this is the right team for it, and what would happen first.',
  path: '/contact',
});

/* What an enquiry actually results in. Setting this out removes the main reason
   people hesitate over a form: not knowing what they are starting. */
const process = [
  {
    step: '01',
    title: 'A reply within one working day',
    detail:
      'One of the two lead consultants replies: either the questions still needed to scope the work, or why this is not something to take on and who might be better placed.',
  },
  {
    step: '02',
    title: 'An initial consultation',
    detail:
      'A scheduled call, ending with an outline of what would be looked at first and roughly what that would take.',
  },
];

export default function Contact() {
  return (
    <>
      <section className="page-hero page-hero-index container">
        <span className="kicker">Enquiries</span>
        <h1>Contact</h1>
        <p className="lede">
          Enquiries are read by one of the two lead consultants and answered within one
          working day. A formal brief is not required.
        </p>
      </section>

      <div className={`container ${styles.layout}`}>
        <div className={styles.aside}>
          <section aria-labelledby="process-title">
            <h2 id="process-title" className={styles.asideHeading}>
              Following an enquiry
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
                  <a className="text-link" href="mailto:enquiries@quietgears.xyz">
                    enquiries@quietgears.xyz
                  </a>
                </dd>
              </div>
              <div>
                <dt>Location</dt>
                <dd>London. Working UK-wide.</dd>
              </div>
              <div>
                <dt>Confidentiality</dt>
                <dd>
                  Enquiries are treated as confidential. A non-disclosure agreement can be
                  signed before a first conversation.
                </dd>
              </div>
            </dl>
          </section>
        </div>

        <div className={styles.formPanel}>
          <span className="kicker">Enquiry</span>
          <h2>Enquiry form.</h2>
          <p className={styles.formIntro}>
            Every field is required, apart from the referral.
          </p>
          <ContactForm />
        </div>
      </div>

      <GroundBand ground="contact" plate="Enquiries" />
    </>
  );
}
