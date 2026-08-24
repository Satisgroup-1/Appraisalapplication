// Pricing estimate research agents. Three run kinds — sales & rents, build
// cost, finance rates — each following the HPI agent's two-call pattern:
// a research call with web search (whose citations are incompatible with
// structured outputs), then a cheap extraction call against a JSON schema.
// Every number is sanitised by src/core/estimates.ts before it is returned;
// nothing the model says reaches an input field unchecked.
//
// The method encoded in these prompts was agreed explicitly:
//  - Sales: strict half-mile radius; sold prices (<=18 months) indexed to
//    TODAY via recorded local UK HPI, with regional/national blend bridging
//    the unrecorded recent months; reconciled against current asking prices;
//    new-conversion uplift measured from evidence where it exists; widen the
//    radius stepwise and SAY SO when evidence is thin. Estimates are TODAY'S
//    values — the model's own HPI setting projects to completion, once.
//  - Build: one blended all-in contract £/sqft (prelims + OH&P in,
//    contingency and demolition out — those are separate cost lines) for
//    conversion work in the region, anchored by the user's recorded tenders.
//  - Finance: rates shaped to this deal's LTV, size and asset type, anchored
//    by the user's recorded term sheets; deposit rate pegged to SONIA minus
//    a researched spread.

import { buildClient } from './auth';
import { MODEL } from './ai';
import {
  sanitizeBuildEstimates,
  sanitizeFinanceEstimates,
  sanitizeSalesEstimates,
} from '../src/core/estimates';
import type {
  BuildEstimates,
  FinanceEstimates,
  SalesEstimates,
  TenderRecord,
  TermSheetRecord,
} from '../src/core/types';

const EST_PROPS = {
  low: { type: 'number' },
  likely: { type: 'number' },
  high: { type: 'number' },
  confidence: { type: 'string', enum: ['high', 'medium', 'low'] },
  rationale: { type: 'string', description: 'How the figure was reached: evidence counts, radius used, adjustments made.' },
  sources: { type: 'array', items: { type: 'string' }, description: 'Named, dated sources.' },
} as const;

// NOTE on schema size: structured outputs compile the schema to a grammar
// with a hard size cap, and the API rejects large ones ("The compiled grammar
// is too large" — hit in production by the earlier sales schema, which nested
// this estimate object twelve times). The sales and finance schemas are
// therefore FLAT arrays of one small item schema; only the build schema,
// with a single figure, nests it.
const ESTIMATE_SCHEMA = {
  type: 'object',
  properties: EST_PROPS,
  required: ['low', 'likely', 'high', 'confidence', 'rationale', 'sources'],
  additionalProperties: false,
} as const;

/** Live progress reported to the UI while a run is under way. */
export interface EstimateProgressEvent {
  stage: 'research' | 'searching' | 'reading' | 'extracting';
  searches: number;
}
export type ProgressFn = (p: EstimateProgressEvent) => void;

/** Raw API errors mean nothing to a surveyor; translate the ones users hit. */
function explainEstimateError(e: unknown): Error {
  const msg = e instanceof Error ? e.message : String(e);
  if (/credit balance is too low/i.test(msg)) {
    return new Error(
      'The connected Anthropic account has no API credit. Top up under Plans & Billing at platform.claude.com (or switch account in Settings), then run the estimate again.',
    );
  }
  if (/rate.?limit/i.test(msg) || /\b429\b/.test(msg)) {
    return new Error('The API rate limit was hit. Wait a minute, then run the estimate again.');
  }
  if (/overloaded/i.test(msg) || /\b529\b/.test(msg)) {
    return new Error('The Anthropic API is briefly overloaded. Try again in a moment.');
  }
  if (/compiled grammar is too large/i.test(msg)) {
    return new Error('The API rejected the extraction schema (grammar too large). This is an app bug worth reporting.');
  }
  return e instanceof Error ? e : new Error(msg);
}

async function researchThenExtract(
  researchPrompt: string,
  extractPrompt: string,
  schema: Record<string, unknown>,
  onProgress?: ProgressFn,
): Promise<unknown> {
  try {
    const client = await buildClient();
    let searches = 0;
    let lastStage = '';
    const emit = (stage: EstimateProgressEvent['stage']) => {
      const tag = `${stage}:${searches}`;
      if (tag === lastStage) return;
      lastStage = tag;
      onProgress?.({ stage, searches });
    };
    emit('research');

    const research = client.messages.stream({
      model: MODEL,
      max_tokens: 20000,
      tools: [{ type: 'web_search_20260209', name: 'web_search', max_uses: 10 } as never],
      messages: [{ role: 'user', content: researchPrompt }],
    });
    // Each server_tool_use block is one web search being issued; text after
    // searches means the model is writing up what it read. Real signal, not
    // a spinner.
    research.on('streamEvent', (event) => {
      if (event.type !== 'content_block_start') return;
      const blockType = (event as { content_block?: { type?: string } }).content_block?.type;
      if (blockType === 'server_tool_use') {
        searches += 1;
        emit('searching');
      } else if (blockType === 'text' && searches > 0) {
        emit('reading');
      }
    });
    const researchMsg = await research.finalMessage();
    if (researchMsg.stop_reason === 'refusal') throw new Error('The model declined the research request.');
    const researchText = researchMsg.content
      .filter((b) => b.type === 'text')
      .map((b) => (b as { text: string }).text)
      .join('\n');
    if (!researchText.trim()) throw new Error('The research step returned nothing.');

    emit('extracting');
    const extract = await client.messages.create({
      model: MODEL,
      max_tokens: 8000,
      output_config: { format: { type: 'json_schema', schema } },
      messages: [{ role: 'user', content: `${extractPrompt}\n\n${researchText}` }],
    });
    if (extract.stop_reason === 'refusal') throw new Error('Extraction was declined.');
    const block = extract.content.find((b) => b.type === 'text');
    if (!block || block.type !== 'text') throw new Error('No structured output returned.');
    return JSON.parse(block.text);
  } catch (e) {
    throw explainEstimateError(e);
  }
}

// ---------------------------------------------------------------------------
// Sales & rents
// ---------------------------------------------------------------------------

const SALES_SCHEMA = {
  type: 'object',
  properties: {
    rates: {
      type: 'array',
      description: 'One entry per unit type with usable evidence. Omit a type entirely rather than guessing.',
      items: {
        type: 'object',
        properties: {
          type: { type: 'string', enum: ['commercial', 'studio', 'bed1', 'bed2', 'bed3', 'house'] },
          salePsfLow: { type: 'number' },
          salePsfLikely: { type: 'number', description: "TODAY'S sale £ per sqft, not projected forward." },
          salePsfHigh: { type: 'number' },
          rentPsfLow: { type: 'number' },
          rentPsfLikely: { type: 'number', description: 'Monthly rent £ per sqft.' },
          rentPsfHigh: { type: 'number' },
          confidence: { type: 'string', enum: ['high', 'medium', 'low'] },
          rationale: { type: 'string', description: 'Evidence counts, radius used, adjustments made.' },
          sources: { type: 'array', items: { type: 'string' } },
        },
        required: ['type', 'salePsfLow', 'salePsfLikely', 'salePsfHigh', 'confidence', 'rationale', 'sources'],
        additionalProperties: false,
      },
    },
    hpiAnnualPct: {
      type: 'array',
      items: { type: 'number' },
      description: 'Projected annual house price growth years 1-5 from today for this locality, decimals (0.03 = 3%).',
    },
    hpiRationale: { type: 'string' },
    hpiSources: { type: 'array', items: { type: 'string' } },
  },
  required: ['rates', 'hpiAnnualPct', 'hpiRationale', 'hpiSources'],
  additionalProperties: false,
} as const;

export async function estimateSales(
  payload: { address: string; unitTypes: string[] },
  onProgress?: ProgressFn,
): Promise<SalesEstimates> {
  const address = payload.address.trim();
  if (!address) throw new Error('The project needs an address before sales evidence can be researched.');
  const types = payload.unitTypes.length ? payload.unitTypes.join(', ') : 'studio, 1 bed, 2 bed, 3 bed flats';

  const raw = await researchThenExtract(
    `You are researching CURRENT sale and rental pricing evidence for a residential conversion appraisal at: ${address}, UK. The scheme will sell newly converted flats of these types: ${types}.

Work strictly by this method (search for real figures; never answer from memory):

1. SOLD PRICES: find flat sales within HALF A MILE of the address from the last 18 months (Land Registry sold price data via Rightmove/Zoopla sold sections or house price sites). For each unit type note price and floor area where available to get £ per sqft.
2. INDEX TO TODAY: sold prices are historic. Bring each up to TODAY using recorded local-authority UK House Price Index growth from the sale month; the most recent months are not yet published, so bridge them with the latest regional/national monthly growth. State the correction applied.
3. ASKING PRICES: find CURRENT for-sale listings of comparable flats within the same radius, note asking £/psf, and reconcile: asking prices usually overstate achieved by a few percent. Say which way the market is moving.
4. NEW-CONVERSION UPLIFT: the scheme's flats are newly converted; most evidence is older stock. Where recent sales of new or newly refurbished flats exist in the radius, MEASURE the uplift; where none exist, apply a researched benchmark uplift and say that is what you did.
5. THIN EVIDENCE: if a unit type has fewer than ~5 usable comparables in the half mile, widen the radius step by step until it does, mark that type's confidence lower, and STATE the radius actually used in its rationale.
6. RENTS: current rental listings for each type in the same locality, sanity-checked against ONS private rent statistics; monthly rent per sqft.
7. HPI: from ONS UK HPI and published 5-year regional forecasts (Savills, Knight Frank, JLL, OBR or similar), give projected annual growth for years 1-5 from today for this locality. Be conservative where forecasts disagree.

CRITICAL: the sale £/psf you conclude must be TODAY'S value. Do NOT project it to the scheme's completion date — the appraisal model applies the HPI projection itself, and projecting twice double-counts growth.

Conclude with, per unit type: low / likely / high sale £ per sqft TODAY, low / likely / high monthly rent £ per sqft, the evidence counts and radius used, and named dated sources. Then the 5-year HPI projection with sources.`,
    `Extract the pricing conclusions into the schema: one rates[] entry per unit type with usable evidence (type is one of commercial/studio/bed1/bed2/bed3/house). Sale £/psf as plain numbers (low/likely/high); rents as £ per sqft per MONTH (omit the rent fields if no rental evidence); HPI rates as decimals (3% -> 0.03), exactly 5 entries, year 1 first. Omit any unit type the analysis found no usable evidence for. Put the radius used and evidence counts in each rationale.`,
    SALES_SCHEMA as unknown as Record<string, unknown>,
    onProgress,
  );
  const clean = sanitizeSalesEstimates(raw, address, new Date().toISOString());
  if (Object.keys(clean.rates).length === 0) {
    throw new Error('No usable pricing evidence came back. Check the address, or enter rates manually.');
  }
  return clean;
}

// ---------------------------------------------------------------------------
// Build cost
// ---------------------------------------------------------------------------

const BUILD_SCHEMA = {
  type: 'object',
  properties: {
    blendedPsf: ESTIMATE_SCHEMA,
    // Two figures, both small enough that the schema grammar still compiles
    // (see the schema-size note above).
    tenderInflationPa: ESTIMATE_SCHEMA,
  },
  required: ['blendedPsf', 'tenderInflationPa'],
  additionalProperties: false,
} as const;

export async function estimateBuild(
  payload: {
    region: string;
    giaSqft: number;
    tenders: TenderRecord[];
  },
  onProgress?: ProgressFn,
): Promise<BuildEstimates> {
  const region = payload.region.trim() || 'the UK';
  const tenderLines = payload.tenders
    .slice(0, 20)
    .map((t) => `- ${t.date} ${t.region || 'region n/a'}: £${t.psf}/sqft (${t.projectName}${t.notes ? `; ${t.notes}` : ''})`)
    .join('\n');

  const raw = await researchThenExtract(
    `You are estimating the all-in construction cost rate for converting an existing building into flats in: ${region}. Scheme size: roughly ${Math.round(payload.giaSqft).toLocaleString('en-GB')} sqft GIA.

Research CURRENT published UK build cost data (search, do not answer from memory): BCIS-style indices, cost consultant guides (e.g. Spon's summaries, AECOM/G&T/RLB market reports), residential conversion/refurbishment £/sqft benchmarks, and recent build cost inflation.

Definition of the rate you are estimating — it must be directly comparable to a main-contract tender sum:
- INCLUDES: all trades, preliminaries, contractor overheads and profit.
- EXCLUDES: contingency, demolition/site clearance, professional fees, utilities connections, VAT. (The appraisal prices those separately.)
- Basis: conversion/refurbishment of an existing building to apartments, not new build.
- Adjust for the region with a published location factor, and state it.
${tenderLines ? `\nThe developer's own recent tender results — real prices from their contractors, the strongest anchor available. Index them forward for build cost inflation and weigh them heavily:\n${tenderLines}\n` : ''}
Then, SEPARATELY, forecast forward TENDER PRICE INFLATION — the annual rate at which a contract like this one is getting more expensive:
- Research the published BCIS Tender Price Index (and its forecast), plus current cost-consultant forecasts (AECOM, Gardiner & Theobald, RLB, Currie & Brown market updates) for UK construction tender prices over the next 1-3 years.
- Tender prices, NOT general CPI and NOT house prices: they are driven by labour availability, materials, and contractor workload/margin, and routinely diverge from both.
- Say clearly whether the market is currently inflating, flat, or softening, and give the figure as an ANNUAL rate.

Conclude with: (a) a low / likely / high all-in £ per sqft for this scheme TODAY, and (b) a low / likely / high annual tender price inflation rate, each with reasoning and named dated sources.`,
    `Extract both conclusions into the schema. blendedPsf: all-in contract £ per sqft TODAY (low/likely/high), with the location factor and evidence in the rationale. tenderInflationPa: forecast ANNUAL tender price inflation as a DECIMAL (4% -> 0.04; negative if softening), with the index and forecasts used in the rationale.`,
    BUILD_SCHEMA as unknown as Record<string, unknown>,
    onProgress,
  );
  const clean = sanitizeBuildEstimates(raw, region, new Date().toISOString());
  if (!clean) throw new Error('No usable build cost figure came back. Enter rates manually.');
  return clean;
}

// ---------------------------------------------------------------------------
// Finance rates
// ---------------------------------------------------------------------------

const FINANCE_SCHEMA = {
  type: 'object',
  properties: {
    rates: {
      type: 'array',
      description: 'One entry per figure the analysis reached a conclusion on.',
      items: {
        type: 'object',
        properties: {
          key: {
            type: 'string',
            enum: [
              'bridgeRatePa',
              'bridgeArrangementFee',
              'devLoanRatePa',
              'devLoanArrangementFee',
              'vatLoanRatePa',
              'refinanceRatePa',
              'depositRatePa',
            ],
          },
          ...EST_PROPS,
        },
        required: ['key', 'low', 'likely', 'high', 'confidence', 'rationale', 'sources'],
        additionalProperties: false,
      },
    },
    soniaRatePa: { type: 'number', description: 'The current SONIA rate found, as a decimal.' },
  },
  required: ['rates'],
  additionalProperties: false,
} as const;

export interface FinanceDealShape {
  purchasePrice: number;
  bridgeLtv: number;
  devFacilityEstimate: number;
  gdv: number;
  assetType: string; // e.g. 'commercial building converted to flats'
}

export async function estimateFinance(
  payload: {
    deal: FinanceDealShape;
    termSheets: TermSheetRecord[];
  },
  onProgress?: ProgressFn,
): Promise<FinanceEstimates> {
  const d = payload.deal;
  const gbp = (v: number) => `£${Math.round(v).toLocaleString('en-GB')}`;
  const sheets = payload.termSheets
    .slice(0, 20)
    .map(
      (t) =>
        `- ${t.date} ${t.lender} (${t.product}): ${(t.ratePa * 100).toFixed(2)}% pa, ${(t.arrangementFee * 100).toFixed(1)}% fee, ${(t.ltv * 100).toFixed(0)}% LTV, ${gbp(t.loanSize)}${t.notes ? `; ${t.notes}` : ''}`,
    )
    .join('\n');

  const raw = await researchThenExtract(
    `You are estimating CURRENT UK property finance pricing for a specific development deal. Shape the estimates to THIS deal, not generic headline rates, and state in each rationale which deal factors moved the figure.

The deal:
- Bridging loan against the purchase of a ${d.assetType || 'commercial building to convert to flats'}: purchase price ${gbp(d.purchasePrice)}, ${(d.bridgeLtv * 100).toFixed(0)}% LTV.
- Development facility ${d.devFacilityEstimate > 0 ? `of roughly ${gbp(d.devFacilityEstimate)}` : 'of a size typical for a scheme this end of the SME market'} against ${d.gdv > 0 ? `a GDV of ${gbp(d.gdv)}` : 'a GDV not yet established'}.
- A short VAT bridging facility (2-3 months, repaid by the HMRC reclaim).
- A BTL/portfolio refinance exit on the completed flats.
- Business instant-access deposit account for retained cash.

Research CURRENT figures (search, do not answer from memory):
1. Bridging loan pricing at this LTV band for commercial/semi-commercial assets (market roundups, lender rate cards, bridging indices such as the Bridging Trends report).
2. Development finance pricing for SME developers at this facility size and leverage (rates and arrangement fees).
3. VAT bridging loan pricing.
4. BTL/portfolio mortgage rates for limited companies at ~65-75% LTV.
5. The CURRENT SONIA rate (Bank of England), and typical instant-access business deposit rates relative to it — express the deposit estimate as SONIA minus the researched spread.
${sheets ? `\nTerms this developer has actually been quoted — the strongest anchor for what lenders offer THEM. Weigh these heavily, adjusted for market movement since each date:\n${sheets}\n` : ''}
Conclude with low / likely / high for: bridge rate pa and arrangement fee, dev loan rate pa and arrangement fee, VAT loan rate pa, refinance rate pa, deposit rate pa (and the SONIA rate used). All rates ANNUAL. Named dated sources for each.`,
    `Extract the finance pricing conclusions into the schema: one rates[] entry per figure (key names which figure it is). All rates and fees as DECIMALS per annum (10.5% -> 0.105). Include soniaRatePa if the analysis found it.`,
    FINANCE_SCHEMA as unknown as Record<string, unknown>,
    onProgress,
  );
  const clean = sanitizeFinanceEstimates(raw, new Date().toISOString());
  if (!clean) throw new Error('No usable finance rates came back. Enter rates manually.');
  return clean;
}
