import type { MedusaContainer } from "@medusajs/framework/types"
import express from "express"
import path from "path"

export default async function staticMediaLoader({
  app,
}: {
  app: express.Application
  container: MedusaContainer
}): Promise<void> {
  const storefrontPublic = path.resolve(process.cwd(), "../../b2b-storefront/public")
  const staticDir = path.resolve(process.cwd(), "static")

  // Serve /static (uploads Medusa Admin) with cache 30d — durable, no node_modules patch
  app.use(
    "/static",
    express.static(staticDir, {
      maxAge: "30d",
      immutable: false,
      index: false,
      fallthrough: true,
      setHeaders: (res) => {
        res.setHeader("Access-Control-Allow-Origin", "*")
        res.setHeader(
          "Access-Control-Allow-Headers",
          "Authorization, Content-Type, X-Request-Id"
        )
      },
    })
  )

  // Serve /cn-media and /images directly on port 9000
  app.use(
    "/cn-media",
    express.static(path.join(storefrontPublic, "cn-media"), {
      maxAge: "7d",
      immutable: true,
      setHeaders: (res) => {
        res.setHeader("Access-Control-Allow-Origin", "*")
      },
    })
  )

  app.use(
    "/images",
    express.static(path.join(storefrontPublic, "images"), {
      maxAge: "7d",
      immutable: true,
      setHeaders: (res) => {
        res.setHeader("Access-Control-Allow-Origin", "*")
      },
    })
  )
  
  console.log("✅ Static media mounted on Express (/static, /cn-media, /images)")
}
