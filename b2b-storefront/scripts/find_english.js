const fs = require("fs");
const path = require("path");

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      if (!file.includes("node_modules") && !file.includes(".next") && !file.includes(".git")) {
        results = results.concat(walk(fullPath));
      }
    } else if (fullPath.endsWith(".tsx") || fullPath.endsWith(".ts")) {
      results.push(fullPath);
    }
  });
  return results;
}

const files = walk("/home/ubuntu/CN_Web/b2b-storefront/src");

const englishWordSet = new Set([
  "sign", "cart", "item", "items", "shipping", "billing", "payment", "place",
  "order", "orders", "checkout", "address", "addresses", "profile", "password", "email", "phone", "first",
  "last", "name", "city", "state", "postal", "code", "country", "subtotal", "total", "discount", "promo",
  "tax", "taxes", "view", "edit", "delete", "remove", "save", "cancel", "apply", "submit", "loading",
  "search", "results", "found", "filter", "filters", "sort", "by", "price", "low", "high", "details",
  "specifications", "overview", "features", "documents", "downloads", "manual", "datasheet", "warranty",
  "model", "brand", "quantity", "qty", "stock", "availability", "unit", "units", "quote", "request",
  "categories", "category", "shop", "store", "product", "products", "related", "recently", "viewed",
  "welcome", "hello", "log", "registered", "account", "summary", "please", "enter", "select", "choose",
  "quick", "order", "view", "show", "hide", "back", "next", "previous", "continue", "review",
  "unlocked", "unlock", "free", "standard", "express", "delivery", "already", "don't", "have", "an"
]);

const results = [];

files.forEach(file => {
  const rel = file.replace("/home/ubuntu/CN_Web/b2b-storefront/", "");
  const content = fs.readFileSync(file, "utf-8");
  const lines = content.split("\n");
  const fileMatches = [];

  lines.forEach((line, idx) => {
    const raw = line.trim();
    if (raw.startsWith("import ") || raw.startsWith("//") || raw.startsWith("/*") || raw.startsWith("*") || raw.startsWith("export type") || raw.startsWith("interface ") || raw.startsWith("export interface")) return;

    // Look for JSX text, string literals, placeholders, titles, labels
    const words = raw.toLowerCase().replace(/[^a-z\s]/g, " ").split(/\s+/).filter(w => w.length > 2);
    let engCount = 0;
    const matched = [];
    words.forEach(w => {
      if (englishWordSet.has(w)) {
        engCount++;
        matched.push(w);
      }
    });

    // Heuristics for UI line
    const isUI = (raw.includes(">") && raw.includes("<")) ||
                 raw.includes("placeholder=") ||
                 raw.includes("title=") ||
                 raw.includes("label=") ||
                 raw.includes("aria-label=") ||
                 (raw.startsWith("\"") && raw.endsWith("\"") && !raw.includes("/")) ||
                 (raw.startsWith("\'") && raw.endsWith("\'") && !raw.includes("/")) ||
                 raw.includes("<span>") || raw.includes("<p>") || raw.includes("<h1>") || raw.includes("<h2>") || raw.includes("<h3>") || raw.includes("<button") || raw.includes("<label") || raw.includes("<a ") || raw.includes("<div>");

    if (engCount >= 1 && (isUI || raw.includes("label:") || raw.includes("title:") || raw.includes("description:") || raw.includes("message:") || raw.includes("text:"))) {
      // Exclude pure CSS classes / logic
      if (!raw.includes("className=") || (raw.split("className=")[0].trim().length > 0 || raw.split("className=")[1].includes(">") && raw.split("className=")[1].split(">")[1].trim().length > 0)) {
        fileMatches.push({ lineNum: idx + 1, text: raw, matched: matched.join(", ") });
      }
    }
  });

  if (fileMatches.length > 0) {
    results.push({ file: rel, count: fileMatches.length, matches: fileMatches });
  }
});

results.sort((a, b) => b.count - a.count);

console.log(`Total files with potential UI English text: ${results.length}\n`);
results.forEach(r => {
  console.log(`\n========================================`);
  console.log(`📄 ${r.file} (${r.count} matches)`);
  r.matches.forEach(m => {
    console.log(`  [L${m.lineNum}] ${m.text.substring(0, 140)}`);
  });
});
