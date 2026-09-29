#!/usr/bin/env node
/**
 * Script: scripts/seed-demo-catalog.ts
 *
 * Seed and generator script for the Hack Day 2026 demo catalog.
 * Configured with base URL: https://data.controlnautas.com
 *
 * Usage:
 *   npx tsx scripts/seed-demo-catalog.ts
 *   npm run seed:demo
 */

import { execSync } from "child_process"
import * as fs from "fs"
import * as path from "path"

export const DEMO_BASE_URL = process.env.DEMO_BASE_URL || "https://data.controlnautas.com"
export const WORKSPACE_ROOT = path.resolve(__dirname, "..")
export const MANIFEST_PATH = path.join(WORKSPACE_ROOT, "hackday-demo-manifest.json")

export async function runSeedDemoCatalog(): Promise<void> {
  console.log(`[SEED] Initializing Hack Day Demo Catalog Seed...`)
  console.log(`[SEED] Target Base URL: ${DEMO_BASE_URL}`)
  console.log(`[SEED] Manifest Target: ${MANIFEST_PATH}`)

  const backendDir = path.join(WORKSPACE_ROOT, "b2b-backend")

  try {
    execSync("npm run seed:demo", {
      cwd: backendDir,
      stdio: "inherit",
      env: {
        ...process.env,
        DEMO_BASE_URL,
      },
    })

    console.log(`\n[SEED] Validating generated manifest...`)
    if (!fs.existsSync(MANIFEST_PATH)) {
      throw new Error(`Manifest not found at ${MANIFEST_PATH}`)
    }

    const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8"))
    console.log(`[SEED] Manifest generated_at: ${manifest.generated_at}`)
    console.log(`[SEED] Manifest region: ${manifest.region?.name} (${manifest.region?.currency_code})`)

    if (manifest.region?.currency_code !== "usd" || manifest.region?.name !== "United States") {
      throw new Error(
        `Invalid manifest region: expected 'United States' (usd), got '${manifest.region?.name}' (${manifest.region?.currency_code})`
      )
    }

    const demoSkus = ["CN-X5PRIME-HE-XP5", "CN-N1200", "CN-THT02"]
    for (const sku of demoSkus) {
      const entry = manifest.products?.[sku] || manifest[sku]
      if (!entry) {
        throw new Error(`Missing SKU entry in manifest: ${sku}`)
      }
      const urls = entry.urls
      console.log(`  - ${sku}:`)
      console.log(`      pdf_datasheet: ${urls.pdf_datasheet}`)
      console.log(`      markdown_spec: ${urls.markdown_spec}`)
      console.log(`      pdp_human:     ${urls.pdp_human}`)

      if (!urls.pdf_datasheet.startsWith(DEMO_BASE_URL)) {
        throw new Error(`pdf_datasheet for ${sku} does not start with ${DEMO_BASE_URL}`)
      }
      if (!urls.markdown_spec.startsWith(DEMO_BASE_URL)) {
        throw new Error(`markdown_spec for ${sku} does not start with ${DEMO_BASE_URL}`)
      }
      if (!urls.pdp_human.startsWith(DEMO_BASE_URL)) {
        throw new Error(`pdp_human for ${sku} does not start with ${DEMO_BASE_URL}`)
      }
      if (!urls.pdp_human.includes("/us/products/")) {
        throw new Error(`pdp_human for ${sku} does not contain /us/products/: ${urls.pdp_human}`)
      }
      if (!urls.pdp_relative?.startsWith("/us/products/")) {
        throw new Error(`pdp_relative for ${sku} does not start with /us/products/: ${urls.pdp_relative}`)
      }
    }

    console.log(`\n[SEED] Demo catalog seeded and manifest verified successfully!`)
  } catch (err: any) {
    console.error(`[SEED ERROR] Failed to seed demo catalog: ${err.message}`)
    process.exit(1)
  }
}

// Allow direct execution
if (require.main === module || process.argv[1]?.endsWith("seed-demo-catalog.ts")) {
  runSeedDemoCatalog().catch((e) => {
    console.error(e)
    process.exit(1)
  })
}
