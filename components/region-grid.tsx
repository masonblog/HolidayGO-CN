"use client";

import * as React from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { REGIONS, type RegionMeta } from "@/lib/regions";
import { cn } from "@/lib/utils";

const groupOrder: RegionMeta["group"][] = [
  "municipality",
  "province",
  "autonomous",
];
const groupLabel: Record<RegionMeta["group"], string> = {
  municipality: "直辖市",
  province: "省",
  autonomous: "自治区",
};

type Props = {
  available: Set<string>;
};

export function RegionGrid({ available }: Props) {
  const [q, setQ] = React.useState("");

  const matches = React.useMemo(() => {
    const kw = q.trim().toLowerCase();
    if (!kw) return REGIONS;
    return REGIONS.filter(
      (r) =>
        r.name.toLowerCase().includes(kw) ||
        r.short.toLowerCase().includes(kw) ||
        r.pinyin.includes(kw),
    );
  }, [q]);

  return (
    <div className="space-y-6">
      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="按省/直辖市/自治区名称或拼音搜索"
          className="w-full rounded-md border border-input bg-background py-2 pl-9 pr-3 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      {groupOrder.map((g) => {
        const items = matches.filter((r) => r.group === g);
        if (items.length === 0) return null;
        return (
          <section key={g} className="space-y-2">
            <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {groupLabel[g]}
            </h2>
            <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {items.map((r) => (
                <li key={r.code}>
                  <Link
                    href={`/region/${r.code}/`}
                    className={cn(
                      "block rounded-lg border bg-card px-3 py-2.5 text-sm transition-colors",
                      "hover:border-primary/50 hover:bg-accent",
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium">{r.short}</span>
                      {available.has(r.code) ? (
                        <span className="text-[10px] rounded bg-primary/10 px-1.5 py-0.5 text-primary">
                          有特别规定
                        </span>
                      ) : (
                        <span className="text-[10px] text-muted-foreground">
                          沿用中央
                        </span>
                      )}
                    </div>
                    <div className="mt-0.5 text-xs text-muted-foreground truncate">
                      {r.name}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        );
      })}

      {matches.length === 0 && (
        <p className="text-sm text-muted-foreground">未找到匹配的地区。</p>
      )}
    </div>
  );
}
