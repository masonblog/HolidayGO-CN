# HolidayGO-CN

面向中国大陆居民的假期政策查询站，覆盖 7 类法定假期：年休、婚、产、陪产/护理、育儿、探亲、病；以中央法规一般规定为基础，地方条例作为特别规定。

## 技术栈

- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS + shadcn/ui 风格组件 + Radix UI primitives
- next-themes（深 / 浅 / 跟随系统三态切换）
- 数据：YAML 文件，仓库版本化，构建时由 zod 校验
- 部署：Cloudflare Workers（主）+ GitHub Pages（备份），`output: 'export'` 全静态产物

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

## Cloudflare Workers 主部署

项目使用 Cloudflare Workers 静态资产作为主部署：[https://holiday.masonhu.org](https://holiday.masonhu.org)，并保留 GitHub Pages 作为备用地址。Workers 构建不设置 `GITHUB_PAGES=true`，因此不会带 `/HolidayGO-CN` 路径前缀，适合部署到该自定义域名根路径。

`wrangler.jsonc` 仅绑定新域名 `holiday.masonhu.org`，新域名及 Workers 预览地址通过 `ASSETS` 绑定提供静态文件。旧域名 `holiday.masonhu.cc` 的跳转由 Cloudflare Single Redirects 独立管理，不再依赖 Worker。

### 旧域名重定向配置与迁移

可以通过 **GitHub Actions → Build and Deploy → Run workflow** 使用仓库或 `cloudflare-workers` 环境中现有的 Secrets 完成配置，无需将 API 令牌取出：

- 勾选 `configure_redirect_only`：仅创建或更新旧域名的 Single Redirect，并验证 HTTP/HTTPS 的 308、路径和查询参数，不执行应用部署。
- 同时勾选 `detach_legacy_worker`：规则验证成功后，移除旧 Worker 域名绑定，并确保存在橙云代理 DNS。DNS 设置或跳转验证失败时，会尝试恢复原 Worker 绑定。

配置规则需要 `masonhu.cc` 的 `Zone → Read` 和 `Single Redirect → Edit`；解绑及 DNS 迁移还需要账户级 `Workers Scripts → Edit` 和该 Zone 的 `DNS → Edit`。脚本会在解绑前检查 DNS 读取权限。权限不足时，保留原有绑定，避免旧链接中断。首次迁移完成后，再部署仅包含新域名的 `wrangler.jsonc`，防止后续部署重新绑定旧域名。

也可以按以下步骤手动配置：

先在 Cloudflare 的 **masonhu.cc → Rules → Redirect Rules** 创建并部署 Single Redirect，再部署移除旧域名绑定的代码，避免旧链接中断。规则设置如下：

| 配置项 | 值 |
| --- | --- |
| 规则名称 | HolidayGO 旧域名迁移 |
| 匹配方式 | Custom filter expression |
| 匹配表达式 | `(http.host eq "holiday.masonhu.cc")` |
| 目标 URL 类型 | Dynamic |
| 目标表达式 | `concat("https://holiday.masonhu.org", http.request.uri.path)` |
| 状态码 | 308 |
| Preserve query string | 开启 |

迁移步骤：

1. 保留现有 Worker 旧域名绑定，先部署以上重定向规则。规则同时覆盖 HTTP 和 HTTPS，不影响 `masonhu.cc` 的其他主机名。
2. 验证规则已启用并匹配旧域名后，部署本次 Worker 配置。检查 Worker 的 Domains & Routes，确认旧域名绑定已移除；若仍存在，手动移除。
3. 解绑可能移除旧域名的自动 DNS 记录。立即检查 **masonhu.cc → DNS**，确保 `holiday` 有橙云代理的记录；若没有，则添加 **A / holiday / 192.0.2.1 / Proxied**。不要与同名 CNAME 冲突。此地址仅用于让请求经过 Cloudflare，无需源站。确保旧域名的有效边缘 TLS 证书仍覆盖 `holiday.masonhu.cc`。
4. 验证下列请求均返回 `308`，且 `Location` 为 `https://holiday.masonhu.org/about?from=old`，再确认新域名页面和静态资源可正常访问：

   ```bash
   curl -sS -D - -o /dev/null 'http://holiday.masonhu.cc/about?from=old'
   curl -sS -D - -o /dev/null 'https://holiday.masonhu.cc/about?from=old'
   ```

日常 Workers 部署无需管理该重定向规则，也无需 `masonhu.cc` 的 Zone 权限。若通过独立 API 自动化管理重定向规则，另用仅限该 Zone 的 `Single Redirect → Edit` 权限（API 权限名为 `Dynamic URL Redirects Write`）；若还需管理其 DNS，则另加 `DNS → Edit`。

参考：[Cloudflare Single Redirect 创建说明](https://developers.cloudflare.com/rules/url-forwarding/single-redirects/create-dashboard/)、[域名重定向与代理 DNS](https://developers.cloudflare.com/fundamentals/manage-domains/redirect-domain/)。

本地部署前先完成 Cloudflare 登录，然后运行：

```bash
npm run build
npm run deploy:cloudflare
```

GitHub Actions 中的部署 workflow 为 `.github/workflows/deploy.yml`（Cloudflare Workers 主部署与 GitHub Pages 备用部署在同一 workflow 内）。Cloudflare 部署使用 Wrangler 静态资产清单进行增量上传，仅推送变更文件以提升部署速度。仓库需要配置以下 Secrets:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

## 代码检查

```bash
npm run lint        # ESLint 检查
npm run typecheck   # TypeScript 类型检查
npm run validate-data   # 校验假期数据格式
```

## 路线图

- [x] P0 骨架：中央法规 + 北京示范省份 + 端到端流程
- [x] P1 主要省份：上海、广东、浙江、江苏、四川、湖北、山东、河南、福建
- [x] P1 SVG 中国地图导航
- [x] P2 补齐 31 个省级行政区数据
- [ ] 假期天数计算器（输入工龄/婚况/胎次输出最终天数）

## 免责声明

本站内容仅供参考，不构成法律意见。具体待遇请以最新法律法规、劳动合同、用人单位规章及当地实施细则为准。
