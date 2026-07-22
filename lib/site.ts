// 站点 canonical 域名：Cloudflare Workers 部署（根路径，无 basePath 前缀）。
// GitHub Pages 镜像页面的 canonical 也统一指向该域名，避免搜索引擎判定重复内容。
export const SITE_URL = "https://holiday.masonhu.cc";

export const SITE_NAME = "HolidayGO";

export const SITE_TITLE = "HolidayGO · 中国假期政策查询";

export const SITE_DESCRIPTION =
  "面向中国大陆居民的假期政策查询：年休、婚、产、陪产、育儿、探亲、病假，覆盖中央法规与省级特别规定。";

export function normalizeChineseBlogTitle(title: string) {
  return title.replace(/议正言辞(?=\d)/g, "议正言辞 ");
}
