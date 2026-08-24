import { ArrowDown, Check, Cog } from 'lucide-react';
import { serviceJourney, servicePathways } from '@/lib/serviceModel';

export function ServiceJourney({ compact = false }: { compact?: boolean }) {
  return (
    <section className={`service-journey ${compact ? 'compact' : ''}`}>
      <div className="journey-heading">
        <span className="kicker">What help looks like</span>
        <h2>From a useful first question<br/><em>to an adopted system.</em></h2>
        <p>Every stage produces a decision or deliverable. You always know what Quiet Gears is doing, what we need from you and what must be true before the work progresses.</p>
      </div>
      <div className="journey-rail">
        {serviceJourney.map((stage, index) => (
          <article key={stage.number}>
            <div className="journey-stage-top"><span>{stage.number}</span><Cog size={24}/></div>
            <small>{stage.timing}</small>
            <h3>{stage.title}</h3>
            <p>{stage.detail}</p>
            <div><b>What you receive</b><span>{stage.output}</span></div>
            {index < serviceJourney.length - 1 && <ArrowDown className="journey-arrow" size={18}/>} 
          </article>
        ))}
      </div>
    </section>
  );
}

export function ServicePathways() {
  return (
    <section className="service-pathways">
      <div className="journey-heading">
        <span className="kicker">Ways to engage</span>
        <h2>Start at the point<br/><em>your decision requires.</em></h2>
      </div>
      <div className="pathway-grid">
        {servicePathways.map((pathway, index) => (
          <article key={pathway.title}>
            <span>0{index + 1}</span>
            <h3>{pathway.title}</h3>
            <p><b>Best for:</b> {pathway.bestFor}</p>
            <ul>{pathway.includes.map((item) => <li key={item}><Check size={15}/>{item}</li>)}</ul>
          </article>
        ))}
      </div>
    </section>
  );
}

