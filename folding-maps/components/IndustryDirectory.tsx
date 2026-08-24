'use client';

import Link from 'next/link';
import { useId, useMemo, useState } from 'react';
import { ArrowRight, Search } from 'lucide-react';
import type { Industry } from '@/lib/industries';
import styles from './IndustryDirectory.module.css';

/**
 * Twenty-six sectors is too many to scan, so the directory filters as you type.
 * It matches the sector name, its family, its standfirst and its problem line,
 * because people search for the work ("cold chain", "compliance") as often as
 * for the label. The problem line is matched but not displayed: in a list of
 * twenty-six it was more texture than information.
 *
 * The complete list is rendered on the server; this only narrows it.
 */
export function IndustryDirectory({
  industries,
  families,
}: {
  industries: Industry[];
  families: string[];
}) {
  const [query, setQuery] = useState('');
  const inputId = useId();
  const term = query.trim().toLowerCase();

  const matches = useMemo(() => {
    if (!term) return industries;
    return industries.filter((industry) =>
      `${industry.name} ${industry.family} ${industry.eyebrow} ${industry.lead}`
        .toLowerCase()
        .includes(term),
    );
  }, [industries, term]);

  const visibleFamilies = families.filter((family) =>
    matches.some((industry) => industry.family === family),
  );

  return (
    <div>
      <div className={styles.searchRow}>
        <div className={styles.searchGroup}>
          <label className={styles.controlLabel} htmlFor={inputId}>
            Filter sectors
          </label>
          <div className={styles.search}>
            <Search size={18} aria-hidden="true" />
            <input
              id={inputId}
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Sector name, or the problem"
              autoComplete="off"
            />
            {term && (
              <button type="button" className={styles.clear} onClick={() => setQuery('')}>
                Clear
              </button>
            )}
          </div>
        </div>

        <p className={styles.count} aria-live="polite">
          <strong>{matches.length}</strong>
          <span>{matches.length === industries.length ? 'sectors' : `of ${industries.length} sectors`}</span>
        </p>
      </div>

      {visibleFamilies.length === 0 ? (
        <p className={styles.empty}>
          Nothing matches “{query.trim()}”. The sector list is not exhaustive. If yours is
          missing, the operating problem is usually still one we recognise.{' '}
          <Link className="text-link" href="/contact">
            Describe it instead
          </Link>
          .
        </p>
      ) : (
        visibleFamilies.map((family) => {
          const inFamily = matches.filter((industry) => industry.family === family);
          return (
            <section className={styles.family} key={family}>
              <div className={styles.familyHead}>
                <h3>{family}</h3>
                <span>{inFamily.length}</span>
              </div>
              <div className={styles.grid}>
                {inFamily.map((industry) => (
                  <Link href={`/industries/${industry.slug}`} key={industry.slug}>
                    <h4>{industry.name}</h4>
                    <ArrowRight size={16} aria-hidden="true" />
                  </Link>
                ))}
                {inFamily.length % 2 === 1 && <span className={styles.filler} aria-hidden="true" />}
              </div>
            </section>
          );
        })
      )}
    </div>
  );
}
