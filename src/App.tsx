import { useStore, type View } from './state/store';
import Splash from './components/Splash';
import HomeView from './views/HomeView';
import ProjectView from './views/ProjectView';
import PricingView from './views/PricingView';
import OptionsView from './views/OptionsView';
import AppraisalView from './views/AppraisalView';
import SettingsView from './views/SettingsView';

const NAV: { key: View; label: string; step: string }[] = [
  { key: 'project', label: 'Building', step: '01' },
  { key: 'pricing', label: 'Pricing', step: '02' },
  { key: 'options', label: 'Options', step: '03' },
  { key: 'appraisal', label: 'Appraisal', step: '04' },
];

export default function App() {
  const view = useStore((s) => s.view);
  const setView = useStore((s) => s.setView);
  const project = useStore((s) => s.project);
  const busy = useStore((s) => s.busy);
  const closeProject = useStore((s) => s.closeProject);
  const splashDone = useStore((s) => s.splashDone);

  const inWorkspace = project !== null && view !== 'home' && view !== 'settings';

  return (
    <>
      <Splash />
      {splashDone &&
        (view === 'home' || (view === 'settings' && !project) ? (
          <div className="home-shell">
            {view === 'settings' ? (
              <div className="home settings-standalone">
                <button className="btn ghost small" onClick={() => setView('home')}>
                  ← Projects
                </button>
                <SettingsView />
              </div>
            ) : (
              <HomeView />
            )}
          </div>
        ) : (
          <div className="app">
            <aside className="sidebar">
              <div className="wordmark">
                <span className="satis">SATIS</span>
                <span className="sub">Appraisal</span>
              </div>
              <button className="back-link" onClick={closeProject}>
                ← Projects
              </button>
              <div className="project-name">{project?.name}</div>
              <nav className="nav">
                {NAV.map((n) => (
                  <button key={n.key} className={view === n.key ? 'active' : ''} onClick={() => setView(n.key)}>
                    <span className="step-no">{n.step}</span>
                    {n.label}
                  </button>
                ))}
                <button className={view === 'settings' ? 'active' : ''} onClick={() => setView('settings')}>
                  <span className="step-no" />
                  Settings
                </button>
              </nav>
              <div className="foot">
                {busy ? (
                  <>{busy}</>
                ) : (
                  <>
                    {project?.floors.length ?? 0} floor{(project?.floors.length ?? 0) === 1 ? '' : 's'} captured
                    <br />
                    <span className="autosave">Autosaved</span>
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
        ))}
    </>
  );
}
