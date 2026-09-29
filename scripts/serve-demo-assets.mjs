import http from "node:http";
import fs from "node:fs";
import path from "node:path";

const HOST = process.env.HOST || "0.0.0.0";
const portsToTry = process.env.PORT
  ? [parseInt(process.env.PORT, 10)]
  : [8000, 9000];

const ROOT_DIR = "/home/ubuntu/hackday26";
const DATASHEETS_DIRS = [
  path.join(ROOT_DIR, "docs/datasheets"),
  path.join(ROOT_DIR, "b2b-backend/apps/backend/static/demo/datasheets"),
  path.join(ROOT_DIR, "b2b-storefront/public/demo/datasheets"),
];

const SPECS_DIRS = [
  path.join(ROOT_DIR, "docs/demo-specs"),
  path.join(ROOT_DIR, "b2b-backend/apps/backend/static/demo/specs"),
  path.join(ROOT_DIR, "b2b-storefront/public/demo/specs"),
];

function resolveFile(filename, searchDirs, extensions = []) {
  const candidates = [filename];
  for (const ext of extensions) {
    if (!filename.endsWith(ext)) {
      candidates.push(`${filename}${ext}`);
    }
  }
  // Also try removing -datasheet or adding -datasheet
  if (filename.includes("-datasheet")) {
    candidates.push(filename.replace("-datasheet", ""));
  } else if (filename.endsWith(".pdf")) {
    candidates.push(filename.replace(".pdf", "-datasheet.pdf"));
  }

  for (const dir of searchDirs) {
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

function createRequestHandler(port) {
  return (req, res) => {
    const parsedUrl = new URL(req.url, `http://${req.headers.host || "localhost"}`);
    const pathname = decodeURIComponent(parsedUrl.pathname);

    // Common CORS & security headers
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
      res.statusCode = 204;
      res.end();
      return;
    }

    if (req.method !== "GET" && req.method !== "HEAD") {
      res.statusCode = 405;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ error: "Method not allowed" }));
      return;
    }

    if (pathname === "/health" || pathname === "/demo/health") {
      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ status: "ok", port, uptime: process.uptime() }));
      return;
    }

    // Datasheets: /demo/datasheets/:file
    if (pathname.startsWith("/demo/datasheets/")) {
      const filename = path.basename(pathname.slice("/demo/datasheets/".length));
      const filePath = resolveFile(filename, DATASHEETS_DIRS, [".pdf"]);

      if (!filePath) {
        res.statusCode = 404;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ error: "Datasheet not found", requested: filename }));
        return;
      }

      const stat = fs.statSync(filePath);
      res.statusCode = 200;
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Length", stat.size);
      res.setHeader("Cache-Control", "public, max-age=3600");
      if (req.method === "HEAD") {
        res.end();
        return;
      }
      fs.createReadStream(filePath).pipe(res);
      return;
    }

    // Specs: /demo/specs/:file
    if (pathname.startsWith("/demo/specs/")) {
      const filename = path.basename(pathname.slice("/demo/specs/".length));
      const filePath = resolveFile(filename, SPECS_DIRS, [".md", ".markdown", ".txt"]);

      if (!filePath) {
        res.statusCode = 404;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ error: "Specification not found", requested: filename }));
        return;
      }

      const stat = fs.statSync(filePath);
      res.statusCode = 200;
      res.setHeader("Content-Type", "text/markdown; charset=utf-8");
      res.setHeader("Content-Length", stat.size);
      res.setHeader("Cache-Control", "public, max-age=3600");
      if (req.method === "HEAD") {
        res.end();
        return;
      }
      fs.createReadStream(filePath).pipe(res);
      return;
    }

    // 404 for unknown endpoints
    res.statusCode = 404;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "Not found", path: pathname }));
  };
}

for (const p of portsToTry) {
  const srv = http.createServer(createRequestHandler(p));
  srv.on("error", (err) => {
    console.warn(`[Port ${p}] Notice: cannot bind (${err.message}). Continuing...`);
  });
  srv.listen(p, HOST, () => {
    console.log(`[OK] Demo assets server listening on http://${HOST}:${p}`);
    console.log(`  - Datasheets: http://${HOST}:${p}/demo/datasheets/:file`);
    console.log(`  - Specs:      http://${HOST}:${p}/demo/specs/:file`);
  });
}
