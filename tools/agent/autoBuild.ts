import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import { fetchFigmaNode, summarizeNode } from './figma';
import { generateText, ChatMessage } from './openai';

type CLIOptions = {
  fileKey: string;
  nodeId: string;
  maxIterations: number;
  skipDownload: boolean;
};

type IterationReport = {
  iteration: number;
  success: boolean;
  errorMessage?: string;
  visualReport?: VisualReport;
  styleViolations?: unknown;
};

type VisualReport = {
  pixelDiffRatio?: number;
  actualScreenshot?: string;
  diffScreenshot?: string;
  baselineScreenshot?: string;
};

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..', '..');
const GENERATED_TARGET = path.join(ROOT_DIR, 'app', 'page.tsx');
const FEEDBACK_PATH = path.join(ROOT_DIR, 'tests', 'visual', 'reports', 'agent_feedback.txt');

function parseArgs(argv: string[]): CLIOptions {
  const options: CLIOptions = {
    fileKey: process.env.FIGMA_FILE_KEY ?? '',
    nodeId: process.env.FRAME_NODE_ID ?? '',
    maxIterations: Number(process.env.MAX_ITERATIONS ?? 3),
    skipDownload: process.env.SKIP_FIGMA_DOWNLOAD === '1'
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (!arg.startsWith('--')) continue;
    const key = arg.slice(2);
    const next = argv[i + 1];
    switch (key) {
      case 'file':
      case 'fileKey':
        if (next) {
          options.fileKey = next;
          i++;
        }
        break;
      case 'node':
      case 'nodeId':
        if (next) {
          options.nodeId = next;
          i++;
        }
        break;
      case 'max-iterations':
        if (next) {
          options.maxIterations = Number(next);
          i++;
        }
        break;
      case 'skip-download':
        options.skipDownload = true;
        break;
      default:
        console.warn(`[autoBuild] Unknown argument "${arg}" ignored.`);
    }
  }

  if (!options.fileKey) {
    throw new Error('Missing Figma file key. Pass --file <key> or set FIGMA_FILE_KEY.');
  }
  if (!options.nodeId) {
    throw new Error('Missing Figma node id. Pass --node <id> or set FRAME_NODE_ID.');
  }
  if (!Number.isFinite(options.maxIterations) || options.maxIterations < 1) {
    options.maxIterations = 3;
  }

  return options;
}

async function runCommand(command: string, args: string[], cwd: string, env?: NodeJS.ProcessEnv): Promise<{ code: number; stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      env: { ...process.env, ...env },
      stdio: ['ignore', 'pipe', 'pipe']
    });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', chunk => {
      stdout += chunk.toString();
    });
    child.stderr.on('data', chunk => {
      stderr += chunk.toString();
    });
    child.on('error', reject);
    child.on('close', code => {
      resolve({ code: code ?? 0, stdout, stderr });
    });
  });
}

async function ensureDesignAssets(options: CLIOptions) {
  if (options.skipDownload) return;
  console.log('[autoBuild] Downloading Figma frame and assets...');
  const envOverrides: NodeJS.ProcessEnv = {
    FIGMA_TOKEN: process.env.FIGMA_TOKEN,
    FIGMA_FILE_KEY: options.fileKey,
    FRAME_NODE_ID: options.nodeId,
    NODE_ENV: process.env.NODE_ENV ?? 'development'
  };
  const result = await runCommand(
    'npx',
    ['tsx', 'tools/figma-export/export.ts'],
    ROOT_DIR,
    envOverrides
  );
  if (result.code !== 0) {
    throw new Error(`[autoBuild] Failed to download assets.\n${result.stdout}\n${result.stderr}`);
  }
}

function listAssets(): string[] {
  const assetsDir = path.join(ROOT_DIR, 'public', 'images');
  if (!fs.existsSync(assetsDir)) return [];
  const items: string[] = [];
  const walk = (dir: string) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else {
        items.push(path.relative(ROOT_DIR, full));
      }
    }
  };
  walk(assetsDir);
  return items.sort();
}

function readFileSafe(filePath: string): string | null {
  try {
    return fs.readFileSync(filePath, 'utf-8');
  } catch {
    return null;
  }
}

function extractCodeBlock(text: string): string {
  const match = text.match(/```(?:tsx|typescript|jsx|javascript)?\s*([\s\S]*?)```/);
  if (match) {
    return match[1].trim();
  }
  return text.trim();
}

function writeGeneratedCode(contents: string) {
  fs.writeFileSync(GENERATED_TARGET, `${contents.trim()}\n`, 'utf-8');
  console.log(`[autoBuild] Wrote generated page to ${path.relative(ROOT_DIR, GENERATED_TARGET)}`);
}

async function runVisualTests(iteration: number): Promise<IterationReport> {
  console.log('[autoBuild] Running visual regression tests...');
  const result = await runCommand('npx', ['playwright', 'test'], ROOT_DIR);
  const report = loadVisualReport();
  const styleViolations = loadStyleViolations();
  const success = result.code === 0;

  const violationSummary = styleViolations ? JSON.stringify(styleViolations).slice(0, 400) : undefined;

  if (success) {
    console.log('[autoBuild] Visual tests passed.');
    return { iteration, success, visualReport: report, styleViolations: styleViolations ?? undefined };
  }

  let errorMessage = result.stderr || result.stdout;
  errorMessage = errorMessage.slice(0, 600);

  console.warn('[autoBuild] Visual tests failed.');
  if (report?.pixelDiffRatio !== undefined) {
    console.warn(`[autoBuild] Pixel diff ratio: ${(report.pixelDiffRatio * 100).toFixed(2)}%`);
  }
  if (violationSummary) {
    console.warn(`[autoBuild] Style violations sample: ${violationSummary}`);
  }

  return {
    iteration,
    success,
    errorMessage,
    visualReport: report,
    styleViolations
  };
}

function loadVisualReport(): VisualReport | undefined {
  const diffReportPath = path.join(ROOT_DIR, 'tests', 'visual', 'reports', 'diff_report.json');
  const actualPath = path.join(ROOT_DIR, 'tests', 'visual', 'actual', 'frame-hero.png');
  const diffPath = path.join(ROOT_DIR, 'tests', 'visual', 'diff', 'frame-hero.diff.png');
  const baselinePath = path.join(ROOT_DIR, 'tests', 'visual', 'baseline', 'frame-hero.png');

  let pixelDiffRatio: number | undefined;
  if (fs.existsSync(diffReportPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(diffReportPath, 'utf-8')) as { global?: { pixelDiffRatio?: number } };
      pixelDiffRatio = data?.global?.pixelDiffRatio;
    } catch (err) {
      console.warn('[autoBuild] Failed to read diff report:', err);
    }
  }

  const report: VisualReport = {
    pixelDiffRatio,
    actualScreenshot: fs.existsSync(actualPath) ? path.relative(ROOT_DIR, actualPath) : undefined,
    diffScreenshot: fs.existsSync(diffPath) ? path.relative(ROOT_DIR, diffPath) : undefined,
    baselineScreenshot: fs.existsSync(baselinePath) ? path.relative(ROOT_DIR, baselinePath) : undefined
  };

  if (!report.pixelDiffRatio && !report.actualScreenshot && !report.diffScreenshot) {
    return undefined;
  }
  return report;
}

function loadStyleViolations(): unknown | undefined {
  const styleReportPath = path.join(ROOT_DIR, 'tests', 'visual', 'reports', 'style_violations.json');
  if (!fs.existsSync(styleReportPath)) return undefined;
  try {
    const json = JSON.parse(fs.readFileSync(styleReportPath, 'utf-8'));
    return json;
  } catch (err) {
    console.warn('[autoBuild] Failed to read style violation report:', err);
    return undefined;
  }
}

type StyleContractIssue = {
  type: string;
  property: string;
  expected?: unknown;
  actual?: unknown;
  message: string;
};

type StyleContractViolation = {
  selector: string;
  ruleId?: string;
  description?: string;
  elementIndex: number;
  issues: StyleContractIssue[];
};

function extractStyleViolations(data: unknown): StyleContractViolation[] {
  if (!data) return [];
  if (Array.isArray(data)) {
    return data as StyleContractViolation[];
  }
  if (typeof data === 'object' && data !== null) {
    const maybe = (data as { violations?: unknown }).violations;
    if (Array.isArray(maybe)) {
      return maybe as StyleContractViolation[];
    }
  }
  return [];
}

function formatIssueReport(report: IterationReport): string {
  const lines: string[] = [];
  if (report.visualReport?.pixelDiffRatio !== undefined) {
    lines.push(`Pixel diff ratio: ${(report.visualReport.pixelDiffRatio * 100).toFixed(2)}%`);
  }
  if (report.visualReport?.diffScreenshot) {
    lines.push(`Diff screenshot: ${report.visualReport.diffScreenshot}`);
  }
  if (report.visualReport?.actualScreenshot) {
    lines.push(`Actual screenshot: ${report.visualReport.actualScreenshot}`);
  }
  const violations = extractStyleViolations(report.styleViolations);
  if (violations.length) {
    const first = violations[0];
    const label = first.description ?? first.ruleId ?? first.selector;
    const detail = first.issues.map(issue => issue.message).join(' | ');
    lines.push(`Style violations (${violations.length}): ${label} -> ${detail}`);
  }
  if (report.errorMessage) {
    lines.push(`Playwright failure snippet: ${report.errorMessage}`);
  }
  return lines.join('\n') || 'Visual tests passed.';
}

function writeFeedbackReport(iteration: number, report: IterationReport, maxIterations: number) {
  const lines: string[] = [];
  lines.push(`迭代编号: ${iteration}`);
  lines.push(`测试结果: ${report.success ? '通过 ✅' : '未通过 ❌'}`);

  if (report.visualReport?.pixelDiffRatio !== undefined) {
    const ratio = report.visualReport.pixelDiffRatio * 100;
    const threshold = 1.0;
    lines.push(`像素差: ${ratio.toFixed(2)}% (阈值 ${threshold.toFixed(2)}%)`);
  } else {
    lines.push('像素差: 未生成 diff 报告');
  }

  if (report.visualReport?.diffScreenshot) {
    lines.push(`差异截图: ${report.visualReport.diffScreenshot}`);
  }
  if (report.visualReport?.actualScreenshot) {
    lines.push(`实际截图: ${report.visualReport.actualScreenshot}`);
  }
  if (report.visualReport?.baselineScreenshot) {
    lines.push(`基线截图: ${report.visualReport.baselineScreenshot}`);
  }

  const violations = extractStyleViolations(report.styleViolations);
  lines.push('');
  lines.push('需调整的组件:');
  if (violations.length) {
    for (const violation of violations.slice(0, 10)) {
      const label = violation.description ?? violation.ruleId ?? violation.selector;
      const summary = violation.issues.map(issue => issue.message).join(' | ');
      lines.push(`- ${label} -> ${summary}`);
    }
    if (violations.length > 10) {
      lines.push(`- ... 其余 ${violations.length - 10} 项请查看 style_violations.json`);
    }
  } else {
    lines.push('- 无显式样式违例');
  }

  const suggestions: string[] = [];
  if (report.success) {
    suggestions.push('视觉与样式审计均通过，可进行代码 Review 或提交到版本库。');
    suggestions.push('如需继续扩展功能，请保持现有 data-test 标签与测试同步更新。');
  } else {
    if (report.visualReport?.diffScreenshot) {
      suggestions.push('打开差异截图，定位像素差异对应的布局或配色问题。');
    }
    if (violations.length) {
      suggestions.push('根据上方列出的 selector 调整 Tailwind 类或行内样式，使属性值符合设计契约。');
    }
    if (report.errorMessage) {
      suggestions.push('阅读 Playwright 输出的错误信息，确认是否存在断言失败或路由加载问题。');
    }
    suggestions.push('完成修改后重新运行 `npm run test:visual`，并将最新报告粘贴回对话。');
    if (iteration >= maxIterations) {
      suggestions.push('已达到本次设定的最大迭代次数，如需继续请提升 --max-iterations 或手动发起下一轮。');
    }
  }

  lines.push('');
  lines.push('下一步建议:');
  for (const suggestion of suggestions.length ? suggestions : ['暂无进一步建议。']) {
    lines.push(`- ${suggestion}`);
  }

  fs.mkdirSync(path.dirname(FEEDBACK_PATH), { recursive: true });
  fs.writeFileSync(FEEDBACK_PATH, `${lines.join('\n')}\n`, 'utf-8');
  console.log(`[autoBuild] 已生成人工反馈报告: ${path.relative(ROOT_DIR, FEEDBACK_PATH)}`);
}

function buildMessages(params: {
  iteration: number;
  designSummary: string;
  assets: string[];
  previousCode?: string;
  issueReport?: string;
}): ChatMessage[] {
  const { iteration, designSummary, assets, previousCode, issueReport } = params;

  const systemMessage: ChatMessage = {
    role: 'system',
    content: [
      'You are an autonomous senior front-end engineer.',
      'Generate production-quality React server components for a Next.js 14 application using TypeScript and Tailwind CSS.',
      'The entry file is app/page.tsx and must default export Page().',
      'Follow accessibility best practices, prefer semantic HTML and keep data-test attributes that support Playwright checks.',
      'The layout must faithfully reproduce the provided Figma design when rendered at desktop (width 1440).',
      'Only respond with the full file content ready to be written to app/page.tsx. Do not include explanations.'
    ].join('\n')
  };

  const baseInstructions = [
    'Design summary (trimmed Figma hierarchy):',
    designSummary,
    '',
    'Available image assets (already downloaded under public/):',
    assets.map(a => `- ${a}`).join('\n') || '- <none>',
    '',
    'Requirements:',
    '- Use Tailwind classes when practical; inline styles only when needed.',
    '- Ensure hero content has data-test hooks: hero, hero-nav, hero-nav-cta, hero-layout, hero-copy, hero-media, cta-primary, cta-secondary.',
    '- Match typography sizing, spacing, and colors.',
    '- Use Next.js <Image> for raster assets; mark decorative images with aria-hidden.',
    '- Keep the page self-contained (no external data fetches).'
  ];

  const userMessages: string[] = [];
  userMessages.push(baseInstructions.join('\n'));

  if (iteration > 1 && previousCode) {
    userMessages.push('\nPrevious iteration code:\n');
    userMessages.push(previousCode);
  }
  if (iteration > 1 && issueReport) {
    userMessages.push('\nTest feedback (visual + style audit):\n');
    userMessages.push(issueReport);
    userMessages.push('\nRevise the code to resolve the reported issues.');
  } else {
    userMessages.push('\nProvide the initial implementation.');
  }

  return [
    systemMessage,
    {
      role: 'user',
      content: userMessages.join('\n')
    }
  ];
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  await ensureDesignAssets(options);

  console.log('[autoBuild] Fetching Figma node data...');
  const node = await fetchFigmaNode({
    fileKey: options.fileKey,
    nodeId: options.nodeId,
    cacheDir: path.join(ROOT_DIR, 'tools', 'figma-export', '.cache')
  });

  const designSummary = summarizeNode(node, { maxDepth: 4, maxTextLength: 180 });
  const assets = listAssets();

  let previousCode = readFileSafe(GENERATED_TARGET) ?? undefined;
  let report: IterationReport | undefined;

  for (let iteration = 1; iteration <= options.maxIterations; iteration++) {
    console.log(`\n[autoBuild] ===== Iteration ${iteration}/${options.maxIterations} =====`);
    const messages = buildMessages({
      iteration,
      designSummary,
      assets,
      previousCode,
      issueReport: report ? formatIssueReport(report) : undefined
    });

    const response = await generateText(messages, { maxTokens: 6000 });
    const code = extractCodeBlock(response);
    writeGeneratedCode(code);

    report = await runVisualTests(iteration);
    writeFeedbackReport(iteration, report, options.maxIterations);
    previousCode = code;

    if (report.success) {
      console.log(`[autoBuild] ✅ Success after ${iteration} iteration(s).`);
      return;
    }
  }

  console.error('[autoBuild] ❌ Reached max iterations without passing tests.');
  if (report) {
    console.error(formatIssueReport(report));
  }
  process.exit(1);
}

main().catch(err => {
  console.error('[autoBuild] Fatal error:', err);
  process.exit(1);
});
