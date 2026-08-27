import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { IndustryDirectory } from '@/components/IndustryDirectory';
import { industries, industryFamilies } from '@/lib/industries';
import { createPageMetadata } from '@/lib/seo';

export const metadata = createPageMetadata({
  title: 'Industries',
  description:
    'How AI work differs by sector: the operating constraints, the regulatory limits and the measures that decide whether a system is worth running.',
  path: '/industries',
});

export default function IndustriesPage() {
  return (
    <>
      <section className="page-hero container">
        <span className="kicker">Industries</span>
        <h1>Twenty-six sectors, and the constraint that decides each one.</h1>
        <p className="lede">
          The technology varies little between industries. The constraint around it varies:
          the regulation, the shift pattern, the margin, the person who has to sign. These
          notes set out the ground we cover in a sector before proposing anything.
        </p>
      </section>

      <section className="section container" aria-labelledby="directory-title">
        <h2 id="directory-title" className="sr-only">
          Industry directory
        </h2>
        <IndustryDirectory industries={industries} families={industryFamilies} />
      </section>

      <section className="contact-band">
        <div className="container inner">
          <div>
            <span className="kicker">Enquiries</span>
            <h2>Tell us where your operation differs.</h2>
            <p>
              The constraint is usually specific. Name the decision that is slow, the record
              that cannot be trusted, or the obligation that makes automation awkward, and
              we will tell you whether we have seen it before.
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
