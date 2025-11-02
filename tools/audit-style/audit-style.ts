import fs from 'node:fs';
import path from 'node:path';

type Rule = { selector: string; expect: Record<string, string|number> };
type Contract = { rules: Rule[] };

export async function runAudit(page: import('@playwright/test').Page, contractPath: string, outPath: string) {
  const abs = path.resolve(process.cwd(), contractPath);
  if (!fs.existsSync(abs)) {
    // 让调用方决定是否跳过，这里抛出一个更明确的错误信息
    throw new Error(`[audit] Contract file not found: ${abs}`);
  }
  const contract: Contract = JSON.parse(fs.readFileSync(contractPath, 'utf-8'));
  const results = await page.evaluate((rules: Rule[]) => {
    const out: any[] = [];
    for (const rule of rules) {
      document.querySelectorAll(rule.selector).forEach((el) => {
        const cs = getComputedStyle(el as Element);
        const diffs: any = {};
        for (const [k, v] of Object.entries(rule.expect)) {
          const got = cs.getPropertyValue(k).trim();
          if (String(got) !== String(v)) diffs[k] = { expect: v, got };
        }
        if (Object.keys(diffs).length) out.push({ selector: rule.selector, diffs });
      });
    }
    return out;
  }, contract.rules);

  fs.mkdirSync(require('node:path').dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify({ violations: results }, null, 2), 'utf-8');
  return results;
}
