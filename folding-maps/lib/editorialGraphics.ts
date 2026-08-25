import { evidenceViews as ai_integration_gap } from '@/lib/articles/ai-integration-gap';
import { evidenceViews as open_weight_price_war } from '@/lib/articles/open-weight-price-war';
import { evidenceViews as automation_before_agents } from '@/lib/articles/automation-before-agents';
import { evidenceViews as cold_chain_collaboration } from '@/lib/articles/cold-chain-collaboration';
import { evidenceViews as small_teams_ai_advantage } from '@/lib/articles/small-teams-ai-advantage';
import { evidenceViews as measure_automation_value } from '@/lib/articles/measure-automation-value';
import { evidenceViews as legal_ai_source_grounded_work } from '@/lib/articles/legal-ai-source-grounded-work';
import { evidenceViews as hospitality_ai_guest_recovery } from '@/lib/articles/hospitality-ai-guest-recovery';

export type EvidencePoint = {
  label: string;
  value: number;
  display: string;
  detail: string;
};

export type EvidenceView = {
  label: string;
  title: string;
  summary: string;
  interpretation?: {
    establishes: string;
    doesNotEstablish: string;
    management: string;
  };
  source: string;
  href?: string;
  points: EvidencePoint[];
};


export const newsEvidenceViews: Record<string, EvidenceView[]> = {
  'ai-integration-gap': ai_integration_gap,
  'open-weight-price-war': open_weight_price_war,
  'automation-before-agents': automation_before_agents,
  'cold-chain-collaboration': cold_chain_collaboration,
  'small-teams-ai-advantage': small_teams_ai_advantage,
  'measure-automation-value': measure_automation_value,
  'legal-ai-source-grounded-work': legal_ai_source_grounded_work,
  'hospitality-ai-guest-recovery': hospitality_ai_guest_recovery,
};
