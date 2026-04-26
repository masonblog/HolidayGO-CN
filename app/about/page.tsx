import Link from "next/link";

export const metadata = { title: "关于" };

export default function AboutPage() {
  return (
    <article className="prose prose-sm dark:prose-invert max-w-3xl space-y-5">
      <h1 className="text-2xl font-bold tracking-tight md:text-3xl">关于本站</h1>
      <p className="text-muted-foreground">
        中国假期查询工具帮助你在几十秒内查清自己所在省份的七类法定假期权益：
        年休假、婚假、产假、陪产/护理假、育儿假、探亲假、病假。
        国家层面的统一规定与各省（自治区、直辖市）的特殊规定自动合并展示，
        让你不用翻遍法规文件，也能快速获得准确、可溯源的假期信息。
      </p>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">功能与使用方法</h2>
        <div className="text-sm text-muted-foreground space-y-3">
          <div>
            <h3 className="font-medium text-foreground">假期热力图</h3>
            <p>打开首页，点击中国地图上的省份，即可进入该地区的假期详情页。地图按「假期热力值 = 婚假天数 + 正常生育产假天数 + 陪产/护理假天数」为各省着色：热力值越高颜色越偏绿，越低越偏深红；港澳台地区不在统计范围内，以灰色表示。</p>
          </div>
          <div>
            <h3 className="font-medium text-foreground">列表浏览与搜索</h3>
            <p>首页下方的列表按行政区分组，支持关键词搜索。输入省份名称（如"浙江"、"广东"）即可快速定位。</p>
          </div>
          <div>
            <h3 className="font-medium text-foreground">查看详情</h3>
            <p>进入地区页面后，七类假期以标签页形式展示。每条规则均标注来源：中央（国家法律法规的一般规定）或本地（本省地方性法规、条例或实施办法）。每条规则下方均附有原文链接（全国人大法律数据库、中国政府网、人社部及地方官网），方便你进一步核实。</p>
          </div>
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">覆盖范围</h2>
        <div className="rounded-md border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr>
                <th className="px-3 py-2 text-left font-medium">假期类型</th>
                <th className="px-3 py-2 text-left font-medium">说明</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t"><td className="px-3 py-2 font-medium">年休假</td><td className="px-3 py-2">按累计工作年限确定 5～15 天带薪假期</td></tr>
              <tr className="border-t"><td className="px-3 py-2 font-medium">婚假</td><td className="px-3 py-2">法定 3 天 + 各地奖励性延长天数</td></tr>
              <tr className="border-t"><td className="px-3 py-2 font-medium">产假</td><td className="px-3 py-2">正常生育、难产、多胞胎、流产等情形</td></tr>
              <tr className="border-t"><td className="px-3 py-2 font-medium">陪产/护理假</td><td className="px-3 py-2">男方在配偶生育期间的带薪陪护假</td></tr>
              <tr className="border-t"><td className="px-3 py-2 font-medium">育儿假</td><td className="px-3 py-2">子女三周岁前父母每年可休的带薪假期</td></tr>
              <tr className="border-t"><td className="px-3 py-2 font-medium">探亲假</td><td className="px-3 py-2">与父母或配偶分居两地的职工探亲待遇</td></tr>
              <tr className="border-t"><td className="px-3 py-2 font-medium">病假</td><td className="px-3 py-2">因病或非因工负伤的医疗期及病假工资标准</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">数据组织</h2>
        <p className="text-sm text-muted-foreground">
          以中央法规的一般规定作为基础层；各省级行政区的特别规定作为补充层。
          页面渲染时按「本地优先，否则中央」合并展示，并以徽章注明来源。
          数据以 YAML 格式存储，便于人工编辑和版本管理。
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
          本站内容仅供信息参考，不构成法律意见。法律法规可能随时修订，各地实施细则也存在差异，
          具体待遇请以最新生效的法律法规、你的劳动合同、用人单位规章制度及当地人社部门的解释与执行口径为准。
          涉及具体个案或权益争议，建议咨询专业律师或当地劳动仲裁机构。
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">技术栈</h2>
        <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
          <li>框架：Next.js 16（App Router + 静态导出）</li>
          <li>语言：TypeScript</li>
          <li>样式：Tailwind CSS</li>
          <li>UI 组件：Radix UI + shadcn/ui</li>
          <li>数据格式：YAML</li>
          <li>部署：GitHub Actions → GitHub Pages</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">反馈与共建</h2>
        <p className="text-sm text-muted-foreground">
          如果你发现数据有误、链接失效，或所在省份的最新政策已有更新，欢迎通过仓库 Issue 或 Pull Request 反馈。
          项目以开源方式维护，社区共同校对数据，确保信息及时、准确。
        </p>
        <p>
          <a
            className="text-primary underline"
            href="https://github.com/masonblog/HolidayGO-CN"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub 仓库 →
          </a>
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
