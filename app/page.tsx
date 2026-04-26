import { RegionGrid } from "@/components/region-grid";
import { ChinaMap } from "@/components/china-map";
import { listAvailableRegions } from "@/lib/data";

export default function HomePage() {
  const available = new Set(listAvailableRegions());

  return (
    <div className="space-y-10">
      <section className="space-y-3">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          按地区查询假期政策
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground md:text-base">
          以中央法规为基础，叠加各省级行政区的特别规定。选择你所在的地区，
          一屏看完七类法定假期：年休、婚、产、陪产/护理、育儿、探亲、病。
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-medium text-muted-foreground">
          地图导航（按地理位置点击省份）
        </h2>
        <ChinaMap available={available} />
        <p className="text-center text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <span className="inline-block h-2.5 w-2.5 rounded-sm bg-primary/30 border border-primary/40" />
            有省级特别规定
          </span>
          <span className="mx-3">·</span>
          <span className="inline-flex items-center gap-1">
            <span className="inline-block h-2.5 w-2.5 rounded-sm bg-card border border-border" />
            沿用中央规定
          </span>
        </p>
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
