import type { MetadataRoute } from "next";
import { REGIONS } from "@/lib/regions";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${SITE_URL}/`,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/about/`,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    ...REGIONS.map((r) => ({
      url: `${SITE_URL}/region/${r.code}/`,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
