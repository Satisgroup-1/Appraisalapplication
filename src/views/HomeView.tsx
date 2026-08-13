// Projects homepage: the app opens here. Editorial hero, then the projects
// library as framed cards (brass crop-mark corners, per the group website's
// architectural-drawing motif). Select a project to enter its workspace.

import { useEffect, useState } from 'react';
import type { ProjectSummary } from '../core/types';
import Eyebrow from '../components/Eyebrow';
import { useStore } from '../state/store';

export default function HomeView() {
  const summaries = useStore((s) => s.summaries);
  const refreshSummaries = useStore((s) => s.refreshSummaries);
  const createProject = useStore((s) => s.createProject);
  const createDemoProject = useStore((s) => s.createDemoProject);
  const openProjectById = useStore((s) => s.openProjectById);
  const importProjectJson = useStore((s) => s.importProjectJson);
  const deleteProject = useStore((s) => s.deleteProject);
  const setView = useStore((s) => s.setView);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  useEffect(() => {
    void refreshSummaries();
  }, [refreshSummaries]);

  async function importFromFile() {
    setError(null);
    const res = await window.satis.openProject();
    if (!res) return;
    try {
      importProjectJson(res.json);
    } catch (e) {
      setError(`Could not import project: ${(e as Error).message}`);
    }
  }

  return (
    <div className="home">
      <header className="home-hero">
        <div className="home-wordmark">SATIS</div>
        <div className="home-sub">Appraisal: floorplan conversion &amp; development DCF</div>
      </header>

      <Eyebrow index="01" label="Projects" />
      <div className="home-actions">
        <button className="btn" onClick={() => createProject()}>
          New project
        </button>
        <button className="btn ghost" onClick={importFromFile}>
          Import project file
        </button>
        <button className="btn ghost" onClick={() => createDemoProject()}>
          Create demo project
        </button>
        <button className="btn ghost" onClick={() => setView('settings')}>
          Settings
        </button>
      </div>
      {error && <div className="warn-box">{error}</div>}

      {summaries.length === 0 ? (
        <div className="empty-state">
          No projects yet.
          <br />
          Start a new project, or create the demo: a former retail building ready to convert.
        </div>
      ) : (
        <div className="project-grid">
          {summaries.map((s, i) => (
            <ProjectCard
              key={s.id}
              summary={s}
              index={i}
              onOpen={() => openProjectById(s.id)}
              confirming={confirmDelete === s.id}
              onDelete={() => {
                if (confirmDelete === s.id) {
                  setConfirmDelete(null);
                  void deleteProject(s.id);
                } else {
                  setConfirmDelete(s.id);
                  setTimeout(() => setConfirmDelete((c) => (c === s.id ? null : c)), 3000);
                }
              }}
            />
          ))}
        </div>
      )}

      <footer className="home-foot">
        <span>SATIS GROUP</span>
        <span>Feasibility schematics &amp; financial estimates, not architecture or advice</span>
      </footer>
    </div>
  );
}

function ProjectCard({
  summary,
  index,
  onOpen,
  onDelete,
  confirming,
}: {
  summary: ProjectSummary;
  index: number;
  onOpen: () => void;
  onDelete: () => void;
  confirming: boolean;
}) {
  const updated = summary.updatedAt
    ? new Date(summary.updatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    : 'not yet saved';
  return (
    <div className="project-card">
      <span className="corner tl" aria-hidden="true" />
      <span className="corner tr" aria-hidden="true" />
      <span className="corner bl" aria-hidden="true" />
      <span className="corner br" aria-hidden="true" />
      <button className="project-card-body" onClick={onOpen}>
        <span className="project-index">{String(index + 1).padStart(2, '0')}</span>
        <FacadeGlyph floors={summary.floorCount} seed={summary.id} />
        <h4>{summary.name}</h4>
        <div className="project-meta">
          {summary.address || 'No address'}
          <br />
          {summary.floorCount} floor{summary.floorCount === 1 ? '' : 's'} · updated {updated}
        </div>
      </button>
      <button className={`project-delete ${confirming ? 'confirming' : ''}`} onClick={onDelete}>
        {confirming ? 'Confirm delete' : 'Delete'}
      </button>
    </div>
  );
}

/** Little architectural elevation glyph — one storey per captured floor. */
function FacadeGlyph({ floors, seed }: { floors: number; seed: string }) {
  const storeys = Math.max(1, Math.min(6, floors || 1));
  const w = 132;
  const storeyH = 16;
  const h = storeys * storeyH + 14;
  const hash = [...seed].reduce((a, c) => a + c.charCodeAt(0), 0);
  const bays = 4 + (hash % 3);
  return (
    <svg className="facade-glyph" viewBox={`0 0 ${w} ${h}`} width={w} height={h} aria-hidden="true">
      <rect x="6" y="6" width={w - 12} height={h - 12} fill="none" stroke="currentColor" strokeWidth="1.5" />
      {Array.from({ length: storeys - 1 }, (_, i) => (
        <line key={i} x1="6" y1={6 + storeyH * (i + 1)} x2={w - 6} y2={6 + storeyH * (i + 1)} stroke="currentColor" strokeWidth="0.6" />
      ))}
      {Array.from({ length: storeys }, (_, s) =>
        Array.from({ length: bays }, (_, b) => (
          <rect
            key={`${s}-${b}`}
            x={12 + b * ((w - 24) / bays) + ((w - 24) / bays - 6) / 2}
            y={6 + storeyH * s + 4.5}
            width={6}
            height={7}
            fill="none"
            stroke="currentColor"
            strokeWidth="0.75"
          />
        )),
      )}
      <line x1="0" y1={h - 6} x2={w} y2={h - 6} stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
