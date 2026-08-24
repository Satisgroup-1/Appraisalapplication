'use client';

import { useEffect, useRef } from 'react';

/**
 * Fades a block in as it arrives. Motion here is functional — it marks content
 * entering the viewport — so it stays small and short.
 *
 * Everything is done by mutating the node, never through React state. The
 * element renders visible, the effect hides it only if the browser can animate
 * it back, and the observer reveals it. That ordering means no-JS and
 * reduced-motion visitors see the content, and a re-render can never wipe the
 * class the observer added.
 */
export function Reveal({
  children,
  className = '',
  delay = 0,
  as: Tag = 'div',
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  as?: 'div' | 'li' | 'article' | 'section';
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    node.classList.add('reveal');
    if (delay) node.style.transitionDelay = `${delay}ms`;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        node.classList.add('seen');
        observer.disconnect();
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    );
    observer.observe(node);

    return () => observer.disconnect();
  }, [delay]);

  return (
    <Tag ref={ref as never} className={className || undefined}>
      {children}
    </Tag>
  );
}
