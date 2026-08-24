import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <section className="not-found">
      <span className="kicker">404 · Page not found</span>
      <h1>This gear is<br/><em>out of place.</em></h1>
      <p>The page may have moved, or the address may be incomplete.</p>
      <Link className="button dark" href="/">
        <ArrowLeft size={17}/> Return home
      </Link>
    </section>
  );
}
