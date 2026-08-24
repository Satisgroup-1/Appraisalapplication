'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import type { Service } from '@/lib/services';
import styles from './ServiceDirectory.module.css';

const groups = ['All', 'Advise', 'Build', 'Enable'] as const;
type Group = (typeof groups)[number];

const groupNotes: Record<Group, string> = {
  All: 'Ten services. Most engagements draw on two or three of them rather than one.',
  Advise: 'Work that ends in a decision and the evidence behind it. No build is committed to at this stage.',
  Build: 'Work that ends in something running in your business, with its tests, documentation and owner.',
  Enable: 'Work that ends with your people able to operate and extend what exists without us.',
};

/**
 * The directory filters in place rather than navigating, because the question
 * a visitor is answering — "which kind of work is this?" — is worth answering
 * without losing their position on the page. The unfiltered list is rendered
 * server-side, so the page is complete before this component hydrates.
 */
export function ServiceDirectory({ services }: { services: Service[] }) {
  const [group, setGroup] = useState<Group>('All');

  const visible = useMemo(
    () => (group === 'All' ? services : services.filter((service) => service.group === group)),
    [group, services],
  );

  return (
    <div>
      <div className={styles.controls}>
        <div className={styles.filters} role="group" aria-label="Filter services by kind of work">
          {groups.map((option) => {
            const count =
              option === 'All'
                ? services.length
                : services.filter((service) => service.group === option).length;
            return (
              <button
                key={option}
                type="button"
                className={`${styles.filter} ${group === option ? styles.filterActive : ''}`}
                aria-pressed={group === option}
                onClick={() => setGroup(option)}
              >
                {option} <span>{count}</span>
              </button>
            );
          })}
        </div>
        <p className={styles.note}>{groupNotes[group]}</p>
      </div>

      <div className="index-list" aria-live="polite">
        {visible.map((service) => (
          <Link className="index-item" href={`/services/${service.slug}`} key={service.slug}>
            <span className="index-num">{service.number}</span>
            <div>
              <span className={styles.group}>{service.group}</span>
              <h3>{service.title}</h3>
              <p>{service.summary}</p>
            </div>
            <ArrowRight size={17} aria-hidden="true" className={styles.arrow} />
          </Link>
        ))}
      </div>
    </div>
  );
}
