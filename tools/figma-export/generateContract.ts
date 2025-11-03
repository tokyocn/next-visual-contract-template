import fs from 'node:fs';
import path from 'node:path';

type ContractRuleConfig = {
  id?: string;
  selector: string;
  description?: string;
  nodeId?: string;
  properties?: string[];
  extraExpect?: Record<string, string | number>;
  bounds?: unknown;
};

type ContractConfig = {
  output?: string;
  rules?: ContractRuleConfig[];
  staticRules?: any[];
};

type FigmaNode = {
  id: string;
  name: string;
  type: string;
  fills?: Array<{ type: string; visible?: boolean; opacity?: number; color?: { r: number; g: number; b: number; a?: number } }>;
  strokes?: Array<{ type: string; visible?: boolean; opacity?: number; color?: { r: number; g: number; b: number; a?: number } }>;
  cornerRadius?: number;
  rectangleCornerRadii?: number[];
  style?: {
    fontSize?: number;
    fontWeight?: number;
    lineHeightPx?: number;
  };
  absoluteBoundingBox?: { x: number; y: number; width: number; height: number };
  paddingTop?: number;
  paddingRight?: number;
  paddingBottom?: number;
  paddingLeft?: number;
  itemSpacing?: number;
  layoutMode?: 'NONE' | 'VERTICAL' | 'HORIZONTAL';
  children?: FigmaNode[];
};

type CachedNodeResponse = {
  nodes: Record<string, { document: FigmaNode }>;
};

const CONTRACT_CONFIG_PATH = path.resolve('tools/figma-export/contract-config.json');
const NODE_CACHE_PATH = path.resolve('tools/figma-export/.cache/node.json');

function loadContractConfig(): ContractConfig {
  if (!fs.existsSync(CONTRACT_CONFIG_PATH)) {
    return {};
  }
  return JSON.parse(fs.readFileSync(CONTRACT_CONFIG_PATH, 'utf-8')) as ContractConfig;
}

function loadRootNode(): FigmaNode {
  if (!fs.existsSync(NODE_CACHE_PATH)) {
    throw new Error(`[contract] Missing node cache at ${NODE_CACHE_PATH}. Run figma:export first.`);
  }
  const data = JSON.parse(fs.readFileSync(NODE_CACHE_PATH, 'utf-8')) as CachedNodeResponse;
  const root = Object.values(data.nodes)[0]?.document;
  if (!root) throw new Error('[contract] Failed to resolve root document from cache.');
  return root;
}

function findNodeById(root: FigmaNode, nodeId: string): FigmaNode | undefined {
  if (root.id === nodeId) return root;
  for (const child of root.children ?? []) {
    const found = findNodeById(child, nodeId);
    if (found) return found;
  }
  return undefined;
}

function toRgb(color?: { r: number; g: number; b: number; a?: number }): string | undefined {
  if (!color) return undefined;
  const to255 = (v: number) => Math.round(Math.max(0, Math.min(1, v)) * 255);
  return `rgb(${to255(color.r)}, ${to255(color.g)}, ${to255(color.b)})`;
}

function inferProperties(node: FigmaNode): string[] {
  const props = new Set<string>();
  if (node.absoluteBoundingBox) {
    props.add('width');
    props.add('height');
  }
  if (node.type === 'TEXT') {
    props.add('fontSize');
    props.add('fontWeight');
    props.add('lineHeight');
    props.add('textFill');
  } else {
    if (node.fills?.some(f => f.visible !== false && f.type === 'SOLID')) {
      props.add('fillColor');
    }
    if (node.strokes?.some(f => f.visible !== false && f.type === 'SOLID')) {
      props.add('strokeColor');
    }
    if (
      (node.paddingTop ?? node.paddingBottom ?? node.paddingLeft ?? node.paddingRight) !== undefined ||
      node.itemSpacing !== undefined
    ) {
      props.add('padding');
      props.add('gap');
    }
    if (node.layoutMode) {
      props.add('layoutMode');
    }
    if (node.cornerRadius !== undefined || node.rectangleCornerRadii !== undefined) {
      props.add('cornerRadii');
    }
  }
  return Array.from(props);
}

function extractProperties(node: FigmaNode, properties: string[] = []): Record<string, string | number> {
  const expect: Record<string, string | number> = {};
  const rect = node.absoluteBoundingBox;
  for (const prop of properties) {
    switch (prop) {
      case 'width':
        if (rect) expect.width = `${Math.round(rect.width)}px`;
        break;
      case 'height':
        if (rect) expect.height = `${Math.round(rect.height)}px`;
        break;
      case 'padding': {
        const pads = [
          node.paddingTop,
          node.paddingRight,
          node.paddingBottom,
          node.paddingLeft
        ].map(v => (v === undefined ? undefined : `${Math.round(v)}px`));
        if (pads.some(v => v !== undefined)) {
          const [top, right, bottom, left] = pads;
          if (top) expect['padding-top'] = top;
          if (right) expect['padding-right'] = right;
          if (bottom) expect['padding-bottom'] = bottom;
          if (left) expect['padding-left'] = left;
        }
        break;
      }
      case 'gap': {
        if (node.itemSpacing !== undefined) {
          expect['gap'] = `${Math.round(node.itemSpacing)}px`;
          expect['column-gap'] = `${Math.round(node.itemSpacing)}px`;
          expect['row-gap'] = `${Math.round(node.itemSpacing)}px`;
        }
        break;
      }
      case 'layoutMode': {
        if (node.layoutMode) {
          expect['display'] = 'flex';
          expect['flex-direction'] = node.layoutMode === 'VERTICAL' ? 'column' : 'row';
        }
        break;
      }
      case 'fillColor': {
        const fill = node.fills?.find(f => f.visible !== false && f.type === 'SOLID');
        if (fill?.color) {
          const rgb = toRgb(fill.color);
          if (rgb) expect['background-color'] = rgb;
        }
        break;
      }
      case 'strokeColor': {
        const stroke = node.strokes?.find(f => f.visible !== false && f.type === 'SOLID');
        if (stroke?.color) {
          const rgb = toRgb(stroke.color);
          if (rgb) expect['border-color'] = rgb;
        }
        break;
      }
      case 'cornerRadii': {
        if (Array.isArray(node.rectangleCornerRadii)) {
          const [tl, tr, br, bl] = node.rectangleCornerRadii.map(v => `${Math.round(v)}px`);
          expect['border-top-left-radius'] = tl;
          expect['border-top-right-radius'] = tr;
          expect['border-bottom-right-radius'] = br;
          expect['border-bottom-left-radius'] = bl;
        } else if (typeof node.cornerRadius === 'number') {
          const radius = `${Math.round(node.cornerRadius)}px`;
          expect['border-radius'] = radius;
        }
        break;
      }
      case 'fontSize':
        if (node.style?.fontSize) expect['font-size'] = `${node.style.fontSize}px`;
        break;
      case 'fontWeight':
        if (node.style?.fontWeight) expect['font-weight'] = `${node.style.fontWeight}`;
        break;
      case 'lineHeight':
        if (node.style?.lineHeightPx) expect['line-height'] = `${node.style.lineHeightPx}px`;
        break;
      case 'textFill': {
        const fill = node.fills?.find(f => f.visible !== false && f.type === 'SOLID');
        if (fill?.color) {
          const rgb = toRgb(fill.color);
          if (rgb) expect.color = rgb;
        }
        break;
      }
      default:
        console.warn(`[contract] Unsupported property "${prop}". Skipped.`);
    }
  }
  return expect;
}

function mergeExpect(target: Record<string, string | number>, extra?: Record<string, string | number>) {
  if (!extra) return target;
  for (const [key, value] of Object.entries(extra)) {
    target[key] = value;
  }
  return target;
}

function traverse(node: FigmaNode, visit: (node: FigmaNode) => void) {
  visit(node);
  for (const child of node.children ?? []) {
    traverse(child, visit);
  }
}

function getNameFromDivPrefix(name: string | undefined): string | undefined {
  if (!name) return undefined;
  const match = name.match(/^div\.(.+)$/i);
  if (match) {
    return match[1]
      .trim()
      .replace(/\s+/g, '-')
      .replace(/\.+/g, '-')
      .toLowerCase();
  }
  return undefined;
}

function buildAutoRules(root: FigmaNode): ContractRuleConfig[] {
  const seenSelectors = new Set<string>();
  const autoRules: ContractRuleConfig[] = [];

  traverse(root, (node) => {
    const inferredName = getNameFromDivPrefix(node.name);
    if (!inferredName) return;
    const selector = `[data-test='${inferredName}']`;
    if (seenSelectors.has(selector)) return;
    seenSelectors.add(selector);
    const properties = inferProperties(node);
    autoRules.push({
      id: inferredName,
      selector,
      description: node.name,
      nodeId: node.id,
      properties
    });
  });

  return autoRules;
}

async function main() {
  const config = loadContractConfig();
  const root = loadRootNode();

  const autoRuleConfigs = buildAutoRules(root);
  const combinedRuleConfigs = new Map<string, ContractRuleConfig>();

  for (const rule of autoRuleConfigs) {
    combinedRuleConfigs.set(rule.selector, rule);
  }
  for (const rule of config.rules ?? []) {
    combinedRuleConfigs.set(rule.selector, rule);
  }

  const generatedRules = [] as any[];

  for (const ruleCfg of combinedRuleConfigs.values()) {
    const rule: any = {
      selector: ruleCfg.selector,
      description: ruleCfg.description,
      id: ruleCfg.id,
      expect: {} as Record<string, string | number>
    };

    if (ruleCfg.nodeId) {
      const node = findNodeById(root, ruleCfg.nodeId);
      if (!node) {
        console.warn(`[contract] Node ${ruleCfg.nodeId} not found. Rule ${ruleCfg.selector} skipped.`);
        continue;
      }
      const properties = ruleCfg.properties && ruleCfg.properties.length
        ? ruleCfg.properties
        : inferProperties(node);
      rule.expect = extractProperties(node, properties);
      mergeExpect(rule.expect, ruleCfg.extraExpect);
      if (ruleCfg.bounds) rule.bounds = ruleCfg.bounds;
    } else {
      rule.expect = { ...ruleCfg.extraExpect };
      if (ruleCfg.bounds) rule.bounds = ruleCfg.bounds;
    }

    generatedRules.push(rule);
  }

  if (Array.isArray(config.staticRules)) {
    generatedRules.push(...config.staticRules);
  }

  const output = {
    rules: generatedRules
  };

  const outputFile = config.output ?? 'design-contract.generated.json';
  const outputPath = path.resolve(outputFile);
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), 'utf-8');
  console.log(`[contract] Generated ${generatedRules.length} rule(s) to ${outputPath}`);
}

main().catch(err => {
  console.error('[contract] Failed to generate contract:', err);
  process.exit(1);
});
