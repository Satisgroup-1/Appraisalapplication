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
        <h1>What we look at before proposing anything in your sector.</h1>
        <p className="lede">
          The technology varies little between industries. What varies is the constraint
          around it: the regulation, the shift pattern, the margin, the person who has to
          sign. These notes set out what we look at in each sector before proposing
          anything.
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
              The constraint is. Tell us which decision is slow, which record cannot be
              trusted, or which obligation makes automation awkward, and we will tell you
              whether we have seen it before.
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
