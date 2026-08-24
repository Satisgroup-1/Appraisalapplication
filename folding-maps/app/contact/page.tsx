import { Clock3, Mail, MapPin } from 'lucide-react';
import { ContactForm } from '@/components/ContactForm';
import { PrecisionLabel } from '@/components/PrecisionLabel';
import styles from './contact.module.css';
import { createPageMetadata } from '@/lib/seo';

export const metadata = createPageMetadata({
  title: 'Contact Quiet Gears',
  description: 'Discuss an AI strategy, implementation or workflow challenge with Quiet Gears. Initial consultations are practical and confidential.',
  path: '/contact',
});

export default function Contact() {
  return <>
    <section className={`contact-page contact-page-expanded ${styles.contact}`}>
      <div className="contact-intro">
        <PrecisionLabel index="QG–CO" label="Start a conversation" detail="Initial consultation / no obligation" />
        <h1>What could move<br/><em>more smoothly?</em></h1>
        <p>Tell us where work slows down, what you need to build or which investment decision needs evidence. The first consultation is practical, confidential and designed to establish a clear next step.</p>
        <div className="contact-facts">
          <div><Mail/><span>Email us<a href="mailto:quietgearsai@gmail.com">quietgearsai@gmail.com</a></span></div>
          <div><MapPin/><span>Based in<b>4 Foscote Mews, London · Servicing Nationwide</b></span></div>
          <div><Clock3/><span>We usually reply<b>Within one working day</b></span></div>
        </div>
      </div>
      <div className="form-wrap contact-form-panel">
        <div className="form-panel-heading"><span className="kicker">Project enquiry</span><h2>Give us enough context<br/>to make the reply useful.</h2><p>You do not need a finished brief. A clear description of the constraint, the people affected and the result you want is the best starting point.</p></div>
        <ContactForm/>
      </div>
    </section>
  </>;
}

