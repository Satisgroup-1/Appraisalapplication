// SDLT band arithmetic, hand-computed. These are the closed forms the in-app
// auditor and the engine both lean on, so they are verified against paper
// calculations, not against each other.

import { describe, expect, it } from 'vitest';
import { computeSdlt, sdltChargeable, sdltForFinance } from '../src/core/sdlt';
import { DEFAULT_FINANCE, normalizePricing } from '../src/core/pricing';
import type { FinanceInputs, PricingSpec } from '../src/core/types';

const fin = (over: Partial<FinanceInputs> = {}): FinanceInputs =>
  JSON.parse(JSON.stringify({ ...DEFAULT_FINANCE, ...over }));

describe('non-residential / mixed-use bands', () => {
  it('is zero up to £150,000', () => {
    expect(computeSdlt(150_000, 'nonResidential')).toBe(0);
  });

  it('charges 2% on the £150k-£250k slice', () => {
    // £200,000: 2% × £50,000 = £1,000
    expect(computeSdlt(200_000, 'nonResidential')).toBe(1_000);
  });

  it('reproduces the workbook figure on the demo purchase exactly', () => {
    // £1,950,000: 2% × £100,000 + 5% × £1,700,000 = £2,000 + £85,000 = £87,000
    // — the hand-typed B04 in Appraisal_Model_1 was computed on these bands.
    expect(computeSdlt(1_950_000, 'nonResidential')).toBe(87_000);
  });
});

describe('residential company rates (main rates + surcharge)', () => {
  it('hand-computes a £1,950,000 dwelling bought by a company', () => {
    // Main rates: 0 to 125k; 2% × 125k = 2,500; 5% × 675k = 33,750;
    // 10% × 575k = 57,500; 12% × 450k = 54,000 → 147,750.
    // Company surcharge: 5% × 1,950,000 = 97,500. Total 245,250.
    expect(computeSdlt(1_950_000, 'residentialCompany')).toBe(245_250);
  });

  it('applies the surcharge from the first pound', () => {
    // £100,000: main rates 0, surcharge 5% × 100,000 = 5,000.
    expect(computeSdlt(100_000, 'residentialCompany')).toBe(5_000);
  });
});

describe('VAT interaction and regime plumbing', () => {
  it('charges SDLT on the VAT-inclusive price when opted to tax', () => {
    const f = fin();
    f.vat.optedToTax = true; // 20% on £1,950,000 → chargeable £2,340,000
    expect(sdltChargeable(f)).toBe(2_340_000);
    // 2% × 100k + 5% × 2,090,000 = 2,000 + 104,500 = £106,500
    expect(sdltForFinance(f)).toBe(106_500);
  });

  it('manual regime returns null so the typed figure survives', () => {
    const f = fin();
    f.sdlt = { regime: 'manual' };
    expect(sdltForFinance(f)).toBe(null);
  });

  it('never charges tax on a negative consideration', () => {
    expect(computeSdlt(-5, 'nonResidential')).toBe(0);
    expect(computeSdlt(-5, 'residentialCompany')).toBe(0);
  });
});

describe('loading older files', () => {
  it('a file with no sdlt block loads as manual, so its typed B04 never changes', () => {
    const p = normalizePricing({ finance: {} as PricingSpec['finance'] });
    expect(p.finance.sdlt.regime).toBe('manual');
  });

  it('a truthy-but-empty sdlt block also loads as manual, not silently automatic', () => {
    // Audit finding: `sdlt: {}` in a hand-edited/corrupted file used to spread
    // into the DEFAULT (automatic) regime, flipping a typed B04 to computed
    // with zero repairs reported.
    const p = normalizePricing({ finance: { sdlt: {} } as unknown as PricingSpec['finance'] });
    expect(p.finance.sdlt.regime).toBe('manual');
  });

  it('an explicit regime in the file is kept', () => {
    const p = normalizePricing({ finance: { sdlt: { regime: 'residentialCompany' } } as PricingSpec['finance'] });
    expect(p.finance.sdlt.regime).toBe('residentialCompany');
  });
});
