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

const FEEDBACK_PATH = 'tests/visual/reports/agent_feedback.txt';

type RegionConfig = {
  name: string;
  selector: string;
  baselinePath?: string;
  threshold?: number;
};

type VisualConfig = {
  regions?: RegionConfig[];
};

type RegionResult = {
  name: string;
  selector: string;
  actualPath?: string;
  diffPath?: string;
  baselinePath?: string;
  threshold: number;
  pixelDiffRatio?: number;
  error?: string;
};

const VISUAL_CONFIG_PATH = 'tests/visual/config.json';

function loadVisualConfig(): VisualConfig {
  if (!fs.existsSync(VISUAL_CONFIG_PATH)) {
    return {};
  }
  try {
    const raw = fs.readFileSync(VISUAL_CONFIG_PATH, 'utf-8');
    return JSON.parse(raw) as VisualConfig;
  } catch (err) {
    console.warn(`[visual] Failed to parse ${VISUAL_CONFIG_PATH}:`, err);
    return {};
  }
}

const VISUAL_CONFIG = loadVisualConfig();

const REQUIRED_ASSETS = [
  'public/images/hero-visual.png',
  'public/images/logo-full.svg',
  'public/images/feature-digital-learning.png',
  'public/images/feature-team-capability.png',
  'public/images/feature-pricing.png'
];

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

function resolveRegionPaths(region: RegionConfig) {
  const safeName = region.name.replace(/[^a-zA-Z0-9-_]/g, '_');
  const baselinePath = region.baselinePath ?? path.join('tests', 'visual', 'baseline', `${safeName}.png`);
  const actualPath = path.join('tests', 'visual', 'actual', `${safeName}.png`);
  const diffPath = path.join('tests', 'visual', 'diff', `${safeName}.diff.png`);
  return { baselinePath, actualPath, diffPath };
}

type AuditIssue = {
  type: 'style' | 'structure' | 'bounds';
  property: string;
  expected?: unknown;
  actual?: unknown;
  message: string;
};

type AuditViolation = {
  selector: string;
  ruleId?: string;
  description?: string;
  elementIndex: number;
  issues: AuditIssue[];
};

function writeAgentFeedback(options: {
  success: boolean;
  pixelDiffRatio?: number;
  actualPath?: string;
  diffPath?: string;
  baselinePath?: string;
  regionResults?: RegionResult[];
  styleViolations?: AuditViolation[];
  errorMessages: string[];
}) {
  const {
    success,
    pixelDiffRatio,
    actualPath,
    diffPath,
    baselinePath,
    regionResults = [],
    styleViolations = [],
    errorMessages
  } = options;

  const lines: string[] = [];
  lines.push('迭代标识: 手动测试');
  lines.push(`测试结果: ${success ? '通过 ✅' : '未通过 ❌'}`);

  if (pixelDiffRatio !== undefined) {
    lines.push(`像素差: ${(pixelDiffRatio * 100).toFixed(2)}% (阈值 1.00%)`);
  } else {
    lines.push('像素差: 未生成 diff 报告');
  }

  if (actualPath) lines.push(`实际截图: ${actualPath}`);
  if (diffPath) lines.push(`差异截图: ${diffPath}`);
  if (baselinePath) lines.push(`基线截图: ${baselinePath}`);

  if (regionResults.length) {
    lines.push('');
    lines.push('区域差异:');
    for (const region of regionResults) {
      const ratioText = region.pixelDiffRatio !== undefined
        ? `${(region.pixelDiffRatio * 100).toFixed(2)}%`
        : '未生成';
      const thresholdText = `${(region.threshold * 100).toFixed(2)}%`;
      const status = region.error
        ? `错误: ${region.error}`
        : `差异=${ratioText}, 阈值=${thresholdText}`;
      lines.push(`- ${region.name} (${region.selector}) -> ${status}`);
      if (region.actualPath) lines.push(`  实际: ${region.actualPath}`);
      if (region.diffPath) lines.push(`  差异: ${region.diffPath}`);
      if (region.baselinePath) lines.push(`  基线: ${region.baselinePath}`);
    }
  }

  lines.push('');
  lines.push('需调整的组件:');
  if (styleViolations.length) {
    for (const violation of styleViolations.slice(0, 10)) {
      const label = violation.description ?? violation.ruleId ?? violation.selector;
      const summary = violation.issues
        .map(issue => issue.message)
        .join(' | ');
      lines.push(`- ${label} -> ${summary}`);
    }
    if (styleViolations.length > 10) {
      lines.push(`- ... 其余 ${styleViolations.length - 10} 条可查看 style_violations.json`);
    }
  } else {
    lines.push('- 无显式样式违例');
  }

  if (errorMessages.length) {
    lines.push('');
    lines.push('错误摘要:');
    for (const msg of errorMessages.slice(0, 5)) {
      lines.push(`- ${msg}`);
    }
  }

  const suggestions: string[] = [];
  if (success) {
    suggestions.push('视觉与样式审计均已通过，可以提交代码或继续扩展功能。');
    suggestions.push('若后续修改，请保持 data-test 标签与测试保持一致。');
  } else {
    if (diffPath) suggestions.push('查看差异截图，定位布局或配色差异。');
    if (regionResults.some(r => r.diffPath)) suggestions.push('查看区域差异截图，确认局部布局是否符合设计。');
    if (styleViolations.length) suggestions.push('根据上方 selector 调整样式，满足设计契约。');
    if (errorMessages.length) suggestions.push('阅读错误摘要，判断是否需要更新快照或补充资源。');
    suggestions.push('修复后再次运行 `npm run test:visual:update` 并更新此报告。');
  }

  lines.push('');
  lines.push('下一步建议:');
  for (const suggestion of suggestions.length ? suggestions : ['暂无进一步建议。']) {
    lines.push(`- ${suggestion}`);
  }

  fs.mkdirSync(path.dirname(FEEDBACK_PATH), { recursive: true });
  fs.writeFileSync(FEEDBACK_PATH, `${lines.join('\n')}\n`, 'utf-8');
}

test('UI matches design (baseline-first)', async ({ page }) => {
  for (const asset of REQUIRED_ASSETS) {
    if (!fs.existsSync(asset)) {
      throw new Error(`[visual] Missing asset ${asset}. 请先运行 "npm run figma:export" 下载设计切图。`);
    }
  }

  // 如果 baseline 存在，就用它的尺寸设置视口
  if (fs.existsSync(paths.baseline)) {
    const { width, height } = readPngSize(paths.baseline);
    await page.setViewportSize({ width, height });
  }

  await page.goto('/job');

  // const hero = page.locator('[data-test="hero-container2"]');
  // await expect(hero).toBeVisible();

  await page.screenshot({ path: paths.actual });

  const errors: string[] = [];
  let pixelDiffRatio: number | undefined;
  const regionResults: RegionResult[] = [];
  let collectedViolations: AuditViolation[] = [];

  // 1) Figma baseline pixelmatch
  if (fs.existsSync(paths.baseline)) {
    const ratio = cmpImages(paths.actual, paths.baseline, paths.diff);
    pixelDiffRatio = ratio;
    fs.writeFileSync(paths.diffReport, JSON.stringify({ global: { pixelDiffRatio: ratio } }, null, 2));
    if (ratio > 0.01) errors.push(`Pixel diff ${ratio.toFixed(4)} > 0.01, see ${paths.diff}`);
  } else {
    console.warn(`[visual] Baseline not found at ${paths.baseline}.`);
  }

  if (Array.isArray(VISUAL_CONFIG.regions)) {
    for (const region of VISUAL_CONFIG.regions) {
      const threshold = region.threshold ?? 0.02;
      const { actualPath, baselinePath, diffPath } = resolveRegionPaths(region);
      const result: RegionResult = {
        name: region.name,
        selector: region.selector,
        actualPath,
        diffPath,
        baselinePath,
        threshold
      };
      try {
        const locator = page.locator(region.selector).first();
        await expect(locator, `Region ${region.name} (${region.selector}) should be visible`).toBeVisible();
        await locator.screenshot({ path: actualPath });
        if (fs.existsSync(baselinePath)) {
          try {
            const ratio = cmpImages(actualPath, baselinePath, diffPath);
            result.pixelDiffRatio = ratio;
            if (ratio > threshold) {
              errors.push(`${region.name} pixel diff ${ratio.toFixed(4)} > ${threshold.toFixed(4)}, see ${diffPath}`);
            }
          } catch (err) {
            result.error = (err as Error).message;
            errors.push(`Region ${region.name} diff failed: ${result.error}`);
          }
        } else {
          result.error = `Baseline not found at ${baselinePath}`;
          console.warn(`[visual] Region baseline not found for ${region.name} at ${baselinePath}.`);
        }
      } catch (err) {
        result.error = (err as Error).message;
        errors.push(`Region ${region.name} capture failed: ${result.error}`);
      }
      regionResults.push(result);
    }
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
    collectedViolations = violations as AuditViolation[];
  } else {
    console.warn(`[audit] design-contract.json not found at ${contractPath}. Style audit skipped.`);
  }

  const success = errors.length === 0;
  writeAgentFeedback({
    success,
    pixelDiffRatio,
    actualPath: fs.existsSync(paths.actual) ? paths.actual : undefined,
    diffPath: fs.existsSync(paths.diff) ? paths.diff : undefined,
    baselinePath: fs.existsSync(paths.baseline) ? paths.baseline : undefined,
    regionResults,
    styleViolations: collectedViolations,
    errorMessages: errors
  });

  if (errors.length) {
    throw new Error(errors.join('\n'));
  }

});
