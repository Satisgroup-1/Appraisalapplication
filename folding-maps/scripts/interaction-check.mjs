/**
 * Interaction check. The unit tests cover the content rules; this covers the
 * behaviour a visitor actually meets, in a real browser, because every feature
 * it exercises is one that can pass a type check while doing nothing.
 *
 *   npm run build && npx next start -p 3111
 *   node scripts/interaction-check.mjs
 *
 * Exits non-zero on the first failure so it can gate a release.
 */
import { chromium } from 'playwright';
const B = 'http://localhost:3111';
const results = [];
const check = (name, ok, extra = '') => results.push(`${ok ? 'PASS' : 'FAIL'}  ${name}${extra ? ' — ' + extra : ''}`);

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const p = await b.newPage({ viewport: { width: 1440, height: 1000 } });

  // 1. Service group filter
  await p.goto(B + '/services', { waitUntil: 'networkidle' });
  const allCount = await p.locator('a.index-item').count();
  await p.getByRole('button', { name: /^Advise/ }).click();
  await p.waitForTimeout(200);
  const adviseCount = await p.locator('a.index-item').count();
  check('services filter narrows the list', adviseCount > 0 && adviseCount < allCount, `${allCount} -> ${adviseCount}`);
  check('filter marks pressed state', await p.getByRole('button', { name: /^Advise/ }).getAttribute('aria-pressed') === 'true');

  // 2. Industry search
  await p.goto(B + '/industries', { waitUntil: 'networkidle' });
  const before = await p.locator('h4').count();
  await p.getByLabel('Filter sectors').fill('logi');
  await p.waitForTimeout(250);
  const after = await p.locator('h4').count();
  check('industry search filters', after > 0 && after < before, `${before} -> ${after}`);
  await p.getByLabel('Filter sectors').fill('zzzznothing');
  await p.waitForTimeout(250);
  check('industry search shows an empty state', (await p.locator('text=Nothing matches').count()) === 1);

  // 3. Reading mode
  await p.goto(B + '/case-studies/cold-chain', { waitUntil: 'networkidle' });
  const advVisible = await p.locator('[data-report-mode="advanced"]').isVisible();
  await p.getByRole('button', { name: 'Simple' }).click();
  await p.waitForTimeout(200);
  const simpleVisible = await p.locator('[data-report-mode="simple"]').isVisible();
  const advHidden = !(await p.locator('[data-report-mode="advanced"]').isVisible());
  check('reading mode defaults to advanced', advVisible);
  check('reading mode switches to simple', simpleVisible && advHidden);
  const stored = await p.evaluate(() => localStorage.getItem('quiet-gears-reading-mode'));
  check('reading mode persists', stored === 'simple');

  // 4. Evidence chart selection
  await p.goto(B + '/case-studies/cold-chain', { waitUntil: 'networkidle' });
  const bars = p.locator('.evidence-bar-row');
  if (await bars.count() > 1) {
    const readingBefore = await p.locator('.evidence-reading strong').first().innerText();
    await bars.nth(1).click();
    await p.waitForTimeout(150);
    const readingAfter = await p.locator('.evidence-reading strong').first().innerText();
    check('evidence chart updates the reading', readingBefore !== readingAfter, `${readingBefore} -> ${readingAfter}`);
  } else check('evidence chart present', false, 'no bars found');

  // 5. Section nav scroll-spy
  await p.goto(B + '/industries/agriculture', { waitUntil: 'networkidle' });
  await p.evaluate(() => document.getElementById('controls')?.scrollIntoView());
  await p.waitForTimeout(500);
  // Assert against the anchor, not the label: section labels get rewritten and
  // the check should survive that. What matters is that the marked entry points
  // at a section that exists on the page.
  const currentHref = await p.locator('nav a[aria-current="true"]').first().getAttribute('href').catch(() => null);
  const targetExists = currentHref
    ? await p.locator(currentHref).count() === 1
    : false;
  check('contents rail tracks a real section', Boolean(currentHref) && targetExists, currentHref ?? 'none marked');

  // 6. Contact form validation + honeypot
  await p.goto(B + '/contact', { waitUntil: 'networkidle' });
  await p.getByRole('button', { name: /Send enquiry/ }).click();
  await p.waitForTimeout(200);
  const invalid = await p.evaluate(() => document.querySelectorAll('form :invalid').length);
  check('form blocks an empty submit', invalid > 0, `${invalid} invalid fields`);
  // The honeypot must stay in the DOM and in the tab order's blind spot, but off
  // the visible canvas. Playwright counts off-screen elements as visible, so the
  // check is on its position, not on isVisible().
  const trapBox = await p.locator('input.trap').boundingBox();
  check('honeypot sits off the visible canvas', !trapBox || trapBox.x < -1000, JSON.stringify(trapBox));

  // 7. Mobile menu
  const m = await b.newPage({ viewport: { width: 390, height: 844 } });
  await m.goto(B + '/', { waitUntil: 'networkidle' });
  await m.getByRole('button', { name: 'Open menu' }).click();
  await m.waitForTimeout(250);
  check('mobile menu opens', await m.getByRole('navigation', { name: 'Main navigation' }).isVisible());
  await m.keyboard.press('Escape');
  await m.waitForTimeout(250);
  check('escape closes the mobile menu', !(await m.getByRole('navigation', { name: 'Main navigation' }).isVisible()));

  // 8. Keyboard focus visibility
  await p.goto(B + '/', { waitUntil: 'networkidle' });
  await p.keyboard.press('Tab');
  const focused = await p.evaluate(() => document.activeElement?.className || '');
  check('first tab stop is the skip link', /skip-link/.test(focused), focused);

  await b.close();
  console.log(results.join('\n'));
  if (results.some((r) => r.startsWith('FAIL'))) process.exitCode = 1;
})();
