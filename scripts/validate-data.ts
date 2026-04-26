#!/usr/bin/env tsx
/**
 * 独立校验所有 YAML 数据文件。CI 中先于 next build 执行。
 * 用法：npm run validate-data
 */
import fs from "node:fs";
import path from "node:path";
import { parse as parseYaml } from "yaml";
import {
  CentralPolicySchema,
  RegionPolicySchema,
} from "../lib/schema";
import { REGIONS } from "../lib/regions";

const DATA_DIR = path.join(process.cwd(), "data");

let errors = 0;
const log = {
  ok: (m: string) => console.log(`\x1b[32m✓\x1b[0m ${m}`),
  fail: (m: string) => {
    console.log(`\x1b[31m✗\x1b[0m ${m}`);
    errors++;
  },
  info: (m: string) => console.log(`  ${m}`),
};

function validate<T extends import("zod").ZodTypeAny>(
  filepath: string,
  schema: T,
): boolean {
  if (!fs.existsSync(filepath)) {
    log.fail(`缺失: ${path.relative(process.cwd(), filepath)}`);
    return false;
  }
  let parsed: unknown;
  try {
    parsed = parseYaml(fs.readFileSync(filepath, "utf8"));
  } catch (e) {
    log.fail(`YAML 解析失败 ${path.relative(process.cwd(), filepath)}: ${(e as Error).message}`);
    return false;
  }
  const result = schema.safeParse(parsed);
  if (!result.success) {
    log.fail(`Schema 校验失败 ${path.relative(process.cwd(), filepath)}`);
    for (const issue of result.error.issues) {
      log.info(`  ${issue.path.join(".") || "<root>"}: ${issue.message}`);
    }
    return false;
  }
  log.ok(`${path.relative(process.cwd(), filepath)}`);
  return true;
}

console.log("校验中央法规 ...");
validate(path.join(DATA_DIR, "central.yaml"), CentralPolicySchema);

console.log("\n校验省级特别规定 ...");
const provincesDir = path.join(DATA_DIR, "provinces");
if (!fs.existsSync(provincesDir)) {
  log.info("(暂无 data/provinces/ 目录)");
} else {
  for (const meta of REGIONS) {
    const file = path.join(provincesDir, `${meta.code}-${meta.pinyin}.yaml`);
    if (!fs.existsSync(file)) continue;
    validate(file, RegionPolicySchema);
  }
  // 检查是否存在不在 REGIONS 列表中的省级 YAML（命名错误）
  for (const f of fs.readdirSync(provincesDir)) {
    if (!f.endsWith(".yaml")) continue;
    const code = f.slice(0, 2);
    const meta = REGIONS.find((r) => r.code === code);
    if (!meta) {
      log.fail(`未知行政区代码: ${f}`);
      continue;
    }
    const expected = `${meta.code}-${meta.pinyin}.yaml`;
    if (f !== expected) {
      log.fail(`文件名不规范: 期望 ${expected}，实际 ${f}`);
    }
  }
}

console.log("");
if (errors > 0) {
  console.log(`\x1b[31m发现 ${errors} 处错误\x1b[0m`);
  process.exit(1);
} else {
  console.log("\x1b[32m全部通过\x1b[0m");
}
