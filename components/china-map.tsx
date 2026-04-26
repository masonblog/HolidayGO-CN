'use client';

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { REGION_BY_CODE } from "@/lib/regions";
import { cn } from "@/lib/utils";
import mapData from "@/lib/china-map-data.json";

type Props = {
  available: Set<string>;
  heatMap: Map<string, number>;
  className?: string;
};

const SMALL_REGIONS = new Set(["11", "12", "31", "81", "82"]);
const EXCLUDED_CODES = new Set(["71", "81", "82"]);

const FALLBACK_NAMES: Record<string, string> = {
  "71": "台湾省",
  "81": "香港特别行政区",
  "82": "澳门特别行政区",
};

const HEAT_LEVELS = [
  {
    min: 200,
    className:
      "fill-green-500/60 stroke-green-600 hover:fill-green-500/80 cursor-pointer dark:fill-green-400/50 dark:stroke-green-300 dark:hover:fill-green-400/70",
  },
  {
    min: 190,
    className:
      "fill-yellow-400/60 stroke-yellow-500 hover:fill-yellow-400/80 cursor-pointer dark:fill-yellow-300/50 dark:stroke-yellow-200 dark:hover:fill-yellow-300/70",
  },
  {
    min: 180,
    className:
      "fill-red-500/60 stroke-red-600 hover:fill-red-500/80 cursor-pointer dark:fill-red-400/50 dark:stroke-red-300 dark:hover:fill-red-400/70",
  },
  {
    min: 0,
    className:
      "fill-red-900/60 stroke-red-950 hover:fill-red-900/80 cursor-pointer dark:fill-red-800/50 dark:stroke-red-700 dark:hover:fill-red-800/70",
  },
];

function getHeatColorClass(value: number): string {
  for (const level of HEAT_LEVELS) {
    if (value >= level.min) return level.className;
  }
  return HEAT_LEVELS[HEAT_LEVELS.length - 1].className;
}

export function ChinaMap({ available, heatMap, className }: Props) {
  const router = useRouter();
  const [hovered, setHovered] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    code: string;
  } | null>(null);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<SVGPathElement | SVGCircleElement>, code: string) => {
      const rect = e.currentTarget.ownerSVGElement?.getBoundingClientRect();
      if (!rect) return;
      setTooltip({
        x: e.clientX - rect.left + 12,
        y: e.clientY - rect.top - 12,
        code,
      });
    },
    []
  );

  const handleMouseLeave = useCallback(() => {
    setHovered(null);
    setTooltip(null);
  }, []);

  const handleClick = (code: string) => {
    const region = REGION_BY_CODE.get(code);
    if (region) {
      router.push(`/region/${code}/`);
    }
  };

  const viewBox = mapData.viewBox.join(" ");

  return (
    <div
      role="navigation"
      aria-label="按地区选择"
      className={cn("relative w-full max-w-3xl mx-auto", className)}
      onMouseLeave={handleMouseLeave}
    >
      <svg
        viewBox={viewBox}
        className="w-full h-auto drop-shadow-sm"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* 特殊区域（南海诸岛） */}
        {mapData.special.map((sp) => (
          <path
            key={sp.code}
            d={sp.d}
            className="fill-muted/5 stroke-muted/20"
            strokeWidth={20000}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        ))}

        {/* 省份轮廓 */}
        {mapData.provinces.map((prov) => {
          const region = REGION_BY_CODE.get(prov.code);
          const isSmall = SMALL_REGIONS.has(prov.code);
          const isClickable = !!region;
          const heatValue = heatMap.get(prov.code);

          return (
            <g key={prov.code}>
              <path
                d={prov.d}
                className={cn(
                  "transition-colors duration-200",
                  isClickable && heatValue !== undefined
                    ? getHeatColorClass(heatValue)
                    : prov.code === "71"
                      ? "fill-muted/20 stroke-muted/40 cursor-default"
                      : "fill-muted/5 stroke-muted/20 cursor-default"
                )}
                strokeWidth={20000}
                strokeLinejoin="round"
                strokeLinecap="round"
                onMouseEnter={() => setHovered(prov.code)}
                onMouseMove={(e) => handleMouseMove(e, prov.code)}
                onMouseLeave={handleMouseLeave}
                onClick={() => isClickable && handleClick(prov.code)}
              />
              {/* 小区域热区放大 */}
              {isSmall && isClickable && prov.cx && prov.cy && (
                <circle
                  cx={prov.cx}
                  cy={prov.cy}
                  r={140000}
                  className="fill-transparent cursor-pointer"
                  onMouseEnter={() => setHovered(prov.code)}
                  onMouseMove={(e) => handleMouseMove(e, prov.code)}
                  onMouseLeave={handleMouseLeave}
                  onClick={() => handleClick(prov.code)}
                />
              )}
              {/* 文字标签 */}
              {!isSmall && prov.cx && prov.cy && region && (
                <text
                  x={prov.cx}
                  y={prov.cy}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="pointer-events-none select-none font-medium fill-slate-800 dark:fill-slate-100"
                  stroke="white"
                  strokeWidth={20000}
                  strokeOpacity={0.5}
                  paintOrder="stroke"
                  style={{ fontSize: 130000 }}
                >
                  {region.short}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {/* Tooltip */}
      {tooltip && hovered && (
        <div
          className="absolute pointer-events-none z-10 rounded-md border bg-popover px-2.5 py-1.5 text-sm text-popover-foreground shadow-md"
          style={{
            left: tooltip.x,
            top: tooltip.y,
          }}
        >
          <div className="font-medium">
            {REGION_BY_CODE.get(tooltip.code)?.name ?? FALLBACK_NAMES[tooltip.code] ?? tooltip.code}
          </div>
          <div className="text-xs text-muted-foreground">
            {(() => {
              const code = tooltip.code;
              if (EXCLUDED_CODES.has(code)) return "不在本次统计范围内";
              const region = REGION_BY_CODE.get(code);
              if (!region) return "暂无数据";
              const heat = heatMap.get(code);
              if (heat === undefined) return "暂无数据";
              return `假期热力值：${heat} 天`;
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
