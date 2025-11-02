import { chromium } from '@playwright/test';
import { runAudit } from './audit-style';

const CONTRACT = process.argv[2] || 'design-contract.json';
const OUT = process.argv[3] || 'tests/visual/reports/style_violations.json';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('http://localhost:3000');
  await runAudit(page, CONTRACT, OUT);
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
