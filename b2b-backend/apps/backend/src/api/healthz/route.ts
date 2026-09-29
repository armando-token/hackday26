import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { execSync } from "child_process"

export const AUTHENTICATE = false

let cachedCommit: string | null = null

function getGitCommit(): string {
  if (cachedCommit) {
    return cachedCommit
  }
  if (process.env.GIT_COMMIT) {
    cachedCommit = process.env.GIT_COMMIT.trim()
    return cachedCommit
  }
  if (process.env.COMMIT_SHA) {
    cachedCommit = process.env.COMMIT_SHA.trim().slice(0, 7)
    return cachedCommit
  }
  try {
    cachedCommit = execSync("git rev-parse --short HEAD", {
      encoding: "utf8",
      timeout: 2000,
    }).trim()
  } catch {
    cachedCommit = "unknown"
  }
  return cachedCommit
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  return res.status(200).json({
    status: "ok",
    version: "1.0.0",
    commit: getGitCommit(),
  })
}
