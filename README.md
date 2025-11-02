# Next.js + Tailwind “Visual Contract” Skeleton

一套可跑的最小模板（本地渲染 → 视觉对比 → 样式审计 → 代码补丁）。
- 框架：Next.js 14 + Tailwind
- 测试：Playwright（像素对比 + 快照）
- 审计：computed style 对照 `design-contract.json`
- 修复：ts-morph codemod（按 Patch Plan 确定性应用）
- 可选：Figma 导出脚本（把指定 Frame PNG 拉到 baseline）

## 1) 安装

```bash
npm i
npx playwright install
```

## 2) 运行开发服务器

```bash
npm run dev
# 打开 http://localhost:3000
```

## 3) 视觉测试（两种方式）

### 方式 A：使用 Playwright 快照（首次需要更新快照）
```bash
npm run test:visual:update
# 之后用
npm run test:visual
```

### 方式 B：使用 baseline 图片（建议配合 Figma 导出）
- 将你的基线图放到：`tests/visual/baseline/frame-hero.png`
- 然后执行：
```bash
npm run test:visual
```
测试会同时：
- 输出像素差 `tests/visual/reports/diff_report.json`
- 生成差异图 `tests/visual/diff/frame-hero.diff.png`
- 进行样式审计 `tests/visual/reports/style_violations.json`

> 如果没有 baseline，脚本会提示；你也可以用 `npm run figma:export` 从 Figma 拉取。

## 4) Figma 导出（可选）

设置环境变量并运行：
```bash
FIGMA_TOKEN=xxxx FIGMA_FILE_KEY=yyyy FRAME_NODE_ID=zzzz npm run figma:export
```
- 基线图片会保存到：`tests/visual/baseline/frame-hero.png`
- 节点原始 JSON：`tools/figma-export/.cache/node.json`（可用于生成更全面的 design-contract）

> 你可以把 Figma MCP 的导出流程接到这里，生成更全面的 `design-contract.json`。

## 5) 样式契约（design-contract.json）

`design-contract.json` 定义了**可度量的对齐指标**（示例已内置）：
```json
{
  "rules": [
    { "selector": "[data-test='hero'] h1", "expect": { "font-size": "36px", "line-height": "40px", "font-weight": "700" } },
    { "selector": "[data-test='hero'] p",  "expect": { "font-size": "18px", "line-height": "28px" } },
    { "selector": "[data-test='hero'] a[data-test='cta']", "expect": { "border-radius": "8px", "padding-left": "16px", "padding-right": "16px" } }
  ]
}
```

Playwright 在跑视觉快照的同时，会调用 `runAudit` 对 computed style 做逐项核对。

## 6) 自动补丁（确定性应用）

1) 编辑或由 Agent 生成补丁计划（JSON）：`tools/patch-plans/sample.json`
2) 运行：
```bash
npm run patch:apply
```
此示例实现了：
- `replaceTailwind`：在指定 `[data-test=...]` 元素上替换 Tailwind 类
- `updateProp`：变更某个组件的 prop 值（例：`<Heading size="2xl" />`）

> 真实工程里可以继续扩展（如 swapComponent、插入容器、调整 props 组合等）。

## 7) CI 提示

- 建议在 CI 上使用 `playwright.config.ts` 的 `webServer` 功能来启动应用后跑测试
- 将 `tests/visual/**/reports/*.json` 标记为测试工件，便于在 PR 中查看

## 8) 常见问题

- **首次运行报 “Baseline not found”**：
  - 用 `npm run test:visual:update` 接受当前截图为快照，或
  - 用 `npm run figma:export` 拉取 Figma 基线，或
  - 手动放置 `tests/visual/baseline/frame-hero.png`

- **字体/像素对不上**：
  - 本地安装与 Figma 相同字体；或用 Webfont 并设置 `-webkit-font-smoothing: antialiased;`
  - 对文字区域允许稍高阈值（本模板使用 0.01 比例全局阈值，可自行调整）

- **ReferenceError: True is not defined**：
  - 请确保测试断言使用 JS 布尔值 `true/false`，而不是 Python 风格 `True/False`。

---

Happy auto-fix & verify!
