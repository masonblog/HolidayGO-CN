'use client';

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { REGION_BY_CODE } from "@/lib/regions";
import { cn } from "@/lib/utils";
import mapData from "@/lib/china-map-data.json";

type Props = {
  available: Set<string>;
  className?: string;
};

const SMALL_REGIONS = new Set(["11", "12", "31", "81", "82"]);

export function ChinaMap({ available, className }: Props) {
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
          const hasData = available.has(prov.code);
          const isClickable = !!region;

          return (
            <g key={prov.code}>
              <path
                d={prov.d}
                className={cn(
                  "transition-colors duration-200",
                  isClickable
                    ? hasData
                      ? "fill-primary/20 stroke-primary/50 hover:fill-primary/35 cursor-pointer dark:fill-primary/25 dark:stroke-primary/60 dark:hover:fill-primary/40"
                      : "fill-muted/15 stroke-border/80 hover:fill-muted/25 cursor-pointer dark:fill-muted/20 dark:stroke-muted/60 dark:hover:fill-muted/30"
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
                  className={cn(
                    "pointer-events-none select-none font-medium",
                    isClickable
                      ? hasData
                        ? "fill-primary dark:fill-primary-foreground"
                        : "fill-muted-foreground"
                      : "fill-muted-foreground/50"
                  )}
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
            {REGION_BY_CODE.get(tooltip.code)?.name ?? tooltip.code}
          </div>
          <div className="text-xs text-muted-foreground">
            {(() => {
              const code = tooltip.code;
              const region = REGION_BY_CODE.get(code);
              if (!region) return "暂无数据";
              return available.has(code) ? "有省级特别规定" : "沿用中央规定";
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
