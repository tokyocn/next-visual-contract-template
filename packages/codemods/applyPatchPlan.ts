/**
 * Apply a structured Patch Plan to the codebase (deterministic edits).
 * Usage:
 *   npm run patch:apply   # will read tools/patch-plans/sample.json
 */
import fs from 'node:fs';
import path from 'node:path';
import { Project, SyntaxKind, JsxAttribute } from 'ts-morph';

type Edit =
  | { type: 'replaceTailwind'; selector: string; from: string; to: string; reason?: string }
  | { type: 'updateProp'; component: string; prop: string; from?: string; to: string; reason?: string };

type Plan = {
  file: string;
  edits: Edit[];
};

function getAttrValue(attr: JsxAttribute | undefined) {
  if (!attr) return '';
  const init = attr.getInitializer();
  if (!init) return '';
  return init.getText().replace(/^["'`]|["'`]$/g, '');
}

function setAttrValue(attr: JsxAttribute, next: string) {
  attr.setInitializer(`"${next}"`);
}

function applyReplaceTailwind(sf: any, selector: string, from: string, to: string) {
  // simple selector support: [data-test=hero]
  const match = selector.match(/\[data-test=['"]?([^'"]+)['"]?\]/);
  const dataTestValue = match?.[1];
  if (!dataTestValue) return;

  const openings = sf.getDescendantsOfKind(SyntaxKind.JsxOpeningElement);
  for (const el of openings) {
    const dataAttr = el.getAttribute('data-test') as JsxAttribute | undefined;
    if (!dataAttr) continue;
    const v = getAttrValue(dataAttr);
    if (v !== dataTestValue) continue;
    const cls = el.getAttribute('className') as JsxAttribute | undefined;
    if (!cls) continue;
    const before = getAttrValue(cls);
    if (!before.includes(from)) continue;
    const after = before.replace(from, to);
    setAttrValue(cls, after);
  }
}

function applyUpdateProp(sf: any, component: string, prop: string, to: string) {
  const openings = sf.getDescendantsOfKind(SyntaxKind.JsxOpeningElement);
  for (const el of openings) {
    if (el.getTagNameNode().getText() !== component) continue;
    let attr = el.getAttribute(prop) as JsxAttribute | undefined;
    if (!attr) {
      el.addAttribute({ name: prop, initializer: `"${to}"` });
    } else {
      setAttrValue(attr, to);
    }
  }
}

async function main() {
  const planPath = process.argv[2] || 'tools/patch-plans/sample.json';
  const plan: Plan = JSON.parse(fs.readFileSync(planPath, 'utf-8'));
  const project = new Project({ tsConfigFilePath: 'tsconfig.json' });
  const filePath = path.resolve(plan.file);
  const sf = project.getSourceFile(filePath) || project.addSourceFileAtPath(filePath);

  if (!sf) {
    console.error('[codemod] File not found:', plan.file);
    process.exit(1);
  }

  for (const e of plan.edits) {
    if (e.type === 'replaceTailwind') {
      applyReplaceTailwind(sf, (e as any).selector, (e as any).from, (e as any).to);
    } else if (e.type === 'updateProp') {
      applyUpdateProp(sf, (e as any).component, (e as any).prop, (e as any).to);
    }
  }

  await sf.save();
  await project.save();
  console.log('[codemod] Applied plan:', planPath);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
