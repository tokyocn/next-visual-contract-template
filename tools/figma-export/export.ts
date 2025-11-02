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

const token = process.env.FIGMA_TOKEN;
const fileKey = process.env.FIGMA_FILE_KEY;
const nodeId = process.env.FRAME_NODE_ID;

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
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
