'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { useEffect, useEffectEvent, useState } from 'react';
import styles from './Shell.module.css';

const mainLinks = [
  ['Services', '/services'],
  ['Industries', '/industries'],
  ['Work', '/case-studies'],
  ['Insights', '/news'],
  ['About', '/about'],
] as const;

const footerColumns = [
  {
    heading: 'Firm',
    links: [
      ['About', '/about'],
      ['Work', '/case-studies'],
      ['Insights', '/news'],
      ['Contact', '/contact'],
    ],
  },
  {
    heading: 'Capabilities',
    links: [
      ['Services', '/services'],
      ['Industries', '/industries'],
      ['AI strategy', '/services/ai-strategy'],
      ['Workflow automation', '/services/workflow-automation'],
    ],
  },
] as const;

export function Logo({ footer = false }: { footer?: boolean }) {
  return (
    <Link
      className={`${styles.logo} ${footer ? styles.footerLogo : ''}`}
      href="/"
      aria-label="Quiet Gears home"
    >
      Quiet Gears
    </Link>
  );
}

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const updateScrollState = useEffectEvent(() => setScrolled(window.scrollY > 8));
  const closeMenu = useEffectEvent(() => setOpen(false));

  useEffect(() => {
    updateScrollState();
    window.addEventListener('scroll', updateScrollState, { passive: true });
    return () => window.removeEventListener('scroll', updateScrollState);
  }, []);

  useEffect(() => {
    closeMenu();
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <header className={`${styles.header} ${scrolled || open ? styles.scrolled : ''}`}>
      <div className={styles.navWrap}>
        <Logo />
        <button
          className={styles.menu}
          type="button"
          onClick={() => setOpen((current) => !current)}
          aria-expanded={open}
          aria-controls="primary-navigation"
          aria-label={open ? 'Close menu' : 'Open menu'}
        >
          {open ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
        </button>
        <nav
          id="primary-navigation"
          className={`${styles.navigation} ${open ? styles.open : ''}`}
          aria-label="Main navigation"
        >
          <div className={styles.navLinks}>
            {mainLinks.map(([label, href]) => {
              const active = pathname === href || pathname.startsWith(`${href}/`);
              return (
                <Link
                  key={href}
                  className={active ? styles.active : ''}
                  href={href}
                  aria-current={active ? 'page' : undefined}
                  onClick={() => setOpen(false)}
                >
                  {label}
                </Link>
              );
            })}
          </div>
          <Link className={styles.navCta} href="/contact" onClick={() => setOpen(false)}>
            Contact
          </Link>
        </nav>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerInner}>
        <div className={styles.footerLead}>
          <Logo footer />
          <p>
            An independent AI advisory and engineering firm working with UK small and
            mid-sized companies. We advise on where AI is worth using, build the systems
            that follow, and hand them over to the people who run them.
          </p>
        </div>

        <div className={styles.footerNav}>
          {footerColumns.map((column) => (
            <div key={column.heading}>
              <h2>{column.heading}</h2>
              <ul>
                {column.links.map(([label, href]) => (
                  <li key={href}>
                    <Link href={href}>{label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div>
            <h2>Enquiries</h2>
            <ul>
              <li>
                <a href="mailto:enquiries@quietgears.xyz">enquiries@quietgears.xyz</a>
              </li>
              <li className={styles.plain}>London, working UK-wide</li>
            </ul>
          </div>
        </div>
      </div>

      <div className={styles.footerBottom}>
        <span>© {new Date().getFullYear()} Quiet Gears Ltd</span>
        <div>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/accessibility">Accessibility</Link>
        </div>
      </div>
    </footer>
  );
}
