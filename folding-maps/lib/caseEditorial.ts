import { editorial as yacht_operations } from '@/lib/cases/yacht-operations';
import { editorial as cold_chain } from '@/lib/cases/cold-chain';
import { editorial as property_pipeline } from '@/lib/cases/property-pipeline';
import { editorial as professional_services_intake } from '@/lib/cases/professional-services-intake';
import { editorial as field_service_planning } from '@/lib/cases/field-service-planning';

import type { ReportSection } from '@/lib/reportNarrative';

export type CaseExhibitPlacement = { kind: 'evidence' | 'process' | 'system'; afterParagraph: number };
export type CaseEditorialParagraph = { text: string; sources?: number[] };
export type CaseEditorialSection = Omit<ReportSection<CaseExhibitPlacement>, 'paragraphs'> & {
  paragraphs: CaseEditorialParagraph[];
};
export type CaseEditorial = {
  statusStatement: string;
  thesis: string;
  sceneLabel: string;
  openingTitle: string;
  openingParagraphs: string[];
  centralQuestion: string;
  evidenceTitle?: string;
  processTitle: string;
  systemTitle: string;
  evidenceInterpretation?: { establishes: string; doesNotEstablish: string; management: string };
  sections: CaseEditorialSection[];
};

/** One file per project, under lib/cases. */
export const caseEditorial: Record<string, CaseEditorial> = {
  'yacht-operations': yacht_operations,
  'cold-chain': cold_chain,
  'property-pipeline': property_pipeline,
  'professional-services-intake': professional_services_intake,
  'field-service-planning': field_service_planning,
};
