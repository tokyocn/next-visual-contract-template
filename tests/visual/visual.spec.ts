import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
import { runAudit } from '../../tools/audit-style/audit-style';

const OUT_DIRS = [
  'tests/visual/actual',
  'tests/visual/diff',
  'tests/visual/reports',
  'tests/visual/baseline'
];

for (const d of OUT_DIRS) {
  fs.mkdirSync(d, { recursive: true });
}

function cmpImages(actualPath: string, baselinePath: string, diffOutPath: string) {
  const imgA = PNG.sync.read(fs.readFileSync(actualPath));
  const imgB = PNG.sync.read(fs.readFileSync(baselinePath));
  const { width, height } = imgA;
  const diff = new PNG({ width, height });
  const mismatched = pixelmatch(imgA.data, imgB.data, diff.data, width, height, { threshold: 0.1 });
  fs.writeFileSync(diffOutPath, PNG.sync.write(diff));
  const ratio = mismatched / (width * height);
  return ratio;
}

test('UI matches design (baseline-first)', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  const locator = page.locator('[data-test="hero"]');
  await expect(locator).toBeVisible();

  const actual = 'tests/visual/actual/frame-hero.png';
  await locator.screenshot({ path: actual });

  const baseline = 'tests/visual/baseline/frame-hero.png';
  if (fs.existsSync(baseline)) {
    const diff = 'tests/visual/diff/frame-hero.diff.png';
    const ratio = cmpImages(actual, baseline, diff);
    fs.writeFileSync('tests/visual/reports/diff_report.json', JSON.stringify({ global: { pixelDiffRatio: ratio } }, null, 2));
    // hard threshold; adjust as needed
    expect(ratio, `Pixel diff ratio too high. See ${diff}`).toBeLessThanOrEqual(0.01);
  } else {
    console.warn(`[visual] Baseline not found at ${baseline}. You can place one via "npm run figma:export" or accept current as baseline via "npm run test:visual:update".`);
  }

  // Also produce a standard Playwright snapshot (can be updated with --update-snapshots)
  expect(await locator.screenshot()).toMatchSnapshot('frame-hero.png', { maxDiffPixelRatio: 0.01 });

  // Style audit against contract
  const violations = await runAudit(page, 'design-contract.json', 'tests/visual/reports/style_violations.json');
  if (violations.length) {
    console.log('[audit] Style violations:', JSON.stringify(violations, null, 2));
  }
  expect(violations, 'Style violations must be zero').toHaveLength(0);
});
