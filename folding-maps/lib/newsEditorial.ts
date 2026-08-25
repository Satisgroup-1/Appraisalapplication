import type { ReportSection, ReportSource } from '@/lib/reportNarrative';
import { article as ai_integration_gap } from '@/lib/articles/ai-integration-gap';
import { article as open_weight_price_war } from '@/lib/articles/open-weight-price-war';
import { article as automation_before_agents } from '@/lib/articles/automation-before-agents';
import { article as cold_chain_collaboration } from '@/lib/articles/cold-chain-collaboration';
import { article as small_teams_ai_advantage } from '@/lib/articles/small-teams-ai-advantage';
import { article as measure_automation_value } from '@/lib/articles/measure-automation-value';
import { article as legal_ai_source_grounded_work } from '@/lib/articles/legal-ai-source-grounded-work';
import { article as hospitality_ai_guest_recovery } from '@/lib/articles/hospitality-ai-guest-recovery';

export type EditorialSource = ReportSource;
export type NewsExhibitPlacement =
  | { kind: 'evidence'; view: number; afterParagraph: number }
  | { kind: 'system'; afterParagraph: number };
export type EditorialSection = ReportSection<NewsExhibitPlacement>;

export type NewsEditorial = {
  title: string;
  standfirst: string;
  thesis: string;
  sceneLabel: string;
  sceneTitle: string;
  sceneParagraphs: string[];
  sections: EditorialSection[];
};


/** One file per article, under lib/articles. */
export const newsEditorial: Record<string, NewsEditorial> = {
  'ai-integration-gap': ai_integration_gap,
  'open-weight-price-war': open_weight_price_war,
  'automation-before-agents': automation_before_agents,
  'cold-chain-collaboration': cold_chain_collaboration,
  'small-teams-ai-advantage': small_teams_ai_advantage,
  'measure-automation-value': measure_automation_value,
  'legal-ai-source-grounded-work': legal_ai_source_grounded_work,
  'hospitality-ai-guest-recovery': hospitality_ai_guest_recovery,
};
