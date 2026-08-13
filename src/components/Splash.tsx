// SATIS intro splash, ported from the group website's SplashScreen: the five
// letters drop onto the baseline one by one, the GROUP lockup fades in, then
// the whole screen fades away. Click / Esc / Enter skips. Shown once per
// session; skipped entirely for reduced-motion users.

import { useCallback, useEffect, useState } from 'react';
import { useStore } from '../state/store';

const LETTERS = ['S', 'A', 'T', 'I', 'S'];
const TOTAL_MS = 3000;
const FADE_MS = 600;

function alreadySeen(): boolean {
  try {
    return window.sessionStorage.getItem('satis-splash-seen') !== null;
  } catch {
    return true;
  }
}

export default function Splash() {
  const setSplashDone = useStore((s) => s.setSplashDone);
  const reduceMotion =
    typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const [phase, setPhase] = useState<'show' | 'fading' | 'gone'>(
    alreadySeen() || reduceMotion ? 'gone' : 'show',
  );

  const dismiss = useCallback(() => {
    try {
      window.sessionStorage.setItem('satis-splash-seen', '1');
    } catch {
      /* ignore */
    }
    setPhase((p) => (p === 'show' ? 'fading' : p));
  }, []);

  useEffect(() => {
    if (phase === 'gone') {
      setSplashDone();
      return;
    }
    if (phase === 'fading') {
      const t = setTimeout(() => setPhase('gone'), FADE_MS);
      return () => clearTimeout(t);
    }
    const timer = setTimeout(dismiss, TOTAL_MS);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter') dismiss();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', onKey);
    };
  }, [phase, dismiss, setSplashDone]);

  if (phase === 'gone') return null;

  return (
    <div
      className={`splash ${phase === 'fading' ? 'splash-fading' : ''}`}
      onClick={dismiss}
      role="presentation"
      aria-label="Satis intro animation"
    >
      <div className="splash-word" aria-hidden="true">
        {LETTERS.map((l, i) => (
          <span key={i} className="splash-letter" style={{ animationDelay: `${0.15 + i * 0.18}s` }}>
            {l}
          </span>
        ))}
      </div>
      <div className="splash-lockup" aria-hidden="true">
        APPRAISAL
      </div>
      <button type="button" className="splash-skip" onClick={dismiss} autoFocus>
        Skip intro
      </button>
    </div>
  );
}
