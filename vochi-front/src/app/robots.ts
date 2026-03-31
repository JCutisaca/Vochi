import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/privacy", "/terms", "/login"],
        disallow: ["/setup", "/interview/", "/feedback/", "/history"],
      },
    ],
    sitemap: "https://vochi.soldierty.app/sitemap.xml",
  };
}
