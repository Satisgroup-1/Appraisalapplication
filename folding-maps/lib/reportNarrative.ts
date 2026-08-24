export type ReportSource = {
  label: string;
  href: string;
  detail?: string;
};

export type ReportParagraph = {
  text: string;
  sources?: ReportSource[];
};

export type ReportSection<TExhibit> = {
  heading: string;
  purpose: string;
  role?: 'analysis' | 'counterargument' | 'conclusion';
  transition?: string;
  paragraphs: ReportParagraph[];
  exhibits?: TExhibit[];
};

export type ReadingMode = 'simple' | 'advanced';

export type ReportOpening = {
  label: string;
  title: string;
  paragraphs: string[];
  centralQuestion?: string;
};

export type ReportVariant<TExhibit> = {
  standfirst: string;
  thesis: string;
  opening?: ReportOpening;
  sections: ReportSection<TExhibit>[];
  actionAgenda: string[];
  estimatedReadingTime: string;
};

export function dedupeSources(sources: ReportSource[]) {
  const registry = new Map<string, ReportSource>();
  sources.forEach((source) => {
    const current = registry.get(source.href);
    registry.set(source.href, current ? { ...current, detail: current.detail ?? source.detail } : source);
  });
  return [...registry.values()];
}
