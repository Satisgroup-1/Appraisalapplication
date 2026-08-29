import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { GroundBand } from '@/components/GroundBand';
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
      <section className="page-hero page-hero-index container">
        <span className="kicker">{industries.length} sectors</span>
        <h1>Industries</h1>
        <p className="lede">
          The technology varies little between industries. The constraint around it varies:
          the regulation, the shift pattern, the margin, the person who has to sign.
        </p>
      </section>

      <section className="section container" aria-labelledby="directory-title">
        <h2 id="directory-title" className="sr-only">
          Industry directory
        </h2>
        <IndustryDirectory industries={industries} families={industryFamilies} />
      </section>

      <GroundBand ground="industries" plate="Sectors" />

      <section className="contact-band">
        <div className="container inner">
          <div>
            <span className="kicker">Enquiries</span>
            <h2>Constraints are specific to an operation.</h2>
          </div>
          <Link className="button" href="/contact">
            Start an enquiry <ArrowRight size={17} aria-hidden="true" />
          </Link>
        </div>
      </section>
    </>
  );
}
