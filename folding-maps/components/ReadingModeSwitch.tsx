'use client';

import { useEffect, useState, type KeyboardEvent } from 'react';
import type { ReadingMode } from '@/lib/reportNarrative';

export const READING_MODE_STORAGE_KEY = 'quiet-gears-reading-mode';

export function ReadingModeSwitch({ simplePanelId, advancedPanelId }: { simplePanelId: string; advancedPanelId: string }) {
  const [mode, setMode] = useState<ReadingMode>('advanced');

  useEffect(() => {
    const current = document.documentElement.dataset.readingMode;
    setMode(current === 'simple' ? 'simple' : 'advanced');
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== READING_MODE_STORAGE_KEY) return;
      const next = event.newValue === 'simple' ? 'simple' : 'advanced';
      document.documentElement.dataset.readingMode = next;
      setMode(next);
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  function selectMode(next: ReadingMode) {
    document.documentElement.dataset.readingMode = next;
    window.localStorage.setItem(READING_MODE_STORAGE_KEY, next);
    setMode(next);
    window.dispatchEvent(new CustomEvent('readingmodechange', { detail: next }));
  }

  function selectWithKeyboard(event: KeyboardEvent<HTMLButtonElement>, next: ReadingMode) {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    selectMode(next);
  }

  return (
    <div className="reading-mode-control" role="group" aria-label="Report reading level">
      <div>
        <span>Reading level</span>
        <p>{mode === 'advanced' ? 'Technical analysis and implementation detail' : 'Concise executive explanation'}</p>
      </div>
      <div className="reading-mode-buttons">
        <button type="button" aria-pressed={mode === 'simple'} aria-controls={simplePanelId} onClick={() => selectMode('simple')} onKeyDown={(event) => selectWithKeyboard(event, 'simple')}>Simple</button>
        <button type="button" aria-pressed={mode === 'advanced'} aria-controls={advancedPanelId} onClick={() => selectMode('advanced')} onKeyDown={(event) => selectWithKeyboard(event, 'advanced')}>Advanced</button>
      </div>
    </div>
  );
}
