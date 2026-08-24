'use client';

import { useState, type CSSProperties, type PointerEvent } from 'react';
import { ArrowRight, CheckCircle2, Cpu, Database, ScanLine, ShieldCheck } from 'lucide-react';
import type { ServiceUseCase } from '@/lib/services';

type Props = {
  stages: { label: string; detail: string }[];
  useCases: ServiceUseCase[];
};

const stageIcons = [Database, Cpu, ShieldCheck, CheckCircle2];

export function ServiceSystemLab({ stages, useCases }: Props) {
  const [active, setActive] = useState(0);
  const [tilt, setTilt] = useState({ x: 58, z: -16 });
  const current = useCases[active];
  const labStyle = { '--lab-x': `${tilt.x}deg`, '--lab-z': `${tilt.z}deg` } as CSSProperties;

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    const box = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - box.left) / box.width - 0.5;
    const y = (event.clientY - box.top) / box.height - 0.5;
    setTilt({ x: 58 - y * 12, z: -16 + x * 14 });
  }

  return (
    <section className="service-system-lab" aria-labelledby="system-lab-title">
      <div className="system-lab-heading">
        <div>
          <span className="kicker">Interactive system model</span>
          <h2 id="system-lab-title">Follow the work<br/><em>through the system.</em></h2>
        </div>
        <p>Select a use case, then move across the model to inspect how information, reasoning, controls and action connect.</p>
      </div>

      <div className="system-lab-tabs" role="group" aria-label="Select a use case">
        {useCases.map((useCase, index) => (
          <button key={useCase.title} type="button" aria-pressed={active === index} onClick={() => setActive(index)}>
            <span>0{index + 1}</span>{useCase.title}
          </button>
        ))}
      </div>

      <div className="system-lab-layout">
        <div
          className="system-lab-scene"
          style={labStyle}
          onPointerMove={handlePointerMove}
          onPointerLeave={() => setTilt({ x: 58, z: -16 })}
          aria-hidden="true"
        >
          <div className="system-lab-plane">
            <div className="system-lab-grid" />
            <div className="system-lab-rail" />
            {[0, 1, 2].map((packet) => <i className={`system-packet packet-${packet + 1}`} key={packet} />)}
            {stages.map((stage, index) => {
              const Icon = stageIcons[index] ?? ScanLine;
              return (
                <div className={`system-stage stage-${index + 1}`} key={stage.label}>
                  <div className="system-stage-face"><Icon/><b>{current.path[index]}</b><span>{stage.label}</span></div>
                  <div className="system-stage-side" />
                  <div className="system-stage-depth" />
                </div>
              );
            })}
          </div>
          <span className="system-axis axis-x">WORKFLOW</span>
          <span className="system-axis axis-y">CONTROL DEPTH</span>
        </div>

        <div className="system-lab-readout" aria-live="polite">
          <span>Selected pathway</span>
          <h3>{current.title}</h3>
          <p>{current.problem}</p>
          <div><b>Example in operation</b><p>{current.example}</p></div>
          <ol>{stages.map((stage, index) => <li key={stage.label}><span>0{index + 1}</span><div><b>{stage.label}</b><p>{stage.detail}</p></div>{index < stages.length - 1 && <ArrowRight size={14}/>}</li>)}</ol>
        </div>
      </div>
    </section>
  );
}
