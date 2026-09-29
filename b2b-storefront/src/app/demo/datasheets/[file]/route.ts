import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";

const ROOT_DIR = "/home/ubuntu/hackday26";
const DATASHEETS_DIRS = [
  path.join(ROOT_DIR, "docs/datasheets"),
  path.join(ROOT_DIR, "b2b-backend/apps/backend/static/demo/datasheets"),
  path.join(ROOT_DIR, "b2b-storefront/public/demo/datasheets"),
];

function resolveFile(filename: string): string | null {
  const candidates = [filename];
  if (!filename.endsWith(".pdf")) {
    candidates.push(`${filename}.pdf`);
  }
  if (filename.includes("-datasheet")) {
    candidates.push(filename.replace("-datasheet", ""));
  } else if (filename.endsWith(".pdf")) {
    candidates.push(filename.replace(".pdf", "-datasheet.pdf"));
  }

  for (const dir of DATASHEETS_DIRS) {
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
      { error: "Datasheet not found", requested: file },
      { status: 404 }
    );
  }

  const stat = fs.statSync(filePath);
  const fileBuffer = fs.readFileSync(filePath);

  return new NextResponse(new Uint8Array(fileBuffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Length": stat.size.toString(),
      "Cache-Control": "public, max-age=3600",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
