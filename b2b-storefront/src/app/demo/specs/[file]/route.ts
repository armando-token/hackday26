import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";

const ROOT_DIR = "/home/ubuntu/hackday26";
const SPECS_DIRS = [
  path.join(ROOT_DIR, "docs/demo-specs"),
  path.join(ROOT_DIR, "b2b-backend/apps/backend/static/demo/specs"),
  path.join(ROOT_DIR, "b2b-storefront/public/demo/specs"),
];

function resolveFile(filename: string): string | null {
  const candidates = [filename];
  if (!filename.endsWith(".md") && !filename.endsWith(".txt")) {
    candidates.push(`${filename}.md`);
  }

  for (const dir of SPECS_DIRS) {
    for (const cand of candidates) {
      const fullPath = path.join(dir, cand);
      try {
        if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
          return fullPath;
        }
      } catch {}
    }
  }
  return null;
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ file: string }> }
) {
  const { file } = await context.params;
  const filePath = resolveFile(path.basename(file));

  if (!filePath) {
    return NextResponse.json(
      { error: "Specification not found", requested: file },
      { status: 404 }
    );
  }

  const stat = fs.statSync(filePath);
  const fileContent = fs.readFileSync(filePath, "utf-8");

  return new NextResponse(fileContent, {
    status: 200,
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Length": Buffer.byteLength(fileContent, "utf-8").toString(),
      "Cache-Control": "public, max-age=3600",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
