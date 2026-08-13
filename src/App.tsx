import { useStore, type View } from './state/store';
import ProjectView from './views/ProjectView';
import PricingView from './views/PricingView';
import OptionsView from './views/OptionsView';
import AppraisalView from './views/AppraisalView';
import SettingsView from './views/SettingsView';

const NAV: { key: View; label: string; step?: string }[] = [
  { key: 'project', label: 'Building', step: '1' },
  { key: 'pricing', label: 'Pricing', step: '2' },
  { key: 'options', label: 'Options', step: '3' },
  { key: 'appraisal', label: 'Appraisal', step: '4' },
  { key: 'settings', label: 'Settings' },
];

export default function App() {
  const view = useStore((s) => s.view);
  const setView = useStore((s) => s.setView);
  const project = useStore((s) => s.project);
  const busy = useStore((s) => s.busy);

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="wordmark">
          <span className="satis">SATIS</span>
          <span className="sub">Appraisal</span>
        </div>
        <nav className="nav">
          {NAV.map((n) => (
            <button key={n.key} className={view === n.key ? 'active' : ''} onClick={() => setView(n.key)}>
              <span className="step-no">{n.step ?? ''}</span>
              {n.label}
            </button>
          ))}
        </nav>
        <div className="foot">
          {busy ? (
            <>{busy}</>
          ) : (
            <>
              {project.name}
              <br />
              {project.floors.length} floor{project.floors.length === 1 ? '' : 's'} captured
            </>
          )}
        </div>
      </aside>
      <main className="main">
        {view === 'project' && <ProjectView />}
        {view === 'pricing' && <PricingView />}
        {view === 'options' && <OptionsView />}
        {view === 'appraisal' && <AppraisalView />}
        {view === 'settings' && <SettingsView />}
      </main>
    </div>
  );
}
