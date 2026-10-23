import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

// Only the marketing page and sign-in are public; everything else is private player data.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/$", "/login"],
      disallow: ["/dashboard", "/players", "/teams", "/drills", "/people", "/audit", "/notifications", "/account", "/invite", "/api"],
    },
    sitemap: `${siteUrl()}/sitemap.xml`,
  };
}
