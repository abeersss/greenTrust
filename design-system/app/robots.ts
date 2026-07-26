import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/en/login",
          "/ar/login",
          "/en/register",
          "/ar/register",
          "/en/forgot-password",
          "/ar/forgot-password",
          "/en/reset-password",
          "/ar/reset-password",
          "/en/account",
          "/ar/account",
          "/api/",
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
