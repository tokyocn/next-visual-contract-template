import fs from 'node:fs';
import path from 'node:path';

type FigmaColor = { r: number; g: number; b: number; a?: number };

type FigmaPaint = {
  type: string;
  visible?: boolean;
  opacity?: number;
  color?: FigmaColor;
  gradientStops?: Array<{ color: FigmaColor; position: number }>;
  blendMode?: string;
};

export type FigmaNode = {
  id: string;
  name: string;
  type: string;
  characters?: string;
  layoutMode?: string;
  absoluteBoundingBox?: { x: number; y: number; width: number; height: number };
  fills?: FigmaPaint[];
  strokes?: FigmaPaint[];
  strokeWeight?: number;
  cornerRadius?: number | string;
  rectangleCornerRadii?: number[];
  paddingLeft?: number;
  paddingRight?: number;
  paddingTop?: number;
  paddingBottom?: number;
  itemSpacing?: number;
  counterAxisSpacing?: number;
  primaryAxisAlignItems?: string;
  counterAxisAlignItems?: string;
  style?: {
    fontFamily?: string;
    fontPostScriptName?: string;
    fontWeight?: number;
    fontSize?: number;
    textAutoResize?: string;
    textAlignHorizontal?: string;
    textAlignVertical?: string;
    letterSpacing?: number;
    lineHeightPx?: number;
    lineHeightPercentFontSize?: number;
  };
  children?: FigmaNode[];
};

export type FetchOptions = {
  token?: string;
  fileKey: string;
  nodeId: string;
  cacheDir?: string;
};

export type FigmaNodeResponse = {
  document: FigmaNode;
};

export type FigmaNodesResponse = {
  nodes: Record<string, FigmaNodeResponse>;
};

function colorToHex(color?: FigmaColor): string | undefined {
  if (!color) return undefined;
  const { r, g, b, a } = color;
  const to255 = (v: number) => Math.round(Math.min(Math.max(v * 255, 0), 255));
  const alpha = a === undefined ? 1 : a;
  const rgb = [to255(r), to255(g), to255(b)];
  const hex = `#${rgb.map(v => v.toString(16).padStart(2, '0')).join('')}`;
  if (alpha < 0.999) {
    const alphaHex = to255(alpha).toString(16).padStart(2, '0');
    return `${hex}${alphaHex}`;
  }
  return hex;
}

function paintToString(paint?: FigmaPaint[]): string | undefined {
  if (!paint?.length) return undefined;
  const visiblePaint = paint.find(p => p.visible !== false);
  if (!visiblePaint) return undefined;
  if (visiblePaint.type === 'SOLID') {
    return colorToHex(visiblePaint.color);
  }
  if (visiblePaint.type === 'GRADIENT_LINEAR' && visiblePaint.gradientStops) {
    const stops = visiblePaint.gradientStops
      .map(stop => `${colorToHex(stop.color)} ${(stop.position * 100).toFixed(1)}%`)
      .join(', ');
    return `linear-gradient(${stops})`;
  }
  return `${visiblePaint.type.toLowerCase()}`;
}

export async function fetchFigmaNode(options: FetchOptions): Promise<FigmaNode> {
  const { token = process.env.FIGMA_TOKEN, fileKey, nodeId, cacheDir } = options;
  if (!token) {
    throw new Error('Missing FIGMA_TOKEN. Cannot fetch design data.');
  }

  const params = new URLSearchParams({ ids: nodeId });
  const url = `https://api.figma.com/v1/files/${fileKey}/nodes?${params.toString()}`;
  const res = await fetch(url, {
    headers: {
      'X-Figma-Token': token
    }
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch Figma node ${nodeId}: ${res.status} ${res.statusText}`);
  }
  const json = (await res.json()) as FigmaNodesResponse;
  const node = json.nodes?.[nodeId]?.document;
  if (!node) {
    throw new Error(`Figma node ${nodeId} not present in response.`);
  }

  if (cacheDir) {
    const abs = path.resolve(cacheDir, `${nodeId.replace(/[:/]/g, '_')}.json`);
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    fs.writeFileSync(abs, JSON.stringify(node, null, 2));
  }

  return node;
}

export type SummaryOptions = {
  maxDepth?: number;
  maxTextLength?: number;
};

const DEFAULT_SUMMARY_OPTIONS: Required<SummaryOptions> = {
  maxDepth: 4,
  maxTextLength: 160
};

function summarizeNodeInternal(node: FigmaNode, depth: number, options: Required<SummaryOptions>, lines: string[]) {
  const indent = '  '.repeat(depth);
  const bbox = node.absoluteBoundingBox
    ? ` (${Math.round(node.absoluteBoundingBox.width)}x${Math.round(node.absoluteBoundingBox.height)} @ ${Math.round(node.absoluteBoundingBox.x)},${Math.round(node.absoluteBoundingBox.y)})`
    : '';
  const fill = paintToString(node.fills);
  const stroke = paintToString(node.strokes);
  const base = `${indent}- ${node.type}: ${node.name}${bbox}`;
  const styles: string[] = [];

  if (fill) styles.push(`fill=${fill}`);
  if (stroke) styles.push(`stroke=${stroke}`);
  if (node.cornerRadius !== undefined) styles.push(`radius=${node.cornerRadius}`);
  if (node.rectangleCornerRadii && node.rectangleCornerRadii.some(r => r)) {
    styles.push(`radii=${node.rectangleCornerRadii.map(r => Math.round(r ?? 0)).join('/')}`);
  }
  if (node.layoutMode) styles.push(`layout=${node.layoutMode}`);
  if (node.itemSpacing !== undefined) styles.push(`spacing=${node.itemSpacing}`);
  if (node.paddingLeft !== undefined) {
    styles.push(
      `padding=${[node.paddingTop, node.paddingRight, node.paddingBottom, node.paddingLeft]
        .map(v => (v !== undefined ? Math.round(v) : 0))
        .join('/')}`
    );
  }
  if (styles.length) {
    lines.push(`${base} [${styles.join(', ')}]`);
  } else {
    lines.push(base);
  }

  if (node.type === 'TEXT' && node.characters) {
    const str = node.characters.length > options.maxTextLength
      ? `${node.characters.slice(0, options.maxTextLength)}…`
      : node.characters;
    const styleBits: string[] = [];
    if (node.style?.fontFamily) styleBits.push(`font=${node.style.fontFamily}`);
    if (node.style?.fontSize) styleBits.push(`size=${node.style.fontSize}`);
    if (node.style?.fontWeight) styleBits.push(`weight=${node.style.fontWeight}`);
    if (node.style?.lineHeightPx) styleBits.push(`lineHeightPx=${node.style.lineHeightPx.toFixed(1)}`);
    lines.push(`${indent}  text="${str.replace(/\s+/g, ' ').trim()}"${styleBits.length ? ` (${styleBits.join(', ')})` : ''}`);
  }

  if (!node.children?.length || depth >= options.maxDepth) return;
  for (const child of node.children) {
    summarizeNodeInternal(child, depth + 1, options, lines);
  }
}

export function summarizeNode(node: FigmaNode, summaryOptions: SummaryOptions = {}): string {
  const options = { ...DEFAULT_SUMMARY_OPTIONS, ...summaryOptions };
  const lines: string[] = [];
  summarizeNodeInternal(node, 0, options, lines);
  return lines.join('\n');
}
