'use client';

import { useEffect, useState } from 'react';
import styles from './SectionNav.module.css';

export type NavSection = { id: string; label: string };

/**
 * Contents for a long page, with the current section marked as you read.
 *
 * The links work without JavaScript — they are ordinary fragment links to
 * sections that exist in the server-rendered HTML. The observer only adds the
 * "where am I" affordance on top.
 */
export function SectionNav({ sections, label = 'On this page' }: { sections: NavSection[]; label?: string }) {
  const [active, setActive] = useState(sections[0]?.id ?? '');

  useEffect(() => {
    const nodes = sections
      .map((section) => document.getElementById(section.id))
      .filter((node): node is HTMLElement => Boolean(node));
    if (nodes.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // The topmost section currently crossing the reading line wins, so the
        // marker does not jump about when two sections are on screen at once.
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: '-96px 0px -60% 0px', threshold: 0 },
    );

    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [sections]);

  return (
    <nav className={styles.nav} aria-label={label}>
      <span className={styles.label}>{label}</span>
      <ol>
        {sections.map((section, index) => (
          <li key={section.id}>
            <a
              href={`#${section.id}`}
              className={active === section.id ? styles.active : ''}
              aria-current={active === section.id ? 'true' : undefined}
            >
              <span>{String(index + 1).padStart(2, '0')}</span>
              {section.label}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
