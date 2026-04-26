import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { REGIONS, getRegion } from "@/lib/regions";
import { loadCentral, loadRegion } from "@/lib/data";
import { mergePolicy } from "@/lib/merge";
import { LEAVE_LABELS } from "@/lib/schema";
import { LeaveCard } from "@/components/leave-card";
import { ProvinceOverview } from "@/components/province-overview";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const dynamicParams = false;

export function generateStaticParams() {
  return REGIONS.map((r) => ({ code: r.code }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const region = getRegion(code);
  if (!region) return {};
  return { title: `${region.name}假期政策` };
}

export default async function RegionPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const region = getRegion(code);
  if (!region) notFound();

  const central = loadCentral();
  const local = loadRegion(code);
  const merged = mergePolicy(central, local);
  const supplementCount = merged.filter((m) => m.origin === "regional").length;

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
          返回地区选择
        </Link>
      </div>

      <header className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          {region.name}
        </h1>
        <p className="text-sm text-muted-foreground">
          {supplementCount > 0
            ? `本地区在 ${supplementCount} 类假期上有特别规定，其余沿用中央法规。`
            : "本地区暂无收录的特别规定，全部沿用中央法规。如有补充欢迎提交 PR。"}
        </p>
      </header>

      <ProvinceOverview code={code} merged={merged} central={central} />

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">全部</TabsTrigger>
          {merged.map((m) => (
            <TabsTrigger key={m.key} value={m.key}>
              {LEAVE_LABELS[m.key]}
              {m.origin === "regional" && (
                <span className="ml-1 inline-block h-1.5 w-1.5 rounded-full bg-primary" />
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="all">
          <div className="grid gap-4 md:grid-cols-2">
            {merged.map((m) => (
              <LeaveCard
                key={m.key}
                leaveKey={m.key}
                origin={m.origin}
                data={m.data}
                regionName={region.short}
              />
            ))}
          </div>
        </TabsContent>

        {merged.map((m) => (
          <TabsContent key={m.key} value={m.key}>
            <div className="max-w-3xl">
              <LeaveCard
                leaveKey={m.key}
                origin={m.origin}
                data={m.data}
                regionName={region.short}
              />
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
