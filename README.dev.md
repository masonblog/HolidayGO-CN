# HolidayGO-CN

面向中国大陆居民的假期政策查询站，覆盖 7 类法定假期：年休、婚、产、陪产/护理、育儿、探亲、病；以中央法规一般规定为基础，地方条例作为特别规定。

## 技术栈

- Next.js 15 (App Router) + React 19 + TypeScript
- Tailwind CSS + shadcn/ui 风格组件 + Radix UI primitives
- next-themes（深 / 浅 / 跟随系统三态切换）
- 数据：YAML 文件，仓库版本化，构建时由 zod 校验
- 部署：Cloudflare Pages（`output: 'export'` 全静态产物）

## 本地开发

```bash
npm install
npm run dev          # http://localhost:3000
npm run validate-data # 校验所有 YAML
npm run typecheck    # tsc --noEmit
npm run lint
npm run build        # 输出 out/ 静态站点
```

## 数据组织

```
data/
├── central.yaml                 # 中央法规一般规定（必填全部 7 类）
└── provinces/
    ├── 11-beijing.yaml          # 仅写覆盖/特别规定字段，省略表示沿用中央
    ├── 31-shanghai.yaml
    └── ... (按 GB/T 2260 行政区代码 + 拼音命名)
```

合并策略：渲染时以「本地优先，否则中央」为规则。UI 以徽章注明每条规则来源。

## 添加/修订一个省份

1. 复制 `data/provinces/11-beijing.yaml` 为 `<code>-<pinyin>.yaml`，文件名按 `lib/regions.ts` 中的 `code` + `pinyin`。
2. 仅填写本省与中央有差异的假期类型；无差异的字段直接省略。
3. 每条 `citations` 至少 1 条；尽量给到具体条款 URL（flk.npc.gov.cn / 地方人大 / 政府官网 / 人社部 等）。
4. `lastVerified` 填核对当日 ISO 日期（YYYY-MM-DD）。
5. 本地跑 `npm run validate-data` 与 `npm run build`，提交 PR。

## 部署到 Cloudflare Pages

- Build command: `npm run build`
- Build output directory: `out`
- Node version: `22`
- 不需要 `wrangler.toml`（纯静态产物）。

## 路线图

- [x] P0 骨架：中央法规 + 北京示范省份 + 端到端流程
- [x] P1 主要省份：上海、广东、浙江、江苏、四川、湖北、山东、河南、福建
- [x] P1 SVG 中国地图导航
- [x] P2 补齐 31 个省级行政区数据
- [ ] 假期天数计算器（输入工龄/婚况/胎次输出最终天数）

## 免责声明

本站内容仅供参考，不构成法律意见。具体待遇请以最新法律法规、劳动合同、用人单位规章及当地实施细则为准。
