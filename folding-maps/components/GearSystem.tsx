import { Cog } from 'lucide-react';

const gears = [
  { className: 'gear-large', size: 220, label: 'Strategy' },
  { className: 'gear-medium', size: 145, label: 'Build' },
  { className: 'gear-small', size: 98, label: 'Adopt' },
];

export function GearSystem() {
  return (
    <div className="gear-system" aria-label="Strategy, build and adoption working as one connected system">
      <div className="gear-blueprint" aria-hidden="true" />
      {gears.map((gear) => (
        <div className={`about-gear ${gear.className}`} key={gear.label}>
          <Cog size={gear.size} strokeWidth={0.8} aria-hidden="true" />
          <span>{gear.label}</span>
        </div>
      ))}
      <p><b>QUIET GEARS</b><span>Connected delivery system</span></p>
    </div>
  );
}

