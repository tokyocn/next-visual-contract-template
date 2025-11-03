import fs from 'node:fs';
import path from 'node:path';

type NumericConstraint = {
  value?: number;
  tolerance?: number;
  min?: number;
  max?: number;
};

type BoundsMap = Partial<Record<'top' | 'left' | 'right' | 'bottom' | 'width' | 'height', NumericConstraint>>;

type Rule = {
  id?: string;
  selector: string;
  description?: string;
  expect?: Record<string, string | number>;
  within?: string;
  notWithin?: string;
  bounds?: BoundsMap;
};

type Contract = { rules: Rule[] };

type RuleIssue = {
  type: 'style' | 'structure' | 'bounds';
  property: string;
  expected?: unknown;
  actual?: unknown;
  message: string;
};

type RuleViolation = {
  selector: string;
  ruleId?: string;
  description?: string;
  elementIndex: number;
  issues: RuleIssue[];
  outerHTML: string;
};

const STRICT_PROPS = [
  {
    prop: 'background-color',
    defaults: ['rgba(0, 0, 0, 0)', 'rgb(0, 0, 0)', 'transparent']
  },
  {
    prop: 'box-shadow',
    defaults: ['none', '']
  },
  {
    prop: 'border-radius',
    defaults: ['0px', '0px 0px 0px 0px']
  },
  {
    prop: 'border-top-left-radius',
    defaults: ['0px']
  },
  {
    prop: 'border-top-right-radius',
    defaults: ['0px']
  },
  {
    prop: 'border-bottom-left-radius',
    defaults: ['0px']
  },
  {
    prop: 'border-bottom-right-radius',
    defaults: ['0px']
  }
] as const;

export async function runAudit(page: import('@playwright/test').Page, contractPath: string, outPath: string) {
  const abs = path.resolve(process.cwd(), contractPath);
  if (!fs.existsSync(abs)) {
    throw new Error(`[audit] Contract file not found: ${abs}`);
  }

  const contract: Contract = JSON.parse(fs.readFileSync(contractPath, 'utf-8'));

  const results: RuleViolation[] = await page.evaluate(
    (payload: { rules: Rule[]; strictProps: ReadonlyArray<{ prop: string; defaults: ReadonlyArray<string> }> }) => {
      const { rules, strictProps } = payload;
      function checkBounds(bounds: BoundsMap | undefined, rect: DOMRect): RuleIssue[] {
        if (!bounds) return [];
        const issues: RuleIssue[] = [];
        const actuals: Record<string, number> = {
          top: rect.top,
          left: rect.left,
          right: rect.right,
          bottom: rect.bottom,
          width: rect.width,
          height: rect.height
        };

        for (const [key, constraint] of Object.entries(bounds)) {
          const actual = actuals[key as keyof typeof actuals];
          if (actual === undefined || !constraint) continue;
          const tol = constraint.tolerance ?? 2;
          const expectedValue = constraint.value;
          if (expectedValue !== undefined && Math.abs(actual - expectedValue) > tol) {
            issues.push({
              type: 'bounds',
              property: key,
              expected: constraint,
              actual,
              message: `${key} ${actual.toFixed(1)} not within ${expectedValue} ±${tol}`
            });
            continue;
          }
          if (constraint.min !== undefined && actual < constraint.min) {
            issues.push({
              type: 'bounds',
              property: key,
              expected: constraint,
              actual,
              message: `${key} ${actual.toFixed(1)} < min ${constraint.min}`
            });
          }
          if (constraint.max !== undefined && actual > constraint.max) {
            issues.push({
              type: 'bounds',
              property: key,
              expected: constraint,
              actual,
              message: `${key} ${actual.toFixed(1)} > max ${constraint.max}`
            });
          }
        }

        return issues;
      }

      function matchesDefault(actual: string, defaults: ReadonlyArray<string>): boolean {
        const normalized = actual.trim().toLowerCase();
        if (!normalized) return true;
        return defaults.some(def => normalized === def.trim().toLowerCase());
      }

      const results: RuleViolation[] = [];

      for (const rule of rules) {
        const elements = Array.from(document.querySelectorAll(rule.selector));
        if (!elements.length) {
          results.push({
            selector: rule.selector,
            ruleId: rule.id,
            description: rule.description,
            elementIndex: -1,
            issues: [
              {
                type: 'structure',
                property: rule.selector,
                message: 'Selector did not match any element on the page.'
              }
            ],
            outerHTML: ''
          });
          continue;
        }

        elements.forEach((el, index) => {
          const elementIssues: RuleIssue[] = [];
          const computed = getComputedStyle(el as Element);
          const expectProps = new Set(Object.keys(rule.expect ?? {}));

          if (rule.expect) {
            for (const [prop, expected] of Object.entries(rule.expect)) {
              const actual = computed.getPropertyValue(prop).trim();
              if (String(actual) !== String(expected)) {
                elementIssues.push({
                  type: 'style',
                  property: prop,
                  expected,
                  actual,
                  message: `Expected ${prop} = ${expected}, got ${actual}`
                });
              }
            }
          }

          if (rule.within) {
            const container = (el as Element).closest(rule.within);
            if (!container) {
              elementIssues.push({
                type: 'structure',
                property: 'within',
                expected: rule.within,
                actual: null,
                message: `Element is not within ${rule.within}`
              });
            }
          }

          if (rule.notWithin) {
            const forbidden = (el as Element).closest(rule.notWithin);
            if (forbidden) {
              elementIssues.push({
                type: 'structure',
                property: 'notWithin',
                expected: rule.notWithin,
                actual: true,
                message: `Element should not be within ${rule.notWithin}`
              });
            }
          }

          const rect = (el as Element).getBoundingClientRect();
          elementIssues.push(...checkBounds(rule.bounds, rect));

          for (const entry of strictProps) {
            if (expectProps.has(entry.prop)) continue;
            const actualValue = computed.getPropertyValue(entry.prop).trim();
            if (!actualValue) continue;
            if (!matchesDefault(actualValue, entry.defaults)) {
              elementIssues.push({
                type: 'style',
                property: entry.prop,
                expected: `One of: ${entry.defaults.join(', ')}`,
                actual: actualValue,
                message: `Unexpected ${entry.prop} = ${actualValue} (not defined in contract)`
              });
            }
          }

          if (elementIssues.length) {
            results.push({
              selector: rule.selector,
              ruleId: rule.id,
              description: rule.description,
              elementIndex: index,
              issues: elementIssues,
              outerHTML: (el as Element).outerHTML
            });
          }
        });
      }

      return results;
    },
    { rules: contract.rules, strictProps: STRICT_PROPS }
  );

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify({ violations: results }, null, 2), 'utf-8');
  return results;
}
