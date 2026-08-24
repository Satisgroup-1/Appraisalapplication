import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { industries } from '@/lib/industries';
import { getIndustryServiceRecommendations, industryServiceRecommendations } from '@/lib/industry-services';
import { getService } from '@/lib/services';

describe('industry perspectives', () => {
  it('provides all 26 requested industry routes', () => {
    expect(industries).toHaveLength(26);
    expect(new Set(industries.map((industry) => industry.slug)).size).toBe(26);
  });

  it('keeps every perspective complete and editorially distinct', () => {
    expect(new Set(industries.map((industry) => industry.headline)).size).toBe(26);
    expect(new Set(industries.map((industry) => industry.thesis)).size).toBe(26);
    expect(new Set(industries.map((industry) => industry.contextTitle)).size).toBe(26);
    expect(industries.every((industry) => (
      industry.context.length === 2
      && industry.opportunities.length === 3
      && industry.decisions.length === 3
      && industry.controls.length === 2
      && industry.roadmap.length === 3
      && industry.signalLabels.length === 4
    ))).toBe(true);
  });

  it('uses professional long-form content rather than thin route copy', () => {
    expect(industries.every((industry) => JSON.stringify(industry).split(/\s+/).length > 300)).toBe(true);
  });

  it('contains no em dashes or table markup', () => {
    const published = JSON.stringify({ industries, industryServiceRecommendations });
    const page = readFileSync('app/industries/[slug]/page.tsx', 'utf8');
    expect(published).not.toContain('—');
    expect(`${published}${page}`.toLowerCase()).not.toContain('<table');
  });

  it('provides three valid service recommendations for every industry', () => {
    industries.forEach((industry) => {
      const recommendations = getIndustryServiceRecommendations(industry.slug);
      expect(recommendations).toHaveLength(3);
      expect(new Set(recommendations.map(({ slug }) => slug)).size).toBe(3);
      recommendations.forEach(({ slug, rationale }) => {
        expect(getService(slug)).toBeDefined();
        expect(rationale.length).toBeGreaterThan(70);
      });
    });
    expect(Object.keys(industryServiceRecommendations)).toHaveLength(industries.length);
  });

  it('gives every sector page a navigable structure rather than a decorative one', () => {
    // The decorative per-sector motif was removed with the 2026 institutional
    // rebuild. What each page must now carry is a contents rail whose entries
    // match real section anchors, so a long page stays navigable.
    const page = readFileSync('app/industries/[slug]/page.tsx', 'utf8');
    const navSections = [...page.matchAll(/\{ id: '([a-z-]+)', label: '[^']+' \}/g)].map(
      ([, id]) => id,
    );
    expect(navSections.length).toBeGreaterThanOrEqual(6);
    navSections.forEach((id) => {
      expect(page).toContain(`id="${id}"`);
    });
    expect(page).toContain('<SectionNav sections={sections} />');
  });
});
