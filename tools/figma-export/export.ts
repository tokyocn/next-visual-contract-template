/**
 * Minimal Figma export helper.
 * Exports a frame PNG as baseline and dumps raw node JSON (optional).
 * 
 * Required env:
 *   FIGMA_TOKEN       - Personal Access Token
 *   FIGMA_FILE_KEY    - File key (from figma.com/file/<KEY>/...)
 *   FRAME_NODE_ID     - Node id of the frame (e.g., 12:34 or a long id)
 * 
 * Usage:
 *   FIGMA_TOKEN=xxx FIGMA_FILE_KEY=yyy FRAME_NODE_ID=zzz npm run figma:export
 */
import fs from 'node:fs';
import path from 'node:path';

type AssetDescriptor = {
  id: string;
  file: string;
  format: 'png' | 'svg';
  scale?: number;
};

type RegionConfig = {
  name: string;
  selector: string;
  baselinePath?: string;
  threshold?: number;
  nodeId?: string;
};

type VisualConfig = {
  regions?: RegionConfig[];
};

const token = process.env.FIGMA_TOKEN;
const fileKey = process.env.FIGMA_FILE_KEY;
const nodeId = process.env.FRAME_NODE_ID;

const ASSETS: AssetDescriptor[] = [
  { id: '1:204', file: 'public/images/hero-visual.png', format: 'png' },
  { id: '1:1048', file: 'public/images/feature-digital-learning.png', format: 'png' },
  { id: '1:1089', file: 'public/images/feature-team-capability.png', format: 'png' },
  { id: '1:1095', file: 'public/images/feature-pricing.png', format: 'png' },
  { id: '1:82', file: 'public/images/logo-full.svg', format: 'svg' }
];

const VISUAL_CONFIG_PATH = path.join('tests', 'visual', 'config.json');

function loadVisualConfig(): VisualConfig {
  if (!fs.existsSync(VISUAL_CONFIG_PATH)) {
    return {};
  }
  try {
    const raw = fs.readFileSync(VISUAL_CONFIG_PATH, 'utf-8');
    return JSON.parse(raw) as VisualConfig;
  } catch (err) {
    console.warn('[figma-export] Failed to parse config, skipping region exports:', err);
    return {};
  }
}

function resolveRegionBaselinePath(region: RegionConfig) {
  const safeName = region.name.replace(/[^a-zA-Z0-9-_]/g, '_');
  return path.resolve(region.baselinePath ?? path.join('tests', 'visual', 'baseline', `${safeName}.png`));
}

async function fetchImageUrl(id: string, format: 'png' | 'svg', scale = 1) {
  const params = new URLSearchParams({
    ids: id,
    format,
  });
  if (format === 'png') {
    params.set('scale', String(scale));
  }
  const res = await fetch(`https://api.figma.com/v1/images/${fileKey}?${params.toString()}`, {
    headers: { 'X-Figma-Token': token! }
  });
  if (!res.ok) {
    throw new Error(`[figma-export] Failed to request image url for ${id}: ${res.status} ${res.statusText}`);
  }
  const json = await res.json();
  return json.images?.[id] as string | undefined;
}

async function downloadAsset(asset: AssetDescriptor) {
  const url = await fetchImageUrl(asset.id, asset.format, asset.scale ?? 1);
  if (!url) {
    console.warn(`[figma-export] No image url for ${asset.id}, skip.`);
    return;
  }
  const arrayBuffer = await (await fetch(url)).arrayBuffer();
  const dest = path.resolve(asset.file);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, Buffer.from(arrayBuffer));
  console.log(`[figma-export] Saved asset ${asset.file}`);
}

async function main() {
  if (!token || !fileKey || !nodeId) {
    console.log('[figma-export] Missing env. Skipping download.');
    console.log('Set FIGMA_TOKEN, FIGMA_FILE_KEY, FRAME_NODE_ID to enable export.');
    process.exit(0);
  }

  // 1) Fetch image URL
  const imgRes = await fetch(`https://api.figma.com/v1/images/${fileKey}?ids=${encodeURIComponent(nodeId)}&format=png&scale=1`, {
    headers: { 'X-Figma-Token': token }
  });
  const imgJson = await imgRes.json();
  const url = imgJson.images?.[nodeId];
  if (!url) {
    console.error('[figma-export] No image URL returned:', imgJson);
    process.exit(1);
  }

  // 2) Download PNG
  const png = await (await fetch(url)).arrayBuffer();
  const baselineDir = path.join('tests','visual','baseline');
  fs.mkdirSync(baselineDir, { recursive: true });
  const baselinePath = path.join(baselineDir, 'frame-hero.png');
  fs.writeFileSync(baselinePath, Buffer.from(png));
  console.log('[figma-export] Saved baseline:', baselinePath);

  // 3) (Optional) Dump node json
  const nodeRes = await fetch(`https://api.figma.com/v1/files/${fileKey}/nodes?ids=${encodeURIComponent(nodeId)}`, {
    headers: { 'X-Figma-Token': token }
  });
  const nodeJson = await nodeRes.json();
  fs.mkdirSync('tools/figma-export/.cache', { recursive: true });
  fs.writeFileSync('tools/figma-export/.cache/node.json', JSON.stringify(nodeJson, null, 2));
  console.log('[figma-export] Saved node dump tools/figma-export/.cache/node.json');
  const visualConfig = loadVisualConfig();
  if (visualConfig.regions?.length) {
    for (const region of visualConfig.regions) {
      if (!region.nodeId) continue;
      try {
        const imageUrl = await fetchImageUrl(region.nodeId, 'png', 1);
        if (!imageUrl) {
          console.warn(`[figma-export] No image URL returned for region ${region.name} (${region.nodeId}).`);
          continue;
        }
        const buffer = await (await fetch(imageUrl)).arrayBuffer();
        const baselinePath = resolveRegionBaselinePath(region);
        fs.mkdirSync(path.dirname(baselinePath), { recursive: true });
        fs.writeFileSync(baselinePath, Buffer.from(buffer));
        console.log(`[figma-export] Saved region baseline for ${region.name}: ${baselinePath}`);
      } catch (err) {
        console.warn(`[figma-export] Failed to export region baseline for ${region.name}:`, err);
      }
    }
  }

  // 4) 额外切图资源
  for (const asset of ASSETS) {
    try {
      await downloadAsset(asset);
    } catch (err) {
      console.warn(`[figma-export] Failed to download asset ${asset.file}:`, err);
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
