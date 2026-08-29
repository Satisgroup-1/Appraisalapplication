import Image from 'next/image';
import styles from './GroundBand.module.css';

/**
 * One full-bleed photograph per marketing page.
 *
 * The imagery is structural rather than illustrative: poured concrete, stairs,
 * facades. It does the job the removed paragraphs were doing badly, which is
 * giving a page somewhere to breathe between two blocks of argument. Nothing
 * is written over it beyond a short plate, because a caption would reinstate
 * the text this pass removed.
 *
 * Every file is CC0. Titles, creators and sources are recorded per file in
 * public/images/ground/CREDITS.json; that file is the licence record and
 * should be kept in step with anything added here.
 */
const grounds = {
  home: '/images/ground/corridor.jpg',
  services: '/images/ground/columns.jpg',
  industries: '/images/ground/facade.jpg',
  work: '/images/ground/planes.jpg',
  insights: '/images/ground/fins.jpg',
  about: '/images/ground/steps.jpg',
  contact: '/images/ground/wall.jpg',
} as const;

export type Ground = keyof typeof grounds;

export function GroundBand({ ground, plate }: { ground: Ground; plate?: string }) {
  return (
    <div className={styles.band} data-ground={ground}>
      <Image
        src={grounds[ground]}
        alt=""
        fill
        sizes="100vw"
        className={styles.image}
        // 2.6:1 source, cropped further by the band's own aspect. Quality is
        // held down because these are duotones: the palette is two colours and
        // a gradient between them, so the artefacts a photograph would show
        // are not there to show.
        quality={72}
      />
      {plate ? (
        <div className={styles.plate}>
          <div className="container">
            <span className={styles.label}>{plate}</span>
          </div>
        </div>
      ) : null}
    </div>
  );
}
