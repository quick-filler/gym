import type { MetadataRoute } from "next";
import { SITE_ORIGIN } from "@/lib/config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/login"],
        crawlDelay: 1,
      },
      // AI crawlers — explicitly allowed for LLM search engines.
      {
        userAgent: [
          "GPTBot",
          "ChatGPT-User",
          "Google-Extended",
          "PerplexityBot",
          "ClaudeBot",
          "CCBot",
        ],
        allow: "/",
        disallow: ["/admin/", "/login"],
      },
      // Bad actors — explicit deny list.
      {
        userAgent: ["SemrushBot", "AhrefsBot", "MJ12bot"],
        disallow: "/",
      },
    ],
    sitemap: `${SITE_ORIGIN}/sitemap.xml`,
  };
}
