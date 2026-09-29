import { MetadataRoute } from "next"
import { company } from "@lib/config/company"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/account",
        "/account/",
        "/cart",
        "/cart/",
        "/checkout",
        "/checkout/",
        "/search",
        "/admin",
      ],
    },
    sitemap: `${company.siteUrl}/sitemap.xml`,
  }
}
