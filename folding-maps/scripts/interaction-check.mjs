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

  // 3. One reading level: the whole report is in the page with scripting off
  await p.goto(B + '/case-studies/cold-chain', { waitUntil: 'networkidle' });
  check('no reading-level control is rendered', (await p.locator('.reading-mode-control').count()) === 0);
  const noScript = await b.newContext({ javaScriptEnabled: false });
  const plain = await noScript.newPage();
  await plain.goto(B + '/case-studies/cold-chain', { waitUntil: 'domcontentloaded' });
  const headings = await plain.locator('.report-body h2').count();
  const hidden = await plain.locator('.report-body h2').evaluateAll((nodes) =>
    nodes.filter((node) => !node.getBoundingClientRect().height).length);
  check('every section renders without scripting', headings >= 4 && hidden === 0, `${headings} sections, ${hidden} hidden`);
  await noScript.close();

  // 3b. The site's own typeface actually reaches the page. --sans is derived
  // from the font variable at :root, so setting that variable anywhere below
  // <html> silently serves the whole site in the browser default serif.
  await p.goto(B + '/', { waitUntil: 'networkidle' });
  const family = await p.evaluate(() => getComputedStyle(document.body).fontFamily);
  check('body renders in the site typeface', /IBM Plex Sans/.test(family), family);

  // 4. Evidence chart selection. Aimed at an article: the projects publish a
  // chart only once the firm has supplied the count behind it, and none has.
  await p.goto(B + '/news/measure-automation-value', { waitUntil: 'networkidle' });
  const bars = p.locator('.evidence-bar-row');
  if (await bars.count() > 1) {
    const readingBefore = await p.locator('.evidence-reading strong').first().innerText();
    await bars.nth(1).click();
    await p.waitForTimeout(150);
    const readingAfter = await p.locator('.evidence-reading strong').first().innerText();
    check('evidence chart updates the reading', readingBefore !== readingAfter, `${readingBefore} -> ${readingAfter}`);
  } else check('evidence chart present', false, 'no bars found');

  // 4b. A project with no supplied count renders no empty chart frame.
  await p.goto(B + '/case-studies/cold-chain', { waitUntil: 'networkidle' });
  const strayChart = await p.locator('.evidence-bar-row').count();
  const stillReads = await p.locator('.report-body h2').count();
  check('project without a count shows no chart', strayChart === 0 && stillReads >= 4, `${strayChart} bars, ${stillReads} sections`);

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

  // 6b. A required field must not look like an error before anybody has typed.
  // The validation styling once keyed off :not(:placeholder-shown), so deleting
  // a placeholder silently turned an untouched field red. Nothing but a browser
  // catches that: the markup and the stylesheet are each fine on their own.
  await p.goto(B + '/contact', { waitUntil: 'networkidle' });
  await p.waitForTimeout(500);
  const messageBorder = () => p.locator('textarea[name=message]')
    .evaluate((node) => getComputedStyle(node).borderColor);
  const restBorder = await messageBorder();
  const box = p.locator('textarea[name=message]');
  await box.click();
  await box.type('short');
  await p.locator('input[name=email]').click();
  await p.waitForTimeout(700);
  const afterBorder = await messageBorder();
  check('untouched required field is not marked as an error', restBorder !== afterBorder, restBorder);
  check('an edited invalid field is marked', afterBorder === 'rgb(180, 35, 24)', afterBorder);
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

  // 8. The ground band. It is the one element on the site that breaks the
  // container, and a CSS-module class name that silently stops matching would
  // leave it boxed inside the gutter with nothing failing anywhere else.
  const bandPages = ['/', '/services', '/industries', '/case-studies', '/news', '/about', '/contact'];
  const bands = [];
  for (const path of bandPages) {
    await p.goto(B + path, { waitUntil: 'networkidle' });
    // The band sits below the fold on every page, so next/image defers it.
    // Scroll it into view and wait for the decode before asking whether it
    // loaded, or the check measures the lazy placeholder.
    await p.locator('[data-ground]').first().scrollIntoViewIfNeeded();
    await p.waitForFunction(() => {
      const img = document.querySelector('[data-ground] img');
      return Boolean(img && img.complete && img.naturalWidth > 0);
    }, null, { timeout: 5000 });
    const boxes = await p.evaluate(() => {
      // next/image rewrites src through the optimiser, so the band carries its
      // own data attribute and the image is found inside it.
      return [...document.querySelectorAll('[data-ground]')].map((band) => {
        const img = band.querySelector('img');
        return {
          width: band.getBoundingClientRect().width,
          complete: Boolean(img && img.complete && img.naturalWidth > 0),
        };
      });
    });
    const frames = await p.locator('[data-ground] > div:not([class*="plate"])').count();
    bands.push({ path, boxes, frames });
  }
  const viewport = 1440;
  check(
    'every marketing page carries exactly one ground band',
    bands.every((row) => row.boxes.length === 1),
    bands.map((row) => `${row.path}:${row.boxes.length}`).join(' '),
  );
  check(
    'each band stacks three frames',
    bands.every((row) => row.frames === 3),
    bands.map((row) => `${row.path}:${row.frames}`).join(' '),
  );
  check(
    'the band runs edge to edge and its image loads',
    bands.every((row) => row.boxes.every((box) => box.complete && Math.abs(box.width - viewport) < 2)),
    bands.map((row) => row.boxes.map((b) => Math.round(b.width)).join()).join(' '),
  );

  // The pause control. Content that animates on its own needs a way to stop
  // it, and a toggle that flips a class without stopping the animation is the
  // failure this catches.
  await p.goto(B + '/about', { waitUntil: 'networkidle' });
  await p.locator('[data-ground]').scrollIntoViewIfNeeded();
  const playState = () =>
    p.evaluate(() => getComputedStyle(document.querySelector('[data-ground] > div')).animationPlayState);
  const running = await playState();
  await p.getByRole('button', { name: /Pause the background images/ }).click();
  const stopped = await playState();
  await p.getByRole('button', { name: /Resume the background images/ }).click();
  const restarted = await playState();
  check('the pause control stops and restarts the cycle',
    running === 'running' && stopped === 'paused' && restarted === 'running',
    `${running} -> ${stopped} -> ${restarted}`);

  // 9. Keyboard focus visibility
  await p.goto(B + '/', { waitUntil: 'networkidle' });
  await p.keyboard.press('Tab');
  const focused = await p.evaluate(() => document.activeElement?.className || '');
  check('first tab stop is the skip link', /skip-link/.test(focused), focused);

  await b.close();
  console.log(results.join('\n'));
  if (results.some((r) => r.startsWith('FAIL'))) process.exitCode = 1;
})();
