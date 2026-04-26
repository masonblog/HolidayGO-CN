import Link from "next/link";

export const metadata = { title: "关于" };

export default function AboutPage() {
  return (
    <article className="prose prose-sm dark:prose-invert max-w-3xl space-y-5">
      <h1 className="text-2xl font-bold tracking-tight md:text-3xl">关于本站</h1>
      <p className="text-muted-foreground">
        HolidayGO 致力于让中国大陆居民一站式查清自己可享的法定假期，
        覆盖年休、婚、产、陪产/护理、育儿、探亲、病共七类。
      </p>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">数据组织</h2>
        <p className="text-sm text-muted-foreground">
          以中央法规的一般规定作为基础层；各省级行政区的特别规定作为补充层。
          页面渲染时按「本地优先，否则中央」合并展示，并以徽章注明来源。
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">数据来源</h2>
        <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
          <li>
            <a
              className="underline"
              href="https://flk.npc.gov.cn"
              target="_blank"
              rel="noopener noreferrer"
            >
              国家法律法规数据库（全国人大）
            </a>
          </li>
          <li>
            <a
              className="underline"
              href="https://www.gov.cn"
              target="_blank"
              rel="noopener noreferrer"
            >
              中国政府网（国务院文件）
            </a>
          </li>
          <li>
            <a
              className="underline"
              href="https://www.mohrss.gov.cn"
              target="_blank"
              rel="noopener noreferrer"
            >
              人力资源和社会保障部
            </a>
          </li>
          <li>各省（自治区、直辖市）人大及政府官网（地方条例与实施办法）</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">免责声明</h2>
        <p className="text-sm text-muted-foreground">
          本站内容仅供参考，不构成法律意见。具体待遇请以最新法律法规、
          劳动合同、用人单位规章及当地实施细则为准；个案问题建议咨询专业律师。
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">参与共建</h2>
        <p className="text-sm text-muted-foreground">
          本项目以仓库 PR 方式维护数据。欢迎补全省份、勘误条款、更新链接。
        </p>
        <p>
          <Link href="/" className="text-primary underline">
            返回首页
          </Link>
        </p>
      </section>
    </article>
  );
}
