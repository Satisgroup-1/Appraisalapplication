/**
 * Checks the four DNS records Resend needs, before pressing Verify.
 *
 *   node scripts/check-dns.mjs quietgears.xyz
 *
 * Resend's own checker reports a misplaced record as simply "not found", which
 * does not distinguish "not propagated yet" from "on the wrong host". This
 * queries each name directly and also probes the two mistakes that account for
 * most failed verifications: the registrar appending the domain twice, and the
 * records being placed on the root instead of the send subdomain.
 *
 * Uses Node's own resolver against a public nameserver, so it sees what Resend
 * sees rather than anything cached locally.
 */
import { Resolver } from 'node:dns/promises';

const domain = (process.argv[2] || '').replace(/^https?:\/\//, '').replace(/\/.*$/, '').trim();
if (!domain) {
  console.error('Usage: node scripts/check-dns.mjs <domain>');
  process.exit(2);
}

const resolver = new Resolver({ timeout: 5000, tries: 2 });
resolver.setServers(['1.1.1.1', '8.8.8.8']);

const ok = (s) => `\x1b[32m${s}\x1b[0m`;
const bad = (s) => `\x1b[31m${s}\x1b[0m`;
const dim = (s) => `\x1b[2m${s}\x1b[0m`;

async function lookup(name, type) {
  try {
    const answers = type === 'MX' ? await resolver.resolveMx(name) : await resolver.resolveTxt(name);
    return type === 'MX'
      ? answers.map((a) => `${a.priority} ${a.exchange}`)
      : answers.map((a) => a.join(''));
  } catch (error) {
    return { error: error.code || error.message };
  }
}

const report = (label, result, expect) => {
  if (result.error) {
    const reason = result.error === 'ENOTFOUND' || result.error === 'ENODATA'
      ? 'not found (not propagated, or on the wrong host)'
      : result.error;
    console.log(`  ${bad('MISSING')}  ${label}\n           ${dim(reason)}`);
    return false;
  }
  const matched = expect ? result.some((v) => expect.test(v)) : true;
  console.log(`  ${matched ? ok('FOUND  ') : bad('WRONG  ')}  ${label}`);
  result.forEach((v) => console.log(`           ${dim(v.length > 110 ? `${v.slice(0, 110)}…` : v)}`));
  if (!matched) console.log(`           ${bad('value does not look like the record Resend asked for')}`);
  return matched;
};

console.log(`\nResend DNS check for ${domain}\n`);

const root = await lookup(domain, 'TXT');
if (root.error === 'ENOTFOUND') {
  console.log(`  ${bad('NXDOMAIN')} ${domain} does not resolve at all.`);
  console.log(`           ${dim('The domain is unregistered, or its nameservers are not delegated yet.')}`);
  console.log(`           ${dim('Check the registrar before looking at any individual record.')}\n`);
  process.exit(1);
}

const results = await Promise.all([
  lookup(`send.${domain}`, 'MX'),
  lookup(`send.${domain}`, 'TXT'),
  lookup(`resend._domainkey.${domain}`, 'TXT'),
  lookup(`_dmarc.${domain}`, 'TXT'),
]);

const passed = [
  report(`MX    send.${domain}`, results[0], /amazonses\.com/),
  report(`TXT   send.${domain}  (SPF)`, results[1], /^v=spf1/),
  report(`TXT   resend._domainkey.${domain}  (DKIM)`, results[2], /p=/),
  report(`TXT   _dmarc.${domain}  (DMARC)`, results[3], /^v=DMARC1/),
].filter(Boolean).length;

console.log('\n  Common placement mistakes');
const doubled = await lookup(`send.${domain}.${domain}`, 'MX');
console.log(doubled.error
  ? `  ${ok('clear  ')}  no doubled name (send.${domain}.${domain})`
  : `  ${bad('PROBLEM')}  the registrar appended the domain twice: send.${domain}.${domain}`);

const onRoot = await lookup(domain, 'MX');
const strayRegion = !onRoot.error && onRoot.some((v) => /amazonses\.com/.test(v));
console.log(strayRegion
  ? `  ${bad('PROBLEM')}  an SES MX record is on the root. It belongs on send.${domain}`
  : `  ${ok('clear  ')}  no SES MX record stranded on the root`);

const regions = new Set((results[0].error ? [] : results[0]).map((v) => v.match(/feedback-smtp\.([a-z0-9-]+)\./)?.[1]).filter(Boolean));
if (regions.size > 1) {
  console.log(`  ${bad('PROBLEM')}  MX records point at more than one AWS region: ${[...regions].join(', ')}`);
  console.log(`           ${dim('Resend will not verify until only the chosen region remains.')}`);
} else if (regions.size === 1) {
  console.log(`  ${ok('clear  ')}  single region: ${[...regions][0]}`);
}

console.log(`\n  ${passed}/4 records in place.${passed === 4 ? ' Press Verify in Resend.' : ' Fix the above, then re-run.'}\n`);
process.exit(passed === 4 ? 0 : 1);
