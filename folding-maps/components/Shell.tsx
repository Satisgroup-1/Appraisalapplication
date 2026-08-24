'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import { useEffect, useEffectEvent, useState } from 'react';
import styles from './Shell.module.css';

const mainLinks = [
  ['Services', '/services'],
  ['Industries', '/industries'],
  ['Work', '/case-studies'],
  ['Insights', '/news'],
  ['About', '/about'],
] as const;

const footerLinks = [
  ['Services', '/services'],
  ['Industries', '/industries'],
  ['Work', '/case-studies'],
  ['Insights', '/news'],
  ['About', '/about'],
] as const;

export function Logo({ footer = false }: { footer?: boolean }) {
  return (
    <Link className={`${styles.logo} ${footer ? styles.footerLogo : ''}`} href="/" aria-label="Quiet Gears home">
      <span aria-hidden="true">q</span>
      Quiet Gears
    </Link>
  );
}

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const isHome = pathname === '/';

  const updateScrollState = useEffectEvent(() => setScrolled(window.scrollY > 24));
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

  const headerClass = [
    styles.header,
    isHome ? styles.homeHeader : styles.innerHeader,
    scrolled || open ? styles.scrolled : '',
  ].filter(Boolean).join(' ');

  return (
    <header className={headerClass}>
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
          {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
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
                <Link key={href} className={active ? styles.active : ''} href={href} onClick={() => setOpen(false)}>
                  {label}
                </Link>
              );
            })}
          </div>
          <Link className={styles.navCta} href="/contact" onClick={() => setOpen(false)}>
            Start a conversation <ArrowUpRight size={16} aria-hidden="true" />
          </Link>
        </nav>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerLead}>
        <Logo footer />
        <p>AI advisory and engineering for ambitious UK SMEs.</p>
      </div>
      <div className={styles.footerDetails}>
        <div className={styles.footerNav} role="navigation" aria-label="Footer navigation">
          {footerLinks.map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}
        </div>
        <div className={styles.contact}>
          <a href="mailto:quietgearsai@gmail.com">quietgearsai@gmail.com</a>
          <span>London · UK-wide</span>
        </div>
      </div>
      <div className={styles.footerBottom}>
        <span>© 2026 Quiet Gears Ltd</span>
        <div>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/accessibility">Accessibility</Link>
        </div>
      </div>
    </footer>
  );
}
