# AGENTS.MD

This file gives coding agents the project-specific context needed to work safely in this repository.

## Project Overview

HolidayGO-CN is a static Next.js site for querying China mainland leave and holiday entitlements by province. It combines national baseline rules with provincial special rules, then presents seven leave categories with citations to official sources.

Primary audience: Chinese readers checking employment leave policy. Keep user-facing copy clear, concise, and legally cautious.

## Tech Stack

- Next.js 16 App Router, React 19, TypeScript.
- Tailwind CSS with shadcn/ui-style components and Radix primitives.
- YAML data files parsed at build time and validated with Zod.
- Fully static output via `next.config.mjs` `output: "export"`.
- GitHub Pages is the primary deployment path; Cloudflare Workers is configured as backup.

## Important Paths

- `app/` - routes and global app layout.
- `components/` - reusable UI components.
- `components/ui/` - shadcn/ui-style primitives.
- `lib/schema.ts` - Zod schemas and leave/source labels.
- `lib/data.ts` - data loading.
- `lib/merge.ts` - central/local policy merge behavior.
- `lib/regions.ts` - region metadata and filename source of truth.
- `data/central.yaml` - central baseline policy. All seven leave types are required.
- `data/provinces/` - provincial overrides and special rules.
- `scripts/validate-data.ts` - YAML/schema validation.
- `web-articles/` - collected source material and reference articles.
- `wrangler.jsonc` - Cloudflare Workers static asset deployment config.

## Common Commands

Use npm scripts from the repository root:

```bash
npm install
npm run dev
npm run validate-data
npm run typecheck
npm run lint
npm run build
npm run deploy:cloudflare
```

Run `npm run validate-data` after changing anything under `data/`. Run `npm run typecheck`, `npm run lint`, and `npm run build` before considering broader code changes complete.

## Data Model

There are seven leave keys:

- `annual` - 年休假
- `marriage` - 婚假
- `maternity` - 产假
- `paternity` - 陪产/护理假
- `parental` - 育儿假
- `familyVisit` - 探亲假
- `sick` - 病假

Each leave rule contains:

- `rule` - human-readable summary.
- `eligibility` - optional eligibility text.
- `daysTable` - optional rows with `condition`, `days`, and optional `paid`.
- `notes` - optional extra explanation.
- `citations` - at least one official source.
- `lastVerified` - ISO date in `YYYY-MM-DD` format.

Citation `source` must be one of:

- `flk`
- `local-pc`
- `local-gov`
- `mohrss`
- `other`

## Data Editing Rules

- Treat `data/central.yaml` as the national baseline and keep all seven leave types present.
- In `data/provinces/`, include only fields that differ from or supplement the central rule. Missing provincial fields intentionally fall back to central policy.
- Provincial filenames must match `lib/regions.ts`: `<code>-<pinyin>.yaml`, for example `11-beijing.yaml`.
- Every changed rule needs at least one citation, preferably an official law database, local people's congress, local government, or MOHRSS URL.
- Update `lastVerified` to the actual verification date when checking or changing a policy.
- Be conservative with legal interpretation. Prefer quoting or summarizing the official rule over adding unsupported assumptions.
- Keep the disclaimer posture: project content is informational and not legal advice.

## Merge Behavior Notes

`lib/merge.ts` merges each leave type with this rule:

- If a provincial rule exists, it normally overrides the central rule and is marked as `regional`.
- If no provincial rule exists, central policy is used and marked as `central`.
- Marriage leave with a local `daysTable` row of exactly `3` days is treated as unchanged central policy.

Check this behavior before changing labels, badges, or source-origin UI.

## Frontend Conventions

- Preserve the current quiet, information-first design. This is a policy lookup tool, not a marketing landing page.
- Use existing components and helpers before adding new abstractions.
- Keep Chinese UI copy natural and precise.
- Maintain responsive behavior for both province lists and detail pages.
- Use existing Tailwind/shadcn patterns in `components/` and `components/ui/`.
- Use lucide-react icons when adding icon buttons or visual indicators.

## Static Export And Deployment

`next.config.mjs` sets static export. When `GITHUB_PAGES=true`, the app uses `/HolidayGO-CN` as both `basePath` and `assetPrefix`.

Do not remove this behavior unless the deployment strategy changes. Cloudflare backup deployment should build without `GITHUB_PAGES=true`, so it serves from the custom domain root.

## Working Guidelines For Agents

- Start by checking `git status` and do not overwrite user changes.
- Prefer small, scoped edits that match the existing project style.
- Use `rg`/`rg --files` for search.
- Do not edit generated output directories such as `.next/`, `out/`, `.wrangler/`, `node_modules/`, or `tsconfig.tsbuildinfo`.
- Keep dependencies stable unless the task explicitly requires dependency changes.
- If changing data, validate with `npm run validate-data`.
- If changing TypeScript or UI, run the most relevant checks and mention any check that could not be run.

