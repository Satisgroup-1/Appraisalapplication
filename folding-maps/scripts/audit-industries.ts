import { industries } from '../lib/industries';

const fail = (message: string): never => {
  throw new Error(message);
};

if (industries.length !== 26) fail(`Expected 26 industries, received ${industries.length}`);

const uniqueFields = ['slug', 'headline', 'thesis', 'contextTitle', 'opportunitiesTitle', 'decisionsTitle', 'controlTitle', 'roadmapTitle'] as const;
for (const field of uniqueFields) {
  const values = industries.map((industry) => industry[field]);
  if (new Set(values).size !== values.length) fail(`Duplicate ${field} detected`);
}

const emDash = String.fromCodePoint(0x2014);
const audits = industries.map((industry) => {
  const published = JSON.stringify(industry);
  const words = published.split(/\s+/).length;
  if (words < 300) fail(`${industry.slug} is too thin at ${words} words`);
  if (published.includes(emDash)) fail(`${industry.slug} contains an em dash`);
  if (published.toLowerCase().includes('<table')) fail(`${industry.slug} contains table markup`);
  if (industry.opportunities.length !== 3 || industry.decisions.length !== 3 || industry.controls.length !== 2 || industry.roadmap.length !== 3) {
    fail(`${industry.slug} is missing a required editorial module`);
  }
  return { slug: industry.slug, words, motif: industry.motif };
});

const motifCount = new Set(audits.map((audit) => audit.motif)).size;
if (motifCount !== 6) fail(`Expected six visual motifs, received ${motifCount}`);

console.log(`Industry audit passed: ${audits.length} pages, ${motifCount} visual motifs, ${Math.min(...audits.map((audit) => audit.words))} to ${Math.max(...audits.map((audit) => audit.words))} words per perspective.`);
for (const audit of audits) console.log(`${audit.slug}: ${audit.words} words, ${audit.motif} motif`);
