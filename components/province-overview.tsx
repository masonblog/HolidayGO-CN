import mapData from "@/lib/china-map-data.json";
import { LEAVE_LABELS, type LeaveKey, type LeaveType, type CentralPolicy } from "@/lib/schema";
import type { MergedLeave } from "@/lib/merge";
import { cn } from "@/lib/utils";

type Props = {
  code: string;
  merged: MergedLeave[];
  central: CentralPolicy;
};

const HEAT_LEVELS = [
  { min: 200, fillClass: "fill-green-500/60", strokeClass: "stroke-green-600", darkFillClass: "dark:fill-green-400/50", darkStrokeClass: "dark:stroke-green-300" },
  { min: 190, fillClass: "fill-yellow-400/60", strokeClass: "stroke-yellow-500", darkFillClass: "dark:fill-yellow-300/50", darkStrokeClass: "dark:stroke-yellow-200" },
  { min: 180, fillClass: "fill-red-500/60", strokeClass: "stroke-red-600", darkFillClass: "dark:fill-red-400/50", darkStrokeClass: "dark:stroke-red-300" },
  { min: 0, fillClass: "fill-red-900/60", strokeClass: "stroke-red-950", darkFillClass: "dark:fill-red-800/50", darkStrokeClass: "dark:stroke-red-700" },
];

function getHeatColor(value: number) {
  for (const level of HEAT_LEVELS) {
    if (value >= level.min) return level;
  }
  return HEAT_LEVELS[HEAT_LEVELS.length - 1];
}

function extractNumericDays(leaveType: LeaveType | undefined): number | null {
  if (!leaveType?.daysTable) return null;
  for (const row of leaveType.daysTable) {
    if (typeof row.days === "number") return row.days;
  }
  return null;
}

function getHeatValue(central: CentralPolicy, merged: MergedLeave[]): number {
  const getDays = (key: LeaveKey) => {
    const m = merged.find((m) => m.key === key);
    if (m && m.origin === "regional") {
      return extractNumericDays(m.data) ?? extractNumericDays(central.leaveTypes[key]) ?? 0;
    }
    return extractNumericDays(central.leaveTypes[key]) ?? 0;
  };
  return getDays("marriage") + getDays("maternity") + getDays("paternity");
}

function getDaysComparison(
  centralDays: number | null,
  regionalDays: number | null,
): "same" | "more" | "less" {
  if (centralDays === null || regionalDays === null) return "same";
  if (regionalDays > centralDays) return "more";
  if (regionalDays < centralDays) return "less";
  return "same";
}

export function ProvinceOverview({ code, merged, central }: Props) {
  const province = mapData.provinces.find((p) => p.code === code);
  if (!province) return null;

  const heatValue = getHeatValue(central, merged);
  const heatColor = getHeatColor(heatValue);

  return (
    <div className="rounded-lg border bg-card p-4 md:p-6">
      <div className="flex flex-col md:flex-row gap-6">
        {/* 左侧：地图轮廓 */}
        <div className="flex-shrink-0 w-full md:w-48 lg:w-56">
          <svg
            viewBox={mapData.viewBox.join(" ")}
            className="w-full h-auto"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d={province.d}
              className={cn(
                "transition-colors duration-200",
                heatColor.fillClass,
                heatColor.strokeClass,
                heatColor.darkFillClass,
                heatColor.darkStrokeClass,
              )}
              strokeWidth={20000}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          </svg>
          <p className="mt-2 text-xs text-center text-muted-foreground">
            热力值：{heatValue} 天
          </p>
        </div>

        {/* 右侧：假期天数速查表 */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium mb-3">假期天数速查</h3>
          <div className="rounded-md border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 text-left font-medium">假期类型</th>
                  <th className="px-3 py-2 text-left font-medium w-20">天数</th>
                  <th className="px-3 py-2 text-left font-medium w-24">与中央对比</th>
                </tr>
              </thead>
              <tbody>
                {merged.map((m) => {
                  const centralDays = extractNumericDays(central.leaveTypes[m.key]);
                  const regionalDays = extractNumericDays(m.data);
                  const comparison = m.origin === "regional"
                    ? getDaysComparison(centralDays, regionalDays)
                    : "same";

                  return (
                    <tr key={m.key} className="border-t">
                      <td className="px-3 py-2">{LEAVE_LABELS[m.key]}</td>
                      <td className="px-3 py-2 font-medium tabular-nums">
                        {regionalDays ?? centralDays ?? "—"}
                      </td>
                      <td className="px-3 py-2">
                        {comparison === "same" && (
                          <span className="text-muted-foreground">一致</span>
                        )}
                        {comparison === "more" && (
                          <span className="text-green-600 dark:text-green-400 font-medium">
                            +{(regionalDays ?? 0) - (centralDays ?? 0)} 天
                          </span>
                        )}
                        {comparison === "less" && (
                          <span className="text-red-600 dark:text-red-400 font-medium">
                            {(regionalDays ?? 0) - (centralDays ?? 0)} 天
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-[10px] text-muted-foreground">
            绿色表示多于中央规定，红色表示少于中央规定，灰色表示与中央一致。
          </p>
        </div>
      </div>
    </div>
  );
}
