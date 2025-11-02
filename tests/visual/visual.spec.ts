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

const paths = {
  actual: 'tests/visual/actual/frame-hero.png',
  baseline: 'tests/visual/baseline/frame-hero.png',
  diff: 'tests/visual/diff/frame-hero.diff.png',
  diffReport: 'tests/visual/reports/diff_report.json',
};

// 读取 PNG 宽高
function readPngSize(p: string) {
  const buf = fs.readFileSync(p);
  const img = PNG.sync.read(buf);
  return { width: img.width, height: img.height };
}

function cmpImages(actualPath: string, baselinePath: string, diffOutPath: string) {
  const imgA = PNG.sync.read(fs.readFileSync(actualPath));
  const imgB = PNG.sync.read(fs.readFileSync(baselinePath));
  if (imgA.width !== imgB.width || imgA.height !== imgB.height) {
    throw new Error(`Image sizes do not match: actual=${imgA.width}x${imgA.height}, baseline=${imgB.width}x${imgB.height}`);
  }
  const { width, height } = imgA;
  const diff = new PNG({ width, height });
  const mismatched = pixelmatch(imgA.data, imgB.data, diff.data, width, height, { threshold: 0.1 });
  fs.writeFileSync(diffOutPath, PNG.sync.write(diff));
  return mismatched / (width * height);
}

test('UI matches design (baseline-first)', async ({ page }) => {
  // 如果 baseline 存在，就用它的尺寸设置视口
  if (fs.existsSync(paths.baseline)) {
    const { width, height } = readPngSize(paths.baseline);
    await page.setViewportSize({ width, height });
  }

  await page.goto('/');

  // 截整页（视口大小）截图，确保与 baseline 同尺寸
  await page.screenshot({ path: paths.actual, fullPage: false });

  const errors: string[] = [];

  // 1) Figma baseline pixelmatch
  if (fs.existsSync(paths.baseline)) {
    const ratio = cmpImages(paths.actual, paths.baseline, paths.diff);
    fs.writeFileSync(paths.diffReport, JSON.stringify({ global: { pixelDiffRatio: ratio } }, null, 2));
    if (ratio > 0.01) errors.push(`Pixel diff ${ratio.toFixed(4)} > 0.01, see ${paths.diff}`);
  } else {
    console.warn(`[visual] Baseline not found at ${paths.baseline}.`);
  }

  // 2) Playwright 快照（回归）
  try {
    expect(await page.screenshot()).toMatchSnapshot('frame-hero.png', { maxDiffPixelRatio: 0.01 });
  } catch (e) {
    errors.push(`Snapshot mismatch: ${String((e as Error).message).slice(0, 200)}...`);
  }

  // 3) 样式契约 Style audit against contract
  const contractPath = path.resolve(process.cwd(), 'design-contract.json');
  if (fs.existsSync(contractPath)) {
    const violations = await runAudit(page, contractPath, 'tests/visual/reports/style_violations.json');
    if (violations.length) errors.push(`Style violations: ${violations.length} (see reports/style_violations.json)`);
  } else {
    console.warn(`[audit] design-contract.json not found at ${contractPath}. Style audit skipped.`);
  }

  if (errors.length) {
    throw new Error(errors.join('\n'));
  }

});
