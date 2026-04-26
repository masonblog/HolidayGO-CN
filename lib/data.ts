import fs from "node:fs";
import path from "node:path";
import { parse as parseYaml } from "yaml";
import {
  CentralPolicySchema,
  RegionPolicySchema,
  type CentralPolicy,
  type RegionPolicy,
} from "./schema";
import { REGIONS } from "./regions";

const DATA_DIR = path.join(process.cwd(), "data");

let cachedCentral: CentralPolicy | null = null;
const cachedRegions = new Map<string, RegionPolicy | null>();

export function loadCentral(): CentralPolicy {
  if (cachedCentral) return cachedCentral;
  const raw = fs.readFileSync(path.join(DATA_DIR, "central.yaml"), "utf8");
  const parsed = parseYaml(raw);
  const result = CentralPolicySchema.safeParse(parsed);
  if (!result.success) {
    throw new Error(
      `data/central.yaml 校验失败:\n${formatZodError(result.error)}`,
    );
  }
  cachedCentral = result.data;
  return cachedCentral;
}

export function loadRegion(code: string): RegionPolicy | null {
  if (cachedRegions.has(code)) return cachedRegions.get(code) ?? null;

  const meta = REGIONS.find((r) => r.code === code);
  if (!meta) {
    cachedRegions.set(code, null);
    return null;
  }

  const filename = `${code}-${meta.pinyin}.yaml`;
  const filepath = path.join(DATA_DIR, "provinces", filename);

  if (!fs.existsSync(filepath)) {
    cachedRegions.set(code, null);
    return null;
  }

  const raw = fs.readFileSync(filepath, "utf8");
  const parsed = parseYaml(raw);
  const result = RegionPolicySchema.safeParse(parsed);
  if (!result.success) {
    throw new Error(
      `data/provinces/${filename} 校验失败:\n${formatZodError(result.error)}`,
    );
  }
  cachedRegions.set(code, result.data);
  return result.data;
}

export function listAvailableRegions(): string[] {
  const dir = path.join(DATA_DIR, "provinces");
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".yaml"))
    .map((f) => f.slice(0, 2));
}

function formatZodError(err: import("zod").ZodError): string {
  return err.issues
    .map((i) => `  ${i.path.join(".") || "<root>"}: ${i.message}`)
    .join("\n");
}
