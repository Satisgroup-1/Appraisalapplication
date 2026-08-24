import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';

export const metadata = { title: 'Page not found' };

export default function NotFound() {
  return (
    <section className="not-found container">
      <span className="kicker">404 · Page not found</span>
      <h1>That page is not here.</h1>
      <p>
        The address may be incomplete, or the page may have moved during a recent rewrite of
        the site. The three routes below cover most of what people arrive looking for.
      </p>
      <div className="not-found-links">
        <Link className="button" href="/">
          <ArrowLeft size={17} aria-hidden="true" /> Home
        </Link>
        <Link className="text-link" href="/services">
          Services <ArrowRight size={15} aria-hidden="true" />
        </Link>
        <Link className="text-link" href="/news">
          Insights <ArrowRight size={15} aria-hidden="true" />
        </Link>
        <Link className="text-link" href="/contact">
          Contact <ArrowRight size={15} aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
