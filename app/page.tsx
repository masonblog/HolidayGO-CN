import { RegionGrid } from "@/components/region-grid";
import { ChinaMap } from "@/components/china-map";
import { listAvailableRegions, loadCentral, loadRegion } from "@/lib/data";
import { REGIONS, REGION_BY_CODE } from "@/lib/regions";
import mapData from "@/lib/china-map-data.json";

function extractNumericDays(data: { leaveTypes?: Record<string, { daysTable?: Array<{ days: number | string }> }> }, key: string): number | null {
  const leaveType = data.leaveTypes?.[key];
  if (!leaveType?.daysTable) return null;
  for (const row of leaveType.daysTable) {
    if (typeof row.days === "number") {
      return row.days;
    }
  }
  return null;
}

export default async function HomePage() {
  const available = new Set(listAvailableRegions());
  const central = loadCentral();

  const EXCLUDED_CODES = new Set(["71", "81", "82"]);
  const heatMap = new Map<string, number>();

  for (const prov of mapData.provinces) {
    const code = prov.code;
    if (EXCLUDED_CODES.has(code)) continue;
    if (!REGION_BY_CODE.has(code)) {
      heatMap.set(code, 3 + 98);
      continue;
    }
    const region = loadRegion(code);
    const source = region ?? central;
    const marriageDays = extractNumericDays(source, "marriage") ?? 3;
    const maternityDays = extractNumericDays(source, "maternity") ?? 98;
    const paternityDays = extractNumericDays(source, "paternity") ?? 0;
    heatMap.set(code, marriageDays + maternityDays + paternityDays);
  }

  return (
    <div className="space-y-10">
      <section className="space-y-3">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          中国假期政策查询
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground md:text-base">
          以中央法规为基础，叠加各省级行政区的特别规定。选择你所在的地区，
          一屏看完七类法定假期：年休、婚、产、陪产/护理、育儿、探亲、病。
        </p>
      </section>

      <section className="space-y-4">
        <div className="text-center space-y-1">
          <h2 className="text-xl font-bold tracking-tight md:text-2xl">
            假期热力图
          </h2>
          <p className="text-sm text-muted-foreground">
            婚假 + 正常生育产假 + 陪产/护理假天数
          </p>
        </div>
        <div className="flex gap-6 items-start">
          <div className="flex-1">
            <ChinaMap available={available} heatMap={heatMap} />
          </div>
          <div className="space-y-3 pt-8">
            <div className="flex items-center gap-2">
              <span className="inline-block h-3 w-3 rounded-sm bg-green-500/60 border border-green-600" />
              <span className="text-xs">高（≥200天）</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block h-3 w-3 rounded-sm bg-yellow-400/60 border border-yellow-500" />
              <span className="text-xs">较高（190–199天）</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block h-3 w-3 rounded-sm bg-red-500/60 border border-red-600" />
              <span className="text-xs">中等（180–189天）</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block h-3 w-3 rounded-sm bg-red-900/60 border border-red-950" />
              <span className="text-xs">较低（&lt;180天）</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block h-3 w-3 rounded-sm bg-gray-400/40 border border-gray-500" />
              <span className="text-xs">未统计</span>
            </div>
            <p className="text-[10px] text-muted-foreground/60 pt-2">
              港澳台地区不在本次统计范围内。
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-medium text-muted-foreground">
          列表浏览（按行政级别分组 + 搜索）
        </h2>
        <RegionGrid available={available} />
      </section>
    </div>
  );
}
