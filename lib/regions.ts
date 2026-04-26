export type RegionMeta = {
  code: string;
  name: string;
  short: string;
  pinyin: string;
  group: "municipality" | "province" | "autonomous";
};

export const REGIONS: RegionMeta[] = [
  { code: "11", name: "北京市", short: "北京", pinyin: "beijing", group: "municipality" },
  { code: "12", name: "天津市", short: "天津", pinyin: "tianjin", group: "municipality" },
  { code: "13", name: "河北省", short: "河北", pinyin: "hebei", group: "province" },
  { code: "14", name: "山西省", short: "山西", pinyin: "shanxi", group: "province" },
  { code: "15", name: "内蒙古自治区", short: "内蒙古", pinyin: "neimenggu", group: "autonomous" },
  { code: "21", name: "辽宁省", short: "辽宁", pinyin: "liaoning", group: "province" },
  { code: "22", name: "吉林省", short: "吉林", pinyin: "jilin", group: "province" },
  { code: "23", name: "黑龙江省", short: "黑龙江", pinyin: "heilongjiang", group: "province" },
  { code: "31", name: "上海市", short: "上海", pinyin: "shanghai", group: "municipality" },
  { code: "32", name: "江苏省", short: "江苏", pinyin: "jiangsu", group: "province" },
  { code: "33", name: "浙江省", short: "浙江", pinyin: "zhejiang", group: "province" },
  { code: "34", name: "安徽省", short: "安徽", pinyin: "anhui", group: "province" },
  { code: "35", name: "福建省", short: "福建", pinyin: "fujian", group: "province" },
  { code: "36", name: "江西省", short: "江西", pinyin: "jiangxi", group: "province" },
  { code: "37", name: "山东省", short: "山东", pinyin: "shandong", group: "province" },
  { code: "41", name: "河南省", short: "河南", pinyin: "henan", group: "province" },
  { code: "42", name: "湖北省", short: "湖北", pinyin: "hubei", group: "province" },
  { code: "43", name: "湖南省", short: "湖南", pinyin: "hunan", group: "province" },
  { code: "44", name: "广东省", short: "广东", pinyin: "guangdong", group: "province" },
  { code: "45", name: "广西壮族自治区", short: "广西", pinyin: "guangxi", group: "autonomous" },
  { code: "46", name: "海南省", short: "海南", pinyin: "hainan", group: "province" },
  { code: "50", name: "重庆市", short: "重庆", pinyin: "chongqing", group: "municipality" },
  { code: "51", name: "四川省", short: "四川", pinyin: "sichuan", group: "province" },
  { code: "52", name: "贵州省", short: "贵州", pinyin: "guizhou", group: "province" },
  { code: "53", name: "云南省", short: "云南", pinyin: "yunnan", group: "province" },
  { code: "54", name: "西藏自治区", short: "西藏", pinyin: "xizang", group: "autonomous" },
  { code: "61", name: "陕西省", short: "陕西", pinyin: "shaanxi", group: "province" },
  { code: "62", name: "甘肃省", short: "甘肃", pinyin: "gansu", group: "province" },
  { code: "63", name: "青海省", short: "青海", pinyin: "qinghai", group: "province" },
  { code: "64", name: "宁夏回族自治区", short: "宁夏", pinyin: "ningxia", group: "autonomous" },
  { code: "65", name: "新疆维吾尔自治区", short: "新疆", pinyin: "xinjiang", group: "autonomous" },
];

export const REGION_BY_CODE = new Map(REGIONS.map((r) => [r.code, r]));

export function getRegion(code: string): RegionMeta | undefined {
  return REGION_BY_CODE.get(code);
}
