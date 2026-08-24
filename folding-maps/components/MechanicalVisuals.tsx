import { Cog, Gauge, ShieldCheck, Sparkles } from 'lucide-react';

export function HeroMechanism({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`hero-mechanism ${compact ? 'compact' : ''}`} aria-hidden="true">
      <div className="mechanism-grid" />
      <div className="mechanism-ring ring-one" />
      <div className="mechanism-ring ring-two" />
      <div className="mechanism-gear drive-gear"><Cog /></div>
      <div className="mechanism-gear control-gear"><Cog /></div>
      <div className="mechanism-gear evidence-gear"><Cog /></div>
      <svg className="mechanism-lines" viewBox="0 0 600 520" role="presentation">
        <path d="M72 350 C170 236 240 390 330 244 S488 130 552 190" />
        <path d="M120 98 H312 C352 98 366 126 366 164 V422" />
        <circle cx="72" cy="350" r="5" /><circle cx="552" cy="190" r="5" /><circle cx="366" cy="422" r="5" />
      </svg>
      <div className="mechanism-readout readout-top"><span>System state</span><b>CONNECTED</b></div>
      <div className="mechanism-readout readout-bottom"><span>Operating model</span><b>HUMAN LED</b></div>
      <div className="mechanism-pulse"><i /><i /><i /></div>
    </div>
  );
}

export function MechanicalMark({ label = 'Connected system' }: { label?: string }) {
  return (
    <span className="mechanical-mark" aria-hidden="true">
      <Cog className="mark-gear-one" size={34} />
      <Cog className="mark-gear-two" size={23} />
      <span>{label}</span>
    </span>
  );
}

export function SystemStatusStrip() {
  const items = [
    { icon: Gauge, label: 'Performance visible' },
    { icon: ShieldCheck, label: 'Controls explicit' },
    { icon: Sparkles, label: 'Improvement continuous' },
  ];
  return <div className="system-status-strip">{items.map(({ icon: Icon, label }) => <span key={label}><Icon size={15}/>{label}</span>)}</div>;
}

