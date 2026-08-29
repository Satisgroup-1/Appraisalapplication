'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Pause, Play } from 'lucide-react';
import styles from './GroundBand.module.css';

/**
 * One full-bleed band per marketing page, cycling three photographs.
 *
 * Two frames of planting and one of structure, in that order: the first frame
 * is what a visitor on reduced motion sees and the one the browser fetches
 * first, so a band reads as greenery before it reads as concrete.
 *
 * The cycle is CSS. Three overlaid frames, staggered opacity keyframes and a
 * slow scale on each, which means it runs with scripting off and costs no
 * frame budget on the main thread. The only thing React is here for is the
 * pause control: content that animates on its own for more than five seconds
 * needs a way to stop it (WCAG 2.2.2), and honouring prefers-reduced-motion
 * covers the people who set it but not the person who simply finds it
 * distracting.
 *
 * Every file is CC0. Titles, creators and sources are recorded per file in
 * public/images/ground/CREDITS.json, which is the licence record and is kept
 * in step with this directory.
 */
const FRAMES = ['a', 'b', 'c'] as const;

const grounds = ['home', 'services', 'industries', 'work', 'insights', 'about', 'contact'] as const;

export type Ground = (typeof grounds)[number];

export function GroundBand({ ground, plate }: { ground: Ground; plate: string }) {
  const [paused, setPaused] = useState(false);

  return (
    <div className={styles.band} data-ground={ground} data-paused={paused ? '' : undefined}>
      {FRAMES.map((frame, index) => (
        <div className={styles.frame} key={frame}>
          <Image
            src={`/images/ground/${ground}-${frame}.jpg`}
            alt=""
            fill
            sizes="100vw"
            className={styles.image}
            // The first frame is the one on screen before anything cycles, so
            // it is the only one worth fetching eagerly once the band is near.
            loading={index === 0 ? 'eager' : 'lazy'}
            quality={70}
          />
        </div>
      ))}

      <div className={styles.plate}>
        <div className="container">
          <span className={styles.label}>
            {plate}
            <button
              type="button"
              className={styles.toggle}
              onClick={() => setPaused((current) => !current)}
              aria-pressed={paused}
              aria-label={paused ? 'Resume the background images' : 'Pause the background images'}
            >
              {paused ? <Play size={12} aria-hidden="true" /> : <Pause size={12} aria-hidden="true" />}
            </button>
          </span>
        </div>
      </div>
    </div>
  );
}
