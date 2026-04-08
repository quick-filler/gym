import type { MetadataRoute } from "next";
import { SITE_ORIGIN } from "@/lib/config";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const routes: Array<{
    path: string;
    priority: number;
    changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  }> = [
    { path: "/", priority: 1.0, changeFrequency: "weekly" },
    { path: "/pricing", priority: 0.9, changeFrequency: "weekly" },
    { path: "/features", priority: 0.8, changeFrequency: "monthly" },
    { path: "/about", priority: 0.6, changeFrequency: "monthly" },
    { path: "/contact", priority: 0.6, changeFrequency: "monthly" },
  ];

  return routes.map((r) => ({
    url: `${SITE_ORIGIN}${r.path}`,
    lastModified,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
    alternates: {
      languages: {
        "pt-BR": `${SITE_ORIGIN}${r.path}`,
      },
    },
  }));
}
